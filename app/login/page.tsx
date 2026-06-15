"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { PageShell } from "../components/SiteChrome";
import {
  AUTH_KEY,
  ROLE_KEY,
  USER_EMAIL_KEY,
  USER_NAME_KEY,
  defaultEmails,
  type UserRole,
} from "../data/roles";

type LoginOption = {
  value: UserRole;
  label: string;
  description: string;
  defaultName: string;
  destination: string;
};

const loginOptions: LoginOption[] = [
  {
    value: "SUPER_ADMIN",
    label: "Super Admin (Executive)",
    description: "Full estate operations, user oversight, and all approval workflows.",
    defaultName: "Eleanor Vance",
    destination: "/dashboard/admin",
  },
  {
    value: "ADMIN",
    label: "Admin (Operations & Finance)",
    description: "Operations and finance management with reporting and lease oversight.",
    defaultName: "Marcus Webb",
    destination: "/dashboard/admin",
  },
  {
    value: "OWNER",
    label: "Owner (Resident / Investor)",
    description: "Property owner with estate access and community portal rights.",
    defaultName: "Daniel Reyes",
    destination: "/community/portal",
  },
  {
    value: "TENANT_STAFF",
    label: "Tenant / Staff (Operations)",
    description: "Resident or maintenance staff with community and operational access.",
    defaultName: "Maya Chen",
    destination: "/staff/gate-scanner",
  },
  {
    value: "PROSPECT",
    label: "Prospect (Unverified Buyer)",
    description: "Registered prospect awaiting admin approval before full platform access.",
    defaultName: "Kofi Mensah Jr.",
    destination: "/",
  },
];

function LoginForm() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<LoginOption>(loginOptions[0]);
  const [email, setEmail] = useState(defaultEmails.SUPER_ADMIN);
  const [name, setName] = useState(loginOptions[0].defaultName);
  const [password, setPassword] = useState("demo");
  const [error, setError] = useState("");

  function onRoleChange(value: string) {
    const option = loginOptions.find((o) => o.value === value) ?? loginOptions[0];
    setSelectedOption(option);
    setEmail(defaultEmails[option.value]);
    setName(option.defaultName);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    window.localStorage.setItem(AUTH_KEY, "true");
    window.localStorage.setItem(ROLE_KEY, selectedOption.value);
    window.localStorage.setItem(USER_EMAIL_KEY, email);
    window.localStorage.setItem(USER_NAME_KEY, name);
    document.cookie = "mock_auth=true; path=/; max-age=604800; SameSite=Lax";
    router.push(selectedOption.destination);
  }

  return (
    <form className="form-card auth-card" onSubmit={submit}>
      <span className="eyebrow">Demo access</span>
      <h1>Sign in to estate services.</h1>
      <p>
        Select a role to preview the platform from that perspective. Each role unlocks a different
        set of modules and routes.
      </p>

      <label>
        Role
        <select
          value={selectedOption.value}
          onChange={(event) => onRoleChange(event.target.value)}
        >
          {loginOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <p className="meta role-hint">{selectedOption.description}</p>

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
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>

      {error ? <p className="form-error">{error}</p> : null}

      <button className="btn btn-primary" type="submit">
        Enter platform
      </button>
      <div className="auth-links">
        <Link href="/register">New here? Register as a Prospect</Link>
        <Link href="/">Back to public site</Link>
      </div>
    </form>
  );
}

export default function SystemAuthentication() {
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
