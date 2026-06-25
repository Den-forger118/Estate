/** Platform role hierarchy (highest privilege first). */
export type UserRole =
  | "admin"
  | "manager"
  | "owner"
  | "landlord"
  | "tenant"
  | "maintenance";

export type LandlordApplicationStatus = "pending" | "approved" | "rejected";

export type LandlordApplication = {
  id: string;
  email: string;
  name: string;
  property: string;
  unit: string;
  note: string;
  status: LandlordApplicationStatus;
  submittedAt: string;
};

const APPLICATIONS_KEY = "ernest_landlord_applications";

/** Display order matches estate hierarchy. */
export const roleHierarchy: UserRole[] = [
  "admin",
  "manager",
  "owner",
  "landlord",
  "tenant",
  "maintenance",
];

export const roleLabels: Record<UserRole, string> = {
  admin: "Administrator",
  manager: "Property Manager",
  owner: "Property Owner",
  landlord: "Landlord",
  tenant: "Tenant",
  maintenance: "Maintenance Staff",
};

export const roleDescriptions: Record<UserRole, string> = {
  admin: "Full estate operations, user oversight, and landlord application approvals.",
  manager: "Day-to-day estate management, leasing coordination, and landlord approvals.",
  owner: "Purchased a home in the estate; can apply to become an approved landlord.",
  landlord: "Approved property owner who may lease their unit to tenants.",
  tenant: "Resident leasing a unit from a landlord within the estate.",
  maintenance: "Assigned maintenance work orders only.",
};

export const roleOptions = roleHierarchy.map((value) => ({
  value,
  label: roleLabels[value],
}));

/** Everyone except maintenance staff may use resident services. */
export const communityAccessRoles: UserRole[] = [
  "admin",
  "manager",
  "owner",
  "landlord",
  "tenant",
];

export function canAccessCommunity(role: UserRole): boolean {
  return communityAccessRoles.includes(role);
}

export function isReviewerRole(role: UserRole): boolean {
  return role === "admin" || role === "manager";
}

export function canManageLeases(role: UserRole): boolean {
  return role === "landlord" || role === "admin" || role === "manager";
}

export const defaultEmails: Record<UserRole, string> = {
  admin: "admin@specialgardens.example",
  manager: "manager@specialgardens.example",
  owner: "owner@specialgardens.example",
  landlord: "landlord@specialgardens.example",
  tenant: "tenant@specialgardens.example",
  maintenance: "maintenance@specialgardens.example",
};

export const seedLandlordApplications: LandlordApplication[] = [
  {
    id: "app-seed-1",
    email: "owner@specialgardens.example",
    name: "Daniel Reyes",
    property: "Oak Court Townhome",
    unit: "B-0311",
    note: "Ready to lease after handover inspection.",
    status: "pending",
    submittedAt: "May 28, 2026",
  },
  {
    id: "app-seed-2",
    email: "pending.owner@specialgardens.example",
    name: "Priya Nair",
    property: "Cedar Terrace Apartment",
    unit: "C-0902",
    note: "Seeking approval to list one-bedroom unit.",
    status: "pending",
    submittedAt: "May 30, 2026",
  },
];

export function readApplications(): LandlordApplication[] {
  if (typeof window === "undefined") return seedLandlordApplications;
  const raw = window.localStorage.getItem(APPLICATIONS_KEY);
  if (!raw) {
    window.localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(seedLandlordApplications));
    return seedLandlordApplications;
  }
  try {
    return JSON.parse(raw) as LandlordApplication[];
  } catch {
    return seedLandlordApplications;
  }
}

export function writeApplications(applications: LandlordApplication[]) {
  window.localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications));
}


export function submitLandlordApplication(input: {
  name: string;
  email: string;
  property: string;
  unit: string;
  note: string;
}) {
  const applications = readApplications().filter(
    (app) => app.email.toLowerCase() !== input.email.toLowerCase() || app.status !== "pending",
  );

  applications.unshift({
    id: `app-${Date.now()}`,
    email: input.email,
    name: input.name,
    property: input.property,
    unit: input.unit,
    note: input.note,
    status: "pending",
    submittedAt: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  });

  writeApplications(applications);
}

export function reviewLandlordApplication(
  id: string,
  decision: "approved" | "rejected",
): LandlordApplication | null {
  const applications = readApplications();
  const index = applications.findIndex((app) => app.id === id);
  if (index < 0) return null;

  applications[index] = { ...applications[index], status: decision };
  writeApplications(applications);
  return applications[index];
}

export function getOwnerApplicationForEmail(email: string): LandlordApplication | undefined {
  return readApplications().find((app) => app.email.toLowerCase() === email.toLowerCase());
}
