-- filepath: c:\Users\nguye\OneDrive - The University of Technology\PBL5\benxeso-backend\src\main\resources\db\migration\V1.3__update_bus_images_table.sql
-- Update bus_images table to use image_url instead of image_data

-- First, add the new column
ALTER TABLE bus_images ADD COLUMN image_url VARCHAR(255) NOT NULL DEFAULT '';

-- Drop the image_data column (as it contains large binary data we don't need anymore)
ALTER TABLE bus_images DROP COLUMN image_data;