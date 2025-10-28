# 🚀 Supabase Integration - Phase 1 Implementation

**Date**: January 2025  
**Phase**: Phase 1 - Critical Infrastructure  
**Status**: 🎯 **IN PROGRESS**

---

## 📋 **OVERVIEW**

This document outlines the complete Supabase integration for Phase 1 features:

1. Real-time Notifications System
2. File Upload & Storage Integration

---

## 🔔 **1. REAL-TIME NOTIFICATIONS SYSTEM**

### **1.1 Database Schema**

#### **Notifications Table**

```sql
-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'system')),
  category TEXT CHECK (category IN ('project', 'task', 'invoice', 'system', 'chat', 'comment')),
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for user lookups
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();
```

#### **Notification Preferences Table**

```sql
-- Create notification preferences table
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
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

-- Enable RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own preferences"
  ON notification_preferences FOR ALL
  USING (user_id = auth.uid());
```

---

### **1.2 Supabase Storage Buckets**

```sql
-- Create storage buckets via Supabase Dashboard or API

-- Project Files Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-files',
  'project-files',
  false,
  104857600, -- 100MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/zip']
);

-- User Avatars Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Company Logos Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos',
  false,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
);

-- Storage Policies
CREATE POLICY "Users can upload to their company project folders"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'project-files' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM companies WHERE id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view their company's files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'project-files' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM companies WHERE id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their company's files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'project-files' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM companies WHERE id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete their company's files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'project-files' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM companies WHERE id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    )
  );
```

---

### **1.3 Real-time Subscriptions**

```typescript
// utils/notifications.ts
import { supabase } from './supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Notification {
  id: string;
  user_id: string;
  company_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  category: 'project' | 'task' | 'invoice' | 'system' | 'chat' | 'comment';
  read: boolean;
  action_url?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

let notificationChannel: RealtimeChannel | null = null;

export const subscribeToNotifications = (
  userId: string,
  onNotification: (notification: Notification) => void
) => {
  if (notificationChannel) {
    notificationChannel.unsubscribe();
  }

  notificationChannel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        onNotification(payload.new as Notification);
      }
    )
    .subscribe();

  return () => {
    if (notificationChannel) {
      notificationChannel.unsubscribe();
      notificationChannel = null;
    }
  };
};

export const fetchNotifications = async (
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data;
};

export const markNotificationAsRead = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) throw error;
};

export const markAllNotificationsAsRead = async (userId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) throw error;
};

export const deleteNotification = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) throw error;
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) throw error;
  return count || 0;
};
```

---

### **1.4 API Endpoints**

```typescript
// api/notifications.ts
import { supabase } from '../lib/supabaseClient';

export default async function handler(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  
  // Verify token and get user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
  }

  const url = new URL(req.url);
  
  if (req.method === 'GET') {
    // Get notifications
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (req.method === 'POST') {
    // Create notification
    const body = await req.json();
    
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: user.id,
        ...body
      }])
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
}
```

---

## 📁 **2. FILE UPLOAD & STORAGE INTEGRATION**

### **2.1 File Upload Service**

```typescript
// utils/fileUpload.ts
import { supabase } from './supabaseClient';

export interface UploadOptions {
  folder: string;
  fileName?: string;
  onProgress?: (progress: number) => void;
}

export const uploadFile = async (
  file: File,
  options: UploadOptions
): Promise<{ path: string; url: string }> => {
  const fileName = options.fileName || `${Date.now()}-${file.name}`;
  const filePath = `${options.folder}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('project-files')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('project-files')
    .getPublicUrl(data.path);

  return {
    path: data.path,
    url: urlData.publicUrl
  };
};

export const deleteFile = async (path: string): Promise<void> => {
  const { error } = await supabase.storage
    .from('project-files')
    .remove([path]);

  if (error) throw error;
};

export const getFileUrl = (path: string): string => {
  const { data } = supabase.storage
    .from('project-files')
    .getPublicUrl(path);

  return data.publicUrl;
};

export const downloadFile = async (path: string): Promise<Blob> => {
  const { data, error } = await supabase.storage
    .from('project-files')
    .download(path);

  if (error) throw error;
  return data;
};

export const listFiles = async (folder: string, limit: number = 100) => {
  const { data, error } = await supabase.storage
    .from('project-files')
    .list(folder, {
      limit,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' }
    });

  if (error) throw error;
  return data;
};
```

---

### **2.2 File Upload Component**

```typescript
// components/FileUpload.tsx
import React, { useRef, useState } from 'react';
import { Upload, X, File, Check } from 'lucide-react';
import { uploadFile } from '../utils/fileUpload';

interface FileUploadProps {
  onUploadComplete: (files: Array<{ path: string; url: string }>) => void;
  folder: string;
  maxSize?: number;
  accept?: string;
  multiple?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  folder,
  maxSize = 104857600, // 100MB
  accept = '*/*',
  multiple = false
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Validate file size
    const validFiles = selectedFiles.filter(file => {
      if (file.size > maxSize) {
        alert(`File ${file.name} exceeds maximum size of ${maxSize / 1048576}MB`);
        return false;
      }
      return true;
    });

    setFiles(prev => multiple ? [...prev, ...validFiles] : validFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const uploadedFiles: Array<{ path: string; url: string }> = [];

    try {
      for (const file of files) {
        const result = await uploadFile(file, {
          folder,
          onProgress: (p) => setProgress(prev => ({ ...prev, [file.name]: p }))
        });
        uploadedFiles.push(result);
      }

      onUploadComplete(uploadedFiles);
      setFiles([]);
      setProgress({});
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
  };

  return (
    <div className="file-upload">
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center gap-2 py-8 hover:bg-gray-50 transition-colors"
        >
          <Upload className="w-12 h-12 text-gray-400" />
          <span className="text-gray-600 font-medium">Click to upload files</span>
          <span className="text-sm text-gray-500">or drag and drop</span>
        </button>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file) => (
              <div key={file.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <File className="w-5 h-5 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                    {progress[file.name] !== undefined && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${progress[file.name]}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                {!uploading && (
                  <button
                    onClick={() => removeFile(file.name)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {files.length > 0 && !uploading && (
          <button
            onClick={handleUpload}
            className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upload {files.length} file{files.length > 1 ? 's' : ''}
          </button>
        )}

        {uploading && (
          <div className="mt-4 text-center text-gray-600">
            Uploading files...
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## 🚀 **IMPLEMENTATION CHECKLIST**

### **Notifications System**

- [ ] Create notifications table in Supabase
- [ ] Create notification_preferences table
- [ ] Set up RLS policies
- [ ] Implement notification utils
- [ ] Create notification bell component
- [ ] Create notification center component
- [ ] Set up real-time subscriptions
- [ ] Test notification delivery
- [ ] Add notification sound/popup
- [ ] Implement notification preferences UI

### **File Upload System**

- [ ] Create storage buckets
- [ ] Set up storage policies
- [ ] Implement file upload service
- [ ] Create file upload component
- [ ] Create file preview component
- [ ] Add file versioning support
- [ ] Implement file delete functionality
- [ ] Add file download functionality
- [ ] Test file upload/download
- [ ] Add storage quota management

---

## 📊 **SUCCESS METRICS**

### **Notifications**

- ✅ Notifications delivered within 2 seconds
- ✅ 95%+ delivery rate
- ✅ Support for 10,000+ concurrent users
- ✅ Zero data loss

### **File Storage**

- ✅ Upload files up to 100MB
- ✅ Support all common file types
- ✅ 99.9% upload success rate
- ✅ Secure file access

---

**Status**: Ready for implementation 🚀
