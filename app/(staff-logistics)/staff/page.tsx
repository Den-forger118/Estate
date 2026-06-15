"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { USER_NAME_KEY } from "../../data/roles";

type GateEntry = {
  ref: string;
  input: string;
  scannedAt: string;
};

const GATE_LOG_KEY = "ernest_gate_log";

function readGateLog(): GateEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GATE_LOG_KEY);
    return JSON.parse(raw ?? "[]") as GateEntry[];
  } catch {
    return [];
  }
}

export default function StaffPortalLandingPage() {
  const [staffName, setStaffName] = useState("");
  const [gateLog, setGateLog] = useState<GateEntry[]>([]);

  useEffect(() => {
    setStaffName(window.localStorage.getItem(USER_NAME_KEY) ?? "Staff");
    setGateLog(readGateLog());
  }, []);

  const recentLog = gateLog.slice(0, 6);

  const kpiCards = [
    { label: "Total Gate Entries", value: String(gateLog.length), sub: "Logged in this session" },
    { label: "Terminal Status", value: "Active", sub: "Gate scanner ready" },
    { label: "Current Shift", value: "On Duty", sub: "Special Gardens Estate" },
    { label: "Zone", value: "Main Gate", sub: "Primary access point" },
  ];

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Staff · On-site Operations</span>
          <h1>Staff Portal</h1>
          <p>
            Welcome back, {staffName || "Staff"}. Quick access to the gate terminal and
            operations board.
          </p>
        </div>
      </div>

      <div className="dashboard-kpi-grid">
        {kpiCards.map((card) => (
          <article className="dashboard-card kpi-card" key={card.label}>
            <div>
              <span>{card.label}</span>
              <strong className="font-data-lg">{card.value}</strong>
            </div>
            <small>{card.sub}</small>
          </article>
        ))}
      </div>

      <div className="dashboard-card">
        <h2>Quick access</h2>
        <div className="dashboard-actions">
          <Link href="/staff/gate-scanner" className="btn btn-primary">
            Gate Terminal
          </Link>
          <Link href="/dashboard/admin/maintenance" className="btn btn-secondary">
            Operations Kanban
          </Link>
        </div>
      </div>

      <div className="dashboard-card">
        <h2>Recent gate activity</h2>
        {recentLog.length === 0 ? (
          <p className="meta">No entries logged yet. Open the gate terminal to begin scanning.</p>
        ) : (
          <table className="zebra-rows">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Input</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentLog.map((entry) => (
                <tr key={entry.ref}>
                  <td className="font-data-md">{entry.ref}</td>
                  <td>{entry.input}</td>
                  <td className="meta">{entry.scannedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
