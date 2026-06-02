import Image from "next/image";
import Link from "next/link";
import {
  bookingFacilities,
  bookingWeekDays,
  communityModuleMeta,
  directoryResidents,
  emergencyContacts,
  estateEvents,
  hubQuickActions,
  incidentTypes,
  marketplaceCategories,
  marketplaceProviders,
  reservedAmenities,
  securityAnnouncements,
  securityNotices,
  upcomingEvents,
  type CommunityModule,
} from "../data/community";

function PageHeader({
  module,
  title,
  text,
  action,
  actionHref,
}: {
  module: Exclude<CommunityModule, "community">;
  title?: string;
  text?: string;
  action?: string;
  actionHref?: string;
}) {
  const meta = communityModuleMeta[module];
  return (
    <div className="dashboard-page-header">
      <div>
        <span className="eyebrow">{meta.label}</span>
        <h1>{title ?? meta.label}</h1>
        <p>{text ?? meta.summary}</p>
      </div>
      {action && actionHref ? (
        <div className="dashboard-actions">
          <Link className="btn btn-primary" href={actionHref}>
            {action}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function CommunityHubView() {
  const featured = upcomingEvents[0];

  return (
    <>
      <section className="community-hero reveal">
        <Image
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=82"
          alt="Estate lobby"
          fill
          sizes="100vw"
          priority
        />
        <div className="community-hero-copy">
          <span className="eyebrow">Resident services</span>
          <h1>Welcome home.</h1>
          <p>Penthouse 4B is ready for your arrival. Book amenities, RSVP to events, and reach security in one place.</p>
        </div>
      </section>

      <section className="community-quick-grid">
        {hubQuickActions.map((action) => (
          <Link key={action.href} href={action.href} className="community-quick-card">
            <span className="community-quick-icon">{action.icon}</span>
            <strong>{action.label}</strong>
          </Link>
        ))}
      </section>

      <div className="community-bento">
        <article className="dashboard-card community-bento-wide">
          <div className="community-bento-head">
            <h2>Upcoming events</h2>
            <span className="status-chip">3 new</span>
          </div>
          <div className="community-featured-event">
            <Image src={featured.image} alt={featured.title} fill sizes="(max-width: 980px) 100vw, 66vw" />
            <div>
              <span className="eyebrow">{featured.tag}</span>
              <h3>{featured.title}</h3>
              <p>
                {featured.when} · {featured.where}
              </p>
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
              <div key={contact.name} className={`community-emergency-card ${contact.tone}`}>
                <strong>{contact.name}</strong>
                <span>{contact.detail}</span>
              </div>
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
  return (
    <>
      <PageHeader module="events" action="Create reminder" actionHref="/community/events" />
      <div className="community-filter-pills">
        {["All", "This week", "Family", "Committee"].map((pill, index) => (
          <button key={pill} type="button" className={index === 0 ? "active" : ""}>
            {pill}
          </button>
        ))}
      </div>
      <div className="dashboard-card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>When</th>
              <th>Location</th>
              <th>Status</th>
              <th>Attendance</th>
            </tr>
          </thead>
          <tbody>
            {estateEvents.map((row) => (
              <tr key={row[0]}>
                <td>{row[0]}</td>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
                <td>
                  <span className="status-chip">{row[3]}</span>
                </td>
                <td>{row[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="community-event-grid">
        {upcomingEvents.map((event) => (
          <article key={event.title} className="dashboard-card community-event-card">
            <div className="community-event-image">
              <Image src={event.image} alt={event.title} fill sizes="(max-width: 640px) 100vw, 33vw" />
            </div>
            <div>
              <span className="eyebrow">{event.tag}</span>
              <h3>{event.title}</h3>
              <p>
                {event.when} · {event.where}
              </p>
              <button className="btn btn-primary" type="button">
                RSVP
              </button>
            </div>
          </article>
        ))}
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
        actionHref="/community/directory"
      />
      <div className="dashboard-card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Resident</th>
              <th>Unit</th>
              <th>Visibility</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {directoryResidents.map((row) => (
              <tr key={row[0]}>
                <td>{row[0]}</td>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
                <td>{row[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function MarketplaceView() {
  return (
    <>
      <PageHeader
        module="marketplace"
        title="Local services marketplace"
        text="Background-checked professionals recommended for estate residents."
      />
      <div className="community-filter-pills">
        {marketplaceCategories.map((pill, index) => (
          <button key={pill} type="button" className={index === 0 ? "active" : ""}>
            {pill}
          </button>
        ))}
      </div>
      <div className="community-provider-grid">
        {marketplaceProviders.map((row) => (
          <article key={row[0]} className="dashboard-card community-provider-card">
            <div className="community-provider-head">
              <h3>{row[0]}</h3>
              <span className="status-chip">{row[4]}</span>
            </div>
            <p className="meta">
              {row[1]} · ★ {row[2]} · {row[3]}
            </p>
            <p>{row[5]}</p>
            <button className="btn btn-primary" type="button">
              Request booking
            </button>
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
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=82"
            alt="Estate gate at evening"
            fill
            sizes="(max-width: 980px) 100vw, 60vw"
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
  return (
    <>
      <PageHeader
        module="report"
        title="Report an incident"
        text="Notify estate security of suspicious activity, emergencies, or access issues."
      />
      <form className="dashboard-card form-grid community-report-form">
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
          <input type="text" placeholder="e.g. North gate, Block C walkway" />
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
          <textarea rows={5} placeholder="Describe what you observed…" />
        </label>
        <label className="community-report-wide">
          Photo (optional)
          <input type="file" accept="image/*" />
        </label>
        <button className="btn btn-primary community-report-wide" type="button">
          Submit to security
        </button>
      </form>
    </>
  );
}

function BookingsView() {
  return (
    <>
      <PageHeader module="bookings" action="New booking" actionHref="/community/bookings" />
      <div className="community-bento community-bento-bookings">
        <article className="dashboard-card community-bento-wide">
          <div className="community-bento-head">
            <h2>Weekly schedule</h2>
            <span className="meta">Conflict-aware calendar (mock)</span>
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
