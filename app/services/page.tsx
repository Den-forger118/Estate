import { PageShell } from "../components/SiteChrome";
import { ServicesClosingBand } from "../components/ServicesClosingBand";
import { ServicesHero } from "../components/ServicesHero";
import { ServicesScopeBand } from "../components/ServicesScopeBand";
import { ServicesZBand } from "../components/ServicesZBand";
import { serviceGroups } from "../data/site";

export default function ServicesPage() {
  return (
    <PageShell>
      <ServicesHero />
      <ServicesScopeBand />
      {serviceGroups.map((group) => (
        <ServicesZBand
          key={group.id}
          id={group.id}
          eyebrow={group.eyebrow}
          title={group.title}
          lead={group.lead}
          image={group.image}
          reverse={group.reverse}
          services={group.services}
          showCta={"showCta" in group ? Boolean(group.showCta) : false}
        />
      ))}
      <ServicesClosingBand />
    </PageShell>
  );
}
