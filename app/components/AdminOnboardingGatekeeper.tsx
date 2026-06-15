"use client";

import { useEffect, useState } from "react";
import {
  type ProspectRecord,
  approveProspect,
  readProspects,
  rejectProspect,
} from "../data/mockAuthStateMachine";
import { showToast } from "./Toast";
import { statusClassForLabel } from "./statusBadge";

function ProspectIdentityCard({ prospect }: { prospect: ProspectRecord }) {
  const isGhanaCard = prospect.idType !== "Passport";
  return (
    <div
      className={`kyc-id-card${isGhanaCard ? " kyc-id-card-ghana" : " kyc-id-card-passport"}`}
      aria-label={`${prospect.idType ?? "Ghana Card"} preview for ${prospect.name}`}
    >
      <div className="kyc-id-card-header">
        <div className="kyc-id-card-chip" aria-hidden="true" />
        <span className="kyc-id-card-type">{prospect.idType ?? "Ghana Card"}</span>
      </div>

      <div className="kyc-id-card-photo-zone" aria-label="ID photo placeholder">
        {prospect.idPhotoName ? (
          <span className="kyc-id-card-photo-name meta">{prospect.idPhotoName}</span>
        ) : (
          <span className="kyc-id-card-initials" aria-hidden="true">
            {prospect.name
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </span>
        )}
      </div>

      <div className="kyc-id-card-body">
        <p className="kyc-id-card-name">{prospect.name}</p>
        <p className="kyc-id-card-num">{prospect.idNumber ?? "—"}</p>
        <p className="kyc-id-card-nation meta">{prospect.nationality ?? "Not provided"}</p>
      </div>
    </div>
  );
}

export function AdminOnboardingGatekeeper() {
  const [prospects, setProspects] = useState<ProspectRecord[]>([]);
  const [selected, setSelected] = useState<ProspectRecord | null>(null);

  function refresh() {
    const fresh = readProspects();
    setProspects(fresh);
    if (selected) {
      const updated = fresh.find((p) => p.id === selected.id) ?? null;
      setSelected(updated);
    }
  }

  useEffect(() => {
    refresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleApprove(id: string) {
    approveProspect(id);
    refresh();
    showToast("Prospect approved — their session will be cleared automatically.");
  }

  function handleReject(id: string) {
    rejectProspect(id);
    refresh();
    showToast("Prospect application rejected.");
  }

  const pending = prospects.filter((p) => p.status === "pending").length;
  const approved = prospects.filter((p) => p.status === "approved").length;

  return (
    <>
      <div className="onboarding-gate-header">
        <div>
          <span className="eyebrow">Onboarding</span>
          <h1>Prospect Approvals</h1>
          <p>
            Review incoming KYC submissions. Select a prospect to inspect their identity
            document and grant or deny estate access.
          </p>
        </div>
        <div className="onboarding-gate-kpi">
          <div className="dashboard-card stat-card">
            <span>Pending</span>
            <strong className="font-data-lg">{pending}</strong>
          </div>
          <div className="dashboard-card stat-card">
            <span>Approved</span>
            <strong className="font-data-lg">{approved}</strong>
          </div>
          <div className="dashboard-card stat-card">
            <span>Total</span>
            <strong className="font-data-lg">{prospects.length}</strong>
          </div>
        </div>
      </div>

      <div className="onboarding-split-view">
        <div className="onboarding-prospect-list dashboard-card">
          <h2>Registrations</h2>
          {prospects.length === 0 ? (
            <p className="meta">No prospects registered yet.</p>
          ) : (
            <ul className="onboarding-prospect-items">
              {prospects.map((p) => (
                <li
                  key={p.id}
                  className={`onboarding-prospect-row${selected?.id === p.id ? " onboarding-prospect-row-active" : ""}`}
                  onClick={() => setSelected(p)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setSelected(p)}
                  aria-pressed={selected?.id === p.id}
                >
                  <div className="onboarding-prospect-avatar" aria-hidden="true">
                    {p.name
                      .split(" ")
                      .map((s) => s[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="onboarding-prospect-info">
                    <strong>{p.name}</strong>
                    <span className="meta">{p.registeredAt}</span>
                  </div>
                  <span className={`status-chip ${statusClassForLabel(p.status)}`}>
                    {p.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="onboarding-kyc-panel dashboard-card">
          {!selected ? (
            <div className="onboarding-kyc-empty">
              <span className="onboarding-kyc-empty-icon" aria-hidden="true">◈</span>
              <p>Select a prospect from the list to review their KYC submission.</p>
            </div>
          ) : (
            <>
              <div className="onboarding-kyc-panel-header">
                <div>
                  <span className="eyebrow">KYC Review</span>
                  <h2>{selected.name}</h2>
                </div>
                <span className={`status-chip ${statusClassForLabel(selected.status)}`}>
                  {selected.status}
                </span>
              </div>

              <ProspectIdentityCard prospect={selected} />

              <dl className="onboarding-kyc-fields">
                <dt>Email</dt>
                <dd>{selected.email}</dd>

                <dt>Phone</dt>
                <dd>{selected.phone}</dd>

                <dt>Nationality</dt>
                <dd>{selected.nationality ?? <span className="meta">Not provided</span>}</dd>

                <dt>ID Document</dt>
                <dd>
                  {selected.idType ?? "Ghana Card"}
                  {selected.idNumber ? ` · ${selected.idNumber}` : ""}
                </dd>

                <dt>Property interest</dt>
                <dd>{selected.propertyInterest}</dd>

                <dt>Registered</dt>
                <dd>{selected.registeredAt}</dd>
              </dl>

              {selected.status === "pending" && (
                <div className="onboarding-kyc-actions">
                  <button
                    className="btn onboarding-approve-btn"
                    type="button"
                    onClick={() => handleApprove(selected.id)}
                  >
                    ✓ Approve Asset Allocation
                  </button>
                  <button
                    className="btn onboarding-reject-btn"
                    type="button"
                    onClick={() => handleReject(selected.id)}
                  >
                    ✕ Reject Application
                  </button>
                </div>
              )}

              {selected.status !== "pending" && (
                <p className="meta onboarding-kyc-decided">
                  This application has been {selected.status}. No further action
                  required.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
