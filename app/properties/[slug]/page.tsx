import { notFound } from "next/navigation";
import { PropertyConstructionTimeline } from "../../components/PropertyConstructionTimeline";
import { PropertyDetailView } from "../../components/PropertyDetailView";
import { PageShell } from "../../components/SiteChrome";
import { properties } from "../../data/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return properties.map((property) => ({ slug: property.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const property = properties.find((item) => item.slug === slug);
  return {
    title: property ? `${property.name} | Special Gardens` : "Property | Special Gardens",
    description: property?.description,
  };
}

export default async function PropertyDetailWithTimeline({ params }: Props) {
  const { slug } = await params;
  const property = properties.find((item) => item.slug === slug);

  if (!property) {
    notFound();
  }

  const similar = properties.filter((item) => item.slug !== property.slug).slice(0, 3);

  return (
    <PageShell>
      <PropertyDetailView property={property} similar={similar} />
      <section className="section">
        <PropertyConstructionTimeline activePhase={1} />
      </section>
    </PageShell>
  );
}
