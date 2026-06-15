import { PROSPECTS_KEY } from "./roles";

export type ProspectRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyInterest: string;
  registeredAt: string;
  status: "pending" | "approved" | "rejected";
  nationality?: string;
  idType?: "Ghana Card" | "Passport";
  idNumber?: string;
  idPhotoName?: string;
};

const seedProspects: ProspectRecord[] = [
  {
    id: "prospect-seed-1",
    name: "Kofi Mensah Jr.",
    email: "kofi.mensah@example.com",
    phone: "+233 24 111 2233",
    propertyInterest: "Villa",
    registeredAt: "Jun 10, 2026",
    status: "pending",
  },
  {
    id: "prospect-seed-2",
    name: "Abena Asante",
    email: "abena.asante@example.com",
    phone: "+233 50 987 6543",
    propertyInterest: "Apartment",
    registeredAt: "Jun 12, 2026",
    status: "pending",
  },
];

export function readProspects(): ProspectRecord[] {
  if (typeof window === "undefined") return seedProspects;
  const raw = window.localStorage.getItem(PROSPECTS_KEY);
  if (!raw) {
    window.localStorage.setItem(PROSPECTS_KEY, JSON.stringify(seedProspects));
    return seedProspects;
  }
  try {
    return JSON.parse(raw) as ProspectRecord[];
  } catch {
    return seedProspects;
  }
}

function writeProspects(prospects: ProspectRecord[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROSPECTS_KEY, JSON.stringify(prospects));
}

export function registerProspect(
  input: Omit<ProspectRecord, "id" | "registeredAt" | "status">,
): ProspectRecord {
  const record: ProspectRecord = {
    id: `prospect-${Date.now()}`,
    ...input,
    registeredAt: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    status: "pending",
  };
  if (typeof window !== "undefined") {
    writeProspects([record, ...readProspects()]);
  }
  return record;
}

export function approveProspect(prospectId: string): void {
  if (typeof window === "undefined") return;
  const prospects = readProspects().map((p) =>
    p.id === prospectId ? { ...p, status: "approved" as const } : p,
  );
  writeProspects(prospects);
  window.dispatchEvent(new CustomEvent("force_logout_event"));
}

export function rejectProspect(prospectId: string): void {
  if (typeof window === "undefined") return;
  const prospects = readProspects().map((p) =>
    p.id === prospectId ? { ...p, status: "rejected" as const } : p,
  );
  writeProspects(prospects);
}
