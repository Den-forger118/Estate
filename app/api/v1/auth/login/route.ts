import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { compare } from "bcryptjs"
import { createSession, COOKIE_NAME, SESSION_TTL_MS } from "@/lib/auth"
import { findUserByEmail, touchLastLogin } from "@/lib/repos/users"
import { createAuditLog } from "@/lib/repos/auditLog"

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const { email, password } = parsed.data

  let user
  try {
    user = await findUserByEmail(email)
  } catch {
    return NextResponse.json(
      { error: "Service waking up, please try again in a moment." },
      { status: 503 },
    )
  }

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  if (user.status === "SUSPENDED") {
    return NextResponse.json(
      { error: "This account has been suspended. Please contact support." },
      { status: 403 },
    )
  }

  if (!user.passwordHash) {
    return NextResponse.json(
      { error: "Account setup incomplete. Please check your email for the set-password link." },
      { status: 403 },
    )
  }

  const valid = await compare(password, user.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  const token = await createSession(user.id)

  await touchLastLogin(user.id).catch(() => {})

  await createAuditLog({
    developerId: user.developerId,
    actorUserId: user.id,
    action: "AUTH_LOGIN",
    target: user.email,
  }).catch(() => {})

  const res = NextResponse.json({
    user: { id: user.id, email: user.email, role: user.role },
  })

  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL_MS / 1000,
    path: "/",
  })

  return res
}
