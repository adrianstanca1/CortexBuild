-- ============================================================================
-- CREATE PUBLIC LOGIN FUNCTION (SIMPLIFIED VERSION)
-- ============================================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.authenticate_user(TEXT, TEXT);

-- Create a simpler function that returns JSONB
CREATE OR REPLACE FUNCTION public.authenticate_user(
    p_email TEXT,
    p_password_hash TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user JSONB;
BEGIN
    SELECT jsonb_build_object(
        'id', u.id,
        'email', u.email,
        'name', u.name,
        'role', u.role,
        'company_id', u.company_id,
        'status', COALESCE(u.status, 'active'),
        'created_at', u.created_at
    )
    INTO v_user
    FROM users u
    WHERE u.email = LOWER(p_email)
    AND u.password = p_password_hash
    LIMIT 1;
    
    RETURN v_user;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.authenticate_user(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.authenticate_user(TEXT, TEXT) TO authenticated;

-- Test the function
SELECT public.authenticate_user(
    'adrian.stanca1@gmail.com',
    'a3a2754f94b4f8c1ca8d29290bc37ba90cedf0e13a9e702a829740835e5ed564'
);

