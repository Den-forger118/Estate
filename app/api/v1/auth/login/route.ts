import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { compare } from "bcryptjs"
import { createSession, COOKIE_NAME, SESSION_TTL_MS } from "@/lib/auth"
import { findUserByEmail, touchLastLogin } from "@/lib/repos/users"
import { createAuditLog } from "@/lib/repos/auditLog"
import { checkRateLimit } from "@/lib/rateLimit"

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// 20 attempts per 5 minutes per IP — blocks spray attacks and credential stuffing.
const IP_MAX = 20
const IP_WINDOW_MS = 5 * 60_000

// 10 attempts per 10 minutes per email — blocks targeted attacks on a single account
// from many IPs (distributed credential stuffing).
const EMAIL_MAX = 10
const EMAIL_WINDOW_MS = 10 * 60_000

export async function POST(req: NextRequest) {
  // ── IP rate limit — checked before body parse to prevent amplification ────
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"

  const ipRl = await checkRateLimit(`login:ip:${ip}`, { max: IP_MAX, windowMs: IP_WINDOW_MS })
  if (!ipRl.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(ipRl.retryAfterSec) } },
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const { email, password } = parsed.data

  // ── Per-email rate limit — catches distributed attacks targeting one account ─
  const emailRl = await checkRateLimit(`login:email:${email.toLowerCase()}`, { max: EMAIL_MAX, windowMs: EMAIL_WINDOW_MS })
  if (!emailRl.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(emailRl.retryAfterSec) } },
    )
  }

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
