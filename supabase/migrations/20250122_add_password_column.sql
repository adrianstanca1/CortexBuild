-- ============================================================================
-- ADD PASSWORD COLUMN TO USERS TABLE
-- ============================================================================
-- This migration adds a password column to the users table for custom authentication
-- ============================================================================

-- Add password column (nullable initially to allow existing users)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(64);

-- Add comment
COMMENT ON COLUMN users.password IS 'SHA-256 hashed password (64 characters)';

-- Update existing users with hashed passwords
-- Super Admin: adrian.stanca1@gmail.com / parola123
UPDATE users 
SET password = 'a3a2754f94b4f8c1ca8d29290bc37ba90cedf0e13a9e702a829740835e5ed564'
WHERE email = 'adrian.stanca1@gmail.com';

-- Company Admin: adrian@ascladdingltd.co.uk / lolozania1
UPDATE users 
SET password = '33e26fe111a4aa7aa706b14047a3a5d68e0a52184e02415293521f309798d5f7'
WHERE email = 'adrian@ascladdingltd.co.uk';

-- Verify the updates
SELECT 
    email, 
    name, 
    role,
    CASE 
        WHEN password IS NULL THEN '❌ NULL'
        WHEN password = '' THEN '❌ EMPTY'
        WHEN LENGTH(password) = 64 THEN '✅ SHA-256 (64 chars)'
        ELSE '⚠️ Other (' || LENGTH(password) || ' chars)'
    END as password_status
FROM users
ORDER BY created_at;

