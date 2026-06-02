import { PageShell, SectionIntro } from "../components/SiteChrome";

const values = [
  ["Calm confidence", "We make every viewing, handover, and service request feel organized and respectful."],
  ["Long-term stewardship", "We manage homes, shared infrastructure, and landscapes with a preservation mindset."],
  ["Transparent service", "Owners and residents receive clear communication, honest timelines, and practical support."],
];

const team = [
  ["Elena Marsh", "Managing Partner", "Estate operations and client advisory"],
  ["Victor Lane", "Development Director", "Planning, facilities, and vendor quality"],
  ["Amara Cole", "Resident Experience Lead", "Inspections, move-ins, and community care"],
];

export default function AboutPage() {
  return (
    <PageShell>
      <section className="page-hero">
        <div className="page-hero-inner reveal">
          <div className="stack">
            <span className="eyebrow">About Ernest Ofori</span>
            <h1>Estate living shaped by care, security, and quiet refinement.</h1>
          </div>
          <p>
            Ernest Ofori was founded to bring premium property management discipline to residential communities where families expect comfort, privacy, and reliable support.
          </p>
        </div>
      </section>

      <section className="section split-section">
        <div className="image-panel reveal">
          <img src="https://images.unsplash.com/photo-1600566753151-384129cf4e3e?auto=format&fit=crop&w=1400&q=82" alt="Elegant estate interior" />
        </div>
        <div className="stack reveal">
          <span className="eyebrow">Our story</span>
          <h2>From property handovers to full community operations.</h2>
          <p>
            We began by helping owners prepare homes for lease and families settle into secure neighborhoods. Today, our team supports estate developments with leasing, inspections, maintenance planning, resident support, and management advisory.
          </p>
          <p>
            Our philosophy is simple: a premium estate should feel effortless because the details behind it are handled with discipline.
          </p>
        </div>
      </section>

      <section className="section">
        <SectionIntro eyebrow="Mission and vision" title="Better homes, better-managed communities" text="Our mission is to protect property value while creating calm, welcoming estate environments that residents are proud to call home." />
        <div className="value-grid">
          {values.map(([title, text]) => (
            <article className="value-card reveal" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionIntro eyebrow="Leadership" title="A hands-on team with estate experience" text="Our leadership blends real estate, facilities, leasing, and resident service expertise." />
        <div className="team-grid">
          {team.map(([name, role, focus]) => (
            <article className="team-card reveal" key={name}>
              <h3>{name}</h3>
              <span>{role}</span>
              <p>{focus}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="stat-grid reveal">
          <div className="stat-card"><strong>14+</strong><span>managed communities</span></div>
          <div className="stat-card"><strong>1,250</strong><span>resident requests resolved yearly</span></div>
          <div className="stat-card"><strong>24/7</strong><span>security coordination support</span></div>
        </div>
      </section>
    </PageShell>
  );
}
