-- ============================================================
-- Schengen Visa Application Management System - Supabase Schema
-- ============================================================
-- Run this in Supabase SQL Editor to set up the database.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- VISA STATUSES (configurable)
-- ============================================================
CREATE TABLE IF NOT EXISTS visa_statuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#6b7280',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO visa_statuses (name, color, order_index) VALUES
  ('Draft', '#6b7280', 0),
  ('Waiting Documents', '#f59e0b', 1),
  ('Documents Complete', '#3b82f6', 2),
  ('Appointment Scheduled', '#8b5cf6', 3),
  ('Submitted', '#06b6d4', 4),
  ('Under Review', '#f97316', 5),
  ('Approved', '#10b981', 6),
  ('Rejected', '#ef4444', 7),
  ('Passport Returned', '#84cc16', 8)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- CHECKLIST TEMPLATES (configurable)
-- ============================================================
CREATE TABLE IF NOT EXISTS checklist_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO checklist_templates (name, order_index) VALUES
  ('Passport Received', 0),
  ('Passport Valid', 1),
  ('Visa Form Completed', 2),
  ('Flight Reservation Received', 3),
  ('Hotel Booking Received', 4),
  ('Insurance Uploaded', 5),
  ('Financial Documents Verified', 6),
  ('Biometrics Completed', 7),
  ('Embassy Appointment Booked', 8),
  ('Visa Submitted', 9),
  ('Passport Returned', 10)
ON CONFLICT DO NOTHING;

-- ============================================================
-- APPLICANTS
-- ============================================================
CREATE TABLE IF NOT EXISTS applicants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Personal Information
  full_name TEXT NOT NULL,
  nationality TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth DATE,
  place_of_birth TEXT,
  marital_status TEXT CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed', 'separated')),
  occupation TEXT,
  employer TEXT,
  phone TEXT,
  email TEXT,
  home_address TEXT,
  -- Passport Details
  passport_number TEXT,
  passport_issue_date DATE,
  passport_expiry_date DATE,
  passport_issuing_country TEXT,
  -- Travel Information
  destination_country TEXT NOT NULL,
  entry_country TEXT,
  purpose_of_travel TEXT,
  arrival_date DATE,
  departure_date DATE,
  number_of_entries TEXT,
  duration_of_stay INTEGER,
  -- Financial Information
  sponsor_name TEXT,
  sponsor_relationship TEXT,
  sponsor_phone TEXT,
  sponsor_address TEXT,
  -- Accommodation
  hotel_name TEXT,
  hotel_address TEXT,
  -- Insurance
  insurance_company TEXT,
  insurance_number TEXT,
  -- Status & Assignment
  status_id UUID REFERENCES visa_statuses(id),
  assigned_employee TEXT,
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- APPLICANT DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS applicant_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  -- e.g. 'passport_scan', 'bank_statement', 'salary_certificate',
  -- 'hotel_booking', 'flight_reservation', 'insurance_certificate',
  -- 'national_id', 'personal_photo', 'visa_application_form',
  -- 'invitation_letter', 'additional'
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- APPLICANT CHECKLISTS (per-applicant instances)
-- ============================================================
CREATE TABLE IF NOT EXISTS applicant_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES checklist_templates(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_by TEXT,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (applicant_id, template_id)
);

-- ============================================================
-- APPLICANT NOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS applicant_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- APPLICANT ACTIVITY LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS applicant_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  -- e.g. 'applicant_created', 'applicant_updated', 'checklist_updated',
  -- 'status_changed', 'file_uploaded', 'file_deleted', 'note_added'
  description TEXT NOT NULL,
  performed_by TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SETTINGS (generic key/value store)
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_applicants_status ON applicants(status_id);
CREATE INDEX IF NOT EXISTS idx_applicants_destination ON applicants(destination_country);
CREATE INDEX IF NOT EXISTS idx_applicants_created_at ON applicants(created_at);
CREATE INDEX IF NOT EXISTS idx_applicants_full_name ON applicants(full_name);
CREATE INDEX IF NOT EXISTS idx_applicant_docs_applicant ON applicant_documents(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applicant_docs_type ON applicant_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_applicant_checklists_applicant ON applicant_checklists(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applicant_notes_applicant ON applicant_notes(applicant_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_applicant ON applicant_activity_logs(applicant_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON applicant_activity_logs(created_at);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
-- Enable RLS on all tables
ALTER TABLE visa_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicant_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicant_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicant_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicant_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- For service role (server-side), allow all operations
-- For anon/authenticated, restrict as needed
-- Since this app uses a single admin password, we use service_role key server-side
-- and anon key for read-only if needed. The policies below allow all for service_role.

-- Allow all for anon role (server-side uses publishable key which maps to anon)
CREATE POLICY "anon_all" ON visa_statuses FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON checklist_templates FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON applicants FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON applicant_documents FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON applicant_checklists FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON applicant_notes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON applicant_activity_logs FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON settings FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_applicants_updated_at BEFORE UPDATE ON applicants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_templates_updated_at BEFORE UPDATE ON checklist_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applicant_checklists_updated_at BEFORE UPDATE ON applicant_checklists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visa_statuses_updated_at BEFORE UPDATE ON visa_statuses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- STORAGE BUCKETS (run separately if needed)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('applicant-documents', 'applicant-documents', false);
