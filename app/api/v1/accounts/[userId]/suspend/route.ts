import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { queryOne } from "@/lib/db"
import { setUserStatus } from "@/lib/repos/users"
import { deleteSessionsByUserId } from "@/lib/repos/sessions"
import { createAuditLog } from "@/lib/repos/auditLog"

type Params = { params: Promise<{ userId: string }> }
type UserRow = { id: string; email: string; developer_id: string | null; status: string }

// POST /api/v1/accounts/[userId]/suspend — ADMIN only
export async function POST(_req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId, id: actorUserId } = session.user
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden — only ADMIN can suspend accounts" }, { status: 403 })
  }
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  const { userId } = await params

  const user = await queryOne<UserRow>(
    "SELECT id, email, developer_id, status FROM users WHERE id = $1 AND developer_id = $2 AND role = 'BUYER'",
    [userId, developerId],
  )
  if (!user) return NextResponse.json({ error: "Buyer account not found" }, { status: 404 })
  if (user.status === "SUSPENDED") {
    return NextResponse.json({ error: "Account is already suspended" }, { status: 409 })
  }

  await setUserStatus(userId, "SUSPENDED")
  await deleteSessionsByUserId(userId)

  await createAuditLog({
    developerId,
    actorUserId,
    action: "ACCOUNT_SUSPENDED",
    target: `users/${userId}`,
    meta: { email: user.email },
  })

  return NextResponse.json({ ok: true, message: `Account ${user.email} has been suspended.` })
}
