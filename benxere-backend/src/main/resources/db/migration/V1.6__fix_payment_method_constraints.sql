-- Ensure payment_method column can handle all enum values
-- First, modify the column to be a standard VARCHAR without constraints
ALTER TABLE payments MODIFY COLUMN payment_method VARCHAR(20);

-- If there's a check constraint, drop it and recreate with all valid values
-- MySQL doesn't support IF EXISTS for constraints, so we'll use a safe approach
ALTER TABLE payments MODIFY COLUMN payment_method VARCHAR(20) 
COMMENT 'Valid values: CASH, ZALOPAY, MOMO, VNPAY';