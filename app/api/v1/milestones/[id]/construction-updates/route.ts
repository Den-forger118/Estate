import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/auth"
import { findMilestoneById } from "@/lib/repos/milestones"
import { createUpdate } from "@/lib/repos/constructionUpdates"

const schema = z.object({
  photoUrl: z.string().url(),
  caption: z.string().max(500).optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId } = session.user
  if (role !== "ADMIN" && role !== "OPS") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 })
  }

  const milestone = await findMilestoneById(id, developerId)
  if (!milestone) return NextResponse.json({ error: "Milestone not found" }, { status: 404 })
  if (milestone.status === "COMPLETED") {
    return NextResponse.json({ error: "Cannot add updates to a completed milestone" }, { status: 409 })
  }

  const update = await createUpdate({
    developerId,
    milestoneId: id,
    photoUrl: parsed.data.photoUrl,
    caption: parsed.data.caption,
    postedById: session.user.id,
  })

  return NextResponse.json(update, { status: 201 })
}
