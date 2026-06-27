import { query, queryOne } from "../db"
import type { Resident, ResidentStatus, OccupancyType } from "@/app/data/types"

type ResidentRow = {
  id: string
  developer_id: string
  unit_id: string
  unit_code: string | null
  buyer_id: string | null
  full_name: string
  phone: string
  email: string | null
  move_in_date: Date | null
  status: string
  occupancy_type: string
  created_at: Date
  updated_at: Date
}

function mapResident(row: ResidentRow): Resident {
  return {
    id: row.id,
    unitId: row.unit_id,
    unitCode: row.unit_code ?? undefined,
    buyerId: row.buyer_id ?? undefined,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email ?? undefined,
    moveInDate: row.move_in_date ? row.move_in_date.toISOString().slice(0, 10) : undefined,
    status: row.status as ResidentStatus,
    occupancyType: (row.occupancy_type ?? "TENANT") as OccupancyType,
    createdAt: row.created_at.toISOString(),
  }
}

export async function findResidentsByDeveloper(developerId: string): Promise<Resident[]> {
  const rows = await query<ResidentRow>(
    `SELECT r.*, u.code AS unit_code
     FROM residents r
     LEFT JOIN units u ON u.id = r.unit_id
     WHERE r.developer_id = $1
     ORDER BY r.created_at DESC`,
    [developerId],
  )
  return rows.map(mapResident)
}

export async function findResidentById(
  id: string,
  developerId: string,
): Promise<Resident | null> {
  const row = await queryOne<ResidentRow>(
    `SELECT r.*, u.code AS unit_code
     FROM residents r
     LEFT JOIN units u ON u.id = r.unit_id
     WHERE r.id = $1 AND r.developer_id = $2`,
    [id, developerId],
  )
  return row ? mapResident(row) : null
}

/** Find the owner-occupier residents row for a specific buyer+unit, if it exists. */
export async function findResidentByBuyerUnit(
  buyerId: string,
  unitId: string,
  developerId: string,
): Promise<Resident | null> {
  const row = await queryOne<ResidentRow>(
    `SELECT r.*, u.code AS unit_code
     FROM residents r
     LEFT JOIN units u ON u.id = r.unit_id
     WHERE r.buyer_id = $1
       AND r.unit_id  = $2
       AND r.developer_id = $3
       AND r.occupancy_type = 'OWNER_OCCUPIER'`,
    [buyerId, unitId, developerId],
  )
  return row ? mapResident(row) : null
}

export async function createResident(
  developerId: string,
  data: {
    unitId: string
    buyerId?: string
    fullName: string
    phone: string
    email?: string
    moveInDate?: Date
    status?: ResidentStatus
    occupancyType?: OccupancyType
  },
): Promise<Resident> {
  const rows = await query<ResidentRow>(
    `INSERT INTO residents
       (developer_id, unit_id, buyer_id, full_name, phone, email, move_in_date, status, occupancy_type)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *, NULL AS unit_code`,
    [
      developerId,
      data.unitId,
      data.buyerId ?? null,
      data.fullName,
      data.phone,
      data.email ?? null,
      data.moveInDate ?? null,
      data.status ?? "ACTIVE",
      data.occupancyType ?? "TENANT",
    ],
  )
  return mapResident(rows[0])
}
