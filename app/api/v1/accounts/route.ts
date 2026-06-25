import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { query } from "@/lib/db"
import { hasValidToken } from "@/lib/repos/passwordSetTokens"

type AccountRow = {
  id: string
  email: string
  role: string
  buyer_id: string | null
  full_name: string | null
  password_hash: string | null
  status: string
  last_login_at: Date | null
  created_at: Date
}

export type BuyerAccount = {
  userId: string
  email: string
  role: string
  buyerId: string | null
  fullName: string | null
  activationState: "PENDING" | "ACTIVE"
  status: "ACTIVE" | "SUSPENDED"
  lastLoginAt: string | null
  createdAt: string
  hasValidSetPasswordToken: boolean
}

// GET /api/v1/accounts — ADMIN | SALES | OPS only (BUYER → 403)
export async function GET(_req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId } = session.user
  if (role === "BUYER") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  if (role !== "ADMIN" && role !== "SALES" && role !== "OPS") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  // Only return BUYER accounts; staff accounts are not in the ledger
  const rows = await query<AccountRow>(
    `SELECT u.id, u.email, u.role, u.buyer_id, b.full_name,
            u.password_hash, u.status, u.last_login_at, u.created_at
     FROM users u
     LEFT JOIN buyers b ON b.id = u.buyer_id
     WHERE u.developer_id = $1
       AND u.role = 'BUYER'
     ORDER BY u.created_at DESC`,
    [developerId],
  )

  // Check valid tokens in parallel — keeps N+1 bounded; accounts list is typically small
  const accounts: BuyerAccount[] = await Promise.all(
    rows.map(async (row) => {
      const hasToken = await hasValidToken(row.id)
      return {
        userId: row.id,
        email: row.email,
        role: row.role,
        buyerId: row.buyer_id,
        fullName: row.full_name,
        activationState: row.password_hash ? "ACTIVE" : "PENDING",
        status: (row.status ?? "ACTIVE") as "ACTIVE" | "SUSPENDED",
        lastLoginAt: row.last_login_at ? row.last_login_at.toISOString() : null,
        createdAt: row.created_at.toISOString(),
        hasValidSetPasswordToken: hasToken,
        // password_hash is intentionally NOT included in the response
      }
    }),
  )

  return NextResponse.json(accounts)
}
