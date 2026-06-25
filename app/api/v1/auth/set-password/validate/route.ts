import { NextRequest, NextResponse } from "next/server"
import { findValidToken } from "@/lib/repos/passwordSetTokens"

/** GET /api/v1/auth/set-password/validate?token=...
 * Public helper — tells the UI whether a token is still usable.
 * Returns { valid: true } or { valid: false, reason: "..." }.
 * Never returns any user data or token material.
 */
export async function GET(req: NextRequest) {
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
