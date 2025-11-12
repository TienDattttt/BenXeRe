-- Add booked_at column to seats table for tracking booking timeout
ALTER TABLE seats ADD COLUMN booked_at TIMESTAMP NULL;
