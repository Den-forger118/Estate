import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { findUserByEmail } from "@/lib/repos/users"
import { invalidatePriorTokens, issueSetPasswordToken } from "@/lib/repos/passwordSetTokens"
import { sendSetPasswordEmail } from "@/lib/notify"
import { createAuditLog } from "@/lib/repos/auditLog"
import { checkRateLimit } from "@/lib/rateLimit"
import { getAppBaseUrl } from "@/lib/appUrl"

const schema = z.object({
  email: z.string().email(),
})

// 5 submissions per 15 minutes per IP.
const MAX = 5
const WINDOW_MS = 15 * 60_000

// Identical body returned for every outcome — prevents account-existence enumeration.
const GENERIC_OK = {
  ok: true,
  message: "If that email is registered, a reset link has been sent.",
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"

  const rl = await checkRateLimit(`forgotpwd:${ip}`, { max: MAX, windowMs: WINDOW_MS })
  if (!rl.allowed) {
    // Return 429 with Retry-After but the same generic body — a different
    // error message here would let an attacker infer account existence by
    // timing how quickly the rate limit triggers.
    return NextResponse.json(GENERIC_OK, {
      status: 429,
      headers: { "Retry-After": String(rl.retryAfterSec) },
    })
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 422 })
  }

  const { email } = parsed.data

  // All DB and email work is in a silent try/catch: any error (unknown email,
  // suspended user, DB hiccup) must not change the response body or status so
  // the caller can't enumerate accounts by observing differences.
  try {
    const user = await findUserByEmail(email)

    if (user && user.status === "ACTIVE") {
      await invalidatePriorTokens(user.id)
      const rawToken = await issueSetPasswordToken(user.id)
      const setPasswordUrl = `${getAppBaseUrl()}/set-password?token=${rawToken}`

      await sendSetPasswordEmail({
        buyerEmail: user.email,
        buyerName: user.email,
        setPasswordUrl,
      })

      await createAuditLog({
        developerId: user.developerId,
        actorUserId: user.id,
        action: "AUTH_FORGOT_PASSWORD",
        target: `users/${user.id}`,
      }).catch(() => {})
    }
  } catch (err) {
    // Log for ops visibility; never propagate — the response must stay identical.
    console.error("[forgot-password] error during token issue/send:", err)
  }

  return NextResponse.json(GENERIC_OK)
}
