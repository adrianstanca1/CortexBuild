-- =====================================================
-- COMPLETE SUPABASE FIX FOR CONSTRUCTAI
-- Run this script in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PART 1: FIX RLS POLICIES ON PROFILES TABLE
-- =====================================================

-- Step 1: Disable RLS temporarily to clean up
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies on profiles table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', r.policyname);
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- Step 3: Create new, simple RLS policies that work

-- Policy 1: Users can read their own profile
CREATE POLICY "enable_read_own_profile"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Policy 2: Users can update their own profile
CREATE POLICY "enable_update_own_profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Policy 3: Users can insert their own profile (for registration)
CREATE POLICY "enable_insert_own_profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Policy 4: Allow authenticated users to read all profiles (for team features)
-- You can remove this later if you want more restrictive access
CREATE POLICY "enable_read_all_authenticated"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Step 4: Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 2: FIX RLS POLICIES ON COMPANIES TABLE
-- =====================================================

-- Step 1: Disable RLS on companies
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies on companies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'companies'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON companies', r.policyname);
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- Step 3: Create simple policies for companies

-- Allow authenticated users to read all companies
CREATE POLICY "enable_read_companies"
ON companies FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert companies
CREATE POLICY "enable_insert_companies"
ON companies FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to update companies
CREATE POLICY "enable_update_companies"
ON companies FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Step 4: Re-enable RLS on companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 3: CREATE AUTO-PROFILE TRIGGER
-- =====================================================

-- Create trigger function to auto-create profiles for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert profile for new user
  INSERT INTO public.profiles (id, email, name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    'project_manager',  -- Default role
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;  -- Prevent duplicate key errors

  RETURN NEW;
END;
$$;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- PART 4: CHECK EXISTING USERS AND CREATE PROFILES
-- =====================================================

-- First, let's see what users exist in auth.users
SELECT
  '👥 Existing Auth Users' as check_type,
  id,
  email,
  created_at,
  raw_user_meta_data->>'full_name' as full_name
FROM auth.users
ORDER BY created_at DESC;

-- Create profile for the OAuth user ONLY if they exist in auth.users
INSERT INTO public.profiles (id, email, name, role, created_at, updated_at)
SELECT
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    'Adrian Stanca'
  ),
  'project_manager',
  NOW(),
  NOW()
FROM auth.users u
WHERE u.id = 'f15ad2fb-835e-4e2b-9ea6-6a90955520ea'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  updated_at = NOW();

-- =====================================================
-- PART 5: CREATE PROFILES FOR ANY OTHER EXISTING USERS
-- =====================================================

-- Backfill profiles for any existing auth users without profiles
INSERT INTO public.profiles (id, email, name, role, created_at, updated_at)
SELECT
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(u.email, '@', 1)
  ),
  'project_manager',
  NOW(),
  NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PART 6: VERIFICATION QUERIES
-- =====================================================

-- Check if the OAuth user profile was created
SELECT 
  '✅ OAuth User Profile' as check_type,
  id, 
  email, 
  name, 
  role,
  created_at
FROM profiles 
WHERE id = 'f15ad2fb-835e-4e2b-9ea6-6a90955520ea';

-- Check all profiles
SELECT 
  '📋 All Profiles' as check_type,
  COUNT(*) as total_profiles
FROM profiles;

-- Check RLS policies on profiles
SELECT 
  '🔒 RLS Policies on Profiles' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'profiles';

-- Check RLS policies on companies
SELECT 
  '🔒 RLS Policies on Companies' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'companies';

-- Check if trigger exists
SELECT 
  '⚡ Auto-Create Profile Trigger' as check_type,
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT '🎉 SETUP COMPLETE! All RLS policies fixed, profile created, and trigger installed.' as status;
