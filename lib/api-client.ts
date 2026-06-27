// API client adapter: supports both mock and live modes
// Switch via NEXT_PUBLIC_DATA_MODE=mock|live (default: live)

import type {
  Project,
  Unit,
  Buyer,
  PaymentPlan,
  Installment,
  Milestone,
  ConstructionUpdate,
  UnitDocument,
  BuyerPortalData,
  StalledOpsData,
  UnitStatus,
  InstallmentStatus,
  MilestoneStatus,
  Resident,
  Lease,
  RentPayment,
  MaintenanceTicket,
  TicketStatus,
  DashboardOverview,
} from "../app/data/types";

const DATA_MODE =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_DATA_MODE as "mock" | "live") || "live"
    : "live";

// ─── MOCK DATA ADAPTER ───────────────────────────────────────────────────

// Mock seed data matching the off-plan contract
const mockProjects: Project[] = [
  {
    id: "proj-1",
    name: "Meadowline Estate Phase 2",
    location: "East Legon Residential, Accra",
    status: "IN_PROGRESS",
  },
  {
    id: "proj-2",
    name: "Cedar Terrace Expansion",
    location: "Airport Residential Area, Accra",
    status: "IN_PROGRESS",
  },
];

const mockUnits: Unit[] = [
  {
    id: "unit-1",
    projectId: "proj-1",
    code: "MLN-A101",
    type: "3 Bedroom Apartment",
    sizeSqm: 120,
    priceTotal: 285000,
    status: "SOLD",
    buyerId: "buyer-1",
  },
  {
    id: "unit-2",
    projectId: "proj-1",
    code: "MLN-A102",
    type: "3 Bedroom Apartment",
    sizeSqm: 120,
    priceTotal: 285000,
    status: "RESERVED",
    buyerId: "buyer-2",
  },
  {
    id: "unit-3",
    projectId: "proj-1",
    code: "MLN-B201",
    type: "4 Bedroom Duplex",
    sizeSqm: 180,
    priceTotal: 425000,
    status: "AVAILABLE",
  },
  {
    id: "unit-4",
    projectId: "proj-2",
    code: "CDR-P401",
    type: "Penthouse",
    sizeSqm: 250,
    priceTotal: 680000,
    status: "SOLD",
    buyerId: "buyer-3",
  },
];

const mockBuyers: Buyer[] = [
  {
    id: "buyer-1",
    fullName: "Kwame Asante",
    phone: "+233 24 512 8801",
    email: "kwame.asante@email.com",
    isDiaspora: false,
  },
  {
    id: "buyer-2",
    fullName: "Elena Martinez",
    phone: "+1 415 555 0198",
    email: "elena.martinez@email.com",
    isDiaspora: true,
  },
  {
    id: "buyer-3",
    fullName: "Dr. Nana Boateng",
    phone: "+233 24 887 6610",
    email: "n.boateng@email.com",
    isDiaspora: false,
  },
];

const mockPaymentPlans: PaymentPlan[] = [
  {
    id: "plan-1",
    unitId: "unit-1",
    buyerId: "buyer-1",
    totalAmount: 285000,
    downPayment: 85500,
    currency: "GHS",
    zeroInterest: true,
    saleType: "OFF_PLAN" as const,
  },
  {
    id: "plan-2",
    unitId: "unit-2",
    buyerId: "buyer-2",
    totalAmount: 285000,
    downPayment: 57000,
    currency: "USD",
    zeroInterest: false,
    saleType: "OFF_PLAN" as const,
  },
  {
    id: "plan-3",
    unitId: "unit-4",
    buyerId: "buyer-3",
    totalAmount: 680000,
    downPayment: 204000,
    currency: "GHS",
    zeroInterest: true,
    saleType: "OFF_PLAN" as const,
  },
];

const mockInstallments: Installment[] = [
  // Buyer 1 (Kwame) - unit-1
  {
    id: "inst-1-1",
    paymentPlanId: "plan-1",
    sequence: 1,
    amount: 85500,
    dueDate: "2025-12-15",
    status: "PAID",
    paidAmount: 85500,
    paidAt: "2025-12-10",
  },
  {
    id: "inst-1-2",
    paymentPlanId: "plan-1",
    sequence: 2,
    amount: 66500,
    dueDate: "2026-03-15",
    linkedMilestoneId: "mile-1",
    status: "PAID",
    paidAmount: 66500,
    paidAt: "2026-03-12",
  },
  {
    id: "inst-1-3",
    paymentPlanId: "plan-1",
    sequence: 3,
    amount: 66500,
    dueDate: "2026-06-15",
    linkedMilestoneId: "mile-2",
    status: "DUE",
    paidAmount: 0,
  },
  {
    id: "inst-1-4",
    paymentPlanId: "plan-1",
    sequence: 4,
    amount: 66500,
    dueDate: "2026-09-15",
    linkedMilestoneId: "mile-3",
    status: "PENDING",
    paidAmount: 0,
  },
  // Buyer 2 (Elena) - unit-2
  {
    id: "inst-2-1",
    paymentPlanId: "plan-2",
    sequence: 1,
    amount: 57000,
    dueDate: "2026-01-20",
    status: "PAID",
    paidAmount: 57000,
    paidAt: "2026-01-18",
  },
  {
    id: "inst-2-2",
    paymentPlanId: "plan-2",
    sequence: 2,
    amount: 57000,
    dueDate: "2026-04-20",
    linkedMilestoneId: "mile-1",
    status: "OVERDUE",
    paidAmount: 0,
  },
  {
    id: "inst-2-3",
    paymentPlanId: "plan-2",
    sequence: 3,
    amount: 57000,
    dueDate: "2026-07-20",
    linkedMilestoneId: "mile-2",
    status: "PENDING",
    paidAmount: 0,
  },
  {
    id: "inst-2-4",
    paymentPlanId: "plan-2",
    sequence: 4,
    amount: 57000,
    dueDate: "2026-10-20",
    linkedMilestoneId: "mile-3",
    status: "PENDING",
    paidAmount: 0,
  },
  // Buyer 3 (Dr. Boateng) - unit-4
  {
    id: "inst-3-1",
    paymentPlanId: "plan-3",
    sequence: 1,
    amount: 204000,
    dueDate: "2026-02-01",
    status: "PAID",
    paidAmount: 204000,
    paidAt: "2026-01-28",
  },
  {
    id: "inst-3-2",
    paymentPlanId: "plan-3",
    sequence: 2,
    amount: 119000,
    dueDate: "2026-05-01",
    linkedMilestoneId: "mile-4",
    status: "PAID",
    paidAmount: 119000,
    paidAt: "2026-04-30",
  },
  {
    id: "inst-3-3",
    paymentPlanId: "plan-3",
    sequence: 3,
    amount: 119000,
    dueDate: "2026-08-01",
    linkedMilestoneId: "mile-5",
    status: "PENDING",
    paidAmount: 0,
  },
  {
    id: "inst-3-4",
    paymentPlanId: "plan-3",
    sequence: 4,
    amount: 119000,
    dueDate: "2026-11-01",
    linkedMilestoneId: "mile-6",
    status: "PENDING",
    paidAmount: 0,
  },
  {
    id: "inst-3-5",
    paymentPlanId: "plan-3",
    sequence: 5,
    amount: 119000,
    dueDate: "2027-02-01",
    status: "PENDING",
    paidAmount: 0,
  },
];

const mockMilestones: Milestone[] = [
  {
    id: "mile-1",
    projectId: "proj-1",
    name: "Foundation Complete",
    sequence: 1,
    status: "COMPLETED",
    completedAt: "2026-02-28",
  },
  {
    id: "mile-2",
    projectId: "proj-1",
    name: "Structure to Roofing Level",
    sequence: 2,
    status: "IN_PROGRESS",
    targetDate: "2026-05-01",
  },
  {
    id: "mile-3",
    projectId: "proj-1",
    name: "Windows & Doors Installed",
    sequence: 3,
    status: "NOT_STARTED",
  },
  {
    id: "mile-4",
    projectId: "proj-2",
    name: "Foundation & Basement",
    sequence: 1,
    status: "COMPLETED",
    completedAt: "2026-03-15",
  },
  {
    id: "mile-5",
    projectId: "proj-2",
    name: "Core Structure Complete",
    sequence: 2,
    status: "IN_PROGRESS",
    targetDate: "2026-05-10",
  },
  {
    id: "mile-6",
    projectId: "proj-2",
    name: "Facade & Glazing",
    sequence: 3,
    status: "NOT_STARTED",
  },
];

const mockConstructionUpdates: ConstructionUpdate[] = [
  {
    id: "update-1",
    milestoneId: "mile-1",
    caption: "Foundation excavation completed. Steel reinforcement in progress.",
    photoUrl: "/public/New standard/stitch_ernest_ofori_estate_platform/estate_institutional/screen.png",
    postedAt: "2026-02-15T10:30:00Z",
  },
  {
    id: "update-2",
    milestoneId: "mile-1",
    caption: "Concrete pouring for foundation slab completed.",
    photoUrl: "/public/New standard/stitch_ernest_ofori_estate_platform/rems_dashboard_overview/screen.png",
    postedAt: "2026-02-28T14:20:00Z",
  },
  {
    id: "update-3",
    milestoneId: "mile-2",
    caption: "Ground floor columns completed. First floor slab in progress.",
    photoUrl: "/public/New standard/stitch_ernest_ofori_estate_platform/maintenance_kanban_dashboard/screen.png",
    postedAt: "2026-05-10T09:15:00Z",
  },
  {
    id: "update-4",
    milestoneId: "mile-4",
    caption: "Basement waterproofing and drainage systems installed.",
    photoUrl: "/public/New standard/stitch_ernest_ofori_estate_platform/rems_admin_dashboard_overview/screen.png",
    postedAt: "2026-03-10T16:45:00Z",
  },
  {
    id: "update-5",
    milestoneId: "mile-5",
    caption: "Structural steel framework for levels 1-4 complete.",
    photoUrl: "/public/New standard/stitch_ernest_ofori_estate_platform/public_properties_listing/screen.png",
    postedAt: "2026-05-25T11:00:00Z",
  },
];

const mockUnitDocuments: UnitDocument[] = [
  {
    id: "doc-1",
    unitId: "unit-1",
    type: "SEARCH_CERTIFICATE",
    fileUrl: "/documents/search-cert-mln-a101.pdf",
    version: 1,
    uploadedAt: "2025-11-15T08:30:00Z",
  },
  {
    id: "doc-2",
    unitId: "unit-1",
    type: "SITE_PLAN",
    fileUrl: "/documents/site-plan-mln-a101.pdf",
    version: 2,
    uploadedAt: "2026-01-20T10:15:00Z",
  },
  {
    id: "doc-3",
    unitId: "unit-4",
    type: "SEARCH_CERTIFICATE",
    fileUrl: "/documents/search-cert-cdr-p401.pdf",
    version: 1,
    uploadedAt: "2026-01-10T14:00:00Z",
  },
  {
    id: "doc-4",
    unitId: "unit-4",
    type: "INDENTURE",
    fileUrl: "/documents/indenture-cdr-p401.pdf",
    version: 1,
    uploadedAt: "2026-02-05T09:45:00Z",
  },
];

// ─── REMS MOCK DATA ──────────────────────────────────────────────────────────

const mockResidentsList: Resident[] = [
  {
    id: "res-1",
    unitId: "unit-1",
    unitCode: "MLN-A101",
    fullName: "Adrian Sterling",
    phone: "+233 24 512 8801",
    email: "a.sterling@example.com",
    moveInDate: "2024-04-01",
    status: "ACTIVE",
    createdAt: "2024-04-01T00:00:00Z",
  },
  {
    id: "res-2",
    unitId: "unit-4",
    unitCode: "CDR-P401",
    buyerId: "buyer-3",
    fullName: "Dr. Nana Boateng",
    phone: "+233 24 887 6610",
    email: "n.boateng@email.com",
    moveInDate: "2025-10-01",
    status: "ACTIVE",
    createdAt: "2025-10-01T00:00:00Z",
  },
  {
    id: "res-3",
    unitId: "unit-2",
    unitCode: "MLN-A102",
    fullName: "Elena Martinez",
    phone: "+1 415 555 0198",
    email: "elena.martinez@email.com",
    moveInDate: "2024-01-01",
    status: "NOTICE_GIVEN",
    createdAt: "2024-01-01T00:00:00Z",
  },
];

const mockLeasesList: Lease[] = [
  { id: "lease-1", unitId: "unit-1", residentId: "res-1", startDate: "2024-04-01", endDate: "2025-03-31", rentMonthly: 3200, deposit: 6400, currency: "GHS", status: "ACTIVE" },
  { id: "lease-2", unitId: "unit-4", residentId: "res-2", startDate: "2025-10-01", endDate: "2027-09-30", rentMonthly: 8500, deposit: 17000, currency: "GHS", status: "ACTIVE" },
  { id: "lease-3", unitId: "unit-2", residentId: "res-3", startDate: "2024-01-01", endDate: "2024-12-31", rentMonthly: 2800, deposit: 5600, currency: "GHS", status: "NOTICE_GIVEN" },
];

const mockRentPaymentsList: RentPayment[] = [
  { id: "rp-1", leaseId: "lease-2", amount: 8500, dueDate: "2025-10-01", paidAt: "2025-09-28T00:00:00Z", status: "PAID", ref: "PAY-BT-001" },
  { id: "rp-2", leaseId: "lease-2", amount: 8500, dueDate: "2025-11-01", paidAt: "2025-10-30T00:00:00Z", status: "PAID", ref: "PAY-BT-002" },
  { id: "rp-3", leaseId: "lease-2", amount: 8500, dueDate: "2025-12-01", status: "OVERDUE" },
  { id: "rp-4", leaseId: "lease-1", amount: 3200, dueDate: "2026-04-01", paidAt: "2026-04-01T00:00:00Z", status: "PAID", ref: "PAY-AS-001" },
  { id: "rp-5", leaseId: "lease-1", amount: 3200, dueDate: "2026-05-01", paidAt: "2026-05-02T00:00:00Z", status: "PAID", ref: "PAY-AS-002" },
  { id: "rp-6", leaseId: "lease-1", amount: 3200, dueDate: "2026-06-01", paidAt: "2026-06-01T00:00:00Z", status: "PAID", ref: "PAY-AS-003" },
];

const mockTicketsList: MaintenanceTicket[] = [
  { id: "TKT-001", unitId: "unit-4", unitCode: "CDR-P401", title: "Leak repair — master bathroom ceiling", description: "Water ingress after heavy rains. Stain spreading.", priority: "URGENT", status: "NEW", assignee: "Kofi Mensah", dueDate: "2026-06-25", createdAt: "2026-06-24T00:00:00Z" },
  { id: "TKT-002", unitId: "unit-4", unitCode: "CDR-P401", title: "Elevator compliance inspection", description: "Annual safety cert due. Inspector visit scheduled.", priority: "MEDIUM", status: "IN_PROGRESS", assignee: "James Hackman", dueDate: "2026-06-30", createdAt: "2026-06-22T00:00:00Z" },
  { id: "TKT-003", unitId: "unit-2", unitCode: "MLN-A102", title: "Perimeter lighting fault — Gate C", description: "Three lights non-functional. Security flagged.", priority: "MEDIUM", status: "NEW", dueDate: "2026-06-28", createdAt: "2026-06-23T00:00:00Z" },
  { id: "TKT-004", unitId: "unit-1", unitCode: "MLN-A101", title: "Gym HVAC filter replacement", description: "Quarterly filter change required.", priority: "LOW", status: "IN_PROGRESS", assignee: "Emmanuel Tetteh", dueDate: "2026-06-30", createdAt: "2026-06-20T00:00:00Z" },
  { id: "TKT-005", title: "Pool pump servicing", description: "Routine annual pool pump service.", priority: "LOW", status: "RESOLVED", assignee: "Kofi Mensah", createdAt: "2026-06-10T00:00:00Z" },
];

// Mock API functions
async function mockGetProjects(): Promise<Project[]> {
  await delay(300);
  return mockProjects;
}

async function mockGetUnits(projectId?: string): Promise<Unit[]> {
  await delay(300);
  if (projectId) {
    return mockUnits.filter((u) => u.projectId === projectId);
  }
  return mockUnits;
}

async function mockGetBuyers(): Promise<Buyer[]> {
  await delay(300);
  return mockBuyers;
}

async function mockGetBuyerPortal(buyerId: string): Promise<BuyerPortalData | null> {
  await delay(500);
  const buyer = mockBuyers.find((b) => b.id === buyerId);
  if (!buyer) return null;

  const unit = mockUnits.find((u) => u.buyerId === buyerId);
  if (!unit) return null;

  const project = mockProjects.find((p) => p.id === unit.projectId);
  if (!project) return null;

  const paymentPlan = mockPaymentPlans.find((pp) => pp.unitId === unit.id);
  if (!paymentPlan) return null;

  const installments = mockInstallments.filter((i) => i.paymentPlanId === paymentPlan.id);
  const milestones = mockMilestones.filter((m) => m.projectId === project.id);
  const constructionUpdates = mockConstructionUpdates.filter((cu) =>
    milestones.some((m) => m.id === cu.milestoneId)
  );
  const documents = mockUnitDocuments.filter((d) => d.unitId === unit.id);

  return {
    buyer,
    unit,
    project,
    paymentPlan,
    installments,
    milestones,
    constructionUpdates,
    documents,
  };
}

async function mockGetPaymentPlan(unitId: string): Promise<{
  plan: PaymentPlan;
  installments: Installment[];
} | null> {
  await delay(300);
  const plan = mockPaymentPlans.find((pp) => pp.unitId === unitId);
  if (!plan) return null;

  const installments = mockInstallments.filter((i) => i.paymentPlanId === plan.id);
  return { plan, installments };
}

async function mockGetMilestones(projectId: string): Promise<Milestone[]> {
  await delay(300);
  return mockMilestones.filter((m) => m.projectId === projectId);
}

async function mockGetConstructionUpdates(projectId: string): Promise<ConstructionUpdate[]> {
  await delay(400);
  const projectMilestones = mockMilestones.filter((m) => m.projectId === projectId);
  const milestoneIds = projectMilestones.map((m) => m.id);
  return mockConstructionUpdates.filter((cu) => milestoneIds.includes(cu.milestoneId));
}

async function mockGetUnitDocuments(unitId: string): Promise<UnitDocument[]> {
  await delay(300);
  return mockUnitDocuments.filter((d) => d.unitId === unitId);
}

async function mockGetStalledOps(): Promise<StalledOpsData> {
  await delay(400);
  return {
    stalledInstallments: {
      count: 1,
      items: [
        { id: "inst-2-2", label: "Installment #2 — MLN-A102", detail: "Due 2026-04-20", stalledDays: 65 },
      ],
    },
    stalledReservations: {
      count: 1,
      items: [
        { id: "unit-2", label: "MLN-A102 — Meadowline Estate Phase 2", detail: "Elena Martinez", stalledDays: 45 },
      ],
    },
    stalledMilestones: {
      count: 2,
      items: [
        { id: "mile-2", label: "Structure to Roofing Level", detail: "Meadowline Estate Phase 2", stalledDays: 54 },
        { id: "mile-5", label: "Core Structure Complete", detail: "Cedar Terrace Expansion", stalledDays: 44 },
      ],
    },
    thresholdDays: 30,
  };
}

async function mockCompleteMilestone(milestoneId: string): Promise<Milestone & { nextMilestoneActivated: boolean; nextMilestoneId: string | null }> {
  await delay(300);
  const milestone = mockMilestones.find((m) => m.id === milestoneId);
  if (!milestone) throw new Error("Milestone not found");
  const updates = mockConstructionUpdates.filter((u) => u.milestoneId === milestoneId);
  if (updates.length === 0) throw new Error("Cannot complete milestone without a progress photo.");
  milestone.status = "COMPLETED";
  milestone.completedAt = new Date().toISOString().slice(0, 10);
  // Activate the next milestone in mock data
  const next = mockMilestones.find((m) => m.sequence === milestone.sequence + 1 && m.status === "NOT_STARTED");
  if (next) next.status = "IN_PROGRESS";
  return { ...milestone, nextMilestoneActivated: !!next, nextMilestoneId: next?.id ?? null };
}

async function mockPostConstructionUpdate(
  milestoneId: string,
  data: { photoUrl: string; caption?: string },
): Promise<ConstructionUpdate> {
  await delay(300);
  const update: ConstructionUpdate = {
    id: `update-${Date.now()}`,
    milestoneId,
    caption: data.caption,
    photoUrl: data.photoUrl,
    postedAt: new Date().toISOString(),
  };
  mockConstructionUpdates.push(update);
  return update;
}

async function mockGetResidents(): Promise<Resident[]> {
  await delay(300);
  return [...mockResidentsList];
}

async function mockGetLeases(): Promise<Lease[]> {
  await delay(300);
  return [...mockLeasesList];
}

async function mockGetRentPayments(leaseId?: string): Promise<RentPayment[]> {
  await delay(300);
  return leaseId
    ? mockRentPaymentsList.filter((p) => p.leaseId === leaseId)
    : [...mockRentPaymentsList];
}

async function mockGetMaintenance(): Promise<MaintenanceTicket[]> {
  await delay(300);
  return [...mockTicketsList];
}

async function mockUpdateMaintenanceTicket(
  id: string,
  status: TicketStatus,
): Promise<MaintenanceTicket> {
  await delay(200);
  const ticket = mockTicketsList.find((t) => t.id === id);
  if (!ticket) throw new Error("Ticket not found");
  ticket.status = status;
  return { ...ticket };
}

// ─── LIVE API FUNCTIONS ──────────────────────────────────────────────────

async function liveGetProjects(): Promise<Project[]> {
  const res = await fetch("/api/v1/projects");
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

async function liveGetUnits(projectId?: string): Promise<Unit[]> {
  const url = projectId ? `/api/v1/units?projectId=${projectId}` : "/api/v1/units";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch units");
  return res.json();
}

async function liveGetBuyers(): Promise<Buyer[]> {
  const res = await fetch("/api/v1/buyers");
  if (!res.ok) throw new Error("Failed to fetch buyers");
  return res.json();
}

async function liveGetBuyerPortal(buyerId: string): Promise<BuyerPortalData | null> {
  const res = await fetch(`/api/v1/buyers/${buyerId}/portal`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch buyer portal");
  return res.json();
}

async function liveGetPaymentPlan(unitId: string): Promise<{
  plan: PaymentPlan;
  installments: Installment[];
} | null> {
  const res = await fetch(`/api/v1/units/${unitId}/payment-plan`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch payment plan");
  return res.json();
}

async function liveGetMilestones(projectId: string): Promise<Milestone[]> {
  const res = await fetch(`/api/v1/projects/${projectId}/milestones`);
  if (!res.ok) throw new Error("Failed to fetch milestones");
  return res.json();
}

async function liveGetConstructionUpdates(projectId: string): Promise<ConstructionUpdate[]> {
  const res = await fetch(`/api/v1/projects/${projectId}/construction-updates`);
  if (!res.ok) throw new Error("Failed to fetch construction updates");
  return res.json();
}

async function liveGetUnitDocuments(unitId: string): Promise<UnitDocument[]> {
  const res = await fetch(`/api/v1/units/${unitId}/documents`);
  if (!res.ok) throw new Error("Failed to fetch unit documents");
  return res.json();
}

async function liveGetStalledOps(): Promise<StalledOpsData> {
  const res = await fetch("/api/v1/dashboard/stalled");
  if (!res.ok) throw new Error("Failed to fetch stalled operations");
  return res.json();
}

async function liveCompleteMilestone(milestoneId: string): Promise<Milestone & { nextMilestoneActivated: boolean; nextMilestoneId: string | null }> {
  const res = await fetch(`/api/v1/milestones/${milestoneId}/complete`, { method: "PATCH" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Failed to complete milestone" }));
    throw new Error(body.error || "Failed to complete milestone");
  }
  return res.json();
}

async function livePostConstructionUpdate(
  milestoneId: string,
  data: { photoUrl: string; caption?: string },
): Promise<ConstructionUpdate> {
  const res = await fetch(`/api/v1/milestones/${milestoneId}/construction-updates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Failed to post update" }));
    throw new Error(body.error || "Failed to post update");
  }
  return res.json();
}

async function liveGetResidents(): Promise<Resident[]> {
  const res = await fetch("/api/v1/residents");
  if (!res.ok) throw new Error("Failed to fetch residents");
  return res.json();
}

async function liveGetLeases(): Promise<Lease[]> {
  const res = await fetch("/api/v1/leases");
  if (!res.ok) throw new Error("Failed to fetch leases");
  return res.json();
}

async function liveGetRentPayments(leaseId?: string): Promise<RentPayment[]> {
  const url = leaseId ? `/api/v1/rent-payments?leaseId=${leaseId}` : "/api/v1/rent-payments";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch rent payments");
  return res.json();
}

async function liveGetMaintenance(): Promise<MaintenanceTicket[]> {
  const res = await fetch("/api/v1/maintenance");
  if (!res.ok) throw new Error("Failed to fetch maintenance tickets");
  return res.json();
}

async function liveUpdateMaintenanceTicket(
  id: string,
  status: TicketStatus,
): Promise<MaintenanceTicket> {
  const res = await fetch(`/api/v1/maintenance/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Failed to update ticket" }));
    throw new Error(body.error || "Failed to update ticket");
  }
  return res.json();
}

// ─── PUBLIC API (mode-agnostic) ──────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  return DATA_MODE === "mock" ? mockGetProjects() : liveGetProjects();
}

export async function getUnits(projectId?: string): Promise<Unit[]> {
  return DATA_MODE === "mock" ? mockGetUnits(projectId) : liveGetUnits(projectId);
}

export async function getBuyers(): Promise<Buyer[]> {
  return DATA_MODE === "mock" ? mockGetBuyers() : liveGetBuyers();
}

export async function getBuyerPortal(buyerId: string): Promise<BuyerPortalData | null> {
  return DATA_MODE === "mock" ? mockGetBuyerPortal(buyerId) : liveGetBuyerPortal(buyerId);
}

export async function getPaymentPlan(unitId: string): Promise<{
  plan: PaymentPlan;
  installments: Installment[];
} | null> {
  return DATA_MODE === "mock" ? mockGetPaymentPlan(unitId) : liveGetPaymentPlan(unitId);
}

export async function getMilestones(projectId: string): Promise<Milestone[]> {
  return DATA_MODE === "mock" ? mockGetMilestones(projectId) : liveGetMilestones(projectId);
}

export async function getConstructionUpdates(projectId: string): Promise<ConstructionUpdate[]> {
  return DATA_MODE === "mock"
    ? mockGetConstructionUpdates(projectId)
    : liveGetConstructionUpdates(projectId);
}

export async function getUnitDocuments(unitId: string): Promise<UnitDocument[]> {
  return DATA_MODE === "mock" ? mockGetUnitDocuments(unitId) : liveGetUnitDocuments(unitId);
}

export async function getStalledOps(): Promise<StalledOpsData> {
  return DATA_MODE === "mock" ? mockGetStalledOps() : liveGetStalledOps();
}

export async function completeMilestone(milestoneId: string): Promise<Milestone & { nextMilestoneActivated: boolean; nextMilestoneId: string | null }> {
  return DATA_MODE === "mock"
    ? mockCompleteMilestone(milestoneId)
    : liveCompleteMilestone(milestoneId);
}

export async function postConstructionUpdate(
  milestoneId: string,
  data: { photoUrl: string; caption?: string },
): Promise<ConstructionUpdate> {
  return DATA_MODE === "mock"
    ? mockPostConstructionUpdate(milestoneId, data)
    : livePostConstructionUpdate(milestoneId, data);
}

export async function getResidents(): Promise<Resident[]> {
  return DATA_MODE === "mock" ? mockGetResidents() : liveGetResidents();
}

export async function getLeases(): Promise<Lease[]> {
  return DATA_MODE === "mock" ? mockGetLeases() : liveGetLeases();
}

export async function getRentPayments(leaseId?: string): Promise<RentPayment[]> {
  return DATA_MODE === "mock" ? mockGetRentPayments(leaseId) : liveGetRentPayments(leaseId);
}

export async function getMaintenance(): Promise<MaintenanceTicket[]> {
  return DATA_MODE === "mock" ? mockGetMaintenance() : liveGetMaintenance();
}

export async function updateMaintenanceTicket(
  id: string,
  status: TicketStatus,
): Promise<MaintenanceTicket> {
  return DATA_MODE === "mock"
    ? mockUpdateMaintenanceTicket(id, status)
    : liveUpdateMaintenanceTicket(id, status);
}

export type CreatePlanPayload = {
  buyerId: string
  downPayment: number
  currency: "GHS" | "USD"
  zeroInterest: boolean
  installments: { sequence: number; amount: number; dueDate?: string }[]
}

export async function createPaymentPlan(
  unitId: string,
  payload: CreatePlanPayload,
): Promise<{ plan: PaymentPlan; installments: Installment[] }> {
  const res = await fetch(`/api/v1/units/${unitId}/payment-plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Failed to create payment plan" }))
    throw new Error((body as { error?: string }).error ?? "Failed to create payment plan")
  }
  return res.json()
}

const mockDashboardOverview: DashboardOverview = {
  offPlan: {
    unitsSold: 2,
    unitsAvailable: 1,
    totalGhsCollected: 574000,
    installmentsOverdue: 1,
  },
  residency: {
    totalUnits: 3,
    occupiedUnits: 2,
    occupancyPct: 67,
    activeLeases: 2,
    rentCollectionPct: 83,
    openTickets: 4,
    urgentTickets: 1,
  },
};

export async function getDashboardOverview(): Promise<DashboardOverview> {
  if (DATA_MODE === "mock") {
    await delay(400);
    return { ...mockDashboardOverview };
  }
  const res = await fetch("/api/v1/dashboard/overview");
  if (!res.ok) throw new Error("Failed to fetch dashboard overview");
  return res.json();
}

// ─── UTILITIES ───────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getDataMode(): "mock" | "live" {
  return DATA_MODE;
}
