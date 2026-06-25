import { query, queryOne } from "../db"
import type { Buyer } from "@/app/data/types"

type BuyerRow = {
  id: string
  developer_id: string
  full_name: string
  phone: string
  email: string | null
  is_diaspora: boolean
  created_at: Date
}

function mapBuyer(row: BuyerRow): Buyer {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email ?? undefined,
    isDiaspora: row.is_diaspora,
  }
}

export async function findBuyersByDeveloper(developerId: string): Promise<Buyer[]> {
  const rows = await query<BuyerRow>(
    "SELECT * FROM buyers WHERE developer_id = $1 ORDER BY full_name",
    [developerId],
  )
  return rows.map(mapBuyer)
}

export async function findBuyerById(
  id: string,
  developerId: string,
): Promise<Buyer | null> {
  const row = await queryOne<BuyerRow>(
    "SELECT * FROM buyers WHERE id = $1 AND developer_id = $2",
    [id, developerId],
  )
  return row ? mapBuyer(row) : null
}

/** Find a buyer by ID without developer scoping — for BUYER-role portal access.
 *  Returns the buyer together with its developerId for downstream scoping. */
export async function findBuyerByIdRaw(
  id: string,
): Promise<(Buyer & { developerId: string }) | null> {
  const row = await queryOne<BuyerRow>(
    "SELECT * FROM buyers WHERE id = $1",
    [id],
  )
  if (!row) return null
  return { ...mapBuyer(row), developerId: row.developer_id }
}

export async function createBuyer(
  developerId: string,
  data: { fullName: string; phone: string; email?: string; isDiaspora?: boolean },
): Promise<Buyer> {
  type Row = BuyerRow
  const rows = await query<Row>(
    `INSERT INTO buyers (developer_id, full_name, phone, email, is_diaspora)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [developerId, data.fullName, data.phone, data.email ?? null, data.isDiaspora ?? false],
  )
  return mapBuyer(rows[0])
}
