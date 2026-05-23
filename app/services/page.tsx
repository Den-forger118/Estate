import Link from "next/link";
import { PageShell, SectionIntro } from "../components/SiteChrome";
import { services } from "../data/site";

export default function ServicesPage() {
  return (
    <PageShell>
      <section className="page-hero">
        <div className="page-hero-inner reveal">
          <div className="stack">
            <span className="eyebrow">Services</span>
            <h1>Property services designed for owners, residents, and estate teams.</h1>
          </div>
          <p>
            From leasing support to security coordination, our services keep residential communities functional, attractive, and easy to live in.
          </p>
        </div>
      </section>

      <section className="section">
        <SectionIntro eyebrow="What we handle" title="Complete estate support" text="Choose focused support for a single property or a broader management program for a full estate community." />
        <div className="service-grid">
          {services.map(([title, text]) => (
            <article className="service-card reveal" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section split-section">
        <div className="stack reveal">
          <span className="eyebrow">Service rhythm</span>
          <h2>Responsive when needed, proactive when it matters most.</h2>
          <p>
            We combine routine inspections, maintenance planning, clear escalation routes, resident communication, and vendor supervision so homes stay presentable and operational.
          </p>
          <Link href="/contact" className="btn btn-primary">Request a Consultation</Link>
        </div>
        <div className="image-panel reveal">
          <img src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=82" alt="Modern estate service residence" />
        </div>
      </section>
    </PageShell>
  );
}
