import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/auth"
import { findTicketsByDeveloper, createTicket } from "@/lib/repos/maintenance"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId } = session.user
  if (role === "BUYER") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  const tickets = await findTicketsByDeveloper(developerId)
  return NextResponse.json(tickets)
}

const schema = z.object({
  title:    z.string().min(1).max(200),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  unitId:   z.string().uuid().optional(),
})

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId } = session.user
  if (role === "BUYER") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 })
  }

  const ticket = await createTicket(developerId, {
    title:    parsed.data.title,
    priority: parsed.data.priority,
    unitId:   parsed.data.unitId,
  })
  return NextResponse.json(ticket, { status: 201 })
}
