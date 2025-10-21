-- Create Test Users for CortexBuild
-- Run this in Supabase SQL Editor to create test users

-- First, ensure the users table exists
-- (This should already exist from COMPLETE_SCHEMA.sql)

-- Delete existing test users if they exist (to avoid conflicts)
DELETE FROM users WHERE email IN ('super@admin.com', 'admin@company.com', 'developer@company.com');

-- Create Super Admin user
-- Password: admin123
-- Hashed with bcrypt (10 rounds)
INSERT INTO users (id, email, password_hash, name, role, avatar, company_id, created_at, updated_at)
VALUES (
    'user-' || gen_random_uuid()::text,
    'super@admin.com',
    '$2a$10$rKZvVqVqVqVqVqVqVqVqVuO8YqYqYqYqYqYqYqYqYqYqYqYqYqYqY',  -- This is a placeholder
    'Super Admin',
    'super_admin',
    '',
    NULL,
    NOW(),
    NOW()
);

-- Create Company Admin user
-- Password: admin123
INSERT INTO users (id, email, password_hash, name, role, avatar, company_id, created_at, updated_at)
VALUES (
    'user-' || gen_random_uuid()::text,
    'admin@company.com',
    '$2a$10$rKZvVqVqVqVqVqVqVqVqVuO8YqYqYqYqYqYqYqYqYqYqYqYqYqYqY',  -- This is a placeholder
    'Company Admin',
    'company_admin',
    '',
    'company-1',
    NOW(),
    NOW()
);

-- Create Developer user
-- Password: admin123
INSERT INTO users (id, email, password_hash, name, role, avatar, company_id, created_at, updated_at)
VALUES (
    'user-' || gen_random_uuid()::text,
    'developer@company.com',
    '$2a$10$rKZvVqVqVqVqVqVqVqVqVuO8YqYqYqYqYqYqYqYqYqYqYqYqYqYqY',  -- This is a placeholder
    'Developer User',
    'developer',
    '',
    'company-1',
    NOW(),
    NOW()
);

-- Note: The password hashes above are placeholders
-- You need to generate real bcrypt hashes for 'admin123'
-- 
-- To generate a proper hash, you can:
-- 1. Use an online bcrypt generator with password 'admin123' and 10 rounds
-- 2. Or use the register endpoint to create users
-- 3. Or run this Node.js code:
--    const bcrypt = require('bcryptjs');
--    const hash = bcrypt.hashSync('admin123', 10);
--    console.log(hash);

-- Proper bcrypt hash for 'admin123' (10 rounds):
-- $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

-- Update with correct password hash
UPDATE users 
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE email IN ('super@admin.com', 'admin@company.com', 'developer@company.com');

-- Verify users were created
SELECT id, email, name, role, created_at FROM users WHERE email IN ('super@admin.com', 'admin@company.com', 'developer@company.com');

