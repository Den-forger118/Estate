"use client";

import { FormEvent, useState } from "react";
import { showToast } from "../Toast";

const PURPOSES = [
  "Family visit",
  "Delivery / courier",
  "Contractor / tradesperson",
  "Event guest",
  "Real estate viewing",
  "Other",
];

const GATE_PASSES_KEY = "ernest_gate_passes";

type GatePassRecord = {
  id: string;
  visitorName: string;
  phone: string;
  date: string;
  time: string;
  vehicleReg: string | null;
  purpose: string;
  createdAt: string;
};

function buildQrSeed(text: string): boolean[] {
  const cells: boolean[] = [];
  for (let i = 0; i < 49; i++) {
    const charCode = text.charCodeAt(i % text.length);
    cells.push((charCode + i * 7) % 3 !== 0);
  }
  return cells;
}

export function VisitorPassGenerationForm() {
  const [visitorName, setVisitorName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [hasVehicle, setHasVehicle] = useState(false);
  const [vehicleReg, setVehicleReg] = useState("");
  const [purpose, setPurpose] = useState("");
  const [generatedPass, setGeneratedPass] = useState<GatePassRecord | null>(null);
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!visitorName.trim() || !phone.trim() || !date || !time || !purpose) {
      setError("Please complete all required fields.");
      return;
    }
    setError("");

    const pass: GatePassRecord = {
      id: `GP-${Date.now()}`,
      visitorName: visitorName.trim(),
      phone: phone.trim(),
      date,
      time,
      vehicleReg: hasVehicle && vehicleReg.trim() ? vehicleReg.trim() : null,
      purpose,
      createdAt: new Date().toISOString(),
    };

    const existing = JSON.parse(
      window.localStorage.getItem(GATE_PASSES_KEY) ?? "[]",
    ) as GatePassRecord[];
    window.localStorage.setItem(GATE_PASSES_KEY, JSON.stringify([pass, ...existing]));
    setGeneratedPass(pass);
  }

  function handleShareUrl() {
    const mockUrl = `https://gate.specialgardens.example/v/${generatedPass?.id}`;
    navigator.clipboard.writeText(mockUrl).then(() => {
      showToast("Pass URL copied to clipboard.");
    });
  }

  function handleNewPass() {
    setGeneratedPass(null);
    setVisitorName("");
    setPhone("");
    setDate("");
    setTime("");
    setHasVehicle(false);
    setVehicleReg("");
    setPurpose("");
    setError("");
  }

  if (generatedPass) {
    const qrCells = buildQrSeed(generatedPass.id + generatedPass.visitorName);
    return (
      <div className="gate-pass-result">
        <div className="gate-pass-result-header">
          <span className="status-chip status-available">Active</span>
          <h2>Visitor Pass Generated</h2>
          <p className="meta">
            Present this pass at the gate or share the URL with your visitor.
          </p>
        </div>

        <div className="gate-pass-qr-wrap">
          <div
            className="gate-pass-qr-grid"
            aria-label={`QR code for pass ${generatedPass.id}`}
          >
            {qrCells.map((filled, idx) => (
              <div
                key={idx}
                className={`gate-pass-qr-cell${filled ? " gate-pass-qr-cell-filled" : ""}`}
                aria-hidden="true"
              />
            ))}
          </div>

          <div className="gate-pass-meta">
            <p className="gate-pass-meta-title">{generatedPass.id}</p>
            <dl className="gate-pass-meta-dl">
              <dt>Visitor</dt>
              <dd>{generatedPass.visitorName}</dd>

              <dt>Phone</dt>
              <dd>{generatedPass.phone}</dd>

              <dt>Date &amp; time</dt>
              <dd>
                {generatedPass.date} at {generatedPass.time}
              </dd>

              <dt>Purpose</dt>
              <dd>{generatedPass.purpose}</dd>

              {generatedPass.vehicleReg ? (
                <>
                  <dt>Vehicle</dt>
                  <dd>{generatedPass.vehicleReg}</dd>
                </>
              ) : null}
            </dl>
          </div>
        </div>

        <div className="gate-pass-actions">
          <button className="btn btn-primary" type="button" onClick={handleShareUrl}>
            Share Pass URL
          </button>
          <button className="btn btn-secondary" type="button" onClick={handleNewPass}>
            Generate New Pass
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gate-pass-container">
      <div className="gate-pass-header">
        <span className="eyebrow">Resident Services</span>
        <h2 className="gate-pass-title">Generate Visitor Pass</h2>
        <p className="gate-pass-description">
          Create a time-stamped QR pass for an expected visitor. The gate scanner
          will verify this pass on arrival.
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
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            required
          >
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
          Generate Pass
        </button>
      </form>
    </div>
  );
}
