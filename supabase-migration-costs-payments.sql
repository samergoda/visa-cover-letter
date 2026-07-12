-- ============================================================
-- Migration: Add Cost and Payment Fields to Applicants Table
-- ============================================================

-- Add cost and payment fields to applicants table
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS total_cost NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(10, 2) DEFAULT 0.00;

-- Comment on new columns
COMMENT ON COLUMN applicants.total_cost IS 'Total cost of the visa service/fee';
COMMENT ON COLUMN applicants.amount_paid IS 'Amount paid by the applicant';
