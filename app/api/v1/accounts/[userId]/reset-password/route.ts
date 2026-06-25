import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { queryOne } from "@/lib/db"
import { clearPasswordHash } from "@/lib/repos/users"
import { invalidatePriorTokens, issueSetPasswordToken } from "@/lib/repos/passwordSetTokens"
import { createAuditLog } from "@/lib/repos/auditLog"
import { sendSetPasswordEmail } from "@/lib/notify"

type Params = { params: Promise<{ userId: string }> }
type UserRow = { id: string; email: string; full_name: string | null; developer_id: string | null }

// POST /api/v1/accounts/[userId]/reset-password — ADMIN | SALES only
// Clears the existing password hash and issues a fresh set-password link.
// Admin never sees a password — buyer sets a new one via the link.
export async function POST(_req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId, id: actorUserId } = session.user
  if (role !== "ADMIN" && role !== "SALES") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  const { userId } = await params

  const user = await queryOne<UserRow>(
    `SELECT u.id, u.email, u.developer_id, b.full_name
     FROM users u LEFT JOIN buyers b ON b.id = u.buyer_id
     WHERE u.id = $1 AND u.developer_id = $2 AND u.role = 'BUYER'`,
    [userId, developerId],
  )
  if (!user) return NextResponse.json({ error: "Buyer account not found" }, { status: 404 })

  // Clear password and issue fresh link
  await clearPasswordHash(userId)
  await invalidatePriorTokens(userId)
  const rawToken = await issueSetPasswordToken(userId)
  const appUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const setPasswordUrl = `${appUrl}/set-password?token=${rawToken}`

  await sendSetPasswordEmail({
    buyerEmail: user.email,
    buyerName: user.full_name ?? user.email,
    setPasswordUrl,
  })

  await createAuditLog({
    developerId,
    actorUserId,
    action: "ACCOUNT_PASSWORD_RESET",
    target: `users/${userId}`,
    meta: { email: user.email },
  })

  return NextResponse.json({ ok: true, message: `Password reset — new set-password link sent to ${user.email}.` })
}
