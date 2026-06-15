import type { TrustEntry } from "../data/mockTrustLedger";
import { statusClassForLabel } from "./statusBadge";

type TrustLayerCertificateProps = {
  entry: TrustEntry;
};

export function TrustLayerCertificate({ entry }: TrustLayerCertificateProps) {
  return (
    <div className="trust-certificate">
      <div className="trust-certificate-header">
        <div className="trust-certificate-seal" aria-hidden="true">✦</div>
        <div>
          <span className="eyebrow">Special Gardens Estate</span>
          <h2 className="trust-certificate-title">
            {entry.type === "certificate" ? "Compliance Certificate" : "Payment Verification"}
          </h2>
        </div>
      </div>

      <dl className="trust-certificate-body">
        <dt>Reference</dt>
        <dd className="font-data-md">{entry.reference}</dd>

        <dt>Party</dt>
        <dd>{entry.party}</dd>

        {entry.property && (
          <>
            <dt>Property</dt>
            <dd>{entry.property}</dd>
          </>
        )}

        {entry.amount !== undefined && (
          <>
            <dt>Amount</dt>
            <dd className="font-data-md">GH₵ {entry.amount.toLocaleString()}</dd>
          </>
        )}

        <dt>Issued</dt>
        <dd>{entry.issuedAt}</dd>

        {entry.validUntil && (
          <>
            <dt>Valid Until</dt>
            <dd>{entry.validUntil}</dd>
          </>
        )}
      </dl>

      <div className="trust-certificate-footer">
        <span className={`status-chip ${statusClassForLabel(entry.status)}`}>
          {entry.status}
        </span>
        <span className="meta">Issued by Special Gardens Estate Management</span>
      </div>
    </div>
  );
}
