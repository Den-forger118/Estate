import { SignatureNumber } from "../components/SignatureNumber";
import { PageShell } from "../components/SiteChrome";

export default function TermsPage() {
  return (
    <PageShell>
      <section className="page-hero signature-anchor">
        <SignatureNumber number="01" />
        <div className="page-hero-inner">
          <div className="stack">
            <span className="eyebrow">Legal</span>
            <h1>Terms of Service</h1>
          </div>
          <p>
            Terms governing use of Special Gardens platforms, resident services, and property management communications.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
