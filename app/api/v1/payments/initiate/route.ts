import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/auth"
import { findInstallmentById } from "@/lib/repos/paymentPlans"
import { findBuyerById } from "@/lib/repos/buyers"
import { getPaymentProvider } from "@/lib/payments"
import { randomUUID } from "crypto"

const PAYABLE_STATUSES = new Set(["DUE", "PARTIAL", "PENDING", "OVERDUE"])

const schema = z.object({
  installmentId: z.string().regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    "Invalid UUID",
  ),
})

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId, buyerId: sessionBuyerId } = session.user

  // Only BUYER, ADMIN, and SALES may initiate payments
  if (role !== "BUYER" && role !== "ADMIN" && role !== "SALES") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues.map((i) => i.message) },
      { status: 422 },
    )
  }

  const { installmentId } = parsed.data

  // Fetch installment — amount comes from DB, never from the client
  const installment = await findInstallmentById(installmentId, developerId)
  if (!installment) {
    return NextResponse.json({ error: "Installment not found" }, { status: 404 })
  }

  // BUYER: can only pay their own installments
  if (role === "BUYER") {
    if (!sessionBuyerId || installment.buyerId !== sessionBuyerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  // Confirm the installment is in a payable state
  if (!PAYABLE_STATUSES.has(installment.status)) {
    return NextResponse.json(
      { error: `Installment status "${installment.status}" is not payable` },
      { status: 422 },
    )
  }

  // Remaining amount to collect (full amount minus what's already been paid)
  const remaining = installment.amount - installment.paidAmount
  if (remaining <= 0) {
    return NextResponse.json({ error: "Installment is already fully paid" }, { status: 422 })
  }

  // Fetch buyer for their email (required by Paystack)
  const buyer = await findBuyerById(installment.buyerId, developerId)
  if (!buyer) {
    return NextResponse.json({ error: "Buyer record not found" }, { status: 404 })
  }

  // Unique reference — encoded with installmentId so webhook can deterministically reconcile
  // even if metadata is stripped. Format: PAY-<installmentId>-<nonce>
  const nonce = randomUUID().replace(/-/g, "").slice(0, 8)
  const reference = `PAY-${installmentId}-${nonce}`

  // Paystack redirects here after checkout — buyer lands back on the portal with fresh data.
  // Set server-side only; never accepted from the client.
  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  const callbackUrl = `${appUrl}/portal?payment=done`

  const provider = getPaymentProvider()
  let result: Awaited<ReturnType<typeof provider.initiatePayment>>
  try {
    result = await provider.initiatePayment({
      reference,
      amountCedis: remaining,
      currency: installment.currency,
      email: buyer.email ?? `buyer-${installment.buyerId}@estate.internal`,
      callbackUrl,
      metadata: {
        installmentId,
        buyerId: installment.buyerId,
        planId: installment.paymentPlanId,
        sequence: installment.sequence,
      },
    })
  } catch (err) {
    console.error("[payments/initiate]", err)
    return NextResponse.json({ error: "Payment provider error" }, { status: 502 })
  }

  return NextResponse.json({
    authorizationUrl: result.authorizationUrl,
    reference: result.reference,
    amountCedis: remaining,
    currency: installment.currency,
  })
}
