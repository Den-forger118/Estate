"use client";

import { FormEvent, useEffect, useState } from "react";
import type { CommunityEvent, SecurityNotice } from "../data/types";
import { showToast } from "../components/Toast";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function severityChip(s: SecurityNotice["severity"]) {
  const cls = s === "URGENT" ? "status-error" : s === "WARNING" ? "status-warning" : "status-info";
  return <span className={`status-chip ${cls}`} style={{ fontSize: "0.7rem" }}>{s}</span>;
}

// ─── Events panel ─────────────────────────────────────────────────────────────

function EventsPanel() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("09:00");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("General");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/v1/community/events")
      .then((r) => r.json())
      .then(setEvents)
      .catch(() => showToast("Failed to load events", "error"))
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setTitle(""); setDescription(""); setEventDate(""); setEventTime("09:00");
    setLocation(""); setCategory("General"); setImageUrl("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !eventDate) { showToast("Title and date are required", "error"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/community/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          eventDate: `${eventDate}T${eventTime}:00.000Z`,
          location: location.trim() || undefined,
          category: category.trim() || "General",
          imageUrl: imageUrl.trim() || undefined,
        }),
      });
      const body = await res.json() as CommunityEvent & { error?: string };
      if (res.ok) {
        setEvents((prev) => [body, ...prev].sort((a, b) => a.eventDate.localeCompare(b.eventDate)));
        resetForm();
        setShowForm(false);
        showToast(`Event "${body.title}" published`);
      } else {
        showToast((body as { error?: string }).error ?? "Failed to create event", "error");
      }
    } catch {
      showToast("Request failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="dashboard-card" style={{ marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1rem 0.75rem" }}>
        <div>
          <h2 style={{ margin: 0 }}>Events</h2>
          <p className="meta" style={{ margin: "0.2rem 0 0" }}>Published to all homeowner-residents in Resident OS</p>
        </div>
        <button
          className="btn btn-primary"
          type="button"
          style={{ fontSize: "0.8rem" }}
          onClick={() => { setShowForm((v) => !v); resetForm(); }}
        >
          {showForm ? "Cancel" : "New event"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{ padding: "0 1rem 1rem", borderBottom: "1px solid var(--border)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}
        >
          <label style={{ gridColumn: "1 / -1" }}>
            Title *
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Annual Residents BBQ" maxLength={200} required />
          </label>
          <label>
            Date *
            <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} required />
          </label>
          <label>
            Time
            <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
          </label>
          <label>
            Location
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Rooftop terrace, Block A" maxLength={200} />
          </label>
          <label>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {["General", "Social", "Wellness", "Official", "Family", "Sports"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label style={{ gridColumn: "1 / -1" }}>
            Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={2000} placeholder="Optional details about the event…" />
          </label>
          <label style={{ gridColumn: "1 / -1" }}>
            Cover image URL (optional)
            <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" />
          </label>
          <div style={{ gridColumn: "1 / -1" }}>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Publishing…" : "Publish event"}
            </button>
          </div>
        </form>
      )}

      <div style={{ padding: "0.5rem 1rem 1rem" }}>
        {loading ? (
          <p className="meta" style={{ textAlign: "center", padding: "1rem 0" }}>Loading…</p>
        ) : events.length === 0 ? (
          <p className="meta" style={{ textAlign: "center", padding: "1rem 0" }}>No events yet. Create one above.</p>
        ) : (
          <table className="zebra-rows" style={{ marginTop: "0.25rem" }}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Location</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id}>
                  <td>
                    <strong>{ev.title}</strong>
                    {ev.description && <p className="meta" style={{ margin: 0, fontSize: "0.78rem" }}>{ev.description.slice(0, 80)}{ev.description.length > 80 ? "…" : ""}</p>}
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>{fmtDate(ev.eventDate)}</td>
                  <td>{ev.location ?? "—"}</td>
                  <td><span className="status-chip">{ev.category}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

// ─── Security notices panel ───────────────────────────────────────────────────

function SecurityNoticesPanel() {
  const [notices, setNotices] = useState<SecurityNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [severity, setSeverity] = useState<SecurityNotice["severity"]>("INFO");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/v1/community/security-notices")
      .then((r) => r.json())
      .then(setNotices)
      .catch(() => showToast("Failed to load notices", "error"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) { showToast("Title and body are required", "error"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/community/security-notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), body: body.trim(), severity }),
      });
      const data = await res.json() as SecurityNotice & { error?: string };
      if (res.ok) {
        setNotices((prev) => [data, ...prev]);
        setTitle(""); setBody(""); setSeverity("INFO");
        setShowForm(false);
        showToast(`Notice "${data.title}" posted`);
      } else {
        showToast((data as { error?: string }).error ?? "Failed to post notice", "error");
      }
    } catch {
      showToast("Request failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="dashboard-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1rem 0.75rem" }}>
        <div>
          <h2 style={{ margin: 0 }}>Security Notices</h2>
          <p className="meta" style={{ margin: "0.2rem 0 0" }}>Active notices shown in Resident OS security hub</p>
        </div>
        <button
          className="btn btn-primary"
          type="button"
          style={{ fontSize: "0.8rem" }}
          onClick={() => { setShowForm((v) => !v); setTitle(""); setBody(""); setSeverity("INFO"); }}
        >
          {showForm ? "Cancel" : "New notice"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{ padding: "0 1rem 1rem", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <label>
            Title *
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Gate access update — 14 July" maxLength={200} required />
          </label>
          <label>
            Severity
            <select value={severity} onChange={(e) => setSeverity(e.target.value as SecurityNotice["severity"])}>
              <option value="INFO">Info — routine update</option>
              <option value="WARNING">Warning — residents should be aware</option>
              <option value="URGENT">Urgent — immediate attention required</option>
            </select>
          </label>
          <label>
            Body *
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} maxLength={5000} placeholder="Full notice text visible to all residents…" required />
          </label>
          <div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Posting…" : "Post notice"}
            </button>
          </div>
        </form>
      )}

      <div style={{ padding: "0.5rem 1rem 1rem" }}>
        {loading ? (
          <p className="meta" style={{ textAlign: "center", padding: "1rem 0" }}>Loading…</p>
        ) : notices.length === 0 ? (
          <p className="meta" style={{ textAlign: "center", padding: "1rem 0" }}>No active notices.</p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {notices.map((n) => (
              <li key={n.id} style={{ padding: "0.75rem 0", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                    <strong style={{ fontSize: "0.9rem" }}>{n.title}</strong>
                    {severityChip(n.severity)}
                  </div>
                  <p className="meta" style={{ margin: 0, fontSize: "0.82rem" }}>{n.body.slice(0, 120)}{n.body.length > 120 ? "…" : ""}</p>
                </div>
                <span className="meta" style={{ whiteSpace: "nowrap", fontSize: "0.78rem" }}>{fmtDate(n.postedAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function CommunityAdminView() {
  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Resident OS</span>
          <h1>Community Management</h1>
          <p>Publish events and security notices visible to all homeowner-residents in the Resident OS.</p>
        </div>
      </div>
      <EventsPanel />
      <SecurityNoticesPanel />
    </>
  );
}
