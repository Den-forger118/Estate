import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSession } from "@/lib/auth"
import { findOwnerOccupierByBuyer } from "@/lib/repos/residents"
import { findBookingsByUnit, createBooking } from "@/lib/repos/communityContent"

async function resolveHomeownerContext(req: NextRequest): Promise<
  { developerId: string; unitId: string; residentId: string } | NextResponse
> {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { role, buyerId } = session.user

  if (role !== "BUYER") {
    return NextResponse.json({ error: "Forbidden — homeowners only" }, { status: 403 })
  }
  if (!buyerId) return NextResponse.json({ error: "No buyer context" }, { status: 403 })

  const homeowner = await findOwnerOccupierByBuyer(buyerId)
  if (!homeowner) return NextResponse.json({ error: "Homeowner access required" }, { status: 403 })

  return {
    developerId: homeowner.developerId,
    unitId: homeowner.unitId,
    residentId: homeowner.id,
  }
}

export async function GET(req: NextRequest) {
  const ctx = await resolveHomeownerContext(req)
  if (ctx instanceof NextResponse) return ctx
  const bookings = await findBookingsByUnit(ctx.unitId, ctx.developerId)
  return NextResponse.json(bookings)
}

const createSchema = z.object({
  facility:    z.string().min(1).max(100),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeSlot:    z.string().min(1).max(20),
})

export async function POST(req: NextRequest) {
  const ctx = await resolveHomeownerContext(req)
  if (ctx instanceof NextResponse) return ctx

  const body = await req.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 })
  }

  const booking = await createBooking(ctx.developerId, {
    unitId: ctx.unitId,
    residentId: ctx.residentId,
    facility: parsed.data.facility,
    bookingDate: new Date(parsed.data.bookingDate),
    timeSlot: parsed.data.timeSlot,
  })
  return NextResponse.json(booking, { status: 201 })
}
