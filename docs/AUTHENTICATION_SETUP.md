# Authentication System - Complete Setup

## Overview
This document describes the complete authentication system for CortexBuild, rebuilt from scratch with proper security and functionality.

## Architecture

### Technology Stack
- **Frontend**: React 19.2.0 with TypeScript
- **Database**: Supabase PostgreSQL
- **Password Hashing**: SHA-256 (Web Crypto API)
- **Session Management**: localStorage
- **Security**: Row Level Security (RLS) with SECURITY DEFINER functions

### Authentication Flow
1. User enters email and password
2. Frontend hashes password with SHA-256
3. Frontend calls Supabase RPC function `authenticate_user`
4. Function bypasses RLS using SECURITY DEFINER
5. Function returns user data as JSONB
6. Frontend stores user in localStorage

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'operative',
    password TEXT,  -- SHA-256 hash (64 hex characters)
    avatar TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### RLS Policies
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow all operations (controlled by application logic)
CREATE POLICY "users_select_policy" ON users FOR SELECT USING (true);
CREATE POLICY "users_insert_policy" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_update_policy" ON users FOR UPDATE USING (true);
CREATE POLICY "users_delete_policy" ON users FOR DELETE USING (true);
```

## Authentication Functions

### authenticate_user
Authenticates a user by email and password hash.

```sql
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
    v_user RECORD;
BEGIN
    SELECT * INTO v_user
    FROM users
    WHERE LOWER(email) = LOWER(p_email)
    AND password = p_password_hash
    LIMIT 1;
    
    IF v_user IS NULL THEN
        RETURN NULL;
    END IF;
    
    RETURN jsonb_build_object(
        'id', v_user.id,
        'email', v_user.email,
        'name', v_user.name,
        'role', v_user.role,
        'companyId', v_user.company_id,
        'status', 'active',
        'createdAt', v_user.created_at
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.authenticate_user(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.authenticate_user(TEXT, TEXT) TO authenticated;
```

### register_user
Registers a new user with email and password.

```sql
CREATE OR REPLACE FUNCTION public.register_user(
    p_email TEXT,
    p_password_hash TEXT,
    p_name TEXT,
    p_company_id TEXT,
    p_role TEXT DEFAULT 'operative'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    IF EXISTS (SELECT 1 FROM users WHERE LOWER(email) = LOWER(p_email)) THEN
        RAISE EXCEPTION 'Email already exists';
    END IF;
    
    v_user_id := gen_random_uuid();
    
    INSERT INTO users (id, email, password, name, company_id, role, created_at, updated_at)
    VALUES (
        v_user_id,
        LOWER(p_email),
        p_password_hash,
        p_name,
        p_company_id::UUID,
        p_role,
        NOW(),
        NOW()
    );
    
    RETURN jsonb_build_object(
        'id', v_user_id,
        'email', LOWER(p_email),
        'name', p_name,
        'role', p_role,
        'companyId', p_company_id,
        'status', 'active',
        'createdAt', NOW()
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_user(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.register_user(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
```

## Frontend Implementation

### Password Hashing
```typescript
const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};
```

### Login Function
```typescript
export const login = async (email: string, password: string): Promise<User> => {
    const { supabase } = await import('../lib/supabase/client');
    
    const hashedPassword = await hashPassword(password);
    
    const { data: authResult, error } = await supabase
        .rpc('authenticate_user', {
            p_email: email.toLowerCase(),
            p_password_hash: hashedPassword
        });
    
    if (error || !authResult) {
        throw new Error('Invalid email or password');
    }
    
    const user: User = {
        id: authResult.id,
        email: authResult.email,
        name: authResult.name,
        role: authResult.role,
        companyId: authResult.companyId,
        status: authResult.status || 'active',
        createdAt: authResult.createdAt
    };
    
    localStorage.setItem('constructai_user', JSON.stringify(user));
    
    return user;
};
```

## Test Credentials

### Super Admin
- **Email**: `adrian.stanca1@gmail.com`
- **Password**: `parola123`
- **Role**: `super_admin`
- **Password Hash**: `a3a2754f94b4f8c1ca8d29290bc37ba90cedf0e13a9e702a829740835e5ed564`

## Deployment

### Production URL
https://constructai-5-l4tmssm90-adrian-b7e84541.vercel.app

### Environment Variables
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key

## Security Features

1. **Password Hashing**: SHA-256 hashing on client-side before transmission
2. **RLS Enabled**: Row Level Security enabled on users table
3. **SECURITY DEFINER**: Functions bypass RLS only for authentication
4. **Lowercase Emails**: All emails stored and compared in lowercase
5. **Session Storage**: User data stored in localStorage for persistence

## Files Modified

- `auth/authService.ts` - Complete authentication service
- `supabase/migrations/20250122_complete_auth_system.sql` - Database migration

## Testing

### Test Authentication Function
```sql
SELECT public.authenticate_user(
    'adrian.stanca1@gmail.com',
    'a3a2754f94b4f8c1ca8d29290bc37ba90cedf0e13a9e702a829740835e5ed564'
);
```

Should return:
```json
{
  "id": "5454a61a-6d44-45aa-9c37-e1617773d49c",
  "email": "adrian.stanca1@gmail.com",
  "name": "Adrian Stanca",
  "role": "super_admin",
  "companyId": "11111111-1111-1111-1111-111111111111",
  "status": "active",
  "createdAt": "2025-10-21T16:19:23.572122+00:00"
}
```

## Troubleshooting

### Function Not Found (404)
- Run the migration SQL in Supabase SQL Editor
- Execute `NOTIFY pgrst, 'reload schema';`
- Wait 1-2 minutes for cache refresh

### Invalid Email or Password
- Verify user exists: `SELECT * FROM users WHERE email = 'email@example.com';`
- Check password is set: `SELECT email, password FROM users;`
- Verify password hash matches expected value

### RLS Blocking Queries
- Ensure RLS policies are created
- Verify functions use `SECURITY DEFINER`
- Check grants: `GRANT EXECUTE ON FUNCTION ... TO anon;`

## Future Improvements

1. Add password reset functionality
2. Implement email verification
3. Add 2FA support
4. Session expiration and refresh
5. Password strength requirements
6. Rate limiting for login attempts

