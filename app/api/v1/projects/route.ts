import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/auth"
import { findProjectsByDeveloper, createProject } from "@/lib/repos/projects"
import { createAuditLog } from "@/lib/repos/auditLog"

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

// ─── POST ─────────────────────────────────────────────────────────────────────

const schema = z.object({
  name:     z.string().min(1).max(120),
  location: z.string().max(200).optional(),
  status:   z.enum(["ACTIVE", "COMPLETED", "ON_HOLD"]).default("ACTIVE"),
})

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId, id: actorUserId } = session.user
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden — ADMIN only" }, { status: 403 })
  }
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 })
  }

  const project = await createProject({
    developerId,
    name: parsed.data.name,
    location: parsed.data.location,
    status: parsed.data.status,
  })

  await createAuditLog({
    developerId,
    actorUserId,
    action: "PROJECT_CREATED",
    target: `projects/${project.id}`,
    meta: { projectId: project.id, name: project.name, location: project.location },
  })

  return NextResponse.json(project, { status: 201 })
}
