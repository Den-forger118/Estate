import { NextRequest, NextResponse } from "next/server"
import { findValidToken } from "@/lib/repos/passwordSetTokens"
import { checkRateLimit } from "@/lib/rateLimit"

// 10 token probe requests per minute per IP.
const VALIDATE_MAX = 10
const VALIDATE_WINDOW_MS = 60_000

/** GET /api/v1/auth/set-password/validate?token=...
 * Public helper — tells the UI whether a token is still usable.
 * Returns { valid: true } or { valid: false, reason: "..." }.
 * Never returns any user data or token material.
 */
export async function GET(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"

  const rl = await checkRateLimit(`validate:${ip}`, { max: VALIDATE_MAX, windowMs: VALIDATE_WINDOW_MS })
  if (!rl.allowed) {
    return NextResponse.json(
      { valid: false, reason: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    )
  }

  const token = req.nextUrl.searchParams.get("token")
  if (!token) {
    return NextResponse.json({ valid: false, reason: "No token provided" }, { status: 400 })
  }

  const row = await findValidToken(token)
  if (!row) {
    return NextResponse.json({ valid: false, reason: "expired" })
  }

  return NextResponse.json({ valid: true })
}
