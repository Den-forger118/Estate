import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/auth"
import { checkRateLimit } from "@/lib/rateLimit"
import { createLead, findLeadsByDeveloper } from "@/lib/repos/leads"
import { createAuditLog } from "@/lib/repos/auditLog"

// ─── Field length caps ────────────────────────────────────────────────────────
const schema = z.object({
  fullName:  z.string().min(2).max(120).trim(),
  phone:     z.string().min(6).max(30).trim(),
  email:     z.string().email().max(200).trim().optional().or(z.literal("")),
  message:   z.string().max(2000).trim().optional(),
  // UUID format only — not RFC 4122 strict, matching what Postgres uuid type accepts.
  unitId:    z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "Invalid UUID").optional(),
  // Honeypot — accept any value; checked AFTER validation so bots see no signal.
  // Slot for CAPTCHA: replace _hp check with Cloudflare Turnstile / hCaptcha verify.
  _hp:       z.string().optional(),
})

// Developer resolved server-side from env — never from the request body.
function getDefaultDeveloperId(): string {
  const id = process.env.DEVELOPER_ID
  if (!id) throw new Error("DEVELOPER_ID env var is not set")
  return id
}

// ─── POST — public lead capture ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Rate-limit by IP before parsing body to prevent amplification.
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"

  const rl = checkRateLimit(ip)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests — please try again in a minute." },
      { status: 429, headers: { "Retry-After": "60" } },
    )
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues.map((i) => i.message) },
      { status: 422 },
    )
  }

  const { fullName, phone, email, message, unitId, _hp } = parsed.data

  // Honeypot: bots fill every field including hidden ones.
  if (_hp) {
    // Return 200 to avoid leaking the anti-spam mechanism.
    return NextResponse.json({ ok: true })
  }

  let developerId: string
  try {
    developerId = getDefaultDeveloperId()
  } catch {
    return NextResponse.json({ error: "Service misconfigured" }, { status: 503 })
  }

  const lead = await createLead({
    developerId,
    unitId: unitId ?? null,
    fullName,
    phone,
    email: email || null,
    message: message || null,
    source: "website",
  })

  await createAuditLog({
    developerId,
    action: "lead.created",
    target: `leads/${lead.id}`,
    meta: { source: "website", unitId: unitId ?? null, fullName },
  })

  // Optional Resend email notification to sales team.
  // Slot: add RESEND_API_KEY + SALES_NOTIFICATION_EMAIL to env and call
  // resend.emails.send({ from, to, subject, text }) here before returning.

  // Never echo back the internal lead ID or developer scoping.
  return NextResponse.json({ ok: true, message: "Thank you — our team will be in touch shortly." }, { status: 201 })
}

// ─── GET — session-guarded, ADMIN|SALES only ─────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId } = session.user
  if (role !== "ADMIN" && role !== "SALES") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status") as Parameters<typeof findLeadsByDeveloper>[1] | null

  const leads = await findLeadsByDeveloper(developerId, status ?? undefined)
  return NextResponse.json(leads)
}
