import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/auth"
import { findOwnerOccupierByBuyer } from "@/lib/repos/residents"
import { findEventsByDeveloper, createEvent } from "@/lib/repos/communityContent"

async function resolveDeveloperId(req: NextRequest): Promise<{ developerId: string } | NextResponse> {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { role, developerId, buyerId } = session.user

  if (role === "BUYER") {
    if (!buyerId) return NextResponse.json({ error: "No buyer context" }, { status: 403 })
    const homeowner = await findOwnerOccupierByBuyer(buyerId)
    if (!homeowner) return NextResponse.json({ error: "Homeowner access required" }, { status: 403 })
    return { developerId: homeowner.developerId }
  }

  if (role === "ADMIN" || role === "SALES" || role === "OPS") {
    if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })
    return { developerId }
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}

export async function GET(req: NextRequest) {
  const result = await resolveDeveloperId(req)
  if (result instanceof NextResponse) return result
  const events = await findEventsByDeveloper(result.developerId)
  return NextResponse.json(events)
}

const createSchema = z.object({
  title:       z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  eventDate:   z.string().datetime(),
  location:    z.string().max(200).optional(),
  category:    z.string().max(80).optional(),
  imageUrl:    z.string().url().optional(),
})

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { role, developerId } = session.user
  if (role !== "ADMIN" && role !== "OPS") {
    return NextResponse.json({ error: "Forbidden — staff only" }, { status: 403 })
  }
  if (!developerId) return NextResponse.json({ error: "No developer context" }, { status: 403 })

  const body = await req.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 })
  }

  const event = await createEvent(developerId, {
    ...parsed.data,
    eventDate: new Date(parsed.data.eventDate),
  })
  return NextResponse.json(event, { status: 201 })
}
