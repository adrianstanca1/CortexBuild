-- ============================================================================
-- TEMPORARILY DISABLE RLS ON USERS TABLE FOR LOGIN
-- ============================================================================
-- This is a simple solution: disable RLS on users table
-- The frontend will handle authentication logic
-- ============================================================================

-- Disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'users';

