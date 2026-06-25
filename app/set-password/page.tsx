"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { PageShell } from "../components/SiteChrome";

type TokenState = "checking" | "valid" | "expired" | "missing";
type FormState = "idle" | "loading" | "success" | "error";

function SetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") ?? "";
  const [tokenState, setTokenState] = useState<TokenState>(token ? "checking" : "missing");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setTokenState("missing");
      return;
    }
    void (async () => {
      try {
        const res = await fetch(
          `/api/v1/auth/set-password/validate?token=${encodeURIComponent(token)}`,
        );
        const data = (await res.json()) as { valid: boolean };
        setTokenState(data.valid ? "valid" : "expired");
      } catch {
        setTokenState("expired");
      }
    })();
  }, [token]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setFormState("loading");
    try {
      const res = await fetch("/api/v1/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; issues?: string[] };
      if (!res.ok) {
        setError(data.issues?.[0] ?? data.error ?? "Something went wrong.");
        setFormState("error");
        return;
      }
      setFormState("success");
      // Short pause so the success message is visible, then redirect to login
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("Network error — please try again.");
      setFormState("error");
    }
  }

  // ── Token checking ──────────────────────────────────────────────────────────
  if (tokenState === "checking") {
    return (
      <div className="form-card auth-card">
        <p className="meta" style={{ textAlign: "center", padding: "1rem 0" }}>Verifying your link…</p>
      </div>
    );
  }

  if (tokenState === "missing" || tokenState === "expired") {
    return (
      <div className="form-card auth-card">
        <span className="eyebrow">Account Setup</span>
        <h1>Link expired or invalid</h1>
        <p>
          This set-password link has expired, already been used, or is invalid.
          Please ask your sales contact to resend it, or use the{" "}
          <Link href="/forgot-password">forgot password</Link> page.
        </p>
        <Link href="/login" className="btn btn-primary" style={{ display: "inline-block", marginTop: "0.75rem" }}>
          Back to sign in
        </Link>
      </div>
    );
  }

  // ── Success ─────────────────────────────────────────────────────────────────
  if (formState === "success") {
    return (
      <div className="form-card auth-card">
        <span className="eyebrow">Account Setup</span>
        <h1>Password set!</h1>
        <p style={{ color: "var(--success, green)" }}>
          Your account is ready. Redirecting you to sign in…
        </p>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <form className="form-card auth-card" onSubmit={submit}>
      <span className="eyebrow">Account Setup</span>
      <h1>Set your password</h1>
      <p>Choose a strong password for your Special Gardens buyer account.</p>

      {error && <p className="form-error">{error}</p>}

      <label>
        Password <span aria-hidden="true">*</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          placeholder="Min 8 chars, one uppercase, one number"
          required
          disabled={formState === "loading"}
        />
      </label>

      <label>
        Confirm password <span aria-hidden="true">*</span>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          placeholder="Repeat your password"
          required
          disabled={formState === "loading"}
        />
      </label>

      <button className="btn btn-primary" type="submit" disabled={formState === "loading"}>
        {formState === "loading" ? "Setting password…" : "Set password & sign in"}
      </button>

      <div className="auth-links">
        <Link href="/login">Already have a password? Sign in</Link>
      </div>
    </form>
  );
}

export default function SetPasswordPage() {
  return (
    <PageShell>
      <section className="auth-section">
        <Suspense fallback={<div className="form-card auth-card">Loading…</div>}>
          <SetPasswordForm />
        </Suspense>
      </section>
    </PageShell>
  );
}
