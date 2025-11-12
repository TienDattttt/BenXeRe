-- Fix payment_method column to properly handle enum values
ALTER TABLE payments MODIFY COLUMN payment_method VARCHAR(20);