import { redirect } from "next/navigation"
import { requireUser } from "@/lib/auth"
import { findBuyerByIdRaw } from "@/lib/repos/buyers"
import { findUnitByBuyer } from "@/lib/repos/units"
import { findProjectById } from "@/lib/repos/projects"
import { findPaymentPlanByUnit, findInstallmentsByPlan } from "@/lib/repos/paymentPlans"
import { findMilestonesByProject } from "@/lib/repos/milestones"
import { findDocumentsByUnit } from "@/lib/repos/documents"
import { findPaymentByProviderRef, receiveAndReconcile } from "@/lib/repos/payments"
import { getPaymentProvider } from "@/lib/payments"
import { formatGHS } from "@/lib/formatters"
import { statusClassForLabel } from "@/app/components/statusBadge"
import { SignOutButton } from "./SignOutButton"
import { PayNowButton } from "./PayNowButton"

/**
 * Verify-on-return: called when the buyer lands back on /portal?payment=done&reference=...
 *
 * Calls Paystack's Transaction Verify API server-side (never trusts the client's word),
 * then runs the same receiveAndReconcile path used by the webhook.
 * Idempotent: if the webhook already processed this reference, findPaymentByProviderRef
 * returns early so no duplicate Payment row is created.
 */
async function runVerifyOnReturn(reference: string, developerId: string): Promise<void> {
  // Fast idempotency check — skip the Paystack API call entirely if already reconciled
  const existing = await findPaymentByProviderRef(reference, developerId)
  if (existing) return

  const provider = getPaymentProvider()
  const event = await provider.verifyTransaction(reference)
  if (!event) return  // not a successful charge

  // Mirror the same installmentId extraction used by the webhook handler
  const fromMeta = event.metadata.installmentId
  const installmentId =
    typeof fromMeta === "string" && fromMeta.length > 0
      ? fromMeta
      : (event.reference.match(/^PAY-([0-9a-f-]{36})-[0-9a-f]+$/i)?.[1] ?? null)

  await receiveAndReconcile({
    developerId,
    providerRef:   event.reference,
    amount:        event.amountCedis,
    channel:       event.channel,
    rawPayload:    event.rawPayload,
    installmentId,
  })
}

function fmt(date?: string | null) {
  if (!date) return "—"
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export default async function BuyerPortalPage(
  { searchParams }: { searchParams: Promise<Record<string, string>> }
) {
  const session = await requireUser(["BUYER"])
  const { buyerId, email } = session.user
  const sp = await searchParams
  const paymentDone = sp.payment === "done"
  const returnReference = typeof sp.reference === "string" ? sp.reference : null

  if (!buyerId) redirect("/login?error=no-buyer-record")

  const rawBuyer = await findBuyerByIdRaw(buyerId)
  if (!rawBuyer) redirect("/login?error=buyer-not-found")

  const developerId = rawBuyer.developerId

  const unit = await findUnitByBuyer(buyerId, developerId)
  if (!unit) {
    return (
      <PortalShell email={email}>
        <div className="dashboard-card" style={{ padding: "2rem", textAlign: "center" }}>
          <h2>Your payment plan is being set up</h2>
          <p className="meta" style={{ maxWidth: "400px", margin: "0.75rem auto 0" }}>
            Your buyer account is active. Our sales team is finalising your unit assignment and
            payment schedule — you will receive confirmation within one business day.
          </p>
          <p className="meta" style={{ marginTop: "0.5rem" }}>
            Questions? Contact us at{" "}
            <a href="mailto:sales@specialgardens.com">sales@specialgardens.com</a>.
          </p>
        </div>
      </PortalShell>
    )
  }

  const [project, paymentPlan] = await Promise.all([
    findProjectById(unit.projectId, developerId),
    findPaymentPlanByUnit(unit.id, developerId),
  ])

  // No payment plan yet — unit exists but plan hasn't been created
  if (!paymentPlan) {
    return (
      <PortalShell email={email}>
        <div className="dashboard-card" style={{ padding: "2rem", textAlign: "center" }}>
          <h2>Your payment plan is being set up</h2>
          <p className="meta" style={{ maxWidth: "440px", margin: "0.75rem auto 0" }}>
            Your unit <strong>{unit.code}</strong> has been reserved for you.
            Our sales team is finalising your installment schedule — it will appear here shortly.
          </p>
          <p className="meta" style={{ marginTop: "0.5rem" }}>
            Questions? Contact us at{" "}
            <a href="mailto:sales@specialgardens.com">sales@specialgardens.com</a>.
          </p>
        </div>
      </PortalShell>
    )
  }

  // Verify-on-return: if the buyer just completed a payment, confirm it server-side
  // with Paystack's verify API and reconcile before loading installments so the
  // page renders the updated status immediately. Errors are non-fatal.
  if (paymentDone && returnReference) {
    await runVerifyOnReturn(returnReference, developerId).catch((err) =>
      console.error("[verify-on-return]", err),
    )
  }

  const [installments, milestones, documents] = await Promise.all([
    paymentPlan ? findInstallmentsByPlan(paymentPlan.id) : Promise.resolve([]),
    findMilestonesByProject(unit.projectId),
    findDocumentsByUnit(unit.id),
  ])

  const totalPaid = installments.reduce((s, i) => s + i.paidAmount, 0)
  const totalDue = paymentPlan?.totalAmount ?? 0
  const pctPaid = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0
  const firstName = rawBuyer.fullName.split(" ")[0]

  return (
    <PortalShell email={email}>
      {/* ── Payment return banner ── */}
      {paymentDone && (
        <div
          role="status"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--brand)",
            borderRadius: "8px",
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>✓</span>
          <div>
            <strong>Payment submitted</strong>
            <p className="meta" style={{ margin: 0 }}>
              Your payment is being processed. This page will reflect the updated status once confirmed — usually within a few seconds.
            </p>
          </div>
        </div>
      )}

      {/* ── Unit hero ── */}
      <div className="dashboard-card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <span className="eyebrow">Your Property</span>
            <h1 style={{ margin: "0.25rem 0 0.5rem" }}>
              {unit.code}
              {unit.type ? ` — ${unit.type}` : ""}
            </h1>
            <p className="meta">{project?.name ?? "—"} · {project?.location ?? ""}</p>
          </div>
          <span className={`status-chip ${statusClassForLabel(unit.status)}`}>{unit.status}</span>
        </div>
      </div>

      {/* ── Payment KPIs ── */}
      <div className="dashboard-kpi-grid" style={{ marginBottom: "1.5rem" }}>
        <article className="dashboard-card kpi-card">
          <div>
            <span>Total Price</span>
            <strong className="font-data-lg">{formatGHS(totalDue)}</strong>
          </div>
          <small>{paymentPlan?.currency ?? "GHS"} · {paymentPlan?.zeroInterest ? "Zero interest" : "With interest"}</small>
        </article>
        <article className="dashboard-card kpi-card">
          <div>
            <span>Down Payment</span>
            <strong className="font-data-lg">{paymentPlan ? formatGHS(paymentPlan.downPayment) : "—"}</strong>
          </div>
          <small>
            {paymentPlan && totalDue > 0
              ? `${Math.round((paymentPlan.downPayment / totalDue) * 100)}% of total`
              : ""}
          </small>
        </article>
        <article className="dashboard-card kpi-card">
          <div>
            <span>Paid to Date</span>
            <strong className="font-data-lg">{formatGHS(totalPaid)}</strong>
          </div>
          <small>{pctPaid}% complete</small>
        </article>
        <article className="dashboard-card kpi-card">
          <div>
            <span>Remaining</span>
            <strong className="font-data-lg">{formatGHS(Math.max(0, totalDue - totalPaid))}</strong>
          </div>
          <small>
            {installments.filter((i) => i.status === "PENDING" || i.status === "DUE").length} installments pending
          </small>
        </article>
      </div>

      {/* ── Progress bar ── */}
      <div className="dashboard-card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <span>Payment progress</span>
          <strong>{pctPaid}%</strong>
        </div>
        <div style={{ height: "8px", borderRadius: "4px", background: "var(--border)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${pctPaid}%`,
              background: "var(--brand)",
              borderRadius: "4px",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* ── Installment schedule ── */}
      {installments.length > 0 && (
        <section className="dashboard-card table-card" style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ padding: "1rem 1rem 0" }}>Installment Schedule</h2>
          <table className="zebra-rows">
            <thead>
              <tr>
                <th>#</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Paid</th>
                <th>Paid On</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {installments.map((inst) => (
                <tr key={inst.id}>
                  <td>{inst.sequence}</td>
                  <td className="font-data-md">{formatGHS(inst.amount)}</td>
                  <td>{fmt(inst.dueDate)}</td>
                  <td>
                    <span className={`status-chip status-${inst.status.toLowerCase()}`}>
                      {inst.status}
                    </span>
                  </td>
                  <td className="font-data-md">
                    {inst.paidAmount > 0 ? formatGHS(inst.paidAmount) : "—"}
                  </td>
                  <td>{fmt(inst.paidAt)}</td>
                  <td>
                    <PayNowButton installmentId={inst.id} status={inst.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* ── Construction milestones ── */}
      {milestones.length > 0 && (
        <section style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ marginBottom: "0.75rem" }}>Construction Progress</h2>
          <div className="dashboard-kpi-grid">
            {milestones.map((m) => (
              <article className="dashboard-card kpi-card" key={m.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontWeight: 600 }}>{m.name}</span>
                  <span className={`status-chip ${statusClassForLabel(m.status)}`} style={{ fontSize: "0.7rem" }}>
                    {m.status.replace("_", " ")}
                  </span>
                </div>
                <small style={{ marginTop: "0.5rem", display: "block" }}>
                  {m.status === "COMPLETED"
                    ? `Completed ${fmt(m.completedAt)}`
                    : m.targetDate
                      ? `Target: ${fmt(m.targetDate)}`
                      : "Not yet scheduled"}
                </small>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── Documents ── */}
      {documents.length > 0 && (
        <section className="dashboard-card" style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ padding: "1rem 1rem 0.5rem" }}>Your Documents</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: "0 1rem 1rem" }}>
            {documents.map((doc) => (
              <li
                key={doc.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div>
                  <strong>{doc.type.replace(/_/g, " ")}</strong>
                  <p className="meta" style={{ margin: 0 }}>Uploaded {fmt(doc.uploadedAt)} · v{doc.version}</p>
                </div>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                  style={{ fontSize: "0.8rem" }}
                >
                  View
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {documents.length === 0 && milestones.length === 0 && (
        <p className="meta">No additional information available yet. Check back as construction progresses.</p>
      )}
    </PortalShell>
  )
}

function PortalShell({ email, children }: { email: string; children: React.ReactNode }) {
  const firstName = email.split("@")[0]

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 2rem",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
        }}
      >
        <div>
          <strong style={{ fontSize: "1.1rem" }}>Special Gardens</strong>
          <span className="meta" style={{ marginLeft: "0.75rem" }}>Buyer Portal</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span className="meta">Welcome, {firstName}</span>
          <SignOutButton />
        </div>
      </header>
      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        {children}
      </main>
    </div>
  )
}
