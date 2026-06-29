-- Migration 010: unique partial index on (unit_id, buyer_id) for residents
-- Enforces one owner-occupier row per buyer+unit pair.
-- Partial (WHERE buyer_id IS NOT NULL) so direct-tenant rows (buyer_id NULL) are unaffected.
-- Idempotent via IF NOT EXISTS.

CREATE UNIQUE INDEX IF NOT EXISTS idx_residents_unit_buyer
  ON residents (unit_id, buyer_id)
  WHERE buyer_id IS NOT NULL;
