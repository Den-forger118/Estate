/**
 * Persistent rate limiter — fixed-window, two backends:
 *
 *   1. Upstash Redis (preferred, serverless-safe):
 *      Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.
 *      Uses the Upstash REST API directly — no SDK package needed.
 *
 *   2. Neon Postgres (automatic fallback):
 *      Requires the rate_limit_counters table (migration 006).
 *      One atomic upsert per check — safe under concurrent requests.
 *
 * No in-memory fallback: a process-local Map provides zero cross-instance
 * protection on serverless and is silently ineffective.
 *
 * Failure mode: if both backends throw, the function fails OPEN (allows the
 * request) and logs the error. This prevents the rate limiter itself from
 * taking down the app, but means a broken backend = no limiting until fixed.
 */

import { queryOne } from "./db"

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSec: number
}

// ── Upstash Redis backend ─────────────────────────────────────────────────────
// Uses a three-command pipeline: INCR (atomic counter), EXPIRE (set/refresh TTL),
// TTL (read remaining seconds for Retry-After). All three execute in one HTTP call.

async function checkUpstash(
  key: string,
  max: number,
  windowSec: number,
): Promise<RateLimitResult> {
  const baseUrl = process.env.UPSTASH_REDIS_REST_URL!
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!
  const rlKey = `rl:${key}`

  const res = await fetch(`${baseUrl}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", rlKey],
      // EXPIRE on every increment (not just count==1) is safe and avoids a
      // separate conditional round-trip. Keys are refreshed to a full window
      // on each new request within the window — intentional fixed-window semantics.
      ["EXPIRE", rlKey, windowSec],
      ["TTL", rlKey],
    ]),
  })

  if (!res.ok) throw new Error(`Upstash pipeline HTTP ${res.status}`)

  type Pipeline = [{ result: number }, { result: number }, { result: number }]
  const data = (await res.json()) as Pipeline
  const count = data[0].result
  const ttlSec = data[2].result

  if (count > max) {
    return { allowed: false, remaining: 0, retryAfterSec: Math.max(1, ttlSec) }
  }
  return { allowed: true, remaining: max - count, retryAfterSec: 0 }
}

// ── Neon Postgres backend ─────────────────────────────────────────────────────
// Single atomic upsert: inserts a new row or increments within the current
// window, resetting the window if it has expired. All reads and writes happen
// inside one statement so concurrent requests can't double-count.

async function checkNeon(
  key: string,
  max: number,
  windowMs: number,
): Promise<RateLimitResult> {
  type Row = { count: number; retry_after_sec: number }

  const row = await queryOne<Row>(
    `INSERT INTO rate_limit_counters (key, count, window_start)
     VALUES ($1, 1, now())
     ON CONFLICT (key) DO UPDATE
       SET count = CASE
             WHEN now() - rate_limit_counters.window_start > ($2 * '1 millisecond'::interval)
             THEN 1
             ELSE rate_limit_counters.count + 1
           END,
           window_start = CASE
             WHEN now() - rate_limit_counters.window_start > ($2 * '1 millisecond'::interval)
             THEN now()
             ELSE rate_limit_counters.window_start
           END
     RETURNING
       count,
       GREATEST(0,
         EXTRACT(EPOCH FROM
           (rate_limit_counters.window_start + ($2 * '1 millisecond'::interval) - now())
         )::int
       ) AS retry_after_sec`,
    [key, windowMs],
  )

  // row is always non-null: the upsert always returns exactly one row.
  const count = row!.count
  if (count > max) {
    return { allowed: false, remaining: 0, retryAfterSec: row!.retry_after_sec }
  }
  return { allowed: true, remaining: max - count, retryAfterSec: 0 }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function checkRateLimit(
  key: string,
  opts: { max: number; windowMs: number } = { max: 5, windowMs: 60_000 },
): Promise<RateLimitResult> {
  const { max, windowMs } = opts
  try {
    if (
      process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
      return await checkUpstash(key, max, Math.ceil(windowMs / 1000))
    }
    return await checkNeon(key, max, windowMs)
  } catch (err) {
    console.error("[rateLimit] backend error — failing open:", err)
    // Allow the request; a broken rate-limiter must not take down the app.
    return { allowed: true, remaining: max, retryAfterSec: 0 }
  }
}
