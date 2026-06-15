export type TrustEntry = {
  reference: string;
  type: "payment" | "certificate";
  party: string;
  amount?: number;
  property?: string;
  issuedAt: string;
  validUntil?: string;
  status: "verified" | "pending" | "expired";
};

const trustLedgerSeed: TrustEntry[] = [
  {
    reference: "SGE-2026-001",
    type: "payment",
    party: "Daniel Reyes",
    amount: 48000,
    property: "Oak Court Townhome — B-0311",
    issuedAt: "May 28, 2026",
    status: "verified",
  },
  {
    reference: "SGE-2026-002",
    type: "certificate",
    party: "Maya Chen",
    property: "Cedar Terrace Apartment — C-0902",
    issuedAt: "May 30, 2026",
    validUntil: "May 30, 2027",
    status: "verified",
  },
  {
    reference: "SGE-2026-003",
    type: "payment",
    party: "Priya Nair",
    amount: 36500,
    property: "Meadowline Villa — A-0104",
    issuedAt: "Jun 01, 2026",
    status: "verified",
  },
  {
    reference: "SGE-2026-004",
    type: "certificate",
    party: "Samuel Osei",
    property: "Willow Garden Duplex — D-0207",
    issuedAt: "Jun 03, 2026",
    validUntil: "Jun 03, 2027",
    status: "verified",
  },
  {
    reference: "SGE-2026-005",
    type: "payment",
    party: "Eleanor Vance",
    amount: 12000,
    property: "Cedar Terrace Apartment — C-0410",
    issuedAt: "Jun 05, 2026",
    status: "pending",
  },
  {
    reference: "SGE-2026-006",
    type: "certificate",
    party: "Kwame Asante",
    property: "Oak Court Townhome — B-0115",
    issuedAt: "Jan 10, 2025",
    validUntil: "Jan 10, 2026",
    status: "expired",
  },
  {
    reference: "PAY-20240324-001",
    type: "payment",
    party: "A. Sterling",
    amount: 4250,
    property: "Cedar Terrace, Apt 402",
    issuedAt: "Mar 24, 2024",
    status: "verified",
  },
  {
    reference: "PAY-20240322-003",
    type: "payment",
    party: "E. Martinez",
    amount: 3100,
    property: "Heritage Lofts, 12A",
    issuedAt: "Mar 22, 2024",
    status: "verified",
  },
  {
    reference: "PAY-20240320-004",
    type: "payment",
    party: "Dr. N. Boateng",
    amount: 8500,
    property: "Meadowline Villa",
    issuedAt: "Mar 20, 2024",
    status: "verified",
  },
  {
    reference: "PAY-20240315-006",
    type: "payment",
    party: "A. Owusu",
    amount: 2950,
    property: "Cedar Terrace, Apt 308",
    issuedAt: "Mar 15, 2024",
    status: "verified",
  },
];

export function searchTrustLedger(query: string): TrustEntry | null {
  const normalized = query.trim().toUpperCase();
  return trustLedgerSeed.find((e) => e.reference.toUpperCase() === normalized) ?? null;
}
