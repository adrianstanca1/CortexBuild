# Priority 4: Feature Enhancements - Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing Priority 4 features:
1. Real-time Notifications System
2. Advanced Analytics Dashboard
3. Custom Reporting Tools

---

## Phase 1: Real-time Notifications System

### Step 1: Database Setup

Execute the SQL schema from `PRIORITY_4_DATABASE_SCHEMA.sql`:

```bash
# In Supabase SQL Editor, run:
-- Copy and paste the entire PRIORITY_4_DATABASE_SCHEMA.sql content
```

**Tables Created:**
- `notifications` - Stores all notifications
- `notification_preferences` - User notification settings
- RLS policies for security
- Triggers for automatic timestamp updates

### Step 2: Create Notification Service

Create `lib/services/notificationService.ts`:

```typescript
import { supabase } from '../supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  read: boolean;
  archived: boolean;
  action_url?: string;
  metadata?: any;
  created_at: string;
}

export class NotificationService {
  private channel: RealtimeChannel | null = null;

  // Subscribe to real-time notifications
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    this.channel = supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        callback(payload.new as Notification);
      })
      .subscribe();

    return () => this.unsubscribe();
  }

  // Fetch notifications
  async getNotifications(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('archived', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  // Mark as read
  async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  }

  // Archive notification
  async archiveNotification(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ archived: true })
      .eq('id', notificationId);

    if (error) throw error;
  }

  // Get preferences
  async getPreferences(userId: string) {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  // Update preferences
  async updatePreferences(userId: string, preferences: any) {
    const { error } = await supabase
      .from('notification_preferences')
      .update(preferences)
      .eq('user_id', userId);

    if (error) throw error;
  }

  // Unsubscribe
  unsubscribe() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}

export const notificationService = new NotificationService();
```

### Step 3: Create Notification Bell Component

Create `components/ui/NotificationBell.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { notificationService, Notification } from '../../lib/services/notificationService';

interface NotificationBellProps {
  userId: string;
  onNotificationClick?: (notification: Notification) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ userId, onNotificationClick }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Load initial notifications
    loadNotifications();

    // Subscribe to real-time updates
    const unsubscribe = notificationService.subscribeToNotifications(userId, (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return unsubscribe;
  }, [userId]);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications(userId, 10);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleMarkAsRead = async (notification: Notification) => {
    await notificationService.markAsRead(notification.id);
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    onNotificationClick?.(notification);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No notifications</div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                  onClick={() => handleMarkAsRead(notification)}
                >
                  <p className="font-medium text-gray-900">{notification.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{new Date(notification.created_at).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
```

### Step 4: Create Notification Preferences Component

Create `components/settings/NotificationPreferences.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { notificationService } from '../../lib/services/notificationService';
import toast from 'react-hot-toast';

interface NotificationPreferencesProps {
  userId: string;
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ userId }) => {
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, [userId]);

  const loadPreferences = async () => {
    try {
      const data = await notificationService.getPreferences(userId);
      setPreferences(data);
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: string) => {
    try {
      const updated = { ...preferences, [key]: !preferences[key] };
      await notificationService.updatePreferences(userId, { [key]: !preferences[key] });
      setPreferences(updated);
      toast.success('Preferences updated');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>

      <div className="space-y-4">
        {[
          { key: 'task_update_enabled', label: 'Task Updates' },
          { key: 'mention_enabled', label: 'Mentions' },
          { key: 'system_alert_enabled', label: 'System Alerts' },
          { key: 'comment_enabled', label: 'Comments' },
          { key: 'project_update_enabled', label: 'Project Updates' },
          { key: 'team_update_enabled', label: 'Team Updates' },
          { key: 'document_update_enabled', label: 'Document Updates' },
          { key: 'payment_update_enabled', label: 'Payment Updates' },
          { key: 'email_notifications_enabled', label: 'Email Notifications' },
          { key: 'push_notifications_enabled', label: 'Push Notifications' }
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <label className="text-gray-700">{label}</label>
            <input
              type="checkbox"
              checked={preferences[key] || false}
              onChange={() => handleToggle(key)}
              className="w-4 h-4"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## Phase 2: Advanced Analytics Dashboard

### Components to Create

1. **AdvancedAnalyticsDashboard.tsx** - Main dashboard
2. **MetricsChart.tsx** - Chart component
3. **KPICard.tsx** - KPI display
4. **ProjectMetrics.tsx** - Project metrics
5. **TeamPerformance.tsx** - Team analytics

### Key Features

- Real-time metrics tracking
- Multiple chart types (line, bar, pie, area)
- KPI cards with trends
- Project performance comparison
- Team productivity metrics
- Budget tracking and forecasting
- Data export (CSV, PDF)

---

## Phase 3: Custom Reporting Tools

### Components to Create

1. **ReportBuilder.tsx** - Custom report builder
2. **ReportTemplate.tsx** - Template selector
3. **ReportPreview.tsx** - Report preview
4. **ReportScheduler.tsx** - Schedule reports
5. **ReportShare.tsx** - Share reports

### Key Features

- Drag-and-drop report builder
- Pre-built templates
- Custom filters
- Multiple export formats
- Scheduled generation
- Email distribution

---

## Testing Checklist

### Real-time Notifications
- [ ] Notifications appear in real-time
- [ ] Mark as read works
- [ ] Archive functionality works
- [ ] Preferences are saved
- [ ] Email notifications work (if enabled)

### Advanced Analytics
- [ ] Charts render correctly
- [ ] Data updates in real-time
- [ ] Export functionality works
- [ ] Filters work correctly
- [ ] Performance is acceptable

### Custom Reporting
- [ ] Reports generate successfully
- [ ] Scheduling works
- [ ] Email distribution works
- [ ] Export formats work
- [ ] Permissions are enforced

---

## Performance Optimization

1. **Lazy load chart components**
2. **Implement data pagination**
3. **Cache analytics data**
4. **Optimize real-time subscriptions**
5. **Monitor bundle size impact**

---

## Security Considerations

1. **RLS policies** - Enforce row-level security
2. **Data validation** - Validate all inputs
3. **Access control** - Check permissions
4. **Audit logging** - Log all actions
5. **Data sanitization** - Sanitize exported data

---

## Deployment Steps

1. Execute database schema
2. Deploy notification service
3. Deploy UI components
4. Test all features
5. Monitor performance
6. Gather user feedback
7. Iterate and improve

---

## Success Metrics

- Notifications delivered in < 1 second
- 99.9% delivery rate
- Charts render in < 2 seconds
- Reports generated in < 10 seconds
- 99% uptime
- Zero security issues

---

## Next Steps

1. Review and approve plan
2. Execute database schema
3. Implement notification service
4. Create UI components
5. Test functionality
6. Deploy to production
7. Monitor and optimize

---

**Status:** Ready for Implementation
**Estimated Duration:** 2-3 weeks
**Priority:** High
**Impact:** High-value features

