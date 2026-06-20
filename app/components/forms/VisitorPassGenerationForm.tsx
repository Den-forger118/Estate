"use client";

import { FormEvent, useState } from "react";

export const VISITOR_REG_KEY = "ernest_visitor_registrations";

const PURPOSES = [
  "Family visit",
  "Delivery / courier",
  "Contractor / tradesperson",
  "Event guest",
  "Real estate viewing",
  "Other",
];

export type VisitorRegistration = {
  id: string;
  visitorName: string;
  phone: string;
  date: string;
  time: string;
  vehicleReg: string | null;
  purpose: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  createdAt: string;
};

export function VisitorPreRegistrationForm() {
  const [visitorName, setVisitorName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [hasVehicle, setHasVehicle] = useState(false);
  const [vehicleReg, setVehicleReg] = useState("");
  const [purpose, setPurpose] = useState("");
  const [confirmed, setConfirmed] = useState<VisitorRegistration | null>(null);
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!visitorName.trim() || !phone.trim() || !date || !time || !purpose) {
      setError("Please complete all required fields.");
      return;
    }
    setError("");

    const reg: VisitorRegistration = {
      id: `VR-${Date.now()}`,
      visitorName: visitorName.trim(),
      phone: phone.trim(),
      date,
      time,
      vehicleReg: hasVehicle && vehicleReg.trim() ? vehicleReg.trim() : null,
      purpose,
      checkedIn: false,
      checkedInAt: null,
      createdAt: new Date().toISOString(),
    };

    const existing = JSON.parse(
      window.localStorage.getItem(VISITOR_REG_KEY) ?? "[]",
    ) as VisitorRegistration[];
    window.localStorage.setItem(VISITOR_REG_KEY, JSON.stringify([reg, ...existing]));
    setConfirmed(reg);
  }

  function handleReset() {
    setConfirmed(null);
    setVisitorName("");
    setPhone("");
    setDate("");
    setTime("");
    setHasVehicle(false);
    setVehicleReg("");
    setPurpose("");
    setError("");
  }

  if (confirmed) {
    const arrivalDate = new Date(confirmed.date + "T00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

    return (
      <div className="gate-pass-result">
        <div className="gate-pass-result-header">
          <span className="status-chip status-available">Confirmed</span>
          <h2>Visitor Registered</h2>
          <p className="meta">
            Security has been notified. {confirmed.visitorName} is expected at{" "}
            {confirmed.time} on {arrivalDate}.
          </p>
        </div>

        <div className="gate-pass-meta" style={{ marginTop: "1.5rem" }}>
          <dl className="gate-pass-meta-dl">
            <dt>Visitor</dt>
            <dd>{confirmed.visitorName}</dd>

            <dt>Phone</dt>
            <dd>{confirmed.phone}</dd>

            <dt>Expected at</dt>
            <dd>
              {confirmed.time} · {arrivalDate}
            </dd>

            <dt>Purpose</dt>
            <dd>{confirmed.purpose}</dd>

            {confirmed.vehicleReg && (
              <>
                <dt>Vehicle</dt>
                <dd>{confirmed.vehicleReg}</dd>
              </>
            )}
          </dl>
        </div>

        <div className="gate-pass-actions">
          <button className="btn btn-primary" type="button" onClick={handleReset}>
            Register Another Visitor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gate-pass-container">
      <div className="gate-pass-header">
        <span className="eyebrow">Resident Services</span>
        <h2 className="gate-pass-title">Pre-Register a Visitor</h2>
        <p className="gate-pass-description">
          Let security know who to expect before they arrive. Gate staff will see your
          visitor on their checklist and check them in on arrival — no phone calls needed.
        </p>
      </div>

      <form className="form-card gate-pass-form" onSubmit={handleSubmit}>
        {error && <p className="form-error">{error}</p>}

        <label>
          Visitor full name <span className="form-required">*</span>
          <input
            value={visitorName}
            onChange={(e) => setVisitorName(e.target.value)}
            placeholder="Name as it appears on their ID"
            required
          />
        </label>

        <label>
          Visitor phone number <span className="form-required">*</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+233 24 000 0000"
            required
          />
        </label>

        <label>
          Expected date <span className="form-required">*</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>

        <label>
          Expected arrival time <span className="form-required">*</span>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </label>

        <label>
          Purpose of visit <span className="form-required">*</span>
          <select value={purpose} onChange={(e) => setPurpose(e.target.value)} required>
            <option value="">Select purpose…</option>
            {PURPOSES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <div className="gate-pass-vehicle-toggle">
          <label className="gate-pass-vehicle-label">
            <input
              type="checkbox"
              className="gate-pass-vehicle-checkbox"
              checked={hasVehicle}
              onChange={(e) => setHasVehicle(e.target.checked)}
            />
            Visitor is arriving by vehicle
          </label>

          {hasVehicle && (
            <label>
              Vehicle registration plate
              <input
                value={vehicleReg}
                onChange={(e) => setVehicleReg(e.target.value)}
                placeholder="e.g. GR 1234-24"
              />
            </label>
          )}
        </div>

        <button className="btn btn-primary" type="submit">
          Register Visitor
        </button>
      </form>
    </div>
  );
}
