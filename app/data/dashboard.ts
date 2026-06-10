import {
  dashboardProperties as mockDashboardProperties,
  documents as mockDocuments,
  invoices as mockInvoices,
  kpis as mockKpis,
  leases as mockLeases,
  maintenanceTickets,
  messages as mockMessages,
  payments as mockPayments,
  tenants as mockTenants,
  units as mockUnits,
} from "./mockData";
import { roleLabels, roleOptions, type UserRole } from "./roles";

export type DashboardRole = UserRole;

export type DashboardModule =
  | "dashboard"
  | "properties"
  | "units"
  | "tenants"
  | "leases"
  | "payments"
  | "maintenance"
  | "invoices"
  | "reports"
  | "messages"
  | "documents"
  | "landlord-applications"
  | "landlord-application"
  | "settings";

export { roleLabels, roleOptions };

export const moduleMeta: Record<
  DashboardModule,
  { label: string; href: string; icon: string; summary: string }
> = {
  dashboard: { label: "Dashboard", href: "/dashboard", icon: "D", summary: "Portfolio performance, tasks, revenue, and operating signals." },
  properties: { label: "Properties", href: "/dashboard/properties", icon: "P", summary: "Estate and building portfolio oversight." },
  units: { label: "Units", href: "/dashboard/units", icon: "U", summary: "Unit availability, occupancy, and service status." },
  tenants: { label: "Tenants", href: "/dashboard/tenants", icon: "T", summary: "Resident directory, balances, and lease links." },
  leases: { label: "Leases", href: "/dashboard/leases", icon: "L", summary: "Renewals, terms, approvals, and signed contracts." },
  payments: { label: "Payments", href: "/dashboard/payments", icon: "$", summary: "Collections, revenue, payouts, and arrears." },
  maintenance: { label: "Maintenance", href: "/dashboard/maintenance", icon: "M", summary: "Work orders, priority queues, vendors, and SLA tracking." },
  invoices: { label: "Invoices", href: "/dashboard/invoices", icon: "I", summary: "Billing, invoice approvals, and payment status." },
  reports: { label: "Reports", href: "/dashboard/reports", icon: "R", summary: "Strategic insights for owners and management." },
  messages: { label: "Messages", href: "/dashboard/messages", icon: "C", summary: "Resident, owner, and operations communication." },
  documents: { label: "Documents", href: "/dashboard/documents", icon: "V", summary: "Secure document vault for leases, IDs, and notices." },
  settings: { label: "Settings", href: "/dashboard/settings", icon: "S", summary: "Profile, access, billing, notification, and platform controls." },
  "landlord-applications": { label: "Landlord Applications", href: "/dashboard/landlord-applications", icon: "A", summary: "Review property owner requests to lease units within the estate." },
  "landlord-application": { label: "Become a Landlord", href: "/dashboard/landlord-application", icon: "L", summary: "Apply for approval to rent your owned unit to tenants." },
};

export const roleModules: Record<DashboardRole, DashboardModule[]> = {
  admin: ["dashboard", "properties", "units", "tenants", "leases", "payments", "maintenance", "invoices", "reports", "messages", "documents", "landlord-applications", "settings"],
  manager: ["dashboard", "properties", "units", "tenants", "leases", "payments", "maintenance", "reports", "messages", "documents", "landlord-applications", "settings"],
  owner: ["dashboard", "properties", "payments", "messages", "documents", "landlord-application", "settings"],
  landlord: ["dashboard", "properties", "units", "tenants", "leases", "payments", "reports", "messages", "documents", "settings"],
  tenant: ["dashboard", "leases", "payments", "maintenance", "messages", "documents", "settings"],
  maintenance: ["dashboard", "maintenance", "messages", "documents", "settings"],
};

export const kpis = mockKpis;

export const dashboardProperties = mockDashboardProperties;

export const units = mockUnits.map((u) => [u.unit, u.property, u.status, u.layout, u.rent]);

export const tenants = mockTenants.map((t) => [
  t.name,
  t.unit,
  t.status,
  t.balance === 0 ? "GH₵ 0" : `GH₵ ${t.balance}`,
  t.note || "—",
]);

export const leases = mockLeases.map((l) => [
  `${l.property} ${l.unit}`,
  l.status,
  l.endDate,
  `GH₵ ${l.rentMonthly.toLocaleString()}`,
]);

export const payments = mockPayments.map((p) => [
  p.ref,
  p.tenant,
  p.status,
  `GH₵ ${p.amount.toLocaleString()}`,
  p.date,
]);

export const invoices = mockInvoices.map((i) => [i.id, i.vendor, i.status, `GH₵ ${i.amount.toLocaleString()}`]);

export const maintenanceColumns = [
  { title: "New", items: maintenanceTickets.filter((t) => t.status === "New").map((t) => t.title) },
  { title: "In progress", items: maintenanceTickets.filter((t) => t.status === "In Progress").map((t) => t.title) },
  { title: "Resolved", items: maintenanceTickets.filter((t) => t.status === "Resolved").map((t) => t.title) },
];

export { maintenanceTickets };

export const messages = mockMessages.map((m) => [m.sender, m.subject, m.time] as [string, string, string]);

export { mockMessages as messageDetails };

export const documents = mockDocuments.map((d) => [d.folder, `${d.fileCount} files`, `Updated ${d.lastUpdated}`]);

export { mockDocuments as documentFolders };
