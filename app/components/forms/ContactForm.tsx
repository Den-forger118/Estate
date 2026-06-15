"use client";

import { FormEvent, useState } from "react";
import { showToast } from "../Toast";

const SUBJECTS = [
  "Property inquiry",
  "Inspection booking",
  "Lease & rental",
  "Maintenance support",
  "General enquiry",
  "Other",
];

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !subject || !message.trim()) {
      setError("Please complete all fields before submitting.");
      return;
    }
    setError("");
    showToast("Message sent. We'll respond within one business day.");
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  }

  return (
    <form className="form-card" onSubmit={submit}>
      <h2>Send us a message</h2>
      <p className="meta">
        Estate management responds to all enquiries within one business day.
      </p>

      {error ? <p className="form-error">{error}</p> : null}

      <label>
        Full name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
        />
      </label>

      <label>
        Email address
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
      </label>

      <label>
        Subject
        <select value={subject} onChange={(e) => setSubject(e.target.value)} required>
          <option value="">Select a subject…</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label>
        Message
        <textarea
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what you need…"
          required
        />
      </label>

      <button className="btn btn-primary" type="submit">
        Send Message
      </button>
    </form>
  );
}
