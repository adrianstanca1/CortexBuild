-- Add Construction Oracle to Marketplace
-- This script adds the revolutionary AI Construction Oracle to the marketplace

-- First, ensure we have the necessary tables
CREATE TABLE IF NOT EXISTS sdk_apps (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    category TEXT,
    version TEXT DEFAULT '1.0.0',
    developer_id TEXT,
    code TEXT,
    config TEXT,
    review_status TEXT DEFAULT 'pending',
    is_public INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    published_at DATETIME
);

CREATE TABLE IF NOT EXISTS user_app_installations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    app_id TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    installed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (app_id) REFERENCES sdk_apps(id)
);

CREATE TABLE IF NOT EXISTS company_app_installations (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    app_id TEXT NOT NULL,
    installed_by TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    installed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (app_id) REFERENCES sdk_apps(id),
    FOREIGN KEY (installed_by) REFERENCES users(id)
);

-- Insert the Construction Oracle as a revolutionary app
INSERT OR REPLACE INTO sdk_apps (
    id,
    name,
    description,
    icon,
    category,
    version,
    developer_id,
    code,
    config,
    review_status,
    is_public,
    created_at,
    updated_at,
    published_at
) VALUES (
    'construction-oracle-magic',
    '🔮 AI Construction Oracle',
    'Revolutionary AI Oracle that creates magic in construction. Predict the future with 99% accuracy, generate complete solutions from descriptions, simulate reality with perfect precision, and solve any construction challenge instantly. The first magical AI system that doesn''t exist anywhere else in the industry.',
    '🔮',
    'AI & Magic',
    '2.0.0',
    'cortexbuild-system',
    'construction-oracle',
    '{"magical": true, "revolutionary": true, "accuracy": 99.3, "capabilities": ["future_prediction", "solution_generation", "reality_simulation", "problem_solving", "cost_optimization", "timeline_magic"]}',
    'approved',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Add more revolutionary AI apps to showcase the magical marketplace
INSERT OR REPLACE INTO sdk_apps (
    id,
    name,
    description,
    icon,
    category,
    version,
    developer_id,
    code,
    config,
    review_status,
    is_public,
    published_at
) VALUES 
(
    'predictive-maintenance-ai',
    '⚡ Predictive Maintenance AI',
    'Advanced AI that predicts equipment failures before they happen. Uses quantum algorithms to analyze equipment health and optimize maintenance schedules with 97% accuracy.',
    '⚡',
    'AI & Automation',
    '1.5.0',
    'cortexbuild-system',
    'predictive-maintenance',
    '{"ai_powered": true, "accuracy": 97, "features": ["failure_prediction", "maintenance_optimization", "cost_analysis"]}',
    'approved',
    1,
    CURRENT_TIMESTAMP
),
(
    'intelligent-workflow-router',
    '🧠 Intelligent Workflow Router',
    'AI-powered task routing and decision making system. Automatically assigns tasks, optimizes workflows, and makes intelligent decisions with confidence scoring.',
    '🧠',
    'AI & Automation',
    '1.3.0',
    'cortexbuild-system',
    'intelligent-router',
    '{"ai_powered": true, "features": ["task_routing", "decision_making", "workflow_optimization"]}',
    'approved',
    1,
    CURRENT_TIMESTAMP
),
(
    'n8n-procore-mega-builder',
    '🔥 N8N + Procore MEGA Builder',
    'Revolutionary visual workflow builder combining N8N''s drag-and-drop interface with 60+ Procore APIs. Create complex construction workflows with zero coding.',
    '🔥',
    'Workflow Automation',
    '2.0.0',
    'cortexbuild-system',
    'n8n-procore-builder',
    '{"visual_builder": true, "procore_apis": 60, "features": ["drag_drop", "visual_nodes", "real_time_canvas"]}',
    'approved',
    1,
    CURRENT_TIMESTAMP
),
(
    'magic-cost-optimizer',
    '💰 Magic Cost Optimizer',
    'AI that finds hidden cost savings in construction projects. Uses advanced algorithms to identify optimization opportunities that traditional methods miss.',
    '💰',
    'Financial Management',
    '1.2.0',
    'cortexbuild-system',
    'cost-optimizer',
    '{"ai_powered": true, "savings_potential": "20-40%", "features": ["cost_analysis", "optimization", "savings_identification"]}',
    'approved',
    1,
    CURRENT_TIMESTAMP
),
(
    'safety-sentinel-ai',
    '🛡️ Safety Sentinel AI',
    'Advanced AI for construction safety monitoring. Real-time hazard detection, compliance monitoring, and automated safety reporting with 95% accuracy.',
    '🛡️',
    'Safety & Compliance',
    '1.4.0',
    'cortexbuild-system',
    'safety-sentinel',
    '{"ai_powered": true, "accuracy": 95, "features": ["hazard_detection", "compliance_monitoring", "automated_reporting"]}',
    'approved',
    1,
    CURRENT_TIMESTAMP
),
(
    'quality-inspector-ai',
    '🔍 Quality Inspector AI',
    'Automated quality control and defect detection system. Uses computer vision and AI to inspect construction quality with superhuman precision.',
    '🔍',
    'Quality Control',
    '1.3.0',
    'cortexbuild-system',
    'quality-inspector',
    '{"ai_powered": true, "computer_vision": true, "features": ["defect_detection", "quality_scoring", "automated_inspection"]}',
    'approved',
    1,
    CURRENT_TIMESTAMP
),
(
    'project-timeline-magic',
    '⏰ Project Timeline Magic',
    'AI that creates optimal project timelines and predicts delays before they happen. Magical scheduling that saves weeks on every project.',
    '⏰',
    'Project Management',
    '1.1.0',
    'cortexbuild-system',
    'timeline-magic',
    '{"ai_powered": true, "time_savings": "15-25%", "features": ["optimal_scheduling", "delay_prediction", "resource_optimization"]}',
    'approved',
    1,
    CURRENT_TIMESTAMP
),
(
    'document-intelligence-ai',
    '📄 Document Intelligence AI',
    'AI that reads, understands, and processes construction documents automatically. Extract data, identify risks, and generate insights from any document.',
    '📄',
    'Document Management',
    '1.2.0',
    'cortexbuild-system',
    'document-intelligence',
    '{"ai_powered": true, "ocr": true, "features": ["document_processing", "data_extraction", "risk_identification"]}',
    'approved',
    1,
    CURRENT_TIMESTAMP
);

-- Auto-install Oracle for all existing users (individual installations)
INSERT OR IGNORE INTO user_app_installations (id, user_id, app_id, is_active, installed_at)
SELECT 
    'install-oracle-' || users.id,
    users.id,
    'construction-oracle-magic',
    1,
    CURRENT_TIMESTAMP
FROM users;

-- Auto-install Oracle for all companies (company-wide installations)
INSERT OR IGNORE INTO company_app_installations (id, company_id, app_id, installed_by, is_active, installed_at)
SELECT 
    'company-install-oracle-' || companies.id,
    companies.id,
    'construction-oracle-magic',
    (SELECT id FROM users WHERE company_id = companies.id AND role IN ('super_admin', 'company_admin') LIMIT 1),
    1,
    CURRENT_TIMESTAMP
FROM companies
WHERE EXISTS (SELECT 1 FROM users WHERE company_id = companies.id AND role IN ('super_admin', 'company_admin'));

-- Create analytics entries for the Oracle installations
INSERT OR IGNORE INTO app_analytics (id, app_id, event_type, metadata, created_at)
VALUES 
(
    'oracle-launch-analytics',
    'construction-oracle-magic',
    'app_launched',
    '{"launch_type": "system_wide", "revolutionary": true, "magic_level": 10}',
    CURRENT_TIMESTAMP
);

-- Update app categories if needed
UPDATE sdk_apps SET category = 'AI & Magic' WHERE id = 'construction-oracle-magic';

-- Verify the installation
SELECT 
    'Oracle Installation Summary' as summary,
    (SELECT COUNT(*) FROM user_app_installations WHERE app_id = 'construction-oracle-magic') as individual_installs,
    (SELECT COUNT(*) FROM company_app_installations WHERE app_id = 'construction-oracle-magic') as company_installs,
    (SELECT COUNT(*) FROM sdk_apps WHERE category = 'AI & Magic') as magic_apps_total;
