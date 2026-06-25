"use client";

import { FormEvent, useState } from "react";

type State = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !message.trim()) {
      setErrorMsg("Please complete all required fields.");
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
          fullName: `${firstName.trim()} ${lastName.trim()}`,
          phone: phone.trim(),
          email: email.trim() || undefined,
          message: message.trim(),
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
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong — please try again.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="form-card">
        <h2>Enquiry received</h2>
        <p className="form-success">
          Thank you, {firstName}. A member of our team will be in touch within one business day.
        </p>
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={submit}>
      <h2>Send an enquiry</h2>

      {errorMsg ? <p className="form-error">{errorMsg}</p> : null}

      {/* Honeypot */}
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

      <div className="form-grid two">
        <label>
          First name <span aria-hidden="true">*</span>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Avery"
            required
            disabled={state === "loading"}
          />
        </label>
        <label>
          Last name <span aria-hidden="true">*</span>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Morgan"
            required
            disabled={state === "loading"}
          />
        </label>
      </div>

      <label>
        Email <span className="meta">(optional)</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="avery@example.com"
          disabled={state === "loading"}
        />
      </label>

      <label>
        Phone <span aria-hidden="true">*</span>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+233 24 000 0000"
          required
          disabled={state === "loading"}
        />
      </label>

      <label>
        Message <span aria-hidden="true">*</span>
        <textarea
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="I would like to book an inspection for…"
          required
          disabled={state === "loading"}
        />
      </label>

      <button className="btn btn-primary" type="submit" disabled={state === "loading"}>
        {state === "loading" ? "Sending…" : "Submit Enquiry"}
      </button>
    </form>
  );
}
