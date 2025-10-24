-- Priority 4: Feature Enhancements - Database Schema
-- Real-time Notifications, Advanced Analytics, and Custom Reporting

-- ============================================================================
-- FEATURE 1: REAL-TIME NOTIFICATIONS SYSTEM
-- ============================================================================

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL CHECK (type IN ('task_update', 'mention', 'system_alert', 'comment', 'project_update', 'team_update', 'document_update', 'payment_update')),
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  read BOOLEAN DEFAULT FALSE,
  archived BOOLEAN DEFAULT FALSE,
  action_url VARCHAR,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT notifications_user_id_idx UNIQUE (id, user_id)
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read) WHERE NOT read;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_priority ON notifications(priority);

-- Notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  task_update_enabled BOOLEAN DEFAULT TRUE,
  mention_enabled BOOLEAN DEFAULT TRUE,
  system_alert_enabled BOOLEAN DEFAULT TRUE,
  comment_enabled BOOLEAN DEFAULT TRUE,
  project_update_enabled BOOLEAN DEFAULT TRUE,
  team_update_enabled BOOLEAN DEFAULT TRUE,
  document_update_enabled BOOLEAN DEFAULT TRUE,
  payment_update_enabled BOOLEAN DEFAULT TRUE,
  email_notifications_enabled BOOLEAN DEFAULT FALSE,
  push_notifications_enabled BOOLEAN DEFAULT TRUE,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);

-- ============================================================================
-- FEATURE 2: ADVANCED ANALYTICS DASHBOARD
-- ============================================================================

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  event_type VARCHAR NOT NULL,
  metric_name VARCHAR NOT NULL,
  metric_value DECIMAL(10, 2),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_project_id ON analytics_events(project_id);
CREATE INDEX idx_analytics_events_company_id ON analytics_events(company_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);

-- Project metrics table (aggregated daily)
CREATE TABLE IF NOT EXISTS project_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  tasks_completed INTEGER DEFAULT 0,
  tasks_pending INTEGER DEFAULT 0,
  tasks_overdue INTEGER DEFAULT 0,
  team_hours DECIMAL(10, 2) DEFAULT 0,
  budget_spent DECIMAL(12, 2) DEFAULT 0,
  budget_remaining DECIMAL(12, 2) DEFAULT 0,
  progress_percentage DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(project_id, date)
);

CREATE INDEX idx_project_metrics_project_id ON project_metrics(project_id);
CREATE INDEX idx_project_metrics_date ON project_metrics(date DESC);

-- Team performance metrics table
CREATE TABLE IF NOT EXISTS team_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  tasks_completed INTEGER DEFAULT 0,
  hours_worked DECIMAL(10, 2) DEFAULT 0,
  productivity_score DECIMAL(5, 2) DEFAULT 0,
  quality_score DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(project_id, user_id, date)
);

CREATE INDEX idx_team_performance_project_id ON team_performance_metrics(project_id);
CREATE INDEX idx_team_performance_user_id ON team_performance_metrics(user_id);
CREATE INDEX idx_team_performance_date ON team_performance_metrics(date DESC);

-- ============================================================================
-- FEATURE 3: CUSTOM REPORTING TOOLS
-- ============================================================================

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  template_type VARCHAR NOT NULL CHECK (template_type IN ('project_summary', 'team_performance', 'budget_analysis', 'timeline_analysis', 'custom')),
  filters JSONB,
  schedule VARCHAR CHECK (schedule IN ('once', 'daily', 'weekly', 'monthly', 'never')),
  recipients TEXT[],
  last_generated_at TIMESTAMP,
  next_scheduled_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reports_created_by ON reports(created_by);
CREATE INDEX idx_reports_project_id ON reports(project_id);
CREATE INDEX idx_reports_company_id ON reports(company_id);
CREATE INDEX idx_reports_template_type ON reports(template_type);

-- Report templates table
CREATE TABLE IF NOT EXISTS report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR NOT NULL,
  sections JSONB NOT NULL,
  default_filters JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Report history table
CREATE TABLE IF NOT EXISTS report_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  generated_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_path VARCHAR,
  file_size INTEGER,
  format VARCHAR CHECK (format IN ('pdf', 'excel', 'csv', 'json')),
  status VARCHAR CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_report_history_report_id ON report_history(report_id);
CREATE INDEX idx_report_history_created_at ON report_history(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_history ENABLE ROW LEVEL SECURITY;

-- Notifications RLS policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Notification preferences RLS policies
CREATE POLICY "Users can view own preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Analytics events RLS policies
CREATE POLICY "Users can view project analytics"
  ON analytics_events FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Reports RLS policies
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  USING (created_by = auth.uid() OR project_id IN (
    SELECT id FROM projects WHERE company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own reports"
  ON reports FOR UPDATE
  USING (created_by = auth.uid());

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to create default notification preferences
CREATE OR REPLACE FUNCTION create_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create notification preferences on user creation
CREATE TRIGGER trigger_create_notification_preferences
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_notification_preferences();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER trigger_notifications_updated_at
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_notification_preferences_updated_at
BEFORE UPDATE ON notification_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_project_metrics_updated_at
BEFORE UPDATE ON project_metrics
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_team_performance_metrics_updated_at
BEFORE UPDATE ON team_performance_metrics
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_reports_updated_at
BEFORE UPDATE ON reports
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_report_templates_updated_at
BEFORE UPDATE ON report_templates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default report templates
INSERT INTO report_templates (name, category, sections, default_filters) VALUES
('Project Summary', 'project', '["overview", "timeline", "budget", "team"]', '{"date_range": "month"}'),
('Team Performance', 'team', '["productivity", "quality", "hours", "tasks"]', '{"date_range": "week"}'),
('Budget Analysis', 'budget', '["spent", "remaining", "forecast", "variance"]', '{"date_range": "month"}'),
('Timeline Analysis', 'timeline', '["schedule", "milestones", "delays", "forecast"]', '{"date_range": "project"}')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================
-- All tables, indexes, RLS policies, and functions have been created.
-- Ready for Priority 4 feature implementation.

