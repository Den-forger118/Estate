-- Account state fields on users.
-- last_login_at: set by the login route on every successful authentication.
-- status: ACTIVE (default) or SUSPENDED. Suspended users cannot log in.
-- Activation state is derived: password_hash IS NULL → PENDING ACTIVATION.

ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;
ALTER TABLE users ADD CONSTRAINT users_status_check
  CHECK (status IN ('ACTIVE', 'SUSPENDED'));

CREATE INDEX IF NOT EXISTS idx_users_status ON users (developer_id, status);
