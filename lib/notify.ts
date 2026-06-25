/**
 * Notification seam — decoupled from the payment transaction.
 * Callers fire-and-forget; failures are logged, never thrown.
 *
 * Email: Resend (RESEND_API_KEY env var required).
 * SMS:   Stub — wire a real provider (Twilio, Termii, etc.) when ready.
 */

import { Resend } from "resend"
import { formatGHS } from "./formatters"

export interface ReceiptParams {
  buyerEmail:    string
  buyerName:     string
  amountGHS:     number
  providerRef:   string
  installmentSeq: number
  currency:      string
  receivedAt:    string // ISO
}

export interface ReminderParams {
  buyerPhone: string
  buyerName:  string
  amountGHS:  number
  dueDate:    string // ISO
  planRef:    string
}

// ── Email ────────────────────────────────────────────────────────────────────

function buildReceiptHtml(p: ReceiptParams): string {
  const date = new Date(p.receivedAt).toLocaleString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "Africa/Accra",
  })
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Payment Receipt</title></head>
<body style="font-family:sans-serif;color:#1a1a1a;max-width:560px;margin:0 auto;padding:24px">
  <h2 style="margin-bottom:4px">Payment Received</h2>
  <p style="color:#666;margin-top:0">Thank you, ${p.buyerName}</p>
  <table style="width:100%;border-collapse:collapse;margin:24px 0">
    <tr style="border-bottom:1px solid #eee">
      <td style="padding:10px 0;color:#666">Amount</td>
      <td style="padding:10px 0;text-align:right;font-weight:600;font-size:1.1em">
        ${formatGHS(p.amountGHS)}
      </td>
    </tr>
    <tr style="border-bottom:1px solid #eee">
      <td style="padding:10px 0;color:#666">Installment</td>
      <td style="padding:10px 0;text-align:right">#${p.installmentSeq}</td>
    </tr>
    <tr style="border-bottom:1px solid #eee">
      <td style="padding:10px 0;color:#666">Reference</td>
      <td style="padding:10px 0;text-align:right;font-family:monospace;font-size:0.9em">
        ${p.providerRef}
      </td>
    </tr>
    <tr>
      <td style="padding:10px 0;color:#666">Date</td>
      <td style="padding:10px 0;text-align:right">${date}</td>
    </tr>
  </table>
  <p style="color:#666;font-size:0.85em">
    Log in to your buyer portal to view your updated payment schedule.
  </p>
</body>
</html>`
}

export async function sendPaymentReceipt(params: ReceiptParams): Promise<void> {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn("[notify] RESEND_API_KEY not set — skipping receipt email")
    return
  }

  const fromAddress = process.env.NOTIFY_FROM_EMAIL ?? "receipts@mail.specialgardens.com"

  try {
    const resend = new Resend(key)
    const { error } = await resend.emails.send({
      from: fromAddress,
      to:   params.buyerEmail,
      subject: `Payment received — Installment #${params.installmentSeq} (${formatGHS(params.amountGHS)})`,
      html: buildReceiptHtml(params),
    })
    if (error) {
      console.error("[notify] Resend error:", error)
    } else {
      console.log(`[notify] Receipt sent to ${params.buyerEmail} for ${params.providerRef}`)
    }
  } catch (err) {
    console.error("[notify] Failed to send receipt email:", err)
  }
}

// ── Set-password email ────────────────────────────────────────────────────────

export interface SetPasswordParams {
  buyerEmail: string
  buyerName:  string
  setPasswordUrl: string // full URL including token
}

function buildSetPasswordHtml(p: SetPasswordParams): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Set up your buyer account</title></head>
<body style="font-family:sans-serif;color:#1a1a1a;max-width:560px;margin:0 auto;padding:24px">
  <h2 style="margin-bottom:4px">Welcome to Special Gardens</h2>
  <p style="color:#666;margin-top:0">Hello, ${p.buyerName}</p>
  <p>Your buyer account has been created. Click the button below to set your password and access your buyer portal.</p>
  <p style="margin:32px 0;text-align:center">
    <a href="${p.setPasswordUrl}"
       style="background:#1a1a1a;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block">
      Set up your account
    </a>
  </p>
  <p style="color:#666;font-size:0.85em">
    This link expires in 48 hours. If you didn't expect this email, you can safely ignore it.
  </p>
  <p style="color:#999;font-size:0.8em;border-top:1px solid #eee;padding-top:16px;margin-top:32px">
    Special Gardens Estate &mdash; Off-Plan Property Platform
  </p>
</body>
</html>`
}

export async function sendSetPasswordEmail(params: SetPasswordParams): Promise<void> {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.log(
      `[notify] RESEND_API_KEY not set — set-password link for ${params.buyerEmail}: ${params.setPasswordUrl}`,
    )
    return
  }

  const fromAddress = process.env.NOTIFY_FROM_EMAIL ?? "onboarding@mail.specialgardens.com"

  try {
    const resend = new Resend(key)
    const { error } = await resend.emails.send({
      from:    fromAddress,
      to:      params.buyerEmail,
      subject: "Set up your Special Gardens buyer account",
      html:    buildSetPasswordHtml(params),
    })
    if (error) {
      console.error("[notify] Resend error (set-password):", error)
    } else {
      console.log(`[notify] Set-password email sent to ${params.buyerEmail}`)
    }
  } catch (err) {
    console.error("[notify] Failed to send set-password email:", err)
  }
}

// ── SMS (stub) ────────────────────────────────────────────────────────────────
// TODO: wire a real SMS provider (Twilio, Termii, Hubtel, etc.) here.
//       Params are ready; just replace the log with an API call.
export async function sendPaymentReminderSMS(params: ReminderParams): Promise<void> {
  console.log(
    `[notify][SMS-STUB] Reminder → ${params.buyerPhone}: ` +
    `${formatGHS(params.amountGHS)} due ${params.dueDate} — plan ${params.planRef}`
  )
}
