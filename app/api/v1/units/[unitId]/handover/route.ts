import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/auth"
import { withTransaction } from "@/lib/db"
import { findUnitById } from "@/lib/repos/units"
import { findBuyerById } from "@/lib/repos/buyers"
import { findPaymentPlanByUnit, findInstallmentsByPlan } from "@/lib/repos/paymentPlans"
import type { PoolClient } from "pg"

const schema = z.object({
  moveInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

const UNPAID_STATUSES = new Set(["PENDING", "DUE", "OVERDUE", "PARTIAL"])

export async function PATCH(
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

  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 })
  }

  // ── Preflight checks (outside transaction — read-only) ────────────────────

  const unit = await findUnitById(unitId, developerId)
  if (!unit) return NextResponse.json({ error: "Unit not found" }, { status: 404 })

  if (unit.status !== "SOLD") {
    return NextResponse.json(
      { error: `Unit must be SOLD to hand over (current status: ${unit.status})` },
      { status: 422 },
    )
  }

  if (!unit.buyerId) {
    return NextResponse.json({ error: "No buyer linked to this unit" }, { status: 422 })
  }

  const buyer = await findBuyerById(unit.buyerId, developerId)
  if (!buyer) return NextResponse.json({ error: "Linked buyer not found" }, { status: 404 })

  const paymentPlan = await findPaymentPlanByUnit(unitId, developerId)
  if (!paymentPlan) {
    return NextResponse.json({ error: "No payment plan found for this unit" }, { status: 422 })
  }

  const installments = await findInstallmentsByPlan(paymentPlan.id)
  const unpaid = installments.filter((i) => UNPAID_STATUSES.has(i.status))
  if (unpaid.length > 0) {
    return NextResponse.json(
      {
        error: "Payment plan not fully settled",
        detail: `${unpaid.length} installment(s) are not yet paid`,
        unpaidIds: unpaid.map((i) => i.id),
      },
      { status: 422 },
    )
  }

  // ── Transactional handover ────────────────────────────────────────────────

  const moveInDate = parsed.data.moveInDate ?? new Date().toISOString().slice(0, 10)

  type ResidentRow = {
    id: string
    developer_id: string
    unit_id: string
    buyer_id: string | null
    full_name: string
    phone: string
    email: string | null
    move_in_date: Date | null
    status: string
    created_at: Date
  }

  const resident = await withTransaction(async (client: PoolClient) => {
    // 1. Transition unit → HANDED_OVER
    await client.query(
      "UPDATE units SET status = 'HANDED_OVER' WHERE id = $1 AND developer_id = $2",
      [unitId, developerId],
    )

    // 2. Create resident row — buyer_id carries the lifecycle bridge
    const res = await client.query<ResidentRow>(
      `INSERT INTO residents
         (developer_id, unit_id, buyer_id, full_name, phone, email, move_in_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE')
       RETURNING *`,
      [
        developerId,
        unitId,
        unit.buyerId,
        buyer.fullName,
        buyer.phone,
        buyer.email ?? null,
        moveInDate,
      ],
    )

    // 3. Audit log
    await client.query(
      `INSERT INTO audit_logs (developer_id, actor_user_id, action, target, meta)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        developerId,
        actorUserId,
        "unit.handover",
        `units/${unitId}`,
        JSON.stringify({
          unitId,
          unitCode: unit.code,
          buyerId: unit.buyerId,
          buyerName: buyer.fullName,
          residentId: res.rows[0].id,
          moveInDate,
        }),
      ],
    )

    return res.rows[0]
  })

  return NextResponse.json(
    {
      residentId: resident.id,
      unitId,
      unitCode: unit.code,
      buyerName: buyer.fullName,
      moveInDate,
      message: `Unit ${unit.code} handed over to ${buyer.fullName}. Resident record created.`,
    },
    { status: 201 },
  )
}
