// Shared contract types between frontend and backend.
// Keep in sync with db/migrations/001_init.sql table definitions.

export type Role = "ADMIN" | "SALES" | "OPS" | "BUYER";

export type UnitStatus = "AVAILABLE" | "RESERVED" | "SOLD" | "HANDED_OVER";

export type InstallmentStatus = "PENDING" | "DUE" | "PAID" | "OVERDUE" | "PARTIAL";

export type MilestoneStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface Project {
  id: string;
  name: string;
  location?: string;
  status: string;
}

export interface Unit {
  id: string;
  projectId: string;
  code: string;
  type?: string;
  sizeSqm?: number;
  priceTotal: number;
  status: UnitStatus;
  buyerId?: string;
}

export interface Buyer {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  isDiaspora: boolean;
}

export interface PaymentPlan {
  id: string;
  unitId: string;
  buyerId: string;
  totalAmount: number;
  downPayment: number;
  currency: string;
  zeroInterest: boolean;
}

export interface Installment {
  id: string;
  paymentPlanId: string;
  sequence: number;
  amount: number;
  dueDate?: string;
  linkedMilestoneId?: string;
  status: InstallmentStatus;
  paidAmount: number;
  paidAt?: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  sequence: number;
  status: MilestoneStatus;
  targetDate?: string;
  completedAt?: string;
  updatedAt?: string;
}

export interface StalledItem {
  id: string;
  label: string;
  detail: string;
  stalledDays: number;
}

export interface StalledOpsData {
  stalledInstallments: { count: number; items: StalledItem[] };
  stalledReservations: { count: number; items: StalledItem[] };
  stalledMilestones: { count: number; items: StalledItem[] };
  thresholdDays: number;
}

export interface ConstructionUpdate {
  id: string;
  milestoneId: string;
  caption?: string;
  photoUrl: string;
  postedAt: string;
}

export interface UnitDocument {
  id: string;
  unitId: string;
  type: "SEARCH_CERTIFICATE" | "SITE_PLAN" | "INDENTURE" | "OTHER";
  fileUrl: string;
  version: number;
  uploadedAt: string;
}

// ─── Residency (REMS) types ──────────────────────────────────────────────────

export type ResidentStatus = "ACTIVE" | "NOTICE_GIVEN" | "VACATED";
export type LeaseStatus = "ACTIVE" | "NOTICE_GIVEN" | "EXPIRED" | "TERMINATED";
export type RentPaymentStatus = "PENDING" | "PAID" | "OVERDUE" | "PARTIAL";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TicketStatus = "NEW" | "IN_PROGRESS" | "RESOLVED";

export interface Resident {
  id: string;
  unitId: string;
  unitCode?: string;
  buyerId?: string;
  fullName: string;
  phone: string;
  email?: string;
  moveInDate?: string;
  status: ResidentStatus;
  createdAt: string;
}

export interface Lease {
  id: string;
  unitId: string;
  residentId: string;
  startDate: string;
  endDate?: string;
  rentMonthly: number;
  deposit: number;
  currency: string;
  status: LeaseStatus;
}

export interface RentPayment {
  id: string;
  leaseId: string;
  amount: number;
  dueDate?: string;
  paidAt?: string;
  status: RentPaymentStatus;
  ref?: string;
}

export interface MaintenanceTicket {
  id: string;
  unitId?: string;
  unitCode?: string;
  title: string;
  description?: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignee?: string;
  dueDate?: string;
  createdAt: string;
}

// ─── Aggregates for dashboard overview ───────────────────────────────────────

export interface DashboardOverview {
  offPlan: {
    unitsSold: number;
    unitsAvailable: number;
    totalGhsCollected: number;
    installmentsOverdue: number;
  };
  residency: {
    totalUnits: number;
    occupiedUnits: number;
    occupancyPct: number;
    activeLeases: number;
    rentCollectionPct: number;
    openTickets: number;
    urgentTickets: number;
  };
}

// ─── Leads ───────────────────────────────────────────────────────────────────

export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "REJECTED";

export interface Lead {
  id: string;
  developerId: string;
  unitId?: string;
  fullName: string;
  phone: string;
  email?: string;
  message?: string;
  source: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}

export type ReconStatus = "UNMATCHED" | "MATCHED" | "MANUAL";

export interface Payment {
  id: string;
  developerId: string;
  providerRef: string;
  amount: number;
  channel: string;
  rawPayload: Record<string, unknown>;
  receivedAt: string;
  reconciledInstallmentId: string | null;
  reconStatus: ReconStatus;
}

// Response types for API endpoints
export interface BuyerPortalData {
  buyer: Buyer;
  unit: Unit;
  project: Project;
  paymentPlan: PaymentPlan;
  installments: Installment[];
  milestones: Milestone[];
  constructionUpdates: ConstructionUpdate[];
  documents: UnitDocument[];
}
