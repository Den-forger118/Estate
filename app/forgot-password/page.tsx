"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { PageShell } from "../components/SiteChrome";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      setMessage("");
      return;
    }
    setError("");
    setMessage("If this email is registered, a reset link has been sent.");
  }

  return (
    <PageShell>
      <section className="auth-section">
        <form className="form-card auth-card" onSubmit={submit}>
          <span className="eyebrow">Account recovery</span>
          <h1>Reset your dashboard password.</h1>
          <p>Enter the email associated with your REMS account and we will send reset instructions.</p>
          {message ? <p className="form-success">{message}</p> : null}
          {error ? <p className="form-error">{error}</p> : null}
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </label>
          <button className="btn btn-primary" type="submit">
            Send Reset Link
          </button>
          <div className="auth-links">
            <Link href="/login">Return to login</Link>
          </div>
        </form>
      </section>
    </PageShell>
  );
}
