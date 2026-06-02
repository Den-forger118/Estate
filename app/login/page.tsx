"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { PageShell } from "../components/SiteChrome";
import {
  AUTH_KEY,
  ROLE_KEY,
  USER_EMAIL_KEY,
  USER_NAME_KEY,
  defaultEmails,
  roleDescriptions,
  roleOptions,
  type UserRole,
} from "../data/roles";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<UserRole>("admin");
  const [email, setEmail] = useState(defaultEmails.admin);
  const [name, setName] = useState("Eleanor Vance");
  const next = searchParams.get("next") || "/dashboard";

  function onRoleChange(nextRole: UserRole) {
    setRole(nextRole);
    setEmail(defaultEmails[nextRole]);
    if (nextRole === "owner") setName("Daniel Reyes");
    else if (nextRole === "landlord") setName("Daniel Reyes");
    else if (nextRole === "tenant") setName("Maya Chen");
    else if (nextRole === "maintenance") setName("Sam Okafor");
    else setName("Eleanor Vance");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.localStorage.setItem(AUTH_KEY, "true");
    window.localStorage.setItem(ROLE_KEY, role);
    window.localStorage.setItem(USER_EMAIL_KEY, email);
    window.localStorage.setItem(USER_NAME_KEY, name);
    document.cookie = "mock_auth=true; path=/; max-age=604800; SameSite=Lax";
    router.push(next);
  }

  return (
    <form className="form-card auth-card" onSubmit={submit}>
      <span className="eyebrow">Mock access</span>
      <h1>Sign in to estate services.</h1>
      <p>
        Choose a role to preview the platform. Property owners apply to become landlords; only
        administrators and property managers can approve. Maintenance staff use REMS only.
      </p>

      <label>
        Full name
        <input type="text" value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label>
        Email
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label>
        Password
        <input type="password" defaultValue="dashboard" />
      </label>
      <label>
        Role
        <select value={role} onChange={(event) => onRoleChange(event.target.value as UserRole)}>
          {roleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <p className="meta role-hint">{roleDescriptions[role]}</p>
      <button className="btn btn-primary" type="submit">
        Enter platform
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
