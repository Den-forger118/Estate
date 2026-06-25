-- Password-set tokens — one-time links for buyers to set their initial password.
-- token_hash: SHA-256 of the raw token (token stored in email, hash stored here).
-- expires_at: 48 h from issuance.
-- used_at: set when the token is consumed; NULL = still valid.

CREATE TABLE IF NOT EXISTS password_set_tokens (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text        NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pst_user_id    ON password_set_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_pst_token_hash ON password_set_tokens (token_hash);
