"use client";

import { FormEvent, useState } from "react";
import { showToast } from "../Toast";

const COUNTRY_CODES = [
  { code: "+233", label: "+233 GH" },
  { code: "+1", label: "+1 US/CA" },
  { code: "+44", label: "+44 UK" },
  { code: "+234", label: "+234 NG" },
  { code: "+27", label: "+27 ZA" },
  { code: "+49", label: "+49 DE" },
  { code: "+61", label: "+61 AU" },
];

const FINANCING_OPTIONS = [
  { value: "outright", label: "Outright Purchase" },
  { value: "installment", label: "Installment Plan" },
  { value: "mortgage", label: "Mortgage / Home Loan" },
];

const INQUIRIES_KEY = "ernest_inquiries";

type PurchaseInquiryRecord = {
  id: string;
  propertyName: string;
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  financing: string;
  message: string;
  submittedAt: string;
};

interface PropertyPurchaseInquiryFormProps {
  propertyName: string;
  variant?: "default" | "dossier";
}

export function PropertyPurchaseInquiryForm({
  propertyName,
  variant = "default",
}: PropertyPurchaseInquiryFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+233");
  const [phone, setPhone] = useState("");
  const [financing, setFinancing] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !financing || !message.trim()) {
      setError("Please complete all required fields.");
      return;
    }
    setError("");

    const record: PurchaseInquiryRecord = {
      id: `inq-${Date.now()}`,
      propertyName,
      name: name.trim(),
      email: email.trim(),
      countryCode,
      phone: phone.trim(),
      financing,
      message: message.trim(),
      submittedAt: new Date().toISOString(),
    };

    const existing = JSON.parse(
      window.localStorage.getItem(INQUIRIES_KEY) ?? "[]",
    ) as PurchaseInquiryRecord[];
    window.localStorage.setItem(INQUIRIES_KEY, JSON.stringify([record, ...existing]));

    showToast(`Inquiry submitted for ${propertyName}. We'll be in touch shortly.`);
    setName("");
    setEmail("");
    setPhone("");
    setFinancing("");
    setMessage("");
  }

  return (
    <form
      className={`form-card${variant === "dossier" ? " form-card-dossier" : ""}`}
      onSubmit={handleSubmit}
    >
      <h2>Express Interest</h2>
      <p className="meta">
        Submit your enquiry for <strong>{propertyName}</strong>. Our advisors will
        respond within one business day.
      </p>

      {error && <p className="form-error">{error}</p>}

      <label>
        Full name <span className="form-required">*</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
        />
      </label>

      <label>
        Email address <span className="form-required">*</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
      </label>

      <div className="phone-input-group">
        <label className="phone-code-label">
          Code
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="phone-number-label">
          Phone number <span className="form-required">*</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="24 000 0000"
            required
          />
        </label>
      </div>

      <label>
        Financing method <span className="form-required">*</span>
        <select
          value={financing}
          onChange={(e) => setFinancing(e.target.value)}
          required
        >
          <option value="">Select financing method…</option>
          {FINANCING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Message <span className="form-required">*</span>
        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Any specific requirements, questions, or preferred viewing times…"
          required
        />
      </label>

      <button className="btn btn-primary" type="submit">
        Submit Enquiry
      </button>
    </form>
  );
}
