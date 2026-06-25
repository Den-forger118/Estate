import "dotenv/config"
import dns from "dns"
import { Pool } from "pg"
import fs from "fs/promises"
import path from "path"

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

async function migrate() {
  const pool = await buildPool(process.env.DATABASE_URL!)
  const client = await pool.connect()

  try {
    // Bootstrap: ensure the tracking table exists before anything else
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version    text PRIMARY KEY,
        applied_at timestamptz DEFAULT now() NOT NULL
      )
    `)

    const { rows: applied } = await client.query<{ version: string }>(
      "SELECT version FROM schema_migrations ORDER BY version",
    )
    const appliedSet = new Set(applied.map((r) => r.version))

    const migrationsDir = path.join(process.cwd(), "db", "migrations")
    const files = (await fs.readdir(migrationsDir))
      .filter((f) => f.endsWith(".sql"))
      .sort()

    let count = 0
    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`  skip  ${file}`)
        continue
      }

      const sql = await fs.readFile(path.join(migrationsDir, file), "utf8")

      await client.query("BEGIN")
      try {
        await client.query(sql)
        await client.query(
          "INSERT INTO schema_migrations (version) VALUES ($1)",
          [file],
        )
        await client.query("COMMIT")
        console.log(`  apply ${file}`)
        count++
      } catch (err) {
        await client.query("ROLLBACK")
        throw err
      }
    }

    if (count === 0) {
      console.log("  no new migrations — schema is current")
    } else {
      console.log(`\n  ✓ applied ${count} migration(s)`)
    }
  } finally {
    client.release()
    await pool.end()
  }
}

migrate().catch((err) => {
  console.error("Migration failed:", err.message)
  process.exit(1)
})
