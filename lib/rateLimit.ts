// Simple in-memory sliding-window rate limiter.
// For multi-instance deployments, replace backing store with Redis.
// Slot: captcha integration (e.g. Turnstile) would go here as a second check.

type Entry = { count: number; windowStart: number }

const store = new Map<string, Entry>()

const WINDOW_MS = 60_000  // 1 minute
const MAX_PER_WINDOW = 5  // max requests per IP per window

// Evict stale entries periodically to prevent unbounded memory growth.
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart > WINDOW_MS * 2) store.delete(key)
  }
}, 5 * 60_000)

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = store.get(ip)

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    store.set(ip, { count: 1, windowStart: now })
    return { allowed: true, remaining: MAX_PER_WINDOW - 1 }
  }

  if (entry.count >= MAX_PER_WINDOW) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: MAX_PER_WINDOW - entry.count }
}
