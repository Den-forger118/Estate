import { PropertiesHero } from "../components/PropertiesHero";
import { PageShell } from "../components/SiteChrome";
import { PropertyFilters } from "../components/PropertyFilters";

export default function PropertiesPage() {
  return (
    <PageShell>
      <PropertiesHero />
      <PropertyFilters />
    </PageShell>
  );
}
