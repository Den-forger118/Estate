import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/auth"
import { findUnitsByDeveloper, createUnit } from "@/lib/repos/units"
import { findProjectById } from "@/lib/repos/projects"
import { createAuditLog } from "@/lib/repos/auditLog"

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

// ─── POST ─────────────────────────────────────────────────────────────────────

const schema = z.object({
  projectId:  z.string().uuid(),
  code:       z.string().min(1).max(40),
  type:       z.string().max(80).optional(),
  sizeSqm:    z.number().positive().optional(),
  priceTotal: z.number().positive(),
  status:     z.enum(["AVAILABLE", "RESERVED", "SOLD"]).default("AVAILABLE"),
})

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId, id: actorUserId } = session.user
  if (role !== "ADMIN" && role !== "SALES") {
    return NextResponse.json({ error: "Forbidden — ADMIN or SALES only" }, { status: 403 })
  }
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 })
  }

  // Verify the project belongs to this developer
  const project = await findProjectById(parsed.data.projectId, developerId)
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  const unit = await createUnit({
    developerId,
    projectId: parsed.data.projectId,
    code: parsed.data.code.trim(),
    type: parsed.data.type?.trim(),
    sizeSqm: parsed.data.sizeSqm,
    priceTotal: parsed.data.priceTotal,
    status: parsed.data.status,
  })

  if (!unit) {
    return NextResponse.json(
      { error: `Unit code "${parsed.data.code}" already exists in this project` },
      { status: 409 },
    )
  }

  await createAuditLog({
    developerId,
    actorUserId,
    action: "UNIT_CREATED",
    target: `units/${unit.id}`,
    meta: {
      unitId: unit.id,
      code: unit.code,
      projectId: project.id,
      projectName: project.name,
      type: unit.type,
      priceTotal: unit.priceTotal,
      status: unit.status,
    },
  })

  return NextResponse.json(unit, { status: 201 })
}
