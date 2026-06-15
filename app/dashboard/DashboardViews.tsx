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

    showToast(`Lease created for ${tenantName} — unit ${unit.unit}`);
    onTenantAdded(unit.unit, tenantName.trim(), leaseEnd);
    onClose();
  }

  return (
    <Modal open title={`Invite Tenant — ${unit.unit}`} onClose={onClose}>
      <form className="form-grid" onSubmit={handleSend}>
        <p className="meta">{unit.property} · {unit.unit}</p>

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
          Create Lease &amp; Invite Tenant
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

function TenantManagementView() {
  return <OwnerMyRentalsView />;
}

export function ModuleView({ module }: { module: DashboardModule }) {
  if (module === "tenant-management") return <TenantManagementView />;
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
  if (module === "payments") return <PaymentsWithReceiptsView />;
  if (module === "invoices") {
    return <TableModuleView module="invoices" action="Create Invoice" headers={["Invoice", "Vendor", "Status", "Amount"]} rows={invoices} />;
  }
  return <DashboardOverview />;
}
