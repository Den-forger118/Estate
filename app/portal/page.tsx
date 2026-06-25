import { redirect } from "next/navigation"
import { requireUser } from "@/lib/auth"
import { findBuyerByIdRaw } from "@/lib/repos/buyers"
import { findUnitByBuyer } from "@/lib/repos/units"
import { findProjectById } from "@/lib/repos/projects"
import { findPaymentPlanByUnit, findInstallmentsByPlan } from "@/lib/repos/paymentPlans"
import { findMilestonesByProject } from "@/lib/repos/milestones"
import { findDocumentsByUnit } from "@/lib/repos/documents"
import { formatGHS } from "@/lib/formatters"
import { statusClassForLabel } from "@/app/components/statusBadge"
import { SignOutButton } from "./SignOutButton"
import { PayNowButton } from "./PayNowButton"

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

  if (!buyerId) redirect("/login?error=no-buyer-record")

  const rawBuyer = await findBuyerByIdRaw(buyerId)
  if (!rawBuyer) redirect("/login?error=buyer-not-found")

  const developerId = rawBuyer.developerId

  const unit = await findUnitByBuyer(buyerId, developerId)
  if (!unit) {
    return (
      <PortalShell email={email}>
        <div className="dashboard-card" style={{ padding: "2rem", textAlign: "center" }}>
          <h2>No unit linked</h2>
          <p className="meta">Your account is not yet linked to a unit. Please contact your developer.</p>
        </div>
      </PortalShell>
    )
  }

  const [project, paymentPlan] = await Promise.all([
    findProjectById(unit.projectId, developerId),
    findPaymentPlanByUnit(unit.id, developerId),
  ])

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
