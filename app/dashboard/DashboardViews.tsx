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
import { getStoredRole } from "../data/roles";

// ─── Tenant-scoped mock data ────────────────────────────────────────────────
const TENANT_LEASE = {
  id: "LSE-2026-006",
  property: "Cedar Terrace",
  unit: "Apt 512",
  status: "Active",
  startDate: "2026-01-01",
  endDate: "2026-12-31",
  rentMonthly: 3200,
  deposit: 6400,
};

const TENANT_PAYMENT_RECORDS = [
  { ref: "PAY-20260524-011", status: "Completed", amount: 3200, date: "2026-05-24", method: "Bank Transfer", receipt_hash: "PAY-20260524-011" },
  { ref: "PAY-20260421-009", status: "Completed", amount: 3200, date: "2026-04-21", method: "Mobile Money",  receipt_hash: "PAY-20260421-009" },
  { ref: "PAY-20260324-007", status: "Completed", amount: 3200, date: "2026-03-24", method: "Bank Transfer", receipt_hash: "PAY-20260324-007" },
  { ref: "PAY-20260224-005", status: "Completed", amount: 3200, date: "2026-02-24", method: "Bank Transfer", receipt_hash: "PAY-20260224-005" },
  { ref: "PAY-20260124-003", status: "Completed", amount: 3200, date: "2026-01-24", method: "Bank Transfer", receipt_hash: "PAY-20260124-003" },
];

const TENANT_MAINTENANCE_TICKETS: Ticket[] = [
  { id: "RES-001", title: "Air conditioning not cooling", property: "Cedar Terrace", unit: "Apt 512", priority: "Medium", status: "In Progress", assignee: "Emmanuel Tetteh", createdDate: "2026-06-01", dueDate: "2026-06-10", description: "Bedroom AC unit not reaching set temperature despite running continuously." },
  { id: "RES-002", title: "Bathroom tap dripping", property: "Cedar Terrace", unit: "Apt 512", priority: "Low", status: "New", assignee: null, createdDate: "2026-06-10", dueDate: "2026-06-20", description: "Cold water tap in main bathroom drips continuously when closed." },
  { id: "RES-003", title: "Intercom fault", property: "Cedar Terrace", unit: "Apt 512", priority: "Medium", status: "Resolved", assignee: "James Hackman", createdDate: "2026-05-15", dueDate: "2026-05-18", description: "Intercom unit was not ringing when visitors pressed buzzer. Fixed." },
];

const TENANT_INBOX = [
  { id: "TM-001", sender: "Estate Management", avatar: "EM", subject: "Lease renewal reminder", preview: "Your lease expires Dec 31, 2026. Please contact us to discuss…", time: "Today", body: "Dear Maya, your lease for Cedar Terrace Apt 512 expires on December 31, 2026. Please contact the estate office at your convenience to discuss renewal terms." },
  { id: "TM-002", sender: "Maintenance Team", avatar: "MT", subject: "RES-001 now in progress", preview: "Your AC ticket has been assigned to our HVAC team…", time: "Jun 1", body: "Your maintenance request (RES-001) for air conditioning has been assigned to Emmanuel Tetteh, our HVAC specialist. Expected resolution within 3–5 business days." },
  { id: "TM-003", sender: "Estate Management", avatar: "EM", subject: "June service charge notice", preview: "Your monthly service charge of GH₵ 350 is due on Jun 30…", time: "Jun 1", body: "This is a reminder that your monthly service charge of GH₵ 350 is due on June 30, 2026. Payment can be made via bank transfer or mobile money." },
];

const TENANT_DOCUMENT_FOLDERS = [
  { id: "TD-001", folder: "My Lease", icon: "L", lastUpdated: "2026-01-01", files: ["Lease_MayaChen_Apt512_2026.pdf", "Lease_Terms_Addendum.pdf"] },
  { id: "TD-002", folder: "Payment Receipts", icon: "R", lastUpdated: "2026-05-24", files: ["Receipt_Jan2026.pdf", "Receipt_Feb2026.pdf", "Receipt_Mar2026.pdf", "Receipt_Apr2026.pdf", "Receipt_May2026.pdf"] },
  { id: "TD-003", folder: "Notices", icon: "N", lastUpdated: "2026-01-05", files: ["MoveIn_Inspection_Jan2026.pdf", "EstateRules_2026.pdf", "ServiceCharge_Schedule.pdf"] },
];

// ─── Owner-scoped mock data ───────────────────────────────────────────────────
const OWNER_INCOME_RECORDS = [
  { ref: "RENT-B0311-MAY26", unit: "B-0311", tenant: "Marcus Webb", status: "Received", amount: 4800, date: "2026-05-01", method: "Bank Transfer" },
  { ref: "RENT-B0311-APR26", unit: "B-0311", tenant: "Marcus Webb", status: "Received", amount: 4800, date: "2026-04-01", method: "Bank Transfer" },
  { ref: "RENT-B0311-MAR26", unit: "B-0311", tenant: "Marcus Webb", status: "Received", amount: 4800, date: "2026-03-01", method: "Bank Transfer" },
  { ref: "RENT-B0311-FEB26", unit: "B-0311", tenant: "Marcus Webb", status: "Received", amount: 4800, date: "2026-02-01", method: "Bank Transfer" },
  { ref: "RENT-B0311-JAN26", unit: "B-0311", tenant: "Marcus Webb", status: "Received", amount: 4800, date: "2026-01-01", method: "Bank Transfer" },
];

const OWNER_LEASE_RECORDS = [
  { id: "LSE-2024-B0311", unit: "B-0311", property: "Oak Court Townhome", tenant: "Marcus Webb", status: "Active", startDate: "2024-01-01", endDate: "2024-12-31", rentMonthly: 4800 },
];

const OWNER_PROPERTY_TICKETS: Ticket[] = [
  { id: "OWN-TKT-001", title: "Water pressure drop — B-0311", property: "Oak Court Townhome", unit: "B-0311", priority: "Medium", status: "New", assignee: null, createdDate: "2026-06-10", dueDate: "2026-06-17", description: "Tenant reported water pressure drop in master bathroom shower." },
  { id: "OWN-TKT-002", title: "Window seal replacement — B-0311", property: "Oak Court Townhome", unit: "B-0311", priority: "Low", status: "Resolved", assignee: "Emmanuel Tetteh", createdDate: "2026-05-20", dueDate: "2026-05-25", description: "Weather seal on master bedroom window replaced successfully." },
];

const OWNER_DOCUMENT_FOLDERS = [
  { id: "OD-001", folder: "Title Deeds", icon: "T", lastUpdated: "2024-01-15", files: ["TitleDeed_B0311_OakCourt.pdf", "TitleDeed_A0104_Meadowline.pdf"] },
  { id: "OD-002", folder: "Lease Agreements", icon: "L", lastUpdated: "2024-01-01", files: ["Lease_MarcusWebb_B0311_2024.pdf"] },
  { id: "OD-003", folder: "Income Statements", icon: "I", lastUpdated: "2026-04-01", files: ["Income_Q1_2026.pdf", "Income_Q4_2024.pdf", "Income_FY2024.pdf"] },
  { id: "OD-004", folder: "Inspection Reports", icon: "R", lastUpdated: "2026-03-15", files: ["Inspection_B0311_MoveIn.pdf", "Inspection_A0104_Annual.pdf"] },
];
import { RevenueChart } from "../components/charts/RevenueChart";
import { Modal } from "../components/Modal";
import { showToast } from "../components/Toast";
import { statusClassForLabel } from "../components/statusBadge";
import { LandlordApplicationsReviewPanel } from "./LandlordApplicationPanels";

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
  const role = getStoredRole();

  if (role === "TENANT") return <TenantDashboardOverview />;
  if (role === "OWNER")  return <OwnerDashboardOverview />;
  if (role === "STAFF")  return <StaffDashboardOverview />;

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

function PaymentsWithReceiptsView() {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      <PageHeader module="payments" action="Record Payment" onAction={() => setModalOpen(true)} />
      <QuickCreateModal
        open={modalOpen}
        title="Record Payment"
        fieldLabel="Payment reference"
        onClose={() => setModalOpen(false)}
        onSubmit={(value) => showToast(`Record Payment: "${value}" recorded.`)}
      />
      <div className="dashboard-card table-card">
        <table className="zebra-rows">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Account</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {paymentRecords.map((p) => (
              <tr key={p.ref}>
                <td className="font-data-md">{p.ref}</td>
                <td>{p.tenant}</td>
                <td>
                  <span className={`status-chip ${statusClassForLabel(p.status)}`}>{p.status}</span>
                </td>
                <td className="font-data-md">GH₵ {p.amount.toLocaleString()}</td>
                <td className="meta">{p.date}</td>
                <td>
                  {p.receipt_hash ? (
                    <a href={`/receipt/${p.receipt_hash}`} target="_blank" rel="noreferrer">
                      View Receipt ↗
                    </a>
                  ) : (
                    <span className="meta">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

type OwnedUnit = {
  unit: string;
  property: string;
  address: string;
  status: "Occupied" | "Vacant";
  rentMonthly: number;
  tenant: {
    name: string;
    email: string;
    phone: string;
    leaseStart: string;
    leaseEnd: string;
    leaseStatus: string;
  } | null;
};

const OWNER_UNITS: OwnedUnit[] = [
  {
    unit: "B-0311",
    property: "Oak Court Townhome",
    address: "Cantonments District, Accra",
    status: "Occupied",
    rentMonthly: 4800,
    tenant: {
      name: "Marcus Webb",
      email: "marcus.webb@example.com",
      phone: "+233 24 555 0192",
      leaseStart: "Jan 1, 2024",
      leaseEnd: "Dec 31, 2024",
      leaseStatus: "Active",
    },
  },
  {
    unit: "A-0104",
    property: "Meadowline Villa",
    address: "East Legon Residential, Accra",
    status: "Vacant",
    rentMonthly: 9200,
    tenant: null,
  },
];

const OWNER_TENANTS_KEY = "ernest_owner_tenants";

type NewTenantRecord = {
  id: string;
  unitId: string;
  property: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  leaseStart: string;
  leaseEnd: string;
  rentMonthly: number;
  currency: "GHS" | "USD";
  addedAt: string;
};

function generateInviteLink(unitId: string, email: string): string {
  const code = btoa(`${unitId}:${email}:${Date.now()}`)
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 20)
    .toUpperCase();
  return `https://specialgardens.example/join?invite=${code}&unit=${encodeURIComponent(unitId)}`;
}

function OwnerInviteTenantModal({
  unit,
  onClose,
  onTenantAdded,
}: {
  unit: OwnedUnit;
  onClose: () => void;
  onTenantAdded: (unitId: string, tenantName: string, leaseEnd: string) => void;
}) {
  const [tenantName, setTenantName] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");
  const [tenantPhone, setTenantPhone] = useState("");
  const [leaseStart, setLeaseStart] = useState("");
  const [leaseEnd, setLeaseEnd] = useState("");
  const [rentAmount, setRentAmount] = useState(String(unit.rentMonthly));
  const [currency, setCurrency] = useState<"GHS" | "USD">("GHS");
  const [error, setError] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!tenantName.trim() || !tenantEmail.trim() || !tenantPhone.trim() || !leaseStart || !leaseEnd) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");

    const record: NewTenantRecord = {
      id: `tenant-${Date.now()}`,
      unitId: unit.unit,
      property: unit.property,
      tenantName: tenantName.trim(),
      tenantEmail: tenantEmail.trim(),
      tenantPhone: tenantPhone.trim(),
      leaseStart,
      leaseEnd,
      rentMonthly: Number(rentAmount) || unit.rentMonthly,
      currency,
      addedAt: new Date().toISOString(),
    };

    const existing = JSON.parse(
      window.localStorage.getItem(OWNER_TENANTS_KEY) ?? "[]",
    ) as NewTenantRecord[];
    window.localStorage.setItem(
      OWNER_TENANTS_KEY,
      JSON.stringify([record, ...existing]),
    );

    onTenantAdded(unit.unit, tenantName.trim(), leaseEnd);
    setInviteLink(generateInviteLink(unit.unit, tenantEmail.trim()));
  }

  if (inviteLink) {
    const whatsappText = encodeURIComponent(
      `Hi ${tenantName.trim()}, your lease for ${unit.property} (${unit.unit}) has been created on Special Gardens Estate. Use this link to set up your resident account — your lease details will already be loaded:\n\n${inviteLink}`,
    );

    return (
      <Modal open title="Lease Created — Share Invite Link" onClose={onClose}>
        <div className="form-grid">
          <p>
            Lease created for <strong>{tenantName.trim()}</strong> at {unit.property} · {unit.unit}.
            Share this link with them — when they open it, their account will be pre-configured with their lease and unit details.
          </p>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              readOnly
              value={inviteLink}
              style={{ flex: 1, fontFamily: "var(--font-mono, monospace)", fontSize: "0.8rem" }}
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(inviteLink);
                showToast("Invite link copied to clipboard.");
              }}
            >
              Copy
            </button>
          </div>

          <a
            className="btn btn-primary"
            href={`https://wa.me/?text=${whatsappText}`}
            target="_blank"
            rel="noreferrer"
            style={{ textAlign: "center", textDecoration: "none" }}
          >
            Share via WhatsApp
          </a>

          <button className="btn btn-secondary" type="button" onClick={onClose}>
            Done
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open title={`Add Tenant — ${unit.unit}`} onClose={onClose}>
      <form className="form-grid" onSubmit={handleSend}>
        <p className="meta">{unit.property} · {unit.unit}</p>
        <p className="meta">
          Fill in the tenant's details and agree the lease terms. Once submitted, an invite
          link will be generated that you can share with the tenant directly — they do not
          need an account yet.
        </p>

        {error && <p className="form-error">{error}</p>}

        <label>
          Tenant full name <span className="form-required">*</span>
          <input
            value={tenantName}
            onChange={(e) => setTenantName(e.target.value)}
            placeholder="Full legal name"
            required
          />
        </label>

        <label>
          Tenant email address <span className="form-required">*</span>
          <input
            type="email"
            value={tenantEmail}
            onChange={(e) => setTenantEmail(e.target.value)}
            placeholder="tenant@example.com"
            required
          />
        </label>

        <label>
          Tenant phone number <span className="form-required">*</span>
          <input
            type="tel"
            value={tenantPhone}
            onChange={(e) => setTenantPhone(e.target.value)}
            placeholder="+233 24 000 0000"
            required
          />
        </label>

        <label>
          Lease start date <span className="form-required">*</span>
          <input
            type="date"
            value={leaseStart}
            onChange={(e) => setLeaseStart(e.target.value)}
            required
          />
        </label>

        <label>
          Lease end date <span className="form-required">*</span>
          <input
            type="date"
            value={leaseEnd}
            onChange={(e) => setLeaseEnd(e.target.value)}
            required
          />
        </label>

        <div className="invite-rent-row">
          <label className="invite-rent-amount">
            Monthly rent <span className="form-required">*</span>
            <input
              type="number"
              min="0"
              value={rentAmount}
              onChange={(e) => setRentAmount(e.target.value)}
              required
            />
          </label>
          <label className="invite-rent-currency">
            Currency
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as "GHS" | "USD")}
            >
              <option value="GHS">GHS</option>
              <option value="USD">USD</option>
            </select>
          </label>
        </div>

        <button className="btn btn-primary" type="submit">
          Create Lease &amp; Generate Invite Link
        </button>
      </form>
    </Modal>
  );
}

function OwnerManageTenantModal({
  unit,
  onClose,
}: {
  unit: OwnedUnit;
  onClose: () => void;
}) {
  const t = unit.tenant;
  if (!t) return null;

  return (
    <Modal open title={`Tenant Profile — ${unit.unit}`} onClose={onClose}>
      <div className="my-rentals-profile-panel">
        <div className="my-rentals-profile-avatar" aria-hidden="true">
          {t.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        <div>
          <strong className="my-rentals-profile-name">{t.name}</strong>
          <span className="meta">{unit.property} · {unit.unit}</span>
        </div>
      </div>

      <dl className="my-rentals-profile-fields">
        <dt>Email</dt>
        <dd>{t.email}</dd>

        <dt>Phone</dt>
        <dd>{t.phone}</dd>

        <dt>Lease period</dt>
        <dd>{t.leaseStart} — {t.leaseEnd}</dd>

        <dt>Lease status</dt>
        <dd>
          <span className={`status-chip ${statusClassForLabel(t.leaseStatus)}`}>
            {t.leaseStatus}
          </span>
        </dd>

        <dt>Monthly rent</dt>
        <dd className="font-data-md">GH₵ {unit.rentMonthly.toLocaleString()}</dd>
      </dl>
    </Modal>
  );
}

function OwnerMyRentalsView() {
  const [units, setUnits] = useState<OwnedUnit[]>([...OWNER_UNITS]);
  const [inviting, setInviting] = useState<OwnedUnit | null>(null);
  const [managing, setManaging] = useState<OwnedUnit | null>(null);

  function handleTenantAdded(unitId: string, tenantName: string, leaseEnd: string) {
    setUnits((prev) =>
      prev.map((u) =>
        u.unit === unitId
          ? {
              ...u,
              status: "Occupied" as const,
              tenant: {
                name: tenantName,
                email: "",
                phone: "",
                leaseStart: new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
                leaseEnd,
                leaseStatus: "Active",
              },
            }
          : u,
      ),
    );
  }

  const occupied = units.filter((u) => u.status === "Occupied").length;
  const vacant = units.filter((u) => u.status === "Vacant").length;

  return (
    <>
      {inviting && (
        <OwnerInviteTenantModal
          unit={inviting}
          onClose={() => setInviting(null)}
          onTenantAdded={handleTenantAdded}
        />
      )}
      {managing && (
        <OwnerManageTenantModal
          unit={managing}
          onClose={() => setManaging(null)}
        />
      )}

      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">My Rentals</span>
          <h1>My Properties</h1>
          <p>Manage occupancy, invite new tenants, and view current lease details for your owned units.</p>
        </div>
      </div>

      <div className="my-rentals-summary">
        <div className="my-rentals-stat">
          <span className="font-data-lg">{units.length}</span>
          <span className="meta">Total units</span>
        </div>
        <div className="my-rentals-stat">
          <span className="font-data-lg">{occupied}</span>
          <span className="meta">Occupied</span>
        </div>
        <div className="my-rentals-stat">
          <span className="font-data-lg">{vacant}</span>
          <span className="meta">Vacant</span>
        </div>
      </div>

      <div className="my-rentals-grid">
        {units.map((u) => (
          <article className="my-rentals-unit-card" key={u.unit}>
            <div className="my-rentals-unit-header">
              <div>
                <span className="my-rentals-unit-badge">{u.unit}</span>
                <p className="my-rentals-unit-property">{u.property}</p>
                <p className="my-rentals-unit-address meta">{u.address}</p>
              </div>
              <span className={`status-chip ${statusClassForLabel(u.status)}`}>
                {u.status}
              </span>
            </div>

            <div className="my-rentals-rent-row">
              <span className="meta">Monthly rent</span>
              <span className="font-data-md">GH₵ {u.rentMonthly.toLocaleString()}</span>
            </div>

            {u.tenant ? (
              <div className="my-rentals-tenant-panel">
                <div className="my-rentals-tenant-avatar" aria-hidden="true">
                  {u.tenant.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <strong>{u.tenant.name}</strong>
                  <p className="meta">Lease ends {u.tenant.leaseEnd}</p>
                </div>
              </div>
            ) : (
              <p className="my-rentals-vacant-message">
                This unit is currently vacant. Invite a tenant to begin the onboarding process.
              </p>
            )}

            <div className="my-rentals-actions">
              {u.status === "Vacant" ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setInviting(u)}
                >
                  Invite New Tenant
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setManaging(u)}
                >
                  Manage Current Tenant
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function TenantLeasesView() {
  const endDate = new Date(TENANT_LEASE.endDate);
  const today = new Date();
  const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Leases</span>
          <h1>My Lease</h1>
          <p>Your active lease agreement, payment terms, and renewal status.</p>
        </div>
        <div className="dashboard-actions">
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => showToast("Lease document downloading…", "info")}
          >
            Download PDF
          </button>
        </div>
      </div>

      <div className="dashboard-card">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <div>
            <h2 style={{ margin: 0 }}>{TENANT_LEASE.property} · {TENANT_LEASE.unit}</h2>
            <p className="meta" style={{ margin: "0.25rem 0 0" }}>Ref: {TENANT_LEASE.id}</p>
          </div>
          <span className={`status-chip ${statusClassForLabel(TENANT_LEASE.status)}`}>
            {TENANT_LEASE.status}
          </span>
        </div>

        <dl className="my-rentals-profile-fields">
          <dt>Lease period</dt>
          <dd>{fmt(TENANT_LEASE.startDate)} — {fmt(TENANT_LEASE.endDate)}</dd>

          <dt>Monthly rent</dt>
          <dd className="font-data-md">GH₵ {TENANT_LEASE.rentMonthly.toLocaleString()}</dd>

          <dt>Security deposit</dt>
          <dd className="font-data-md">GH₵ {TENANT_LEASE.deposit.toLocaleString()}</dd>

          <dt>Days remaining</dt>
          <dd className="font-data-md">{Math.max(daysLeft, 0)}</dd>
        </dl>

        {daysLeft > 0 && daysLeft <= 90 && (
          <div style={{ marginTop: "1.25rem", padding: "0.875rem 1rem", background: "var(--warning-bg, #fef9ee)", border: "1px solid var(--warning, #f59e0b)", borderRadius: "var(--radius)", fontSize: "0.875rem" }}>
            <strong>Renewal notice:</strong> Your lease expires in {daysLeft} days. Contact estate management to discuss renewal terms.
          </div>
        )}
      </div>
    </>
  );
}

function TenantPaymentsView() {
  const nextDue = new Date();
  nextDue.setMonth(nextDue.getMonth() + 1);
  nextDue.setDate(1);
  const fmtShort = (d: Date | string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Payments</span>
          <h1>My Payments</h1>
          <p>Your rent payment history and receipts.</p>
        </div>
        <div className="dashboard-actions">
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => showToast("Statement download started.", "info")}
          >
            Download Statement
          </button>
        </div>
      </div>

      <div className="dashboard-card" style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
        <div>
          <span className="meta" style={{ display: "block", marginBottom: "0.25rem" }}>Property</span>
          <span style={{ fontWeight: 600 }}>{TENANT_LEASE.property} · {TENANT_LEASE.unit}</span>
        </div>
        <div>
          <span className="meta" style={{ display: "block", marginBottom: "0.25rem" }}>Monthly Rent</span>
          <span className="font-data-md">GH₵ {TENANT_LEASE.rentMonthly.toLocaleString()}</span>
        </div>
        <div>
          <span className="meta" style={{ display: "block", marginBottom: "0.25rem" }}>Lease Ends</span>
          <span>{fmtShort(TENANT_LEASE.endDate)}</span>
        </div>
        <div>
          <span className="meta" style={{ display: "block", marginBottom: "0.25rem" }}>Next Due</span>
          <span>{fmtShort(nextDue)}</span>
        </div>
      </div>

      <div className="dashboard-card table-card">
        <table className="zebra-rows">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Method</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {TENANT_PAYMENT_RECORDS.map((p) => (
              <tr key={p.ref}>
                <td className="font-data-md">{p.ref}</td>
                <td><span className={`status-chip ${statusClassForLabel(p.status)}`}>{p.status}</span></td>
                <td className="font-data-md">GH₵ {p.amount.toLocaleString()}</td>
                <td className="meta">{p.date}</td>
                <td>{p.method}</td>
                <td>
                  {p.receipt_hash ? (
                    <a href={`/receipt/${p.receipt_hash}`} target="_blank" rel="noreferrer">View Receipt ↗</a>
                  ) : (
                    <span className="meta">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── TENANT scoped views ──────────────────────────────────────────────────────

function TenantDashboardOverview() {
  const endDate = new Date(TENANT_LEASE.endDate);
  const today = new Date();
  const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const nextDue = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const openTickets = TENANT_MAINTENANCE_TICKETS.filter((t) => t.status !== "Resolved");
  const lastPayment = TENANT_PAYMENT_RECORDS[0];

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1>Welcome back</h1>
          <p>{TENANT_LEASE.property} · {TENANT_LEASE.unit} — your tenancy at a glance.</p>
        </div>
      </div>

      <div className="dashboard-kpi-grid">
        <article className="dashboard-card kpi-card card-interactive">
          <div>
            <span>Lease Status</span>
            <strong className="font-data-lg">
              <span className={`status-chip ${statusClassForLabel(TENANT_LEASE.status)}`}>{TENANT_LEASE.status}</span>
            </strong>
          </div>
          <small>{Math.max(daysLeft, 0)} days remaining</small>
          <p>Expires {new Date(TENANT_LEASE.endDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
        </article>
        <article className="dashboard-card kpi-card card-interactive">
          <div>
            <span>Monthly Rent</span>
            <strong className="font-data-lg">GH₵ {TENANT_LEASE.rentMonthly.toLocaleString()}</strong>
          </div>
          <small>Last paid {lastPayment.date}</small>
          <p>Next due {nextDue.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
        </article>
        <article className="dashboard-card kpi-card card-interactive">
          <div>
            <span>Open Requests</span>
            <strong className="font-data-lg">{openTickets.length}</strong>
          </div>
          <small>{TENANT_MAINTENANCE_TICKETS.filter((t) => t.status === "Resolved").length} resolved</small>
          <p>Maintenance tickets you have submitted</p>
        </article>
      </div>

      {openTickets.length > 0 && (
        <div className="dashboard-card">
          <h2>Open maintenance requests</h2>
          {openTickets.map((t) => (
            <div key={t.id} style={{ display: "flex", gap: "0.75rem", alignItems: "center", padding: "0.75rem 0", borderTop: "1px solid var(--border)" }}>
              <span className={`status-chip ${statusClassForLabel(t.priority)}`} style={{ flexShrink: 0 }}>{t.priority}</span>
              <strong style={{ flex: 1 }}>{t.title}</strong>
              <span className={`status-chip ${statusClassForLabel(t.status)}`} style={{ flexShrink: 0 }}>{t.status}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function TenantMaintenanceView() {
  const [tickets, setTickets] = useState<Ticket[]>(TENANT_MAINTENANCE_TICKETS);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <PageHeader
        module="maintenance"
        title="My Maintenance Requests"
        text="Submit and track repair or service requests for your unit."
        action="New Request"
        onAction={() => setModalOpen(true)}
      />
      <QuickCreateModal
        open={modalOpen}
        title="New Maintenance Request"
        fieldLabel="Describe the issue"
        onClose={() => setModalOpen(false)}
        onSubmit={(title) => {
          const id = `RES-${String(Math.floor(Math.random() * 900) + 100)}`;
          setTickets((prev) => [
            { id, title, property: TENANT_LEASE.property, unit: TENANT_LEASE.unit, priority: "Medium", status: "New", assignee: null, createdDate: new Date().toISOString().slice(0, 10), dueDate: new Date().toISOString().slice(0, 10), description: "Submitted via resident portal." },
            ...prev,
          ]);
          showToast(`Request submitted. Reference: ${id}`);
        }}
      />
      <div className="dashboard-card table-card">
        <table className="zebra-rows">
          <thead>
            <tr>
              <th>Ref</th>
              <th>Issue</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id}>
                <td className="font-data-md">{t.id}</td>
                <td>
                  <strong>{t.title}</strong>
                  <p className="meta" style={{ margin: 0 }}>{t.description}</p>
                </td>
                <td><span className={`status-chip ${statusClassForLabel(t.priority)}`}>{t.priority}</span></td>
                <td><span className={`status-chip ${statusClassForLabel(t.status)}`}>{t.status}</span></td>
                <td className="meta">{t.createdDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function TenantInboxView() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <>
      <PageHeader
        module="messages"
        title="My Messages"
        text="Communications from estate management and your maintenance team."
        action="Compose"
        onAction={() => showToast("Compose message — available in full REMS deployment.", "info")}
      />
      <div className="dashboard-card inbox-list">
        {TENANT_INBOX.map((msg) => (
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

function TenantDocumentsView() {
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  const currentFolder = TENANT_DOCUMENT_FOLDERS.find((f) => f.folder === openFolder);

  return (
    <>
      <PageHeader
        module="documents"
        title="My Documents"
        text="Your lease, payment receipts, and estate notices."
        action="Request Document"
        onAction={() => showToast("Document request submitted. Estate office will respond within 2 business days.", "info")}
      />
      <div className="document-grid">
        {TENANT_DOCUMENT_FOLDERS.map((doc) => (
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
            <p>{doc.files.length} files</p>
            <small>Updated {doc.lastUpdated}</small>
          </article>
        ))}
      </div>
      <Modal open={!!openFolder} onClose={() => setOpenFolder(null)} title={openFolder ?? "Documents"}>
        <ul className="document-file-list">
          {(currentFolder?.files ?? []).map((file) => (
            <li key={file}>
              <button type="button" onClick={() => showToast(`Opening ${file}…`, "info")}>{file}</button>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}

// ─── OWNER scoped views ───────────────────────────────────────────────────────

function OwnerDashboardOverview() {
  const occupied = OWNER_UNITS.filter((u) => u.status === "Occupied").length;
  const vacant = OWNER_UNITS.filter((u) => u.status === "Vacant").length;
  const monthlyIncome = OWNER_INCOME_RECORDS
    .filter((r) => r.date.startsWith("2026-05"))
    .reduce((sum, r) => sum + r.amount, 0);
  const openTickets = OWNER_PROPERTY_TICKETS.filter((t) => t.status !== "Resolved");

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1>My Portfolio</h1>
          <p>Occupancy and income summary across your owned units.</p>
        </div>
      </div>

      <div className="dashboard-kpi-grid">
        <article className="dashboard-card kpi-card card-interactive">
          <div>
            <span>Total Units</span>
            <strong className="font-data-lg">{OWNER_UNITS.length}</strong>
          </div>
          <small>{occupied} occupied · {vacant} vacant</small>
          <p>Across your owned properties</p>
        </article>
        <article className="dashboard-card kpi-card card-interactive">
          <div>
            <span>Monthly Income</span>
            <strong className="font-data-lg">GH₵ {monthlyIncome.toLocaleString()}</strong>
          </div>
          <small>May 2026</small>
          <p>Rent received from occupied units</p>
        </article>
        <article className="dashboard-card kpi-card card-interactive">
          <div>
            <span>Open Issues</span>
            <strong className="font-data-lg">{openTickets.length}</strong>
          </div>
          <small>maintenance tickets</small>
          <p>Across your properties</p>
        </article>
      </div>

      <div className="my-rentals-grid">
        {OWNER_UNITS.map((u) => (
          <article className="my-rentals-unit-card" key={u.unit}>
            <div className="my-rentals-unit-header">
              <div>
                <span className="my-rentals-unit-badge">{u.unit}</span>
                <p className="my-rentals-unit-property">{u.property}</p>
                <p className="my-rentals-unit-address meta">{u.address}</p>
              </div>
              <span className={`status-chip ${statusClassForLabel(u.status)}`}>{u.status}</span>
            </div>
            <div className="my-rentals-rent-row">
              <span className="meta">Monthly rent</span>
              <span className="font-data-md">GH₵ {u.rentMonthly.toLocaleString()}</span>
            </div>
            {u.tenant ? (
              <div className="my-rentals-tenant-panel">
                <div className="my-rentals-tenant-avatar" aria-hidden="true">
                  {u.tenant.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <strong>{u.tenant.name}</strong>
                  <p className="meta">Lease ends {u.tenant.leaseEnd}</p>
                </div>
              </div>
            ) : (
              <p className="my-rentals-vacant-message">Unit is currently vacant.</p>
            )}
          </article>
        ))}
      </div>
    </>
  );
}

function OwnerPropertiesView() {
  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Properties</span>
          <h1>My Properties</h1>
          <p>Your owned units within the estate.</p>
        </div>
      </div>
      <div className="my-rentals-grid">
        {OWNER_UNITS.map((u) => (
          <article className="my-rentals-unit-card" key={u.unit}>
            <div className="my-rentals-unit-header">
              <div>
                <span className="my-rentals-unit-badge">{u.unit}</span>
                <p className="my-rentals-unit-property">{u.property}</p>
                <p className="my-rentals-unit-address meta">{u.address}</p>
              </div>
              <span className={`status-chip ${statusClassForLabel(u.status)}`}>{u.status}</span>
            </div>
            <div className="my-rentals-rent-row">
              <span className="meta">Monthly rent</span>
              <span className="font-data-md">GH₵ {u.rentMonthly.toLocaleString()}</span>
            </div>
            {u.tenant ? (
              <div className="my-rentals-tenant-panel">
                <div className="my-rentals-tenant-avatar" aria-hidden="true">
                  {u.tenant.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <strong>{u.tenant.name}</strong>
                  <p className="meta">Lease ends {u.tenant.leaseEnd}</p>
                </div>
              </div>
            ) : (
              <p className="my-rentals-vacant-message">Unit is currently vacant.</p>
            )}
          </article>
        ))}
      </div>
    </>
  );
}

function OwnerLeasesView() {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Leases</span>
          <h1>My Tenant Leases</h1>
          <p>Active lease agreements for your owned units.</p>
        </div>
      </div>

      {OWNER_LEASE_RECORDS.map((lease) => (
        <div className="dashboard-card" key={lease.id} style={{ marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <div>
              <h2 style={{ margin: 0 }}>{lease.property} · {lease.unit}</h2>
              <p className="meta" style={{ margin: "0.25rem 0 0" }}>Tenant: {lease.tenant} · Ref: {lease.id}</p>
            </div>
            <span className={`status-chip ${statusClassForLabel(lease.status)}`}>{lease.status}</span>
          </div>
          <dl className="my-rentals-profile-fields">
            <dt>Lease period</dt>
            <dd>{fmt(lease.startDate)} — {fmt(lease.endDate)}</dd>
            <dt>Monthly rent</dt>
            <dd className="font-data-md">GH₵ {lease.rentMonthly.toLocaleString()}</dd>
          </dl>
        </div>
      ))}

      {OWNER_UNITS.filter((u) => u.status === "Vacant").map((u) => (
        <div className="dashboard-card" key={u.unit} style={{ marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ margin: 0 }}>{u.property} · {u.unit}</h2>
              <p className="meta" style={{ margin: "0.25rem 0 0" }}>No active lease</p>
            </div>
            <span className="status-chip">{u.status}</span>
          </div>
          <p className="my-rentals-vacant-message" style={{ marginTop: "1rem" }}>
            This unit is vacant. Use My Rentals to invite a tenant and create a lease.
          </p>
        </div>
      ))}
    </>
  );
}

function OwnerPaymentsView() {
  const totalReceived = OWNER_INCOME_RECORDS.reduce((sum, r) => sum + r.amount, 0);

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Payments</span>
          <h1>Rental Income</h1>
          <p>Rent received from your tenants across your owned units.</p>
        </div>
        <div className="dashboard-actions">
          <button className="btn btn-secondary" type="button" onClick={() => showToast("Income statement downloading…", "info")}>
            Download Statement
          </button>
        </div>
      </div>

      <div className="dashboard-card" style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
        <div>
          <span className="meta" style={{ display: "block", marginBottom: "0.25rem" }}>Total Received (YTD)</span>
          <span className="font-data-md">GH₵ {totalReceived.toLocaleString()}</span>
        </div>
        <div>
          <span className="meta" style={{ display: "block", marginBottom: "0.25rem" }}>Occupied Units</span>
          <span className="font-data-md">{OWNER_UNITS.filter((u) => u.status === "Occupied").length}</span>
        </div>
        <div>
          <span className="meta" style={{ display: "block", marginBottom: "0.25rem" }}>Monthly Rate</span>
          <span className="font-data-md">GH₵ {(OWNER_INCOME_RECORDS[0]?.amount ?? 0).toLocaleString()}</span>
        </div>
      </div>

      <div className="dashboard-card table-card">
        <table className="zebra-rows">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Unit</th>
              <th>Tenant</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Method</th>
            </tr>
          </thead>
          <tbody>
            {OWNER_INCOME_RECORDS.map((r) => (
              <tr key={r.ref}>
                <td className="font-data-md">{r.ref}</td>
                <td>{r.unit}</td>
                <td>{r.tenant}</td>
                <td><span className={`status-chip ${statusClassForLabel(r.status)}`}>{r.status}</span></td>
                <td className="font-data-md">GH₵ {r.amount.toLocaleString()}</td>
                <td className="meta">{r.date}</td>
                <td>{r.method}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function OwnerMaintenanceView() {
  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Maintenance</span>
          <h1>Property Maintenance</h1>
          <p>Maintenance tickets raised against your owned units.</p>
        </div>
      </div>
      <div className="dashboard-card table-card">
        <table className="zebra-rows">
          <thead>
            <tr>
              <th>Ref</th>
              <th>Issue</th>
              <th>Unit</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {OWNER_PROPERTY_TICKETS.map((t) => (
              <tr key={t.id}>
                <td className="font-data-md">{t.id}</td>
                <td>
                  <strong>{t.title}</strong>
                  <p className="meta" style={{ margin: 0 }}>{t.description}</p>
                </td>
                <td>{t.unit}</td>
                <td><span className={`status-chip ${statusClassForLabel(t.priority)}`}>{t.priority}</span></td>
                <td><span className={`status-chip ${statusClassForLabel(t.status)}`}>{t.status}</span></td>
                <td className="meta">{t.createdDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function OwnerDocumentsView() {
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  const currentFolder = OWNER_DOCUMENT_FOLDERS.find((f) => f.folder === openFolder);

  return (
    <>
      <PageHeader
        module="documents"
        title="My Documents"
        text="Title deeds, lease agreements, income statements, and inspection reports."
        action="Upload"
        onAction={() => showToast("Upload queued. Document will appear in vault shortly.", "info")}
      />
      <div className="document-grid">
        {OWNER_DOCUMENT_FOLDERS.map((doc) => (
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
            <p>{doc.files.length} files</p>
            <small>Updated {doc.lastUpdated}</small>
          </article>
        ))}
      </div>
      <Modal open={!!openFolder} onClose={() => setOpenFolder(null)} title={openFolder ?? "Documents"}>
        <ul className="document-file-list">
          {(currentFolder?.files ?? []).map((file) => (
            <li key={file}>
              <button type="button" onClick={() => showToast(`Opening ${file}…`, "info")}>{file}</button>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}

// ─── STAFF scoped views ───────────────────────────────────────────────────────

function StaffDashboardOverview() {
  const myTickets = (initialTickets as Ticket[]).filter((t) => t.assignee === "Kofi Mensah");
  const openTickets = myTickets.filter((t) => t.status !== "Resolved");

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1>My Tasks</h1>
          <p>Work orders assigned to you today.</p>
        </div>
      </div>

      <div className="dashboard-kpi-grid">
        <article className="dashboard-card kpi-card card-interactive">
          <div>
            <span>Assigned</span>
            <strong className="font-data-lg">{myTickets.length}</strong>
          </div>
          <small>{openTickets.length} still open</small>
          <p>Total tickets assigned to you</p>
        </article>
        <article className="dashboard-card kpi-card card-interactive">
          <div>
            <span>In Progress</span>
            <strong className="font-data-lg">{myTickets.filter((t) => t.status === "In Progress").length}</strong>
          </div>
          <small>Active right now</small>
          <p>Tickets you are currently working on</p>
        </article>
        <article className="dashboard-card kpi-card card-interactive">
          <div>
            <span>Resolved</span>
            <strong className="font-data-lg">{myTickets.filter((t) => t.status === "Resolved").length}</strong>
          </div>
          <small>Completed</small>
          <p>Tickets you have closed</p>
        </article>
      </div>

      <div className="dashboard-card">
        <h2>Open tickets</h2>
        {openTickets.length === 0 ? (
          <p className="meta">No open tickets assigned to you.</p>
        ) : (
          openTickets.map((t) => (
            <div key={t.id} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", padding: "0.75rem 0", borderTop: "1px solid var(--border)" }}>
              <span className={`status-chip ${statusClassForLabel(t.priority)}`} style={{ flexShrink: 0, marginTop: "2px" }}>{t.priority}</span>
              <div>
                <strong>{t.title}</strong>
                <p className="meta" style={{ margin: 0 }}>{t.property} · Due {t.dueDate}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

function StaffMaintenanceView() {
  const [tickets, setTickets] = useState<Ticket[]>(
    (initialTickets as Ticket[]).filter((t) => t.assignee === "Kofi Mensah"),
  );

  function advance(id: string, current: TicketStatus) {
    const next: TicketStatus = current === "New" ? "In Progress" : "Resolved";
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: next } : t)));
    showToast(`Ticket ${id} marked as ${next}.`);
  }

  return (
    <>
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Maintenance</span>
          <h1>My Assigned Tickets</h1>
          <p>Work orders assigned to you. Update the status as you progress.</p>
        </div>
      </div>
      <div className="dashboard-card table-card">
        <table className="zebra-rows">
          <thead>
            <tr>
              <th>Ref</th>
              <th>Issue</th>
              <th>Property</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Due</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id}>
                <td className="font-data-md">{t.id}</td>
                <td>
                  <strong>{t.title}</strong>
                  <p className="meta" style={{ margin: 0 }}>{t.description}</p>
                </td>
                <td className="meta">{t.property}</td>
                <td><span className={`status-chip ${statusClassForLabel(t.priority)}`}>{t.priority}</span></td>
                <td><span className={`status-chip ${statusClassForLabel(t.status)}`}>{t.status}</span></td>
                <td className="meta">{t.dueDate}</td>
                <td>
                  {t.status !== "Resolved" && (
                    <button
                      className="btn btn-secondary"
                      type="button"
                      style={{ fontSize: "0.8125rem", padding: "0.25rem 0.625rem" }}
                      onClick={() => advance(t.id, t.status)}
                    >
                      {t.status === "New" ? "Start" : "Resolve"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function TenantManagementView() {
  return <OwnerMyRentalsView />;
}

export function ModuleView({ module }: { module: DashboardModule }) {
  const role = getStoredRole();

  if (module === "tenant-management") return <TenantManagementView />;
  if (module === "landlord-applications") return <LandlordApplicationsReviewPanel />;
  if (module === "reports") return <ReportsView />;
  if (module === "settings") return <SettingsView />;

  if (module === "properties") {
    if (role === "OWNER") return <OwnerPropertiesView />;
    return <PropertiesView />;
  }
  if (module === "maintenance") {
    if (role === "TENANT") return <TenantMaintenanceView />;
    if (role === "OWNER")  return <OwnerMaintenanceView />;
    if (role === "STAFF")  return <StaffMaintenanceView />;
    return <MaintenanceView />;
  }
  if (module === "messages") {
    if (role === "TENANT") return <TenantInboxView />;
    return <MessagesView />;
  }
  if (module === "documents") {
    if (role === "TENANT") return <TenantDocumentsView />;
    if (role === "OWNER")  return <OwnerDocumentsView />;
    return <DocumentsView />;
  }
  if (module === "leases") {
    if (role === "TENANT") return <TenantLeasesView />;
    if (role === "OWNER")  return <OwnerLeasesView />;
    return <TableModuleView module="leases" action="New Lease" headers={["Lease", "Status", "Date", "Rent"]} rows={leases} />;
  }
  if (module === "payments") {
    if (role === "TENANT") return <TenantPaymentsView />;
    if (role === "OWNER")  return <OwnerPaymentsView />;
    return <PaymentsWithReceiptsView />;
  }
  if (module === "units") {
    return <TableModuleView module="units" action="Add Unit" headers={["Unit", "Property", "Status", "Layout", "Rent"]} rows={units} />;
  }
  if (module === "tenants") {
    return <TableModuleView module="tenants" action="Add Tenant" headers={["Tenant", "Unit", "Status", "Balance", "Note"]} rows={tenants} />;
  }
  if (module === "invoices") {
    return <TableModuleView module="invoices" action="Create Invoice" headers={["Invoice", "Vendor", "Status", "Amount"]} rows={invoices} />;
  }
  return <DashboardOverview />;
}
