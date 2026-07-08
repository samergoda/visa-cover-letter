-- ============================================================
-- Migration: Add Bank Account and City Fields to Applicants Table
-- ============================================================

-- Add has_bank_account field (default to FALSE)
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS has_bank_account BOOLEAN DEFAULT FALSE;

-- Add city field
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS city TEXT;

-- Comment on new columns
COMMENT ON COLUMN applicants.has_bank_account IS 'Flag indicating if the applicant has an active bank account';
COMMENT ON COLUMN applicants.city IS 'City of the applicant';
