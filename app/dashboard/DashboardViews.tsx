"use client";

import { useMemo, useState, type DragEvent, type FormEvent } from "react";
import {
  DashboardModule,
  dashboardProperties,
  documentFolders,
  invoices,
  kpis,
  leases,
  maintenanceTickets as initialTickets,
  messageDetails,
  moduleMeta,
  payments,
  tenants,
  units,
} from "../data/dashboard";
import { documentFiles, payments as paymentRecords, periodOptions } from "../data/mockData";
import { RevenueChart } from "../components/charts/RevenueChart";
import { Modal } from "../components/Modal";
import { showToast } from "../components/Toast";
import { statusClassForLabel } from "../components/statusBadge";
import {
  LandlordApplicationSubmitPanel,
  LandlordApplicationsReviewPanel,
} from "./LandlordApplicationPanels";

type TicketStatus = "New" | "In Progress" | "Resolved";

type Ticket = {
  id: string;
  title: string;
  property: string;
  unit: string;
  priority: string;
  status: TicketStatus;
  assignee: string | null;
  createdDate: string;
  dueDate: string;
  description: string;
};

function PageHeader({
  module,
  title,
  text,
  action = "Export",
  onAction,
  period,
  onPeriodChange,
}: {
  module: DashboardModule;
  title?: string;
  text?: string;
  action?: string;
  onAction?: () => void;
  period?: string;
  onPeriodChange?: (value: string) => void;
}) {
  const meta = moduleMeta[module];
  const [showPeriod, setShowPeriod] = useState(false);

  return (
    <div className="dashboard-page-header">
      <div>
        <span className="eyebrow">{meta.label}</span>
        <h1>{title ?? meta.label}</h1>
        <p>{text ?? meta.summary}</p>
      </div>
      <div className="dashboard-actions">
        <div className="topbar-menu-wrap">
          <button className="btn btn-secondary" type="button" onClick={() => setShowPeriod((v) => !v)}>
            {period ?? "This Month"}
          </button>
          {showPeriod && onPeriodChange ? (
            <div className="topbar-dropdown topbar-period-panel">
              {periodOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className="topbar-dropdown-item"
                  onClick={() => {
                    onPeriodChange(opt);
                    setShowPeriod(false);
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <button className="btn btn-primary" type="button" onClick={onAction}>
          {action}
        </button>
      </div>
    </div>
  );
}

function KpiGrid() {
  return (
    <div className="dashboard-kpi-grid">
      {kpis.map((item) => (
        <article className="dashboard-card kpi-card card-interactive" key={item.label}>
          <div>
            <span>{item.label}</span>
            <strong className="font-data-lg">{item.value}</strong>
          </div>
          <small>{item.trend}</small>
          <p>{item.text}</p>
        </article>
      ))}
    </div>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="dashboard-card table-card">
      <table className="zebra-rows">
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
                  {index === 2 || (headers[index] === "Status") ? (
                    <span className={`status-chip ${statusClassForLabel(cell)}`}>{cell}</span>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function exportPaymentsCsv() {
  const header = "Reference,Tenant,Property,Status,Amount,Date,Method\n";
  const rows = paymentRecords.map((p) =>
    `${p.ref},${p.tenant},${p.property},${p.status},${p.amount},${p.date},${p.method ?? ""}`,
  ).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "special-gardens-payments.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function QuickCreateModal({
  open,
  title,
  onClose,
  onSubmit,
  fieldLabel,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (value: string) => void;
  fieldLabel: string;
}) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit(value.trim());
    setValue("");
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          {fieldLabel}
          <input value={value} onChange={(e) => setValue(e.target.value)} required />
        </label>
        <button className="btn btn-primary" type="submit">
          Submit
        </button>
      </form>
    </Modal>
  );
}

export function DashboardOverview() {
  const [period, setPeriod] = useState("This Month");

  return (
    <>
      <PageHeader
        module="dashboard"
        title="Executive Overview"
        text="Portfolio performance metrics, operating pressure, and resident service health."
        action="Export Report"
        period={period}
        onPeriodChange={setPeriod}
        onAction={() => {
          exportPaymentsCsv();
          showToast("Report export initiated. File will download shortly.");
        }}
      />
      <KpiGrid />
      <div className="dashboard-split">
        <article className="dashboard-card">
          <h2>Revenue distribution</h2>
          <RevenueChart variant="bar" height={280} />
          <p>Collections are pacing ahead of plan, supported by high renewal rates in core estates.</p>
        </article>
        <article className="dashboard-card">
          <h2>Priority Work</h2>
          {initialTickets.filter((t) => t.status !== "Resolved").slice(0, 4).map((item) => (
            <div className="dashboard-task" key={item.id}>
              <span />
              <strong>{item.title}</strong>
            </div>
          ))}
        </article>
      </div>
    </>
  );
}

export function PropertiesView() {
  const [tab, setTab] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [period, setPeriod] = useState("This Month");

  const filtered = useMemo(() => {
    if (tab === "All") return dashboardProperties;
    if (tab === "Active") return dashboardProperties.filter((p) => p.tab === "Active");
    if (tab === "Development") return dashboardProperties.filter((p) => p.tab === "Development");
    return dashboardProperties.filter((p) => p.tab === "Maintenance");
  }, [tab]);

  const tabs = [
    { label: "All Properties", key: "All", count: dashboardProperties.length },
    { label: "Active", key: "Active", count: dashboardProperties.filter((p) => p.tab === "Active").length },
    { label: "Development", key: "Development", count: dashboardProperties.filter((p) => p.tab === "Development").length },
    { label: "Maintenance", key: "Maintenance", count: dashboardProperties.filter((p) => p.tab === "Maintenance").length },
  ];

  return (
    <>
      <PageHeader
        module="properties"
        action="Add Property"
        period={period}
        onPeriodChange={setPeriod}
        onAction={() => setModalOpen(true)}
      />
      <QuickCreateModal
        open={modalOpen}
        title="Add Property"
        fieldLabel="Property name"
        onClose={() => setModalOpen(false)}
        onSubmit={(name) => showToast(`Property "${name}" submitted for review.`)}
      />
      <div className="dashboard-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            className={tab === t.key ? "dashboard-tab-active" : ""}
            onClick={() => setTab(t.key)}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>
      <div className="dashboard-property-grid">
        {filtered.map((property) => (
          <article className="dashboard-property-card card-interactive" key={property.name}>
            <div className="dashboard-property-image">
              <img src={property.image} alt={`${property.name} exterior`} />
              <span className={`status-chip ${statusClassForLabel(property.status)}`}>{property.status}</span>
            </div>
            <div className="dashboard-property-body">
              <h2>{property.name}</h2>
              <p>{property.address}</p>
              <div>
                <span>
                  Units <strong className="font-data-md">{property.units}</strong>
                </span>
                <span>
                  Occupancy <strong className="font-data-md">{property.occupancy}</strong>
                </span>
                <span>
                  Revenue <strong className="font-data-md">{property.revenue}</strong>
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
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets as Ticket[]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const columns = [
    { title: "New", status: "New" as const },
    { title: "In progress", status: "In Progress" as const },
    { title: "Resolved", status: "Resolved" as const },
  ];

  function onDrop(status: TicketStatus) {
    if (!dragId) return;
    setTickets((prev) =>
      prev.map((t) => (t.id === dragId ? { ...t, status } : t)),
    );
    showToast(`Ticket ${dragId} moved to ${status}.`);
    setDragId(null);
  }

  return (
    <>
      <PageHeader
        module="maintenance"
        action="New Ticket"
        onAction={() => setModalOpen(true)}
      />
      <QuickCreateModal
        open={modalOpen}
        title="New Maintenance Ticket"
        fieldLabel="Issue title"
        onClose={() => setModalOpen(false)}
        onSubmit={(title) => {
          const id = `TKT-${String(Math.floor(Math.random() * 900) + 100)}`;
          setTickets((prev) => [
            {
              id,
              title,
              property: "Cedar Terrace",
              unit: "—",
              priority: "Medium",
              status: "New",
              assignee: null,
              createdDate: new Date().toISOString().slice(0, 10),
              dueDate: new Date().toISOString().slice(0, 10),
              description: "Submitted via dashboard.",
            },
            ...prev,
          ]);
          showToast(`Request submitted. Reference: ${id}`);
        }}
      />
      <div className="kanban-board">
        {columns.map((column) => (
          <section
            className="dashboard-card kanban-column"
            key={column.title}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(column.status)}
          >
            <h2>{column.title}</h2>
            {tickets
              .filter((t) => t.status === column.status)
              .map((ticket) => (
                <article
                  className="kanban-ticket card-interactive"
                  key={ticket.id}
                  draggable
                  onDragStart={() => setDragId(ticket.id)}
                  onDragEnd={() => setDragId(null)}
                >
                  <span className={`status-chip ${statusClassForLabel(ticket.priority)}`}>{ticket.priority}</span>
                  <strong>{ticket.title}</strong>
                  <p className="meta">{ticket.id} · {ticket.property}</p>
                  <p>{ticket.description}</p>
                </article>
              ))}
          </section>
        ))}
      </div>
    </>
  );
}

export function MessagesView() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <>
      <PageHeader
        module="messages"
        action="Compose"
        onAction={() => showToast("Compose message — feature available in full REMS deployment.", "info")}
      />
      <div className="dashboard-card inbox-list">
        {messageDetails.map((msg) => (
          <article
            key={msg.id}
            className={`inbox-row${expanded === msg.id ? " inbox-row-expanded" : ""}`}
            onClick={() => setExpanded(expanded === msg.id ? null : msg.id)}
            onKeyDown={(e) => e.key === "Enter" && setExpanded(expanded === msg.id ? null : msg.id)}
            role="button"
            tabIndex={0}
          >
            <div className="dashboard-avatar">{msg.avatar}</div>
            <div>
              <strong>{msg.sender}</strong>
              <p>{msg.subject}</p>
              {expanded === msg.id ? <p className="inbox-body">{msg.body}</p> : <p className="meta">{msg.preview}</p>}
            </div>
            <span className="meta">{msg.time}</span>
          </article>
        ))}
      </div>
    </>
  );
}

export function DocumentsView() {
  const [openFolder, setOpenFolder] = useState<string | null>(null);

  return (
    <>
      <PageHeader
        module="documents"
        action="Upload"
        onAction={() => showToast("Upload queued. Document will appear in vault shortly.", "info")}
      />
      <div className="document-grid">
        {documentFolders.map((doc) => (
          <article
            className="dashboard-card document-card card-interactive"
            key={doc.id}
            onClick={() => setOpenFolder(doc.folder)}
            onKeyDown={(e) => e.key === "Enter" && setOpenFolder(doc.folder)}
            role="button"
            tabIndex={0}
          >
            <span>{doc.icon}</span>
            <h2>{doc.folder}</h2>
            <p>{doc.fileCount} files</p>
            <small>Updated {doc.lastUpdated}</small>
          </article>
        ))}
      </div>
      <Modal open={!!openFolder} onClose={() => setOpenFolder(null)} title={openFolder ?? "Documents"}>
        <ul className="document-file-list">
          {(openFolder ? documentFiles[openFolder] ?? [] : []).map((file) => (
            <li key={file}>
              <button type="button" onClick={() => showToast(`Opening ${file}…`, "info")}>
                {file}
              </button>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}

export function ReportsView() {
  return (
    <>
      <PageHeader
        module="reports"
        action="Download"
        onAction={() => {
          exportPaymentsCsv();
          showToast("Report export initiated. File will download shortly.");
        }}
      />
      <KpiGrid />
      <div className="dashboard-card">
        <h2>Strategic insights</h2>
        <RevenueChart variant="line" height={240} />
        <div className="insight-grid">
          {["Renewals", "Revenue", "Occupancy", "Service SLA"].map((label, index) => (
            <div key={label}>
              <span>{label}</span>
              <strong className="font-data-lg">{[87, 104, 94, 91][index]}%</strong>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function SettingsView() {
  const [name, setName] = useState("Eleanor Vance");
  const [email, setEmail] = useState("eleanor@specialgardens.com");

  return (
    <>
      <PageHeader
        module="settings"
        action="Save Changes"
        onAction={() => showToast("Profile updated successfully.")}
      />
      <div className="settings-grid">
        <section className="dashboard-card">
          <h2>Profile</h2>
          <label>
            Display name
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Notification email
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
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
            <input defaultValue="GH₵ 5,000" />
          </label>
        </section>
      </div>
    </>
  );
}

function TableModuleView({
  module,
  action,
  headers,
  rows,
}: {
  module: DashboardModule;
  action: string;
  headers: string[];
  rows: string[][];
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const labels: Record<string, string> = {
    "Add Unit": "Unit identifier",
    "Add Tenant": "Tenant name",
    "New Lease": "Lease reference",
    "Record Payment": "Payment reference",
    "Create Invoice": "Invoice vendor",
  };

  return (
    <>
      <PageHeader module={module} action={action} onAction={() => setModalOpen(true)} />
      <QuickCreateModal
        open={modalOpen}
        title={action}
        fieldLabel={labels[action] ?? "Name"}
        onClose={() => setModalOpen(false)}
        onSubmit={(value) => showToast(`${action}: "${value}" recorded.`)}
      />
      <DataTable headers={headers} rows={rows} />
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
    return <TableModuleView module="units" action="Add Unit" headers={["Unit", "Property", "Status", "Layout", "Rent"]} rows={units} />;
  }
  if (module === "tenants") {
    return <TableModuleView module="tenants" action="Add Tenant" headers={["Tenant", "Unit", "Status", "Balance", "Note"]} rows={tenants} />;
  }
  if (module === "leases") {
    return <TableModuleView module="leases" action="New Lease" headers={["Lease", "Status", "Date", "Rent"]} rows={leases} />;
  }
  if (module === "payments") {
    return <TableModuleView module="payments" action="Record Payment" headers={["Reference", "Account", "Status", "Amount", "Date"]} rows={payments} />;
  }
  if (module === "invoices") {
    return <TableModuleView module="invoices" action="Create Invoice" headers={["Invoice", "Vendor", "Status", "Amount"]} rows={invoices} />;
  }
  return <DashboardOverview />;
}
