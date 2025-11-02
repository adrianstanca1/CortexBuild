-- ============================================================================
-- CREATE PUBLIC LOGIN FUNCTION
-- ============================================================================
-- This function allows public login without RLS restrictions
-- ============================================================================

-- Create a function to authenticate users
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
    status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER -- Run with elevated privileges to bypass RLS
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.name,
        u.role,
        u.company_id,
        COALESCE(u.status, 'active') as status,
        u.created_at
    FROM users u
    WHERE u.email = LOWER(p_email)
    AND u.password = p_password_hash
    LIMIT 1;
END;
$$;

-- Grant execute permission to anonymous users (for login)
GRANT EXECUTE ON FUNCTION public.authenticate_user(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.authenticate_user(TEXT, TEXT) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.authenticate_user IS 'Authenticates a user by email and password hash, bypassing RLS';

