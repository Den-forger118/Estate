import Link from "next/link";
import { brand } from "../data/site";

export function ServicesClosingBand() {
  return (
    <section className="services-closing-band" aria-labelledby="services-closing-heading">
      <div className="services-closing-inner">
        <span className="eyebrow services-closing-eyebrow">Get started</span>
        <h2 id="services-closing-heading" className="font-headline-section services-closing-title">
          Responsive when needed, proactive when it matters most.
        </h2>
        <p className="services-closing-lead">
          Routine inspections, maintenance planning, escalation routes, and vendor supervision —
          so homes stay presentable and operational.
        </p>
        <div className="services-closing-actions">
          <Link href="/contact" className="btn btn-primary">
            Request a consultation
          </Link>
          <a href={`tel:${brand.phone}`} className="services-closing-phone font-data-md">
            {brand.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
