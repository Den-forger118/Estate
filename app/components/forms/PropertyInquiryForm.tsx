"use client";

import { FormEvent, useState } from "react";

type State = "idle" | "loading" | "success" | "error";

export function PropertyInquiryForm({
  propertyName,
  unitId,
  variant = "default",
}: {
  propertyName: string;
  unitId?: string;
  variant?: "default" | "dossier";
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(
    `I would like to register my interest in ${propertyName}.`,
  );
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setErrorMsg("Please provide your name and phone number.");
      return;
    }
    if (!email.trim()) {
      setErrorMsg("Please provide your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/v1/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          message: message.trim() || undefined,
          unitId: unitId ?? undefined,
          _hp: "",
        }),
      });

      if (res.status === 429) {
        setErrorMsg("Too many requests — please wait a minute and try again.");
        setState("error");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Submission failed");
      }

      setState("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong — please try again.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div
        className={`form-card form-card-inquiry${variant === "dossier" ? " property-inquiry-dossier" : ""}`}
      >
        <h3>Thank you, {name.split(" ")[0]}</h3>
        <p className="form-success">
          Your interest in <strong>{propertyName}</strong> has been registered. A member of our
          estate team will contact you — typically within one business day.
        </p>
        <p className="meta">
          This is not an instant reservation. Our team will confirm availability and next steps
          directly.
        </p>
      </div>
    );
  }

  return (
    <form
      className={`form-card form-card-inquiry${variant === "dossier" ? " property-inquiry-dossier" : ""}`}
      onSubmit={submit}
    >
      <h3>Register interest — {propertyName}</h3>

      {errorMsg ? <p className="form-error">{errorMsg}</p> : null}

      {/* Honeypot — invisible to users, triggers silent discard if filled */}
      <input
        type="text"
        name="_hp"
        aria-hidden="true"
        tabIndex={-1}
        autoComplete="off"
        style={{ display: "none" }}
        readOnly
        value=""
      />

      <label>
        Full name <span aria-hidden="true">*</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          required
          disabled={state === "loading"}
        />
      </label>

      <label>
        Phone <span aria-hidden="true">*</span>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+233 24 000 0000"
          required
          disabled={state === "loading"}
        />
      </label>

      <label>
        Email <span aria-hidden="true">*</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          disabled={state === "loading"}
        />
      </label>

      <label>
        Message
        <textarea
          rows={variant === "dossier" ? 3 : 4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={state === "loading"}
        />
      </label>

      <button className="btn btn-primary" type="submit" disabled={state === "loading"}>
        {state === "loading" ? "Sending…" : "Register Interest"}
      </button>
    </form>
  );
}
