import { NextResponse } from "next/server"
import { findPublicUnits } from "@/lib/repos/units"

// Public — no session. Returns only fields safe for unauthenticated visitors.
// Never returns: developer_id, project_id (internal FK), buyer_id, or financial breakdown.
// Developer is resolved server-side from env, never from the request.

function getDefaultDeveloperId(): string {
  const id = process.env.DEVELOPER_ID
  if (!id) throw new Error("DEVELOPER_ID env var is not set")
  return id
}

export async function GET() {
  let developerId: string
  try {
    developerId = getDefaultDeveloperId()
  } catch {
    return NextResponse.json({ error: "Service misconfigured" }, { status: 503 })
  }

  const units = await findPublicUnits(developerId)

  // Shape each unit for public consumption — explicit allow-list of fields.
  const payload = units.map((u) => ({
    id: u.id,
    code: u.code,
    type: u.type,
    sizeSqm: u.sizeSqm,
    priceTotal: u.priceTotal,
    status: u.status,
    project: {
      name: u.projectName,
      location: u.projectLocation,
    },
  }))

  return NextResponse.json(payload, {
    headers: {
      // Allow CDN / browser cache for 60s; background revalidation up to 300s
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  })
}
