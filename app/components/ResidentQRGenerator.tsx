"use client";

import { FormEvent, useState } from "react";

type QRFormState = {
  visitorName: string;
  purpose: string;
  date: string;
};

function pickCellColor(seed: number, index: number): string {
  const bucket = (seed + index * 37) % 3;
  if (bucket === 0) return "var(--primary)";
  if (bucket === 1) return "var(--primary-fixed)";
  return "var(--surface-alt)";
}

export function ResidentQRGenerator() {
  const [form, setForm] = useState<QRFormState>({ visitorName: "", purpose: "", date: "" });
  const [generated, setGenerated] = useState(false);
  const [seed, setSeed] = useState(0);
  const [pass, setPass] = useState<QRFormState>({ visitorName: "", purpose: "", date: "" });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPass({ ...form });
    setSeed(form.visitorName.length * 7 + form.purpose.length * 13 + form.date.length * 3);
    setGenerated(true);
  }

  function handleReset() {
    setGenerated(false);
    setForm({ visitorName: "", purpose: "", date: "" });
  }

  return (
    <div className="qr-generator">
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Resident Services</span>
          <h1>Visitor Gate Pass</h1>
          <p>Generate a mock QR pass for your visitor. Present this at the security gate on the day of entry.</p>
        </div>
      </div>

      {!generated ? (
        <div className="dashboard-card">
          <form className="qr-generator-form form-grid" onSubmit={handleSubmit}>
            <label>
              Visitor name
              <input
                value={form.visitorName}
                onChange={(e) => setForm((f) => ({ ...f, visitorName: e.target.value }))}
                placeholder="Full name of your visitor"
                required
              />
            </label>
            <label>
              Purpose of visit
              <input
                value={form.purpose}
                onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
                placeholder="e.g. Family visit, Delivery, Contractor"
                required
              />
            </label>
            <label>
              Date of visit
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                required
              />
            </label>
            <button className="btn btn-primary" type="submit">
              Generate Pass
            </button>
          </form>
        </div>
      ) : (
        <div className="dashboard-card qr-generator-result">
          <p className="eyebrow">Gate pass generated</p>
          <div className="qr-generator-visual" role="img" aria-label="Mock QR code for visitor gate pass">
            {Array.from({ length: 49 }).map((_, i) => (
              <div
                key={i}
                className="qr-generator-cell"
                style={{ background: pickCellColor(seed, i) }}
              />
            ))}
          </div>
          <div className="qr-generator-meta">
            <p>
              <strong>{pass.visitorName}</strong>
            </p>
            <p className="meta">{pass.purpose} · {pass.date}</p>
            <p className="meta">Valid for one entry. Present at the security gate.</p>
          </div>
          <button className="btn btn-secondary" type="button" onClick={handleReset}>
            New Pass
          </button>
        </div>
      )}
    </div>
  );
}
