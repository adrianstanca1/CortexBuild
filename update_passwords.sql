-- ============================================================================
-- UPDATE EXISTING USER PASSWORDS TO SHA-256 HASHED FORMAT
-- ============================================================================
-- This script updates the passwords for existing users to use SHA-256 hashing
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Update Super Admin password
-- Email: adrian.stanca1@gmail.com
-- Password: parola123
-- SHA-256 Hash: a3a2754f94b4f8c1ca8d29290bc37ba90cedf0e13a9e702a829740835e5ed564
UPDATE users 
SET password = 'a3a2754f94b4f8c1ca8d29290bc37ba90cedf0e13a9e702a829740835e5ed564'
WHERE email = 'adrian.stanca1@gmail.com';

-- Update Company Admin password
-- Email: adrian@ascladdingltd.co.uk
-- Password: lolozania1
-- SHA-256 Hash: 33e26fe111a4aa7aa706b14047a3a5d68e0a52184e02415293521f309798d5f7
UPDATE users
SET password = '33e26fe111a4aa7aa706b14047a3a5d68e0a52184e02415293521f309798d5f7'
WHERE email = 'adrian@ascladdingltd.co.uk';

-- Verify the updates
SELECT email, role,
       CASE
           WHEN password = 'a3a2754f94b4f8c1ca8d29290bc37ba90cedf0e13a9e702a829740835e5ed564' THEN '✅ Correct (parola123)'
           WHEN password = '33e26fe111a4aa7aa706b14047a3a5d68e0a52184e02415293521f309798d5f7' THEN '✅ Correct (lolozania1)'
           ELSE '❌ Incorrect hash'
       END as password_status
FROM users
WHERE email IN ('adrian.stanca1@gmail.com', 'adrian@ascladdingltd.co.uk');

