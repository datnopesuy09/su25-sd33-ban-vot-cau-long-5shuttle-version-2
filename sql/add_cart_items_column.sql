-- Migration: add cart items JSON column for bulk order inquiries
-- Run this against your MySQL database once.
-- Safe guard: only add if not exists (MySQL 8+ supports IF NOT EXISTS for ADD COLUMN)
ALTER TABLE BulkOrderInquiry
    ADD COLUMN IF NOT EXISTS CartItemsJson TEXT NULL AFTER ItemCount;

-- If your MySQL version < 8.0 that doesn't support IF NOT EXISTS, comment the above and uncomment below:
-- SET @exists := (
--   SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
--   WHERE TABLE_NAME='BulkOrderInquiry' AND COLUMN_NAME='CartItemsJson' AND TABLE_SCHEMA=DATABASE()
-- );
-- SET @sql := IF(@exists = 0, 'ALTER TABLE BulkOrderInquiry ADD COLUMN CartItemsJson TEXT NULL AFTER ItemCount;', 'SELECT 1');
-- PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
