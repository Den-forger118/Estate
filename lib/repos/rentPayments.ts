import { query, queryOne } from "../db"
import type { RentPayment, RentPaymentStatus } from "@/app/data/types"

type RentPaymentRow = {
  id: string
  developer_id: string
  lease_id: string
  amount: string
  due_date: Date | null
  paid_at: Date | null
  status: string
  ref: string | null
  created_at: Date
  updated_at: Date
}

function mapPayment(row: RentPaymentRow): RentPayment {
  return {
    id: row.id,
    leaseId: row.lease_id,
    amount: parseFloat(row.amount),
    dueDate: row.due_date ? row.due_date.toISOString().slice(0, 10) : undefined,
    paidAt: row.paid_at ? row.paid_at.toISOString() : undefined,
    status: row.status as RentPaymentStatus,
    ref: row.ref ?? undefined,
  }
}

export async function findRentPaymentsByDeveloper(developerId: string): Promise<RentPayment[]> {
  const rows = await query<RentPaymentRow>(
    `SELECT * FROM rent_payments WHERE developer_id = $1 ORDER BY due_date DESC`,
    [developerId],
  )
  return rows.map(mapPayment)
}

export async function findRentPaymentsByLease(leaseId: string): Promise<RentPayment[]> {
  const rows = await query<RentPaymentRow>(
    "SELECT * FROM rent_payments WHERE lease_id = $1 ORDER BY due_date ASC",
    [leaseId],
  )
  return rows.map(mapPayment)
}

export async function findRentPaymentById(
  id: string,
  developerId: string,
): Promise<RentPayment | null> {
  const row = await queryOne<RentPaymentRow>(
    "SELECT * FROM rent_payments WHERE id = $1 AND developer_id = $2",
    [id, developerId],
  )
  return row ? mapPayment(row) : null
}

export async function createRentPayment(
  developerId: string,
  data: {
    leaseId: string
    amount: number
    dueDate?: Date
    paidAt?: Date
    status?: RentPaymentStatus
    ref?: string
  },
): Promise<RentPayment> {
  const rows = await query<RentPaymentRow>(
    `INSERT INTO rent_payments (developer_id, lease_id, amount, due_date, paid_at, status, ref)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      developerId,
      data.leaseId,
      data.amount,
      data.dueDate ?? null,
      data.paidAt ?? null,
      data.status ?? "PENDING",
      data.ref ?? null,
    ],
  )
  return mapPayment(rows[0])
}

/** Aggregates needed by dashboard overview — no per-row mapper required. */
export async function getRentCollectionStats(developerId: string): Promise<{
  totalDue: number
  totalPaid: number
  overdueCount: number
}> {
  type Row = { total_due: string; total_paid: string; overdue_count: string }
  const row = await queryOne<Row>(
    `SELECT
       COALESCE(SUM(amount), 0)                                         AS total_due,
       COALESCE(SUM(CASE WHEN status = 'PAID' THEN amount ELSE 0 END), 0) AS total_paid,
       COUNT(*) FILTER (WHERE status = 'OVERDUE')                       AS overdue_count
     FROM rent_payments
     WHERE developer_id = $1`,
    [developerId],
  )
  return {
    totalDue: parseFloat(row?.total_due ?? "0"),
    totalPaid: parseFloat(row?.total_paid ?? "0"),
    overdueCount: parseInt(row?.overdue_count ?? "0", 10),
  }
}
