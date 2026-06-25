import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { findTicketsByDeveloper } from "@/lib/repos/maintenance"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId } = session.user
  if (role === "BUYER") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  const tickets = await findTicketsByDeveloper(developerId)
  return NextResponse.json(tickets)
}
