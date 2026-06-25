import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/auth"
import { manualReconcile } from "@/lib/repos/payments"
import { findInstallmentNotifyData } from "@/lib/repos/paymentPlans"
import { sendPaymentReceipt } from "@/lib/notify"

const schema = z.object({
  installmentId: z.string().regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    "Invalid UUID",
  ),
})

type Props = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Props) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId, id: actorUserId } = session.user
  if (role !== "ADMIN" && role !== "OPS") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  const { id: paymentId } = await params

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues.map((i) => i.message) },
      { status: 422 },
    )
  }

  const { installmentId } = parsed.data

  let payment
  try {
    payment = await manualReconcile(paymentId, installmentId, developerId, actorUserId)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Reconciliation failed"
    // "already MATCHED/MANUAL" and "not found" are client errors
    const status = message.includes("already") || message.includes("not found") ? 422 : 500
    return NextResponse.json({ error: message }, { status })
  }

  // Fire receipt email — outside transaction, non-blocking
  const notifyData = await findInstallmentNotifyData(installmentId, developerId).catch(() => null)
  if (notifyData?.buyerEmail) {
    sendPaymentReceipt({
      buyerEmail:     notifyData.buyerEmail,
      buyerName:      notifyData.buyerName,
      amountGHS:      payment.amount,
      providerRef:    payment.providerRef,
      installmentSeq: notifyData.installmentSeq,
      currency:       notifyData.currency,
      receivedAt:     payment.receivedAt,
    }).catch((err) => console.error("[notify] Manual reconcile receipt error:", err))
  }

  return NextResponse.json({ ok: true, paymentId, installmentId, reconStatus: "MANUAL" })
}
