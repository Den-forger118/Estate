"use client";

import { useEffect, useState } from "react";
import { VISITOR_REG_KEY, type VisitorRegistration } from "./forms/VisitorPassGenerationForm";

const SEED_REGISTRATIONS: VisitorRegistration[] = [
  {
    id: "VR-SEED-001",
    visitorName: "James Owusu",
    phone: "+233 24 567 8901",
    date: "2026-06-18",
    time: "09:30",
    vehicleReg: "GR 4821-23",
    purpose: "Contractor / tradesperson",
    checkedIn: true,
    checkedInAt: "09:28 AM",
    createdAt: "2026-06-18T07:45:00.000Z",
  },
  {
    id: "VR-SEED-002",
    visitorName: "Akosua Mensah",
    phone: "+233 50 123 4567",
    date: "2026-06-18",
    time: "11:00",
    vehicleReg: null,
    purpose: "Family visit",
    checkedIn: false,
    checkedInAt: null,
    createdAt: "2026-06-18T09:10:00.000Z",
  },
  {
    id: "VR-SEED-003",
    visitorName: "Marcus Webb",
    phone: "+233 20 987 6543",
    date: "2026-06-18",
    time: "14:00",
    vehicleReg: "AS 0053-24",
    purpose: "Real estate viewing",
    checkedIn: false,
    checkedInAt: null,
    createdAt: "2026-06-18T10:30:00.000Z",
  },
  {
    id: "VR-SEED-004",
    visitorName: "Priya Nair",
    phone: "+233 27 333 2222",
    date: "2026-06-19",
    time: "10:00",
    vehicleReg: null,
    purpose: "Event guest",
    checkedIn: false,
    checkedInAt: null,
    createdAt: "2026-06-18T11:00:00.000Z",
  },
];

function readRegistrations(): VisitorRegistration[] {
  if (typeof window === "undefined") return SEED_REGISTRATIONS;
  try {
    const raw = window.localStorage.getItem(VISITOR_REG_KEY);
    if (!raw) {
      window.localStorage.setItem(VISITOR_REG_KEY, JSON.stringify(SEED_REGISTRATIONS));
      return SEED_REGISTRATIONS;
    }
    return JSON.parse(raw) as VisitorRegistration[];
  } catch {
    return SEED_REGISTRATIONS;
  }
}

function writeRegistrations(regs: VisitorRegistration[]): void {
  window.localStorage.setItem(VISITOR_REG_KEY, JSON.stringify(regs));
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function SecurityGateWebview() {
  const [registrations, setRegistrations] = useState<VisitorRegistration[]>([]);
  const today = todayStr();

  useEffect(() => {
    setRegistrations(readRegistrations());
  }, []);

  function handleCheckIn(id: string) {
    const checkedInAt = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const updated = registrations.map((r) =>
      r.id === id ? { ...r, checkedIn: true, checkedInAt } : r,
    );
    setRegistrations(updated);
    writeRegistrations(updated);
  }

  const todayVisitors = registrations.filter((r) => r.date === today);
  const upcomingVisitors = registrations.filter((r) => r.date > today);
  const checkedInCount = todayVisitors.filter((r) => r.checkedIn).length;

  function renderTable(visitors: VisitorRegistration[], showCheckIn: boolean) {
    if (visitors.length === 0) {
      return <p className="meta">No visitors registered.</p>;
    }
    return (
      <table className="zebra-rows">
        <thead>
          <tr>
            <th>Visitor</th>
            <th>Purpose</th>
            <th>Arrival</th>
            <th>Vehicle</th>
            <th>Status</th>
            {showCheckIn && <th></th>}
          </tr>
        </thead>
        <tbody>
          {visitors.map((v) => (
            <tr key={v.id}>
              <td>
                <strong>{v.visitorName}</strong>
                <br />
                <span className="meta">{v.phone}</span>
              </td>
              <td>{v.purpose}</td>
              <td className="font-data-md">{v.time}</td>
              <td className="meta">{v.vehicleReg ?? "—"}</td>
              <td>
                {v.checkedIn ? (
                  <span className="status-chip status-available">
                    Checked In{v.checkedInAt ? ` · ${v.checkedInAt}` : ""}
                  </span>
                ) : (
                  <span className="status-chip status-pending">Expected</span>
                )}
              </td>
              {showCheckIn && (
                <td>
                  {!v.checkedIn && (
                    <button
                      className="btn btn-secondary"
                      style={{ padding: "0.25rem 0.75rem", fontSize: "0.8rem" }}
                      onClick={() => handleCheckIn(v.id)}
                    >
                      Check In
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div className="gate-scanner">
      <div className="gate-scanner-header">
        <h1>Visitor Log</h1>
        <p className="meta">Special Gardens — Security Station</p>
      </div>

      <div className="dashboard-kpi-grid" style={{ marginBottom: "1.5rem" }}>
        <article className="dashboard-card kpi-card">
          <div>
            <span>Expected Today</span>
            <strong className="font-data-lg">{todayVisitors.length}</strong>
          </div>
          <small>Pre-registered arrivals</small>
        </article>
        <article className="dashboard-card kpi-card">
          <div>
            <span>Checked In</span>
            <strong className="font-data-lg">{checkedInCount}</strong>
          </div>
          <small>Arrived and confirmed</small>
        </article>
        <article className="dashboard-card kpi-card">
          <div>
            <span>Pending</span>
            <strong className="font-data-lg">{todayVisitors.length - checkedInCount}</strong>
          </div>
          <small>Yet to arrive</small>
        </article>
      </div>

      <div className="dashboard-card" style={{ marginBottom: "1rem" }}>
        <h2>Today&apos;s Visitors</h2>
        {renderTable(todayVisitors, true)}
      </div>

      {upcomingVisitors.length > 0 && (
        <div className="dashboard-card">
          <h2>Upcoming</h2>
          {renderTable(upcomingVisitors, false)}
        </div>
      )}
    </div>
  );
}
