-- =====================================================
-- FINAL FIX FOR YOUR SPECIFIC USERS
-- This will fix RLS and create profiles for both users
-- =====================================================

-- =====================================================
-- PART 1: FIX RLS POLICIES ON PROFILES
-- =====================================================

-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
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

-- Create new simple policies
CREATE POLICY "enable_read_own_profile"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "enable_update_own_profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "enable_insert_own_profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "enable_read_all_authenticated"
ON profiles FOR SELECT
TO authenticated
USING (true);

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

SELECT '✅ Step 1: RLS policies fixed on profiles table' as status;

-- =====================================================
-- PART 2: FIX RLS POLICIES ON COMPANIES
-- =====================================================

-- Disable RLS on companies
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
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

-- Create simple policies
CREATE POLICY "enable_read_companies"
ON companies FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "enable_insert_companies"
ON companies FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "enable_update_companies"
ON companies FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Re-enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

SELECT '✅ Step 2: RLS policies fixed on companies table' as status;

-- =====================================================
-- PART 3: CREATE AUTO-PROFILE TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    'project_manager',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

SELECT '✅ Step 3: Auto-create profile trigger installed' as status;

-- =====================================================
-- PART 4: CREATE PROFILES FOR YOUR EXISTING USERS
-- =====================================================

-- Create profiles for ALL existing users that don't have profiles
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

SELECT '✅ Step 4: Profiles created for all existing users' as status;

-- =====================================================
-- PART 5: VERIFICATION
-- =====================================================

-- Show all users and their profiles
SELECT 
  '👥 Users and Profiles' as info,
  u.id as user_id,
  u.email as user_email,
  u.created_at as user_created,
  p.id as profile_id,
  p.name as profile_name,
  p.role as profile_role,
  CASE 
    WHEN p.id IS NOT NULL THEN '✅ Has Profile'
    ELSE '❌ Missing Profile'
  END as profile_status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- Count profiles
SELECT 
  '📊 Profile Statistics' as info,
  COUNT(*) as total_profiles
FROM profiles;

-- Show all profiles
SELECT 
  '📋 All Profiles Details' as info,
  id,
  email,
  name,
  role,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- Check RLS policies on profiles
SELECT 
  '🔒 RLS Policies on Profiles' as info,
  policyname,
  cmd as command,
  qual as using_expression
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Check RLS policies on companies
SELECT 
  '🔒 RLS Policies on Companies' as info,
  policyname,
  cmd as command
FROM pg_policies 
WHERE tablename = 'companies'
ORDER BY policyname;

-- Check trigger
SELECT 
  '⚡ Triggers' as info,
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- =====================================================
-- FINAL SUCCESS MESSAGE
-- =====================================================

SELECT '🎉 SETUP COMPLETE! All RLS policies fixed and profiles created for both users!' as status;

-- Show what was created
SELECT 
  '✅ Summary' as info,
  'User ID: ' || id || ' | Email: ' || email || ' | Name: ' || name as details
FROM profiles
ORDER BY created_at DESC;
