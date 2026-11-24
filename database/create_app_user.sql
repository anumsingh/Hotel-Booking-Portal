-- ============================================================
-- Least-Privilege Application User Script
-- Database: hotel_booking_db
-- ============================================================

-- 1. Create dedicated application user (restricted to localhost)
CREATE USER IF NOT EXISTS 'hotel_app_user'@'localhost' IDENTIFIED BY 'HotelSecurePass2026!';

-- 2. Grant strictly required DML operations (no DDL, no administrative privileges)
GRANT SELECT, INSERT, UPDATE, DELETE ON hotel_booking_db.* TO 'hotel_app_user'@'localhost';

-- 3. Apply privilege changes
FLUSH PRIVILEGES;

-- Note:
-- Update application.properties or environment variables in production:
-- DB_USERNAME=hotel_app_user
-- DB_PASSWORD=HotelSecurePass2026!
