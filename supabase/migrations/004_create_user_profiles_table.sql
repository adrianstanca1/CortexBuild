-- Create user_profiles table for storing extended user information
-- This table extends the default auth.users table with application-specific data

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    avatar TEXT,
    role VARCHAR(50) NOT NULL DEFAULT 'developer',
    company_id UUID,

    -- Preferences
    theme VARCHAR(10) NOT NULL DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
    email_notifications BOOLEAN NOT NULL DEFAULT true,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT false,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create updated_at trigger to automatically update timestamp
CREATE OR REPLACE FUNCTION update_user_profiles_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_update_timestamp
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_user_profiles_timestamp();

-- Create a function to get user profile with preferences
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
RETURNS TABLE (
    id UUID,
    email VARCHAR,
    name VARCHAR,
    bio TEXT,
    avatar TEXT,
    role VARCHAR,
    company_id UUID,
    theme VARCHAR,
    email_notifications BOOLEAN,
    two_factor_enabled BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        up.id,
        up.email,
        up.name,
        up.bio,
        up.avatar,
        up.role,
        up.company_id,
        up.theme,
        up.email_notifications,
        up.two_factor_enabled,
        up.created_at,
        up.updated_at,
        up.last_login
    FROM user_profiles up
    WHERE up.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS) for security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON user_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Create index for performance on common queries
CREATE INDEX idx_user_profiles_company_role ON user_profiles(company_id, role);
CREATE INDEX idx_user_profiles_updated_at ON user_profiles(updated_at DESC);
