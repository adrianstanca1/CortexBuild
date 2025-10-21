-- Insert Test User for Login
-- Run this in Supabase SQL Editor

-- Delete existing test user if exists
DELETE FROM users WHERE email = 'super@admin.com';

-- Insert test user
-- Email: super@admin.com
-- Password: admin123
-- Password hash generated with: bcrypt.hashSync('admin123', 10)
INSERT INTO users (email, password_hash, name, role)
VALUES (
    'super@admin.com',
    '$2b$10$8I9oTo5AMMpX9qBhgNFQtO2oit9WAN/DKacElesviT972b3MCQgW.',
    'Super Admin',
    'super_admin'
);

-- Verify user was created
SELECT id, email, name, role, created_at FROM users WHERE email = 'super@admin.com';

