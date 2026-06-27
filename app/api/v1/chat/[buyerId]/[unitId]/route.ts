import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/auth"
import { findBuyerByIdRaw } from "@/lib/repos/buyers"
import { findMessages, sendMessage, getActiveMilestoneForUnit } from "@/lib/repos/chatMessages"
import { checkRateLimit } from "@/lib/rateLimit"

const sendSchema = z.object({
  body: z.string().min(1).max(2000),
})

type Params = { params: Promise<{ buyerId: string; unitId: string }> }

// ── GET — fetch the thread ────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: Params,
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { buyerId, unitId } = await params
  const { role, developerId, buyerId: sessionBuyerId } = session.user

  // Determine developer context and enforce access
  let scopedDeveloperId: string

  if (role === "BUYER") {
    // Buyers may only read their own thread
    if (sessionBuyerId !== buyerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const raw = await findBuyerByIdRaw(buyerId)
    if (!raw) return NextResponse.json({ error: "Buyer not found" }, { status: 404 })
    scopedDeveloperId = raw.developerId
  } else if (role === "ADMIN" || role === "SALES" || role === "OPS") {
    if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })
    scopedDeveloperId = developerId
  } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const messages = await findMessages(buyerId, unitId, scopedDeveloperId)
  return NextResponse.json(messages)
}

// ── POST — send a message ─────────────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: Params,
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { buyerId, unitId } = await params
  const { role, developerId, buyerId: sessionBuyerId, id: senderUserId } = session.user

  // Determine developer context and sender role
  let scopedDeveloperId: string
  let senderRole: "BUYER" | "STAFF"

  if (role === "BUYER") {
    if (sessionBuyerId !== buyerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const raw = await findBuyerByIdRaw(buyerId)
    if (!raw) return NextResponse.json({ error: "Buyer not found" }, { status: 404 })
    scopedDeveloperId = raw.developerId
    senderRole = "BUYER"
  } else if (role === "ADMIN" || role === "SALES" || role === "OPS") {
    if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })
    scopedDeveloperId = developerId
    senderRole = "STAFF"
  } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  // Rate limit: buyers 10/min, staff 30/min
  const rlKey = senderRole === "BUYER"
    ? `chat:buyer:${buyerId}`
    : `chat:staff:${senderUserId}`
  const rlMax = senderRole === "BUYER" ? 10 : 30
  const rl = await checkRateLimit(rlKey, { max: rlMax, windowMs: 60_000 })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many messages — please wait before sending again." },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSec) },
      },
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = sendSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 })
  }

  // Stamp with the currently active milestone (IN_PROGRESS) for the unit's project
  const activeMilestone = await getActiveMilestoneForUnit(unitId, scopedDeveloperId)

  const message = await sendMessage({
    developerId: scopedDeveloperId,
    buyerId,
    unitId,
    senderRole,
    senderUserId,
    body: parsed.data.body,
    milestoneId: activeMilestone?.id ?? null,
  })

  return NextResponse.json(message, { status: 201 })
}
