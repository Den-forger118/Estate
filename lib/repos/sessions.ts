import { query, queryOne } from "../db"
import type { Role } from "@/app/data/types"

// ─── Types ────────────────────────────────────────────────────────────────────

export type SessionWithUser = {
  id: string
  userId: string
  token: string
  expiresAt: Date
  user: {
    id: string
    developerId: string | null
    email: string
    role: Role
    buyerId: string | null
  }
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function findSessionByToken(token: string): Promise<SessionWithUser | null> {
  type Row = {
    session_id: string
    user_id: string
    token: string
    expires_at: Date
    u_id: string
    u_developer_id: string | null
    u_email: string
    u_role: string
    u_buyer_id: string | null
  }

  const row = await queryOne<Row>(
    `SELECT
       s.id         AS session_id,
       s.user_id,
       s.token,
       s.expires_at,
       u.id         AS u_id,
       u.developer_id AS u_developer_id,
       u.email      AS u_email,
       u.role       AS u_role,
       u.buyer_id   AS u_buyer_id
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token = $1`,
    [token],
  )
  if (!row) return null

  return {
    id: row.session_id,
    userId: row.user_id,
    token: row.token,
    expiresAt: row.expires_at,
    user: {
      id: row.u_id,
      developerId: row.u_developer_id,
      email: row.u_email,
      role: row.u_role as Role,
      buyerId: row.u_buyer_id,
    },
  }
}

export async function createSession(
  userId: string,
  token: string,
  expiresAt: Date,
): Promise<void> {
  await query(
    "INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)",
    [userId, token, expiresAt],
  )
}

export async function deleteSessionByToken(token: string): Promise<void> {
  await query("DELETE FROM sessions WHERE token = $1", [token])
}

export async function deleteSessionById(id: string): Promise<void> {
  await query("DELETE FROM sessions WHERE id = $1", [id])
}
