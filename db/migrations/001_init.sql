-- Estate off-plan platform — initial schema
-- Naming: snake_case tables & columns (standard Postgres).
-- PKs: uuid with gen_random_uuid() — no app-side ID generation needed.
-- Money: NUMERIC(14,2) throughout — never float.
-- updated_at columns are maintained by a BEFORE UPDATE trigger.

-- ─── TRIGGER FUNCTION ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── ENUMS ───────────────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('ADMIN', 'SALES', 'OPS', 'BUYER');
CREATE TYPE unit_status AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'HANDED_OVER');
CREATE TYPE installment_status AS ENUM ('PENDING', 'DUE', 'PAID', 'OVERDUE', 'PARTIAL');
CREATE TYPE milestone_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');
CREATE TYPE recon_status AS ENUM ('UNMATCHED', 'MATCHED', 'MANUAL');
CREATE TYPE doc_type AS ENUM ('SEARCH_CERTIFICATE', 'SITE_PLAN', 'INDENTURE', 'OTHER');

-- ─── TENANT ──────────────────────────────────────────────────────────────────

CREATE TABLE developers (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name       text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- ─── USERS & AUTH ────────────────────────────────────────────────────────────

CREATE TABLE users (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id  uuid REFERENCES developers(id) ON DELETE SET NULL,
  email         text NOT NULL UNIQUE,
  password_hash text,
  role          user_role NOT NULL,
  -- buyer_id FK added after buyers table is created
  buyer_id      uuid UNIQUE,
  created_at    timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE sessions (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- ─── PROJECTS ────────────────────────────────────────────────────────────────

CREATE TABLE projects (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id uuid NOT NULL REFERENCES developers(id) ON DELETE RESTRICT,
  name         text NOT NULL,
  location     text,
  status       text NOT NULL DEFAULT 'ACTIVE'
);

-- ─── BUYERS ──────────────────────────────────────────────────────────────────

CREATE TABLE buyers (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id uuid NOT NULL REFERENCES developers(id) ON DELETE RESTRICT,
  full_name    text NOT NULL,
  phone        text NOT NULL,
  email        text,
  is_diaspora  boolean NOT NULL DEFAULT false,
  created_at   timestamptz DEFAULT now() NOT NULL
);

-- Add FK from users.buyer_id to buyers now that the table exists
ALTER TABLE users
  ADD CONSTRAINT users_buyer_id_fkey
  FOREIGN KEY (buyer_id) REFERENCES buyers(id) ON DELETE SET NULL;

-- ─── UNITS ───────────────────────────────────────────────────────────────────

CREATE TABLE units (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id uuid NOT NULL REFERENCES developers(id) ON DELETE RESTRICT,
  project_id   uuid NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  code         text NOT NULL,
  type         text,
  size_sqm     numeric(8,2),
  price_total  numeric(14,2) NOT NULL,
  status       unit_status NOT NULL DEFAULT 'AVAILABLE',
  buyer_id     uuid REFERENCES buyers(id) ON DELETE SET NULL,
  created_at   timestamptz DEFAULT now() NOT NULL,
  updated_at   timestamptz DEFAULT now() NOT NULL
);

CREATE TRIGGER trg_units_updated_at
  BEFORE UPDATE ON units
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── PAYMENT PLANS & INSTALLMENTS ────────────────────────────────────────────

CREATE TABLE payment_plans (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id  uuid NOT NULL REFERENCES developers(id) ON DELETE RESTRICT,
  unit_id       uuid NOT NULL UNIQUE REFERENCES units(id) ON DELETE RESTRICT,
  buyer_id      uuid NOT NULL REFERENCES buyers(id) ON DELETE RESTRICT,
  total_amount  numeric(14,2) NOT NULL,
  down_payment  numeric(14,2) NOT NULL,
  currency      text NOT NULL DEFAULT 'GHS',
  zero_interest boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now() NOT NULL
);

-- ─── MILESTONES ──────────────────────────────────────────────────────────────

CREATE TABLE milestones (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id uuid NOT NULL REFERENCES developers(id) ON DELETE RESTRICT,
  project_id   uuid NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  name         text NOT NULL,
  sequence     integer NOT NULL,
  status       milestone_status NOT NULL DEFAULT 'NOT_STARTED',
  target_date  timestamptz,
  completed_at timestamptz,
  created_at   timestamptz DEFAULT now() NOT NULL,
  updated_at   timestamptz DEFAULT now() NOT NULL
);

CREATE TRIGGER trg_milestones_updated_at
  BEFORE UPDATE ON milestones
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── INSTALLMENTS ────────────────────────────────────────────────────────────

CREATE TABLE installments (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id        uuid NOT NULL REFERENCES developers(id) ON DELETE RESTRICT,
  payment_plan_id     uuid NOT NULL REFERENCES payment_plans(id) ON DELETE RESTRICT,
  sequence            integer NOT NULL,
  amount              numeric(14,2) NOT NULL,
  due_date            timestamptz,
  linked_milestone_id uuid REFERENCES milestones(id) ON DELETE SET NULL,
  status              installment_status NOT NULL DEFAULT 'PENDING',
  paid_amount         numeric(14,2) NOT NULL DEFAULT 0,
  paid_at             timestamptz,
  created_at          timestamptz DEFAULT now() NOT NULL,
  updated_at          timestamptz DEFAULT now() NOT NULL
);

CREATE TRIGGER trg_installments_updated_at
  BEFORE UPDATE ON installments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── CONSTRUCTION UPDATES ─────────────────────────────────────────────────────

CREATE TABLE construction_updates (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id uuid NOT NULL REFERENCES developers(id) ON DELETE RESTRICT,
  milestone_id uuid NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  caption      text,
  photo_url    text NOT NULL,
  posted_by_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  posted_at    timestamptz DEFAULT now() NOT NULL
);

-- ─── PAYMENTS ────────────────────────────────────────────────────────────────

CREATE TABLE payments (
  id                        uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id              uuid NOT NULL REFERENCES developers(id) ON DELETE RESTRICT,
  provider_ref              text NOT NULL UNIQUE,
  amount                    numeric(14,2) NOT NULL,
  channel                   text NOT NULL,
  raw_payload               jsonb NOT NULL,
  received_at               timestamptz DEFAULT now() NOT NULL,
  reconciled_installment_id uuid REFERENCES installments(id) ON DELETE SET NULL,
  recon_status              recon_status NOT NULL DEFAULT 'UNMATCHED'
);

-- ─── DOCUMENTS ───────────────────────────────────────────────────────────────

CREATE TABLE documents (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id   uuid NOT NULL REFERENCES developers(id) ON DELETE RESTRICT,
  unit_id        uuid NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  type           doc_type NOT NULL,
  file_url       text NOT NULL,
  version        integer NOT NULL DEFAULT 1,
  uploaded_by_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  uploaded_at    timestamptz DEFAULT now() NOT NULL
);

-- ─── CONSENT & AUDIT ─────────────────────────────────────────────────────────

CREATE TABLE consent_records (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id   uuid NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  purpose    text NOT NULL,
  granted_at timestamptz DEFAULT now() NOT NULL,
  ip_address text
);

CREATE TABLE audit_logs (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id  uuid REFERENCES developers(id) ON DELETE SET NULL,
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action        text NOT NULL,
  target        text,
  meta          jsonb,
  created_at    timestamptz DEFAULT now() NOT NULL
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

-- Users
CREATE INDEX idx_users_developer_id   ON users (developer_id);

-- Sessions
CREATE INDEX idx_sessions_user_id     ON sessions (user_id);
CREATE INDEX idx_sessions_expires_at  ON sessions (expires_at);

-- Projects
CREATE INDEX idx_projects_developer_id ON projects (developer_id);

-- Buyers
CREATE INDEX idx_buyers_developer_id  ON buyers (developer_id);

-- Units — composite on (developer_id, status, updated_at) for stalled-ops query
CREATE INDEX idx_units_developer_id          ON units (developer_id);
CREATE INDEX idx_units_project_id            ON units (project_id);
CREATE INDEX idx_units_buyer_id              ON units (buyer_id);
CREATE INDEX idx_units_status                ON units (status);
CREATE INDEX idx_units_stalled               ON units (developer_id, status, updated_at);

-- Payment Plans
CREATE INDEX idx_payment_plans_developer_id ON payment_plans (developer_id);
CREATE INDEX idx_payment_plans_buyer_id     ON payment_plans (buyer_id);

-- Milestones — composite for stalled-ops query
CREATE INDEX idx_milestones_developer_id    ON milestones (developer_id);
CREATE INDEX idx_milestones_project_id      ON milestones (project_id);
CREATE INDEX idx_milestones_status          ON milestones (status);
CREATE INDEX idx_milestones_stalled         ON milestones (developer_id, status, updated_at);

-- Installments — composite for stalled-ops query
CREATE INDEX idx_installments_developer_id  ON installments (developer_id);
CREATE INDEX idx_installments_plan_id       ON installments (payment_plan_id);
CREATE INDEX idx_installments_milestone_id  ON installments (linked_milestone_id);
CREATE INDEX idx_installments_status        ON installments (status);
CREATE INDEX idx_installments_stalled       ON installments (developer_id, status, updated_at);

-- Construction Updates
CREATE INDEX idx_construction_updates_milestone_id ON construction_updates (milestone_id);
CREATE INDEX idx_construction_updates_developer_id ON construction_updates (developer_id);

-- Payments
CREATE INDEX idx_payments_developer_id  ON payments (developer_id);
CREATE INDEX idx_payments_recon_status  ON payments (recon_status);

-- Documents
CREATE INDEX idx_documents_unit_id      ON documents (unit_id);
CREATE INDEX idx_documents_developer_id ON documents (developer_id);

-- Consent Records
CREATE INDEX idx_consent_records_buyer_id ON consent_records (buyer_id);

-- Audit Logs
CREATE INDEX idx_audit_logs_developer_id ON audit_logs (developer_id);
CREATE INDEX idx_audit_logs_actor        ON audit_logs (actor_user_id);
CREATE INDEX idx_audit_logs_created_at   ON audit_logs (created_at);
