import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { findProjectById } from "@/lib/repos/projects"
import { findUpdatesByProject } from "@/lib/repos/constructionUpdates"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { developerId } = session.user
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  const { projectId } = await params

  const project = await findProjectById(projectId, developerId)
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })

  const updates = await findUpdatesByProject(projectId)
  return NextResponse.json(updates)
}
