import { query, queryOne } from "../db"
import type { Lease, LeaseStatus } from "@/app/data/types"
import type { PoolClient } from "pg"

type LeaseRow = {
  id: string
  developer_id: string
  unit_id: string
  resident_id: string
  start_date: Date
  end_date: Date | null
  rent_monthly: string
  deposit: string
  currency: string
  status: string
  created_at: Date
  updated_at: Date
}

function mapLease(row: LeaseRow): Lease {
  return {
    id: row.id,
    unitId: row.unit_id,
    residentId: row.resident_id,
    startDate: row.start_date.toISOString().slice(0, 10),
    endDate: row.end_date ? row.end_date.toISOString().slice(0, 10) : undefined,
    rentMonthly: parseFloat(row.rent_monthly),
    deposit: parseFloat(row.deposit),
    currency: row.currency,
    status: row.status as LeaseStatus,
  }
}

export async function findLeasesByDeveloper(developerId: string): Promise<Lease[]> {
  const rows = await query<LeaseRow>(
    `SELECT * FROM leases WHERE developer_id = $1 ORDER BY created_at DESC`,
    [developerId],
  )
  return rows.map(mapLease)
}

export async function findLeaseById(
  id: string,
  developerId: string,
): Promise<Lease | null> {
  const row = await queryOne<LeaseRow>(
    "SELECT * FROM leases WHERE id = $1 AND developer_id = $2",
    [id, developerId],
  )
  return row ? mapLease(row) : null
}

export async function findLeasesByResident(residentId: string): Promise<Lease[]> {
  const rows = await query<LeaseRow>(
    "SELECT * FROM leases WHERE resident_id = $1 ORDER BY start_date DESC",
    [residentId],
  )
  return rows.map(mapLease)
}

export async function findActiveLeaseByUnit(
  unitId: string,
  developerId: string,
): Promise<Lease | null> {
  const row = await queryOne<LeaseRow>(
    "SELECT * FROM leases WHERE unit_id = $1 AND developer_id = $2 AND status = 'ACTIVE' LIMIT 1",
    [unitId, developerId],
  )
  return row ? mapLease(row) : null
}

export async function createLease(
  developerId: string,
  data: {
    unitId: string
    residentId: string
    startDate: Date
    endDate?: Date
    rentMonthly: number
    deposit: number
    currency?: string
    status?: LeaseStatus
  },
  client?: PoolClient,
): Promise<Lease> {
  const sql = `INSERT INTO leases
     (developer_id, unit_id, resident_id, start_date, end_date, rent_monthly, deposit, currency, status)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
   RETURNING *`
  const params = [
    developerId,
    data.unitId,
    data.residentId,
    data.startDate,
    data.endDate ?? null,
    data.rentMonthly,
    data.deposit,
    data.currency ?? "GHS",
    data.status ?? "ACTIVE",
  ]

  if (client) {
    const result = await client.query<LeaseRow>(sql, params)
    return mapLease(result.rows[0])
  }
  const rows = await query<LeaseRow>(sql, params)
  return mapLease(rows[0])
}
