import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/auth"
import { withTransaction, queryOne } from "@/lib/db"
import { findLeadById, updateLeadStatus } from "@/lib/repos/leads"
import { createAuditLog } from "@/lib/repos/auditLog"
import { issueSetPasswordToken, invalidatePriorTokens } from "@/lib/repos/passwordSetTokens"
import { sendSetPasswordEmail } from "@/lib/notify"
import { getAppBaseUrl } from "@/lib/appUrl"
import type { PoolClient } from "pg"

const patchSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("setStatus"),
    status: z.enum(["CONTACTED", "QUALIFIED", "REJECTED"]),
  }),
  z.object({
    action: z.literal("convert"),
  }),
])

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId } = session.user
  if (role !== "ADMIN" && role !== "SALES") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  const { id } = await params
  const lead = await findLeadById(id, developerId)
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 })

  return NextResponse.json(lead)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId, id: actorUserId } = session.user
  if (role !== "ADMIN" && role !== "SALES") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  const { id } = await params

  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 })
  }

  const lead = await findLeadById(id, developerId)
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 })

  // ── Simple status update ──────────────────────────────────────────────────
  if (parsed.data.action === "setStatus") {
    if (lead.status === "CONVERTED") {
      return NextResponse.json({ error: "Converted leads cannot be updated" }, { status: 422 })
    }

    const updated = await updateLeadStatus(id, developerId, parsed.data.status)

    await createAuditLog({
      developerId,
      actorUserId,
      action: "lead.statusUpdated",
      target: `leads/${id}`,
      meta: { from: lead.status, to: parsed.data.status },
    })

    return NextResponse.json(updated)
  }

  // ── Convert to Buyer ──────────────────────────────────────────────────────
  if (lead.status === "CONVERTED") {
    return NextResponse.json({ error: "Lead is already converted" }, { status: 422 })
  }

  if (!lead.email) {
    return NextResponse.json(
      { error: "Cannot convert: this lead has no email address. Edit the lead to add one first." },
      { status: 400 },
    )
  }

  type BuyerRow = { id: string }
  type UserCheckRow = { id: string }

  // Check for email conflict before opening transaction
  const existingUser = await queryOne<UserCheckRow>(
    "SELECT id FROM users WHERE email = $1",
    [lead.email.toLowerCase()],
  )
  if (existingUser) {
    return NextResponse.json(
      { error: `A user account with email ${lead.email} already exists. Cannot create a duplicate.` },
      { status: 409 },
    )
  }

  type ConversionResult = { buyerId: string; userId: string; fullName: string; email: string }

  const result = await withTransaction(async (client: PoolClient): Promise<ConversionResult> => {
    // 1. Create buyer from lead data
    const { rows: buyerRows } = await client.query<BuyerRow>(
      `INSERT INTO buyers (developer_id, full_name, phone, email)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [developerId, lead.fullName, lead.phone, lead.email],
    )
    const buyerId = buyerRows[0].id

    // 2. Create BUYER user account (password_hash NULL = pending activation)
    type UserRow = { id: string }
    const { rows: userRows } = await client.query<UserRow>(
      `INSERT INTO users (developer_id, email, role, buyer_id, password_hash, status)
       VALUES ($1, $2, 'BUYER', $3, NULL, 'ACTIVE')
       RETURNING id`,
      [developerId, lead.email!.toLowerCase(), buyerId],
    )
    const userId = userRows[0].id

    // 3. Mark lead CONVERTED
    await client.query(
      "UPDATE leads SET status = 'CONVERTED' WHERE id = $1 AND developer_id = $2",
      [id, developerId],
    )

    // 4. Audit logs inside transaction
    const logBase = [developerId, actorUserId]
    await client.query(
      `INSERT INTO audit_logs (developer_id, actor_user_id, action, target, meta) VALUES ($1,$2,$3,$4,$5)`,
      [...logBase, "LEAD_CONVERTED", `leads/${id}`, JSON.stringify({ leadId: id, buyerId })],
    )
    await client.query(
      `INSERT INTO audit_logs (developer_id, actor_user_id, action, target, meta) VALUES ($1,$2,$3,$4,$5)`,
      [...logBase, "BUYER_CREATED", `buyers/${buyerId}`, JSON.stringify({ fullName: lead.fullName })],
    )
    await client.query(
      `INSERT INTO audit_logs (developer_id, actor_user_id, action, target, meta) VALUES ($1,$2,$3,$4,$5)`,
      [...logBase, "BUYER_ACCOUNT_CREATED", `users/${userId}`, JSON.stringify({ buyerId, email: lead.email })],
    )

    return { buyerId, userId, fullName: lead.fullName, email: lead.email! }
  })

  // Issue set-password token and send email (outside transaction — non-fatal if email fails)
  try {
    await invalidatePriorTokens(result.userId)
    const rawToken = await issueSetPasswordToken(result.userId)
    const setPasswordUrl = `${getAppBaseUrl()}/set-password?token=${rawToken}`

    await sendSetPasswordEmail({
      buyerEmail: result.email,
      buyerName: result.fullName,
      setPasswordUrl,
    })
  } catch (err) {
    console.error("[convert] Failed to send set-password email:", err)
  }

  return NextResponse.json(
    {
      buyerId: result.buyerId,
      userId: result.userId,
      fullName: result.fullName,
      email: result.email,
      message: `Buyer account created — set-password link sent to ${result.email}.`,
    },
    { status: 201 },
  )
}
