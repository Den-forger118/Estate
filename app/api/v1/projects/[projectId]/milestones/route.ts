import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { findProjectById } from "@/lib/repos/projects"
import { findMilestonesByProject } from "@/lib/repos/milestones"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId } = session.user
  if (role === "BUYER") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  const { projectId } = await params

  // Verify project belongs to this developer before returning its data
  const project = await findProjectById(projectId, developerId)
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })

  const milestones = await findMilestonesByProject(projectId)
  return NextResponse.json(milestones)
}
