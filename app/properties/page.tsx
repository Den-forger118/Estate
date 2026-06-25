import { PropertiesHero } from "../components/PropertiesHero";
import { PageShell } from "../components/SiteChrome";
import { PropertyFilters } from "../components/PropertyFilters";
import { UnitsAvailability } from "../components/UnitsAvailability";

export default function PropertiesPage() {
  return (
    <PageShell>
      <PropertiesHero />
      <PropertyFilters />

      {/* Live unit availability — reads from DB via /api/v1/public/units */}
      <section className="section" style={{ paddingTop: "3rem" }}>
        <div style={{ maxWidth: "var(--content-max)", margin: "0 auto", padding: "0 var(--gutter)" }}>
          <span className="eyebrow">Off-Plan Units</span>
          <h2 className="font-headline-section" style={{ marginBottom: "0.5rem" }}>
            Current availability
          </h2>
          <p className="meta" style={{ marginBottom: "2rem" }}>
            Status reflects the live database — refresh to see the latest.
          </p>
          <UnitsAvailability />
        </div>
      </section>
    </PageShell>
  );
}
