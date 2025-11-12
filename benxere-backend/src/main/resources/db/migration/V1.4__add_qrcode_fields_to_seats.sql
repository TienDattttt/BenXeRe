-- Add QR code fields to seats table
ALTER TABLE seats ADD COLUMN qr_code_data TEXT;
ALTER TABLE seats ADD COLUMN qr_code_scanned_count INT DEFAULT 0;
ALTER TABLE seats ADD COLUMN last_qr_scan_time DATETIME;