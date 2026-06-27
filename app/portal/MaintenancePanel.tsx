"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { MaintenanceTicket, TicketPriority } from "@/app/data/types";

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

const priorityColor: Record<string, string> = {
  URGENT: "error",
  HIGH:   "warning",
  MEDIUM: "info",
  LOW:    "default",
};

const statusColor: Record<string, string> = {
  NEW:         "warning",
  IN_PROGRESS: "info",
  RESOLVED:    "success",
};

export function MaintenancePanel({ unitId }: { unitId: string }) {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");

  useEffect(() => {
    fetch(`/api/v1/units/${unitId}/maintenance`)
      .then((r) => r.json())
      .then((data: MaintenanceTicket[]) => setTickets(data))
      .catch(() => setError("Failed to load maintenance requests."))
      .finally(() => setLoading(false));
  }, [unitId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/units/${unitId}/maintenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || undefined, priority }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        setError(body.error ?? "Failed to submit request.");
        return;
      }
      const ticket = await res.json() as MaintenanceTicket;
      setTickets((prev) => [ticket, ...prev]);
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="dashboard-card" style={{ marginBottom: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 1rem 0.5rem",
        }}
      >
        <h2 style={{ margin: 0 }}>Maintenance Requests</h2>
        <button
          className="btn btn-primary"
          type="button"
          style={{ fontSize: "0.8rem" }}
          onClick={() => { setShowForm((v) => !v); setError(null); }}
        >
          {showForm ? "Cancel" : "New request"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "0 1rem 1rem",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <label>
            Title
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Leaking pipe under kitchen sink"
              maxLength={200}
              required
            />
          </label>
          <label>
            Description (optional)
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any additional details, access notes, photos to follow…"
              rows={3}
              maxLength={2000}
              style={{ resize: "vertical" }}
            />
          </label>
          <label>
            Priority
            <select value={priority} onChange={(e) => setPriority(e.target.value as TicketPriority)}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </label>
          {error && <p style={{ margin: 0, color: "var(--error)", fontSize: "0.85rem" }}>{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={submitting || !title.trim()}>
            {submitting ? "Submitting…" : "Submit request"}
          </button>
        </form>
      )}

      <div style={{ padding: "0.5rem 1rem 1rem" }}>
        {loading ? (
          <p className="meta" style={{ textAlign: "center", padding: "1rem 0" }}>Loading…</p>
        ) : tickets.length === 0 ? (
          <p className="meta" style={{ textAlign: "center", padding: "1rem 0" }}>
            No maintenance requests yet.
          </p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {tickets.map((t) => (
              <li
                key={t.id}
                style={{
                  padding: "0.75rem 0",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                }}
              >
                <div style={{ flex: 1 }}>
                  <strong style={{ display: "block", fontSize: "0.9rem" }}>{t.title}</strong>
                  {t.description && (
                    <p className="meta" style={{ margin: "0.2rem 0 0", fontSize: "0.8rem" }}>
                      {t.description}
                    </p>
                  )}
                  <p className="meta" style={{ margin: "0.3rem 0 0", fontSize: "0.75rem" }}>
                    Submitted {fmt(t.createdAt)}
                    {t.assignee && <> · Assigned to {t.assignee}</>}
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.3rem", flexShrink: 0 }}>
                  <span className={`status-chip status-${priorityColor[t.priority] ?? "default"}`} style={{ fontSize: "0.7rem" }}>
                    {t.priority}
                  </span>
                  <span className={`status-chip status-${statusColor[t.status] ?? "default"}`} style={{ fontSize: "0.7rem" }}>
                    {t.status.replace("_", " ")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
