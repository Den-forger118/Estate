"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const macroKpis = [
  { label: "Total Revenue (YTD)", value: "GH₵ 4.2M", trend: "+12% vs last year" },
  { label: "Portfolio Occupancy", value: "94.2%", trend: "+1.8pp MoM" },
  { label: "Rent Collection Rate", value: "98%", trend: "Stable" },
  { label: "Open Maintenance", value: "14", trend: "3 urgent" },
];

const revenueData = [
  { month: "Jan", residential: 680000, commercial: 120000 },
  { month: "Feb", residential: 710000, commercial: 130000 },
  { month: "Mar", residential: 695000, commercial: 115000 },
  { month: "Apr", residential: 730000, commercial: 140000 },
  { month: "May", residential: 760000, commercial: 145000 },
  { month: "Jun", residential: 842000, commercial: 158000 },
];

const occupancyData = [
  { month: "Jan", rate: 91.0 },
  { month: "Feb", rate: 91.8 },
  { month: "Mar", rate: 92.4 },
  { month: "Apr", rate: 93.1 },
  { month: "May", rate: 93.8 },
  { month: "Jun", rate: 94.2 },
];

export default function AdminExecutiveDashboard() {
  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Admin · Executive View</span>
          <h1>Macro Financial Overview</h1>
          <p>Portfolio-wide revenue, occupancy trends, and operational health for administrator review.</p>
        </div>
      </div>

      <div className="dashboard-kpi-grid">
        {macroKpis.map((kpi) => (
          <article className="dashboard-card kpi-card" key={kpi.label}>
            <div>
              <span>{kpi.label}</span>
              <strong className="font-data-lg">{kpi.value}</strong>
            </div>
            <small>{kpi.trend}</small>
          </article>
        ))}
      </div>

      <div className="dashboard-split">
        <div className="dashboard-card">
          <h2>Revenue by Segment (GH₵)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueData} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v) => `GH₵ ${Number(v).toLocaleString()}`} />
              <Bar dataKey="residential" name="Residential" fill="var(--primary)" radius={[2, 2, 0, 0]} />
              <Bar dataKey="commercial" name="Commercial" fill="var(--accent)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-card">
          <h2>Portfolio Occupancy Rate (%)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={occupancyData} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted)" }} />
              <YAxis domain={[88, 96]} tick={{ fontSize: 11, fill: "var(--muted)" }} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v) => `${Number(v)}%`} />
              <Line
                type="monotone"
                dataKey="rate"
                name="Occupancy"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ fill: "var(--primary)", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-card">
        <h2>Quick navigation</h2>
        <div className="dashboard-actions">
          <a href="/dashboard/admin/onboarding" className="btn btn-secondary">Prospect Onboarding</a>
          <a href="/dashboard/admin/maintenance" className="btn btn-secondary">Dual-Engine Kanban</a>
          <a href="/dashboard/properties" className="btn btn-secondary">Properties</a>
          <a href="/dashboard/payments" className="btn btn-secondary">Payments</a>
        </div>
      </div>
    </>
  );
}
