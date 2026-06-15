"use client";

import { useEffect, useState } from "react";
import { readEngineTickets, EngineTicket } from "../../data/mockMaintenanceEngine";
import { canAccessCommunity, getStoredRole } from "../../data/roles";
import { useRouter } from "next/navigation";

const utilityReadings = [
  { label: "Water (m³)", months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], readings: [14, 12, 16, 13, 15, 11] },
  { label: "Electricity (kWh)", months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], readings: [320, 298, 345, 312, 330, 289] },
];

export default function ResidentUtilityDashboard() {
  const router = useRouter();
  const [tickets, setTickets] = useState<EngineTicket[]>([]);

  useEffect(() => {
    const role = getStoredRole();
    if (!canAccessCommunity(role)) {
      router.replace("/community");
      return;
    }
    setTickets(readEngineTickets().filter((t) => t.origin === "RESIDENT"));
  }, [router]);

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Resident Portal</span>
          <h1>Utility Dashboard</h1>
          <p>Your unit&rsquo;s utility readings and submitted maintenance requests at a glance.</p>
        </div>
      </div>

      <div className="dashboard-split">
        {utilityReadings.map((util) => (
          <div className="dashboard-card" key={util.label}>
            <h2>{util.label}</h2>
            <div className="utility-reading-grid">
              {util.months.map((month, i) => (
                <div className="utility-reading-bar-wrap" key={month}>
                  <span className="font-data-md">{util.readings[i]}</span>
                  <div
                    className="utility-reading-bar"
                    style={{ height: `${(util.readings[i] / Math.max(...util.readings)) * 80}px` }}
                  />
                  <span className="meta">{month}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-card table-card">
        <h2>My submitted requests</h2>
        {tickets.length === 0 ? (
          <p className="meta">No resident requests on record.</p>
        ) : (
          <table className="zebra-rows">
            <thead>
              <tr>
                <th>Ref</th>
                <th>Title</th>
                <th>Unit</th>
                <th>Status</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id}>
                  <td className="font-data-md">{t.id}</td>
                  <td>{t.title}</td>
                  <td>{t.unit}</td>
                  <td><span className="status-chip">{t.status}</span></td>
                  <td className="meta">{t.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
