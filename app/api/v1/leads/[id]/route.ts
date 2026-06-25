import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/auth"
import { withTransaction } from "@/lib/db"
import { findLeadById, updateLeadStatus } from "@/lib/repos/leads"
import { createBuyer } from "@/lib/repos/buyers"
import { createAuditLog } from "@/lib/repos/auditLog"
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

  // Must be at least QUALIFIED (or allow from any non-terminal status)
  // Product choice: allow ADMIN|SALES to convert from any status so they
  // are not blocked if they want to fast-track a verbal agreement.

  type BuyerRow = { id: string }

  const buyer = await withTransaction(async (client: PoolClient) => {
    // 1. Create buyer from lead data
    const { rows } = await client.query<BuyerRow>(
      `INSERT INTO buyers (developer_id, full_name, phone, email)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [developerId, lead.fullName, lead.phone, lead.email ?? null],
    )
    const buyerId = rows[0].id

    // 2. Mark lead CONVERTED
    await client.query(
      "UPDATE leads SET status = 'CONVERTED' WHERE id = $1 AND developer_id = $2",
      [id, developerId],
    )

    // 3. Audit log inside transaction for consistency
    await client.query(
      `INSERT INTO audit_logs (developer_id, actor_user_id, action, target, meta)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        developerId,
        actorUserId,
        "lead.converted",
        `leads/${id}`,
        JSON.stringify({ leadId: id, buyerId, fullName: lead.fullName }),
      ],
    )

    return { id: buyerId, fullName: lead.fullName, phone: lead.phone, email: lead.email }
  })

  return NextResponse.json(
    {
      buyerId: buyer.id,
      fullName: buyer.fullName,
      message: `Lead converted — Buyer record created for ${buyer.fullName}.`,
    },
    { status: 201 },
  )
}
