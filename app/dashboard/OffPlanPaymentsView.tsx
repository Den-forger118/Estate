"use client";

import { useEffect, useState } from "react";
import { formatGHS } from "../../lib/formatters";
import { showToast } from "../components/Toast";
import type { Payment } from "../data/types";

const RECON_CLASS: Record<string, string> = {
  MATCHED:   "status-success",
  MANUAL:    "status-warning",
  UNMATCHED: "status-error",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export function OffPlanPaymentsView() {
  const [payments, setPayments]           = useState<Payment[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [reconId, setReconId]             = useState<string | null>(null);
  const [installmentInput, setInstInput]  = useState("");
  const [reconning, setReconning]         = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/payments");
      if (!res.ok) throw new Error("Failed to load payments");
      setPayments(await res.json() as Payment[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function manualReconcile(paymentId: string) {
    if (!installmentInput.trim()) {
      showToast("Enter an installment ID first", "error"); return;
    }
    setReconning(true);
    try {
      const res = await fetch(`/api/v1/payments/${paymentId}/reconcile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ installmentId: installmentInput.trim() }),
      });
      const d = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) { showToast(d.error ?? "Reconciliation failed", "error"); return; }
      showToast("Payment reconciled", "success");
      setReconId(null);
      setInstInput("");
      await load();
    } catch {
      showToast("Network error", "error");
    } finally {
      setReconning(false);
    }
  }

  const unmatched  = payments.filter((p) => p.reconStatus === "UNMATCHED");
  const totalGHS   = payments.filter((p) => p.reconStatus !== "UNMATCHED")
    .reduce((s, p) => s + p.amount, 0);

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Payments</span>
          <h1>Off-Plan Payments</h1>
          <p>Received via Paystack — matched, manual, and unmatched.</p>
        </div>
        <div className="dashboard-actions">
          <button className="btn btn-secondary" type="button" onClick={load} disabled={loading}>
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="dashboard-kpi-grid">
        <article className="dashboard-card kpi-card">
          <div><span>Total Received</span>
            <strong className="font-data-lg">{payments.length}</strong></div>
          <small>All-time payments</small>
        </article>
        <article className="dashboard-card kpi-card">
          <div><span>Collected (GHS)</span>
            <strong className="font-data-lg">{formatGHS(totalGHS)}</strong></div>
          <small>Matched + manual only</small>
        </article>
        <article className="dashboard-card kpi-card">
          <div><span>Unmatched</span>
            <strong className="font-data-lg" style={{ color: unmatched.length ? "var(--error, #c0392b)" : undefined }}>
              {unmatched.length}
            </strong></div>
          <small>{unmatched.length ? "Needs ops attention" : "Queue clear"}</small>
        </article>
      </div>

      {/* Unmatched queue */}
      {unmatched.length > 0 && (
        <div className="dashboard-card" style={{ marginBottom: "1.5rem", borderLeft: "4px solid var(--error, #c0392b)" }}>
          <h2 style={{ padding: "1rem 1rem 0.5rem", color: "var(--error, #c0392b)" }}>
            Reconciliation Queue ({unmatched.length})
          </h2>
          <table className="zebra-rows">
            <thead>
              <tr><th>Reference</th><th>Amount</th><th>Channel</th><th>Received</th><th>Action</th></tr>
            </thead>
            <tbody>
              {unmatched.map((p) => (
                <tr key={p.id}>
                  <td><code style={{ fontSize: "0.8rem" }}>{p.providerRef}</code></td>
                  <td className="font-data-md">{formatGHS(p.amount)}</td>
                  <td className="meta">{p.channel}</td>
                  <td className="meta">{fmt(p.receivedAt)}</td>
                  <td>
                    {reconId === p.id ? (
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                        <input
                          type="text"
                          placeholder="Installment UUID"
                          value={installmentInput}
                          onChange={(e) => setInstInput(e.target.value)}
                          style={{ fontSize: "0.8rem", padding: "0.25rem 0.5rem", flex: "1 1 200px" }}
                        />
                        <button className="btn btn-primary" type="button"
                          style={{ fontSize: "0.8rem", minHeight: 32 }}
                          disabled={reconning}
                          onClick={() => manualReconcile(p.id)}>
                          {reconning ? "Saving…" : "Apply"}
                        </button>
                        <button className="btn btn-secondary" type="button"
                          style={{ fontSize: "0.8rem", minHeight: 32 }}
                          onClick={() => { setReconId(null); setInstInput(""); }}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button className="btn btn-secondary" type="button"
                        style={{ fontSize: "0.8rem", minHeight: 32 }}
                        onClick={() => { setReconId(p.id); setInstInput(""); }}>
                        Reconcile
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* All payments */}
      {error && <p className="form-error" style={{ marginBottom: "1rem" }}>{error}</p>}
      <div className="dashboard-card table-card">
        {loading ? (
          <p className="meta" style={{ padding: "1.5rem" }}>Loading payments…</p>
        ) : payments.length === 0 ? (
          <p className="meta" style={{ padding: "1.5rem" }}>No payments received yet.</p>
        ) : (
          <table className="zebra-rows">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Amount</th>
                <th>Channel</th>
                <th>Status</th>
                <th>Received</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td><code style={{ fontSize: "0.8rem" }}>{p.providerRef}</code></td>
                  <td className="font-data-md">{formatGHS(p.amount)}</td>
                  <td className="meta">{p.channel}</td>
                  <td>
                    <span className={`status-chip ${RECON_CLASS[p.reconStatus] ?? ""}`}>
                      {p.reconStatus}
                    </span>
                  </td>
                  <td className="meta">{fmt(p.receivedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
