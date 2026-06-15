import { notFound } from "next/navigation";
import { PageShell } from "../../../components/SiteChrome";
import { TrustLayerCertificate } from "../../../components/TrustLayerCertificate";
import { searchTrustLedger } from "../../../data/mockTrustLedger";

type PageProps = {
  params: Promise<{ reference: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { reference } = await params;
  return {
    title: `Receipt ${reference} | Special Gardens`,
  };
}

export default async function PublicReceiptValidator({ params }: PageProps) {
  const { reference } = await params;
  const entry = searchTrustLedger(reference);

  if (!entry || entry.type !== "payment") {
    notFound();
  }

  return (
    <PageShell>
      <section className="section">
        <div className="section-intro">
          <span className="eyebrow">Payment Receipt</span>
          <h1>Validated Record</h1>
          <p>This payment has been verified against the Special Gardens Trust Ledger.</p>
        </div>
        <TrustLayerCertificate entry={entry} />
      </section>
    </PageShell>
  );
}
