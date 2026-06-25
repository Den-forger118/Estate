import { query, queryOne } from "../db"
import type { Lead, LeadStatus } from "@/app/data/types"

type LeadRow = {
  id: string
  developer_id: string
  unit_id: string | null
  full_name: string
  phone: string
  email: string | null
  message: string | null
  source: string
  status: string
  created_at: Date
  updated_at: Date
}

function mapLead(row: LeadRow): Lead {
  return {
    id: row.id,
    developerId: row.developer_id,
    unitId: row.unit_id ?? undefined,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email ?? undefined,
    message: row.message ?? undefined,
    source: row.source,
    status: row.status as LeadStatus,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }
}

export async function createLead(data: {
  developerId: string
  unitId?: string | null
  fullName: string
  phone: string
  email?: string | null
  message?: string | null
  source?: string
}): Promise<Lead> {
  const row = await queryOne<LeadRow>(
    `INSERT INTO leads (developer_id, unit_id, full_name, phone, email, message, source)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.developerId,
      data.unitId ?? null,
      data.fullName,
      data.phone,
      data.email ?? null,
      data.message ?? null,
      data.source ?? "website",
    ],
  )
  return mapLead(row!)
}

export async function findLeadsByDeveloper(
  developerId: string,
  status?: LeadStatus,
): Promise<Lead[]> {
  const rows = status
    ? await query<LeadRow>(
        "SELECT * FROM leads WHERE developer_id = $1 AND status = $2 ORDER BY created_at DESC",
        [developerId, status],
      )
    : await query<LeadRow>(
        "SELECT * FROM leads WHERE developer_id = $1 ORDER BY created_at DESC",
        [developerId],
      )
  return rows.map(mapLead)
}

export async function findLeadById(
  id: string,
  developerId: string,
): Promise<Lead | null> {
  const row = await queryOne<LeadRow>(
    "SELECT * FROM leads WHERE id = $1 AND developer_id = $2",
    [id, developerId],
  )
  return row ? mapLead(row) : null
}

export async function updateLeadStatus(
  id: string,
  developerId: string,
  status: LeadStatus,
): Promise<Lead | null> {
  const row = await queryOne<LeadRow>(
    "UPDATE leads SET status = $1 WHERE id = $2 AND developer_id = $3 RETURNING *",
    [status, id, developerId],
  )
  return row ? mapLead(row) : null
}
