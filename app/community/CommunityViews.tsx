"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { estateImages } from "../data/images";
import {
  bookingFacilities,
  bookingWeekDays,
  communityModuleMeta,
  emergencyContacts,
  hubQuickActions,
  incidentTypes,
  marketplaceCategories,
  marketplaceProviderDetails,
  type CommunityModule,
} from "../data/community";
import { showToast } from "../components/Toast";
import type { CommunityEvent, SecurityNotice, FacilityBooking } from "../data/types";

function PageHeader({
  module,
  title,
  text,
  action,
  actionHref,
  onAction,
}: {
  module: Exclude<CommunityModule, "community">;
  title?: string;
  text?: string;
  action?: string;
  actionHref?: string;
  onAction?: () => void;
}) {
  const meta = communityModuleMeta[module];
  return (
    <div className="dashboard-page-header">
      <div>
        <span className="eyebrow">{meta.label}</span>
        <h1>{title ?? meta.label}</h1>
        <p>{text ?? meta.summary}</p>
      </div>
      {action ? (
        <div className="dashboard-actions">
          {actionHref ? (
            <Link className="btn btn-primary" href={actionHref}>
              {action}
            </Link>
          ) : (
            <button className="btn btn-primary" type="button" onClick={onAction}>
              {action}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function severityClass(s: SecurityNotice["severity"]) {
  return s === "URGENT" ? "status-error" : s === "WARNING" ? "status-warning" : "status-info";
}

// ─── Hub ──────────────────────────────────────────────────────────────────────

export function CommunityHubView({ residentName, unitCode }: { residentName?: string; unitCode?: string }) {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [notices, setNotices] = useState<SecurityNotice[]>([]);
  const [bookings, setBookings] = useState<FacilityBooking[]>([]);

  useEffect(() => {
    fetch("/api/v1/community/events").then((r) => r.json()).then(setEvents).catch(() => {});
    fetch("/api/v1/community/security-notices").then((r) => r.json()).then(setNotices).catch(() => {});
    fetch("/api/v1/community/bookings").then((r) => r.json()).then(setBookings).catch(() => {});
  }, []);

  const featured = events[0];
  const displayUnit = unitCode ?? "Your unit";
  const displayName = residentName ?? "";

  return (
    <>
      <section className="community-hero">
        <Image
          src={estateImages.communityLobby}
          alt="Estate lobby"
          fill
          sizes="100vw"
          priority
          className="community-media-image"
        />
        <div className="community-hero-copy">
          <span className="eyebrow">Resident services</span>
          <h1 className="community-welcome-title">Welcome home{displayName ? `, ${displayName.split(" ")[0]}` : ""}.</h1>
          <p>{displayUnit} · Book amenities, RSVP to events, and reach security in one place.</p>
        </div>
      </section>

      <section className="community-quick-grid">
        {hubQuickActions.map((action) => (
          <Link key={action.href} href={action.href} className="community-quick-card card-interactive">
            <span className="community-quick-icon">{action.icon}</span>
            <strong>{action.label}</strong>
          </Link>
        ))}
      </section>

      <div className="community-bento">
        <article className="dashboard-card community-bento-wide">
          <div className="community-bento-head">
            <h2>Upcoming events</h2>
            {events.length > 0 && (
              <span className="status-chip status-featured">{events.length} event{events.length !== 1 ? "s" : ""}</span>
            )}
          </div>
          {featured ? (
            <>
              <div className="community-featured-event" style={{ position: "relative", overflow: "hidden" }}>
                {featured.imageUrl ? (
                  <img
                    src={featured.imageUrl}
                    alt={featured.title}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : null}
                <div>
                  <span className="eyebrow">{featured.category}</span>
                  <h3>{featured.title}</h3>
                  <p>{fmtDate(featured.eventDate)}{featured.location ? ` · ${featured.location}` : ""}</p>
                </div>
              </div>
              <Link href="/community/events" className="community-inline-link">
                View all community events →
              </Link>
            </>
          ) : (
            <p className="meta" style={{ padding: "1rem 0" }}>No upcoming events. Check back soon.</p>
          )}
        </article>

        <article className="dashboard-card">
          <h2>Security notices</h2>
          {notices.length > 0 ? (
            <div className="community-notice-list">
              {notices.slice(0, 3).map((notice) => (
                <div key={notice.id} className="community-notice">
                  <strong>{notice.title}</strong>
                  <p>{notice.body}</p>
                  <span className={`status-chip ${severityClass(notice.severity)}`} style={{ fontSize: "0.7rem" }}>
                    {notice.severity}
                  </span>
                  <span className="meta" style={{ marginLeft: "0.5rem" }}>{fmtDate(notice.postedAt)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="meta" style={{ padding: "0.5rem 0" }}>No active security notices.</p>
          )}
          <Link href="/community/security" className="community-inline-link">
            Access security portal →
          </Link>
        </article>

        <article className="dashboard-card">
          <h2>Your bookings</h2>
          {bookings.length > 0 ? (
            bookings.slice(0, 3).map((bk, i) => (
              <div key={bk.id} className={i === 0 ? "community-booking-highlight" : "community-booking-row"}>
                <div>
                  <strong>{bk.facility}</strong>
                  <p>{bk.timeSlot}</p>
                </div>
                <span className="meta">{fmtDate(bk.bookingDate)}</span>
              </div>
            ))
          ) : (
            <p className="meta" style={{ padding: "0.5rem 0" }}>No upcoming bookings.</p>
          )}
          <Link href="/community/bookings" className="btn btn-secondary">
            Manage bookings
          </Link>
        </article>

        <article className="dashboard-card community-bento-wide community-emergency">
          <h2>Emergency contacts</h2>
          <p>On-call staff available 24/7 for immediate assistance within the estate grounds.</p>
          <div className="community-emergency-grid">
            {emergencyContacts.map((contact) => (
              <a
                key={contact.name}
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
                className={`community-emergency-card ${contact.tone}`}
              >
                <strong>{contact.name}</strong>
                <span>{contact.detail}</span>
              </a>
            ))}
          </div>
        </article>
      </div>
    </>
  );
}

export function ModuleView({ module }: { module: Exclude<CommunityModule, "community"> }) {
  switch (module) {
    case "events":
      return <EventsView />;
    case "directory":
      return <DirectoryView />;
    case "marketplace":
      return <MarketplaceView />;
    case "security":
      return <SecurityView />;
    case "report":
      return <ReportView />;
    case "bookings":
      return <BookingsView />;
    default:
      return null;
  }
}

// ─── Events ───────────────────────────────────────────────────────────────────

function EventsView() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch("/api/v1/community/events")
      .then((r) => r.json())
      .then(setEvents)
      .catch(() => showToast("Failed to load events", "error"))
      .finally(() => setLoading(false));
  }, []);

  const pills = ["All", ...Array.from(new Set(events.map((e) => e.category)))];

  const filtered = useMemo(() => {
    if (filter === "All") return events;
    return events.filter((e) => e.category === filter);
  }, [events, filter]);

  return (
    <>
      <PageHeader
        module="events"
        action="Create reminder"
        onAction={() => showToast("Reminder set for upcoming events.", "info")}
      />
      {loading ? (
        <p className="meta" style={{ padding: "1rem" }}>Loading…</p>
      ) : events.length === 0 ? (
        <div className="dashboard-card" style={{ padding: "2rem", textAlign: "center" }}>
          <p className="meta">No events scheduled yet.</p>
        </div>
      ) : (
        <>
          <div className="community-filter-pills">
            {pills.map((pill) => (
              <button
                key={pill}
                type="button"
                className={filter === pill ? "active" : ""}
                onClick={() => setFilter(pill)}
              >
                {pill}
              </button>
            ))}
          </div>
          <div className="dashboard-card table-wrap">
            <table className="zebra-rows">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((event) => (
                  <tr key={event.id}>
                    <td><strong>{event.title}</strong>
                      {event.description && (
                        <p className="meta" style={{ margin: 0, fontSize: "0.8rem" }}>{event.description}</p>
                      )}
                    </td>
                    <td>{fmtDate(event.eventDate)}</td>
                    <td>{event.location ?? "—"}</td>
                    <td><span className="status-chip">{event.category}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

// ─── Directory ────────────────────────────────────────────────────────────────

type DirectoryEntry = { id: string; fullName: string; unitCode?: string; moveInDate?: string };

function DirectoryView() {
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/community/directory")
      .then((r) => r.json())
      .then(setEntries)
      .catch(() => showToast("Failed to load directory", "error"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        module="directory"
        title="Resident directory"
        text="Verified homeowner-residents only."
        action="Privacy settings"
        onAction={() => showToast("Privacy settings saved. Your profile visibility is Residents Only.", "info")}
      />
      {loading ? (
        <p className="meta" style={{ padding: "1rem" }}>Loading…</p>
      ) : (
        <div className="dashboard-card table-wrap">
          <table className="zebra-rows">
            <thead>
              <tr>
                <th>Resident</th>
                <th>Unit</th>
                <th>Move-in</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: "center" }} className="meta">No residents listed yet.</td></tr>
              ) : entries.map((row) => (
                <tr key={row.id}>
                  <td>{row.fullName}</td>
                  <td>{row.unitCode ?? "—"}</td>
                  <td>{row.moveInDate ? fmtDate(row.moveInDate) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ─── Marketplace (static — no DB backing) ─────────────────────────────────────

function MarketplaceView() {
  const [category, setCategory] = useState("All Services");

  const filtered = useMemo(() => {
    if (category === "All Services") return marketplaceProviderDetails;
    return marketplaceProviderDetails.filter((p) => p.category === category);
  }, [category]);

  return (
    <>
      <PageHeader
        module="marketplace"
        title="Local services marketplace"
        text="Background-checked professionals recommended for estate residents."
      />
      <div className="community-filter-pills">
        {marketplaceCategories.map((pill) => (
          <button
            key={pill}
            type="button"
            className={category === pill ? "active" : ""}
            onClick={() => setCategory(pill)}
          >
            {pill}
          </button>
        ))}
      </div>
      <div className="community-provider-grid">
        {filtered.map((provider) => (
          <article key={provider.id} className="dashboard-card community-provider-card">
            <div className="community-provider-image">
              <img src={provider.image} alt={provider.name} loading="lazy" decoding="async" />
              {provider.verified ? (
                <span className="status-chip status-available community-provider-badge">Verified</span>
              ) : null}
            </div>
            <div className="community-provider-body">
              <div className="community-provider-head">
                <h3>{provider.name}</h3>
              </div>
              <p className="meta">
                {provider.category} · ★ {provider.rating} · {provider.priceRange}
              </p>
              <p>{provider.description}</p>
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => showToast(`Booking request sent to ${provider.name}. They will contact you shortly.`)}
              >
                Request booking
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

// ─── Security ─────────────────────────────────────────────────────────────────

function SecurityView() {
  const [notices, setNotices] = useState<SecurityNotice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/community/security-notices")
      .then((r) => r.json())
      .then(setNotices)
      .catch(() => showToast("Failed to load security notices", "error"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader module="security" action="Report incident" actionHref="/community/report" />
      <div className="community-security-split">
        <div className="community-hero community-hero-compact">
          <Image
            src={estateImages.whiteEstate}
            alt="Estate gate at evening"
            fill
            sizes="(max-width: 980px) 100vw, 60vw"
            className="community-media-image"
          />
          <div className="community-hero-copy">
            <h2>Security & community safety</h2>
            <p>Continuous monitoring and rapid response across estate grounds.</p>
          </div>
        </div>
        <article className="dashboard-card community-alert-card">
          <h2>Emergency quick alert</h2>
          <p>Instantly notify on-site security and emergency services of your location.</p>
          <Link className="btn btn-primary" href="/community/report">
            Report incident now
          </Link>
        </article>
      </div>
      <div className="dashboard-card">
        <h2>Security announcements</h2>
        {loading ? (
          <p className="meta" style={{ padding: "1rem 0" }}>Loading…</p>
        ) : notices.length === 0 ? (
          <p className="meta" style={{ padding: "1rem 0" }}>No active security notices.</p>
        ) : (
          notices.map((notice) => (
            <div key={notice.id} className="community-announcement">
              <div>
                <span className={`eyebrow ${severityClass(notice.severity)}`}>{notice.severity}</span>
                <strong>{notice.title}</strong>
              </div>
              <p>{notice.body}</p>
              <span className="meta">{fmtDate(notice.postedAt)}</span>
            </div>
          ))
        )}
      </div>
    </>
  );
}

// ─── Report ───────────────────────────────────────────────────────────────────

function ReportView() {
  const [incidentType, setIncidentType] = useState(incidentTypes[0]);
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!location.trim() || !description.trim()) {
      showToast("Please complete all required fields.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/community/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentType, location: location.trim(), priority, description: description.trim() }),
      });
      const body = await res.json() as { ref?: string; error?: string };
      if (res.ok && body.ref) {
        setSubmitted(body.ref);
        setLocation("");
        setDescription("");
        showToast(`Report submitted. Reference: ${body.ref}`);
      } else {
        showToast(body.error ?? "Failed to submit report", "error");
      }
    } catch {
      showToast("Request failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        module="report"
        title="Report an incident"
        text="Notify estate security of suspicious activity, emergencies, or access issues."
      />
      {submitted && (
        <div className="dashboard-card" style={{ padding: "1rem", marginBottom: "1rem", borderLeft: "3px solid var(--primary)" }}>
          <strong>Report submitted</strong>
          <p className="meta">Reference: <code>{submitted}</code> — our team will respond shortly.</p>
          <button className="btn btn-secondary" style={{ marginTop: "0.5rem" }} type="button" onClick={() => setSubmitted(null)}>
            Submit another
          </button>
        </div>
      )}
      <form className="dashboard-card form-grid community-report-form" onSubmit={submit}>
        <label>
          Incident type
          <select value={incidentType} onChange={(e) => setIncidentType(e.target.value)}>
            {incidentTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
        <label>
          Location
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. North gate, Block C walkway"
            required
          />
        </label>
        <label>
          Priority
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="LOW">Standard</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">Urgent</option>
            <option value="URGENT">Emergency</option>
          </select>
        </label>
        <label className="community-report-wide">
          Description
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you observed…"
            required
          />
        </label>
        <button
          className="btn btn-primary community-report-wide"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Submitting…" : "Submit to security"}
        </button>
      </form>
    </>
  );
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

const AVAILABLE_FACILITIES = bookingFacilities.map((f) => f[0]);
const TIME_SLOTS = ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];

function BookingsView() {
  const [bookings, setBookings] = useState<FacilityBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [facility, setFacility] = useState(AVAILABLE_FACILITIES[0] ?? "");
  const [bookingDate, setBookingDate] = useState("");
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/v1/community/bookings")
      .then((r) => r.json())
      .then(setBookings)
      .catch(() => showToast("Failed to load bookings", "error"))
      .finally(() => setLoading(false));
  }, []);

  async function handleBook(e: FormEvent) {
    e.preventDefault();
    if (!bookingDate) { showToast("Please select a date", "error"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/community/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facility, bookingDate, timeSlot }),
      });
      const body = await res.json() as FacilityBooking & { error?: string };
      if (res.ok) {
        setBookings((prev) => [...prev, body]);
        setShowForm(false);
        setBookingDate("");
        showToast(`${facility} booked for ${fmtDate(body.bookingDate)} at ${body.timeSlot}.`);
      } else {
        showToast((body as { error?: string }).error ?? "Booking failed", "error");
      }
    } catch {
      showToast("Request failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        module="bookings"
        action="New booking"
        onAction={() => setShowForm((v) => !v)}
      />

      {showForm && (
        <form className="dashboard-card form-grid" onSubmit={handleBook} style={{ marginBottom: "1.5rem" }}>
          <label>
            Facility
            <select value={facility} onChange={(e) => setFacility(e.target.value)}>
              {AVAILABLE_FACILITIES.map((f) => <option key={f}>{f}</option>)}
            </select>
          </label>
          <label>
            Date
            <input
              type="date"
              value={bookingDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setBookingDate(e.target.value)}
              required
            />
          </label>
          <label>
            Time slot
            <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
              {TIME_SLOTS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Booking…" : "Confirm booking"}
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="community-bento community-bento-bookings">
        <article className="dashboard-card community-bento-wide">
          <div className="community-bento-head">
            <h2>Your bookings</h2>
            <span className="meta">Upcoming only</span>
          </div>
          {loading ? (
            <p className="meta" style={{ padding: "1rem 0" }}>Loading…</p>
          ) : bookings.length === 0 ? (
            <p className="meta" style={{ padding: "1rem 0" }}>No upcoming bookings. Use "New booking" to reserve a facility.</p>
          ) : (
            <table className="zebra-rows" style={{ marginTop: "0.5rem" }}>
              <thead>
                <tr>
                  <th>Facility</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((bk) => (
                  <tr key={bk.id}>
                    <td><strong>{bk.facility}</strong></td>
                    <td>{fmtDate(bk.bookingDate)}</td>
                    <td>{bk.timeSlot}</td>
                    <td><span className="status-chip status-success">{bk.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </article>

        <article className="dashboard-card">
          <h2>Facilities</h2>
          {bookingFacilities.map((row) => (
            <div key={row[0]} className="community-booking-row">
              <div>
                <strong>{row[0]}</strong>
                <p className="meta">{row[1]}</p>
              </div>
              <span className="status-chip">{row[2]}</span>
            </div>
          ))}
        </article>
      </div>

      <div className="community-bento" style={{ marginTop: "1.5rem" }}>
        <article className="dashboard-card community-bento-wide">
          <div className="community-bento-head">
            <h2>Weekly overview</h2>
            <span className="meta">All residents</span>
          </div>
          <div className="community-calendar-head">
            <span>Time</span>
            {bookingWeekDays.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          {bookings.slice(0, 3).map((bk) => (
            <div key={bk.id} className="community-calendar-slot">
              <span>{bk.timeSlot}</span>
              <span className="booked" style={{ gridColumn: "span 2" }}>{bk.facility}</span>
              <span /><span /><span /><span /><span />
            </div>
          ))}
        </article>
      </div>
    </>
  );
}
