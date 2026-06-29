import { query, queryOne } from "../db"
import type { CommunityEvent, SecurityNotice, FacilityBooking } from "@/app/data/types"

// ─── Events ──────────────────────────────────────────────────────────────────

type EventRow = {
  id: string
  developer_id: string
  title: string
  description: string | null
  event_date: Date
  location: string | null
  category: string
  image_url: string | null
  rsvp_count: number
  created_at: Date
}

function mapEvent(row: EventRow): CommunityEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    eventDate: row.event_date.toISOString(),
    location: row.location ?? undefined,
    category: row.category,
    imageUrl: row.image_url ?? undefined,
    rsvpCount: row.rsvp_count,
    createdAt: row.created_at.toISOString(),
  }
}

export async function findEventsByDeveloper(developerId: string): Promise<CommunityEvent[]> {
  const rows = await query<EventRow>(
    `SELECT * FROM community_events
     WHERE developer_id = $1
     ORDER BY event_date ASC`,
    [developerId],
  )
  return rows.map(mapEvent)
}

export async function createEvent(
  developerId: string,
  data: {
    title: string
    description?: string
    eventDate: Date
    location?: string
    category?: string
    imageUrl?: string
  },
): Promise<CommunityEvent> {
  const rows = await query<EventRow>(
    `INSERT INTO community_events
       (developer_id, title, description, event_date, location, category, image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      developerId,
      data.title,
      data.description ?? null,
      data.eventDate,
      data.location ?? null,
      data.category ?? "General",
      data.imageUrl ?? null,
    ],
  )
  return mapEvent(rows[0])
}

// ─── Security notices ─────────────────────────────────────────────────────────

type NoticeRow = {
  id: string
  developer_id: string
  title: string
  body: string
  severity: string
  active: boolean
  posted_at: Date
}

function mapNotice(row: NoticeRow): SecurityNotice {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    severity: row.severity as SecurityNotice["severity"],
    active: row.active,
    postedAt: row.posted_at.toISOString(),
  }
}

export async function findNoticesByDeveloper(developerId: string): Promise<SecurityNotice[]> {
  const rows = await query<NoticeRow>(
    `SELECT * FROM security_notices
     WHERE developer_id = $1 AND active = true
     ORDER BY posted_at DESC`,
    [developerId],
  )
  return rows.map(mapNotice)
}

export async function createNotice(
  developerId: string,
  data: {
    title: string
    body: string
    severity?: "INFO" | "WARNING" | "URGENT"
  },
): Promise<SecurityNotice> {
  const rows = await query<NoticeRow>(
    `INSERT INTO security_notices (developer_id, title, body, severity)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [developerId, data.title, data.body, data.severity ?? "INFO"],
  )
  return mapNotice(rows[0])
}

// ─── Facility bookings ────────────────────────────────────────────────────────

type BookingRow = {
  id: string
  developer_id: string
  unit_id: string | null
  unit_code: string | null
  resident_id: string | null
  facility: string
  booking_date: Date
  time_slot: string
  status: string
  created_at: Date
}

function mapBooking(row: BookingRow): FacilityBooking {
  return {
    id: row.id,
    unitId: row.unit_id ?? undefined,
    unitCode: row.unit_code ?? undefined,
    residentId: row.resident_id ?? undefined,
    facility: row.facility,
    bookingDate: row.booking_date.toISOString().slice(0, 10),
    timeSlot: row.time_slot,
    status: row.status as FacilityBooking["status"],
    createdAt: row.created_at.toISOString(),
  }
}

export async function findBookingsByUnit(
  unitId: string,
  developerId: string,
): Promise<FacilityBooking[]> {
  const rows = await query<BookingRow>(
    `SELECT fb.*, u.code AS unit_code
     FROM facility_bookings fb
     LEFT JOIN units u ON u.id = fb.unit_id
     WHERE fb.unit_id = $1 AND fb.developer_id = $2 AND fb.status != 'CANCELLED'
     ORDER BY fb.booking_date ASC, fb.time_slot ASC`,
    [unitId, developerId],
  )
  return rows.map(mapBooking)
}

export async function findUpcomingBookingsByDeveloper(
  developerId: string,
): Promise<FacilityBooking[]> {
  const rows = await query<BookingRow>(
    `SELECT fb.*, u.code AS unit_code
     FROM facility_bookings fb
     LEFT JOIN units u ON u.id = fb.unit_id
     WHERE fb.developer_id = $1
       AND fb.status != 'CANCELLED'
       AND fb.booking_date >= CURRENT_DATE
     ORDER BY fb.booking_date ASC, fb.time_slot ASC`,
    [developerId],
  )
  return rows.map(mapBooking)
}

export async function createBooking(
  developerId: string,
  data: {
    unitId?: string
    residentId?: string
    facility: string
    bookingDate: Date
    timeSlot: string
  },
): Promise<FacilityBooking> {
  const rows = await query<BookingRow>(
    `INSERT INTO facility_bookings
       (developer_id, unit_id, resident_id, facility, booking_date, time_slot)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *, NULL AS unit_code`,
    [
      developerId,
      data.unitId ?? null,
      data.residentId ?? null,
      data.facility,
      data.bookingDate,
      data.timeSlot,
    ],
  )
  return mapBooking(rows[0])
}

export async function cancelBooking(
  id: string,
  developerId: string,
): Promise<FacilityBooking | null> {
  const row = await queryOne<BookingRow>(
    `UPDATE facility_bookings
     SET status = 'CANCELLED'
     WHERE id = $1 AND developer_id = $2
     RETURNING *, NULL AS unit_code`,
    [id, developerId],
  )
  return row ? mapBooking(row) : null
}
