import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/auth"
import { findUnitById } from "@/lib/repos/units"
import { findDocumentsByUnit, createDocument } from "@/lib/repos/documents"
import { createAuditLog } from "@/lib/repos/auditLog"
import type { UnitDocument } from "@/app/data/types"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ unitId: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId } = session.user
  if (role !== "ADMIN" && role !== "SALES" && role !== "OPS") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  const { unitId } = await params

  const unit = await findUnitById(unitId, developerId)
  if (!unit) return NextResponse.json({ error: "Unit not found" }, { status: 404 })

  const documents = await findDocumentsByUnit(unitId)
  return NextResponse.json(documents)
}

// ─── POST ─────────────────────────────────────────────────────────────────────

const DOC_TYPES: UnitDocument["type"][] = ["SEARCH_CERTIFICATE", "SITE_PLAN", "INDENTURE", "OTHER"]

const postSchema = z.object({
  type:    z.enum(DOC_TYPES as [UnitDocument["type"], ...UnitDocument["type"][]]),
  fileUrl: z.string().url("fileUrl must be a valid URL"),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ unitId: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId, id: actorUserId } = session.user
  if (role !== "ADMIN" && role !== "OPS") {
    return NextResponse.json({ error: "Forbidden — ADMIN or OPS only" }, { status: 403 })
  }
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  const { unitId } = await params

  const body = await req.json().catch(() => null)
  const parsed = postSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 })
  }

  const unit = await findUnitById(unitId, developerId)
  if (!unit) return NextResponse.json({ error: "Unit not found" }, { status: 404 })

  const doc = await createDocument({
    developerId,
    unitId,
    type:         parsed.data.type,
    fileUrl:      parsed.data.fileUrl,
    uploadedById: actorUserId,
  })

  await createAuditLog({
    developerId,
    actorUserId,
    action: "DOCUMENT_UPLOADED",
    target: `units/${unitId}/documents/${doc.id}`,
    meta:   { unitId, unitCode: unit.code, documentId: doc.id, type: doc.type, version: doc.version },
  })

  return NextResponse.json(doc, { status: 201 })
}
