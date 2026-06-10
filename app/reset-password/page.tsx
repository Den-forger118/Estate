"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { PageShell } from "../components/SiteChrome";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!password.trim() || !confirm.trim()) {
      setError("Please complete both password fields.");
      setMessage("");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      setMessage("");
      return;
    }
    setError("");
    setMessage("Your password has been updated.");
    window.setTimeout(() => router.push("/login"), 1500);
  }

  return (
    <PageShell>
      <section className="auth-section">
        <form className="form-card auth-card" onSubmit={submit}>
          <span className="eyebrow">New password</span>
          <h1>Create a new password.</h1>
          <p>Choose a strong password for your REMS account.</p>
          {message ? <p className="form-success">{message}</p> : null}
          {error ? <p className="form-error">{error}</p> : null}
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <label>
            Confirm password
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </label>
          <button className="btn btn-primary" type="submit">
            Update Password
          </button>
          <div className="auth-links">
            <Link href="/login">Return to login</Link>
          </div>
        </form>
      </section>
    </PageShell>
  );
}
