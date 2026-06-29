import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/auth"
import { findOwnerOccupierByBuyer } from "@/lib/repos/residents"
import { createTicket } from "@/lib/repos/maintenance"
import type { TicketPriority } from "@/app/data/types"

const schema = z.object({
  incidentType: z.string().min(1).max(100),
  location:     z.string().min(1).max(200),
  priority:     z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  description:  z.string().min(1).max(5000),
})

// Homeowner submits an incident/maintenance report from the Resident OS.
// Resolves unitId and developerId from the buyer's OWNER_OCCUPIER resident row.
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, buyerId } = session.user
  if (role !== "BUYER") {
    return NextResponse.json({ error: "Forbidden — homeowners only" }, { status: 403 })
  }
  if (!buyerId) return NextResponse.json({ error: "No buyer context" }, { status: 403 })

  const homeowner = await findOwnerOccupierByBuyer(buyerId)
  if (!homeowner) return NextResponse.json({ error: "Homeowner access required" }, { status: 403 })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 })
  }

  const { incidentType, location, priority, description } = parsed.data

  const ticket = await createTicket(homeowner.developerId, {
    unitId: homeowner.unitId,
    title: `[${incidentType}] ${location}`,
    description,
    priority: priority as TicketPriority,
  })

  return NextResponse.json({ ticketId: ticket.id, ref: ticket.id.slice(0, 8).toUpperCase() }, { status: 201 })
}
