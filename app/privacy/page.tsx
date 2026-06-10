import { SignatureNumber } from "../components/SignatureNumber";
import { PageShell } from "../components/SiteChrome";

export default function PrivacyPage() {
  return (
    <PageShell>
      <section className="page-hero signature-anchor">
        <SignatureNumber number="01" />
        <div className="page-hero-inner">
          <div className="stack">
            <span className="eyebrow">Legal</span>
            <h1>Privacy Policy</h1>
          </div>
          <p>
            How Special Gardens collects, uses, and protects resident and owner information across our managed communities.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
