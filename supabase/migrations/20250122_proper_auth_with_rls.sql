-- ============================================================================
-- PROPER AUTHENTICATION WITH RLS ENABLED
-- ============================================================================
-- This migration:
-- 1. Re-enables RLS on users table
-- 2. Creates a proper authentication function
-- 3. Grants proper permissions
-- ============================================================================

-- Step 1: Re-enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop old function if exists
DROP FUNCTION IF EXISTS public.authenticate_user(TEXT, TEXT);

-- Step 3: Create authentication function that returns a single row
CREATE OR REPLACE FUNCTION public.authenticate_user(
    p_email TEXT,
    p_password_hash TEXT
)
RETURNS TABLE (
    id UUID,
    email VARCHAR(255),
    name VARCHAR(255),
    role VARCHAR(50),
    company_id UUID,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.name,
        u.role,
        u.company_id,
        'active'::TEXT as status,
        u.created_at
    FROM users u
    WHERE u.email = LOWER(p_email)
    AND u.password = p_password_hash
    LIMIT 1;
END;
$$;

-- Step 4: Grant execute permissions to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.authenticate_user(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.authenticate_user(TEXT, TEXT) TO authenticated;

-- Step 5: Add comment
COMMENT ON FUNCTION public.authenticate_user IS 'Authenticates user by email and password hash, bypassing RLS with SECURITY DEFINER';

-- Step 6: Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- Step 7: Test the function
SELECT * FROM public.authenticate_user(
    'adrian.stanca1@gmail.com',
    'a3a2754f94b4f8c1ca8d29290bc37ba90cedf0e13a9e702a829740835e5ed564'
);

