"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "../../components/SiteChrome";
import { registerProspect } from "../../data/mockAuthStateMachine";
import { AUTH_KEY, ROLE_KEY, USER_EMAIL_KEY, USER_NAME_KEY } from "../../data/roles";

const propertyInterests = ["Villa", "Townhome", "Apartment", "Duplex"];

export default function ProspectRegistration() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState(propertyInterests[0]);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    registerProspect({ name, email, phone, propertyInterest: interest });

    window.localStorage.setItem(AUTH_KEY, "true");
    window.localStorage.setItem(ROLE_KEY, "PROSPECT");
    window.localStorage.setItem(USER_NAME_KEY, name);
    window.localStorage.setItem(USER_EMAIL_KEY, email);

    document.cookie = "mock_auth=true; path=/; max-age=604800; SameSite=Lax";

    router.push("/dashboard");
  }

  return (
    <PageShell>
      <section className="section">
        <div className="section-intro">
          <span className="eyebrow">Register</span>
          <h1>Express Interest</h1>
          <p>
            Submit your details to register as a prospect. An administrator will review and approve
            your account before you gain full resident access.
          </p>
        </div>

        <div className="form-card">
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Full name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
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
              Phone number
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+233 XX XXX XXXX"
                required
              />
            </label>
            <label>
              Property interest
              <select value={interest} onChange={(e) => setInterest(e.target.value)}>
                {propertyInterests.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Registering…" : "Register as Prospect"}
            </button>
          </form>

          <p className="meta" style={{ marginTop: "1.25rem" }}>
            Already have an account?{" "}
            <Link href="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </PageShell>
  );
}
