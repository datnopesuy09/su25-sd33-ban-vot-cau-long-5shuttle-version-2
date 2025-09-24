-- Migration script: Change UserType column from INT to VARCHAR(255)
-- Run this on your database before using the customer management feature

USE `5SHUTTLE`;

-- Check current column type
DESCRIBE User;

-- Change UserType column from INT to VARCHAR(255)
ALTER TABLE `User` 
MODIFY COLUMN `UserType` VARCHAR(255) NULL;

-- Verify the change
DESCRIBE User;