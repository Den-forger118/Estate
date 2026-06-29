import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/auth"
import { findOwnerOccupierByBuyer } from "@/lib/repos/residents"
import { findNoticesByDeveloper, createNotice } from "@/lib/repos/communityContent"

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
  const notices = await findNoticesByDeveloper(result.developerId)
  return NextResponse.json(notices)
}

const createSchema = z.object({
  title:    z.string().min(1).max(200),
  body:     z.string().min(1).max(5000),
  severity: z.enum(["INFO", "WARNING", "URGENT"]).default("INFO"),
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

  const notice = await createNotice(developerId, parsed.data)
  return NextResponse.json(notice, { status: 201 })
}
