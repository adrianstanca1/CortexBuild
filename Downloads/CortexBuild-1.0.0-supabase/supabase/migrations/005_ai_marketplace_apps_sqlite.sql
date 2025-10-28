-- SQLite Compatible AI Marketplace Apps Migration
-- Adds 4 premium AI-powered apps to the marketplace
-- Date: 2024-10-27

-- Insert Quality Control Vision AI App
INSERT OR REPLACE INTO sdk_apps (
  id,
  developer_id,
  company_id,
  name,
  description,
  icon,
  category,
  version,
  status,
  review_status,
  is_public,
  published_at,
  created_at,
  updated_at
) VALUES (
  'quality-control-vision-ai-001',
  'platform',
  NULL,
  'Quality Control Vision AI',
  'AI-powered image analysis for construction quality assessment. Automatically detect defects, verify compliance, and monitor progress through intelligent photo analysis. Features: Automated defect detection (92%+ accuracy), Compliance checking, Progress monitoring, Safety hazard identification, Material quality assessment. Pricing: £99/month or £999/year.',
  '📷',
  'AI & Automation',
  '1.0.0',
  'published',
  'approved',
  1,
  datetime('now'),
  datetime('now'),
  datetime('now')
);

-- Insert Document Intelligence App
INSERT OR REPLACE INTO sdk_apps (
  id,
  developer_id,
  company_id,
  name,
  description,
  icon,
  category,
  version,
  status,
  review_status,
  is_public,
  published_at,
  created_at,
  updated_at
) VALUES (
  'document-intelligence-ai-001',
  'platform',
  NULL,
  'Document Intelligence',
  'Extract insights from construction documents and blueprints using advanced OCR and AI. Automatically extract key data, dates, financial information, and ensure compliance. Features: Advanced OCR (95%+ accuracy), Document classification, Key date extraction, Financial data extraction, Compliance review, Contract clause analysis. Pricing: £89/month or £899/year.',
  '📄',
  'AI & Automation',
  '1.0.0',
  'published',
  'approved',
  1,
  datetime('now'),
  datetime('now'),
  datetime('now')
);

-- Insert Risk Assessment AI App
INSERT OR REPLACE INTO sdk_apps (
  id,
  developer_id,
  company_id,
  name,
  description,
  icon,
  category,
  version,
  status,
  review_status,
  is_public,
  published_at,
  created_at,
  updated_at
) VALUES (
  'risk-assessment-ai-001',
  'platform',
  NULL,
  'Risk Assessment AI',
  'Predictive analytics for project risk management. Identify potential risks before they become problems with machine learning-powered predictions and recommendations. Features: Real-time risk scoring (0-100), Schedule delay prediction (82%+ confidence), Budget overrun forecasting, Safety incident analysis, AI-generated mitigation strategies, Industry benchmarks. Pricing: £129/month or £1,290/year.',
  '⚠️',
  'Analytics & Reporting',
  '1.0.0',
  'published',
  'approved',
  1,
  datetime('now'),
  datetime('now'),
  datetime('now')
);

-- Insert Cost Optimization App
INSERT OR REPLACE INTO sdk_apps (
  id,
  developer_id,
  company_id,
  name,
  description,
  icon,
  category,
  version,
  status,
  review_status,
  is_public,
  published_at,
  created_at,
  updated_at
) VALUES (
  'cost-optimization-ai-001',
  'platform',
  NULL,
  'Cost Optimization AI',
  'AI-driven cost analysis and budget optimization. Identify savings opportunities, predict final costs, and optimize resource allocation with intelligent recommendations. Features: Budget health monitoring, Final cost prediction (84%+ confidence), AI-generated optimization opportunities, Cost breakdown analysis, ROI calculations, Industry benchmark comparison. Pricing: £119/month or £1,190/year.',
  '💰',
  'Financial',
  '1.0.0',
  'published',
  'approved',
  1,
  datetime('now'),
  datetime('now'),
  datetime('now')
);

-- Verify the apps were added
SELECT 'AI Apps Added Successfully:' as status;
SELECT id, name, category, icon, status FROM sdk_apps WHERE id LIKE '%ai%' ORDER BY name;
