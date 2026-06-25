import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { withTransaction } from "@/lib/db"
import { findMilestoneById, completeMilestone } from "@/lib/repos/milestones"
import { countUpdatesByMilestone } from "@/lib/repos/constructionUpdates"
import { setInstallmentsDueByMilestone } from "@/lib/repos/paymentPlans"
import { createAuditLog } from "@/lib/repos/auditLog"

export async function PATCH(
  _req: NextRequest,
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

  const milestone = await findMilestoneById(id, developerId)
  if (!milestone) return NextResponse.json({ error: "Milestone not found" }, { status: 404 })
  if (milestone.status === "COMPLETED") {
    return NextResponse.json({ error: "Already completed" }, { status: 409 })
  }

  const photoCount = await countUpdatesByMilestone(id)
  if (photoCount === 0) {
    return NextResponse.json(
      { error: "Cannot complete milestone without a progress photo. Add a construction update first." },
      { status: 422 },
    )
  }

  const now = new Date()

  await withTransaction(async (client) => {
    await completeMilestone(id, now, client)
    await setInstallmentsDueByMilestone(id, developerId, now, client)
  })

  await createAuditLog({
    developerId,
    actorUserId: session.user.id,
    action: "MILESTONE_COMPLETE",
    target: id,
    meta: { milestoneName: milestone.name },
  }).catch(() => {})

  return NextResponse.json({
    id,
    status: "COMPLETED",
    completedAt: now.toISOString(),
  })
}
