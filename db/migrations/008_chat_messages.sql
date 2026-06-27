-- Migration 008: buyer↔developer chat
-- One thread per buyer-unit; each message stamped with the milestone active at send time.

CREATE TABLE IF NOT EXISTS chat_messages (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id   UUID        NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  buyer_id       UUID        NOT NULL REFERENCES buyers(id)    ON DELETE CASCADE,
  unit_id        UUID        NOT NULL REFERENCES units(id)     ON DELETE CASCADE,
  sender_role    VARCHAR(10) NOT NULL CHECK (sender_role IN ('BUYER', 'STAFF')),
  sender_user_id UUID        NOT NULL,
  body           TEXT        NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  milestone_id   UUID        REFERENCES milestones(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Primary access pattern: fetch the thread for a buyer+unit in order
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread
  ON chat_messages (developer_id, buyer_id, unit_id, created_at);

-- Staff thread-list scan: latest message per buyer for a developer
CREATE INDEX IF NOT EXISTS idx_chat_messages_developer_created
  ON chat_messages (developer_id, created_at DESC);
