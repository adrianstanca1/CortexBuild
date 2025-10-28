-- AI Marketplace Apps Migration
-- Adds 4 premium AI-powered apps to the marketplace
-- Date: 2024-10-26

-- Insert Quality Control Vision AI App
INSERT INTO sdk_apps (
  id,
  developer_id,
  name,
  description,
  category,
  pricing_model,
  monthly_price,
  annual_price,
  features,
  icon,
  screenshots,
  version,
  status,
  homepage_url,
  documentation_url,
  support_email,
  tags,
  created_at,
  updated_at
) VALUES (
  'quality-control-vision-ai-001',
  'platform', -- Platform-provided app
  'Quality Control Vision AI',
  'AI-powered image analysis for construction quality assessment. Automatically detect defects, verify compliance, and monitor progress through intelligent photo analysis.',
  'AI & Automation',
  'subscription',
  99.00,
  999.00,
  ARRAY[
    'Automated defect detection with 92%+ accuracy',
    'Compliance checking against specifications',
    'Progress monitoring and verification',
    'Safety hazard identification',
    'Material quality assessment',
    'Workmanship review and scoring',
    'Detailed AI-generated reports',
    'Photo annotation and tagging'
  ]::text[],
  '📷',
  ARRAY['/screenshots/quality-control-1.png', '/screenshots/quality-control-2.png']::text[],
  '1.0.0',
  'published',
  'https://cortexbuild.io/apps/quality-control-vision',
  'https://docs.cortexbuild.io/quality-control-vision',
  'support@cortexbuild.io',
  ARRAY['AI', 'Quality Control', 'Computer Vision', 'Defect Detection', 'Safety']::text[],
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  updated_at = NOW();

-- Insert Document Intelligence App
INSERT INTO sdk_apps (
  id,
  developer_id,
  name,
  description,
  category,
  pricing_model,
  monthly_price,
  annual_price,
  features,
  icon,
  screenshots,
  version,
  status,
  homepage_url,
  documentation_url,
  support_email,
  tags,
  created_at,
  updated_at
) VALUES (
  'document-intelligence-ai-001',
  'platform',
  'Document Intelligence',
  'Extract insights from construction documents and blueprints using advanced OCR and AI. Automatically extract key data, dates, financial information, and ensure compliance.',
  'AI & Automation',
  'subscription',
  89.00,
  899.00,
  ARRAY[
    'Advanced OCR with 95%+ accuracy',
    'Automatic document type classification',
    'Key date extraction and tracking',
    'Financial data extraction',
    'Compliance review and verification',
    'Contract clause analysis',
    'Multi-format support (PDF, DOC, images)',
    'Searchable document archive'
  ]::text[],
  '📄',
  ARRAY['/screenshots/document-intelligence-1.png', '/screenshots/document-intelligence-2.png']::text[],
  '1.0.0',
  'published',
  'https://cortexbuild.io/apps/document-intelligence',
  'https://docs.cortexbuild.io/document-intelligence',
  'support@cortexbuild.io',
  ARRAY['AI', 'OCR', 'Document Analysis', 'Contract Management', 'Compliance']::text[],
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  updated_at = NOW();

-- Insert Risk Assessment AI App
INSERT INTO sdk_apps (
  id,
  developer_id,
  name,
  description,
  category,
  pricing_model,
  monthly_price,
  annual_price,
  features,
  icon,
  screenshots,
  version,
  status,
  homepage_url,
  documentation_url,
  support_email,
  tags,
  created_at,
  updated_at
) VALUES (
  'risk-assessment-ai-001',
  'platform',
  'Risk Assessment AI',
  'Predictive analytics for project risk management. Identify potential risks before they become problems with machine learning-powered predictions and recommendations.',
  'Analytics & Reporting',
  'subscription',
  129.00,
  1290.00,
  ARRAY[
    'Real-time risk scoring (0-100 scale)',
    'Schedule delay prediction with 82%+ confidence',
    'Budget overrun forecasting',
    'Safety incident probability analysis',
    'Multi-factor risk assessment',
    'AI-generated mitigation strategies',
    'Risk trend visualization',
    'Industry benchmark comparison'
  ]::text[],
  '⚠️',
  ARRAY['/screenshots/risk-assessment-1.png', '/screenshots/risk-assessment-2.png']::text[],
  '1.0.0',
  'published',
  'https://cortexbuild.io/apps/risk-assessment-ai',
  'https://docs.cortexbuild.io/risk-assessment-ai',
  'support@cortexbuild.io',
  ARRAY['AI', 'Risk Management', 'Predictive Analytics', 'Machine Learning', 'Safety']::text[],
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  updated_at = NOW();

-- Insert Cost Optimization App
INSERT INTO sdk_apps (
  id,
  developer_id,
  name,
  description,
  category,
  pricing_model,
  monthly_price,
  annual_price,
  features,
  icon,
  screenshots,
  version,
  status,
  homepage_url,
  documentation_url,
  support_email,
  tags,
  created_at,
  updated_at
) VALUES (
  'cost-optimization-ai-001',
  'platform',
  'Cost Optimization AI',
  'AI-driven cost analysis and budget optimization. Identify savings opportunities, predict final costs, and optimize resource allocation with intelligent recommendations.',
  'Financial',
  'subscription',
  119.00,
  1190.00,
  ARRAY[
    'Budget health monitoring',
    'Final cost prediction with 84%+ confidence',
    'AI-generated optimization opportunities',
    'Cost breakdown analysis',
    'ROI calculation for improvements',
    'Industry benchmark comparison',
    'Cost trend forecasting',
    'Savings opportunity identification'
  ]::text[],
  '💰',
  ARRAY['/screenshots/cost-optimization-1.png', '/screenshots/cost-optimization-2.png']::text[],
  '1.0.0',
  'published',
  'https://cortexbuild.io/apps/cost-optimization-ai',
  'https://docs.cortexbuild.io/cost-optimization-ai',
  'support@cortexbuild.io',
  ARRAY['AI', 'Cost Management', 'Budget Optimization', 'Financial Analysis', 'Predictive Analytics']::text[],
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  updated_at = NOW();

-- Create app analytics records for tracking
INSERT INTO app_analytics (
  app_id,
  installs,
  active_users,
  avg_rating,
  total_reviews,
  revenue_mtd,
  api_calls_today
) VALUES
  ('quality-control-vision-ai-001', 0, 0, 0.0, 0, 0.0, 0),
  ('document-intelligence-ai-001', 0, 0, 0.0, 0, 0.0, 0),
  ('risk-assessment-ai-001', 0, 0, 0.0, 0, 0.0, 0),
  ('cost-optimization-ai-001', 0, 0, 0.0, 0, 0.0, 0)
ON CONFLICT (app_id) DO NOTHING;

-- Add featured tags for marketplace promotion
UPDATE sdk_apps
SET featured = true
WHERE id IN (
  'quality-control-vision-ai-001',
  'document-intelligence-ai-001',
  'risk-assessment-ai-001',
  'cost-optimization-ai-001'
);

COMMENT ON TABLE sdk_apps IS 'Marketplace apps including AI-powered construction management tools';
COMMENT ON COLUMN sdk_apps.features IS 'Array of key features and capabilities of the app';
COMMENT ON COLUMN sdk_apps.tags IS 'Searchable tags for app discovery';
