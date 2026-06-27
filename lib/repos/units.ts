import { query, queryOne } from "../db"
import type { Unit, UnitStatus } from "@/app/data/types"

export type NewUnit = {
  developerId: string
  projectId: string
  code: string
  type?: string
  sizeSqm?: number
  priceTotal: number
  status?: UnitStatus
}

type UnitRow = {
  id: string
  developer_id: string
  project_id: string
  code: string
  type: string | null
  size_sqm: string | null  // pg returns numeric as string
  price_total: string
  status: string
  buyer_id: string | null
  updated_at: Date
}

function mapUnit(row: UnitRow): Unit {
  return {
    id: row.id,
    projectId: row.project_id,
    code: row.code,
    type: row.type ?? undefined,
    sizeSqm: row.size_sqm ? parseFloat(row.size_sqm) : undefined,
    priceTotal: parseFloat(row.price_total),
    status: row.status as UnitStatus,
    buyerId: row.buyer_id ?? undefined,
  }
}

export async function findUnitsByDeveloper(
  developerId: string,
  projectId?: string,
): Promise<Unit[]> {
  if (projectId) {
    const rows = await query<UnitRow>(
      "SELECT * FROM units WHERE developer_id = $1 AND project_id = $2 ORDER BY code",
      [developerId, projectId],
    )
    return rows.map(mapUnit)
  }
  const rows = await query<UnitRow>(
    "SELECT * FROM units WHERE developer_id = $1 ORDER BY code",
    [developerId],
  )
  return rows.map(mapUnit)
}

export async function findUnitById(
  id: string,
  developerId: string,
): Promise<Unit | null> {
  const row = await queryOne<UnitRow>(
    "SELECT * FROM units WHERE id = $1 AND developer_id = $2",
    [id, developerId],
  )
  return row ? mapUnit(row) : null
}

/** Returns ALL units linked to this buyer, ordered by code. */
export async function findUnitsByBuyer(
  buyerId: string,
  developerId: string,
): Promise<Unit[]> {
  const rows = await query<UnitRow>(
    "SELECT * FROM units WHERE buyer_id = $1 AND developer_id = $2 ORDER BY code",
    [buyerId, developerId],
  )
  return rows.map(mapUnit)
}

/**
 * Returns HANDED_OVER units where this buyer has an owner-occupier residents row.
 * Catches units where units.buyer_id may be NULL (seeded/historical data) but
 * the residents bridge is intact.
 */
export async function findHomeownerUnitsByBuyer(
  buyerId: string,
  developerId: string,
): Promise<Unit[]> {
  const rows = await query<UnitRow>(
    `SELECT u.*
     FROM units u
     JOIN residents r ON r.unit_id = u.id
     WHERE r.buyer_id = $1
       AND u.developer_id = $2
       AND r.occupancy_type = 'OWNER_OCCUPIER'
     ORDER BY u.code`,
    [buyerId, developerId],
  )
  return rows.map(mapUnit)
}

/** @deprecated Use findUnitsByBuyer — returns the first unit only. */
export async function findUnitByBuyer(
  buyerId: string,
  developerId: string,
): Promise<Unit | null> {
  const units = await findUnitsByBuyer(buyerId, developerId)
  return units[0] ?? null
}

/** Returns null if a unit with the same code already exists in the project. */
export async function createUnit(data: NewUnit): Promise<Unit | null> {
  const existing = await queryOne<{ id: string }>(
    "SELECT id FROM units WHERE developer_id = $1 AND project_id = $2 AND code = $3",
    [data.developerId, data.projectId, data.code],
  )
  if (existing) return null

  const row = await queryOne<UnitRow>(
    `INSERT INTO units (developer_id, project_id, code, type, size_sqm, price_total, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.developerId,
      data.projectId,
      data.code,
      data.type ?? null,
      data.sizeSqm ?? null,
      data.priceTotal,
      data.status ?? "AVAILABLE",
    ],
  )
  return mapUnit(row!)
}

export async function updateUnitStatus(
  id: string,
  developerId: string,
  status: UnitStatus,
): Promise<void> {
  await query(
    "UPDATE units SET status = $1 WHERE id = $2 AND developer_id = $3",
    [status, id, developerId],
  )
}

// ─── Public-safe unit list (no buyer/financial internals) ────────────────────

export type PublicUnit = {
  id: string
  code: string
  type: string | null
  sizeSqm: number | null
  priceTotal: number
  status: UnitStatus
  projectName: string
  projectLocation: string | null
}

export async function findPublicUnits(developerId: string): Promise<PublicUnit[]> {
  type Row = {
    id: string
    code: string
    type: string | null
    size_sqm: string | null
    price_total: string
    status: string
    project_name: string
    project_location: string | null
  }
  const rows = await query<Row>(
    `SELECT
       u.id,
       u.code,
       u.type,
       u.size_sqm,
       u.price_total,
       u.status,
       p.name  AS project_name,
       p.location AS project_location
     FROM units u
     JOIN projects p ON p.id = u.project_id
     WHERE u.developer_id = $1
       AND u.status != 'HANDED_OVER'
     ORDER BY p.name, u.code`,
    [developerId],
  )
  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    type: r.type,
    sizeSqm: r.size_sqm ? parseFloat(r.size_sqm) : null,
    priceTotal: parseFloat(r.price_total),
    status: r.status as UnitStatus,
    projectName: r.project_name,
    projectLocation: r.project_location,
  }))
}

// ─── Stalled-ops query ────────────────────────────────────────────────────────

export type StalledUnit = {
  id: string
  code: string
  projectName: string
  buyerName: string | null
  updatedAt: Date
}

export async function findStalledReservations(
  developerId: string,
  cutoff: Date,
): Promise<StalledUnit[]> {
  type Row = {
    id: string
    code: string
    updated_at: Date
    project_name: string
    buyer_name: string | null
  }
  const rows = await query<Row>(
    `SELECT
       u.id,
       u.code,
       u.updated_at,
       p.name AS project_name,
       b.full_name AS buyer_name
     FROM units u
     JOIN projects p ON p.id = u.project_id
     LEFT JOIN buyers b ON b.id = u.buyer_id
     WHERE u.developer_id = $1
       AND u.status = 'RESERVED'
       AND u.updated_at < $2
     ORDER BY u.updated_at ASC`,
    [developerId, cutoff],
  )
  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    projectName: r.project_name,
    buyerName: r.buyer_name,
    updatedAt: r.updated_at,
  }))
}
