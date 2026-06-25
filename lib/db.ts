import dns from "dns"
import { Pool, type PoolClient } from "pg"

// Pre-resolve DNS to a single IPv4 address so Node.js doesn't race multiple
// IPs via Happy Eyeballs and time out on ones that are unreachable.
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

// Module-level singleton: one pool per Node.js process.
let poolPromise: Promise<Pool> | undefined

export async function getPool(): Promise<Pool> {
  if (!poolPromise) poolPromise = buildPool(process.env.DATABASE_URL!)
  return poolPromise
}

/** Run a parameterized SELECT and return typed rows. */
export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const pool = await getPool()
  const res = await pool.query(text, params)
  return res.rows as T[]
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
