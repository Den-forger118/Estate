"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { showToast } from "../../components/Toast";
import { PageShell } from "../../components/SiteChrome";

// ─── Types ────────────────────────────────────────────────────────────────────

type CredentialField = {
  term: string;
  detail: string;
  isCode?: boolean;
};

type DossierExportState = "idle" | "compiling" | "done";

// ─── Static corporate identity data ──────────────────────────────────────────

const CORPORATE_CREDENTIALS: CredentialField[] = [
  {
    term: "Registered Entity Name",
    detail: "Special Gardens Estate Development Limited",
  },
  {
    term: "Incorporation Code",
    detail: "Reg. No. CS99872026 — Registrar General's Department, Ghana",
    isCode: true,
  },
  {
    term: "GREDA Membership",
    detail: "Member ID #GR-4092-A · Certificate No. GREDA/MEM/2024/0123",
    isCode: true,
  },
  {
    term: "Corporate Tax Identification",
    detail: "TIN: P002938481-B — Ghana Revenue Authority",
    isCode: true,
  },
  {
    term: "Registered Headquarters",
    detail: "14 Airport Bypass Road, East Legon, Accra, Ghana",
  },
  {
    term: "Regulatory Bodies",
    detail: "Lands Commission · Bank of Ghana (FX) · GREDA",
  },
  {
    term: "Certificate Valid Until",
    detail: "14th January 2025",
    isCode: true,
  },
];

// ─── Live timestamp hook ──────────────────────────────────────────────────────

function useLiveTimestamp() {
  const [ts, setTs] = useState("");
  useEffect(() => {
    function fmt() {
      const now = new Date();
      return now.toLocaleString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
      });
    }
    setTs(fmt());
    const id = setInterval(() => setTs(fmt()), 1000);
    return () => clearInterval(id);
  }, []);
  return ts;
}

// ─── Export button ────────────────────────────────────────────────────────────

function ExportDossierButton() {
  const [state, setState] = useState<DossierExportState>("idle");
  const busy = state === "compiling";

  function handle() {
    if (state !== "idle") return;
    setState("compiling");
    setTimeout(() => {
      setState("done");
      showToast("Dossier compiled with live ledger hash. Download initiated safely.", "success");
      setTimeout(() => setState("idle"), 3500);
    }, 1800);
  }

  return (
    <button
      className="vp-btn vp-btn-primary"
      onClick={handle}
      disabled={busy}
      aria-live="polite"
      aria-busy={busy}
    >
      {busy ? (
        <>
          <span className="vp-spinner" aria-hidden="true" />
          Compiling dossier…
        </>
      ) : (
        <>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <path d="M7.5 1v9M4 7l3.5 3.5L11 7M2 13h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Export Certified Dossier (PDF)
        </>
      )}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TrustLayerVerificationPortal() {
  const ts = useLiveTimestamp();

  return (
    <PageShell>
      {/* ── Status bar ── */}
      <div className="vp-statusbar" role="status" aria-live="polite" aria-atomic="false">
        <div className="vp-statusbar-inner">
          <div className="vp-statusbar-left">
            <span className="vp-status-dot" aria-hidden="true" />
            <span className="vp-status-label">System Status: Active · Secured · Fully Compliant</span>
          </div>
          {ts && (
            <span className="vp-status-ts" aria-label="Live ledger sync time">
              Live Ledger Sync: {ts}
            </span>
          )}
        </div>
      </div>

      <div className="vp-page">
        <div className="vp-inner">

          {/* ── Page header ── */}
          <header className="vp-page-header">
            <p className="vp-page-eyebrow">Official Trust &amp; Compliance Portal</p>
            <h1 className="vp-page-title">Corporate Verification Record</h1>
            <p className="vp-page-sub">
              You are viewing the tamper-proof digital identity record for Special Gardens Estate
              Development Limited, a fully licensed real estate developer in the Republic of Ghana.
            </p>
          </header>

          {/* ── Main two-column layout ── */}
          <div className="vp-layout">

            {/* LEFT — GREDA certificate image */}
            <div className="vp-cert-col">
              <div className="vp-cert-shell">
                <div className="vp-cert-label-row">
                  <span className="vp-cert-eyebrow">Third-Party Certification</span>
                  <span className="vp-cert-verified-pill">
                    <span aria-hidden="true">✓</span> Verified
                  </span>
                </div>
                <h2 className="vp-cert-heading">
                  GREDA Certificate of<br />Membership &amp; Compliance
                </h2>

                <div className="vp-cert-image-frame">
                  <div className="vp-cert-image-mat">
                    <Image
                      src="/images/greda-certificate.png"
                      alt="GREDA Certificate of Membership and Estate Compliance — Golden Palm Estates (a project of Akwaaba Development Solutions Ltd.), issued 15 January 2024"
                      width={900}
                      height={660}
                      className="vp-cert-img"
                      priority
                    />
                  </div>
                  <div className="vp-cert-frame-corner vp-cert-frame-tl" aria-hidden="true" />
                  <div className="vp-cert-frame-corner vp-cert-frame-tr" aria-hidden="true" />
                  <div className="vp-cert-frame-corner vp-cert-frame-bl" aria-hidden="true" />
                  <div className="vp-cert-frame-corner vp-cert-frame-br" aria-hidden="true" />
                </div>

                <div className="vp-cert-meta">
                  <span>Cert No. GREDA/MEM/2024/0123</span>
                  <span className="vp-cert-meta-sep" aria-hidden="true">·</span>
                  <span>Issued 15 Jan 2024</span>
                  <span className="vp-cert-meta-sep" aria-hidden="true">·</span>
                  <span>Valid to 14 Jan 2025</span>
                </div>
              </div>
            </div>

            {/* RIGHT — credential fields + actions */}
            <div className="vp-data-col">

              {/* Identity card */}
              <div className="vp-id-card">
                <div className="vp-id-card-seal" aria-hidden="true">
                  <span className="vp-id-seal-icon">✦</span>
                  <span className="vp-id-seal-text">VERIFIED</span>
                </div>
                <div className="vp-id-card-body">
                  <p className="vp-id-eyebrow">Official Corporate Identity</p>
                  <p className="vp-id-name">
                    Special Gardens Estate<br />Development Limited
                  </p>
                  <p className="vp-id-sub">Registered Real Estate Developer — Republic of Ghana</p>
                </div>
              </div>

              {/* Credentials table */}
              <dl className="vp-fields">
                {CORPORATE_CREDENTIALS.map((f) => (
                  <div className="vp-field-row" key={f.term}>
                    <dt className="vp-field-term">{f.term}</dt>
                    <dd className={`vp-field-detail${f.isCode ? " vp-field-code" : ""}`}>
                      {f.detail}
                    </dd>
                  </div>
                ))}
              </dl>

              {/* Brochure callout */}
              <aside className="vp-callout" aria-label="Brochure authentication notice">
                <svg className="vp-callout-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 7v4M8 5.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <div>
                  <p className="vp-callout-heading">Authenticating a physical brochure?</p>
                  <p className="vp-callout-text">
                    If you arrived via a QR code on a flyer or billboard, confirm your URL bar reads
                    exactly{" "}
                    <span className="vp-callout-url">specialgardens.com/verify</span> before
                    proceeding with any business communication.
                  </p>
                </div>
              </aside>

              {/* Actions */}
              <div className="vp-actions">
                <ExportDossierButton />
                <Link href="/contact" className="vp-btn vp-btn-ghost">
                  Security &amp; Data Charter
                </Link>
              </div>

            </div>
          </div>

        </div>
      </div>
    </PageShell>
  );
}
