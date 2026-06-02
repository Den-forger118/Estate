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
  dashboard: {
    label: "Dashboard",
    href: "/dashboard",
    icon: "D",
    summary: "Portfolio performance, tasks, revenue, and operating signals.",
  },
  properties: {
    label: "Properties",
    href: "/dashboard/properties",
    icon: "P",
    summary: "Estate and building portfolio oversight.",
  },
  units: {
    label: "Units",
    href: "/dashboard/units",
    icon: "U",
    summary: "Unit availability, occupancy, and service status.",
  },
  tenants: {
    label: "Tenants",
    href: "/dashboard/tenants",
    icon: "T",
    summary: "Resident directory, balances, and lease links.",
  },
  leases: {
    label: "Leases",
    href: "/dashboard/leases",
    icon: "L",
    summary: "Renewals, terms, approvals, and signed contracts.",
  },
  payments: {
    label: "Payments",
    href: "/dashboard/payments",
    icon: "$",
    summary: "Collections, revenue, payouts, and arrears.",
  },
  maintenance: {
    label: "Maintenance",
    href: "/dashboard/maintenance",
    icon: "M",
    summary: "Work orders, priority queues, vendors, and SLA tracking.",
  },
  invoices: {
    label: "Invoices",
    href: "/dashboard/invoices",
    icon: "I",
    summary: "Billing, invoice approvals, and payment status.",
  },
  reports: {
    label: "Reports",
    href: "/dashboard/reports",
    icon: "R",
    summary: "Strategic insights for owners and management.",
  },
  messages: {
    label: "Messages",
    href: "/dashboard/messages",
    icon: "C",
    summary: "Resident, owner, and operations communication.",
  },
  documents: {
    label: "Documents",
    href: "/dashboard/documents",
    icon: "V",
    summary: "Secure document vault for leases, IDs, and notices.",
  },
  settings: {
    label: "Settings",
    href: "/dashboard/settings",
    icon: "S",
    summary: "Profile, access, billing, notification, and platform controls.",
  },
  "landlord-applications": {
    label: "Landlord Applications",
    href: "/dashboard/landlord-applications",
    icon: "A",
    summary: "Review property owner requests to lease units within the estate.",
  },
  "landlord-application": {
    label: "Become a Landlord",
    href: "/dashboard/landlord-application",
    icon: "L",
    summary: "Apply for approval to rent your owned unit to tenants.",
  },
};

export const roleModules: Record<DashboardRole, DashboardModule[]> = {
  admin: [
    "dashboard",
    "properties",
    "units",
    "tenants",
    "leases",
    "payments",
    "maintenance",
    "invoices",
    "reports",
    "messages",
    "documents",
    "landlord-applications",
    "settings",
  ],
  manager: [
    "dashboard",
    "properties",
    "units",
    "tenants",
    "leases",
    "payments",
    "maintenance",
    "reports",
    "messages",
    "documents",
    "landlord-applications",
    "settings",
  ],
  owner: [
    "dashboard",
    "properties",
    "payments",
    "messages",
    "documents",
    "landlord-application",
    "settings",
  ],
  landlord: [
    "dashboard",
    "properties",
    "units",
    "tenants",
    "leases",
    "payments",
    "reports",
    "messages",
    "documents",
    "settings",
  ],
  tenant: ["dashboard", "leases", "payments", "maintenance", "messages", "documents", "settings"],
  maintenance: ["dashboard", "maintenance", "messages", "documents", "settings"],
};

export const kpis = [
  { label: "Occupancy Rate", value: "94%", trend: "+2.1%", text: "Across 1,240 managed units" },
  { label: "Monthly Revenue", value: "$248k", trend: "+5.4%", text: "Collections this month" },
  { label: "Rent Collection", value: "98%", trend: "On plan", text: "12 payments pending" },
  { label: "Open Maintenance", value: "12", trend: "-4", text: "3 high priority tickets" },
];

export const dashboardProperties = [
  {
    name: "Skyline Heights",
    address: "1200 Metropolitan Ave",
    status: "Active",
    units: "245",
    occupancy: "94%",
    revenue: "$4.2M",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=82",
  },
  {
    name: "Oakwood Estates",
    address: "4500 Whispering Pines Ln",
    status: "Active",
    units: "82",
    occupancy: "98%",
    revenue: "$2.8M",
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=82",
  },
  {
    name: "The Grand Plaza",
    address: "88 Financial District Blvd",
    status: "Development",
    units: "310",
    occupancy: "65%",
    revenue: "Q4 2026",
    image:
      "https://images.unsplash.com/photo-1605146769289-440113cc3d00?auto=format&fit=crop&w=1200&q=82",
  },
];

export const units = [
  ["A-1204", "Skyline Heights", "Leased", "2 bed", "$3,450"],
  ["B-0311", "Oakwood Estates", "Available", "3 bed", "$4,900"],
  ["C-0902", "The Grand Plaza", "Inspection", "1 bed", "$2,850"],
  ["V-018", "Ernest Ofori Villas", "Maintenance", "4 bed", "$7,200"],
];

export const tenants = [
  ["Maya Chen", "A-1204", "Current", "$0", "Renewal due in 45 days"],
  ["Jonas Reed", "B-0311", "Applicant", "$500", "Screening in progress"],
  ["Nora Ellis", "C-0902", "Current", "$0", "Message unread"],
  ["Sam Okafor", "V-018", "Overdue", "$1,250", "Payment plan active"],
];

export const leases = [
  ["Oakwood Estates B-0311", "Awaiting signature", "Jun 18, 2026", "$4,900"],
  ["Skyline Heights A-1204", "Renewal review", "Jul 31, 2026", "$3,450"],
  ["Ernest Ofori Villas V-018", "Active", "Nov 15, 2026", "$7,200"],
];

export const payments = [
  ["ACH-8841", "Maya Chen", "Paid", "$3,450", "Jun 1, 2026"],
  ["INV-1120", "Sam Okafor", "Overdue", "$1,250", "May 28, 2026"],
  ["ACH-8816", "Oakwood Estates", "Paid", "$42,800", "Jun 1, 2026"],
  ["PAYOUT-44", "Landlord payout", "Scheduled", "$91,240", "Jun 5, 2026"],
];

export const invoices = [
  ["INV-2048", "Security patrol", "Pending approval", "$8,400"],
  ["INV-2047", "Landscape renewal", "Paid", "$3,250"],
  ["INV-2046", "Elevator service", "Draft", "$1,875"],
];

export const maintenanceColumns = [
  {
    title: "New",
    items: ["HVAC inspection: Skyline A-904", "Gate sensor fault: Oakwood North"],
  },
  {
    title: "In progress",
    items: ["Pool deck repair", "Generator load test", "Lobby lighting refresh"],
  },
  {
    title: "Resolved",
    items: ["Irrigation leak", "Mailbox lock replacement"],
  },
];

export const messages = [
  ["Resident services", "Package room access window updated.", "12m"],
  ["Owner relations", "Quarterly report draft is ready for review.", "1h"],
  ["Maintenance desk", "Vendor ETA confirmed for Oakwood gate.", "2h"],
];

export const documents = [
  ["Lease agreements", "128 files", "Updated today"],
  ["Resident IDs", "94 files", "Updated yesterday"],
  ["Vendor certificates", "31 files", "Updated May 29, 2026"],
  ["Owner reports", "18 files", "Updated May 25, 2026"],
];
