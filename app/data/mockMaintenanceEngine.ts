export type TicketStatus = "New" | "In Progress" | "Resolved";

export type EngineTicket = {
  id: string;
  title: string;
  property: string;
  unit: string;
  priority: "Low" | "Medium" | "Urgent";
  status: TicketStatus;
  assignee: string | null;
  createdDate: string;
  dueDate: string;
  description: string;
  origin: "RESIDENT" | "ESTATE";
};

export const MAINTENANCE_STORAGE_KEY = "ernest_engine_tickets";

const engineTicketSeed: EngineTicket[] = [
  {
    id: "ETK-001",
    title: "Perimeter fence inspection — North wall",
    property: "Special Gardens Estate",
    unit: "—",
    priority: "Medium",
    status: "New",
    assignee: "Sam Okafor",
    createdDate: "Jun 01, 2026",
    dueDate: "Jun 15, 2026",
    description: "Scheduled bi-annual inspection of the north perimeter fence for structural integrity.",
    origin: "ESTATE",
  },
  {
    id: "ETK-002",
    title: "Quarterly fire suppression system check",
    property: "Special Gardens Estate",
    unit: "—",
    priority: "Urgent",
    status: "In Progress",
    assignee: "Sam Okafor",
    createdDate: "Jun 03, 2026",
    dueDate: "Jun 10, 2026",
    description: "Mandatory Q2 fire suppression test across all common-area sprinkler heads.",
    origin: "ESTATE",
  },
  {
    id: "ETK-003",
    title: "Common area lighting audit — Block B",
    property: "Oak Court Townhome",
    unit: "—",
    priority: "Low",
    status: "New",
    assignee: null,
    createdDate: "Jun 05, 2026",
    dueDate: "Jun 20, 2026",
    description: "Identify and replace faulty fluorescent tubes in Block B corridor and stairwells.",
    origin: "ESTATE",
  },
  {
    id: "ETK-004",
    title: "Shower drain blockage",
    property: "Cedar Terrace Apartment",
    unit: "Unit 4B",
    priority: "Urgent",
    status: "New",
    assignee: null,
    createdDate: "Jun 08, 2026",
    dueDate: "Jun 09, 2026",
    description: "Resident reports slow draining shower. Water pooling within 60 seconds of use.",
    origin: "RESIDENT",
  },
  {
    id: "ETK-005",
    title: "AC unit not cooling — Apt 308",
    property: "Meadowline Villa",
    unit: "Apt 308",
    priority: "Medium",
    status: "In Progress",
    assignee: "Sam Okafor",
    createdDate: "Jun 06, 2026",
    dueDate: "Jun 12, 2026",
    description: "Resident reports AC blowing warm air. Possible refrigerant leak or compressor fault.",
    origin: "RESIDENT",
  },
  {
    id: "ETK-006",
    title: "Intercom fault — Block C entry",
    property: "Willow Garden Duplex",
    unit: "Block C",
    priority: "Low",
    status: "Resolved",
    assignee: "Sam Okafor",
    createdDate: "May 28, 2026",
    dueDate: "Jun 01, 2026",
    description: "Intercom panel unresponsive at Block C main entrance. Buzzer replaced, resolved.",
    origin: "RESIDENT",
  },
];

export function readEngineTickets(): EngineTicket[] {
  if (typeof window === "undefined") return engineTicketSeed;
  const raw = window.localStorage.getItem(MAINTENANCE_STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(MAINTENANCE_STORAGE_KEY, JSON.stringify(engineTicketSeed));
    return engineTicketSeed;
  }
  try {
    return JSON.parse(raw) as EngineTicket[];
  } catch {
    return engineTicketSeed;
  }
}

export function writeEngineTickets(tickets: EngineTicket[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MAINTENANCE_STORAGE_KEY, JSON.stringify(tickets));
}

export function generateScheduledEstateTask(
  title: string,
  description: string,
  property: string,
): EngineTicket {
  const ticket: EngineTicket = {
    id: `ETK-${Date.now()}`,
    title,
    property,
    unit: "—",
    priority: "Medium",
    status: "New",
    assignee: null,
    createdDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    description,
    origin: "ESTATE",
  };
  writeEngineTickets([ticket, ...readEngineTickets()]);
  return ticket;
}

export function submitResidentTicket(input: {
  title: string;
  description: string;
  property: string;
  unit: string;
  priority?: "Low" | "Medium" | "Urgent";
}): EngineTicket {
  const ticket: EngineTicket = {
    id: `ETK-${Date.now()}`,
    title: input.title,
    property: input.property,
    unit: input.unit,
    priority: input.priority ?? "Medium",
    status: "New",
    assignee: null,
    createdDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    description: input.description,
    origin: "RESIDENT",
  };
  writeEngineTickets([ticket, ...readEngineTickets()]);
  return ticket;
}
