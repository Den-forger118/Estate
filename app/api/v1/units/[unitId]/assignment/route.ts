import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { withTransaction } from "@/lib/db"
import { findUnitById } from "@/lib/repos/units"
import { findPaymentPlanByUnit, hasPaidInstallments } from "@/lib/repos/paymentPlans"
import { createAuditLog } from "@/lib/repos/auditLog"

/**
 * DELETE /api/v1/units/[unitId]/assignment
 *
 * Unassigns a buyer from a unit that was assigned by mistake.
 *
 * Safe path  (no payments recorded): deletes the payment plan + installments atomically,
 *            clears unit.buyer_id, resets status to AVAILABLE, audit-logs UNIT_UNASSIGNED.
 *
 * Blocked    (any installment has paidAmount > 0): returns 409 with paymentsExist=true.
 *            The admin must reverse payments manually before unassigning.
 *
 * ADMIN and SALES only.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ unitId: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId, id: actorUserId } = session.user
  if (role !== "ADMIN" && role !== "SALES") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  const { unitId } = await params

  const unit = await findUnitById(unitId, developerId)
  if (!unit) return NextResponse.json({ error: "Unit not found" }, { status: 404 })
  if (!unit.buyerId) {
    return NextResponse.json({ error: "Unit has no buyer assigned" }, { status: 409 })
  }

  const prevBuyerId = unit.buyerId
  const plan = await findPaymentPlanByUnit(unitId, developerId)

  if (plan) {
    const blocked = await hasPaidInstallments(plan.id)
    if (blocked) {
      return NextResponse.json(
        {
          error:
            "Cannot unassign: this unit has recorded payments. " +
            "Reverse the payments manually before unassigning.",
          paymentsExist: true,
        },
        { status: 409 },
      )
    }
  }

  // Safe to unassign — no real money has changed hands.
  await withTransaction(async (client) => {
    if (plan) {
      // Remove installments first (FK: installments.payment_plan_id → payment_plans.id)
      await client.query(
        "DELETE FROM installments WHERE payment_plan_id = $1 AND developer_id = $2",
        [plan.id, developerId],
      )
      await client.query(
        "DELETE FROM payment_plans WHERE id = $1 AND developer_id = $2",
        [plan.id, developerId],
      )
    }
    await client.query(
      "UPDATE units SET buyer_id = NULL, status = 'AVAILABLE' WHERE id = $1 AND developer_id = $2",
      [unitId, developerId],
    )
  })

  await createAuditLog({
    developerId,
    actorUserId,
    action: "UNIT_UNASSIGNED",
    target: unitId,
    meta: { prevBuyerId, hadPlan: plan !== null },
  })

  return NextResponse.json({ ok: true })
}
