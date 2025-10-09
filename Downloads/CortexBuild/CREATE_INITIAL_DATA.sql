-- =====================================================
-- CREATE INITIAL DATA FOR ConstructAI
-- Run this after setting up the database schema
-- =====================================================

-- =====================================================
-- PART 1: CREATE SAMPLE COMPANIES
-- =====================================================

INSERT INTO companies (name, address, phone, email) VALUES
('ABC Construction LLC', '123 Main St, Anytown, USA', '+1-555-0123', 'info@abcconstruction.com'),
('BuildCorp Industries', '456 Oak Ave, Springfield, USA', '+1-555-0456', 'contact@buildcorp.com'),
('Metro Builders Inc', '789 Pine Rd, Rivertown, USA', '+1-555-0789', 'projects@metrobuilder.com')
ON CONFLICT DO NOTHING;

-- =====================================================
-- PART 2: CREATE SAMPLE USERS (in auth.users)
-- Note: These would normally be created through registration,
-- but for demo purposes, we'll assume they exist.
-- In a real scenario, create users in Supabase Auth dashboard first.
-- =====================================================

-- For demo purposes, we'll use placeholder UUIDs
-- In reality, these would be the actual auth.users IDs

-- =====================================================
-- PART 3: CREATE SAMPLE PROFILES
-- =====================================================

-- Get company IDs for reference
DO $$
DECLARE
    abc_company_id UUID;
    buildcorp_company_id UUID;
    metro_company_id UUID;
BEGIN
    SELECT id INTO abc_company_id FROM companies WHERE name = 'ABC Construction LLC' LIMIT 1;
    SELECT id INTO buildcorp_company_id FROM companies WHERE name = 'BuildCorp Industries' LIMIT 1;
    SELECT id INTO metro_company_id FROM companies WHERE name = 'Metro Builders Inc' LIMIT 1;

    -- Insert sample profiles (these would normally be created by triggers)
    -- Note: In production, these are created automatically when users register
    INSERT INTO profiles (id, name, email, role, company_id) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'John Smith', 'john@abcconstruction.com', 'project_manager', abc_company_id),
    ('550e8400-e29b-41d4-a716-446655440001', 'Sarah Johnson', 'sarah@abcconstruction.com', 'supervisor', abc_company_id),
    ('550e8400-e29b-41d4-a716-446655440002', 'Mike Davis', 'mike@buildcorp.com', 'company_admin', buildcorp_company_id),
    ('550e8400-e29b-41d4-a716-446655440003', 'Lisa Chen', 'lisa@metrobuilder.com', 'operative', metro_company_id),
    ('550e8400-e29b-41d4-a716-446655440004', 'Tom Wilson', 'tom@metrobuilder.com', 'foreman', metro_company_id)
    ON CONFLICT (id) DO NOTHING;
END $$;

-- =====================================================
-- PART 4: CREATE SAMPLE PROJECTS
-- =====================================================

INSERT INTO projects (name, description, company_id, status, start_date, end_date, budget, location, project_manager_id) VALUES
(
    'Downtown Office Complex',
    'Construction of a 15-story office building in downtown area',
    (SELECT id FROM companies WHERE name = 'ABC Construction LLC'),
    'active',
    '2024-01-15',
    '2025-06-30',
    25000000.00,
    '123 Downtown Blvd, City Center',
    '550e8400-e29b-41d4-a716-446655440000'
),
(
    'Residential Tower Phase 1',
    'First phase of luxury residential high-rise development',
    (SELECT id FROM companies WHERE name = 'BuildCorp Industries'),
    'active',
    '2024-03-01',
    '2025-12-15',
    45000000.00,
    '456 Residential Ave, Uptown',
    '550e8400-e29b-41d4-a716-446655440002'
),
(
    'Shopping Mall Renovation',
    'Complete renovation and modernization of existing shopping mall',
    (SELECT id FROM companies WHERE name = 'Metro Builders Inc'),
    'in_progress',
    '2024-02-01',
    '2024-11-30',
    12000000.00,
    '789 Commerce St, Mall District',
    '550e8400-e29b-41d4-a716-446655440004'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- PART 5: CREATE SAMPLE TASKS
-- =====================================================

-- Tasks for Downtown Office Complex
INSERT INTO tasks (project_id, title, description, status, priority, assigned_to, due_date, created_by) VALUES
(
    (SELECT id FROM projects WHERE name = 'Downtown Office Complex'),
    'Foundation Excavation',
    'Excavate foundation for 15-story building - 200ft x 150ft area, 30ft deep',
    'completed',
    'high',
    '550e8400-e29b-41d4-a716-446655440001',
    '2024-02-28',
    '550e8400-e29b-41d4-a716-446655440000'
),
(
    (SELECT id FROM projects WHERE name = 'Downtown Office Complex'),
    'Steel Framework Installation',
    'Install structural steel framework for floors 1-15',
    'in_progress',
    'high',
    '550e8400-e29b-41d4-a716-446655440001',
    '2024-08-15',
    '550e8400-e29b-41d4-a716-446655440000'
),
(
    (SELECT id FROM projects WHERE name = 'Downtown Office Complex'),
    'Electrical Rough-in',
    'Complete electrical rough-in for all floors',
    'pending',
    'medium',
    '550e8400-e29b-41d4-a716-446655440003',
    '2024-09-30',
    '550e8400-e29b-41d4-a716-446655440000'
),
(
    (SELECT id FROM projects WHERE name = 'Residential Tower Phase 1'),
    'Concrete Pour - Level 1',
    'Pour concrete foundation and level 1 slab',
    'completed',
    'urgent',
    '550e8400-e29b-41d4-a716-446655440002',
    '2024-04-15',
    '550e8400-e29b-41d4-a716-446655440002'
),
(
    (SELECT id FROM projects WHERE name = 'Residential Tower Phase 1'),
    'Elevator Shaft Construction',
    'Construct elevator shafts and mechanical rooms',
    'in_progress',
    'high',
    '550e8400-e29b-41d4-a716-446655440004',
    '2024-07-31',
    '550e8400-e29b-41d4-a716-446655440002'
),
(
    (SELECT id FROM projects WHERE name = 'Shopping Mall Renovation'),
    'Demolition of Old Stores',
    'Demolish outdated store fixtures and prepare spaces',
    'completed',
    'medium',
    '550e8400-e29b-41d4-a716-446655440003',
    '2024-03-15',
    '550e8400-e29b-41d4-a716-446655440004'
),
(
    (SELECT id FROM projects WHERE name = 'Shopping Mall Renovation'),
    'HVAC System Upgrade',
    'Replace and upgrade entire mall HVAC system',
    'in_progress',
    'high',
    '550e8400-e29b-41d4-a716-446655440003',
    '2024-08-30',
    '550e8400-e29b-41d4-a716-446655440004'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- PART 6: CREATE SAMPLE RFIs
-- =====================================================

INSERT INTO rfis (project_id, number, title, description, status, priority, submitted_by, assigned_to, due_date) VALUES
(
    (SELECT id FROM projects WHERE name = 'Downtown Office Complex'),
    'RFI-001',
    'Clarification on Steel Beam Specifications',
    'Need clarification on ASTM specifications for structural steel beams in high-wind areas',
    'answered',
    'high',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    '2024-03-15'
),
(
    (SELECT id FROM projects WHERE name = 'Residential Tower Phase 1'),
    'RFI-002',
    'Foundation Load Bearing Requirements',
    'Request for clarification on soil bearing capacity and foundation design requirements',
    'open',
    'medium',
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440002',
    '2024-05-01'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- PART 7: CREATE SAMPLE PUNCH LIST ITEMS
-- =====================================================

INSERT INTO punch_list_items (project_id, number, description, location, status, priority, assigned_to, created_by, due_date) VALUES
(
    (SELECT id FROM projects WHERE name = 'Downtown Office Complex'),
    'PL-001',
    'Touch up paint on east wall of conference room 1501',
    'Floor 15, Conference Room 1501',
    'open',
    'low',
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440001',
    '2024-06-01'
),
(
    (SELECT id FROM projects WHERE name = 'Residential Tower Phase 1'),
    'PL-002',
    'Replace damaged tile in lobby area',
    'Ground Floor Lobby',
    'in_progress',
    'medium',
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440004',
    '2024-05-20'
),
(
    (SELECT id FROM projects WHERE name = 'Shopping Mall Renovation'),
    'PL-003',
    'Fix leaking faucet in food court restroom',
    'Food Court, Restroom B',
    'resolved',
    'high',
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440004',
    '2024-04-10'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- PART 8: CREATE SAMPLE DAILY LOGS
-- =====================================================

INSERT INTO daily_logs (project_id, log_date, weather, temperature, summary, workers_on_site, equipment_used, safety_incidents, created_by) VALUES
(
    (SELECT id FROM projects WHERE name = 'Downtown Office Complex'),
    CURRENT_DATE - INTERVAL '2 days',
    'Sunny',
    '72°F',
    'Completed steel framework installation on floors 8-10. Good progress on schedule. Safety briefing conducted.',
    45,
    'Cranes, Welding equipment, Safety harnesses',
    'None',
    '550e8400-e29b-41d4-a716-446655440001'
),
(
    (SELECT id FROM projects WHERE name = 'Residential Tower Phase 1'),
    CURRENT_DATE - INTERVAL '1 day',
    'Partly cloudy',
    '68°F',
    'Concrete pour completed for level 5. Elevator shaft work progressing. Minor delay due to material delivery.',
    38,
    'Concrete trucks, Mixers, Scaffolding',
    'None',
    '550e8400-e29b-41d4-a716-446655440004'
),
(
    (SELECT id FROM projects WHERE name = 'Shopping Mall Renovation'),
    CURRENT_DATE,
    'Rainy',
    '65°F',
    'HVAC system installation continuing. Roof work completed. Safety inspection passed.',
    22,
    'HVAC equipment, Ladders, Power tools',
    'None',
    '550e8400-e29b-41d4-a716-446655440003'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- PART 9: CREATE SAMPLE DOCUMENTS
-- =====================================================

INSERT INTO documents (project_id, name, description, file_url, file_type, file_size, category, uploaded_by) VALUES
(
    (SELECT id FROM projects WHERE name = 'Downtown Office Complex'),
    'Architectural Drawings - Floor 1-5',
    'Complete architectural drawings for floors 1 through 5',
    'https://example.com/drawings/floor1-5.pdf',
    'application/pdf',
    5242880,
    'drawings',
    '550e8400-e29b-41d4-a716-446655440000'
),
(
    (SELECT id FROM projects WHERE name = 'Residential Tower Phase 1'),
    'Structural Engineering Report',
    'Final structural engineering analysis and calculations',
    'https://example.com/reports/structural.pdf',
    'application/pdf',
    3145728,
    'reports',
    '550e8400-e29b-41d4-a716-446655440002'
),
(
    (SELECT id FROM projects WHERE name = 'Shopping Mall Renovation'),
    'Permit Application Package',
    'Complete permit application with all required documentation',
    'https://example.com/permits/mall-renovation.zip',
    'application/zip',
    10485760,
    'permits',
    '550e8400-e29b-41d4-a716-446655440004'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- PART 10: CREATE SAMPLE PHOTOS
-- =====================================================

INSERT INTO photos (project_id, title, description, photo_url, thumbnail_url, location, taken_at, uploaded_by) VALUES
(
    (SELECT id FROM projects WHERE name = 'Downtown Office Complex'),
    'Foundation Excavation Progress',
    'View of completed foundation excavation showing rebar installation',
    'https://example.com/photos/foundation-progress.jpg',
    'https://example.com/photos/foundation-progress-thumb.jpg',
    'Site Foundation Area',
    CURRENT_TIMESTAMP - INTERVAL '30 days',
    '550e8400-e29b-41d4-a716-446655440001'
),
(
    (SELECT id FROM projects WHERE name = 'Residential Tower Phase 1'),
    'Concrete Pour Level 3',
    'Concrete being poured for level 3 floor slab',
    'https://example.com/photos/concrete-pour.jpg',
    'https://example.com/photos/concrete-pour-thumb.jpg',
    'Level 3 Construction Zone',
    CURRENT_TIMESTAMP - INTERVAL '15 days',
    '550e8400-e29b-41d4-a716-446655440004'
),
(
    (SELECT id FROM projects WHERE name = 'Shopping Mall Renovation'),
    'Demolition Complete',
    'Before and after view of completed demolition work',
    'https://example.com/photos/demolition-complete.jpg',
    'https://example.com/photos/demolition-complete-thumb.jpg',
    'Store Unit 12',
    CURRENT_TIMESTAMP - INTERVAL '20 days',
    '550e8400-e29b-41d4-a716-446655440003'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- PART 11: VERIFICATION
-- =====================================================

SELECT '✅ Sample companies created' as status, COUNT(*) as count FROM companies;
SELECT '✅ Sample profiles created' as status, COUNT(*) as count FROM profiles;
SELECT '✅ Sample projects created' as status, COUNT(*) as count FROM projects;
SELECT '✅ Sample tasks created' as status, COUNT(*) as count FROM tasks;
SELECT '✅ Sample RFIs created' as status, COUNT(*) as count FROM rfis;
SELECT '✅ Sample punch list items created' as status, COUNT(*) as count FROM punch_list_items;
SELECT '✅ Sample daily logs created' as status, COUNT(*) as count FROM daily_logs;
SELECT '✅ Sample documents created' as status, COUNT(*) as count FROM documents;
SELECT '✅ Sample photos created' as status, COUNT(*) as count FROM photos;

SELECT '🎉 INITIAL DATA CREATION COMPLETE!' as final_status;
SELECT '📊 Sample data is now available in your ConstructAI application' as message;