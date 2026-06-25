-- Leads — website inquiry capture
-- Scoped by developer_id; lifecycle: NEW → CONTACTED → QUALIFIED → CONVERTED | REJECTED.
-- unit_id is NULLABLE: a visitor can express general interest without selecting a specific unit.
-- ON DELETE SET NULL on unit_id so deleting a unit does not orphan the lead history.

CREATE TABLE IF NOT EXISTS leads (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_id uuid        NOT NULL REFERENCES developers(id) ON DELETE RESTRICT,
  unit_id      uuid                 REFERENCES units(id)       ON DELETE SET NULL,
  full_name    text        NOT NULL,
  phone        text        NOT NULL,
  email        text,
  message      text,
  source       text        NOT NULL DEFAULT 'website',
  status       text        NOT NULL DEFAULT 'NEW',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT leads_status_check CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'REJECTED'))
);

DROP TRIGGER IF EXISTS trg_leads_updated_at ON leads;
CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_leads_developer_id ON leads (developer_id);
CREATE INDEX IF NOT EXISTS idx_leads_unit_id      ON leads (unit_id);
CREATE INDEX IF NOT EXISTS idx_leads_status       ON leads (developer_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at   ON leads (developer_id, created_at DESC);
