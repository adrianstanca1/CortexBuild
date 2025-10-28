-- Seed SDK Templates for CortexBuild
-- Pre-built construction-specific app templates

-- 1. Automated RFI Response Generator
INSERT INTO sdk_templates (id, name, slug, description, category, icon, features, ai_enhanced, difficulty_level, estimated_time_minutes, is_active)
VALUES (
    'template-rfi-auto-response',
    'Automated RFI Response Generator',
    'rfi-auto-response',
    'AI-powered RFI response system that reads questions, searches project documents, and generates draft responses for human review.',
    'rfi',
    '📝',
    '["AI document search", "Auto-response generation", "Human review workflow", "Response templates", "Document linking"]',
    1,
    'intermediate',
    30,
    1
);

-- 2. Material Cost Estimator
INSERT INTO sdk_templates (id, name, slug, description, category, icon, features, ai_enhanced, difficulty_level, estimated_time_minutes, is_active)
VALUES (
    'template-material-estimator',
    'AI Material Cost Estimator',
    'material-cost-estimator',
    'Analyzes project plans, extracts material quantities, fetches current market prices, and generates detailed cost estimates.',
    'reporting',
    '💰',
    '["Plan analysis", "Quantity extraction", "Market price API", "Cost breakdown", "PDF export"]',
    1,
    'advanced',
    45,
    1
);

-- 3. Safety Compliance Checker
INSERT INTO sdk_templates (id, name, slug, description, category, icon, features, ai_enhanced, difficulty_level, estimated_time_minutes, is_active)
VALUES (
    'template-safety-checker',
    'Safety Compliance Checker',
    'safety-compliance-checker',
    'AI reviews safety inspection photos, identifies violations (missing PPE, unsafe conditions), and generates compliance reports.',
    'safety',
    '🦺',
    '["Photo analysis", "Violation detection", "Compliance scoring", "Alert system", "Report generation"]',
    1,
    'intermediate',
    35,
    1
);

-- 4. Progress Photo Analyzer
INSERT INTO sdk_templates (id, name, slug, description, category, icon, features, ai_enhanced, difficulty_level, estimated_time_minutes, is_active)
VALUES (
    'template-progress-analyzer',
    'Progress Photo Analyzer',
    'progress-photo-analyzer',
    'Analyzes construction photos, compares to schedule, estimates completion percentage, and identifies delays or issues.',
    'reporting',
    '📸',
    '["Image analysis", "Schedule comparison", "Completion tracking", "Issue detection", "Timeline visualization"]',
    1,
    'advanced',
    40,
    1
);

-- 5. Subcontractor Performance Scorer
INSERT INTO sdk_templates (id, name, slug, description, category, icon, features, ai_enhanced, difficulty_level, estimated_time_minutes, is_active)
VALUES (
    'template-subcontractor-scorer',
    'Subcontractor Performance Scorer',
    'subcontractor-performance-scorer',
    'AI analyzes on-time delivery, quality, budget adherence, and generates performance scores with recommendations.',
    'reporting',
    '⭐',
    '["Performance metrics", "Scoring algorithm", "Trend analysis", "Recommendations", "Comparison charts"]',
    1,
    'intermediate',
    25,
    1
);

-- 6. Change Order Impact Analyzer
INSERT INTO sdk_templates (id, name, slug, description, category, icon, features, ai_enhanced, difficulty_level, estimated_time_minutes, is_active)
VALUES (
    'template-change-order-analyzer',
    'Change Order Impact Analyzer',
    'change-order-impact-analyzer',
    'Analyzes proposed change orders, calculates impact on schedule, budget, and resources, and generates impact reports.',
    'workflow',
    '🔄',
    '["Impact calculation", "Schedule analysis", "Budget impact", "Risk identification", "Dependency mapping"]',
    1,
    'advanced',
    50,
    1
);

-- 7. Schedule Delay Predictor
INSERT INTO sdk_templates (id, name, slug, description, category, icon, features, ai_enhanced, difficulty_level, estimated_time_minutes, is_active)
VALUES (
    'template-delay-predictor',
    'Schedule Delay Predictor',
    'schedule-delay-predictor',
    'AI analyzes project data (weather, progress, resources) to predict likelihood of delays and suggest mitigation strategies.',
    'reporting',
    '⏰',
    '["Predictive analytics", "Weather integration", "Resource analysis", "Mitigation suggestions", "Risk scoring"]',
    1,
    'advanced',
    55,
    1
);

-- 8. Invoice Processing Agent
INSERT INTO sdk_templates (id, name, slug, description, category, icon, features, ai_enhanced, difficulty_level, estimated_time_minutes, is_active)
VALUES (
    'template-invoice-processor',
    'Invoice Processing Agent',
    'invoice-processing-agent',
    'Reads invoice PDFs/images, extracts vendor, amount, date, line items, validates against POs, and routes for approval.',
    'invoice',
    '📄',
    '["OCR extraction", "Data validation", "PO matching", "Approval routing", "Auto-categorization"]',
    1,
    'intermediate',
    30,
    1
);

-- 9. Daily Report Generator
INSERT INTO sdk_templates (id, name, slug, description, category, icon, features, ai_enhanced, difficulty_level, estimated_time_minutes, is_active)
VALUES (
    'template-daily-report',
    'AI Daily Report Generator',
    'daily-report-generator',
    'Automatically generates daily construction reports with weather, progress, issues, and photos. AI summarizes key points.',
    'reporting',
    '📊',
    '["Auto-generation", "Weather integration", "Photo inclusion", "AI summarization", "Email distribution"]',
    1,
    'beginner',
    20,
    1
);

-- 10. Client Communication Agent
INSERT INTO sdk_templates (id, name, slug, description, category, icon, features, ai_enhanced, difficulty_level, estimated_time_minutes, is_active)
VALUES (
    'template-client-communicator',
    'Client Communication Agent',
    'client-communication-agent',
    'Monitors client inquiries, responds to common questions automatically, escalates complex issues, and schedules meetings.',
    'workflow',
    '💬',
    '["Auto-response", "Inquiry classification", "Escalation rules", "Meeting scheduling", "Response templates"]',
    1,
    'intermediate',
    35,
    1
);

-- 11. Document Analysis Agent
INSERT INTO sdk_templates (id, name, slug, description, category, icon, features, ai_enhanced, difficulty_level, estimated_time_minutes, is_active)
VALUES (
    'template-document-analyzer',
    'Document Analysis Agent',
    'document-analysis-agent',
    'Reads construction documents (plans, specs, contracts), extracts key information, identifies risks, and creates summaries.',
    'workflow',
    '📋',
    '["Document parsing", "Key info extraction", "Risk identification", "Summary generation", "Conflict detection"]',
    1,
    'advanced',
    45,
    1
);

-- 12. Project Monitoring Agent
INSERT INTO sdk_templates (id, name, slug, description, category, icon, features, ai_enhanced, difficulty_level, estimated_time_minutes, is_active)
VALUES (
    'template-project-monitor',
    'Project Monitoring Agent',
    'project-monitoring-agent',
    'Tracks project milestones, monitors budget vs. actual costs, sends alerts when thresholds exceeded, generates weekly reports.',
    'workflow',
    '🎯',
    '["Milestone tracking", "Budget monitoring", "Alert system", "Weekly reports", "Threshold configuration"]',
    1,
    'intermediate',
    30,
    1
);

-- 13. Simple Invoice Tracker (Non-AI Template)
INSERT INTO sdk_templates (id, name, slug, description, category, icon, features, ai_enhanced, difficulty_level, estimated_time_minutes, is_active)
VALUES (
    'template-invoice-tracker',
    'Simple Invoice Tracker',
    'simple-invoice-tracker',
    'Basic invoice tracking system with status updates, payment tracking, and reporting. Great starter template.',
    'invoice',
    '💳',
    '["Invoice CRUD", "Status tracking", "Payment recording", "Basic reporting", "Export to CSV"]',
    0,
    'beginner',
    15,
    1
);

-- 14. Equipment Maintenance Scheduler
INSERT INTO sdk_templates (id, name, slug, description, category, icon, features, ai_enhanced, difficulty_level, estimated_time_minutes, is_active)
VALUES (
    'template-equipment-maintenance',
    'Equipment Maintenance Scheduler',
    'equipment-maintenance-scheduler',
    'Track equipment, schedule maintenance, log repairs, and get AI-powered maintenance predictions based on usage patterns.',
    'workflow',
    '🔧',
    '["Equipment tracking", "Maintenance scheduling", "Repair logging", "Usage analytics", "Predictive maintenance"]',
    1,
    'intermediate',
    35,
    1
);

-- 15. Time & Attendance Tracker
INSERT INTO sdk_templates (id, name, slug, description, category, icon, features, ai_enhanced, difficulty_level, estimated_time_minutes, is_active)
VALUES (
    'template-time-attendance',
    'Time & Attendance Tracker',
    'time-attendance-tracker',
    'Track worker hours, breaks, overtime, and generate payroll reports. Includes mobile check-in/out functionality.',
    'reporting',
    '⏱️',
    '["Time tracking", "Mobile check-in", "Overtime calculation", "Payroll export", "Attendance reports"]',
    0,
    'beginner',
    25,
    1
);

