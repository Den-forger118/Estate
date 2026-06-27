-- Migration 007: add sale_type to payment_plans
-- OFF_PLAN (default): installments + construction milestones
-- COMPLETED: single full payment, unit already built, no construction milestones

ALTER TABLE payment_plans
  ADD COLUMN IF NOT EXISTS sale_type VARCHAR(20) NOT NULL DEFAULT 'OFF_PLAN';

-- Existing plans are all off-plan
UPDATE payment_plans SET sale_type = 'OFF_PLAN' WHERE sale_type IS NULL;
