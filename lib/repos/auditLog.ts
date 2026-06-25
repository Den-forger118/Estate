import { query } from "../db"

export async function createAuditLog(data: {
  developerId?: string | null
  actorUserId?: string | null
  action: string
  target?: string | null
  meta?: Record<string, unknown> | null
}): Promise<void> {
  await query(
    `INSERT INTO audit_logs (developer_id, actor_user_id, action, target, meta)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      data.developerId ?? null,
      data.actorUserId ?? null,
      data.action,
      data.target ?? null,
      data.meta ? JSON.stringify(data.meta) : null,
    ],
  )
}
