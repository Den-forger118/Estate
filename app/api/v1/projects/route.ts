import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { findProjectsByDeveloper } from "@/lib/repos/projects"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId } = session.user
  if (role !== "ADMIN" && role !== "SALES" && role !== "OPS") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  const projects = await findProjectsByDeveloper(developerId)
  return NextResponse.json(projects)
}
