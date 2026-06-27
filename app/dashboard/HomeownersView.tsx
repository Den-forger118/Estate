"use client";

import { useEffect, useState } from "react";
import { getUnits, getPaymentPlan, getBuyers } from "../../lib/api-client";
import type { Unit, Buyer, PaymentPlan, Installment } from "../data/types";
import { formatGHS, formatDate } from "../../lib/formatters";
import { showToast } from "../components/Toast";

type HomeownerEntry = {
  unit: Unit
  buyer: Buyer | undefined
  plan: { plan: PaymentPlan; installments: Installment[] } | null
  alreadyGranted: boolean | null  // null = unknown (grant endpoint returns idempotent 200)
}

export function HomeownersView() {
  const [entries, setEntries] = useState<HomeownerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [granting, setGranting] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [units, buyers] = await Promise.all([getUnits(), getBuyers()])
        const buyerMap = new Map(buyers.map((b) => [b.id, b]))
        const handedOver = units.filter((u) => u.status === "HANDED_OVER" && u.buyerId)

        const plans = await Promise.all(handedOver.map((u) => getPaymentPlan(u.id)))
        const result: HomeownerEntry[] = handedOver.map((u, i) => ({
          unit: u,
          buyer: u.buyerId ? buyerMap.get(u.buyerId) : undefined,
          plan: plans[i],
          alreadyGranted: null,
        }))
        setEntries(result)
      } catch {
        showToast("Failed to load homeowner data", "error")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleGrant(unitId: string) {
    setGranting(unitId)
    try {
      const res = await fetch(`/api/v1/units/${unitId}/grant-homeowner`, { method: "POST" })
      const body = await res.json() as { message?: string; error?: string; detail?: string }
      if (res.status === 200) {
        showToast(body.message ?? "Already granted", "info")
        setEntries((prev) =>
          prev.map((e) => e.unit.id === unitId ? { ...e, alreadyGranted: true } : e),
        )
      } else if (res.status === 201) {
        showToast(body.message ?? "Homeowner access granted", "success")
        setEntries((prev) =>
          prev.map((e) => e.unit.id === unitId ? { ...e, alreadyGranted: true } : e),
        )
      } else {
        showToast(body.error ?? body.detail ?? "Failed to grant access", "error")
      }
    } catch {
      showToast("Request failed", "error")
    } finally {
      setGranting(null)
    }
  }

  function isEligible(entry: HomeownerEntry): boolean {
    if (!entry.plan) return false
    return entry.plan.installments.every((i) => i.status === "PAID")
  }

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Lifecycle</span>
          <h1>Homeowner Access</h1>
          <p>Grant portal access to buyers whose units have been handed over and fully paid.</p>
        </div>
      </div>

      {loading ? (
        <p className="meta" style={{ padding: "1rem" }}>Loading…</p>
      ) : entries.length === 0 ? (
        <div className="dashboard-card" style={{ padding: "2rem", textAlign: "center" }}>
          <p className="meta">No handed-over units with buyer links yet.</p>
        </div>
      ) : (
        <div className="dashboard-card table-card">
          <table className="zebra-rows">
            <thead>
              <tr>
                <th>Unit</th>
                <th>Buyer</th>
                <th>Total Paid</th>
                <th>Plan Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const eligible = isEligible(entry)
                const totalPaid = entry.plan?.installments.reduce((s, i) => s + i.paidAmount, 0) ?? 0
                const totalDue = entry.plan?.plan.totalAmount ?? 0
                const allPaid = eligible
                const isGranting = granting === entry.unit.id

                return (
                  <tr key={entry.unit.id}>
                    <td><strong className="font-data-md">{entry.unit.code}</strong></td>
                    <td>
                      {entry.buyer?.fullName ?? "—"}
                      {entry.buyer?.phone && (
                        <small className="meta" style={{ display: "block" }}>{entry.buyer.phone}</small>
                      )}
                    </td>
                    <td className="font-data-md">
                      {formatGHS(totalPaid)}
                      <small className="meta" style={{ display: "block" }}>
                        of {formatGHS(totalDue)}
                      </small>
                    </td>
                    <td>
                      <span className={`status-chip ${allPaid ? "status-success" : "status-warning"}`}>
                        {allPaid ? "Fully paid" : "Partially paid"}
                      </span>
                    </td>
                    <td>
                      {entry.alreadyGranted ? (
                        <span className="status-chip status-success">Granted</span>
                      ) : eligible ? (
                        <button
                          className="btn btn-primary"
                          type="button"
                          disabled={isGranting}
                          onClick={() => handleGrant(entry.unit.id)}
                          style={{ fontSize: "0.8rem" }}
                        >
                          {isGranting ? "Granting…" : "Grant homeowner access"}
                        </button>
                      ) : (
                        <span className="meta" style={{ fontSize: "0.8rem" }}>
                          Not eligible — payment outstanding
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
