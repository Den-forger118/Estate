"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { showToast } from "../components/Toast";

type ActivationState = "PENDING" | "ACTIVE";
type AccountStatus = "ACTIVE" | "SUSPENDED";

interface BuyerAccount {
  userId: string;
  email: string;
  role: string;
  buyerId: string | null;
  fullName: string | null;
  activationState: ActivationState;
  status: AccountStatus;
  lastLoginAt: string | null;
  createdAt: string;
  hasValidSetPasswordToken: boolean;
}

function fmtDate(iso: string | null) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

async function accountAction(
  userId: string,
  path: string,
): Promise<{ ok: boolean; message?: string; error?: string }> {
  const res = await fetch(`/api/v1/accounts/${userId}/${path}`, { method: "POST" });
  return res.json() as Promise<{ ok: boolean; message?: string; error?: string }>;
}

export function AccountsView() {
  const [accounts, setAccounts] = useState<BuyerAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null); // userId being acted on

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/accounts");
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "Failed to load accounts");
      }
      setAccounts((await res.json()) as BuyerAccount[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function doAction(
    userId: string,
    path: string,
    label: string,
    confirmMessage: string,
  ) {
    if (!confirm(confirmMessage)) return;
    setActing(userId);
    try {
      const result = await accountAction(userId, path);
      if (!result.ok) throw new Error(result.error ?? "Action failed");
      showToast(result.message ?? `${label} completed`, "success");
      await load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Action failed", "error");
    } finally {
      setActing(null);
    }
  }

  const pending = accounts.filter((a) => a.activationState === "PENDING").length;
  const active = accounts.filter((a) => a.activationState === "ACTIVE").length;
  const suspended = accounts.filter((a) => a.status === "SUSPENDED").length;

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Access Control</span>
          <h1>Buyer Accounts</h1>
          <p>Portal access ledger — activation state, login history, and account controls.</p>
        </div>
        <div className="dashboard-actions">
          <button className="btn btn-secondary" type="button" onClick={load} disabled={loading}>
            {loading ? "Loading…" : "Refresh"}
          </button>
          <Link href="/dashboard/leads" className="btn btn-primary">
            Convert lead → account
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="dashboard-kpi-grid" style={{ marginBottom: "1.5rem" }}>
        <article className="dashboard-card kpi-card">
          <div>
            <span>Total accounts</span>
            <strong className="font-data-lg">{accounts.length}</strong>
          </div>
          <small>All buyer portal users</small>
        </article>
        <article className="dashboard-card kpi-card">
          <div>
            <span>Pending activation</span>
            <strong className="font-data-lg" style={{ color: "var(--accent, #b45309)" }}>{pending}</strong>
          </div>
          <small>Password not yet set</small>
        </article>
        <article className="dashboard-card kpi-card">
          <div>
            <span>Active</span>
            <strong className="font-data-lg" style={{ color: "var(--success, green)" }}>{active}</strong>
          </div>
          <small>Can log in</small>
        </article>
        <article className="dashboard-card kpi-card">
          <div>
            <span>Suspended</span>
            <strong className="font-data-lg" style={{ color: "var(--error, #c0392b)" }}>{suspended}</strong>
          </div>
          <small>Login blocked</small>
        </article>
      </div>

      {error && (
        <p className="form-error" style={{ marginBottom: "1rem" }}>
          {error}
        </p>
      )}

      {/* Table */}
      <div className="dashboard-card table-card">
        {loading ? (
          <p className="meta" style={{ padding: "1.5rem" }}>Loading accounts…</p>
        ) : accounts.length === 0 ? (
          <p className="meta" style={{ padding: "1.5rem" }}>
            No buyer accounts yet.{" "}
            <Link href="/dashboard/leads">Convert a qualified lead</Link> to create one.
          </p>
        ) : (
          <table className="zebra-rows">
            <thead>
              <tr>
                <th>Buyer</th>
                <th>Activation</th>
                <th>Account status</th>
                <th>Last login</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc) => {
                const isBusy = acting === acc.userId;
                return (
                  <tr key={acc.userId}>
                    <td>
                      <strong>{acc.fullName ?? "—"}</strong>
                      <br />
                      <span className="meta">{acc.email}</span>
                    </td>
                    <td>
                      {acc.activationState === "PENDING" ? (
                        <span
                          className="status-chip"
                          style={{
                            background: "var(--accent-soft, #fef3c7)",
                            color: "var(--accent, #b45309)",
                            border: "1px solid var(--accent, #b45309)",
                          }}
                        >
                          Pending activation
                        </span>
                      ) : (
                        <span
                          className="status-chip"
                          style={{
                            background: "var(--success-soft, #d1fae5)",
                            color: "var(--success-text, #065f46)",
                            border: "1px solid var(--success, green)",
                          }}
                        >
                          Active
                        </span>
                      )}
                      {acc.hasValidSetPasswordToken && (
                        <span className="meta" style={{ display: "block", fontSize: "0.72rem", marginTop: "2px" }}>
                          Link pending
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        className="status-chip"
                        style={
                          acc.status === "SUSPENDED"
                            ? { background: "var(--error-soft, #fee2e2)", color: "var(--error, #c0392b)", border: "1px solid var(--error, #c0392b)" }
                            : {}
                        }
                      >
                        {acc.status === "SUSPENDED" ? "Suspended" : "Active"}
                      </span>
                    </td>
                    <td className="meta">{fmtDate(acc.lastLoginAt)}</td>
                    <td className="meta">{fmtDate(acc.createdAt)}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                        <button
                          className="btn btn-secondary"
                          type="button"
                          disabled={isBusy}
                          style={{ fontSize: "0.78rem", padding: "0.2rem 0.6rem" }}
                          onClick={() =>
                            doAction(
                              acc.userId,
                              "resend-link",
                              "Resend link",
                              `Resend set-password link to ${acc.email}?`,
                            )
                          }
                        >
                          Resend link
                        </button>
                        <button
                          className="btn btn-secondary"
                          type="button"
                          disabled={isBusy}
                          style={{ fontSize: "0.78rem", padding: "0.2rem 0.6rem" }}
                          onClick={() =>
                            doAction(
                              acc.userId,
                              "reset-password",
                              "Reset password",
                              `Reset password for ${acc.email}? They will receive a new set-password link.`,
                            )
                          }
                        >
                          Reset password
                        </button>
                        {acc.status === "ACTIVE" ? (
                          <button
                            className="btn btn-secondary"
                            type="button"
                            disabled={isBusy}
                            style={{ fontSize: "0.78rem", padding: "0.2rem 0.6rem", color: "var(--error, #c0392b)" }}
                            onClick={() =>
                              doAction(
                                acc.userId,
                                "suspend",
                                "Suspend",
                                `Suspend account for ${acc.email}? They will not be able to log in.`,
                              )
                            }
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary"
                            type="button"
                            disabled={isBusy}
                            style={{ fontSize: "0.78rem", padding: "0.2rem 0.6rem", color: "var(--success-text, green)" }}
                            onClick={() =>
                              doAction(
                                acc.userId,
                                "reactivate",
                                "Reactivate",
                                `Reactivate account for ${acc.email}?`,
                              )
                            }
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="meta" style={{ marginTop: "1rem", fontSize: "0.8rem" }}>
        Passwords are never stored or displayed. Reset password sends a fresh set-password link to the buyer.
        Suspend/Reactivate is ADMIN only.
      </p>
    </>
  );
}
