"use client";

import { useState } from "react";
import { PageShell } from "../../components/SiteChrome";
import { TrustLayerCertificate } from "../../components/TrustLayerCertificate";
import { searchTrustLedger, TrustEntry } from "../../data/mockTrustLedger";

function TrustLayerVerificationForm() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<TrustEntry | null | undefined>(undefined);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(searchTrustLedger(query));
  }

  return (
    <div className="verify-portal">
      <form className="verify-portal-form" onSubmit={handleSubmit}>
        <label>
          Reference code
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. SGE-2026-001"
            required
          />
        </label>
        <button className="btn btn-primary" type="submit">
          Verify Record
        </button>
      </form>

      {result !== undefined && (
        <div className="verify-portal-result">
          {result ? (
            <TrustLayerCertificate entry={result} />
          ) : (
            <div className="dashboard-card verify-portal-miss">
              <p>
                <strong>No record found</strong> for reference <span className="font-data-md">{query}</span>.
              </p>
              <p className="meta">
                Check the reference code and try again, or contact the estate office for assistance.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrustLayerVerificationPortal() {
  return (
    <PageShell>
      <section className="section">
        <div className="section-intro">
          <span className="eyebrow">Trust Layer</span>
          <h1>Verification Portal</h1>
          <p>
            Enter a Special Gardens reference code to view a verified payment receipt or compliance
            certificate. All records are cryptographically stamped and tamper-evident.
          </p>
        </div>
        <TrustLayerVerificationForm />
      </section>
    </PageShell>
  );
}
