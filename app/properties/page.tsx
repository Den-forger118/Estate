import { PageShell } from "../components/SiteChrome";
import { PropertyFilters } from "../components/PropertyFilters";

export default function PropertiesPage() {
  return (
    <PageShell>
      <section className="page-hero">
        <div className="page-hero-inner reveal">
          <div className="stack">
            <span className="eyebrow">Properties</span>
            <h1>Browse available units across our estate portfolio.</h1>
          </div>
          <p>
            Search by price, bedrooms, property type, location, and availability. Each listing includes clear details and a direct path to book an inspection.
          </p>
        </div>
      </section>
      <PropertyFilters />
    </PageShell>
  );
}
