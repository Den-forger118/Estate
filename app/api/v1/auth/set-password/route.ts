import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { hash } from "bcryptjs"
import { consumeSetPasswordToken } from "@/lib/repos/passwordSetTokens"
import { query } from "@/lib/db"
import { createAuditLog } from "@/lib/repos/auditLog"
import { checkRateLimit } from "@/lib/rateLimit"

const schema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
})

// 5 token submissions per 5 minutes per IP — prevents online token brute-force.
const SETPWD_MAX = 5
const SETPWD_WINDOW_MS = 5 * 60_000

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"

  const rl = await checkRateLimit(`setpwd:${ip}`, { max: SETPWD_MAX, windowMs: SETPWD_WINDOW_MS })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues.map((i) => i.message) },
      { status: 422 },
    )
  }

  const { token: rawToken, password } = parsed.data

  // Atomically mark the token used; returns user_id only if token was valid and unused.
  // Concurrent requests with the same token: exactly one UPDATE wins — the rest get null.
  const userId = await consumeSetPasswordToken(rawToken)
  if (!userId) {
    return NextResponse.json(
      { error: "This link is invalid, expired, or has already been used." },
      { status: 400 },
    )
  }

  const passwordHash = await hash(password, 12)

  type UserRow = { id: string; developer_id: string | null }
  const userRow = await query<UserRow>(
    "UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id, developer_id",
    [passwordHash, userId],
  )

  if (userRow.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  await createAuditLog({
    developerId: userRow[0].developer_id,
    actorUserId: userId,
    action: "PASSWORD_SET",
    target: `users/${userId}`,
  }).catch(() => {})

  return NextResponse.json({ ok: true, message: "Password set successfully. You can now sign in." })
}
