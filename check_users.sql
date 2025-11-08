-- Check what users exist in the database
SELECT 
    id,
    email,
    name,
    role,
    company_id,
    status,
    created_at,
    LEFT(password, 20) || '...' as password_preview
FROM users
ORDER BY created_at DESC;

-- Count total users
SELECT COUNT(*) as total_users FROM users;

-- Check specific emails
SELECT 
    email,
    name,
    role,
    status,
    CASE 
        WHEN password IS NULL THEN '❌ NULL'
        WHEN password = '' THEN '❌ EMPTY'
        WHEN LENGTH(password) = 64 THEN '✅ SHA-256 (64 chars)'
        ELSE '⚠️ Other (' || LENGTH(password) || ' chars)'
    END as password_status
FROM users
WHERE email IN (
    'adrian.stanca1@gmail.com',
    'adrian.stanca1@icloud.com',
    'adrian@ascladdingltd.co.uk'
);

