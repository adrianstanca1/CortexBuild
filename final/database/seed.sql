-- =====================================================
-- SEED DATA FOR AS AGENTS CONSTRUCTION PLATFORM
-- =====================================================
-- Run this AFTER schema.sql to populate with demo data
-- This creates demo users, projects, and sample data
-- =====================================================
-- DEMO COMPANY
-- =====================================================
INSERT INTO companies (
        id,
        name,
        industry,
        size,
        address,
        phone,
        email,
        website,
        subscription_tier
    )
VALUES (
        '11111111-1111-1111-1111-111111111111',
        'Demo Construction Co',
        'Construction',
        'medium',
        '123 Build Street, London, UK',
        '+44 20 1234 5678',
        'info@democonstruction.com',
        'democonstruction.com',
        'professional'
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'Elite Builders Ltd',
        'Construction',
        'large',
        '456 Construct Ave, Manchester, UK',
        '+44 161 234 5678',
        'contact@elitebuilders.com',
        'elitebuilders.com',
        'enterprise'
    );
-- =====================================================
-- DEMO USERS
-- =====================================================
-- Note: These users need to be created via Supabase Auth first
-- Then their profiles will be created with these IDs
-- For now, we'll insert placeholder profiles that will be linked when they sign up
-- Admin User
INSERT INTO users (
        id,
        company_id,
        email,
        name,
        role,
        permissions,
        position,
        department,
        is_active
    )
VALUES (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '11111111-1111-1111-1111-111111111111',
        'admin@democonstruction.com',
        'John Admin',
        'admin',
        ARRAY ['*'],
        'Managing Director',
        'Management',
        TRUE
    );
-- Project Manager
INSERT INTO users (
        id,
        company_id,
        email,
        name,
        role,
        permissions,
        position,
        department,
        is_active
    )
VALUES (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '11111111-1111-1111-1111-111111111111',
        'manager@democonstruction.com',
        'Sarah Manager',
        'manager',
        ARRAY ['projects:*', 'tasks:*', 'team:read'],
        'Project Manager',
        'Operations',
        TRUE
    );
-- Site Supervisor
INSERT INTO users (
        id,
        company_id,
        email,
        name,
        role,
        permissions,
        position,
        department,
        is_active
    )
VALUES (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        '11111111-1111-1111-1111-111111111111',
        'supervisor@democonstruction.com',
        'Mike Supervisor',
        'supervisor',
        ARRAY ['projects:read', 'tasks:*', 'time:*'],
        'Site Supervisor',
        'Operations',
        TRUE
    );
-- Worker 1
INSERT INTO users (
        id,
        company_id,
        email,
        name,
        role,
        permissions,
        position,
        department,
        is_active
    )
VALUES (
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        '11111111-1111-1111-1111-111111111111',
        'worker1@democonstruction.com',
        'Tom Worker',
        'user',
        ARRAY ['projects:read', 'tasks:read', 'time:*'],
        'Construction Worker',
        'Operations',
        TRUE
    );
-- Worker 2
INSERT INTO users (
        id,
        company_id,
        email,
        name,
        role,
        permissions,
        position,
        department,
        is_active
    )
VALUES (
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        '11111111-1111-1111-1111-111111111111',
        'worker2@democonstruction.com',
        'Emma Builder',
        'user',
        ARRAY ['projects:read', 'tasks:read', 'time:*'],
        'Construction Worker',
        'Operations',
        TRUE
    );
-- Accountant
INSERT INTO users (
        id,
        company_id,
        email,
        name,
        role,
        permissions,
        position,
        department,
        is_active
    )
VALUES (
        'ffffffff-ffff-ffff-ffff-ffffffffffff',
        '11111111-1111-1111-1111-111111111111',
        'finance@democonstruction.com',
        'Lisa Finance',
        'accountant',
        ARRAY ['finance:*', 'projects:read'],
        'Senior Accountant',
        'Finance',
        TRUE
    );
-- =====================================================
-- DEMO CLIENTS
-- =====================================================
INSERT INTO clients (
        id,
        company_id,
        name,
        email,
        phone,
        address,
        contact_person,
        status
    )
VALUES (
        'c1111111-1111-1111-1111-111111111111',
        '11111111-1111-1111-1111-111111111111',
        'City Council',
        'projects@citycouncil.gov.uk',
        '+44 20 7123 4567',
        'City Hall, London',
        'Robert Smith',
        'active'
    ),
    (
        'c2222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        'ABC Property Developers',
        'info@abcproperties.com',
        '+44 161 234 5678',
        'Manchester Business Park',
        'Jane Cooper',
        'active'
    ),
    (
        'c3333333-3333-3333-3333-333333333333',
        '11111111-1111-1111-1111-111111111111',
        'Green Energy Corp',
        'projects@greenenergy.com',
        '+44 117 234 5678',
        'Bristol Science Park',
        'David Green',
        'active'
    );
-- =====================================================
-- DEMO PROJECTS
-- =====================================================
INSERT INTO projects (
        id,
        company_id,
        name,
        description,
        status,
        priority,
        start_date,
        end_date,
        budget,
        spent,
        address,
        latitude,
        longitude,
        client_id,
        manager_id,
        progress,
        health_status
    )
VALUES (
        'p1111111-1111-1111-1111-111111111111',
        '11111111-1111-1111-1111-111111111111',
        'City Center Office Building',
        'Modern 12-story office complex in city center',
        'active',
        'high',
        '2025-01-15',
        '2026-06-30',
        5000000.00,
        1250000.00,
        'City Center, London',
        51.5074,
        -0.1278,
        'c1111111-1111-1111-1111-111111111111',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        25,
        'on_track'
    ),
    (
        'p2222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        'Residential Complex Phase 1',
        '50-unit residential development with amenities',
        'active',
        'high',
        '2024-10-01',
        '2025-12-31',
        3500000.00,
        2100000.00,
        'Manchester Suburbs',
        53.4808,
        -2.2426,
        'c2222222-2222-2222-2222-222222222222',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        60,
        'on_track'
    ),
    (
        'p3333333-3333-3333-3333-333333333333',
        '11111111-1111-1111-1111-111111111111',
        'Solar Farm Installation',
        'Large-scale solar panel installation project',
        'active',
        'medium',
        '2025-03-01',
        '2025-09-30',
        2000000.00,
        400000.00,
        'Somerset Fields',
        51.1045,
        -2.8766,
        'c3333333-3333-3333-3333-333333333333',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        20,
        'on_track'
    ),
    (
        'p4444444-4444-4444-4444-444444444444',
        '11111111-1111-1111-1111-111111111111',
        'Bridge Renovation',
        'Historic bridge restoration and strengthening',
        'planning',
        'low',
        '2025-06-01',
        '2026-03-31',
        1500000.00,
        0.00,
        'Bristol Waterfront',
        51.4545,
        -2.5879,
        'c1111111-1111-1111-1111-111111111111',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        5,
        'planning'
    );
-- =====================================================
-- PROJECT ASSIGNMENTS
-- =====================================================
INSERT INTO project_assignments (project_id, user_id, role, assigned_by)
VALUES -- Office Building Team
    (
        'p1111111-1111-1111-1111-111111111111',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'Project Manager',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
    ),
    (
        'p1111111-1111-1111-1111-111111111111',
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'Site Supervisor',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
    ),
    (
        'p1111111-1111-1111-1111-111111111111',
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        'Construction Worker',
        'cccccccc-cccc-cccc-cccc-cccccccccccc'
    ),
    (
        'p1111111-1111-1111-1111-111111111111',
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        'Construction Worker',
        'cccccccc-cccc-cccc-cccc-cccccccccccc'
    ),
    -- Residential Complex Team
    (
        'p2222222-2222-2222-2222-222222222222',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'Project Manager',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
    ),
    (
        'p2222222-2222-2222-2222-222222222222',
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'Site Supervisor',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
    ),
    (
        'p2222222-2222-2222-2222-222222222222',
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        'Construction Worker',
        'cccccccc-cccc-cccc-cccc-cccccccccccc'
    ),
    -- Solar Farm Team
    (
        'p3333333-3333-3333-3333-333333333333',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'Project Manager',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
    ),
    (
        'p3333333-3333-3333-3333-333333333333',
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        'Electrician',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
    );
-- =====================================================
-- DEMO TODOS
-- =====================================================
INSERT INTO todos (
        id,
        project_id,
        company_id,
        title,
        description,
        status,
        priority,
        assigned_to,
        created_by,
        due_date
    )
VALUES (
        't1111111-1111-1111-1111-111111111111',
        'p1111111-1111-1111-1111-111111111111',
        '11111111-1111-1111-1111-111111111111',
        'Complete foundation inspection',
        'Verify foundation meets specifications before proceeding',
        'in_progress',
        'high',
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '2025-10-30'
    ),
    (
        't2222222-2222-2222-2222-222222222222',
        'p1111111-1111-1111-1111-111111111111',
        '11111111-1111-1111-1111-111111111111',
        'Order steel beams',
        'Place order for structural steel for floors 3-6',
        'pending',
        'high',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '2025-10-29'
    ),
    (
        't3333333-3333-3333-3333-333333333333',
        'p2222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        'Install windows in Building A',
        'Complete window installation for units 1-25',
        'in_progress',
        'medium',
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        '2025-11-05'
    ),
    (
        't4444444-4444-4444-4444-444444444444',
        'p3333333-3333-3333-3333-333333333333',
        '11111111-1111-1111-1111-111111111111',
        'Complete electrical survey',
        'Survey site for solar panel electrical connections',
        'completed',
        'high',
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '2025-10-25'
    );
-- =====================================================
-- DEMO TIME ENTRIES
-- =====================================================
INSERT INTO time_entries (
        user_id,
        project_id,
        company_id,
        date,
        hours,
        description,
        task_type,
        billable,
        approved
    )
VALUES (
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        'p1111111-1111-1111-1111-111111111111',
        '11111111-1111-1111-1111-111111111111',
        '2025-10-25',
        8.0,
        'Foundation work',
        'Construction',
        TRUE,
        TRUE
    ),
    (
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        'p1111111-1111-1111-1111-111111111111',
        '11111111-1111-1111-1111-111111111111',
        '2025-10-26',
        7.5,
        'Foundation inspection prep',
        'Construction',
        TRUE,
        TRUE
    ),
    (
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        'p2222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        '2025-10-25',
        8.0,
        'Window installation',
        'Installation',
        TRUE,
        TRUE
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'p1111111-1111-1111-1111-111111111111',
        '11111111-1111-1111-1111-111111111111',
        '2025-10-27',
        9.0,
        'Site supervision and quality checks',
        'Supervision',
        TRUE,
        FALSE
    );
-- =====================================================
-- DEMO EQUIPMENT
-- =====================================================
INSERT INTO equipment (
        id,
        company_id,
        name,
        type,
        manufacturer,
        model,
        status,
        purchase_date,
        purchase_cost,
        current_value,
        assigned_to_project,
        next_maintenance_date
    )
VALUES (
        'e1111111-1111-1111-1111-111111111111',
        '11111111-1111-1111-1111-111111111111',
        'Tower Crane #1',
        'Heavy Machinery',
        'Liebherr',
        'LC-380',
        'in_use',
        '2023-05-15',
        250000.00,
        230000.00,
        'p1111111-1111-1111-1111-111111111111',
        '2025-11-15'
    ),
    (
        'e2222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        'Excavator',
        'Heavy Machinery',
        'Caterpillar',
        '320',
        'in_use',
        '2022-03-20',
        180000.00,
        150000.00,
        'p2222222-2222-2222-2222-222222222222',
        '2025-11-01'
    ),
    (
        'e3333333-3333-3333-3333-333333333333',
        '11111111-1111-1111-1111-111111111111',
        'Concrete Mixer',
        'Machinery',
        'Siemens',
        'CM-500',
        'available',
        '2024-01-10',
        35000.00,
        32000.00,
        NULL,
        '2025-12-10'
    );
-- =====================================================
-- DEMO SAFETY INCIDENTS
-- =====================================================
INSERT INTO safety_incidents (
        id,
        company_id,
        project_id,
        reported_by,
        incident_date,
        severity,
        type,
        location,
        description,
        status
    )
VALUES (
        'i1111111-1111-1111-1111-111111111111',
        '11111111-1111-1111-1111-111111111111',
        'p1111111-1111-1111-1111-111111111111',
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        '2025-10-20 14:30:00',
        'minor',
        'near_miss',
        'Floor 2 - East Wing',
        'Worker nearly struck by falling tools. No injury. Immediate corrective action taken.',
        'closed'
    ),
    (
        'i2222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        'p2222222-2222-2222-2222-222222222222',
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        '2025-10-26 10:15:00',
        'low',
        'property_damage',
        'Building A - Unit 15',
        'Minor damage to window frame during installation. Replaced immediately.',
        'open'
    );
-- =====================================================
-- DEMO NOTIFICATIONS
-- =====================================================
INSERT INTO notifications (user_id, type, title, message, link, read)
VALUES (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'task_assigned',
        'New Task Assigned',
        'You have been assigned to "Order steel beams"',
        '/projects/p1111111-1111-1111-1111-111111111111',
        FALSE
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'safety_alert',
        'Safety Incident Reported',
        'New safety incident reported on City Center Office Building',
        '/safety/i2222222-2222-2222-2222-222222222222',
        FALSE
    ),
    (
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        'task_reminder',
        'Task Due Soon',
        'Task "Complete foundation inspection" is due tomorrow',
        '/tasks/t1111111-1111-1111-1111-111111111111',
        FALSE
    );
-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'Demo data created successfully!' AS message,
    (
        SELECT COUNT(*)
        FROM users
    ) AS users_created,
    (
        SELECT COUNT(*)
        FROM projects
    ) AS projects_created,
    (
        SELECT COUNT(*)
        FROM todos
    ) AS todos_created,
    (
        SELECT COUNT(*)
        FROM time_entries
    ) AS time_entries_created;