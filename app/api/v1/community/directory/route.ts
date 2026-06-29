import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { findOwnerOccupierByBuyer, findResidentsByDeveloper } from "@/lib/repos/residents"

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { role, developerId, buyerId } = session.user

  let resolvedDeveloperId: string

  if (role === "BUYER") {
    if (!buyerId) return NextResponse.json({ error: "No buyer context" }, { status: 403 })
    const homeowner = await findOwnerOccupierByBuyer(buyerId)
    if (!homeowner) return NextResponse.json({ error: "Homeowner access required" }, { status: 403 })
    resolvedDeveloperId = homeowner.developerId
  } else if (role === "ADMIN" || role === "SALES" || role === "OPS") {
    if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })
    resolvedDeveloperId = developerId
  } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const all = await findResidentsByDeveloper(resolvedDeveloperId)
  // Only expose OWNER_OCCUPIER residents; return only safe public fields
  const directory = all
    .filter((r) => r.occupancyType === "OWNER_OCCUPIER")
    .map((r) => ({
      id: r.id,
      fullName: r.fullName,
      unitCode: r.unitCode,
      moveInDate: r.moveInDate,
    }))

  return NextResponse.json(directory)
}
