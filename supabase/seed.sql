-- ═══════════════════════════════════════════════════════════════════════════
-- CortexBuild Platform - Supabase Seed Data
-- ═══════════════════════════════════════════════════════════════════════════

-- Insert demo companies
INSERT INTO companies (id, name, industry, email, subscription_plan, max_users, max_projects)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'ASC Cladding Ltd', 'Construction', 'info@ascladdingltd.co.uk', 'professional', 50, 100),
    ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'BuildRight Construction', 'Construction', 'contact@buildright.com', 'business', 25, 50)
ON CONFLICT (name) DO NOTHING;

-- Insert demo users (passwords are hashed with bcrypt)
-- Password for all users: parola123
INSERT INTO users (id, email, password_hash, name, role, company_id)
VALUES 
    -- Super Admin
    ('550e8400-e29b-41d4-a716-446655440011'::uuid, 'adrian.stanca1@gmail.com', '$2a$10$rOzJQjKxjxRxjxRxjxRxjOK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', 'Adrian Stanca', 'super_admin', '550e8400-e29b-41d4-a716-446655440001'::uuid),
    
    -- Company Admin (ASC Cladding)
    ('550e8400-e29b-41d4-a716-446655440012'::uuid, 'adrian@ascladdingltd.co.uk', '$2a$10$rOzJQjKxjxRxjxRxjxRxjOK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', 'Adrian ASC', 'company_admin', '550e8400-e29b-41d4-a716-446655440001'::uuid),
    
    -- Developer
    ('550e8400-e29b-41d4-a716-446655440013'::uuid, 'adrian.stanca1@icloud.com', '$2a$10$rOzJQjKxjxRxjxRxjxRxjOK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', 'Adrian Dev', 'developer', '550e8400-e29b-41d4-a716-446655440001'::uuid),
    
    -- Regular User (ASC Cladding)
    ('550e8400-e29b-41d4-a716-446655440014'::uuid, 'john.smith@ascladdingltd.co.uk', '$2a$10$rOzJQjKxjxRxjxRxjxRxjOK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', 'John Smith', 'user', '550e8400-e29b-41d4-a716-446655440001'::uuid),
    
    -- Company Admin (BuildRight)
    ('550e8400-e29b-41d4-a716-446655440015'::uuid, 'sarah.johnson@buildright.com', '$2a$10$rOzJQjKxjxRxjxRxjxRxjOK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', 'Sarah Johnson', 'company_admin', '550e8400-e29b-41d4-a716-446655440002'::uuid)
ON CONFLICT (email) DO NOTHING;

-- Insert 6 pre-approved Global Marketplace apps
INSERT INTO sdk_apps (id, developer_id, company_id, name, description, icon, category, version, status, review_status, is_public, published_at)
VALUES 
    ('650e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440011'::uuid, NULL, 'Project Dashboard', 'Real-time project monitoring and analytics dashboard with charts and KPIs', '📊', 'analytics', '1.0.0', 'approved', 'approved', true, NOW()),
    ('650e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440011'::uuid, NULL, 'Team Chat', 'Instant messaging and collaboration tool for teams with file sharing', '💬', 'communication', '1.0.0', 'approved', 'approved', true, NOW()),
    ('650e8400-e29b-41d4-a716-446655440003'::uuid, '550e8400-e29b-41d4-a716-446655440011'::uuid, NULL, 'Time Tracker', 'Track time spent on projects and tasks with detailed reports', '⏱️', 'productivity', '1.0.0', 'approved', 'approved', true, NOW()),
    ('650e8400-e29b-41d4-a716-446655440004'::uuid, '550e8400-e29b-41d4-a716-446655440011'::uuid, NULL, 'Team Calendar', 'Shared calendar for scheduling meetings and events', '📅', 'productivity', '1.0.0', 'approved', 'approved', true, NOW()),
    ('650e8400-e29b-41d4-a716-446655440005'::uuid, '550e8400-e29b-41d4-a716-446655440011'::uuid, NULL, 'Task Manager', 'Organize and track tasks with kanban boards and lists', '✅', 'productivity', '1.0.0', 'approved', 'approved', true, NOW()),
    ('650e8400-e29b-41d4-a716-446655440006'::uuid, '550e8400-e29b-41d4-a716-446655440011'::uuid, NULL, 'Expense Tracker', 'Track project expenses and generate financial reports', '💰', 'finance', '1.0.0', 'approved', 'approved', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample clients for ASC Cladding
INSERT INTO clients (company_id, name, contact_name, email, phone, city, state, payment_terms)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'Acme Construction', 'John Doe', 'john@acme.com', '555-0101', 'London', 'England', 30),
    ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'BuildCo Ltd', 'Jane Smith', 'jane@buildco.com', '555-0102', 'Manchester', 'England', 45),
    ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'Premier Developments', 'Bob Wilson', 'bob@premier.com', '555-0103', 'Birmingham', 'England', 30)
ON CONFLICT DO NOTHING;

-- Insert sample clients for BuildRight
INSERT INTO clients (company_id, name, contact_name, email, phone, city, state, payment_terms)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'Metro Properties', 'Alice Brown', 'alice@metro.com', '555-0201', 'Leeds', 'England', 30),
    ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'Urban Builders', 'Charlie Davis', 'charlie@urban.com', '555-0202', 'Liverpool', 'England', 60),
    ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'Skyline Contractors', 'Diana Evans', 'diana@skyline.com', '555-0203', 'Bristol', 'England', 45)
ON CONFLICT DO NOTHING;

-- Insert sample projects for ASC Cladding
INSERT INTO projects (company_id, name, description, project_number, status, priority, start_date, end_date, budget, client_id, project_manager_id, progress)
SELECT 
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'Office Building Renovation',
    'Complete renovation of 5-story office building including new cladding system',
    'ASC-2024-001',
    'active',
    'high',
    '2024-01-15',
    '2024-06-30',
    250000.00,
    c.id,
    '550e8400-e29b-41d4-a716-446655440012'::uuid,
    45
FROM clients c WHERE c.name = 'Acme Construction' LIMIT 1
ON CONFLICT (project_number) DO NOTHING;

INSERT INTO projects (company_id, name, description, project_number, status, priority, start_date, end_date, budget, client_id, project_manager_id, progress)
SELECT 
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'Residential Complex Phase 2',
    'Installation of aluminum cladding for 120-unit residential complex',
    'ASC-2024-002',
    'planning',
    'medium',
    '2024-03-01',
    '2024-09-30',
    180000.00,
    c.id,
    '550e8400-e29b-41d4-a716-446655440012'::uuid,
    15
FROM clients c WHERE c.name = 'BuildCo Ltd' LIMIT 1
ON CONFLICT (project_number) DO NOTHING;

-- Insert sample projects for BuildRight
INSERT INTO projects (company_id, name, description, project_number, status, priority, start_date, end_date, budget, client_id, project_manager_id, progress)
SELECT 
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    'Shopping Mall Expansion',
    'Expansion of existing shopping mall with new retail units',
    'BR-2024-001',
    'active',
    'high',
    '2024-02-01',
    '2024-08-31',
    500000.00,
    c.id,
    '550e8400-e29b-41d4-a716-446655440015'::uuid,
    60
FROM clients c WHERE c.name = 'Metro Properties' LIMIT 1
ON CONFLICT (project_number) DO NOTHING;

INSERT INTO projects (company_id, name, description, project_number, status, priority, start_date, end_date, budget, client_id, project_manager_id, progress)
SELECT 
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    'Hotel Refurbishment',
    'Complete refurbishment of 200-room hotel including facade work',
    'BR-2024-002',
    'planning',
    'medium',
    '2024-04-01',
    '2024-12-31',
    350000.00,
    c.id,
    '550e8400-e29b-41d4-a716-446655440015'::uuid,
    5
FROM clients c WHERE c.name = 'Urban Builders' LIMIT 1
ON CONFLICT (project_number) DO NOTHING;

-- Insert sample tasks for first project
INSERT INTO tasks (project_id, title, description, status, priority, assigned_to, due_date, estimated_hours, progress)
SELECT 
    p.id,
    'Site Survey and Measurements',
    'Complete detailed survey of building facade and take precise measurements',
    'done',
    'high',
    '550e8400-e29b-41d4-a716-446655440014'::uuid,
    '2024-01-20',
    16.0,
    100
FROM projects p WHERE p.project_number = 'ASC-2024-001' LIMIT 1;

INSERT INTO tasks (project_id, title, description, status, priority, assigned_to, due_date, estimated_hours, progress)
SELECT 
    p.id,
    'Material Procurement',
    'Order and arrange delivery of cladding materials',
    'in_progress',
    'high',
    '550e8400-e29b-41d4-a716-446655440014'::uuid,
    '2024-02-15',
    8.0,
    65
FROM projects p WHERE p.project_number = 'ASC-2024-001' LIMIT 1;

INSERT INTO tasks (project_id, title, description, status, priority, assigned_to, due_date, estimated_hours, progress)
SELECT 
    p.id,
    'Installation Phase 1',
    'Install cladding system on floors 1-3',
    'todo',
    'medium',
    '550e8400-e29b-41d4-a716-446655440014'::uuid,
    '2024-03-30',
    120.0,
    0
FROM projects p WHERE p.project_number = 'ASC-2024-001' LIMIT 1;

-- Insert sample milestones
INSERT INTO milestones (project_id, name, description, due_date, status, completion_percentage)
SELECT 
    p.id,
    'Design Approval',
    'Client approval of final cladding design and materials',
    '2024-02-01',
    'completed',
    100
FROM projects p WHERE p.project_number = 'ASC-2024-001' LIMIT 1;

INSERT INTO milestones (project_id, name, description, due_date, status, completion_percentage)
SELECT 
    p.id,
    'Phase 1 Completion',
    'Complete installation of floors 1-3',
    '2024-04-15',
    'in_progress',
    45
FROM projects p WHERE p.project_number = 'ASC-2024-001' LIMIT 1;

