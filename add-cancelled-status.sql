-- ============================================================
-- Add "Cancelled" Status to Visa Statuses
-- ============================================================

-- Add the Cancelled status
INSERT INTO visa_statuses (name, color, order_index, is_active)
VALUES ('Cancelled', '#6b7280', 9, true)
ON CONFLICT (name) DO UPDATE
SET color = EXCLUDED.color,
    order_index = EXCLUDED.order_index,
    is_active = EXCLUDED.is_active;

-- Optional: Update the order of existing statuses to make room
-- This ensures proper visual ordering in the dashboard
UPDATE visa_statuses SET order_index = 0 WHERE name = 'Draft';
UPDATE visa_statuses SET order_index = 1 WHERE name = 'Waiting Documents';
UPDATE visa_statuses SET order_index = 2 WHERE name = 'Documents Complete';
UPDATE visa_statuses SET order_index = 3 WHERE name = 'Appointment Scheduled';
UPDATE visa_statuses SET order_index = 4 WHERE name = 'Submitted';
UPDATE visa_statuses SET order_index = 5 WHERE name = 'Under Review';
UPDATE visa_statuses SET order_index = 6 WHERE name = 'Approved';
UPDATE visa_statuses SET order_index = 7 WHERE name = 'Rejected';
UPDATE visa_statuses SET order_index = 8 WHERE name = 'Passport Returned';
UPDATE visa_statuses SET order_index = 9 WHERE name = 'Cancelled';
