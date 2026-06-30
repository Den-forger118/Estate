"use client";

import { useEffect, useMemo, useState, type DragEvent, type FormEvent } from "react";
import {
  DashboardModule,
  documentFolders,
  documentFiles,
  invoices,
  messageDetails,
  moduleMeta,
  periodOptions,
} from "../data/dashboard";
import { RevenueChart } from "../components/charts/RevenueChart";
import { Modal } from "../components/Modal";
import { showToast } from "../components/Toast";
import { statusClassForLabel } from "../components/statusBadge";
import {
  LandlordApplicationSubmitPanel,
  LandlordApplicationsReviewPanel,
} from "./LandlordApplicationPanels";
import { AccountsView } from "./AccountsView";
import { BuyersView } from "./BuyersView";
import { LeadsView } from "./LeadsView";
import { OffPlanPaymentsView } from "./OffPlanPaymentsView";
import { PaymentPlansView } from "./PaymentPlansView";
import { MilestonesView } from "./MilestonesView";
import { BuyerChatView } from "./BuyerChatView";
import { UnitsInventoryView } from "./UnitsInventoryView";
import { HomeownersView } from "./HomeownersView";
import { CommunityAdminView } from "./CommunityAdminView";
import {
  createMaintenanceTicket,
  getDashboardOverview,
  getMaintenance,
  getLeases,
  getProjects,
  getRentPayments,
  getResidents,
  getStalledOps,
  getUnits,
  updateMaintenanceTicket,
} from "../../lib/api-client";
import { formatGHS } from "../../lib/formatters";
import type {
  DashboardOverview,
  Lease,
  MaintenanceTicket,
  Project,
  RentPayment,
  Resident,
  StalledOpsData,
  TicketStatus,
  Unit,
} from "../data/types";


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

function KpiCard({
  label,
  value,
  trend,
  text,
}: {
  label: string;
  value: string;
  trend: string;
  text: string;
}) {
  return (
    <article className="dashboard-card kpi-card card-interactive">
      <div>
        <span>{label}</span>
        <strong className="font-data-lg">{value}</strong>
      </div>
      <small>{trend}</small>
      <p>{text}</p>
    </article>
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

async function exportPaymentsCsv() {
  const records = await getRentPayments().catch(() => [] as RentPayment[]);
  const header = "Reference,Lease ID,Status,Amount,Due Date\n";
  const rows = records
    .map((p) => `${p.ref ?? ""},${p.leaseId},${p.status},${p.amount},${p.dueDate ?? ""}`)
    .join("\n");
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

function StalledOpsCards() {
  const [data, setData] = useState<StalledOpsData | null>(null);

  useEffect(() => {
    getStalledOps().then(setData).catch(() => {});
  }, []);

  if (!data) return null;

  const cards = [
    {
      key: "installments",
      title: "Stalled Installments",
      subtitle: `DUE >${data.thresholdDays} days`,
      count: data.stalledInstallments.count,
      items: data.stalledInstallments.items,
      color: "var(--error)",
      bg: "var(--error-soft)",
    },
    {
      key: "reservations",
      title: "Stalled Reservations",
      subtitle: `RESERVED >${data.thresholdDays} days`,
      count: data.stalledReservations.count,
      items: data.stalledReservations.items,
      color: "var(--accent)",
      bg: "var(--accent-soft)",
    },
    {
      key: "milestones",
      title: "Overdue Milestones",
      subtitle: "IN_PROGRESS past target",
      count: data.stalledMilestones.count,
      items: data.stalledMilestones.items,
      color: "var(--accent)",
      bg: "var(--accent-soft)",
    },
  ].filter((c) => c.count > 0);

  if (cards.length === 0) return null;

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <p className="eyebrow" style={{ marginBottom: "0.5rem" }}>Operational flags</p>
      <div className="dashboard-kpi-grid">
        {cards.map((card) => (
          <article
            key={card.key}
            className="dashboard-card"
            style={{
              borderColor: card.color,
              background: card.bg,
            }}
          >
            <div>
              <span style={{ color: card.color, fontWeight: 600 }}>{card.title}</span>
              <strong className="font-data-lg" style={{ color: card.color }}>
                {card.count}
              </strong>
            </div>
            <small style={{ color: card.color }}>{card.subtitle}</small>
            {card.items.slice(0, 3).map((item) => (
              <p key={item.id} className="meta" style={{ margin: "0.125rem 0" }}>
                {item.label} · <strong>{item.stalledDays}d</strong>
              </p>
            ))}
          </article>
        ))}
      </div>
    </div>
  );
}

export function DashboardOverview() {
  const [period, setPeriod] = useState("This Month");
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [openTickets, setOpenTickets] = useState<MaintenanceTicket[]>([]);

  useEffect(() => {
    getDashboardOverview().then(setOverview).catch(() => {});
    getMaintenance()
      .then((tickets) => setOpenTickets(tickets.filter((t) => t.status !== "RESOLVED")))
      .catch(() => {});
  }, []);

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
      {overview ? (
        <div className="dashboard-kpi-grid">
          <KpiCard
            label="Occupancy Rate"
            value={`${overview.residency.occupancyPct}%`}
            trend={`${overview.residency.occupiedUnits} / ${overview.residency.totalUnits} units`}
            text="Active leases vs total units"
          />
          <KpiCard
            label="Off-Plan Collected"
            value={formatGHS(overview.offPlan.totalGhsCollected, { compact: true })}
            trend={`${overview.offPlan.unitsSold} units sold`}
            text={`${overview.offPlan.unitsAvailable} units still available`}
          />
          <KpiCard
            label="Rent Collection"
            value={`${overview.residency.rentCollectionPct}%`}
            trend={overview.residency.rentCollectionPct >= 90 ? "On plan" : "Below target"}
            text={`${overview.residency.activeLeases} active leases`}
          />
          <KpiCard
            label="Open Maintenance"
            value={String(overview.residency.openTickets)}
            trend={overview.residency.urgentTickets > 0 ? `${overview.residency.urgentTickets} urgent` : "None urgent"}
            text="Unresolved tickets"
          />
        </div>
      ) : (
        <div className="dashboard-kpi-grid">
          {["Occupancy Rate", "Off-Plan Collected", "Rent Collection", "Open Maintenance"].map((label) => (
            <article className="dashboard-card kpi-card" key={label}>
              <div>
                <span>{label}</span>
                <strong className="font-data-lg">—</strong>
              </div>
              <small>Loading…</small>
            </article>
          ))}
        </div>
      )}
      <StalledOpsCards />
      <div className="dashboard-split">
        <article className="dashboard-card">
          <h2>Revenue distribution</h2>
          <RevenueChart variant="bar" height={280} />
          <p>Collections are pacing ahead of plan, supported by high renewal rates in core estates.</p>
        </article>
        <article className="dashboard-card">
          <h2>Priority Work</h2>
          {openTickets.length === 0 ? (
            <p className="meta">No open tickets.</p>
          ) : (
            openTickets.slice(0, 4).map((ticket) => (
              <div className="dashboard-task" key={ticket.id}>
                <span />
                <strong>{ticket.title}</strong>
              </div>
            ))
          )}
        </article>
      </div>
    </>
  );
}

export function PropertiesView() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [tab, setTab] = useState("All");

  useEffect(() => {
    getProjects().then(setProjects).catch(() => setProjects([]));
  }, []);

  const filtered = useMemo(() => {
    if (!projects) return [];
    if (tab === "All") return projects;
    return projects.filter((p) => p.status === tab);
  }, [projects, tab]);

  const counts = useMemo(() => {
    if (!projects) return { All: 0, ACTIVE: 0, COMPLETED: 0, ON_HOLD: 0 };
    return {
      All: projects.length,
      ACTIVE: projects.filter((p) => p.status === "ACTIVE").length,
      COMPLETED: projects.filter((p) => p.status === "COMPLETED").length,
      ON_HOLD: projects.filter((p) => p.status === "ON_HOLD").length,
    };
  }, [projects]);

  const tabs = [
    { label: "All", key: "All" },
    { label: "Active", key: "ACTIVE" },
    { label: "Completed", key: "COMPLETED" },
    { label: "On Hold", key: "ON_HOLD" },
  ];

  return (
    <>
      <PageHeader module="properties" />
      <div className="dashboard-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            className={tab === t.key ? "dashboard-tab-active" : ""}
            onClick={() => setTab(t.key)}
          >
            {t.label} ({counts[t.key as keyof typeof counts] ?? 0})
          </button>
        ))}
      </div>
      {projects === null ? (
        <p className="meta" style={{ padding: "1rem" }}>Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="meta" style={{ padding: "1rem" }}>No projects found. Create one via the Units module.</p>
      ) : (
        <div className="dashboard-property-grid">
          {filtered.map((project) => (
            <article className="dashboard-property-card" key={project.id}>
              <div className="dashboard-property-body">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                  <h2 style={{ margin: 0 }}>{project.name}</h2>
                  <span className={`status-chip ${statusClassForLabel(project.status)}`}>{project.status}</span>
                </div>
                <p style={{ margin: "0.25rem 0 0", color: "var(--text-muted)" }}>{project.location ?? "—"}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

const MAINT_COLUMNS: { label: string; status: TicketStatus }[] = [
  { label: "New", status: "NEW" },
  { label: "In progress", status: "IN_PROGRESS" },
  { label: "Resolved", status: "RESOLVED" },
];

function fmtPriority(p: string) {
  return p.charAt(0) + p.slice(1).toLowerCase();
}

export function MaintenanceView() {
  const [tickets, setTickets] = useState<MaintenanceTicket[] | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    getMaintenance().then(setTickets).catch(() => setTickets([]));
  }, []);

  async function onDrop(status: TicketStatus) {
    if (!dragId || !tickets) return;
    const id = dragId;
    setDragId(null);
    const prev = tickets;
    setTickets(tickets.map((t) => (t.id === id ? { ...t, status } : t)));
    try {
      await updateMaintenanceTicket(id, status);
      showToast(`Ticket moved to ${status.replace("_", " ").toLowerCase()}.`);
    } catch {
      setTickets(prev);
      showToast("Failed to update ticket.", "error");
    }
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
        onSubmit={async (title) => {
          try {
            const ticket = await createMaintenanceTicket({ title });
            setTickets((prev) => (prev ? [ticket, ...prev] : [ticket]));
            showToast(`Ticket created. Reference: ${ticket.id.slice(0, 8).toUpperCase()}`);
            setModalOpen(false);
          } catch {
            showToast("Failed to create ticket.", "error");
          }
        }}
      />
      {tickets === null ? (
        <p className="meta" style={{ padding: "1rem" }}>Loading…</p>
      ) : (
        <div className="kanban-board">
          {MAINT_COLUMNS.map((col) => (
            <section
              className="dashboard-card kanban-column"
              key={col.status}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(col.status)}
            >
              <h2>{col.label}</h2>
              {tickets
                .filter((t) => t.status === col.status)
                .map((ticket) => (
                  <article
                    className="kanban-ticket card-interactive"
                    key={ticket.id}
                    draggable
                    onDragStart={() => setDragId(ticket.id)}
                    onDragEnd={() => setDragId(null)}
                  >
                    <span className={`status-chip ${statusClassForLabel(fmtPriority(ticket.priority))}`}>
                      {fmtPriority(ticket.priority)}
                    </span>
                    <strong>{ticket.title}</strong>
                    <p className="meta">{ticket.id} · {ticket.unitCode ?? "Estate"}</p>
                    {ticket.description ? <p>{ticket.description}</p> : null}
                  </article>
                ))}
            </section>
          ))}
        </div>
      )}
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
  const [overview, setOverview] = useState<DashboardOverview | null>(null);

  useEffect(() => {
    getDashboardOverview().then(setOverview).catch(() => {});
  }, []);

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
      {overview ? (
        <div className="dashboard-kpi-grid">
          <KpiCard label="Occupancy Rate" value={`${overview.residency.occupancyPct}%`} trend={`${overview.residency.occupiedUnits}/${overview.residency.totalUnits} units`} text="Active leases vs total units" />
          <KpiCard label="Off-Plan Collected" value={formatGHS(overview.offPlan.totalGhsCollected, { compact: true })} trend={`${overview.offPlan.unitsSold} sold`} text="GHS installments paid to date" />
          <KpiCard label="Rent Collection" value={`${overview.residency.rentCollectionPct}%`} trend={overview.residency.rentCollectionPct >= 90 ? "On plan" : "Below target"} text={`${overview.residency.activeLeases} active leases`} />
          <KpiCard label="Open Maintenance" value={String(overview.residency.openTickets)} trend={overview.residency.urgentTickets > 0 ? `${overview.residency.urgentTickets} urgent` : "None urgent"} text="Unresolved tickets" />
        </div>
      ) : null}
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
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/auth/me")
      .then((r) => r.json())
      .then((d: { user: { email: string; role: string } }) => {
        setEmail(d.user.email);
        setRole(d.user.role);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <PageHeader module="settings" />
      <div className="settings-grid">
        <section className="dashboard-card">
          <h2>Account</h2>
          <label>
            Email
            <input value={email ?? "Loading…"} readOnly disabled style={{ opacity: 0.7 }} />
          </label>
          <label>
            Role
            <input value={role ?? "Loading…"} readOnly disabled style={{ opacity: 0.7 }} />
          </label>
          <p className="meta" style={{ marginTop: "0.5rem" }}>
            To update your email or password, contact your system administrator.
          </p>
        </section>
        <section className="dashboard-card">
          <h2>Session</h2>
          <label>
            Session timeout
            <select defaultValue="30">
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
            </select>
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

// ─── Live REMS views ─────────────────────────────────────────────────────────

function TenantsView() {
  const [residents, setResidents] = useState<Resident[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    getResidents()
      .then(setResidents)
      .catch((e: Error) => setError(e.message));
  }, []);

  const rows = (residents ?? []).map((r) => [
    r.fullName,
    r.unitCode ?? "—",
    r.status,
    r.phone,
    r.moveInDate ?? "—",
  ]);

  return (
    <>
      <PageHeader module="tenants" action="Add Tenant" onAction={() => setModalOpen(true)} />
      <QuickCreateModal
        open={modalOpen}
        title="Add Tenant"
        fieldLabel="Tenant name"
        onClose={() => setModalOpen(false)}
        onSubmit={(value) => showToast(`Tenant "${value}" recorded.`)}
      />
      {error ? (
        <p className="meta" style={{ padding: "1rem", color: "var(--error)" }}>Failed to load: {error}</p>
      ) : residents === null ? (
        <p className="meta" style={{ padding: "1rem" }}>Loading…</p>
      ) : (
        <DataTable headers={["Tenant", "Unit", "Status", "Phone", "Move-in"]} rows={rows} />
      )}
    </>
  );
}

function LeasesView() {
  const [leases, setLeases] = useState<Lease[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    getLeases()
      .then(setLeases)
      .catch((e: Error) => setError(e.message));
  }, []);

  const rows = (leases ?? []).map((l) => [
    l.id.slice(0, 8),
    l.status,
    l.endDate ?? "Open",
    formatGHS(l.rentMonthly),
  ]);

  return (
    <>
      <PageHeader module="leases" action="New Lease" onAction={() => setModalOpen(true)} />
      <QuickCreateModal
        open={modalOpen}
        title="New Lease"
        fieldLabel="Lease reference"
        onClose={() => setModalOpen(false)}
        onSubmit={(value) => showToast(`Lease "${value}" recorded.`)}
      />
      {error ? (
        <p className="meta" style={{ padding: "1rem", color: "var(--error)" }}>Failed to load: {error}</p>
      ) : leases === null ? (
        <p className="meta" style={{ padding: "1rem" }}>Loading…</p>
      ) : (
        <DataTable headers={["Lease", "Status", "End Date", "Monthly Rent"]} rows={rows} />
      )}
    </>
  );
}

function PaymentsView() {
  const [payments, setPayments] = useState<RentPayment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    getRentPayments()
      .then(setPayments)
      .catch((e: Error) => setError(e.message));
  }, []);

  const rows = (payments ?? []).map((p) => [
    p.ref ?? "—",
    p.leaseId.slice(0, 8),
    p.status,
    formatGHS(p.amount),
    p.dueDate ?? "—",
  ]);

  return (
    <>
      <PageHeader
        module="payments"
        action="Record Payment"
        onAction={() => setModalOpen(true)}
      />
      <QuickCreateModal
        open={modalOpen}
        title="Record Payment"
        fieldLabel="Payment reference"
        onClose={() => setModalOpen(false)}
        onSubmit={(value) => showToast(`Payment "${value}" recorded.`)}
      />
      {error ? (
        <p className="meta" style={{ padding: "1rem", color: "var(--error)" }}>Failed to load: {error}</p>
      ) : payments === null ? (
        <p className="meta" style={{ padding: "1rem" }}>Loading…</p>
      ) : (
        <DataTable headers={["Reference", "Lease", "Status", "Amount", "Due"]} rows={rows} />
      )}
    </>
  );
}


export function ModuleView({ module }: { module: DashboardModule }) {
  if (module === "landlord-application") return <LandlordApplicationSubmitPanel />;
  if (module === "landlord-applications") return <LandlordApplicationsReviewPanel />;
  if (module === "properties") return <PropertiesView />;
  if (module === "accounts") return <AccountsView />;
  if (module === "buyers") return <BuyersView />;
  if (module === "leads") return <LeadsView />;
  if (module === "payment-plans") return <PaymentPlansView />;
  if (module === "milestones") return <MilestonesView />;
  if (module === "maintenance") return <MaintenanceView />;
  if (module === "messages") return <BuyerChatView />;
  if (module === "documents") return <DocumentsView />;
  if (module === "reports") return <ReportsView />;
  if (module === "settings") return <SettingsView />;
  if (module === "units") return <UnitsInventoryView />;
  if (module === "homeowners") return <HomeownersView />;
  if (module === "community") return <CommunityAdminView />;
  if (module === "tenants") return <TenantsView />;
  if (module === "leases") return <LeasesView />;
  if (module === "payments") return <OffPlanPaymentsView />;
  if (module === "invoices") {
    return <TableModuleView module="invoices" action="Create Invoice" headers={["Invoice", "Vendor", "Status", "Amount"]} rows={invoices} />;
  }
  return <DashboardOverview />;
}
