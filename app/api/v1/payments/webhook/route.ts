import { NextRequest, NextResponse } from "next/server"
import { getPaymentProvider } from "@/lib/payments"
import { findPaymentByProviderRef, receiveAndReconcile } from "@/lib/repos/payments"
import { findInstallmentNotifyData } from "@/lib/repos/paymentPlans"
import { sendPaymentReceipt } from "@/lib/notify"

function getDefaultDeveloperId(): string {
  const id = process.env.DEVELOPER_ID
  if (!id) throw new Error("DEVELOPER_ID env var is not set")
  return id
}

/**
 * Extract our installmentId from Paystack webhook metadata or the reference string.
 *
 * Reference format: PAY-<installmentId>-<nonce>
 * Metadata key:     metadata.installmentId (most reliable — always prefer this)
 */
function extractInstallmentId(
  metadata: Record<string, unknown>,
  reference: string,
): string | null {
  // 1. Prefer metadata (explicit, not subject to reference format changes)
  const fromMeta = metadata.installmentId
  if (typeof fromMeta === "string" && fromMeta.length > 0) return fromMeta

  // 2. Parse from reference: PAY-<uuid>-<nonce>
  const match = reference.match(/^PAY-([0-9a-f-]{36})-[0-9a-f]+$/i)
  return match ? match[1] : null
}

export async function POST(req: NextRequest) {
  // ── Step 1: Read RAW body before any JSON parsing ─────────────────────────
  // Paystack HMAC is computed over the exact bytes received. Parse-then-restringify
  // can change byte layout and will cause every verification to fail.
  let rawBody: string
  try {
    rawBody = await req.text()
  } catch {
    return NextResponse.json({ error: "Could not read request body" }, { status: 400 })
  }

  // ── Step 2: Verify HMAC-SHA512 signature ──────────────────────────────────
  const signature = req.headers.get("x-paystack-signature")
  const provider = getPaymentProvider()

  if (!provider.verifyWebhook(rawBody, signature)) {
    // Do not log body contents — could contain sensitive card data
    console.warn("[webhook] Invalid or missing x-paystack-signature")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // ── Step 3: Parse — only after signature is confirmed ─────────────────────
  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  // ── Step 4: Normalise via provider ────────────────────────────────────────
  const event = provider.parseWebhook(payload)

  if (!event) {
    // Not a charge.success — acknowledge so Paystack stops retrying
    return NextResponse.json({ received: true })
  }

  // ── Step 5: Resolve developer ─────────────────────────────────────────────
  let developerId: string
  try {
    developerId = getDefaultDeveloperId()
  } catch (err) {
    console.error("[webhook] DEVELOPER_ID not set:", err)
    return NextResponse.json({ error: "Service misconfigured" }, { status: 503 })
  }

  // ── Step 6: Idempotency — duplicate webhook delivery ──────────────────────
  const existing = await findPaymentByProviderRef(event.reference, developerId)
  if (existing) {
    console.log("[webhook] Duplicate delivery for ref:", event.reference)
    return NextResponse.json({ received: true })
  }

  // ── Step 7: Extract installmentId for deterministic reconciliation ─────────
  const installmentId = extractInstallmentId(event.metadata, event.reference)

  // ── Step 8: Atomically insert Payment + reconcile ─────────────────────────
  let reconStatus: string
  try {
    const result = await receiveAndReconcile({
      developerId,
      providerRef:   event.reference,
      amount:        event.amountCedis,
      channel:       event.channel,
      rawPayload:    event.rawPayload,
      installmentId,
    })
    reconStatus = result.reconStatus
    console.log(`[webhook] Payment ${result.paymentId} created — reconStatus: ${reconStatus}`)
  } catch (err) {
    console.error("[webhook] receiveAndReconcile failed:", err)
    // Return 500 so Paystack retries; idempotency guard prevents double-apply
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }

  // ── Step 9: Fire receipt email — outside transaction, non-blocking ─────────
  // Only send when we successfully matched to an installment. UNMATCHED payments
  // have no buyer context to notify; they sit in the queue for ops to reconcile.
  if (reconStatus === "MATCHED" && installmentId) {
    const notifyData = await findInstallmentNotifyData(installmentId, developerId).catch(() => null)
    if (notifyData?.buyerEmail) {
      sendPaymentReceipt({
        buyerEmail:    notifyData.buyerEmail,
        buyerName:     notifyData.buyerName,
        amountGHS:     event.amountCedis,
        providerRef:   event.reference,
        installmentSeq: notifyData.installmentSeq,
        currency:      notifyData.currency,
        receivedAt:    new Date().toISOString(),
      }).catch((err) => console.error("[notify] Receipt fire-and-forget error:", err))
    }
  }

  // Always return 200 to Paystack — any non-2xx triggers a retry
  return NextResponse.json({ received: true })
}
