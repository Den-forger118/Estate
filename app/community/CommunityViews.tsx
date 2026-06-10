"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { estateImages } from "../data/images";
import {
  bookingFacilities,
  bookingWeekDays,
  communityEvents,
  communityModuleMeta,
  directoryEntries,
  emergencyContacts,
  hubQuickActions,
  incidentTypes,
  marketplaceCategories,
  marketplaceProviderDetails,
  reservedAmenities,
  securityAnnouncements,
  securityNotices,
  upcomingEvents,
  type CommunityModule,
} from "../data/community";
import { showToast } from "../components/Toast";

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

export function CommunityHubView() {
  const featured = upcomingEvents[0];

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
          <h1 className="community-welcome-title">Welcome home.</h1>
          <p>Penthouse 4B is ready for your arrival. Book amenities, RSVP to events, and reach security in one place.</p>
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
            <span className="status-chip status-featured">3 new</span>
          </div>
          <div className="community-featured-event">
            <Image
              src={featured.image}
              alt={featured.title}
              fill
              sizes="(max-width: 980px) 100vw, 66vw"
              className="community-media-image"
            />
            <div>
              <span className="eyebrow">{featured.tag}</span>
              <h3>{featured.title}</h3>
              <p>{featured.when} · {featured.where}</p>
            </div>
          </div>
          <Link href="/community/events" className="community-inline-link">
            View all community events →
          </Link>
        </article>

        <article className="dashboard-card">
          <h2>Security notices</h2>
          <div className="community-notice-list">
            {securityNotices.map((notice) => (
              <div key={notice.title} className="community-notice">
                <strong>{notice.title}</strong>
                <p>{notice.text}</p>
                <span className="meta">{notice.posted}</span>
              </div>
            ))}
          </div>
          <Link href="/community/security" className="community-inline-link">
            Access security portal →
          </Link>
        </article>

        <article className="dashboard-card">
          <h2>Reserved amenities</h2>
          {reservedAmenities.map((item, index) => (
            <div key={item.name} className={index === 0 ? "community-booking-highlight" : "community-booking-row"}>
              <div>
                <strong>{item.name}</strong>
                <p>{item.detail}</p>
              </div>
              <span className="meta">{item.when}</span>
            </div>
          ))}
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

function EventsView() {
  const [filter, setFilter] = useState("All");
  const [rsvp, setRsvp] = useState<Record<string, boolean>>({});

  const filteredEvents = useMemo(() => {
    if (filter === "All") return communityEvents;
    if (filter === "This week") return communityEvents.slice(0, 2);
    if (filter === "Family") return communityEvents.filter((e) => e.category === "Wellness" || e.category === "Social");
    return communityEvents.filter((e) => e.category === "Official");
  }, [filter]);

  const pills = ["All", "This week", "Family", "Committee"];

  return (
    <>
      <PageHeader
        module="events"
        action="Create reminder"
        onAction={() => showToast("Reminder created for upcoming events.", "info")}
      />
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
              <th>When</th>
              <th>Location</th>
              <th>Category</th>
              <th>RSVP</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event) => (
              <tr key={event.id}>
                <td>{event.title}</td>
                <td>{event.when}</td>
                <td>{event.location}</td>
                <td><span className="status-chip">{event.category}</span></td>
                <td className="font-data-md">{event.rsvp} attending</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="community-event-grid">
        {upcomingEvents.map((event) => {
          const isRsvp = rsvp[event.id];
          return (
            <article key={event.id} className="dashboard-card community-event-card">
              <div className="community-event-image">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="community-media-image"
                />
              </div>
              <div>
                <span className="eyebrow">{event.tag}</span>
                <h3>{event.title}</h3>
                <p>{event.when} · {event.where}</p>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => {
                    setRsvp((prev) => ({ ...prev, [event.id]: !prev[event.id] }));
                    showToast(
                      isRsvp ? `RSVP cancelled for ${event.title}.` : `You're on the list for ${event.title}.`,
                    );
                  }}
                >
                  {isRsvp ? "Cancel RSVP" : "RSVP"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

function DirectoryView() {
  return (
    <>
      <PageHeader
        module="directory"
        title="Resident directory"
        text="Verified residents only. Control how neighbours see your profile."
        action="Privacy settings"
        onAction={() => showToast("Privacy settings saved. Your profile visibility is Residents Only.", "info")}
      />
      <div className="dashboard-card table-wrap">
        <table className="zebra-rows">
          <thead>
            <tr>
              <th>Resident</th>
              <th>Unit</th>
              <th>Visibility</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {directoryEntries.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.unit}</td>
                <td>{row.visibility}</td>
                <td>{row.committee ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

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

function SecurityView() {
  return (
    <>
      <PageHeader module="security" action="Signal emergency" actionHref="/community/report" />
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
        {securityAnnouncements.map((row) => (
          <div key={row[0]} className="community-announcement">
            <div>
              <span className="eyebrow">{row[3]}</span>
              <strong>{row[0]}</strong>
            </div>
            <p>{row[1]}</p>
            <span className="meta">{row[2]}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function ReportView() {
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!location.trim() || !description.trim()) {
      showToast("Please complete all required fields.", "error");
      return;
    }
    const ref = `TKT-${String(Math.floor(Math.random() * 900) + 100)}`;
    showToast(`Request submitted. Reference: ${ref}`);
    setLocation("");
    setDescription("");
  }

  return (
    <>
      <PageHeader
        module="report"
        title="Report an incident"
        text="Notify estate security of suspicious activity, emergencies, or access issues."
      />
      <form className="dashboard-card form-grid community-report-form" onSubmit={submit}>
        <label>
          Incident type
          <select defaultValue={incidentTypes[0]}>
            {incidentTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
        <label>
          Location
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. North gate, Block C walkway" required />
        </label>
        <label>
          Priority
          <select defaultValue="Standard">
            <option>Standard</option>
            <option>Urgent</option>
            <option>Emergency</option>
          </select>
        </label>
        <label className="community-report-wide">
          Description
          <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what you observed…" required />
        </label>
        <label className="community-report-wide">
          Photo (optional)
          <input type="file" accept="image/*" onChange={() => showToast("Photo attached to report.", "info")} />
        </label>
        <button className="btn btn-primary community-report-wide" type="submit">
          Submit to security
        </button>
      </form>
    </>
  );
}

function BookingsView() {
  return (
    <>
      <PageHeader
        module="bookings"
        action="New booking"
        onAction={() => showToast("Booking request submitted. Facility team will confirm within 2 hours.", "info")}
      />
      <div className="community-bento community-bento-bookings">
        <article className="dashboard-card community-bento-wide">
          <div className="community-bento-head">
            <h2>Weekly schedule</h2>
            <span className="meta">Conflict-aware calendar</span>
          </div>
          <div className="community-calendar-head">
            <span>Time</span>
            {bookingWeekDays.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="community-calendar-slot">
            <span>08:00</span>
            <span className="booked">Gym</span>
            <span />
            <span className="booked">Pool L2</span>
            <span />
            <span />
            <span className="booked">Lounge</span>
            <span />
          </div>
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
    </>
  );
}
