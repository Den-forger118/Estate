import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/auth"
import { findUnitById } from "@/lib/repos/units"
import { findResidentByBuyerUnit } from "@/lib/repos/residents"
import { findTicketsByUnit, createTicket } from "@/lib/repos/maintenance"
import type { TicketPriority } from "@/app/data/types"

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ unitId: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId, buyerId } = session.user
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  const { unitId } = await params

  const unit = await findUnitById(unitId, developerId)
  if (!unit) return NextResponse.json({ error: "Unit not found" }, { status: 404 })

  // Staff can see any unit's tickets; buyers only see their homeowner unit
  if (role === "BUYER") {
    if (!buyerId) return NextResponse.json({ error: "No buyer context" }, { status: 403 })
    const resident = await findResidentByBuyerUnit(buyerId, unitId, developerId)
    if (!resident) {
      return NextResponse.json({ error: "Forbidden — not your unit" }, { status: 403 })
    }
  } else if (role !== "ADMIN" && role !== "SALES" && role !== "OPS") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const tickets = await findTicketsByUnit(unitId, developerId)
  return NextResponse.json(tickets)
}

// ─── POST ─────────────────────────────────────────────────────────────────────

const schema = z.object({
  title:       z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  priority:    z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ unitId: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId, buyerId } = session.user
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  // Buyers can only raise tickets for their homeowner unit; staff can raise for any unit
  if (role !== "BUYER" && role !== "ADMIN" && role !== "SALES" && role !== "OPS") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { unitId } = await params

  const unit = await findUnitById(unitId, developerId)
  if (!unit) return NextResponse.json({ error: "Unit not found" }, { status: 404 })

  if (role === "BUYER") {
    if (!buyerId) return NextResponse.json({ error: "No buyer context" }, { status: 403 })
    const resident = await findResidentByBuyerUnit(buyerId, unitId, developerId)
    if (!resident) {
      return NextResponse.json(
        { error: "Forbidden — you can only raise maintenance requests for your own unit" },
        { status: 403 },
      )
    }
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 })
  }

  const ticket = await createTicket(developerId, {
    unitId,
    title: parsed.data.title,
    description: parsed.data.description,
    priority: parsed.data.priority as TicketPriority,
  })

  return NextResponse.json(ticket, { status: 201 })
}
