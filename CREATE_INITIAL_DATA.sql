-- CortexBuild Initial Data Seed
-- Ensures baseline companies, users, and SDK integration data exist.
-- Run this script after applying the schema to populate the minimum viable dataset.

BEGIN TRANSACTION;

-- Companies ---------------------------------------------------------------
INSERT OR IGNORE INTO companies (id, name, industry, size, city, state, country)
VALUES
    (1, 'ConstructCo', 'Commercial Construction', '500+', 'San Francisco', 'CA', 'US'),
    (2, 'Metro Builders', 'Residential Construction', '200+', 'Austin', 'TX', 'US');

-- Password hashes generated with bcrypt (cost 10)
INSERT OR IGNORE INTO users (
    id, email, password, first_name, last_name, phone, role, company_id, is_active, email_verified
) VALUES
    (1, 'adrian.stanca1@gmail.com', '$2b$10$9XRnZE4YllqnMQ9rzno3BuwVXt0zOxsJ5cdpgiosgeGF8slxrwva2', 'Adrian', 'Stanca', '+1-555-0100', 'super_admin', 1, 1, 1),
    (2, 'adrian@ascladdingltd.co.uk', '$2b$10$YlCeQTdkB5cyjGvGgsSjBO8UG5uI/f7NWZP29WOKfdiqcupxPG44W', 'Adrian', 'Cladding', '+44-20-5550-1020', 'company_admin', 2, 1, 1),
    (3, 'dev@constructco.com', '$2b$10$AK62gIQ9xOQkhQc4MbHnAOj/9zhw/oMdgDbw1wwiaTEutvp4Ocki.', 'Dana', 'Builder', '+1-555-0200', 'developer', 1, 1, 1);

-- SDK Profiles ------------------------------------------------------------
INSERT OR IGNORE INTO sdk_profiles (
    id, user_id, subscription_tier, api_requests_used, api_requests_limit, gemini_api_key
) VALUES
    ('sdk-profile-superadmin', 1, 'enterprise', 2450, 100000, 'enc::superadmin-gemini-key'),
    ('sdk-profile-dev-primary', 2, 'pro', 1250, 10000, 'enc::developer-gemini-key');

-- API Keys ----------------------------------------------------------------
INSERT OR IGNORE INTO api_keys (
    id, user_id, name, key_hash, key_prefix, scopes, is_active
) VALUES
    (1, 2, 'Primary SDK Key', '$2a$10$H5nB2G7KZf4E0Pp9z0VSb.vr1VbVbQhYpbx8b9rh0lYUFgA8wyTgC', 'sdk_dev_01', '["sdk:read","sdk:write","sandbox:run"]', 1);

-- SDK Apps ----------------------------------------------------------------
INSERT OR IGNORE INTO sdk_apps (
    id, developer_id, company_id, name, description, version, status, code
) VALUES
    ('sdk-app-smart-scheduler', 2, 1, 'Smart Scheduler', 'AI-assisted scheduling assistant for field crews.', '1.2.0', 'approved', '// Smart Scheduler core implementation');

-- SDK Workflows -----------------------------------------------------------
INSERT OR IGNORE INTO sdk_workflows (
    id, developer_id, company_id, name, definition, is_active
) VALUES
    ('sdk-workflow-rfi-digest', 2, 1, 'Morning RFI Digest',
     '{"nodes":[{"id":"trigger","type":"trigger","name":"6am schedule","config":{"cron":"0 6 * * *"}},{"id":"aggregate","type":"action","name":"Aggregate RFIs","config":{"source":"projects"}},{"id":"notify","type":"action","name":"Notify PM","config":{"channel":"email"}}],"connections":[{"id":"c1","source":"trigger","target":"aggregate"},{"id":"c2","source":"aggregate","target":"notify"}]}',
     1);

-- Builder Modules ---------------------------------------------------------
INSERT OR IGNORE INTO builder_modules (
    id, user_id, company_id, name, description, version, status, manifest
) VALUES
    ('builder-module-safety-audit', 2, 1, 'Safety Audit Automation', 'Automates safety inspection summaries and alerts.', '1.0.3', 'published',
     '{"nodes":[{"id":"start","type":"trigger","name":"Inspection Completed","config":{"event":"inspection.completed"}},{"id":"summarise","type":"action","name":"Summarise Report","config":{"provider":"openai"}},{"id":"notify","type":"action","name":"Notify Safety Lead","config":{"channel":"slack"}}],"connections":[{"id":"c1","source":"start","target":"summarise"},{"id":"c2","source":"summarise","target":"notify"}],"metadata":{"testPayload":{"inspectionId":"insp-001"}}}');

-- Sandbox Runs ------------------------------------------------------------
INSERT OR IGNORE INTO sandbox_runs (
    id, user_id, company_id, name, definition, result, status, duration_ms, input_payload
) VALUES
    ('sandbox-run-demo-1', 2, 1, 'Smart Scheduler QA',
     '{"appId":"sdk-app-smart-scheduler"}',
     '{"executedAt":"2025-01-15T14:05:00.000Z","result":"Simulation completed successfully","logs":["Sandbox initialised","Module executed","Summary generated"]}',
     'completed', 1842,
     '{"projectId":"proj-001","forecastDays":7}');

-- Developer Console Events -------------------------------------------------
INSERT OR IGNORE INTO developer_console_events (
    id, user_id, company_id, event_type, payload
) VALUES
    ('dev-event-1', 2, 1, 'sandbox.run', '{"result":"completed","durationMs":1842}'),
    ('dev-event-2', 2, 1, 'modules.publish', '{"appId":"sdk-app-smart-scheduler","newStatus":"approved"}');

-- API Usage Logs ----------------------------------------------------------
INSERT OR IGNORE INTO api_usage_logs (
    id, user_id, provider, model, prompt_tokens, completion_tokens, total_tokens, cost
) VALUES
    ('usage-log-1', 2, 'openai', 'gpt-4o-mini', 1200, 800, 2000, 3.60);

-- AI Agents ---------------------------------------------------------------
INSERT OR IGNORE INTO ai_agents (
    id, slug, company_id, developer_id, name, description, status, is_global, tags, capabilities, config
) VALUES
    ('agent-site-monitor', 'site-monitor', 1, 2, 'Site Monitor Agent', 'Observes site activity logs and flags anomalies.', 'running', 0,
     '["safety","monitoring"]', '{"canEscalate":true}', '{"inputs":["siteLogs"],"outputs":["alerts"]}');

-- Agent Subscriptions -----------------------------------------------------
INSERT OR IGNORE INTO agent_subscriptions (
    id, company_id, agent_id, status, seats
) VALUES
    ('agent-subscription-1', 1, 'agent-site-monitor', 'active', 15);

-- Agent Executions --------------------------------------------------------
INSERT OR IGNORE INTO agent_executions (
    id, agent_id, company_id, triggered_by, input_payload, output_payload, status, duration_ms
) VALUES
    ('agent-exec-1', 'agent-site-monitor', 1, 'dev@constructco.com', '{"site":"Tower-A"}', '{"alerts":0}', 'completed', 642);

-- Sandbox Environments ----------------------------------------------------
INSERT OR IGNORE INTO sandbox_environments (
    id, user_id, name, description, config, is_active
) VALUES
    (1, 2, 'Developer Sandbox', 'Primary SDK testing environment.', '{"region":"us-west","features":["sdk","automation","agents"]}', 1);

-- Webhooks ----------------------------------------------------------------
INSERT OR IGNORE INTO webhooks (
    id, user_id, company_id, name, url, events, secret, is_active, success_count, failure_count
) VALUES
    (1, 2, 1, 'Sandbox Events Hook', 'https://hooks.constructco.com/sandbox', '["sandbox.run","modules.publish"]', 'whsec_demo_123', 1, 42, 1);

-- Webhook Logs ------------------------------------------------------------
INSERT OR IGNORE INTO webhook_logs (
    id, webhook_id, status_code, response_ms, error_message
) VALUES
    (1, 1, 200, 350, NULL),
    (2, 1, 500, 420, 'Timeout while delivering payload');

COMMIT;

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