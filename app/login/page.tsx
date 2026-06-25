"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { PageShell } from "../components/SiteChrome";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nextParam = searchParams.get("next") ?? "";
  const isUnauthorized = searchParams.get("error") === "unauthorized";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Sign in failed. Please try again.");
        return;
      }

      const data = await res.json().catch(() => ({}));
      const role = data.user?.role as string | undefined;

      // Role-based defaults — never derived from client input.
      const roleDefault = role === "BUYER" ? "/portal" : "/dashboard";

      // Only honour ?next= if it starts with the role's safe area prefix.
      // Any other value (e.g. /community, /login, external URLs) is ignored
      // to prevent redirect loops back to /login.
      const safePrefix = role === "BUYER" ? "/portal" : "/dashboard";
      const destination =
        nextParam.startsWith(safePrefix) ? nextParam : roleDefault;

      // Full-page navigation: guarantees the browser sends the freshly-set
      // httpOnly cookie to the server component on the next request,
      // avoiding any soft-nav race with Set-Cookie timing.
      window.location.href = destination;
    } catch (err) {
      const isTimeout = err instanceof DOMException && err.name === "TimeoutError";
      setError(
        isTimeout
          ? "Request timed out — the service may be warming up. Please try again."
          : "Network error. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-card auth-card" onSubmit={submit}>
      <span className="eyebrow">Estate platform</span>
      <h1>Sign in to your account.</h1>
      <p>Buyers: access your portal to track installments and milestones. Staff: access the dashboard.</p>

      {isUnauthorized && (
        <p className="form-error">You do not have permission to access that page.</p>
      )}

      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </label>

      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </label>

      {error && <p className="form-error">{error}</p>}

      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <div className="auth-links">
        <Link href="/forgot-password">Forgot password?</Link>
        <Link href="/">Back to public site</Link>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <PageShell>
      <section className="auth-section">
        <Suspense fallback={<div className="form-card auth-card">Loading…</div>}>
          <LoginForm />
        </Suspense>
      </section>
    </PageShell>
  );
}
