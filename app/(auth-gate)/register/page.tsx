"use client";

import Link from "next/link";
import { DragEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "../../components/SiteChrome";
import { registerProspect } from "../../data/mockAuthStateMachine";
import { AUTH_KEY, ROLE_KEY, USER_EMAIL_KEY, USER_NAME_KEY } from "../../data/roles";

const PROPERTY_INTERESTS = ["Villa", "Townhome", "Apartment", "Duplex", "Not yet decided"];
const NATIONALITIES = [
  "Ghanaian",
  "Nigerian",
  "American",
  "British",
  "Canadian",
  "German",
  "Australian",
  "South African",
  "Other",
];

export default function ProspectKycSubmissionForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("");
  const [idType, setIdType] = useState<"Ghana Card" | "Passport">("Ghana Card");
  const [idNumber, setIdNumber] = useState("");
  const [interest, setInterest] = useState(PROPERTY_INTERESTS[0]);
  const [photoFile, setPhotoFile] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setPhotoFile(file.name);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPhotoFile(file.name);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !nationality || !idNumber.trim()) {
      setError("Please complete all required fields.");
      return;
    }
    setError("");
    setSubmitting(true);

    registerProspect({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      propertyInterest: interest,
      nationality,
      idType,
      idNumber: idNumber.trim(),
      idPhotoName: photoFile ?? undefined,
    });

    window.localStorage.setItem(AUTH_KEY, "true");
    window.localStorage.setItem(ROLE_KEY, "PROSPECT");
    window.localStorage.setItem(USER_NAME_KEY, name.trim());
    window.localStorage.setItem(USER_EMAIL_KEY, email.trim());
    document.cookie = "mock_auth=true; path=/; max-age=604800; SameSite=Lax";

    router.push("/dashboard");
  }

  return (
    <PageShell>
      <section className="section">
        <div className="kyc-registration-layout">
          <div className="kyc-registration-intro">
            <span className="eyebrow">Prospect Registration</span>
            <h1>KYC Onboarding</h1>
            <p>
              Submit your identity details to register as a verified estate prospect. An
              administrator will review your submission and approve access before you gain
              full resident portal rights.
            </p>

            <div className="kyc-registration-steps">
              <div className="kyc-step kyc-step-active">
                <span className="kyc-step-num">1</span>
                <span>Personal Details</span>
              </div>
              <div className="kyc-step-connector" aria-hidden="true" />
              <div className="kyc-step">
                <span className="kyc-step-num">2</span>
                <span>Admin Review</span>
              </div>
              <div className="kyc-step-connector" aria-hidden="true" />
              <div className="kyc-step">
                <span className="kyc-step-num">3</span>
                <span>Access Granted</span>
              </div>
            </div>

            <div className="kyc-trust-note">
              <span className="kyc-trust-icon" aria-hidden="true">✦</span>
              <p>
                Your information is protected by Special Gardens Estate's privacy
                framework and used solely for identity verification purposes.
              </p>
            </div>
          </div>

          <div className="form-card kyc-registration-form">
            <h2>Identity &amp; Contact Details</h2>
            {error && <p className="form-error">{error}</p>}

            <form className="form-grid" onSubmit={handleSubmit}>
              <label>
                Full legal name <span className="form-required">*</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Exactly as it appears on your ID document"
                  required
                />
              </label>

              <label>
                Email address <span className="form-required">*</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label>
                Primary phone number <span className="form-required">*</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+233 24 000 0000"
                  required
                />
              </label>

              <label>
                Nationality <span className="form-required">*</span>
                <select
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  required
                >
                  <option value="">Select nationality</option>
                  {NATIONALITIES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>

              <fieldset className="kyc-id-type-group">
                <legend>
                  ID document type <span className="form-required">*</span>
                </legend>
                <div className="kyc-id-type-options">
                  <label className="kyc-radio-label">
                    <input
                      type="radio"
                      name="idType"
                      value="Ghana Card"
                      checked={idType === "Ghana Card"}
                      onChange={() => setIdType("Ghana Card")}
                    />
                    Ghana Card
                  </label>
                  <label className="kyc-radio-label">
                    <input
                      type="radio"
                      name="idType"
                      value="Passport"
                      checked={idType === "Passport"}
                      onChange={() => setIdType("Passport")}
                    />
                    Passport (Diaspora)
                  </label>
                </div>
              </fieldset>

              <label>
                {idType === "Ghana Card" ? "Ghana Card number" : "Passport number"}{" "}
                <span className="form-required">*</span>
                <input
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder={
                    idType === "Ghana Card" ? "GHA-000000000-0" : "G00000000"
                  }
                  required
                />
              </label>

              <label>
                Property interest
                <select
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                >
                  {PROPERTY_INTERESTS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>

              <div className="kyc-upload-zone-wrap">
                <span className="kyc-upload-zone-label">
                  ID photo upload{" "}
                  <span className="meta">(optional — speeds up review)</span>
                </span>
                <div
                  className={`kyc-upload-zone${dragging ? " kyc-upload-zone-active" : ""}${photoFile ? " kyc-upload-zone-done" : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  role="region"
                  aria-label="ID photo drop zone"
                >
                  {photoFile ? (
                    <>
                      <span className="kyc-upload-icon" aria-hidden="true">
                        ✓
                      </span>
                      <p>
                        <strong>{photoFile}</strong>
                      </p>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setPhotoFile(null)}
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="kyc-upload-icon" aria-hidden="true">
                        ↑
                      </span>
                      <p>Drag &amp; drop your ID photo here</p>
                      <label className="btn btn-secondary kyc-upload-browse">
                        Browse Files
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          className="kyc-upload-input"
                        />
                      </label>
                    </>
                  )}
                </div>
              </div>

              <button
                className="btn btn-primary"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Submitting KYC…" : "Submit Registration"}
              </button>
            </form>

            <p className="meta kyc-registration-footnote">
              Already have an account?{" "}
              <Link href="/login">Sign in here</Link>
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
