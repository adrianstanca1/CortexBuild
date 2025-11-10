-- Migration: Add password_hash column to users table
-- Purpose: Enable custom authentication without relying on Supabase Auth
-- Date: 2025-01-09

-- Add password_hash column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_password_hash ON users(password_hash);

-- Comment
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password for custom authentication';

-- Note: This allows us to use custom JWT authentication while still
-- maintaining the company_id isolation for multi-tenancy
