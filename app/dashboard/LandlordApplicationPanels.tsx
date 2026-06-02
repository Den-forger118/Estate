"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  getOwnerApplicationForEmail,
  getStoredEmail,
  getStoredName,
  getStoredRole,
  readApplications,
  reviewLandlordApplication,
  submitLandlordApplication,
  type LandlordApplication,
} from "../data/roles";
import { moduleMeta } from "../data/dashboard";

export function LandlordApplicationSubmitPanel() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [property, setProperty] = useState("Oak Court Townhome");
  const [unit, setUnit] = useState("B-0311");
  const [note, setNote] = useState("");
  const [application, setApplication] = useState<LandlordApplication | undefined>();
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const storedEmail = getStoredEmail();
    const storedName = getStoredName();
    setEmail(storedEmail);
    setName(storedName);
    setApplication(getOwnerApplicationForEmail(storedEmail));
  }, [submitted]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (getStoredRole() !== "owner") return;

    submitLandlordApplication({ name, email, property, unit, note });
    setSubmitted(true);
    setApplication(getOwnerApplicationForEmail(email));
  }

  const meta = moduleMeta["landlord-application"];
  const status = application?.status;

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">{meta.label}</span>
          <h1>Apply to become a landlord</h1>
          <p>
            After you purchase a home in the estate, submit this application. An administrator or
            property manager must approve before you can lease your unit to tenants.
          </p>
        </div>
      </div>

      {status === "pending" ? (
        <div className="dashboard-card role-status-banner pending">
          <strong>Application pending review</strong>
          <p>
            Your request for {application?.property} ({application?.unit}) is awaiting approval.
          </p>
        </div>
      ) : null}

      {status === "approved" ? (
        <div className="dashboard-card role-status-banner approved">
          <strong>You are approved as a landlord</strong>
          <p>Your account now has leasing modules. Refresh if navigation has not updated yet.</p>
        </div>
      ) : null}

      {status === "rejected" ? (
        <div className="dashboard-card role-status-banner rejected">
          <strong>Application not approved</strong>
          <p>You may update details and submit a new request below.</p>
        </div>
      ) : null}

      {!status || status === "rejected" ? (
        <form className="dashboard-card form-grid" onSubmit={onSubmit}>
          <label>
            Property
            <input value={property} onChange={(event) => setProperty(event.target.value)} required />
          </label>
          <label>
            Unit
            <input value={unit} onChange={(event) => setUnit(event.target.value)} required />
          </label>
          <label className="form-grid-span">
            Why should you be approved to lease this unit?
            <textarea
              rows={4}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Handover status, intended lease terms, compliance notes…"
              required
            />
          </label>
          <button className="btn btn-primary" type="submit">
            Submit application
          </button>
        </form>
      ) : null}
    </>
  );
}

export function LandlordApplicationsReviewPanel() {
  const [applications, setApplications] = useState<LandlordApplication[]>([]);

  function refresh() {
    setApplications(readApplications());
  }

  useEffect(() => {
    refresh();
  }, []);

  function decide(id: string, decision: "approved" | "rejected") {
    reviewLandlordApplication(id, decision);
    refresh();
  }

  const meta = moduleMeta["landlord-applications"];
  const pending = applications.filter((app) => app.status === "pending");

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">{meta.label}</span>
          <h1>Landlord application queue</h1>
          <p>{meta.summary}</p>
        </div>
      </div>

      <div className="dashboard-kpi-grid">
        <article className="dashboard-card kpi-card">
          <div>
            <span>Pending</span>
            <strong>{pending.length}</strong>
            <small>Awaiting your decision</small>
          </div>
        </article>
        <article className="dashboard-card kpi-card">
          <div>
            <span>Approved</span>
            <strong>{applications.filter((a) => a.status === "approved").length}</strong>
            <small>Active landlords</small>
          </div>
        </article>
      </div>

      <div className="dashboard-card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Property</th>
              <th>Unit</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td>
                  <strong>{app.name}</strong>
                  <br />
                  <span className="meta">{app.email}</span>
                </td>
                <td>{app.property}</td>
                <td>{app.unit}</td>
                <td>{app.submittedAt}</td>
                <td>
                  <span className={`status-chip status-${app.status}`}>{app.status}</span>
                </td>
                <td>
                  {app.status === "pending" ? (
                    <div className="dashboard-actions inline-actions">
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={() => decide(app.id, "approved")}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={() => decide(app.id, "rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="meta">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pending[0] ? (
        <article className="dashboard-card">
          <h2>Latest note</h2>
          <p>{pending[0].note}</p>
        </article>
      ) : null}
    </>
  );
}
