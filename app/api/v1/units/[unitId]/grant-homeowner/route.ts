import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { findUnitById } from "@/lib/repos/units"
import { findBuyerById } from "@/lib/repos/buyers"
import { findPaymentPlanByUnit, findInstallmentsByPlan, isFullyPaid } from "@/lib/repos/paymentPlans"
import { findResidentByBuyerUnit, createResident } from "@/lib/repos/residents"
import { createAuditLog } from "@/lib/repos/auditLog"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ unitId: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId, id: actorUserId } = session.user
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden — ADMIN only" }, { status: 403 })
  }
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  const { unitId } = await params

  // ── Eligibility checks ────────────────────────────────────────────────────

  const unit = await findUnitById(unitId, developerId)
  if (!unit) return NextResponse.json({ error: "Unit not found" }, { status: 404 })

  if (unit.status !== "HANDED_OVER") {
    return NextResponse.json(
      { error: "Unit must be HANDED_OVER to grant homeowner access", currentStatus: unit.status },
      { status: 422 },
    )
  }

  if (!unit.buyerId) {
    return NextResponse.json({ error: "No buyer linked to this unit" }, { status: 422 })
  }

  const buyer = await findBuyerById(unit.buyerId, developerId)
  if (!buyer) return NextResponse.json({ error: "Linked buyer not found" }, { status: 404 })

  const plan = await findPaymentPlanByUnit(unitId, developerId)
  if (!plan) {
    return NextResponse.json({ error: "No payment plan found for this unit" }, { status: 422 })
  }

  const fullyPaid = await isFullyPaid(plan.id)
  if (!fullyPaid) {
    const installments = await findInstallmentsByPlan(plan.id)
    const unpaid = installments.filter((i) => i.status !== "PAID")
    return NextResponse.json(
      {
        error: "Payment plan is not fully settled",
        detail: `${unpaid.length} installment(s) not yet paid`,
        unpaidIds: unpaid.map((i) => i.id),
      },
      { status: 422 },
    )
  }

  // ── Idempotency — already granted ────────────────────────────────────────

  const existing = await findResidentByBuyerUnit(unit.buyerId, unitId, developerId)
  if (existing) {
    return NextResponse.json(
      { message: "Homeowner access already granted", residentId: existing.id },
      { status: 200 },
    )
  }

  // ── Grant: create owner-occupier residents row ────────────────────────────

  const resident = await createResident(developerId, {
    unitId,
    buyerId: unit.buyerId,
    fullName: buyer.fullName,
    phone: buyer.phone,
    email: buyer.email,
    moveInDate: new Date(),
    status: "ACTIVE",
    occupancyType: "OWNER_OCCUPIER",
  })

  await createAuditLog({
    developerId,
    actorUserId,
    action: "HOMEOWNER_GRANTED",
    target: `units/${unitId}`,
    meta: {
      unitId,
      unitCode: unit.code,
      buyerId: unit.buyerId,
      buyerName: buyer.fullName,
      residentId: resident.id,
    },
  })

  return NextResponse.json(
    { message: `Homeowner access granted to ${buyer.fullName}`, residentId: resident.id },
    { status: 201 },
  )
}
