import { notFound } from "next/navigation";
import { PropertyDetailView } from "../../components/PropertyDetailView";
import { PageShell } from "../../components/SiteChrome";
import { properties, PROJECT_NAME_BY_SLUG } from "../../data/site";
import { findPublicUnits } from "@/lib/repos/units";
import { UnitsAvailability } from "../../components/UnitsAvailability";

type Props = {
  params: Promise<{ slug: string }>;
};

// No generateStaticParams — rendered dynamically so unit status is always live.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const property = properties.find((item) => item.slug === slug);
  return {
    title: property ? `${property.name} | Special Gardens` : "Property | Special Gardens",
    description: property?.description,
  };
}

function getDefaultDeveloperId(): string {
  const id = process.env.DEVELOPER_ID;
  if (!id) throw new Error("DEVELOPER_ID env var is not set");
  return id;
}

export default async function PropertyDetailsPage({ params }: Props) {
  const { slug } = await params;
  const property = properties.find((item) => item.slug === slug);

  if (!property) notFound();

  const similar = properties.filter((item) => item.slug !== property.slug).slice(0, 3);

  // Resolve the first AVAILABLE unit ID for this property's project (for the inquiry form).
  let firstAvailableUnitId: string | undefined;
  const projectName = PROJECT_NAME_BY_SLUG[slug];

  if (projectName) {
    try {
      const developerId = getDefaultDeveloperId();
      const liveUnits = await findPublicUnits(developerId);
      const projectUnits = liveUnits.filter((u) => u.projectName === projectName);
      firstAvailableUnitId = projectUnits.find((u) => u.status === "AVAILABLE")?.id;
    } catch {
      // Non-fatal — form will submit without unit linkage
    }
  }

  return (
    <PageShell>
      <PropertyDetailView
        property={property}
        similar={similar}
        unitId={firstAvailableUnitId}
      />

      {/* Live unit picker for this property's project */}
      {projectName && (
        <section className="section" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
          <div style={{ maxWidth: "var(--content-max)", margin: "0 auto", padding: "0 var(--gutter)" }}>
            <span className="eyebrow">Units</span>
            <h2 className="font-headline-section" style={{ marginBottom: "0.5rem" }}>
              Available units — {projectName}
            </h2>
            <p className="meta" style={{ marginBottom: "1.5rem" }}>
              Select a unit to register your interest. Status is live.
            </p>
            <UnitsAvailability projectName={projectName} />
          </div>
        </section>
      )}
    </PageShell>
  );
}
