-- Migration script to add GhiChu column to ThanhToan table
-- Run this script on existing database to add the missing column

USE 5SHUTTLE;

-- Add GhiChu column to ThanhToan table
ALTER TABLE ThanhToan 
ADD COLUMN GhiChu NVARCHAR(500) AFTER PhuongThucThanhToan;

-- Update existing records to have null for GhiChu (default behavior)
-- No need to update existing records as they will automatically have NULL

-- Verify the column was added
DESC ThanhToan;
