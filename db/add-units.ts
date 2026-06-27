/**
 * db/add-units.ts  — non-destructive unit top-up
 *
 * Inserts 15 new AVAILABLE units across the two existing projects.
 * Safe to run multiple times: ON CONFLICT (id) DO NOTHING means no duplicates.
 * Does NOT touch buyers, payments, payment plans, milestones, or existing units.
 *
 * Run: pnpm db:add-units
 */

import "dotenv/config"
import dns from "dns"
import { Pool, PoolClient } from "pg"

// ── Fixed developer / project IDs (from seed) ────────────────────────────────
const DEVELOPER_ID  = "11111111-0000-0000-0000-000000000001"
const MEADOWLINE_ID = "33333333-0000-0000-0000-000000000001"
const CEDAR_ID      = "33333333-0000-0000-0000-000000000002"

// ── New units — fixed UUIDs so re-running is idempotent ──────────────────────
// Using eeeeeeee- prefix (unused by seed)
const NEW_UNITS = [
  // ── Meadowline Estate (ML) ─────────────────────────────────────────────────
  { id: "eeeeeeee-0000-0000-0000-000000000001", project: MEADOWLINE_ID, code: "ML-004", type: "Detached Villa",  size:  395.0, price:  865000 },
  { id: "eeeeeeee-0000-0000-0000-000000000002", project: MEADOWLINE_ID, code: "ML-005", type: "Detached Villa",  size:  400.5, price:  880000 },
  { id: "eeeeeeee-0000-0000-0000-000000000003", project: MEADOWLINE_ID, code: "ML-006", type: "Townhome",        size:  268.0, price:  535000 },
  { id: "eeeeeeee-0000-0000-0000-000000000004", project: MEADOWLINE_ID, code: "ML-007", type: "Townhome",        size:  272.5, price:  545000 },
  { id: "eeeeeeee-0000-0000-0000-000000000005", project: MEADOWLINE_ID, code: "ML-008", type: "Semi-Detached",   size:  310.0, price:  640000 },
  { id: "eeeeeeee-0000-0000-0000-000000000006", project: MEADOWLINE_ID, code: "ML-009", type: "Semi-Detached",   size:  312.5, price:  645000 },
  { id: "eeeeeeee-0000-0000-0000-000000000007", project: MEADOWLINE_ID, code: "ML-010", type: "Townhome",        size:  255.0, price:  510000 },
  { id: "eeeeeeee-0000-0000-0000-000000000008", project: MEADOWLINE_ID, code: "ML-011", type: "Detached Villa",  size:  410.0, price:  920000 },
  { id: "eeeeeeee-0000-0000-0000-000000000009", project: MEADOWLINE_ID, code: "ML-012", type: "Bungalow",        size:  220.0, price:  450000 },
  // ── Cedar Terrace Complex (CT) ─────────────────────────────────────────────
  { id: "eeeeeeee-0000-0000-0000-000000000010", project: CEDAR_ID,      code: "CT-402", type: "Apartment",       size:  145.0, price:  308000 },
  { id: "eeeeeeee-0000-0000-0000-000000000011", project: CEDAR_ID,      code: "CT-403", type: "Apartment",       size:  152.5, price:  325000 },
  { id: "eeeeeeee-0000-0000-0000-000000000012", project: CEDAR_ID,      code: "CT-404", type: "Duplex",          size:  195.0, price:  425000 },
  { id: "eeeeeeee-0000-0000-0000-000000000013", project: CEDAR_ID,      code: "CT-405", type: "Duplex",          size:  198.5, price:  430000 },
  { id: "eeeeeeee-0000-0000-0000-000000000014", project: CEDAR_ID,      code: "CT-406", type: "Penthouse",       size:  245.0, price:  660000 },
  { id: "eeeeeeee-0000-0000-0000-000000000015", project: CEDAR_ID,      code: "CT-407", type: "Studio",          size:   80.0, price:  190000 },
]

async function buildPool(connectionString: string): Promise<Pool> {
  const url = new URL(connectionString)
  const hostname = url.hostname
  const ip = await new Promise<string | null>((resolve) => {
    const timer = setTimeout(() => resolve(null), 4000)
    dns.resolve4(hostname, (err, addrs) => {
      clearTimeout(timer)
      resolve(err || !addrs?.length ? null : addrs[0])
    })
  })
  return new Pool({
    host: ip ?? hostname,
    port: parseInt(url.port) || 5432,
    database: url.pathname.slice(1),
    user: url.username,
    password: decodeURIComponent(url.password),
    ssl: { servername: hostname, rejectUnauthorized: true },
    connectionTimeoutMillis: 10000,
  })
}

async function run(client: PoolClient) {
  // Count AVAILABLE units before
  const before = await client.query<{ cnt: string }>(
    "SELECT COUNT(*) AS cnt FROM units WHERE developer_id = $1 AND status = 'AVAILABLE'",
    [DEVELOPER_ID],
  )
  const availableBefore = parseInt(before.rows[0].cnt, 10)

  let inserted = 0
  for (const u of NEW_UNITS) {
    const res = await client.query(
      `INSERT INTO units (id, developer_id, project_id, code, type, size_sqm, price_total, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'AVAILABLE')
       ON CONFLICT (id) DO NOTHING`,
      [u.id, DEVELOPER_ID, u.project, u.code, u.type, u.size, u.price],
    )
    inserted += res.rowCount ?? 0
  }

  // Count AVAILABLE units after
  const after = await client.query<{ cnt: string }>(
    "SELECT COUNT(*) AS cnt FROM units WHERE developer_id = $1 AND status = 'AVAILABLE'",
    [DEVELOPER_ID],
  )
  const availableAfter = parseInt(after.rows[0].cnt, 10)

  console.log(`\nUnits added: ${inserted} (${NEW_UNITS.length - inserted} already existed — skipped)`)
  console.log(`AVAILABLE units: ${availableBefore} before → ${availableAfter} after`)
  console.log(`\nNew units:`)
  for (const u of NEW_UNITS) {
    console.log(`  ${u.code.padEnd(7)} ${u.type.padEnd(18)} ${u.size.toFixed(1).padStart(7)} sqm   GH₵ ${u.price.toLocaleString()}`)
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set — cannot connect")
    process.exit(1)
  }
  const pool = await buildPool(process.env.DATABASE_URL)
  const client = await pool.connect()
  try {
    await run(client)
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((err) => {
  console.error("add-units failed:", err.message)
  process.exit(1)
})
