"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      setError("Please complete all fields.");
      return;
    }
    setError("");
    setSuccess(true);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setMessage("");
  }

  return (
    <form className="form-card" onSubmit={submit}>
      <h2>Send an enquiry</h2>
      {success ? (
        <p className="form-success">Thank you. We will be in touch within one business day.</p>
      ) : null}
      {error ? <p className="form-error">{error}</p> : null}
      <div className="form-grid two">
        <label>
          First name
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Avery" required />
        </label>
        <label>
          Last name
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Morgan" required />
        </label>
      </div>
      <label>
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="avery@example.com" required />
      </label>
      <label>
        Phone
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+233 24 000 0000" required />
      </label>
      <label>
        Message
        <textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="I would like to book an inspection for..." required />
      </label>
      <button className="btn btn-primary" type="submit">
        Submit Enquiry
      </button>
    </form>
  );
}
