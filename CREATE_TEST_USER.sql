-- Create Test User in Supabase

-- This SQL will create a test user that you can use to login

-- Step 1: First, register via the app UI or create user manually in Supabase Auth
-- Go to: https://supabase.com/dashboard/project/jkpeuejmhlccnpyorxfz/auth/users
-- Click "Add user" → "Create new user"
-- Email: test@constructai.com
-- Password: Test123!@#
-- Auto Confirm User: YES (check this box)

-- Step 2: After creating the auth user, create a profile
-- Replace 'USER_ID_FROM_AUTH_USERS' with the actual ID from step 1

INSERT INTO profiles (id, email, name, role, company_id, created_at)
VALUES (
  'USER_ID_FROM_AUTH_USERS', -- Replace with actual user ID
  'test@constructai.com',
  'Test User',
  'project_manager',
  NULL,
  NOW()
);

-- OR: If you already have a user in auth.users without a profile:
-- Find users without profiles:
SELECT
  u.id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- Create profile for existing user (replace the ID):
INSERT INTO profiles (id, email, name, role, created_at)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'User'),
  'project_manager',
  NOW()
FROM auth.users
WHERE id = 'USER_ID_HERE'
ON CONFLICT (id) DO NOTHING;
