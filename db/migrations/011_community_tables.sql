-- Migration 011: Community content tables for Resident OS
-- community_events  — estate events created by staff, read by homeowners
-- security_notices  — security announcements created by staff
-- facility_bookings — amenity bookings made by homeowner-residents

CREATE TABLE community_events (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id uuid NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  title        text NOT NULL,
  description  text,
  event_date   timestamptz NOT NULL,
  location     text,
  category     text NOT NULL DEFAULT 'General',
  image_url    text,
  rsvp_count   integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_community_events_developer ON community_events (developer_id, event_date);

CREATE TABLE security_notices (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id uuid NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  title        text NOT NULL,
  body         text NOT NULL,
  severity     text NOT NULL DEFAULT 'INFO',  -- INFO | WARNING | URGENT
  active       boolean NOT NULL DEFAULT true,
  posted_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_security_notices_developer ON security_notices (developer_id, posted_at DESC);

CREATE TABLE facility_bookings (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id uuid NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  unit_id      uuid REFERENCES units(id) ON DELETE SET NULL,
  resident_id  uuid REFERENCES residents(id) ON DELETE SET NULL,
  facility     text NOT NULL,
  booking_date date NOT NULL,
  time_slot    text NOT NULL,
  status       text NOT NULL DEFAULT 'CONFIRMED',  -- CONFIRMED | CANCELLED
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_facility_bookings_developer ON facility_bookings (developer_id, booking_date);
CREATE INDEX idx_facility_bookings_unit      ON facility_bookings (unit_id);
