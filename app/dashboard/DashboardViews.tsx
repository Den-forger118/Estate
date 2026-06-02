import {
  DashboardModule,
  dashboardProperties,
  documents,
  invoices,
  kpis,
  leases,
  maintenanceColumns,
  messages,
  moduleMeta,
  payments,
  tenants,
  units,
} from "../data/dashboard";
import {
  LandlordApplicationSubmitPanel,
  LandlordApplicationsReviewPanel,
} from "./LandlordApplicationPanels";
import type { CSSProperties } from "react";

const revenueTrend = [
  { label: "Jan", value: 184 },
  { label: "Feb", value: 196 },
  { label: "Mar", value: 191 },
  { label: "Apr", value: 218 },
  { label: "May", value: 211 },
  { label: "Jun", value: 248 },
];

function PageHeader({
  module,
  title,
  text,
  action = "Export",
}: {
  module: DashboardModule;
  title?: string;
  text?: string;
  action?: string;
}) {
  const meta = moduleMeta[module];
  return (
    <div className="dashboard-page-header">
      <div>
        <span className="eyebrow">{meta.label}</span>
        <h1>{title ?? meta.label}</h1>
        <p>{text ?? meta.summary}</p>
      </div>
      <div className="dashboard-actions">
        <button className="btn btn-secondary" type="button">
          This Month
        </button>
        <button className="btn btn-primary" type="button">
          {action}
        </button>
      </div>
    </div>
  );
}

function RevenueChart() {
  const maxValue = 260;
  const points = revenueTrend
    .map((item, index) => {
      const x = 10 + index * 16;
      const y = 86 - (item.value / maxValue) * 68;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="revenue-chart" aria-label="Monthly revenue trend from January to June">
      <div className="chart-grid" aria-hidden="true">
        <span>$260k</span>
        <span>$195k</span>
        <span>$130k</span>
        <span>$65k</span>
      </div>
      <div className="chart-bars">
        {revenueTrend.map((item) => (
          <div
            className="chart-bar-group"
            key={item.label}
            style={{ "--chart-value": `${(item.value / maxValue) * 100}%` } as CSSProperties}
          >
            <strong>${item.value}k</strong>
            <span style={{ height: `${(item.value / maxValue) * 100}%` }} />
            <small>{item.label}</small>
          </div>
        ))}
      </div>
      <svg className="chart-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <polyline points={points} />
      </svg>
    </div>
  );
}

function KpiGrid() {
  return (
    <div className="dashboard-kpi-grid">
      {kpis.map((item) => (
        <article className="dashboard-card kpi-card" key={item.label}>
          <div>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
          <small>{item.trend}</small>
          <p>{item.text}</p>
        </article>
      ))}
    </div>
  );
}

function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="dashboard-card table-card">
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("-")}>
              {row.map((cell, index) => (
                <td key={`${cell}-${index}`}>
                  {index === 2 ? <span className="status-chip">{cell}</span> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DashboardOverview() {
  return (
    <>
      <PageHeader
        module="dashboard"
        title="Executive Overview"
        text="Portfolio performance metrics, operating pressure, and resident service health."
      />
      <KpiGrid />
      <div className="dashboard-split">
        <article className="dashboard-card">
          <h2>Revenue Momentum</h2>
          <RevenueChart />
          <p>Collections are pacing ahead of plan, supported by high renewal rates in core estates.</p>
        </article>
        <article className="dashboard-card">
          <h2>Priority Work</h2>
          {maintenanceColumns.flatMap((column) => column.items).slice(0, 4).map((item) => (
            <div className="dashboard-task" key={item}>
              <span />
              <strong>{item}</strong>
            </div>
          ))}
        </article>
      </div>
    </>
  );
}

export function PropertiesView() {
  return (
    <>
      <PageHeader module="properties" action="Add Property" />
      <div className="dashboard-tabs">
        <button>All Properties (12)</button>
        <button>Active (9)</button>
        <button>Development (2)</button>
        <button>Maintenance (1)</button>
      </div>
      <div className="dashboard-property-grid">
        {dashboardProperties.map((property) => (
          <article className="dashboard-property-card" key={property.name}>
            <div className="dashboard-property-image">
              <img src={property.image} alt={`${property.name} exterior`} />
              <span className="status-chip">{property.status}</span>
            </div>
            <div className="dashboard-property-body">
              <h2>{property.name}</h2>
              <p>{property.address}</p>
              <div>
                <span>
                  Units <strong>{property.units}</strong>
                </span>
                <span>
                  Occupancy <strong>{property.occupancy}</strong>
                </span>
                <span>
                  Revenue <strong>{property.revenue}</strong>
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

export function MaintenanceView() {
  return (
    <>
      <PageHeader module="maintenance" action="New Ticket" />
      <div className="kanban-board">
        {maintenanceColumns.map((column) => (
          <section className="dashboard-card kanban-column" key={column.title}>
            <h2>{column.title}</h2>
            {column.items.map((item) => (
              <article className="kanban-ticket" key={item}>
                <span className="status-chip">Routine</span>
                <strong>{item}</strong>
                <p>Assigned team will update the service record after inspection.</p>
              </article>
            ))}
          </section>
        ))}
      </div>
    </>
  );
}

export function MessagesView() {
  return (
    <>
      <PageHeader module="messages" action="Compose" />
      <div className="dashboard-card inbox-list">
        {messages.map(([sender, subject, time]) => (
          <article key={subject}>
            <div className="dashboard-avatar">{sender.slice(0, 2).toUpperCase()}</div>
            <div>
              <strong>{sender}</strong>
              <p>{subject}</p>
            </div>
            <span>{time}</span>
          </article>
        ))}
      </div>
    </>
  );
}

export function DocumentsView() {
  return (
    <>
      <PageHeader module="documents" action="Upload" />
      <div className="document-grid">
        {documents.map(([name, count, updated]) => (
          <article className="dashboard-card document-card" key={name}>
            <span>{name.slice(0, 1)}</span>
            <h2>{name}</h2>
            <p>{count}</p>
            <small>{updated}</small>
          </article>
        ))}
      </div>
    </>
  );
}

export function ReportsView() {
  return (
    <>
      <PageHeader module="reports" action="Download" />
      <KpiGrid />
      <div className="dashboard-card">
        <h2>Strategic Insights</h2>
        <RevenueChart />
        <div className="insight-grid">
          {["Renewals", "Revenue", "Occupancy", "Service SLA"].map((label, index) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{[87, 104, 94, 91][index]}%</strong>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function SettingsView() {
  return (
    <>
      <PageHeader module="settings" action="Save Changes" />
      <div className="settings-grid">
        <section className="dashboard-card">
          <h2>Profile</h2>
          <label>
            Display name
            <input defaultValue="Eleanor Vance" />
          </label>
          <label>
            Notification email
            <input defaultValue="eleanor@ernestofori.example" />
          </label>
        </section>
        <section className="dashboard-card">
          <h2>Access Controls</h2>
          <label>
            Session timeout
            <select defaultValue="30">
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
            </select>
          </label>
          <label>
            Approval threshold
            <input defaultValue="$5,000" />
          </label>
        </section>
      </div>
    </>
  );
}

export function ModuleView({ module }: { module: DashboardModule }) {
  if (module === "landlord-application") return <LandlordApplicationSubmitPanel />;
  if (module === "landlord-applications") return <LandlordApplicationsReviewPanel />;
  if (module === "properties") return <PropertiesView />;
  if (module === "maintenance") return <MaintenanceView />;
  if (module === "messages") return <MessagesView />;
  if (module === "documents") return <DocumentsView />;
  if (module === "reports") return <ReportsView />;
  if (module === "settings") return <SettingsView />;
  if (module === "units") {
    return (
      <>
        <PageHeader module="units" action="Add Unit" />
        <DataTable headers={["Unit", "Property", "Status", "Layout", "Rent"]} rows={units} />
      </>
    );
  }
  if (module === "tenants") {
    return (
      <>
        <PageHeader module="tenants" action="Add Tenant" />
        <DataTable headers={["Tenant", "Unit", "Status", "Balance", "Note"]} rows={tenants} />
      </>
    );
  }
  if (module === "leases") {
    return (
      <>
        <PageHeader module="leases" action="New Lease" />
        <DataTable headers={["Lease", "Status", "Date", "Rent"]} rows={leases} />
      </>
    );
  }
  if (module === "payments") {
    return (
      <>
        <PageHeader module="payments" action="Record Payment" />
        <DataTable headers={["Reference", "Account", "Status", "Amount", "Date"]} rows={payments} />
      </>
    );
  }
  if (module === "invoices") {
    return (
      <>
        <PageHeader module="invoices" action="Create Invoice" />
        <DataTable headers={["Invoice", "Vendor", "Status", "Amount"]} rows={invoices} />
      </>
    );
  }
  return <DashboardOverview />;
}
