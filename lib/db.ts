import dns from "dns"
import { Pool, type PoolClient } from "pg"

// Resolve to IPv4 to avoid Happy-Eyeballs races, but cap at 4 s so a slow
// DNS on cold start doesn't stall forever. Falls back to the hostname so
// the pool is still created and Neon's proxy (which is always up) can wake
// the compute during the Postgres handshake.
function resolveIpv4(hostname: string): Promise<string | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 4000)
    dns.resolve4(hostname, (err, addrs) => {
      clearTimeout(timer)
      resolve(err || !addrs?.length ? null : addrs[0])
    })
  })
}

async function buildPool(connectionString: string): Promise<Pool> {
  const url = new URL(connectionString)
  const hostname = url.hostname
  const ip = await resolveIpv4(hostname)
  return new Pool({
    host: ip ?? hostname,
    port: parseInt(url.port) || 5432,
    database: url.pathname.slice(1),
    user: url.username,
    password: decodeURIComponent(url.password),
    ssl: { servername: hostname, rejectUnauthorized: true },
    // 10 s gives Neon's free-tier compute time to wake from suspension.
    connectionTimeoutMillis: 10000,
  })
}

// Module-level singleton: one pool per Node.js process.
let poolPromise: Promise<Pool> | undefined

export async function getPool(): Promise<Pool> {
  if (!poolPromise) poolPromise = buildPool(process.env.DATABASE_URL!)
  try {
    return await poolPromise
  } catch (err) {
    // Reset so the next request can attempt a fresh build rather than
    // replaying the same failed Promise.
    poolPromise = undefined
    throw err
  }
}

/** Run a parameterized SELECT and return typed rows. */
export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  let lastErr: unknown
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, attempt * 750))
    try {
      const pool = await getPool()
      const res = await pool.query(text, params)
      return res.rows as T[]
    } catch (err) {
      lastErr = err
    }
  }
  throw lastErr
}

/** Like query() but returns the first row or null. */
export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params?: unknown[],
): Promise<T | null> {
  const rows = await query<T>(text, params)
  return rows[0] ?? null
}

/** Run multiple statements in a single Postgres transaction.
 *  Rolls back automatically on any thrown error. */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const pool = await getPool()
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    const result = await fn(client)
    await client.query("COMMIT")
    return result
  } catch (err) {
    await client.query("ROLLBACK")
    throw err
  } finally {
    client.release()
  }
}
