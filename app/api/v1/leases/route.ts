import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { findLeasesByDeveloper } from "@/lib/repos/leases"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId } = session.user
  if (role === "BUYER") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  const leases = await findLeasesByDeveloper(developerId)
  return NextResponse.json(leases)
}
