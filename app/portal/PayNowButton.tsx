"use client";

import { useState } from "react";

const PAYABLE = new Set(["DUE", "PARTIAL", "PENDING", "OVERDUE"]);

export function PayNowButton({
  installmentId,
  status,
}: {
  installmentId: string;
  status: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!PAYABLE.has(status)) return null;

  async function handlePay() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ installmentId }),
      });
      const data = await res.json() as { authorizationUrl?: string; error?: string };
      if (!res.ok || !data.authorizationUrl) {
        setError(data.error ?? "Could not start payment. Please try again.");
        return;
      }
      // Redirect to Paystack hosted checkout
      window.location.href = data.authorizationUrl;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className="btn btn-primary"
        style={{ fontSize: "0.8rem", minHeight: 32, padding: "0.3rem 0.75rem" }}
        onClick={handlePay}
        disabled={loading}
      >
        {loading ? "Redirecting…" : "Pay now"}
      </button>
      {error && (
        <p className="form-error" style={{ margin: "0.25rem 0 0", fontSize: "0.75rem" }}>
          {error}
        </p>
      )}
    </div>
  );
}
