-- Migration 009: homeowner/owner-occupier support
-- Adds occupancy_type to residents so owner-occupiers (buyers who completed
-- purchase and moved in) are distinguishable from regular tenants.
-- Existing residents whose buyer_id is set are all owner-occupiers from the
-- off-plan → handover flow, so they get OWNER_OCCUPIER; direct tenants stay TENANT.

ALTER TABLE residents
  ADD COLUMN IF NOT EXISTS occupancy_type VARCHAR(20) NOT NULL DEFAULT 'TENANT';

-- Backfill: any resident with a buyer_id link is an owner-occupier
UPDATE residents SET occupancy_type = 'OWNER_OCCUPIER' WHERE buyer_id IS NOT NULL;

ALTER TABLE residents
  DROP CONSTRAINT IF EXISTS residents_occupancy_type_check;

ALTER TABLE residents
  ADD CONSTRAINT residents_occupancy_type_check
  CHECK (occupancy_type IN ('TENANT', 'OWNER_OCCUPIER'));
