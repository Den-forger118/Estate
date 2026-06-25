import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/auth"
import { findTicketById, updateTicketStatus } from "@/lib/repos/maintenance"

const schema = z.object({
  status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED"]),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId } = session.user
  if (role === "BUYER") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  const { id } = await params

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 })
  }

  const existing = await findTicketById(id, developerId)
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (existing.status === "RESOLVED") {
    return NextResponse.json({ error: "Ticket is already resolved" }, { status: 422 })
  }

  const updated = await updateTicketStatus(id, developerId, parsed.data.status)
  return NextResponse.json(updated)
}
