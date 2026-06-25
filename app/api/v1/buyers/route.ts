import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/auth"
import { findBuyersByDeveloper, createBuyer } from "@/lib/repos/buyers"
import { createAuditLog } from "@/lib/repos/auditLog"

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId } = session.user
  if (role !== "ADMIN" && role !== "SALES" && role !== "OPS") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  const buyers = await findBuyersByDeveloper(developerId)
  return NextResponse.json(buyers)
}

// ─── POST ─────────────────────────────────────────────────────────────────────

const schema = z.object({
  fullName: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional(),
  isDiaspora: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId } = session.user
  if (role !== "ADMIN" && role !== "SALES") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 })
  }

  const { id: actorUserId } = session.user
  const buyer = await createBuyer(developerId, parsed.data)

  await createAuditLog({
    developerId,
    actorUserId,
    action: "BUYER_CREATED",
    target: `buyers/${buyer.id}`,
    meta:   { buyerId: buyer.id, fullName: buyer.fullName },
  })

  return NextResponse.json(buyer, { status: 201 })
}
