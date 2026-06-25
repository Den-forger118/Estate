import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { hash } from "bcryptjs"
import { findValidToken, markTokenUsed } from "@/lib/repos/passwordSetTokens"
import { query } from "@/lib/db"
import { createAuditLog } from "@/lib/repos/auditLog"

const schema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues.map((i) => i.message) },
      { status: 422 },
    )
  }

  const { token: rawToken, password } = parsed.data

  const tokenRow = await findValidToken(rawToken)
  if (!tokenRow) {
    return NextResponse.json(
      { error: "This link is invalid, expired, or has already been used." },
      { status: 400 },
    )
  }

  const passwordHash = await hash(password, 12)

  // Set password and mark token used atomically via UPDATE + separate mark
  type UserRow = { id: string; developer_id: string | null }
  const userRow = await query<UserRow>(
    "UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id, developer_id",
    [passwordHash, tokenRow.user_id],
  )

  if (userRow.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  await markTokenUsed(tokenRow.id)

  await createAuditLog({
    developerId: userRow[0].developer_id,
    actorUserId: tokenRow.user_id,
    action: "PASSWORD_SET",
    target: `users/${tokenRow.user_id}`,
  }).catch(() => {})

  return NextResponse.json({ ok: true, message: "Password set successfully. You can now sign in." })
}
