import { query, queryOne } from "../db"
import type { MaintenanceTicket, TicketStatus, TicketPriority } from "@/app/data/types"

type TicketRow = {
  id: string
  developer_id: string
  unit_id: string | null
  unit_code: string | null
  title: string
  description: string | null
  priority: string
  status: string
  assignee: string | null
  due_date: Date | null
  created_at: Date
  updated_at: Date
}

function mapTicket(row: TicketRow): MaintenanceTicket {
  return {
    id: row.id,
    unitId: row.unit_id ?? undefined,
    unitCode: row.unit_code ?? undefined,
    title: row.title,
    description: row.description ?? undefined,
    priority: row.priority as TicketPriority,
    status: row.status as TicketStatus,
    assignee: row.assignee ?? undefined,
    dueDate: row.due_date ? row.due_date.toISOString().slice(0, 10) : undefined,
    createdAt: row.created_at.toISOString(),
  }
}

export async function findTicketsByDeveloper(developerId: string): Promise<MaintenanceTicket[]> {
  const rows = await query<TicketRow>(
    `SELECT t.*, u.code AS unit_code
     FROM maintenance_tickets t
     LEFT JOIN units u ON u.id = t.unit_id
     WHERE t.developer_id = $1
     ORDER BY
       CASE t.priority WHEN 'URGENT' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END,
       t.created_at DESC`,
    [developerId],
  )
  return rows.map(mapTicket)
}

export async function findTicketsByUnit(
  unitId: string,
  developerId: string,
): Promise<MaintenanceTicket[]> {
  const rows = await query<TicketRow>(
    `SELECT t.*, u.code AS unit_code
     FROM maintenance_tickets t
     LEFT JOIN units u ON u.id = t.unit_id
     WHERE t.unit_id = $1 AND t.developer_id = $2
     ORDER BY
       CASE t.priority WHEN 'URGENT' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END,
       t.created_at DESC`,
    [unitId, developerId],
  )
  return rows.map(mapTicket)
}

export async function findTicketById(
  id: string,
  developerId: string,
): Promise<MaintenanceTicket | null> {
  const row = await queryOne<TicketRow>(
    `SELECT t.*, u.code AS unit_code
     FROM maintenance_tickets t
     LEFT JOIN units u ON u.id = t.unit_id
     WHERE t.id = $1 AND t.developer_id = $2`,
    [id, developerId],
  )
  return row ? mapTicket(row) : null
}

export async function createTicket(
  developerId: string,
  data: {
    unitId?: string
    title: string
    description?: string
    priority?: TicketPriority
    assignee?: string
    dueDate?: Date
  },
): Promise<MaintenanceTicket> {
  const rows = await query<TicketRow>(
    `INSERT INTO maintenance_tickets
       (developer_id, unit_id, title, description, priority, status, assignee, due_date)
     VALUES ($1, $2, $3, $4, $5, 'NEW', $6, $7)
     RETURNING *, NULL AS unit_code`,
    [
      developerId,
      data.unitId ?? null,
      data.title,
      data.description ?? null,
      data.priority ?? "MEDIUM",
      data.assignee ?? null,
      data.dueDate ?? null,
    ],
  )
  return mapTicket(rows[0])
}

export async function updateTicketStatus(
  id: string,
  developerId: string,
  status: TicketStatus,
): Promise<MaintenanceTicket | null> {
  const row = await queryOne<TicketRow>(
    `UPDATE maintenance_tickets
     SET status = $1
     WHERE id = $2 AND developer_id = $3
     RETURNING *, NULL AS unit_code`,
    [status, id, developerId],
  )
  return row ? mapTicket(row) : null
}

export async function getMaintenanceCounts(developerId: string): Promise<{
  open: number
  urgent: number
}> {
  type Row = { open_count: string; urgent_count: string }
  const row = await queryOne<Row>(
    `SELECT
       COUNT(*) FILTER (WHERE status != 'RESOLVED')                           AS open_count,
       COUNT(*) FILTER (WHERE status != 'RESOLVED' AND priority = 'URGENT')   AS urgent_count
     FROM maintenance_tickets
     WHERE developer_id = $1`,
    [developerId],
  )
  return {
    open: parseInt(row?.open_count ?? "0", 10),
    urgent: parseInt(row?.urgent_count ?? "0", 10),
  }
}
