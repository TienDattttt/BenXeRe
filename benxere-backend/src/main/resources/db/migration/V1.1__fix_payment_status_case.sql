-- Fix payment status values to match enum case
UPDATE payments 
SET payment_status = UPPER(payment_status)
WHERE payment_status != UPPER(payment_status);

-- Specifically fix 'Pending' to 'PENDING'
UPDATE payments 
SET payment_status = 'PENDING'
WHERE payment_status = 'Pending';