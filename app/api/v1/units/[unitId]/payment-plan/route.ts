import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/auth"
import { withTransaction } from "@/lib/db"
import { findUnitById } from "@/lib/repos/units"
import { findBuyerById } from "@/lib/repos/buyers"
import {
  findPaymentPlanByUnit,
  findInstallmentsByPlan,
  createPaymentPlanWithInstallments,
} from "@/lib/repos/paymentPlans"

// ─── GET ──────────────────────────────────────────────────────────────────────

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

  const plan = await findPaymentPlanByUnit(unitId, developerId)
  if (!plan) return NextResponse.json({ error: "No payment plan found" }, { status: 404 })

  const installments = await findInstallmentsByPlan(plan.id)
  return NextResponse.json({ plan, installments })
}

// ─── POST ─────────────────────────────────────────────────────────────────────

const installmentSchema = z.object({
  sequence: z.number().int().min(1),
  amount: z.number().positive(),
  dueDate: z.string().optional(),
  linkedMilestoneId: z.string().optional(),
})

const schema = z.object({
  buyerId: z.string().min(1),
  downPayment: z.number().nonnegative(),
  currency: z.enum(["GHS", "USD"]).default("GHS"),
  zeroInterest: z.boolean().default(true),
  installments: z.array(installmentSchema).min(1),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ unitId: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId } = session.user
  if (role !== "ADMIN" && role !== "SALES") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  const { unitId } = await params
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 })
  }

  const [unit, buyer, existingPlan] = await Promise.all([
    findUnitById(unitId, developerId),
    findBuyerById(parsed.data.buyerId, developerId),
    findPaymentPlanByUnit(unitId, developerId),
  ])

  if (!unit) return NextResponse.json({ error: "Unit not found" }, { status: 404 })
  if (!buyer) return NextResponse.json({ error: "Buyer not found" }, { status: 404 })
  if (existingPlan) {
    return NextResponse.json({ error: "Unit already has a payment plan" }, { status: 409 })
  }
  if (unit.status === "SOLD" || unit.status === "HANDED_OVER") {
    return NextResponse.json({ error: "Unit is already sold" }, { status: 409 })
  }

  const totalAmount =
    parsed.data.downPayment +
    parsed.data.installments.reduce((sum, i) => sum + i.amount, 0)

  let result: Awaited<ReturnType<typeof createPaymentPlanWithInstallments>>

  await withTransaction(async (client) => {
    // Link buyer to unit and mark as SOLD
    await client.query(
      "UPDATE units SET buyer_id = $1, status = 'SOLD' WHERE id = $2 AND developer_id = $3",
      [parsed.data.buyerId, unitId, developerId],
    )

    result = await createPaymentPlanWithInstallments(
      {
        developerId,
        unitId,
        buyerId: parsed.data.buyerId,
        totalAmount,
        downPayment: parsed.data.downPayment,
        currency: parsed.data.currency,
        zeroInterest: parsed.data.zeroInterest,
        installments: parsed.data.installments.map((i) => ({
          sequence: i.sequence,
          amount: i.amount,
          dueDate: i.dueDate ? new Date(i.dueDate) : undefined,
          linkedMilestoneId: i.linkedMilestoneId,
        })),
      },
      client,
    )
  })

  return NextResponse.json(result!, { status: 201 })
}
