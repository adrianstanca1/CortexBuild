-- Supabase Tables Setup for Phase 1 Features
-- Run this in Supabase SQL Editor
-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (
        type IN ('info', 'success', 'warning', 'error', 'system')
    ),
    category TEXT CHECK (
        category IN (
            'project',
            'task',
            'invoice',
            'system',
            'chat',
            'comment'
        )
    ),
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_company_id ON notifications(company_id);
-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications FOR
SELECT USING (user_id = auth.uid());
CREATE POLICY "System can insert notifications" ON notifications FOR
INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own notifications" ON notifications FOR
UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own notifications" ON notifications FOR DELETE USING (user_id = auth.uid());
-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_notifications_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER update_notifications_updated_at BEFORE
UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_notifications_updated_at();
-- 2. Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    email_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    categories JSONB DEFAULT '{
    "project": {"email": true, "push": true, "sms": false},
    "task": {"email": true, "push": true, "sms": false},
    "invoice": {"email": true, "push": false, "sms": false},
    "system": {"email": false, "push": true, "sms": false},
    "chat": {"email": false, "push": true, "sms": false},
    "comment": {"email": true, "push": true, "sms": false}
  }',
    quiet_hours_start TIME DEFAULT '22:00:00',
    quiet_hours_end TIME DEFAULT '08:00:00',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Enable RLS on notification_preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own preferences" ON notification_preferences FOR ALL USING (user_id = auth.uid());
-- 3. Create file_uploads table for tracking uploaded files
CREATE TABLE IF NOT EXISTS file_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    folder TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Create indexes for file_uploads
CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_company_id ON file_uploads(company_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_project_id ON file_uploads(project_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_folder ON file_uploads(folder);
CREATE INDEX IF NOT EXISTS idx_file_uploads_created_at ON file_uploads(created_at DESC);
-- Enable RLS on file_uploads
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
-- RLS Policies for file_uploads
CREATE POLICY "Users can view their company's files" ON file_uploads FOR
SELECT USING (
        company_id IN (
            SELECT company_id
            FROM users
            WHERE id = auth.uid()
        )
    );
CREATE POLICY "Users can upload files to their company" ON file_uploads FOR
INSERT WITH CHECK (
        company_id IN (
            SELECT company_id
            FROM users
            WHERE id = auth.uid()
        )
    );
CREATE POLICY "Users can update their company's files" ON file_uploads FOR
UPDATE USING (
        company_id IN (
            SELECT company_id
            FROM users
            WHERE id = auth.uid()
        )
    );
CREATE POLICY "Users can delete their company's files" ON file_uploads FOR DELETE USING (
    company_id IN (
        SELECT company_id
        FROM users
        WHERE id = auth.uid()
    )
);
-- Function to automatically update updated_at for file_uploads
CREATE OR REPLACE FUNCTION update_file_uploads_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER update_file_uploads_updated_at BEFORE
UPDATE ON file_uploads FOR EACH ROW EXECUTE FUNCTION update_file_uploads_updated_at();
-- 4. Create storage buckets (if they don't exist)
INSERT INTO storage.buckets (
        id,
        name,
        public,
        file_size_limit,
        allowed_mime_types
    )
VALUES (
        'project-files',
        'project-files',
        false,
        104857600,
        -- 100MB
        ARRAY ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip', 'text/plain', 'text/csv']
    ) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (
        id,
        name,
        public,
        file_size_limit,
        allowed_mime_types
    )
VALUES (
        'avatars',
        'avatars',
        true,
        5242880,
        -- 5MB
        ARRAY ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    ) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (
        id,
        name,
        public,
        file_size_limit,
        allowed_mime_types
    )
VALUES (
        'company-logos',
        'company-logos',
        false,
        5242880,
        -- 5MB
        ARRAY ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    ) ON CONFLICT (id) DO NOTHING;
-- 5. Storage Policies
CREATE POLICY "Users can upload to their company project folders" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id = 'project-files'
        AND (storage.foldername(name)) [1] IN (
            SELECT id::text
            FROM companies
            WHERE id IN (
                    SELECT company_id
                    FROM users
                    WHERE id = auth.uid()
                )
        )
    );
CREATE POLICY "Users can view their company's files" ON storage.objects FOR
SELECT USING (
        bucket_id = 'project-files'
        AND (storage.foldername(name)) [1] IN (
            SELECT id::text
            FROM companies
            WHERE id IN (
                    SELECT company_id
                    FROM users
                    WHERE id = auth.uid()
                )
        )
    );
CREATE POLICY "Users can update their company's files" ON storage.objects FOR
UPDATE USING (
        bucket_id = 'project-files'
        AND (storage.foldername(name)) [1] IN (
            SELECT id::text
            FROM companies
            WHERE id IN (
                    SELECT company_id
                    FROM users
                    WHERE id = auth.uid()
                )
        )
    );
CREATE POLICY "Users can delete their company's files" ON storage.objects FOR DELETE USING (
    bucket_id = 'project-files'
    AND (storage.foldername(name)) [1] IN (
        SELECT id::text
        FROM companies
        WHERE id IN (
                SELECT company_id
                FROM users
                WHERE id = auth.uid()
            )
    )
);
-- 6. Insert sample notification preferences for existing users
INSERT INTO notification_preferences (user_id)
SELECT id
FROM auth.users
WHERE id NOT IN (
        SELECT user_id
        FROM notification_preferences
    ) ON CONFLICT (user_id) DO NOTHING;
-- 7. Create a function to send notifications
CREATE OR REPLACE FUNCTION send_notification(
        p_user_id UUID,
        p_company_id UUID,
        p_title TEXT,
        p_message TEXT,
        p_type TEXT DEFAULT 'info',
        p_category TEXT DEFAULT 'system',
        p_action_url TEXT DEFAULT NULL,
        p_metadata JSONB DEFAULT '{}'
    ) RETURNS UUID AS $$
DECLARE notification_id UUID;
BEGIN
INSERT INTO notifications (
        user_id,
        company_id,
        title,
        message,
        type,
        category,
        action_url,
        metadata
    )
VALUES (
        p_user_id,
        p_company_id,
        p_title,
        p_message,
        p_type,
        p_category,
        p_action_url,
        p_metadata
    )
RETURNING id INTO notification_id;
RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION send_notification TO authenticated;
-- 8. Create a function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID) RETURNS INTEGER AS $$
DECLARE unread_count INTEGER;
BEGIN
SELECT COUNT(*) INTO unread_count
FROM notifications
WHERE user_id = p_user_id
    AND read = FALSE;
RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_unread_notification_count TO authenticated;
-- Success message
SELECT 'Supabase tables and policies created successfully!' as message;