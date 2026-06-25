/**
 * db/reseed.ts — DESTRUCTIVE demo-data reset
 *
 * Deletes ALL rows owned by the seeded developer (in correct FK order),
 * then re-runs db/seed.ts so you get a clean, consistent demo dataset.
 *
 * Use when:
 *   - db:seed was run before but changes to seed.ts won't apply (ON CONFLICT DO NOTHING)
 *   - you want to restore the demo buyer to a known mid-journey state
 *
 * Run:  npm run db:reseed
 *
 * WARNING: this permanently removes all data for the demo developer.
 * Never point DATABASE_URL at a production database when running this.
 */

import "dotenv/config"
import dns from "dns"
import { Pool } from "pg"
import { execSync } from "child_process"

const DEMO_DEVELOPER_ID = "11111111-0000-0000-0000-000000000001"

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

async function wipeDemoData(pool: Pool): Promise<void> {
  const client = await pool.connect()
  try {
    const devId = DEMO_DEVELOPER_ID
    console.log(`Wiping all data for developer ${devId}…`)

    // Delete in reverse FK-dependency order.
    // RESTRICT FKs must be cleared before their parent; CASCADE/SET NULL are noted.
    await client.query("DELETE FROM construction_updates WHERE developer_id = $1", [devId])
    await client.query("DELETE FROM payments          WHERE developer_id = $1", [devId])
    await client.query("DELETE FROM documents         WHERE developer_id = $1", [devId])
    await client.query("DELETE FROM installments      WHERE developer_id = $1", [devId])
    await client.query("DELETE FROM payment_plans     WHERE developer_id = $1", [devId])
    await client.query("DELETE FROM rent_payments     WHERE developer_id = $1", [devId])
    await client.query("DELETE FROM leases            WHERE developer_id = $1", [devId])
    await client.query("DELETE FROM maintenance_tickets WHERE developer_id = $1", [devId])
    await client.query("DELETE FROM leads             WHERE developer_id = $1", [devId])
    await client.query("DELETE FROM residents         WHERE developer_id = $1", [devId])
    await client.query("DELETE FROM milestones        WHERE developer_id = $1", [devId])
    await client.query("DELETE FROM units             WHERE developer_id = $1", [devId])
    // consent_records.buyer_id CASCADE → deleted automatically with buyers
    await client.query("DELETE FROM buyers            WHERE developer_id = $1", [devId])
    await client.query("DELETE FROM audit_logs        WHERE developer_id = $1", [devId])
    // sessions.user_id CASCADE → deleted automatically with users
    await client.query("DELETE FROM users             WHERE developer_id = $1", [devId])
    await client.query("DELETE FROM projects          WHERE developer_id = $1", [devId])
    await client.query("DELETE FROM developers        WHERE id           = $1", [devId])

    console.log("Wipe complete.")
  } finally {
    client.release()
  }
}

async function main() {
  const pool = await buildPool(process.env.DATABASE_URL!)
  try {
    await wipeDemoData(pool)
  } finally {
    await pool.end()
  }

  console.log("Running db:seed…")
  execSync("npx tsx db/seed.ts", { stdio: "inherit" })
}

main().catch((err) => {
  console.error("Reseed failed:", err.message)
  process.exit(1)
})
