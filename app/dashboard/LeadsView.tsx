"use client";

import { useEffect, useState } from "react";
import { showToast } from "../components/Toast";
import type { Lead, LeadStatus } from "../data/types";

const ALL_STATUSES: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "REJECTED"];

const STATUS_CLASS: Record<LeadStatus, string> = {
  NEW:        "status-info",
  CONTACTED:  "status-warning",
  QUALIFIED:  "status-success",
  CONVERTED:  "status-active",
  REJECTED:   "status-error",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

async function patchLead(id: string, body: object): Promise<Record<string, unknown>> {
  const res = await fetch(`/api/v1/leads/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as Record<string, unknown>).error as string ?? "Request failed");
  }
  return res.json() as Promise<Record<string, unknown>>;
}

export function LeadsView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "ALL">("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [acting, setActing] = useState(false);

  async function loadLeads() {
    setLoading(true);
    setError(null);
    try {
      const url = filterStatus === "ALL" ? "/api/v1/leads" : `/api/v1/leads?status=${filterStatus}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Could not load leads");
      setLeads(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadLeads(); }, [filterStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  async function setStatus(id: string, status: "CONTACTED" | "QUALIFIED" | "REJECTED") {
    setActing(true);
    try {
      const updated = await patchLead(id, { action: "setStatus", status }) as unknown as Lead;
      setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
      showToast(`Marked ${status.toLowerCase()}`, "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Action failed", "error");
    } finally {
      setActing(false);
    }
  }

  async function convertLead(id: string) {
    setActing(true);
    try {
      const result = await patchLead(id, { action: "convert" });
      // refresh list to pick up CONVERTED status
      await loadLeads();
      setSelectedId(null);
      showToast(`${String(result.fullName ?? "Lead")} converted to Buyer`, "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Conversion failed", "error");
    } finally {
      setActing(false);
    }
  }

  const selected = leads.find((l) => l.id === selectedId) ?? null;

  const counts = ALL_STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = leads.filter((l) => l.status === s).length;
    return acc;
  }, {});

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Sales</span>
          <h1>Leads</h1>
          <p>Website enquiries — qualify, follow up, and convert to buyers.</p>
        </div>
        <div className="dashboard-actions">
          <button className="btn btn-secondary" type="button" onClick={loadLeads} disabled={loading}>
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="dashboard-kpi-grid">
        {ALL_STATUSES.map((s) => (
          <article key={s} className="dashboard-card kpi-card">
            <div>
              <span>{s.charAt(0) + s.slice(1).toLowerCase()}</span>
              <strong className="font-data-lg">{counts[s] ?? 0}</strong>
            </div>
          </article>
        ))}
      </div>

      {/* Status filter */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        {(["ALL", ...ALL_STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            className={`btn ${filterStatus === s ? "btn-primary" : "btn-secondary"}`}
            style={{ minHeight: 32, padding: "0.25rem 0.75rem", fontSize: "0.8rem" }}
            onClick={() => { setFilterStatus(s); setSelectedId(null); }}
          >
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {error && <p className="form-error" style={{ marginBottom: "1rem" }}>{error}</p>}

      {/* Leads table */}
      <div className="dashboard-card table-card">
        {loading ? (
          <p className="meta" style={{ padding: "1.5rem" }}>Loading leads…</p>
        ) : leads.length === 0 ? (
          <p className="meta" style={{ padding: "1.5rem" }}>No leads{filterStatus !== "ALL" ? ` with status ${filterStatus}` : ""}.</p>
        ) : (
          <table className="zebra-rows">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Source</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <strong>{lead.fullName}</strong>
                    {lead.email ? <><br /><span className="meta">{lead.email}</span></> : null}
                  </td>
                  <td>{lead.phone}</td>
                  <td><span className="meta">{lead.source}</span></td>
                  <td>
                    <span className={`status-chip ${STATUS_CLASS[lead.status]}`}>
                      {lead.status.charAt(0) + lead.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="meta">{fmt(lead.createdAt)}</td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => setSelectedId(lead.id === selectedId ? null : lead.id)}
                    >
                      {lead.id === selectedId ? "Close" : "Details"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="dashboard-card" style={{ marginTop: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
            <div>
              <h2 style={{ marginBottom: "0.25rem" }}>{selected.fullName}</h2>
              <p className="meta">
                {selected.phone}
                {selected.email ? ` · ${selected.email}` : ""}
                {" · "}
                <span className={`status-chip ${STATUS_CLASS[selected.status]}`} style={{ fontSize: "0.75rem" }}>
                  {selected.status}
                </span>
              </p>
            </div>
            <button className="btn btn-secondary" type="button" onClick={() => setSelectedId(null)}>
              Close
            </button>
          </div>

          <dl style={{ display: "grid", gridTemplateColumns: "8rem 1fr", gap: "0.5rem 1rem", marginBottom: "1.5rem" }}>
            <dt className="meta">Source</dt>
            <dd>{selected.source}</dd>
            <dt className="meta">Unit interest</dt>
            <dd>{selected.unitId ?? <span className="meta">—</span>}</dd>
            <dt className="meta">Received</dt>
            <dd>{fmt(selected.createdAt)}</dd>
            {selected.message && (
              <>
                <dt className="meta">Message</dt>
                <dd style={{ whiteSpace: "pre-wrap" }}>{selected.message}</dd>
              </>
            )}
          </dl>

          {/* Status actions — not shown for already-terminal statuses */}
          {selected.status !== "CONVERTED" && selected.status !== "REJECTED" && (
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {selected.status === "NEW" && (
                <button
                  className="btn btn-secondary"
                  type="button"
                  disabled={acting}
                  onClick={() => setStatus(selected.id, "CONTACTED")}
                >
                  Mark Contacted
                </button>
              )}
              {(selected.status === "NEW" || selected.status === "CONTACTED") && (
                <button
                  className="btn btn-secondary"
                  type="button"
                  disabled={acting}
                  onClick={() => setStatus(selected.id, "QUALIFIED")}
                >
                  Mark Qualified
                </button>
              )}
              {selected.status === "QUALIFIED" && (
                <button
                  className="btn btn-primary"
                  type="button"
                  disabled={acting}
                  onClick={() => convertLead(selected.id)}
                >
                  {acting ? "Converting…" : "Convert to Buyer"}
                </button>
              )}
              <button
                className="btn btn-secondary"
                type="button"
                disabled={acting}
                style={{ marginLeft: "auto", color: "var(--error, #c0392b)" }}
                onClick={() => setStatus(selected.id, "REJECTED")}
              >
                Reject
              </button>
            </div>
          )}

          {selected.status === "CONVERTED" && (
            <p className="meta" style={{ color: "var(--success, green)" }}>
              This lead has been converted to a Buyer.
            </p>
          )}
          {selected.status === "REJECTED" && (
            <p className="meta" style={{ color: "var(--error, #c0392b)" }}>
              This lead was rejected.
            </p>
          )}
        </div>
      )}
    </>
  );
}
