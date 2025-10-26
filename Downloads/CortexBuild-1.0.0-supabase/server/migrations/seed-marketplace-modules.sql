-- Seed Marketplace with Sample Modules
-- Creates example modules for the CortexBuild marketplace

-- Get super admin user ID for developer_id
-- Note: In production, these would be created by actual developers

-- Insert sample modules
INSERT OR IGNORE INTO modules (developer_id, name, slug, description, category, version, price, is_free, status, published_at) VALUES
-- Analytics Modules
(1, 'Project Analytics Dashboard', 'project-analytics-dashboard', 'Comprehensive analytics dashboard with charts, KPIs, and insights for project performance tracking.', 'analytics', '1.2.0', 0, 1, 'published', datetime('now', '-30 days')),
(1, 'Revenue Forecasting Tool', 'revenue-forecasting', 'AI-powered revenue forecasting based on historical data and project pipeline.', 'analytics', '1.0.5', 29.99, 0, 'published', datetime('now', '-25 days')),
(1, 'Team Performance Metrics', 'team-performance-metrics', 'Track team productivity, task completion rates, and resource utilization.', 'analytics', '2.1.0', 0, 1, 'published', datetime('now', '-20 days')),

-- Automation Modules
(1, 'Auto Invoice Generator', 'auto-invoice-generator', 'Automatically generate and send invoices based on project milestones and time tracking.', 'automation', '1.5.2', 19.99, 0, 'published', datetime('now', '-28 days')),
(1, 'Smart Task Scheduler', 'smart-task-scheduler', 'AI-powered task scheduling that optimizes team workload and deadlines.', 'automation', '1.0.0', 0, 1, 'published', datetime('now', '-15 days')),
(1, 'Email Notification Hub', 'email-notification-hub', 'Centralized email notification system with customizable templates and triggers.', 'automation', '1.3.1', 0, 1, 'published', datetime('now', '-22 days')),

-- Communication Modules
(1, 'Client Portal', 'client-portal', 'Branded client portal for project updates, document sharing, and communication.', 'communication', '2.0.0', 49.99, 0, 'published', datetime('now', '-35 days')),
(1, 'Team Chat Widget', 'team-chat-widget', 'Real-time team chat widget that integrates with your dashboard.', 'communication', '1.1.0', 0, 1, 'published', datetime('now', '-18 days')),

-- Finance Modules
(1, 'Quick Invoice Creator', 'quick-invoice-creator', 'Create professional invoices in seconds with customizable templates.', 'finance', '1.4.0', 0, 1, 'published', datetime('now', '-27 days')),
(1, 'Expense Tracker Pro', 'expense-tracker-pro', 'Track project expenses, receipts, and generate expense reports.', 'finance', '1.2.3', 14.99, 0, 'published', datetime('now', '-12 days')),
(1, 'Payment Gateway Integration', 'payment-gateway', 'Accept online payments directly through your invoices (Stripe, PayPal).', 'finance', '1.0.8', 39.99, 0, 'published', datetime('now', '-10 days')),

-- Project Management Modules
(1, 'Gantt Chart Viewer', 'gantt-chart-viewer', 'Interactive Gantt charts for project timeline visualization.', 'project-management', '1.6.0', 0, 1, 'published', datetime('now', '-32 days')),
(1, 'Resource Allocation Tool', 'resource-allocation', 'Optimize resource allocation across multiple projects.', 'project-management', '1.1.5', 24.99, 0, 'published', datetime('now', '-14 days')),
(1, 'Risk Management Dashboard', 'risk-management', 'Identify, track, and mitigate project risks with AI insights.', 'project-management', '1.0.2', 0, 1, 'published', datetime('now', '-8 days')),

-- Integrations
(1, 'QuickBooks Sync', 'quickbooks-sync', 'Two-way sync with QuickBooks for seamless accounting integration.', 'integrations', '1.3.0', 29.99, 0, 'published', datetime('now', '-24 days')),
(1, 'Slack Integration', 'slack-integration', 'Get project notifications and updates directly in Slack.', 'integrations', '1.0.4', 0, 1, 'published', datetime('now', '-16 days')),
(1, 'Google Drive Connector', 'google-drive-connector', 'Sync documents and files with Google Drive.', 'integrations', '1.2.0', 0, 1, 'published', datetime('now', '-11 days')),

-- Utilities
(1, 'PDF Report Generator', 'pdf-report-generator', 'Generate beautiful PDF reports for projects, invoices, and analytics.', 'utilities', '1.5.1', 0, 1, 'published', datetime('now', '-26 days')),
(1, 'Data Export Tool', 'data-export-tool', 'Export your data to CSV, Excel, or JSON formats.', 'utilities', '1.0.0', 0, 1, 'published', datetime('now', '-9 days')),
(1, 'Custom Field Builder', 'custom-field-builder', 'Add custom fields to projects, clients, and invoices.', 'utilities', '1.1.2', 19.99, 0, 'published', datetime('now', '-7 days'));

-- Update download counts (simulate popularity)
UPDATE modules SET downloads = 1250 WHERE slug = 'project-analytics-dashboard';
UPDATE modules SET downloads = 890 WHERE slug = 'quick-invoice-creator';
UPDATE modules SET downloads = 756 WHERE slug = 'gantt-chart-viewer';
UPDATE modules SET downloads = 654 WHERE slug = 'team-chat-widget';
UPDATE modules SET downloads = 543 WHERE slug = 'auto-invoice-generator';
UPDATE modules SET downloads = 432 WHERE slug = 'client-portal';
UPDATE modules SET downloads = 387 WHERE slug = 'email-notification-hub';
UPDATE modules SET downloads = 298 WHERE slug = 'slack-integration';
UPDATE modules SET downloads = 245 WHERE slug = 'pdf-report-generator';
UPDATE modules SET downloads = 198 WHERE slug = 'smart-task-scheduler';
UPDATE modules SET downloads = 176 WHERE slug = 'team-performance-metrics';
UPDATE modules SET downloads = 154 WHERE slug = 'google-drive-connector';
UPDATE modules SET downloads = 132 WHERE slug = 'data-export-tool';
UPDATE modules SET downloads = 98 WHERE slug = 'revenue-forecasting';
UPDATE modules SET downloads = 87 WHERE slug = 'expense-tracker-pro';
UPDATE modules SET downloads = 76 WHERE slug = 'resource-allocation';
UPDATE modules SET downloads = 65 WHERE slug = 'risk-management';
UPDATE modules SET downloads = 54 WHERE slug = 'quickbooks-sync';
UPDATE modules SET downloads = 43 WHERE slug = 'payment-gateway';
UPDATE modules SET downloads = 32 WHERE slug = 'custom-field-builder';

-- Update ratings (simulate reviews)
UPDATE modules SET rating = 4.8, reviews_count = 124 WHERE slug = 'project-analytics-dashboard';
UPDATE modules SET rating = 4.9, reviews_count = 98 WHERE slug = 'quick-invoice-creator';
UPDATE modules SET rating = 4.7, reviews_count = 87 WHERE slug = 'gantt-chart-viewer';
UPDATE modules SET rating = 4.6, reviews_count = 76 WHERE slug = 'team-chat-widget';
UPDATE modules SET rating = 4.8, reviews_count = 65 WHERE slug = 'auto-invoice-generator';
UPDATE modules SET rating = 4.9, reviews_count = 54 WHERE slug = 'client-portal';
UPDATE modules SET rating = 4.5, reviews_count = 43 WHERE slug = 'email-notification-hub';
UPDATE modules SET rating = 4.7, reviews_count = 38 WHERE slug = 'slack-integration';
UPDATE modules SET rating = 4.6, reviews_count = 32 WHERE slug = 'pdf-report-generator';
UPDATE modules SET rating = 4.4, reviews_count = 28 WHERE slug = 'smart-task-scheduler';
UPDATE modules SET rating = 4.5, reviews_count = 24 WHERE slug = 'team-performance-metrics';
UPDATE modules SET rating = 4.6, reviews_count = 21 WHERE slug = 'google-drive-connector';
UPDATE modules SET rating = 4.3, reviews_count = 18 WHERE slug = 'data-export-tool';
UPDATE modules SET rating = 4.7, reviews_count = 15 WHERE slug = 'revenue-forecasting';
UPDATE modules SET rating = 4.5, reviews_count = 12 WHERE slug = 'expense-tracker-pro';
UPDATE modules SET rating = 4.4, reviews_count = 10 WHERE slug = 'resource-allocation';
UPDATE modules SET rating = 4.2, reviews_count = 8 WHERE slug = 'risk-management';
UPDATE modules SET rating = 4.6, reviews_count = 7 WHERE slug = 'quickbooks-sync';
UPDATE modules SET rating = 4.5, reviews_count = 6 WHERE slug = 'payment-gateway';
UPDATE modules SET rating = 4.1, reviews_count = 4 WHERE slug = 'custom-field-builder';

-- Set module permissions (all modules available to all roles by default)
INSERT OR IGNORE INTO module_permissions (module_id, role, can_install, can_configure, can_use)
SELECT id, 'super_admin', 1, 1, 1 FROM modules WHERE status = 'published'
UNION ALL
SELECT id, 'admin', 1, 1, 1 FROM modules WHERE status = 'published'
UNION ALL
SELECT id, 'manager', 0, 0, 1 FROM modules WHERE status = 'published'
UNION ALL
SELECT id, 'user', 0, 0, 1 FROM modules WHERE status = 'published';

