-- Enhanced Notifications Schema Migration
-- Adds priority, channels, expiration, and improved categorization

-- Add new columns to notifications table
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS channels JSONB DEFAULT '["in_app"]' CHECK (
    channels <@ '["in_app", "email", "push", "sms"]'::jsonb
),
ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'system' CHECK (
    source_type IN ('system', 'user', 'task', 'project', 'milestone', 'deadline', 'comment', 'file', 'integration')
),
ADD COLUMN IF NOT EXISTS source_id TEXT,
ADD COLUMN IF NOT EXISTS recipient_role TEXT,
ADD COLUMN IF NOT EXISTS company_wide BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS dismissed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS phone TEXT,

-- Add new columns to notification_preferences table
ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS priority_filter JSONB DEFAULT '["low", "medium", "high", "urgent"]',
ADD COLUMN IF NOT EXISTS quiet_hours_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS max_notifications_per_hour INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS digest_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS digest_frequency TEXT DEFAULT 'daily' CHECK (digest_frequency IN ('hourly', 'daily', 'weekly'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_source ON notifications(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_notifications_company_wide ON notifications(company_wide) WHERE company_wide = TRUE;
CREATE INDEX IF NOT EXISTS idx_notifications_dismissed ON notifications(dismissed_at) WHERE dismissed_at IS NOT NULL;

-- Create notification_channels table for multi-channel delivery tracking
CREATE TABLE IF NOT EXISTS notification_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('in_app', 'email', 'push', 'sms')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    error_message TEXT,
    external_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for notification_channels
CREATE INDEX IF NOT EXISTS idx_notification_channels_notification_id ON notification_channels(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_channels_channel ON notification_channels(channel);
CREATE INDEX IF NOT EXISTS idx_notification_channels_status ON notification_channels(status);
CREATE INDEX IF NOT EXISTS idx_notification_channels_sent_at ON notification_channels(sent_at);

-- Enable RLS on notification_channels
ALTER TABLE notification_channels ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_channels
CREATE POLICY "Users can view their notification channels" ON notification_channels FOR
SELECT USING (
    notification_id IN (
        SELECT id FROM notifications WHERE user_id = auth.uid()
    )
);

CREATE POLICY "System can manage notification channels" ON notification_channels FOR ALL
USING (true);

-- Create notification_templates table for reusable notification templates
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    title_template TEXT NOT NULL,
    message_template TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    channels JSONB DEFAULT '["in_app"]',
    variables JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for notification_templates
CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON notification_templates(type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_category ON notification_templates(category);
CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON notification_templates(is_active);

-- Enable RLS on notification_templates
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_templates
CREATE POLICY "Users can view active templates" ON notification_templates FOR
SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage templates" ON notification_templates FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_notification_channels_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_channels_updated_at BEFORE
UPDATE ON notification_channels FOR EACH ROW EXECUTE FUNCTION update_notification_channels_updated_at();

-- Function to automatically update updated_at for templates
CREATE OR REPLACE FUNCTION update_notification_templates_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_templates_updated_at BEFORE
UPDATE ON notification_templates FOR EACH ROW EXECUTE FUNCTION update_notification_templates_updated_at();

-- Enhanced function to send notifications with templates and multi-channel support
CREATE OR REPLACE FUNCTION send_notification_enhanced(
    p_user_id UUID,
    p_company_id UUID,
    p_template_name TEXT DEFAULT NULL,
    p_title TEXT DEFAULT NULL,
    p_message TEXT DEFAULT NULL,
    p_type TEXT DEFAULT 'info',
    p_category TEXT DEFAULT 'system',
    p_priority TEXT DEFAULT 'medium',
    p_channels JSONB DEFAULT '["in_app"]',
    p_action_url TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}',
    p_expires_at TIMESTAMPTZ DEFAULT NULL,
    p_source_type TEXT DEFAULT 'system',
    p_source_id TEXT DEFAULT NULL,
    p_company_wide BOOLEAN DEFAULT FALSE
) RETURNS UUID AS $$
DECLARE
    notification_id UUID;
    template_record RECORD;
    final_title TEXT;
    final_message TEXT;
BEGIN
    -- Get template if provided
    IF p_template_name IS NOT NULL THEN
        SELECT * INTO template_record
        FROM notification_templates
        WHERE name = p_template_name AND is_active = TRUE;

        IF FOUND THEN
            final_title := template_record.title_template;
            final_message := template_record.message_template;
            p_type := template_record.type;
            p_category := template_record.category;
            p_priority := COALESCE(p_priority, template_record.priority, 'medium');
            p_channels := COALESCE(p_channels, template_record.channels, '["in_app"]'::jsonb);
        END IF;
    END IF;

    -- Use provided values if template not found or not provided
    final_title := COALESCE(final_title, p_title, 'Notification');
    final_message := COALESCE(final_message, p_message, 'You have a new notification');

    -- Insert notification
    INSERT INTO notifications (
        user_id,
        company_id,
        title,
        message,
        type,
        category,
        priority,
        channels,
        action_url,
        metadata,
        expires_at,
        source_type,
        source_id,
        company_wide
    )
    VALUES (
        p_user_id,
        p_company_id,
        final_title,
        final_message,
        p_type,
        p_category,
        p_priority,
        p_channels,
        p_action_url,
        p_metadata,
        p_expires_at,
        p_source_type,
        p_source_id,
        p_company_wide
    )
    RETURNING id INTO notification_id;

    -- Create channel delivery records
    INSERT INTO notification_channels (notification_id, channel, status)
    SELECT notification_id, channel, 'pending'
    FROM jsonb_array_elements_text(p_channels) AS channel;

    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION send_notification_enhanced TO authenticated;

-- Function to clean up expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications() RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications
    WHERE expires_at IS NOT NULL
    AND expires_at < NOW()
    AND read = FALSE;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION cleanup_expired_notifications TO authenticated;

-- Insert default notification templates
INSERT INTO notification_templates (name, title_template, message_template, type, category, priority, channels, variables) VALUES
('task_assigned', 'New Task Assigned', 'You have been assigned a new task: {task_name}', 'info', 'task', 'medium', '["in_app", "push"]', '{"task_name": "string", "task_id": "string", "project_name": "string"}'),
('task_deadline_approaching', 'Task Deadline Approaching', 'Task "{task_name}" is due in {days_until_due} days', 'warning', 'task', 'high', '["in_app", "push", "email"]', '{"task_name": "string", "task_id": "string", "days_until_due": "number", "due_date": "string"}'),
('task_overdue', 'Task Overdue', 'Task "{task_name}" is now overdue by {days_overdue} days', 'error', 'task', 'urgent', '["in_app", "push", "email", "sms"]', '{"task_name": "string", "task_id": "string", "days_overdue": "number", "due_date": "string"}'),
('project_milestone', 'Project Milestone Reached', 'Project "{project_name}" has reached {milestone_name} milestone', 'success', 'project', 'medium', '["in_app", "push"]', '{"project_name": "string", "project_id": "string", "milestone_name": "string"}'),
('project_deadline_approaching', 'Project Deadline Approaching', 'Project "{project_name}" deadline is approaching in {days_until_due} days', 'warning', 'project', 'high', '["in_app", "push", "email"]', '{"project_name": "string", "project_id": "string", "days_until_due": "number", "deadline": "string"}'),
('comment_mention', 'You were mentioned in a comment', '{user_name} mentioned you in a comment: "{comment_text}"', 'info', 'comment', 'medium', '["in_app", "push"]', '{"user_name": "string", "comment_text": "string", "comment_id": "string", "source_type": "string", "source_id": "string"}'),
('file_shared', 'File shared with you', '{user_name} shared a file "{file_name}" with you', 'info', 'file', 'low', '["in_app"]', '{"user_name": "string", "file_name": "string", "file_id": "string", "file_url": "string"}'),
('system_maintenance', 'Scheduled Maintenance', 'System maintenance scheduled for {maintenance_date}. Expected downtime: {downtime_duration}', 'warning', 'system', 'medium', '["in_app", "email"]', '{"maintenance_date": "string", "downtime_duration": "string", "maintenance_type": "string"}')
ON CONFLICT (name) DO NOTHING;

-- Success message
SELECT 'Enhanced notifications schema created successfully!' as message;
