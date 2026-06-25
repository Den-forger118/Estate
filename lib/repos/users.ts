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
