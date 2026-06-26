/**
 * getAppBaseUrl() — server-side only helper for building absolute URLs.
 *
 * Resolution order (first defined wins):
 *   1. APP_URL              — explicit, preferred; set this in Vercel / any host dashboard.
 *   2. NEXT_PUBLIC_APP_URL  — accepted for convenience (also server-readable at runtime).
 *   3. VERCEL_URL           — auto-set by Vercel to the deployment's hostname (no protocol).
 *                             Guarantees links are never localhost on any Vercel deployment,
 *                             even if APP_URL was omitted or misconfigured.
 *   4. http://localhost:3000 — local development fallback only.
 *
 * Called inside route handlers (at request time), never at module load time,
 * so the live runtime value of process.env is always used.
 */
export function getAppBaseUrl(): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/+$/, "")
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "")
  }
  if (process.env.VERCEL_URL) {
    // VERCEL_URL contains only the host (no protocol), always served over HTTPS.
    return `https://${process.env.VERCEL_URL}`
  }
  return "http://localhost:3000"
}
