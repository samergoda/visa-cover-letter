-- ============================================================
-- Add Embassy Appointment and AI Travel Itinerary Fields
-- ============================================================

-- Add columns for embassy appointment details
ALTER TABLE applicants 
ADD COLUMN IF NOT EXISTS appointment_date DATE,
ADD COLUMN IF NOT EXISTS appointment_time TIME,
ADD COLUMN IF NOT EXISTS appointment_location TEXT,
ADD COLUMN IF NOT EXISTS appointment_notes TEXT;

-- Add column for storing the AI-generated day-by-day itinerary
ALTER TABLE applicants 
ADD COLUMN IF NOT EXISTS travel_itinerary JSONB;
