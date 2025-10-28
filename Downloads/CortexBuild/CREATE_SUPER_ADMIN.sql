-- =====================================================
-- CREATE SUPER ADMIN AND DASHBOARD
-- For user: adrian.stanca1@gmail.com
-- =====================================================

-- =====================================================
-- PART 1: CREATE COMPANIES TABLE (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    industry TEXT,
    size TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'companies'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON companies', r.policyname);
    END LOOP;
END $$;

-- Create simple policies for companies
CREATE POLICY "enable_read_companies" ON companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "enable_insert_companies" ON companies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "enable_update_companies" ON companies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "enable_delete_companies" ON companies FOR DELETE TO authenticated USING (true);

-- =====================================================
-- PART 2: CREATE PLATFORM COMPANY (for super admin)
-- =====================================================

INSERT INTO companies (id, name, industry, size)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'ConstructAI Platform',
    'Technology',
    'Platform'
)
ON CONFLICT (id) DO UPDATE SET
    name = 'ConstructAI Platform',
    industry = 'Technology',
    size = 'Platform';

-- =====================================================
-- PART 3: UPDATE PROFILES TABLE STRUCTURE
-- =====================================================

-- Add company_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'company_id'
    ) THEN
        ALTER TABLE profiles ADD COLUMN company_id UUID REFERENCES companies(id);
    END IF;
END $$;

-- =====================================================
-- PART 4: CREATE SUPER ADMIN PROFILE
-- =====================================================

-- Update or create profile for super admin
INSERT INTO profiles (id, email, name, role, company_id, created_at, updated_at)
SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', 'Adrian Stanca'),
    'super_admin',
    '00000000-0000-0000-0000-000000000000',
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'adrian.stanca1@gmail.com'
ON CONFLICT (id) DO UPDATE SET
    role = 'super_admin',
    company_id = '00000000-0000-0000-0000-000000000000',
    updated_at = NOW();

-- =====================================================
-- PART 5: CREATE PLATFORM ANALYTICS TABLES
-- =====================================================

-- Platform-wide metrics table
CREATE TABLE IF NOT EXISTS platform_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15, 2),
    metric_type TEXT, -- 'revenue', 'users', 'projects', 'companies', etc.
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company activity logs
CREATE TABLE IF NOT EXISTS company_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    activity_type TEXT, -- 'login', 'project_created', 'subscription_changed', etc.
    activity_data JSONB,
    user_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform subscriptions/billing
CREATE TABLE IF NOT EXISTS platform_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    plan_name TEXT, -- 'free', 'starter', 'professional', 'enterprise'
    status TEXT DEFAULT 'active', -- 'active', 'cancelled', 'expired'
    monthly_price DECIMAL(10, 2),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- System health metrics
CREATE TABLE IF NOT EXISTS system_health_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15, 2),
    status TEXT, -- 'healthy', 'warning', 'critical'
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all platform tables
ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies - only super_admin can access
CREATE POLICY "super_admin_read_platform_metrics" 
ON platform_metrics FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'super_admin'
    )
);

CREATE POLICY "super_admin_insert_platform_metrics" 
ON platform_metrics FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'super_admin'
    )
);

CREATE POLICY "super_admin_read_activity_logs" 
ON company_activity_logs FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'super_admin'
    )
);

CREATE POLICY "super_admin_read_subscriptions" 
ON platform_subscriptions FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'super_admin'
    )
);

CREATE POLICY "super_admin_manage_subscriptions" 
ON platform_subscriptions FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'super_admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'super_admin'
    )
);

CREATE POLICY "super_admin_read_health_metrics" 
ON system_health_metrics FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'super_admin'
    )
);

-- =====================================================
-- PART 6: INSERT SAMPLE PLATFORM DATA
-- =====================================================

-- Insert sample companies for testing
INSERT INTO companies (name, industry, size) VALUES
('Demo Construction Co', 'Construction', 'SMB'),
('BuildRight Ltd', 'Construction', 'SMB'),
('MegaProjects Inc', 'Construction', 'Enterprise')
ON CONFLICT DO NOTHING;

-- Insert sample platform metrics
INSERT INTO platform_metrics (metric_name, metric_value, metric_type, period_start, period_end) VALUES
('Total Revenue', 125000.00, 'revenue', NOW() - INTERVAL '30 days', NOW()),
('Active Users', 156, 'users', NOW() - INTERVAL '30 days', NOW()),
('Total Companies', 23, 'companies', NOW() - INTERVAL '30 days', NOW()),
('Active Projects', 89, 'projects', NOW() - INTERVAL '30 days', NOW()),
('Monthly Growth', 15.5, 'percentage', NOW() - INTERVAL '30 days', NOW());

-- Insert sample subscriptions
INSERT INTO platform_subscriptions (company_id, plan_name, status, monthly_price, started_at, expires_at)
SELECT 
    id,
    CASE 
        WHEN random() < 0.3 THEN 'free'
        WHEN random() < 0.6 THEN 'starter'
        WHEN random() < 0.9 THEN 'professional'
        ELSE 'enterprise'
    END,
    'active',
    CASE 
        WHEN random() < 0.3 THEN 0
        WHEN random() < 0.6 THEN 49.00
        WHEN random() < 0.9 THEN 149.00
        ELSE 499.00
    END,
    NOW() - INTERVAL '30 days',
    NOW() + INTERVAL '30 days'
FROM companies
WHERE id != '00000000-0000-0000-0000-000000000000'
ON CONFLICT DO NOTHING;

-- Insert sample system health metrics
INSERT INTO system_health_metrics (metric_name, metric_value, status, details) VALUES
('API Response Time', 145.5, 'healthy', '{"unit": "ms", "threshold": 200}'),
('Database CPU', 45.2, 'healthy', '{"unit": "%", "threshold": 80}'),
('Active Connections', 23, 'healthy', '{"unit": "connections", "max": 100}'),
('Error Rate', 0.5, 'healthy', '{"unit": "%", "threshold": 5}'),
('Storage Used', 67.8, 'warning', '{"unit": "%", "threshold": 80}');

-- =====================================================
-- PART 7: VERIFICATION
-- =====================================================

-- Check super admin profile
SELECT 
    '✅ Super Admin Profile' as check_type,
    id,
    email,
    name,
    role,
    company_id
FROM profiles 
WHERE email = 'adrian.stanca1@gmail.com';

-- Check platform company
SELECT 
    '✅ Platform Company' as check_type,
    id,
    name,
    industry
FROM companies 
WHERE id = '00000000-0000-0000-0000-000000000000';

-- Check platform metrics
SELECT 
    '✅ Platform Metrics' as check_type,
    COUNT(*) as total_metrics
FROM platform_metrics;

-- Check subscriptions
SELECT 
    '✅ Platform Subscriptions' as check_type,
    COUNT(*) as total_subscriptions
FROM platform_subscriptions;

-- Check system health
SELECT 
    '✅ System Health Metrics' as check_type,
    COUNT(*) as total_health_metrics
FROM system_health_metrics;

-- Check all companies
SELECT 
    '✅ All Companies' as check_type,
    COUNT(*) as total_companies
FROM companies;

SELECT '🎉 SUPER ADMIN SETUP COMPLETE!' as status;
SELECT '👤 Super Admin: adrian.stanca1@gmail.com' as info;
SELECT '🏢 Platform Company: ConstructAI Platform' as info;
SELECT '📊 Dashboard tables created and populated with sample data' as info;
