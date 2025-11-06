-- Phase 5 Database Schema Test Script
-- Run this script to test all tables and RPC functions
-- Note: Replace company_id and user_id with actual values from your database

-- ============================================
-- TEST 1: Insert Sample Department
-- ============================================
INSERT INTO public.departments (company_id, name, description, budget, manager_id)
VALUES (
    'YOUR_COMPANY_ID_HERE',
    'Engineering',
    'Software development team',
    50000,
    'YOUR_MANAGER_USER_ID_HERE'
)
RETURNING id, name, budget;

-- ============================================
-- TEST 2: Insert Sample Custom Role
-- ============================================
INSERT INTO public.custom_roles (company_id, name, description, permissions)
VALUES (
    'YOUR_COMPANY_ID_HERE',
    'Project Lead',
    'Can manage projects and team members',
    ARRAY['view_projects', 'create_projects', 'edit_projects', 'manage_team']
)
RETURNING id, name, permissions;

-- ============================================
-- TEST 3: Assign User to Department
-- ============================================
INSERT INTO public.department_members (department_id, user_id, role)
VALUES (
    'YOUR_DEPARTMENT_ID_HERE',
    'YOUR_USER_ID_HERE',
    'member'
)
RETURNING id, user_id, role, joined_at;

-- ============================================
-- TEST 4: Insert Company Analytics
-- ============================================
INSERT INTO public.company_analytics (
    company_id, total_projects, active_projects, completed_projects,
    total_revenue, monthly_revenue, team_productivity, completion_rate,
    budget_utilization, month, year
)
VALUES (
    'YOUR_COMPANY_ID_HERE',
    25, 10, 15,
    150000, 25000, 85.5, 92.3,
    78.5, '10', 2024
)
RETURNING id, total_projects, total_revenue, completion_rate;

-- ============================================
-- TEST 5: Insert Company Settings
-- ============================================
INSERT INTO public.company_settings (
    company_id, theme_color, logo_url, notifications_enabled, two_factor_required
)
VALUES (
    'YOUR_COMPANY_ID_HERE',
    '#3B82F6',
    'https://example.com/logo.png',
    true,
    false
)
RETURNING id, company_id, theme_color;

-- ============================================
-- TEST 6: Insert API Key
-- ============================================
INSERT INTO public.api_keys (company_id, name, key_value)
VALUES (
    'YOUR_COMPANY_ID_HERE',
    'Production API Key',
    'sk_' || encode(gen_random_bytes(32), 'hex')
)
RETURNING id, name, created_at;

-- ============================================
-- TEST 7: Insert Webhook
-- ============================================
INSERT INTO public.webhooks (company_id, url, events, active)
VALUES (
    'YOUR_COMPANY_ID_HERE',
    'https://example.com/webhooks/events',
    ARRAY['project.created', 'project.updated', 'project.completed'],
    true
)
RETURNING id, url, events, active;

-- ============================================
-- TEST 8: Test RPC - invite_team_member
-- ============================================
SELECT public.invite_team_member(
    'YOUR_COMPANY_ID_HERE',
    'newuser@example.com',
    'project_manager'
);

-- ============================================
-- TEST 9: Test RPC - create_department
-- ============================================
SELECT public.create_department(
    'YOUR_COMPANY_ID_HERE',
    'Marketing',
    'Marketing and communications team',
    30000,
    'YOUR_MANAGER_USER_ID_HERE'
);

-- ============================================
-- TEST 10: Test RPC - assign_user_to_department
-- ============================================
SELECT public.assign_user_to_department(
    'YOUR_USER_ID_HERE',
    'YOUR_DEPARTMENT_ID_HERE',
    'member'
);

-- ============================================
-- TEST 11: Test RPC - update_department_budget
-- ============================================
SELECT public.update_department_budget(
    'YOUR_DEPARTMENT_ID_HERE',
    75000
);

-- ============================================
-- TEST 12: Test RPC - get_department_members
-- ============================================
SELECT * FROM public.get_department_members('YOUR_DEPARTMENT_ID_HERE');

-- ============================================
-- TEST 13: Test RPC - get_company_analytics
-- ============================================
SELECT * FROM public.get_company_analytics(
    'YOUR_COMPANY_ID_HERE',
    '2024-01-01'::DATE,
    '2024-12-31'::DATE
);

-- ============================================
-- TEST 14: Test RPC - get_department_budget_summary
-- ============================================
SELECT * FROM public.get_department_budget_summary('YOUR_COMPANY_ID_HERE');

-- ============================================
-- TEST 15: Verify RLS Policies
-- ============================================
-- This query should only return departments for the current user's company
SELECT id, name, budget FROM public.departments LIMIT 5;

-- ============================================
-- TEST 16: Check Indexes
-- ============================================
SELECT indexname, tablename FROM pg_indexes 
WHERE tablename IN ('departments', 'custom_roles', 'department_members', 
                    'company_analytics', 'company_settings', 'api_keys', 'webhooks')
ORDER BY tablename, indexname;

-- ============================================
-- TEST 17: Verify Constraints
-- ============================================
-- Try to insert negative budget (should fail)
-- INSERT INTO public.departments (company_id, name, budget) 
-- VALUES ('YOUR_COMPANY_ID_HERE', 'Test', -1000);

-- ============================================
-- TEST 18: Check Triggers
-- ============================================
-- Verify updated_at is automatically set
UPDATE public.departments 
SET name = 'Engineering Updated' 
WHERE id = 'YOUR_DEPARTMENT_ID_HERE'
RETURNING id, name, updated_at;

-- ============================================
-- TEST 19: Verify Cascading Deletes
-- ============================================
-- When a department is deleted, all department_members should be deleted too
-- DELETE FROM public.departments WHERE id = 'YOUR_DEPARTMENT_ID_HERE';
-- SELECT COUNT(*) FROM public.department_members WHERE department_id = 'YOUR_DEPARTMENT_ID_HERE';

-- ============================================
-- TEST 20: Performance Check
-- ============================================
-- Check query performance with EXPLAIN
EXPLAIN ANALYZE
SELECT d.id, d.name, COUNT(dm.id) as member_count
FROM public.departments d
LEFT JOIN public.department_members dm ON d.id = dm.department_id
WHERE d.company_id = 'YOUR_COMPANY_ID_HERE'
GROUP BY d.id, d.name;

