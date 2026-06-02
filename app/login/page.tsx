"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { PageShell } from "../components/SiteChrome";
import { DashboardRole, roleOptions } from "../data/dashboard";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<DashboardRole>("admin");
  const next = searchParams.get("next") || "/dashboard";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.localStorage.setItem("ernest_mock_auth", "true");
    window.localStorage.setItem("ernest_dashboard_role", role);
    document.cookie = "mock_auth=true; path=/; max-age=604800; SameSite=Lax";
    router.push(next);
  }

  return (
    <form className="form-card auth-card" onSubmit={submit}>
      <span className="eyebrow">Mock access</span>
      <h1>Sign in to the REMS dashboard.</h1>
      <p>Backend authentication is simulated for now. Choose a role to preview its route access.</p>

      <label>
        Email
        <input type="email" defaultValue="eleanor@ernestofori.example" />
      </label>
      <label>
        Password
        <input type="password" defaultValue="dashboard" />
      </label>
      <label>
        Role
        <select value={role} onChange={(event) => setRole(event.target.value as DashboardRole)}>
          {roleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <button className="btn btn-primary" type="submit">
        Enter Dashboard
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
        <Suspense fallback={<div className="form-card auth-card">Loading sign in...</div>}>
          <LoginForm />
        </Suspense>
      </section>
    </PageShell>
  );
}
