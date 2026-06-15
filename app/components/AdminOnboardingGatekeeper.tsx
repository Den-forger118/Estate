"use client";

import { useEffect, useState } from "react";
import {
  ProspectRecord,
  approveProspect,
  readProspects,
  rejectProspect,
} from "../data/mockAuthStateMachine";
import { showToast } from "./Toast";
import { statusClassForLabel } from "./statusBadge";

export function AdminOnboardingGatekeeper() {
  const [prospects, setProspects] = useState<ProspectRecord[]>([]);

  function refresh() {
    setProspects(readProspects());
  }

  useEffect(() => {
    refresh();
  }, []);

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
          <p>Review registered prospects and promote approved applicants to Owner status.</p>
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

      <div className="dashboard-card table-card">
        <table className="zebra-rows">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Interest</th>
              <th>Registered</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {prospects.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <span className="meta">No prospects registered yet.</span>
                </td>
              </tr>
            ) : (
              prospects.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.email}</td>
                  <td>{p.phone}</td>
                  <td>{p.propertyInterest}</td>
                  <td>{p.registeredAt}</td>
                  <td>
                    <span className={`status-chip ${statusClassForLabel(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    {p.status === "pending" && (
                      <div className="dashboard-actions">
                        <button
                          className="btn btn-primary"
                          type="button"
                          onClick={() => handleApprove(p.id)}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-secondary"
                          type="button"
                          onClick={() => handleReject(p.id)}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
