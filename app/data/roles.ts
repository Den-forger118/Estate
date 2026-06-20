/** Platform role hierarchy (highest privilege first). */
export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "OWNER"
  | "TENANT"
  | "STAFF"
  | "PROSPECT";

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

export const AUTH_KEY = "ernest_mock_auth";
export const ROLE_KEY = "ernest_dashboard_role";
export const USER_EMAIL_KEY = "ernest_user_email";
export const USER_NAME_KEY = "ernest_user_name";
export const APPLICATIONS_KEY = "ernest_landlord_applications";
export const PROSPECTS_KEY = "ernest_prospects";

export const roleHierarchy: UserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "OWNER",
  "TENANT",
  "STAFF",
  "PROSPECT",
];

export const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  OWNER: "Owner",
  TENANT: "Tenant",
  STAFF: "Staff",
  PROSPECT: "Prospect",
};

export const roleDescriptions: Record<UserRole, string> = {
  SUPER_ADMIN: "Full estate operations, user oversight, and all approval workflows.",
  ADMIN: "Operations and finance management with reporting and lease oversight.",
  OWNER: "Property owner with estate access and community portal rights.",
  TENANT: "Verified resident tenant with community access, lease history, and utility portal.",
  STAFF: "Gate and maintenance staff with operations access and visitor log.",
  PROSPECT: "Registered prospect awaiting admin approval before full platform access.",
};

export const roleOptions = roleHierarchy.map((value) => ({
  value,
  label: roleLabels[value],
}));

/** PROSPECT, STAFF, and unrecognised roles cannot access resident community services. */
export const communityAccessRoles: UserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "OWNER",
  "TENANT",
];

export function canAccessCommunity(role: UserRole): boolean {
  return communityAccessRoles.includes(role);
}

export function isReviewerRole(role: UserRole): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export function canManageLeases(role: UserRole): boolean {
  return role === "OWNER" || role === "SUPER_ADMIN" || role === "ADMIN";
}

export const defaultEmails: Record<UserRole, string> = {
  SUPER_ADMIN: "superadmin@specialgardens.example",
  ADMIN: "admin@specialgardens.example",
  OWNER: "owner@specialgardens.example",
  TENANT: "tenant@specialgardens.example",
  STAFF: "staff@specialgardens.example",
  PROSPECT: "prospect@specialgardens.example",
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

export function getStoredRole(): UserRole {
  if (typeof window === "undefined") return "SUPER_ADMIN";
  const stored = window.localStorage.getItem(ROLE_KEY) as UserRole | null;
  return stored && stored in roleLabels ? stored : "SUPER_ADMIN";
}

export function getStoredEmail(): string {
  if (typeof window === "undefined") return defaultEmails.SUPER_ADMIN;
  return window.localStorage.getItem(USER_EMAIL_KEY) ?? defaultEmails.SUPER_ADMIN;
}

export function getStoredName(): string {
  if (typeof window === "undefined") return "Eleanor Vance";
  return window.localStorage.getItem(USER_NAME_KEY) ?? "Eleanor Vance";
}

/** OWNER and LANDLORD are now consolidated — simply returns the stored role. */
export function syncRoleAfterLandlordApproval(): UserRole {
  return getStoredRole();
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
