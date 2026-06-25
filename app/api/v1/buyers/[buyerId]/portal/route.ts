import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { findBuyerById, findBuyerByIdRaw } from "@/lib/repos/buyers"
import { findUnitByBuyer } from "@/lib/repos/units"
import { findProjectById } from "@/lib/repos/projects"
import { findPaymentPlanByUnit, findInstallmentsByPlan } from "@/lib/repos/paymentPlans"
import { findMilestonesByProject } from "@/lib/repos/milestones"
import { findUpdatesByProject } from "@/lib/repos/constructionUpdates"
import { findDocumentsByUnit } from "@/lib/repos/documents"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ buyerId: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { buyerId } = await params
  const { role, developerId, buyerId: sessionBuyerId } = session.user

  // Determine which developer context to use for scoping downstream queries
  let scopedDeveloperId: string

  if (role === "BUYER") {
    // Buyers may only view their own portal
    if (sessionBuyerId !== buyerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const rawBuyer = await findBuyerByIdRaw(buyerId)
    if (!rawBuyer) return NextResponse.json({ error: "Buyer not found" }, { status: 404 })
    scopedDeveloperId = rawBuyer.developerId
  } else if (role === "ADMIN" || role === "SALES" || role === "OPS") {
    if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })
    scopedDeveloperId = developerId
  } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const buyer = await findBuyerById(buyerId, scopedDeveloperId)
  if (!buyer) return NextResponse.json({ error: "Buyer not found" }, { status: 404 })

  const unit = await findUnitByBuyer(buyerId, scopedDeveloperId)
  if (!unit) return NextResponse.json({ error: "No unit linked to this buyer" }, { status: 404 })

  const [project, paymentPlan] = await Promise.all([
    findProjectById(unit.projectId, scopedDeveloperId),
    findPaymentPlanByUnit(unit.id, scopedDeveloperId),
  ])

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })
  if (!paymentPlan) return NextResponse.json({ error: "No payment plan found" }, { status: 404 })

  const [installments, milestones, constructionUpdates, documents] = await Promise.all([
    findInstallmentsByPlan(paymentPlan.id),
    findMilestonesByProject(unit.projectId),
    findUpdatesByProject(unit.projectId),
    findDocumentsByUnit(unit.id),
  ])

  return NextResponse.json({
    buyer,
    unit,
    project,
    paymentPlan,
    installments,
    milestones,
    constructionUpdates,
    documents,
  })
}
