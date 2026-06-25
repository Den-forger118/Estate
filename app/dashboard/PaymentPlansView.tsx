"use client";

import { FormEvent, useEffect, useState } from "react";
import { getBuyers, getUnits, getPaymentPlan, getMilestones, createPaymentPlan } from "../../lib/api-client";
import type { Buyer, Unit, PaymentPlan, Installment, Milestone } from "../data/types";
import { formatGHS, formatCurrency, formatDate } from "../../lib/formatters";
import { showToast } from "../components/Toast";
import { statusClassForLabel } from "../components/statusBadge";

function getInstallmentStatusClass(status: string): string {
  const map: Record<string, string> = {
    PAID: "success",
    DUE: "warning",
    OVERDUE: "error",
    PARTIAL: "info",
    PENDING: "default",
  };
  return map[status] || "default";
}

type PlanMap = Map<string, { plan: PaymentPlan; installments: Installment[] }>;

// ─── Create Plan Form ────────────────────────────────────────────────────────

function CreatePlanForm({
  buyers,
  availableUnits,
  onDone,
}: {
  buyers: Buyer[]
  availableUnits: Unit[]
  onDone: () => void
}) {
  const [selectedBuyerId, setSelectedBuyerId] = useState("")
  const [selectedUnitId, setSelectedUnitId] = useState("")
  const [downPayment, setDownPayment] = useState("")
  const [numInstallments, setNumInstallments] = useState("3")
  const [installmentAmount, setInstallmentAmount] = useState("")
  const [currency, setCurrency] = useState<"GHS" | "USD">("GHS")
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!selectedBuyerId || !selectedUnitId) {
      showToast("Select a buyer and unit", "error")
      return
    }
    const dp = parseFloat(downPayment)
    const ia = parseFloat(installmentAmount)
    const n = parseInt(numInstallments)
    if (isNaN(dp) || dp < 0) { showToast("Invalid down payment", "error"); return }
    if (isNaN(ia) || ia <= 0 || isNaN(n) || n < 1) { showToast("Invalid installment terms", "error"); return }

    setSubmitting(true)
    try {
      const installments = Array.from({ length: n }, (_, i) => ({
        sequence: i + 1,
        amount: ia,
      }))
      await createPaymentPlan(selectedUnitId, {
        buyerId: selectedBuyerId,
        downPayment: dp,
        currency,
        zeroInterest: true,
        installments,
      })
      showToast("Payment plan created", "success")
      onDone()
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create plan", "error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="dashboard-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }} onSubmit={handleSubmit}>
      <h2 style={{ marginBottom: "1rem" }}>Assign Unit + Create Payment Plan</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <label>
          Buyer
          <select value={selectedBuyerId} onChange={(e) => setSelectedBuyerId(e.target.value)} required>
            <option value="">Select buyer…</option>
            {buyers.map((b) => (
              <option key={b.id} value={b.id}>{b.fullName} {b.email ? `— ${b.email}` : ""}</option>
            ))}
          </select>
        </label>
        <label>
          Available unit
          <select value={selectedUnitId} onChange={(e) => setSelectedUnitId(e.target.value)} required>
            <option value="">Select unit…</option>
            {availableUnits.map((u) => (
              <option key={u.id} value={u.id}>{u.code} — {formatGHS(u.priceTotal)}</option>
            ))}
          </select>
        </label>
        <label>
          Down payment ({currency})
          <input type="number" min="0" step="0.01" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} placeholder="e.g. 85500" required />
        </label>
        <label>
          Currency
          <select value={currency} onChange={(e) => setCurrency(e.target.value as "GHS" | "USD")}>
            <option value="GHS">GHS</option>
            <option value="USD">USD</option>
          </select>
        </label>
        <label>
          Number of installments
          <input type="number" min="1" max="60" value={numInstallments} onChange={(e) => setNumInstallments(e.target.value)} required />
        </label>
        <label>
          Amount per installment ({currency})
          <input type="number" min="0.01" step="0.01" value={installmentAmount} onChange={(e) => setInstallmentAmount(e.target.value)} placeholder="e.g. 33166" required />
        </label>
      </div>
      <p className="meta" style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>
        Total = down payment + (installments × amount). Due dates can be set per-installment after creation.
      </p>
      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Create plan"}
        </button>
        <button className="btn btn-secondary" type="button" onClick={onDone}>Cancel</button>
      </div>
    </form>
  )
}

export function PaymentPlansView() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [allUnits, setAllUnits] = useState<Unit[]>([]);
  const [planMap, setPlanMap] = useState<PlanMap>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [planData, setPlanData] = useState<{
    plan: PaymentPlan;
    installments: Installment[];
  } | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [buyersData, unitsData] = await Promise.all([getBuyers(), getUnits()]);
        const activeUnits = unitsData.filter(
          (u) => u.status === "SOLD" || u.status === "RESERVED",
        );
        setBuyers(buyersData);
        setAllUnits(unitsData);
        setUnits(activeUnits);

        // Batch-fetch all plans so summary KPIs and down payment column are real
        const plans = await Promise.all(activeUnits.map((u) => getPaymentPlan(u.id)));
        const map: PlanMap = new Map();
        activeUnits.forEach((u, i) => {
          const p = plans[i];
          if (p) map.set(u.id, p);
        });
        setPlanMap(map);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (selectedUnit) {
      const unitId = selectedUnit; // capture before async to satisfy TypeScript closure narrowing
      async function loadPlan() {
        try {
          const unit = units.find((u) => u.id === unitId);
          if (!unit) return;

          const [plan, projectMilestones] = await Promise.all([
            getPaymentPlan(unitId),
            getMilestones(unit.projectId),
          ]);
          setPlanData(plan);
          setMilestones(projectMilestones);
        } catch (err) {
          showToast("Failed to load payment plan", "error");
        }
      }
      loadPlan();
    } else {
      setPlanData(null);
      setMilestones([]);
    }
  }, [selectedUnit, units]);

  if (loading) {
    return (
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Payment Plans</span>
          <h1>Loading payment plans...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Payment Plans</span>
          <h1>Error</h1>
          <p className="form-error">{error}</p>
        </div>
      </div>
    );
  }

  const buyerMap = new Map(buyers.map((b) => [b.id, b]));

  const selectedUnitData = selectedUnit ? units.find((u) => u.id === selectedUnit) : null;
  const selectedBuyer = selectedUnitData?.buyerId
    ? buyerMap.get(selectedUnitData.buyerId)
    : null;

  const totalPaid = planData?.installments.reduce((sum, i) => sum + i.paidAmount, 0) || 0;
  const totalDue = planData?.plan.totalAmount || 0;
  const percentPaid = totalDue > 0 ? (totalPaid / totalDue) * 100 : 0;

  // Computed from real plan data
  const overdueCount = [...planMap.values()].reduce(
    (sum, { installments }) => sum + installments.filter((i) => i.status === "OVERDUE").length,
    0,
  );
  const zeroInterestCount = [...planMap.values()].filter(({ plan }) => plan.zeroInterest).length;

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Payment Plans</span>
          <h1>Installment Schedules</h1>
          <p>Milestone-linked payment plans for off-plan units.</p>
        </div>
        <div className="dashboard-actions">
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => setShowCreate((v) => !v)}
          >
            {showCreate ? "Cancel" : "Assign Unit + Create Plan"}
          </button>
        </div>
      </div>

      {showCreate && (
        <CreatePlanForm
          buyers={buyers}
          availableUnits={allUnits.filter((u) => u.status === "AVAILABLE")}
          onDone={async () => {
            setShowCreate(false);
            setLoading(true);
            try {
              const [buyersData, unitsData] = await Promise.all([getBuyers(), getUnits()]);
              const activeUnits = unitsData.filter((u) => u.status === "SOLD" || u.status === "RESERVED");
              setBuyers(buyersData);
              setAllUnits(unitsData);
              setUnits(activeUnits);
              const plans = await Promise.all(activeUnits.map((u) => getPaymentPlan(u.id)));
              const map: PlanMap = new Map();
              activeUnits.forEach((u, i) => { const p = plans[i]; if (p) map.set(u.id, p); });
              setPlanMap(map);
            } catch { /* ignore */ } finally { setLoading(false); }
          }}
        />
      )}

      <div className="dashboard-kpi-grid">
        <article className="dashboard-card kpi-card">
          <div>
            <span>Active Plans</span>
            <strong className="font-data-lg">{units.length}</strong>
          </div>
          <small>Off-plan units with buyers</small>
        </article>
        <article className="dashboard-card kpi-card">
          <div>
            <span>Total Value</span>
            <strong className="font-data-lg">
              {formatGHS(units.reduce((sum, u) => sum + u.priceTotal, 0))}
            </strong>
          </div>
          <small>Across all plans</small>
        </article>
        <article className="dashboard-card kpi-card">
          <div>
            <span>Overdue</span>
            <strong className="font-data-lg">{overdueCount}</strong>
          </div>
          <small>Installments past due date</small>
        </article>
        <article className="dashboard-card kpi-card">
          <div>
            <span>Zero Interest</span>
            <strong className="font-data-lg">{zeroInterestCount}</strong>
          </div>
          <small>Interest-free plans</small>
        </article>
      </div>

      <div className="dashboard-card table-card">
        <table className="zebra-rows">
          <thead>
            <tr>
              <th>Unit Code</th>
              <th>Buyer</th>
              <th>Total Price</th>
              <th>Down Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {units.map((unit) => {
              const buyer = unit.buyerId ? buyerMap.get(unit.buyerId) : null;
              return (
                <tr key={unit.id}>
                  <td>
                    <strong className="font-data-md">{unit.code}</strong>
                  </td>
                  <td>{buyer?.fullName || "—"}</td>
                  <td className="font-data-md">{formatGHS(unit.priceTotal)}</td>
                  <td className="font-data-md">
                    {formatGHS(planMap.get(unit.id)?.plan.downPayment ?? Math.round(unit.priceTotal * 0.3))}
                  </td>
                  <td>
                    <span className={`status-chip status-${unit.status.toLowerCase()}`}>
                      {unit.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => setSelectedUnit(unit.id)}
                    >
                      View Plan
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedUnitData && planData && (
        <div className="dashboard-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1.5rem" }}>
            <div>
              <h2>Payment Plan: {selectedUnitData.code}</h2>
              <p className="meta">
                Buyer: {selectedBuyer?.fullName} • {selectedBuyer?.phone}
              </p>
            </div>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => setSelectedUnit(null)}
            >
              Close
            </button>
          </div>

          <div className="dashboard-kpi-grid">
            <article className="dashboard-card kpi-card">
              <div>
                <span>Total Amount</span>
                <strong className="font-data-lg">
                  {formatCurrency(planData.plan.totalAmount, planData.plan.currency as "GHS" | "USD")}
                </strong>
              </div>
              <small>{planData.plan.zeroInterest ? "Zero interest" : "With interest"}</small>
            </article>
            <article className="dashboard-card kpi-card">
              <div>
                <span>Down Payment</span>
                <strong className="font-data-lg">
                  {formatCurrency(planData.plan.downPayment, planData.plan.currency as "GHS" | "USD")}
                </strong>
              </div>
              <small>{Math.round((planData.plan.downPayment / planData.plan.totalAmount) * 100)}% of total</small>
            </article>
            <article className="dashboard-card kpi-card">
              <div>
                <span>Paid to Date</span>
                <strong className="font-data-lg">
                  {formatCurrency(totalPaid, planData.plan.currency as "GHS" | "USD")}
                </strong>
              </div>
              <small>{percentPaid.toFixed(1)}% complete</small>
            </article>
            <article className="dashboard-card kpi-card">
              <div>
                <span>Installments</span>
                <strong className="font-data-lg">{planData.installments.length}</strong>
              </div>
              <small>
                {planData.installments.filter((i) => i.status === "PAID").length} paid
              </small>
            </article>
          </div>

          <h3 style={{ marginTop: "1.5rem", marginBottom: "0.75rem" }}>Installment Schedule</h3>
          <div className="dashboard-card table-card">
            <table className="zebra-rows">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Linked Milestone</th>
                  <th>Status</th>
                  <th>Paid Amount</th>
                  <th>Paid Date</th>
                </tr>
              </thead>
              <tbody>
                {planData.installments.map((inst) => {
                  const linkedMilestone = inst.linkedMilestoneId
                    ? milestones.find((m) => m.id === inst.linkedMilestoneId)
                    : null;
                  return (
                    <tr key={inst.id}>
                      <td>{inst.sequence}</td>
                      <td className="font-data-md">
                        {formatCurrency(inst.amount, planData.plan.currency as "GHS" | "USD")}
                      </td>
                      <td>{inst.dueDate ? formatDate(inst.dueDate) : "—"}</td>
                      <td>
                        {linkedMilestone ? (
                          <>
                            {linkedMilestone.name}
                            <br />
                            <span className={`status-chip status-${linkedMilestone.status.toLowerCase().replace("_", "-")}`}>
                              {linkedMilestone.status.replace("_", " ")}
                            </span>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <span className={`status-chip status-${getInstallmentStatusClass(inst.status)}`}>
                          {inst.status}
                        </span>
                      </td>
                      <td className="font-data-md">
                        {inst.paidAmount > 0
                          ? formatCurrency(inst.paidAmount, planData.plan.currency as "GHS" | "USD")
                          : "—"}
                      </td>
                      <td>{inst.paidAt ? formatDate(inst.paidAt) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
