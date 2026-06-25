-- Residency (REMS) schema — extends the off-plan platform to the post-handover lifecycle.
-- All tables are scoped by developer_id and mirror the parameterized-query conventions of 001_init.sql.
-- updated_at is maintained by the same set_updated_at() trigger from 001_init.sql.

-- ─── RESIDENTS ───────────────────────────────────────────────────────────────
-- A resident is someone who lives in a HANDED_OVER or leased unit.
-- buyer_id is NULLABLE: off-plan buyers carry it (lifecycle bridge); direct tenants do not.

CREATE TABLE residents (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id uuid NOT NULL REFERENCES developers(id) ON DELETE RESTRICT,
  unit_id      uuid NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  buyer_id     uuid REFERENCES buyers(id) ON DELETE SET NULL,
  full_name    text NOT NULL,
  phone        text NOT NULL,
  email        text,
  move_in_date date,
  status       text NOT NULL DEFAULT 'ACTIVE',
  created_at   timestamptz DEFAULT now() NOT NULL,
  updated_at   timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT residents_status_check CHECK (status IN ('ACTIVE', 'NOTICE_GIVEN', 'VACATED'))
);

CREATE TRIGGER trg_residents_updated_at
  BEFORE UPDATE ON residents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_residents_developer_id ON residents (developer_id);
CREATE INDEX idx_residents_unit_id      ON residents (unit_id);
CREATE INDEX idx_residents_buyer_id     ON residents (buyer_id);
CREATE INDEX idx_residents_status       ON residents (developer_id, status);

-- ─── LEASES ──────────────────────────────────────────────────────────────────

CREATE TABLE leases (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id  uuid NOT NULL REFERENCES developers(id) ON DELETE RESTRICT,
  unit_id       uuid NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  resident_id   uuid NOT NULL REFERENCES residents(id) ON DELETE RESTRICT,
  start_date    date NOT NULL,
  end_date      date,
  rent_monthly  numeric(14,2) NOT NULL,
  deposit       numeric(14,2) NOT NULL DEFAULT 0,
  currency      text NOT NULL DEFAULT 'GHS',
  status        text NOT NULL DEFAULT 'ACTIVE',
  created_at    timestamptz DEFAULT now() NOT NULL,
  updated_at    timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT leases_status_check CHECK (status IN ('ACTIVE', 'NOTICE_GIVEN', 'EXPIRED', 'TERMINATED'))
);

CREATE TRIGGER trg_leases_updated_at
  BEFORE UPDATE ON leases
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_leases_developer_id ON leases (developer_id);
CREATE INDEX idx_leases_unit_id      ON leases (unit_id);
CREATE INDEX idx_leases_resident_id  ON leases (resident_id);
CREATE INDEX idx_leases_status       ON leases (developer_id, status);

-- ─── RENT PAYMENTS ───────────────────────────────────────────────────────────

CREATE TABLE rent_payments (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id uuid NOT NULL REFERENCES developers(id) ON DELETE RESTRICT,
  lease_id     uuid NOT NULL REFERENCES leases(id) ON DELETE RESTRICT,
  amount       numeric(14,2) NOT NULL,
  due_date     date,
  paid_at      timestamptz,
  status       text NOT NULL DEFAULT 'PENDING',
  ref          text,
  created_at   timestamptz DEFAULT now() NOT NULL,
  updated_at   timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT rent_payments_status_check CHECK (status IN ('PENDING', 'PAID', 'OVERDUE', 'PARTIAL'))
);

CREATE TRIGGER trg_rent_payments_updated_at
  BEFORE UPDATE ON rent_payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_rent_payments_developer_id ON rent_payments (developer_id);
CREATE INDEX idx_rent_payments_lease_id     ON rent_payments (lease_id);
CREATE INDEX idx_rent_payments_status       ON rent_payments (developer_id, status);
CREATE INDEX idx_rent_payments_due_date     ON rent_payments (developer_id, due_date);

-- ─── MAINTENANCE TICKETS ─────────────────────────────────────────────────────

CREATE TABLE maintenance_tickets (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id uuid NOT NULL REFERENCES developers(id) ON DELETE RESTRICT,
  unit_id      uuid REFERENCES units(id) ON DELETE SET NULL,
  title        text NOT NULL,
  description  text,
  priority     text NOT NULL DEFAULT 'MEDIUM',
  status       text NOT NULL DEFAULT 'NEW',
  assignee     text,
  due_date     date,
  created_at   timestamptz DEFAULT now() NOT NULL,
  updated_at   timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT maintenance_tickets_priority_check CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  CONSTRAINT maintenance_tickets_status_check   CHECK (status   IN ('NEW', 'IN_PROGRESS', 'RESOLVED'))
);

CREATE TRIGGER trg_maintenance_tickets_updated_at
  BEFORE UPDATE ON maintenance_tickets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_maintenance_developer_id ON maintenance_tickets (developer_id);
CREATE INDEX idx_maintenance_unit_id      ON maintenance_tickets (unit_id);
CREATE INDEX idx_maintenance_status       ON maintenance_tickets (developer_id, status);
CREATE INDEX idx_maintenance_priority     ON maintenance_tickets (developer_id, priority);
