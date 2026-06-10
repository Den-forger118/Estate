"use client";

import { FormEvent, useState } from "react";

export function PropertyInquiryForm({
  propertyName,
  variant = "default",
}: {
  propertyName: string;
  variant?: "default" | "dossier";
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(`I would like to book an inspection for ${propertyName}.`);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      setError("Please complete all fields.");
      return;
    }
    setError("");
    setSuccess(true);
  }

  return (
    <form
      className={`form-card form-card-inquiry${variant === "dossier" ? " property-inquiry-dossier" : ""}`}
      onSubmit={submit}
    >
      <h3>Enquire about {propertyName}</h3>
      {success ? (
        <p className="form-success">Enquiry received for {propertyName}. We will contact you shortly.</p>
      ) : null}
      {error ? <p className="form-error">{error}</p> : null}
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
      </label>
      <label>
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
      </label>
      <label>
        Phone
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+233 24 000 0000" required />
      </label>
      <label>
        Message
        <textarea
          rows={variant === "dossier" ? 3 : 4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </label>
      <button className="btn btn-primary" type="submit">
        Send Inquiry
      </button>
    </form>
  );
}
