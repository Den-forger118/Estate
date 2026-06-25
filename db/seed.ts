import "dotenv/config"
import dns from "dns"
import { Pool, PoolClient } from "pg"
import { hash } from "bcryptjs"

// Fixed UUIDs so re-running is idempotent (ON CONFLICT (id) DO NOTHING).
const IDS = {
  developer: "11111111-0000-0000-0000-000000000001",
  adminUser:  "22222222-0000-0000-0000-000000000001",
  salesUser:  "22222222-0000-0000-0000-000000000002",
  // HANDED_OVER units — two lifecycle paths demonstrated:
  //   CT-501: off-plan buyer (Dr. Boateng) who reached handover
  //   ML-003: direct rental (never went through off-plan)
  buyerDrBoateng:  "66666666-0000-0000-0000-000000000001",
  buyerUserBoateng: "22222222-0000-0000-0000-000000000003", // BUYER-role login
  unitCT501:       "44444444-0000-0000-0000-000000000004", // HANDED_OVER, came from off-plan
  unitML003:       "44444444-0000-0000-0000-000000000005", // HANDED_OVER, direct rental
  residentBoateng: "77777777-0000-0000-0000-000000000001",
  residentDirect:  "77777777-0000-0000-0000-000000000002",
  leaseBoateng:    "88888888-0000-0000-0000-000000000001",
  leaseDirect:     "88888888-0000-0000-0000-000000000002",
  planBoateng:   "bbbbbbbb-0000-0000-0000-000000000001",
  installments: [
    "cccccccc-0000-0000-0000-000000000001", // seq 1 — PAID (down payment)
    "cccccccc-0000-0000-0000-000000000002", // seq 2 — DUE (ready to collect)
    "cccccccc-0000-0000-0000-000000000003", // seq 3 — PENDING (milestone-linked)
  ],
  rentPay: [
    "99999999-0000-0000-0000-000000000001",
    "99999999-0000-0000-0000-000000000002",
    "99999999-0000-0000-0000-000000000003",
    "99999999-0000-0000-0000-000000000004",
    "99999999-0000-0000-0000-000000000005",
    "99999999-0000-0000-0000-000000000006",
  ],
  tickets: [
    "aaaaaaaa-0000-0000-0000-000000000001",
    "aaaaaaaa-0000-0000-0000-000000000002",
    "aaaaaaaa-0000-0000-0000-000000000003",
    "aaaaaaaa-0000-0000-0000-000000000004",
    "aaaaaaaa-0000-0000-0000-000000000005",
  ],
  meadowline:   "33333333-0000-0000-0000-000000000001",
  cedarTerrace: "33333333-0000-0000-0000-000000000002",
  unitML001:    "44444444-0000-0000-0000-000000000001",
  unitML002:    "44444444-0000-0000-0000-000000000002",
  unitCT401:    "44444444-0000-0000-0000-000000000003",
  milestones: Array.from({ length: 8 }, (_, i) =>
    `55555555-0000-0000-0000-${String(i + 1).padStart(12, "0")}`,
  ),
} as const

async function buildPool(connectionString: string): Promise<Pool> {
  const url = new URL(connectionString)
  const hostname = url.hostname
  const ip = await new Promise<string>((res, rej) =>
    dns.resolve4(hostname, (err, addrs) => (err ? rej(err) : res(addrs[0]))),
  )
  return new Pool({
    host: ip,
    port: parseInt(url.port) || 5432,
    database: url.pathname.slice(1),
    user: url.username,
    password: decodeURIComponent(url.password),
    ssl: { servername: hostname, rejectUnauthorized: true },
  })
}

async function run(client: PoolClient) {
  console.log("Seeding database…")

  // ── Developer ──────────────────────────────────────────────────────────────
  await client.query(
    `INSERT INTO developers (id, name)
     VALUES ($1, $2)
     ON CONFLICT (id) DO NOTHING`,
    [IDS.developer, "Special Gardens Estate"],
  )

  // ── Users ──────────────────────────────────────────────────────────────────
  const [adminHash, salesHash] = await Promise.all([
    hash("Admin1234!", 12),
    hash("Sales1234!", 12),
  ])

  await client.query(
    `INSERT INTO users (id, developer_id, email, password_hash, role)
     VALUES ($1, $2, $3, $4, 'ADMIN')
     ON CONFLICT (id) DO NOTHING`,
    [IDS.adminUser, IDS.developer, "admin@specialgardens.example", adminHash],
  )

  await client.query(
    `INSERT INTO users (id, developer_id, email, password_hash, role)
     VALUES ($1, $2, $3, $4, 'SALES')
     ON CONFLICT (id) DO NOTHING`,
    [IDS.salesUser, IDS.developer, "sales@specialgardens.example", salesHash],
  )

  // ── Projects ───────────────────────────────────────────────────────────────
  await client.query(
    `INSERT INTO projects (id, developer_id, name, location, status)
     VALUES ($1, $2, $3, $4, 'ACTIVE')
     ON CONFLICT (id) DO NOTHING`,
    [IDS.meadowline, IDS.developer, "Meadowline Estate", "East Legon Residential, Accra"],
  )

  await client.query(
    `INSERT INTO projects (id, developer_id, name, location, status)
     VALUES ($1, $2, $3, $4, 'ACTIVE')
     ON CONFLICT (id) DO NOTHING`,
    [IDS.cedarTerrace, IDS.developer, "Cedar Terrace Complex", "Airport Residential Area, Accra"],
  )

  // ── Units ──────────────────────────────────────────────────────────────────
  await client.query(
    `INSERT INTO units (id, developer_id, project_id, code, type, size_sqm, price_total, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'AVAILABLE')
     ON CONFLICT (id) DO NOTHING`,
    [IDS.unitML001, IDS.developer, IDS.meadowline, "ML-001", "Detached Villa", 390.2, 845000],
  )

  await client.query(
    `INSERT INTO units (id, developer_id, project_id, code, type, size_sqm, price_total, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'AVAILABLE')
     ON CONFLICT (id) DO NOTHING`,
    [IDS.unitML002, IDS.developer, IDS.meadowline, "ML-002", "Townhome", 264.9, 520000],
  )

  await client.query(
    `INSERT INTO units (id, developer_id, project_id, code, type, size_sqm, price_total, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'AVAILABLE')
     ON CONFLICT (id) DO NOTHING`,
    [IDS.unitCT401, IDS.developer, IDS.cedarTerrace, "CT-401", "Apartment", 148.6, 315000],
  )

  // ── Milestones for Meadowline ──────────────────────────────────────────────
  const milestoneNames = [
    "Foundation & Substructure",
    "Superstructure to Roof Level",
    "Roofing & Waterproofing",
    "MEP First Fix",
    "Internal Plastering & Screeding",
    "MEP Second Fix & Finishes",
    "External Works & Landscaping",
    "Snagging & Handover",
  ]

  for (let i = 0; i < milestoneNames.length; i++) {
    const status = i === 0 ? "COMPLETED" : i === 1 ? "IN_PROGRESS" : "NOT_STARTED"
    const completedAt = i === 0 ? new Date("2025-09-30") : null
    const targetDate = i === 1 ? new Date("2026-04-30") : null

    await client.query(
      `INSERT INTO milestones (id, developer_id, project_id, name, sequence, status, target_date, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [
        IDS.milestones[i],
        IDS.developer,
        IDS.meadowline,
        milestoneNames[i],
        i + 1,
        status,
        targetDate,
        completedAt,
      ],
    )
  }

  // ── Residency seed ─────────────────────────────────────────────────────────
  // Buyer #1: Dr. Nana Boateng — came through off-plan, now handed over
  await client.query(
    `INSERT INTO buyers (id, developer_id, full_name, phone, email, is_diaspora)
     VALUES ($1, $2, $3, $4, $5, false)
     ON CONFLICT (id) DO NOTHING`,
    [IDS.buyerDrBoateng, IDS.developer, "Dr. Nana Boateng", "+233 24 887 6610", "n.boateng@example.com"],
  )

  // BUYER-role user for Dr. Boateng (login: buyer@specialgardens.example / Buyer1234!)
  const buyerHash = await hash("Buyer1234!", 12)
  await client.query(
    `INSERT INTO users (id, developer_id, email, password_hash, role, buyer_id)
     VALUES ($1, $2, $3, $4, 'BUYER', $5)
     ON CONFLICT (id) DO NOTHING`,
    [IDS.buyerUserBoateng, IDS.developer, "buyer@specialgardens.example", buyerHash, IDS.buyerDrBoateng],
  )

  // Unit CT-501: HANDED_OVER — linked to Dr. Boateng (off-plan lifecycle path)
  await client.query(
    `INSERT INTO units (id, developer_id, project_id, code, type, size_sqm, price_total, status, buyer_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'HANDED_OVER', $8)
     ON CONFLICT (id) DO NOTHING`,
    [IDS.unitCT501, IDS.developer, IDS.cedarTerrace, "CT-501", "Penthouse", 250.0, 680000, IDS.buyerDrBoateng],
  )

  // Unit ML-003: HANDED_OVER — direct rental (no prior off-plan buyer)
  await client.query(
    `INSERT INTO units (id, developer_id, project_id, code, type, size_sqm, price_total, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'HANDED_OVER')
     ON CONFLICT (id) DO NOTHING`,
    [IDS.unitML003, IDS.developer, IDS.meadowline, "ML-003", "Detached Villa", 390.0, 845000],
  )

  // Resident #1: Dr. Boateng — buyer_id carries the off-plan→residency bridge
  await client.query(
    `INSERT INTO residents (id, developer_id, unit_id, buyer_id, full_name, phone, email, move_in_date, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ACTIVE')
     ON CONFLICT (id) DO NOTHING`,
    [IDS.residentBoateng, IDS.developer, IDS.unitCT501, IDS.buyerDrBoateng,
     "Dr. Nana Boateng", "+233 24 887 6610", "n.boateng@example.com", new Date("2025-10-01")],
  )

  // Resident #2: Adrian Sterling — direct rental, no buyer record
  await client.query(
    `INSERT INTO residents (id, developer_id, unit_id, buyer_id, full_name, phone, email, move_in_date, status)
     VALUES ($1, $2, $3, NULL, $4, $5, $6, $7, 'ACTIVE')
     ON CONFLICT (id) DO NOTHING`,
    [IDS.residentDirect, IDS.developer, IDS.unitML003,
     "Adrian Sterling", "+233 24 512 8801", "a.sterling@example.com", new Date("2024-04-01")],
  )

  // Lease for Dr. Boateng (CT-501) — owner-occupied style: fixed-term, high value
  await client.query(
    `INSERT INTO leases (id, developer_id, unit_id, resident_id, start_date, end_date, rent_monthly, deposit, currency, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'GHS', 'ACTIVE')
     ON CONFLICT (id) DO NOTHING`,
    [IDS.leaseBoateng, IDS.developer, IDS.unitCT501, IDS.residentBoateng,
     new Date("2025-10-01"), new Date("2027-09-30"), 8500, 17000],
  )

  // Lease for Adrian Sterling (ML-003)
  await client.query(
    `INSERT INTO leases (id, developer_id, unit_id, resident_id, start_date, end_date, rent_monthly, deposit, currency, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'GHS', 'ACTIVE')
     ON CONFLICT (id) DO NOTHING`,
    [IDS.leaseDirect, IDS.developer, IDS.unitML003, IDS.residentDirect,
     new Date("2024-04-01"), new Date("2026-03-31"), 3200, 6400],
  )

  // Rent payments — Boateng lease (3 payments: 2 paid, 1 overdue)
  const boatengPayments = [
    { id: IDS.rentPay[0], amount: 8500, dueDate: "2025-10-01", paidAt: "2025-09-28", status: "PAID", ref: "PAY-BT-001" },
    { id: IDS.rentPay[1], amount: 8500, dueDate: "2025-11-01", paidAt: "2025-10-30", status: "PAID", ref: "PAY-BT-002" },
    { id: IDS.rentPay[2], amount: 8500, dueDate: "2025-12-01", paidAt: null, status: "OVERDUE", ref: null },
  ]
  for (const p of boatengPayments) {
    await client.query(
      `INSERT INTO rent_payments (id, developer_id, lease_id, amount, due_date, paid_at, status, ref)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [p.id, IDS.developer, IDS.leaseBoateng, p.amount, p.dueDate, p.paidAt, p.status, p.ref],
    )
  }

  // Rent payments — Sterling lease (3 payments: all paid)
  const sterlingPayments = [
    { id: IDS.rentPay[3], amount: 3200, dueDate: "2026-04-01", paidAt: "2026-04-01", status: "PAID", ref: "PAY-AS-001" },
    { id: IDS.rentPay[4], amount: 3200, dueDate: "2026-05-01", paidAt: "2026-05-02", status: "PAID", ref: "PAY-AS-002" },
    { id: IDS.rentPay[5], amount: 3200, dueDate: "2026-06-01", paidAt: "2026-06-01", status: "PAID", ref: "PAY-AS-003" },
  ]
  for (const p of sterlingPayments) {
    await client.query(
      `INSERT INTO rent_payments (id, developer_id, lease_id, amount, due_date, paid_at, status, ref)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [p.id, IDS.developer, IDS.leaseDirect, p.amount, p.dueDate, p.paidAt, p.status, p.ref],
    )
  }

  // ── Off-plan payment plan — Dr. Boateng buying ML-001 (Detached Villa, 845,000 GHS)
  // Demonstrates the full installment → payment → reconcile flow.
  // Mark ML-001 as RESERVED so it's no longer available as a lead unit.
  await client.query(
    "UPDATE units SET status = 'RESERVED', buyer_id = $1 WHERE id = $2",
    [IDS.buyerDrBoateng, IDS.unitML001],
  )

  await client.query(
    `INSERT INTO payment_plans (id, developer_id, unit_id, buyer_id, total_amount, down_payment, currency, zero_interest)
     VALUES ($1, $2, $3, $4, 845000, 253500, 'GHS', true)
     ON CONFLICT (id) DO NOTHING`,
    [IDS.planBoateng, IDS.developer, IDS.unitML001, IDS.buyerDrBoateng],
  )

  // Installment 1: down payment — PAID (253,500 GHS = 30%)
  await client.query(
    `INSERT INTO installments (id, developer_id, payment_plan_id, sequence, amount, status, paid_amount, paid_at)
     VALUES ($1, $2, $3, 1, 253500, 'PAID', 253500, '2025-08-15T00:00:00Z')
     ON CONFLICT (id) DO NOTHING`,
    [IDS.installments[0], IDS.developer, IDS.planBoateng],
  )

  // Installment 2: milestone-based payment — DUE (253,500 GHS; milestone 1 completed)
  await client.query(
    `INSERT INTO installments (id, developer_id, payment_plan_id, sequence, amount, status, paid_amount, due_date, linked_milestone_id)
     VALUES ($1, $2, $3, 2, 253500, 'DUE', 0, '2026-03-31T00:00:00Z', $4)
     ON CONFLICT (id) DO NOTHING`,
    [IDS.installments[1], IDS.developer, IDS.planBoateng, IDS.milestones[0]],
  )

  // Installment 3: future milestone — PENDING (338,000 GHS = remaining 40%)
  await client.query(
    `INSERT INTO installments (id, developer_id, payment_plan_id, sequence, amount, status, paid_amount, linked_milestone_id)
     VALUES ($1, $2, $3, 3, 338000, 'PENDING', 0, $4)
     ON CONFLICT (id) DO NOTHING`,
    [IDS.installments[2], IDS.developer, IDS.planBoateng, IDS.milestones[1]],
  )

  // Maintenance tickets — mix of priorities and statuses
  const tickets = [
    { id: IDS.tickets[0], unitId: IDS.unitCT501, title: "Leak repair — master bathroom ceiling", description: "Water ingress after heavy rains. Stain spreading.", priority: "URGENT", status: "NEW",         assignee: null,           dueDate: "2026-06-25" },
    { id: IDS.tickets[1], unitId: IDS.unitCT501, title: "Elevator compliance inspection",          description: "Annual safety cert due. Inspector visit scheduled.",              priority: "MEDIUM", status: "IN_PROGRESS", assignee: "James Hackman", dueDate: "2026-06-30" },
    { id: IDS.tickets[2], unitId: IDS.unitML003, title: "Perimeter lighting fault — Gate C",       description: "Three lights non-functional. Security flagged.",                  priority: "MEDIUM", status: "NEW",         assignee: null,           dueDate: "2026-06-28" },
    { id: IDS.tickets[3], unitId: IDS.unitML003, title: "Gym HVAC filter replacement",             description: "Quarterly filter change required.",                              priority: "LOW",    status: "IN_PROGRESS", assignee: "Emmanuel Tetteh", dueDate: "2026-06-30" },
    { id: IDS.tickets[4], unitId: null,          title: "Pool pump servicing",                     description: "Routine annual pool pump service.",                               priority: "LOW",    status: "RESOLVED",    assignee: "Kofi Mensah",  dueDate: null },
  ]
  for (const t of tickets) {
    await client.query(
      `INSERT INTO maintenance_tickets (id, developer_id, unit_id, title, description, priority, status, assignee, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO NOTHING`,
      [t.id, IDS.developer, t.unitId, t.title, t.description, t.priority, t.status, t.assignee, t.dueDate],
    )
  }

  console.log("Seed complete.")
  console.log(`  Developer : Special Gardens Estate`)
  console.log(`  Projects  : Meadowline Estate, Cedar Terrace Complex`)
  console.log(`  Units     : 5 (ML-001, ML-002, ML-003, CT-401, CT-501)`)
  console.log(`  Milestones: ${milestoneNames.length} (Meadowline)`)
  console.log(`  Residents : 2 (CT-501 / Dr. Boateng via off-plan; ML-003 / A. Sterling direct)`)
  console.log(`  Payment plan: ML-001 / Dr. Boateng — 3 installments (1 PAID, 1 DUE, 1 PENDING)`)
  console.log(`  Leases    : 2  Rent payments: 6  Maintenance tickets: 5`)
  console.log(`  Users     : admin@specialgardens.example / Admin1234!`)
  console.log(`              sales@specialgardens.example / Sales1234!`)
  console.log(`              buyer@specialgardens.example / Buyer1234!`)
}

async function main() {
  const pool = await buildPool(process.env.DATABASE_URL!)
  const client = await pool.connect()
  try {
    await run(client)
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((err) => {
  console.error("Seed failed:", err.message)
  process.exit(1)
})
