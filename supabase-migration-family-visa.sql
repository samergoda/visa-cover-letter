-- ============================================================
-- Migration: Add Family Visa Fields and Storage Bucket
-- ============================================================

-- Add family visa fields to applicants table
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS is_family_visa BOOLEAN DEFAULT FALSE;
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS spouse_full_name TEXT;
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS spouse_date_of_birth DATE;
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS spouse_nationality TEXT;
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS spouse_passport_number TEXT;
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS number_of_children INTEGER;
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS children_info TEXT;

-- Create storage bucket for applicant documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('applicant-documents', 'applicant-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for applicant-documents bucket
CREATE POLICY IF NOT EXISTS "Public read access for applicant documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'applicant-documents');

CREATE POLICY IF NOT EXISTS "Allow uploads for applicant documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'applicant-documents');

CREATE POLICY IF NOT EXISTS "Allow deletes for applicant documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'applicant-documents');

-- Comment on new columns
COMMENT ON COLUMN applicants.is_family_visa IS 'Flag indicating if this is a family visa application';
COMMENT ON COLUMN applicants.spouse_full_name IS 'Full name of spouse if family visa';
COMMENT ON COLUMN applicants.spouse_date_of_birth IS 'Date of birth of spouse if family visa';
COMMENT ON COLUMN applicants.spouse_nationality IS 'Nationality of spouse if family visa';
COMMENT ON COLUMN applicants.spouse_passport_number IS 'Passport number of spouse if family visa';
COMMENT ON COLUMN applicants.number_of_children IS 'Number of children included in family visa';
COMMENT ON COLUMN applicants.children_info IS 'Details of children (name, DOB, passport) if family visa';
