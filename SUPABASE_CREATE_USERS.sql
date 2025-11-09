-- Manual SQL to execute in Supabase SQL Editor
-- Go to: https://app.supabase.com/project/zpbuvuxpfemldsknerew/sql/new

-- Step 1: Create company (if it doesn't exist)
INSERT INTO companies (id, name, domain, status, subscription_plan, subscription_status, contact_email)
VALUES (
    'asc-cladding-ltd',
    'ASC Cladding Ltd',
    'ascladdingltd.co.uk',
    'active',
    'professional',
    'active',
    'adrian@ascladdingltd.co.uk'
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create developer user
-- Note: Using gen_random_uuid() for ID since we can't use custom IDs with auth.users FK
-- Password: parola123
-- Hash: $2b$10$evsbonAxKmjp1E.GIWwQnO0prkW7JUBOpu4FMTdH.LEYCd3caAYO.

-- First, create in auth.users (Supabase Auth table)
DO $$
DECLARE
    dev_user_id uuid;
BEGIN
    -- Generate UUID
    dev_user_id := gen_random_uuid();
    
    -- Insert into auth.users
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (
        dev_user_id,
        'dev@constructco.com',
        crypt('parola123', gen_salt('bf')),  -- bcrypt hash
        now(),
        now(),
        now()
    );
    
    -- Insert into public.users
    INSERT INTO users (id, email, name, role, password_hash, company_id, created_at, updated_at)
    VALUES (
        dev_user_id,
        'dev@constructco.com',
        'Dev User',
        'developer',
        '$2b$10$evsbonAxKmjp1E.GIWwQnO0prkW7JUBOpu4FMTdH.LEYCd3caAYO.',
        '00000000-0000-0000-0000-000000000001',
        now(),
        now()
    )
    ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        updated_at = now();
        
    RAISE NOTICE 'Developer user created: dev@constructco.com';
END $$;

-- Step 3: Create company admin user
-- Password: Lolozania1
-- Hash: $2b$10$X0qH9z8qQzYE5VPXOqB4ZuGdKH3sxLZ9vFJ4YzQyKdRxJfXj9xXYW

DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Generate UUID
    admin_user_id := gen_random_uuid();
    
    -- Insert into auth.users
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (
        admin_user_id,
        'adrian@ascladdingltd.co.uk',
        crypt('Lolozania1', gen_salt('bf')),  -- bcrypt hash
        now(),
        now(),
        now()
    );
    
    -- Insert into public.users
    INSERT INTO users (id, email, name, role, password_hash, company_id, created_at, updated_at)
    VALUES (
        admin_user_id,
        'adrian@ascladdingltd.co.uk',
        'Adrian Stanca',
        'company_admin',
        '$2b$10$X0qH9z8qQzYE5VPXOqB4ZuGdKH3sxLZ9vFJ4YzQyKdRxJfXj9xXYW',
        'asc-cladding-ltd',
        now(),
        now()
    )
    ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        company_id = EXCLUDED.company_id,
        updated_at = now();
        
    RAISE NOTICE 'Company admin user created: adrian@ascladdingltd.co.uk';
END $$;

-- Verify users were created
SELECT id, email, name, role, company_id, created_at 
FROM users 
WHERE email IN ('dev@constructco.com', 'adrian@ascladdingltd.co.uk')
ORDER BY email;
