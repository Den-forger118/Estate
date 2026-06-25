import { query, queryOne } from "../db"
import type { Role } from "@/app/data/types"

// ─── Internal row type (what pg returns) ─────────────────────────────────────

type UserRow = {
  id: string
  developer_id: string | null
  email: string
  password_hash: string | null
  role: string
  buyer_id: string | null
  status: string
  last_login_at: Date | null
  created_at: Date
}

// ─── Public record type ───────────────────────────────────────────────────────

export type UserRecord = {
  id: string
  developerId: string | null
  email: string
  passwordHash: string | null
  role: Role
  buyerId: string | null
  status: "ACTIVE" | "SUSPENDED"
  lastLoginAt: Date | null
  createdAt: Date
}

function mapUser(row: UserRow): UserRecord {
  return {
    id: row.id,
    developerId: row.developer_id,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role as Role,
    buyerId: row.buyer_id,
    status: (row.status ?? "ACTIVE") as "ACTIVE" | "SUSPENDED",
    lastLoginAt: row.last_login_at ?? null,
    createdAt: row.created_at,
  }
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const row = await queryOne<UserRow>(
    "SELECT * FROM users WHERE email = $1",
    [email.toLowerCase()],
  )
  return row ? mapUser(row) : null
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const row = await queryOne<UserRow>(
    "SELECT * FROM users WHERE id = $1",
    [id],
  )
  return row ? mapUser(row) : null
}

export async function touchLastLogin(id: string): Promise<void> {
  await query(
    "UPDATE users SET last_login_at = now() WHERE id = $1",
    [id],
  )
}

export async function createBuyerUser(data: {
  developerId: string
  email: string
  buyerId: string
}): Promise<UserRecord> {
  const row = await queryOne<UserRow>(
    `INSERT INTO users (developer_id, email, role, buyer_id, password_hash, status)
     VALUES ($1, $2, 'BUYER', $3, NULL, 'ACTIVE')
     RETURNING *`,
    [data.developerId, data.email.toLowerCase(), data.buyerId],
  )
  return mapUser(row!)
}

export async function setUserStatus(
  id: string,
  status: "ACTIVE" | "SUSPENDED",
): Promise<UserRecord | null> {
  const row = await queryOne<UserRow>(
    "UPDATE users SET status = $1 WHERE id = $2 RETURNING *",
    [status, id],
  )
  return row ? mapUser(row) : null
}

export async function clearPasswordHash(id: string): Promise<void> {
  await query("UPDATE users SET password_hash = NULL WHERE id = $1", [id])
}
