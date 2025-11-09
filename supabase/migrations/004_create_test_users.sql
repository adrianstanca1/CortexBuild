-- Migration: Create Test Users for Development
-- Purpose: Add developer and company admin test accounts
-- Date: 2025-01-09

-- Note: Password hashes generated with bcrypt (cost factor 10)
-- dev@constructco.com password: parola123
-- adrian@ascladdingltd.co.uk password: Lolozania1

-- First, ensure we have a company for the company admin
-- Create a test company if it doesn't exist
INSERT INTO companies (id, name, created_at)
VALUES (
  'comp-test-1',
  'ASC Cladding Ltd',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Insert Developer User
-- Email: dev@constructco.com
-- Password: parola123
-- Hash: $2b$10$evsbonAxKmjp1E.GIWwQnO0prkW7JUBOpu4FMTdH.LEYCd3caAYO.
INSERT INTO users (
  id,
  email,
  name,
  first_name,
  last_name,
  role,
  password_hash,
  company_id,
  created_at,
  updated_at
)
VALUES (
  'user-5',
  'dev@constructco.com',
  'Dev User',
  'Dev',
  'User',
  'developer',
  '$2b$10$evsbonAxKmjp1E.GIWwQnO0prkW7JUBOpu4FMTdH.LEYCd3caAYO.',
  'comp_platform_admin',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Insert Company Admin User
-- Email: adrian@ascladdingltd.co.uk
-- Password: Lolozania1
-- Hash: $2b$10$X0qH9z8qQzYE5VPXOqB4ZuGdKH3sxLZ9vFJ4YzQyKdRxJfXj9xXYW
INSERT INTO users (
  id,
  email,
  name,
  first_name,
  last_name,
  role,
  password_hash,
  company_id,
  created_at,
  updated_at
)
VALUES (
  'user-4',
  'adrian@ascladdingltd.co.uk',
  'Adrian Stanca',
  'Adrian',
  'Stanca',
  'company_admin',
  '$2b$10$X0qH9z8qQzYE5VPXOqB4ZuGdKH3sxLZ9vFJ4YzQyKdRxJfXj9xXYW',
  'comp-test-1',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  company_id = EXCLUDED.company_id,
  updated_at = NOW();

-- Grant necessary permissions
-- The RLS policies should handle this automatically, but let's ensure the users can access their data

-- Log the creation
DO $$
BEGIN
  RAISE NOTICE 'Test users created successfully:';
  RAISE NOTICE '  - dev@constructco.com (developer) - Password: parola123';
  RAISE NOTICE '  - adrian@ascladdingltd.co.uk (company_admin) - Password: Lolozania1';
  RAISE NOTICE 'Company created: ASC Cladding Ltd (comp-test-1)';
END $$;
