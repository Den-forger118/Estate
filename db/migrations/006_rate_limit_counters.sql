-- Persistent rate-limit counters — used by lib/rateLimit.ts when Upstash Redis
-- is not configured. One row per (key); the row tracks the current fixed window.
-- The upsert logic resets the window inline when it expires, so no background
-- cleanup is strictly necessary, but the index below helps the occasional purge.

CREATE TABLE IF NOT EXISTS rate_limit_counters (
  key          TEXT        PRIMARY KEY,
  count        INTEGER     NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Allows efficient cleanup of expired rows:
--   DELETE FROM rate_limit_counters WHERE window_start < now() - interval '1 day';
CREATE INDEX IF NOT EXISTS idx_rate_limit_counters_window_start
  ON rate_limit_counters (window_start);
