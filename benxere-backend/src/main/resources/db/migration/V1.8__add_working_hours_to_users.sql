-- Add working hours columns to users table
ALTER TABLE users
ADD COLUMN work_start_time TIME NULL,
ADD COLUMN work_end_time TIME NULL;

-- Add comment to explain the purpose of these columns
COMMENT ON COLUMN users.work_start_time IS 'Working hours start time for Customer Care staff';
COMMENT ON COLUMN users.work_end_time IS 'Working hours end time for Customer Care staff'; 