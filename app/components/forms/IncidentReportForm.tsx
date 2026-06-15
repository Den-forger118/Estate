"use client";

import { DragEvent, FormEvent, useState } from "react";
import { submitResidentTicket } from "../../data/mockMaintenanceEngine";
import { getStoredName } from "../../data/roles";
import { showToast } from "../Toast";

const CATEGORIES = ["Security", "Plumbing", "Electrical", "Structural", "Other"];

const URGENCY_LEVELS: { value: "Low" | "Medium" | "High"; label: string; description: string }[] =
  [
    { value: "Low", label: "Low", description: "Not urgent, can wait a few days" },
    { value: "Medium", label: "Medium", description: "Should be addressed within 48 hours" },
    { value: "High", label: "High", description: "Requires immediate attention" },
  ];

const URGENCY_TO_PRIORITY = {
  Low: "Low" as const,
  Medium: "Medium" as const,
  High: "Urgent" as const,
};

export function IncidentReportForm() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState<"Low" | "Medium" | "High">("Medium");
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [error, setError] = useState("");

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setPhotoFile(file.name);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPhotoFile(file.name);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim() || !category || !description.trim()) {
      setError("Please complete all required fields.");
      return;
    }
    setError("");

    const reporterName = getStoredName();
    const ticket = submitResidentTicket({
      title: title.trim(),
      description: `Reported by: ${reporterName}\nCategory: ${category}\n\n${description.trim()}`,
      property: "Special Gardens Estate",
      unit: "—",
      priority: URGENCY_TO_PRIORITY[urgency],
    });

    setTicketId(ticket.id);
    setSubmitted(true);
    showToast(`Report submitted — Ticket ${ticket.id} created.`);
  }

  if (submitted) {
    return (
      <div className="incident-confirmation-panel">
        <div className="incident-confirmation-header">
          <span className="incident-confirmation-icon" aria-hidden="true">✓</span>
          <div>
            <h2>Report Received</h2>
            <p className="meta">
              Your incident has been logged and will be reviewed by the estate management
              team. You will be notified of any updates.
            </p>
          </div>
        </div>

        <dl className="incident-confirmation-dl">
          <dt>Ticket ID</dt>
          <dd className="font-data-md">{ticketId}</dd>

          <dt>Title</dt>
          <dd>{title}</dd>

          <dt>Category</dt>
          <dd>{category}</dd>

          <dt>Urgency</dt>
          <dd>
            <span className={`status-chip ${urgency === "High" ? "status-urgent" : urgency === "Medium" ? "status-medium" : "status-low"}`}>
              {urgency}
            </span>
          </dd>

          <dt>Description</dt>
          <dd>{description}</dd>
        </dl>

        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => {
            setSubmitted(false);
            setTitle("");
            setCategory("");
            setUrgency("Medium");
            setDescription("");
            setPhotoFile(null);
            setTicketId("");
          }}
        >
          Submit Another Report
        </button>
      </div>
    );
  }

  return (
    <div className="incident-report-container">
      <div className="incident-report-header">
        <span className="eyebrow">Resident Services</span>
        <h2 className="incident-report-title">Report an Incident</h2>
        <p className="incident-report-description">
          Submit a report for any security, maintenance, or structural issue within the
          estate. Your report will be escalated to the management team immediately.
        </p>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        {error && <p className="form-error">{error}</p>}

        <label>
          Incident title <span className="form-required">*</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief, specific description of the incident"
            required
          />
        </label>

        <label>
          Category <span className="form-required">*</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select category…</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="incident-urgency-group">
          <legend>
            Urgency level <span className="form-required">*</span>
          </legend>
          <div className="incident-urgency-options">
            {URGENCY_LEVELS.map(({ value, label, description }) => (
              <label
                key={value}
                className={`incident-urgency-label${urgency === value ? " incident-urgency-label-active" : ""}`}
              >
                <input
                  type="radio"
                  name="urgency"
                  value={value}
                  checked={urgency === value}
                  onChange={() => setUrgency(value)}
                />
                <strong>{label}</strong>
                <span className="meta">{description}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label>
          Description <span className="form-required">*</span>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide as much detail as possible: what happened, when, where, and who was involved…"
            required
          />
        </label>

        <div className="kyc-upload-zone-wrap">
          <span className="kyc-upload-zone-label">
            Photo evidence{" "}
            <span className="meta">(optional — helps expedite resolution)</span>
          </span>
          <div
            className={`kyc-upload-zone${dragging ? " kyc-upload-zone-active" : ""}${photoFile ? " kyc-upload-zone-done" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            role="region"
            aria-label="Photo upload drop zone"
          >
            {photoFile ? (
              <>
                <span className="kyc-upload-icon" aria-hidden="true">✓</span>
                <p>
                  <strong>{photoFile}</strong>
                </p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setPhotoFile(null)}
                >
                  Remove
                </button>
              </>
            ) : (
              <>
                <span className="kyc-upload-icon" aria-hidden="true">↑</span>
                <p>Drag &amp; drop a photo here</p>
                <label className="btn btn-secondary kyc-upload-browse">
                  Browse Files
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="kyc-upload-input"
                  />
                </label>
              </>
            )}
          </div>
        </div>

        <button className="btn btn-primary" type="submit">
          Submit Incident Report
        </button>
      </form>
    </div>
  );
}
