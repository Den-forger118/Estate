import {
  dashboardProperties as mockDashboardProperties,
  documents as mockDocuments,
  invoices as mockInvoices,
  messages as mockMessages,
} from "./content";
import { roleLabels, roleOptions, type UserRole } from "./roles";

export type DashboardRole = UserRole;

export type DashboardModule =
  | "dashboard"
  | "properties"
  | "units"
  | "buyers"
  | "leads"
  | "accounts"
  | "payment-plans"
  | "milestones"
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
  buyers: { label: "Buyers", href: "/dashboard/buyers", icon: "B", summary: "Off-plan buyers with active reservations and payment plans." },
  leads: { label: "Leads", href: "/dashboard/leads", icon: "L", summary: "Website enquiries — qualify, follow up, and convert to buyers." },
  accounts: { label: "Accounts", href: "/dashboard/accounts", icon: "A", summary: "Buyer portal accounts — activation state, login history, and access controls." },
  "payment-plans": { label: "Payment Plans", href: "/dashboard/payment-plans", icon: "₵", summary: "Installment schedules and milestone-linked payments." },
  milestones: { label: "Milestones", href: "/dashboard/milestones", icon: "M", summary: "Construction progress tracking with photo updates." },
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
  admin: ["dashboard", "properties", "units", "buyers", "leads", "accounts", "payment-plans", "milestones", "tenants", "leases", "payments", "maintenance", "invoices", "reports", "messages", "documents", "landlord-applications", "settings"],
  manager: ["dashboard", "properties", "units", "buyers", "leads", "accounts", "payment-plans", "milestones", "tenants", "leases", "payments", "maintenance", "reports", "messages", "documents", "landlord-applications", "settings"],
  owner: ["dashboard", "properties", "payments", "messages", "documents", "landlord-application", "settings"],
  landlord: ["dashboard", "properties", "units", "tenants", "leases", "payments", "reports", "messages", "documents", "settings"],
  tenant: ["dashboard", "leases", "payments", "maintenance", "messages", "documents", "settings"],
  maintenance: ["dashboard", "maintenance", "messages", "documents", "settings"],
};

export const dashboardProperties = mockDashboardProperties;

export const invoices = mockInvoices.map((i) => [i.id, i.vendor, i.status, `GH₵ ${i.amount.toLocaleString()}`]);

export { mockMessages as messageDetails };

export { mockDocuments as documentFolders };

export { documentFiles, periodOptions } from "./content";
