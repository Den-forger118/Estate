import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { findUnitsByDeveloper } from "@/lib/repos/units"

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId } = session.user
  if (role !== "ADMIN" && role !== "SALES" && role !== "OPS") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  const projectId = req.nextUrl.searchParams.get("projectId") ?? undefined
  const units = await findUnitsByDeveloper(developerId, projectId)
  return NextResponse.json(units)
}
