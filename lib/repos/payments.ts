import { query, queryOne, withTransaction } from "../db"
import { createAuditLog } from "./auditLog"
import type { PoolClient } from "pg"

export type ReconStatus = "UNMATCHED" | "MATCHED" | "MANUAL"

export interface Payment {
  id: string
  developerId: string
  providerRef: string
  amount: number
  channel: string
  rawPayload: Record<string, unknown>
  receivedAt: string
  reconciledInstallmentId: string | null
  reconStatus: ReconStatus
}

type PaymentRow = {
  id: string
  developer_id: string
  provider_ref: string
  amount: string
  channel: string
  raw_payload: Record<string, unknown>
  received_at: Date
  reconciled_installment_id: string | null
  recon_status: string
}

function mapPayment(row: PaymentRow): Payment {
  return {
    id: row.id,
    developerId: row.developer_id,
    providerRef: row.provider_ref,
    amount: parseFloat(row.amount),
    channel: row.channel,
    rawPayload: row.raw_payload,
    receivedAt: row.received_at.toISOString(),
    reconciledInstallmentId: row.reconciled_installment_id,
    reconStatus: row.recon_status as ReconStatus,
  }
}

/** Idempotency check — returns existing payment if this provider_ref was already processed. */
export async function findPaymentByProviderRef(
  providerRef: string,
  developerId: string,
): Promise<Payment | null> {
  const row = await queryOne<PaymentRow>(
    `SELECT * FROM payments WHERE provider_ref = $1 AND developer_id = $2`,
    [providerRef, developerId],
  )
  return row ? mapPayment(row) : null
}

export async function findAllPayments(developerId: string): Promise<Payment[]> {
  const rows = await query<PaymentRow>(
    `SELECT * FROM payments
      WHERE developer_id = $1
      ORDER BY received_at DESC
      LIMIT 200`,
    [developerId],
  )
  return rows.map(mapPayment)
}

export async function findUnmatchedPayments(developerId: string): Promise<Payment[]> {
  const rows = await query<PaymentRow>(
    `SELECT * FROM payments
      WHERE developer_id = $1 AND recon_status = 'UNMATCHED'
      ORDER BY received_at DESC`,
    [developerId],
  )
  return rows.map(mapPayment)
}

/** Insert a payment record inside an existing transaction. */
export async function insertPayment(
  data: {
    developerId: string
    providerRef: string
    amount: number
    channel: string
    rawPayload: Record<string, unknown>
  },
  client: PoolClient,
): Promise<Payment> {
  const result = await client.query<PaymentRow>(
    `INSERT INTO payments (developer_id, provider_ref, amount, channel, raw_payload)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.developerId, data.providerRef, data.amount, data.channel, JSON.stringify(data.rawPayload)],
  )
  return mapPayment(result.rows[0])
}

/**
 * Reconcile a payment against an installment — must run inside a transaction.
 *
 * Rules:
 *  - paid_amount += payment.amount (never float math — use DB NUMERIC arithmetic)
 *  - status = PAID if new paid_amount >= installment.amount, else PARTIAL
 *  - payment.recon_status = MATCHED; link reconciled_installment_id
 *  - Overpayment: still marks PAID; overage noted in audit log
 */
export async function reconcilePaymentToInstallment(
  paymentId: string,
  installmentId: string,
  developerId: string,
  actorUserId: string | null,
  reconStatus: "MATCHED" | "MANUAL",
  client: PoolClient,
): Promise<void> {
  // Lock the installment row for update to prevent concurrent double-apply
  type InstRow = { id: string; amount: string; paid_amount: string; status: string }
  const instResult = await client.query<InstRow>(
    `SELECT id, amount, paid_amount, status
       FROM installments
      WHERE id = $1 AND developer_id = $2
      FOR UPDATE`,
    [installmentId, developerId],
  )
  if (instResult.rowCount === 0) {
    throw new Error(`Installment ${installmentId} not found for developer ${developerId}`)
  }
  const inst = instResult.rows[0]

  const oldPaid = parseFloat(inst.paid_amount)
  const total   = parseFloat(inst.amount)

  // Fetch payment amount
  type PayRow = { amount: string }
  const payResult = await client.query<PayRow>(
    `SELECT amount FROM payments WHERE id = $1 AND developer_id = $2 FOR UPDATE`,
    [paymentId, developerId],
  )
  if (payResult.rowCount === 0) throw new Error(`Payment ${paymentId} not found`)
  const paymentAmount = parseFloat(payResult.rows[0].amount)

  // DB-side NUMERIC addition avoids float drift
  const newPaidResult = await client.query<{ new_paid: string }>(
    `UPDATE installments
        SET paid_amount = paid_amount + $1,
            status      = CASE
              WHEN paid_amount + $1 >= amount THEN 'PAID'::installment_status
              ELSE 'PARTIAL'::installment_status
            END,
            paid_at     = CASE
              WHEN paid_amount + $1 >= amount AND paid_at IS NULL THEN now()
              ELSE paid_at
            END
      WHERE id = $2
        AND developer_id = $3
      RETURNING paid_amount AS new_paid`,
    [paymentAmount, installmentId, developerId],
  )
  const newPaid = parseFloat(newPaidResult.rows[0].new_paid)
  const overpaid = newPaid > total

  // Link payment to installment and mark matched
  await client.query(
    `UPDATE payments
        SET recon_status              = $1::recon_status,
            reconciled_installment_id = $2
      WHERE id = $3`,
    [reconStatus, installmentId, paymentId],
  )

  await createAuditLog({
    developerId,
    actorUserId,
    action: "PAYMENT_RECONCILED",
    target: installmentId,
    meta: {
      paymentId,
      installmentId,
      paymentAmount,
      oldPaid,
      newPaid,
      total,
      overpaid,
      reconStatus,
    },
  })
}

/**
 * Full atomic flow: insert payment record + attempt deterministic reconciliation.
 * Called by the webhook handler. Uses withTransaction internally.
 *
 * installmentId may come from metadata or be parsed from the reference.
 * If no confident match, payment is left UNMATCHED for the ops queue.
 */
export async function receiveAndReconcile(data: {
  developerId: string
  providerRef: string
  amount: number
  channel: string
  rawPayload: Record<string, unknown>
  installmentId: string | null
}): Promise<{ paymentId: string; reconStatus: ReconStatus }> {
  return withTransaction(async (client) => {
    const payment = await insertPayment(
      {
        developerId:  data.developerId,
        providerRef:  data.providerRef,
        amount:       data.amount,
        channel:      data.channel,
        rawPayload:   data.rawPayload,
      },
      client,
    )

    if (!data.installmentId) {
      return { paymentId: payment.id, reconStatus: "UNMATCHED" }
    }

    // Verify the installment belongs to this developer before reconciling
    const instCheck = await client.query<{ id: string }>(
      `SELECT id FROM installments WHERE id = $1 AND developer_id = $2`,
      [data.installmentId, data.developerId],
    )
    if (instCheck.rowCount === 0) {
      // installmentId from metadata points to a different developer — queue unmatched
      return { paymentId: payment.id, reconStatus: "UNMATCHED" }
    }

    await reconcilePaymentToInstallment(
      payment.id,
      data.installmentId,
      data.developerId,
      null,
      "MATCHED",
      client,
    )

    return { paymentId: payment.id, reconStatus: "MATCHED" }
  })
}

/** Manual reconcile — ADMIN/OPS explicitly attach an UNMATCHED payment to an installment. */
export async function manualReconcile(
  paymentId: string,
  installmentId: string,
  developerId: string,
  actorUserId: string,
): Promise<Payment> {
  // Ensure the payment is still unmatched before acquiring locks
  const existing = await queryOne<PaymentRow>(
    `SELECT * FROM payments WHERE id = $1 AND developer_id = $2`,
    [paymentId, developerId],
  )
  if (!existing) throw new Error("Payment not found")
  if (existing.recon_status !== "UNMATCHED") {
    throw new Error(`Payment is already ${existing.recon_status}`)
  }

  await withTransaction(async (client) => {
    await reconcilePaymentToInstallment(
      paymentId,
      installmentId,
      developerId,
      actorUserId,
      "MANUAL",
      client,
    )
  })

  return mapPayment(existing)
}
