import { query, queryOne } from "../db"
import type { PaymentPlan, Installment, InstallmentStatus } from "@/app/data/types"
import type { PoolClient } from "pg"

// ─── Payment Plan ─────────────────────────────────────────────────────────────

type PlanRow = {
  id: string
  developer_id: string
  unit_id: string
  buyer_id: string
  total_amount: string
  down_payment: string
  currency: string
  zero_interest: boolean
  created_at: Date
}

function mapPlan(row: PlanRow): PaymentPlan {
  return {
    id: row.id,
    unitId: row.unit_id,
    buyerId: row.buyer_id,
    totalAmount: parseFloat(row.total_amount),
    downPayment: parseFloat(row.down_payment),
    currency: row.currency,
    zeroInterest: row.zero_interest,
  }
}

export async function findPaymentPlanByUnit(
  unitId: string,
  developerId: string,
): Promise<PaymentPlan | null> {
  const row = await queryOne<PlanRow>(
    "SELECT * FROM payment_plans WHERE unit_id = $1 AND developer_id = $2",
    [unitId, developerId],
  )
  return row ? mapPlan(row) : null
}

// ─── Installments ─────────────────────────────────────────────────────────────

type InstallmentRow = {
  id: string
  developer_id: string
  payment_plan_id: string
  sequence: number
  amount: string
  due_date: Date | null
  linked_milestone_id: string | null
  status: string
  paid_amount: string
  paid_at: Date | null
  updated_at: Date
}

function mapInstallment(row: InstallmentRow): Installment {
  return {
    id: row.id,
    paymentPlanId: row.payment_plan_id,
    sequence: row.sequence,
    amount: parseFloat(row.amount),
    dueDate: row.due_date ? row.due_date.toISOString().slice(0, 10) : undefined,
    linkedMilestoneId: row.linked_milestone_id ?? undefined,
    status: row.status as InstallmentStatus,
    paidAmount: parseFloat(row.paid_amount),
    paidAt: row.paid_at ? row.paid_at.toISOString() : undefined,
  }
}

/**
 * Fetch one installment scoped by developer, joined to its plan for buyer/currency context.
 * Returns null if not found or if developer_id doesn't match.
 */
export async function findInstallmentById(
  id: string,
  developerId: string,
): Promise<(Installment & { buyerId: string; currency: string }) | null> {
  type Row = InstallmentRow & { buyer_id: string; currency: string }
  const row = await queryOne<Row>(
    `SELECT i.*, pp.buyer_id, pp.currency
       FROM installments i
       JOIN payment_plans pp ON pp.id = i.payment_plan_id
      WHERE i.id = $1
        AND i.developer_id = $2`,
    [id, developerId],
  )
  if (!row) return null
  return {
    ...mapInstallment(row),
    buyerId: row.buyer_id,
    currency: row.currency,
  }
}

export async function findInstallmentsByPlan(paymentPlanId: string): Promise<Installment[]> {
  const rows = await query<InstallmentRow>(
    "SELECT * FROM installments WHERE payment_plan_id = $1 ORDER BY sequence",
    [paymentPlanId],
  )
  return rows.map(mapInstallment)
}

// ─── Create plan + installments (call inside withTransaction) ────────────────

export type NewInstallment = {
  sequence: number
  amount: number
  dueDate?: Date
  linkedMilestoneId?: string
}

export async function createPaymentPlanWithInstallments(
  data: {
    developerId: string
    unitId: string
    buyerId: string
    totalAmount: number
    downPayment: number
    currency: string
    zeroInterest: boolean
    installments: NewInstallment[]
  },
  client: PoolClient,
): Promise<{ plan: PaymentPlan; installments: Installment[] }> {
  const planResult = await client.query<PlanRow>(
    `INSERT INTO payment_plans
       (developer_id, unit_id, buyer_id, total_amount, down_payment, currency, zero_interest)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.developerId,
      data.unitId,
      data.buyerId,
      data.totalAmount,
      data.downPayment,
      data.currency,
      data.zeroInterest,
    ],
  )
  const plan = mapPlan(planResult.rows[0])

  const installments: Installment[] = []
  for (const inst of data.installments) {
    const instResult = await client.query<InstallmentRow>(
      `INSERT INTO installments
         (developer_id, payment_plan_id, sequence, amount, due_date, linked_milestone_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
       RETURNING *`,
      [
        data.developerId,
        plan.id,
        inst.sequence,
        inst.amount,
        inst.dueDate ?? null,
        inst.linkedMilestoneId ?? null,
      ],
    )
    installments.push(mapInstallment(instResult.rows[0]))
  }

  return { plan, installments }
}

// ─── Stalled-ops query ────────────────────────────────────────────────────────

export type StalledInstallment = {
  id: string
  sequence: number
  dueDate: Date | null
  unitCode: string
  updatedAt: Date
}

export async function findStalledInstallments(
  developerId: string,
  cutoff: Date,
): Promise<StalledInstallment[]> {
  type Row = {
    id: string
    sequence: number
    due_date: Date | null
    unit_code: string
    updated_at: Date
  }
  const rows = await query<Row>(
    `SELECT
       i.id,
       i.sequence,
       i.due_date,
       i.updated_at,
       u.code AS unit_code
     FROM installments i
     JOIN payment_plans pp ON pp.id = i.payment_plan_id
     JOIN units u ON u.id = pp.unit_id
     WHERE i.developer_id = $1
       AND i.status = 'DUE'
       AND i.updated_at < $2
     ORDER BY i.updated_at ASC`,
    [developerId, cutoff],
  )
  return rows.map((r) => ({
    id: r.id,
    sequence: r.sequence,
    dueDate: r.due_date,
    unitCode: r.unit_code,
    updatedAt: r.updated_at,
  }))
}

export interface InstallmentNotifyData {
  buyerEmail:    string | null
  buyerName:     string
  buyerPhone:    string
  installmentSeq: number
  currency:      string
}

/** Look up buyer contact + installment sequence for post-payment notifications. */
export async function findInstallmentNotifyData(
  installmentId: string,
  developerId: string,
): Promise<InstallmentNotifyData | null> {
  type Row = {
    email: string | null; full_name: string; phone: string
    sequence: number; currency: string
  }
  const row = await queryOne<Row>(
    `SELECT b.email, b.full_name, b.phone, i.sequence, pp.currency
       FROM installments i
       JOIN payment_plans pp ON pp.id = i.payment_plan_id
       JOIN buyers b ON b.id = pp.buyer_id
      WHERE i.id = $1 AND i.developer_id = $2`,
    [installmentId, developerId],
  )
  if (!row) return null
  return {
    buyerEmail:    row.email,
    buyerName:     row.full_name,
    buyerPhone:    row.phone,
    installmentSeq: row.sequence,
    currency:      row.currency,
  }
}

/** Set all PENDING installments linked to a milestone to DUE. Called inside a transaction. */
export async function setInstallmentsDueByMilestone(
  milestoneId: string,
  developerId: string,
  dueDate: Date,
  // Accept a pool client so this runs inside the caller's transaction
  client: PoolClient,
): Promise<void> {
  await client.query(
    `UPDATE installments
     SET status = 'DUE', due_date = $1
     WHERE linked_milestone_id = $2
       AND developer_id = $3
       AND status = 'PENDING'`,
    [dueDate, milestoneId, developerId],
  )
}
