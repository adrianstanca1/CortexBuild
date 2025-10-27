export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system';

export type NotificationCategory =
  | 'project'
  | 'task'
  | 'invoice'
  | 'system'
  | 'chat'
  | 'comment'
  | 'file'
  | 'milestone'
  | 'deadline'
  | 'integration';

export type NotificationChannel = 'in_app' | 'email' | 'push' | 'sms';

export type NotificationSourceType =
  | 'system'
  | 'user'
  | 'task'
  | 'project'
  | 'milestone'
  | 'deadline'
  | 'comment'
  | 'file'
  | 'integration';

export type ChannelStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';

export type DigestFrequency = 'hourly' | 'daily' | 'weekly';

export interface Notification {
  id: string;
  user_id: string;
  company_id?: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  read: boolean;
  action_url?: string;
  metadata: Record<string, any>;
  expires_at?: string;
  source_type?: NotificationSourceType;
  source_id?: string;
  recipient_role?: string;
  company_wide: boolean;
  dismissed_at?: string;
  clicked_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationChannelDelivery {
  id: string;
  notification_id: string;
  channel: NotificationChannel;
  status: ChannelStatus;
  sent_at?: string;
  delivered_at?: string;
  failed_at?: string;
  error_message?: string;
  external_id?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title_template: string;
  message_template: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  variables: Record<string, string>;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  categories: Record<NotificationCategory, {
    email: boolean;
    push: boolean;
    sms: boolean;
  }>;
  priority_filter: NotificationPriority[];
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  max_notifications_per_hour: number;
  digest_enabled: boolean;
  digest_frequency: DigestFrequency;
  created_at: string;
  updated_at: string;
}

export interface NotificationSummary {
  total: number;
  unread: number;
  high_priority: number;
  by_type: Record<string, number>;
  by_category: Record<NotificationCategory, number>;
  by_priority: Record<NotificationPriority, number>;
}

export interface NotificationFilters {
  read?: boolean;
  type?: NotificationType[];
  category?: NotificationCategory[];
  priority?: NotificationPriority[];
  source_type?: NotificationSourceType[];
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface CreateNotificationRequest {
  user_id: string;
  company_id?: string;
  template_name?: string;
  title?: string;
  message?: string;
  type?: NotificationType;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
  action_url?: string;
  metadata?: Record<string, any>;
  expires_at?: string;
  source_type?: NotificationSourceType;
  source_id?: string;
  company_wide?: boolean;
}

export interface UpdateNotificationRequest {
  read?: boolean;
  dismissed?: boolean;
  clicked?: boolean;
}

export interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  preferences: NotificationPreferences | null;
  summary: NotificationSummary | null;

  // Actions
  fetchNotifications: (filters?: NotificationFilters) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  dismissNotification: (notificationId: string) => Promise<void>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  refreshNotifications: () => Promise<void>;

  // Real-time
  subscribeToNotifications: () => () => void;
  isSubscribed: boolean;
}

export interface NotificationBellProps {
  userId: string;
  onOpenNotifications: () => void;
  showUnreadCount?: boolean;
  maxCount?: number;
  className?: string;
}

export interface NotificationCenterProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  filters?: NotificationFilters;
}

export interface AlertSettingsProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onDismiss: (id: string) => void;
  onClick: (notification: Notification) => void;
}

export interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onDismiss: (id: string) => void;
  onNotificationClick: (notification: Notification) => void;
}

export interface NotificationFiltersProps {
  filters: NotificationFilters;
  onFiltersChange: (filters: NotificationFilters) => void;
  categories: NotificationCategory[];
  priorities: NotificationPriority[];
  types: NotificationType[];
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  tag?: string;
}

export interface NotificationAnalytics {
  total_sent: number;
  total_read: number;
  total_clicked: number;
  total_dismissed: number;
  read_rate: number;
  click_rate: number;
  dismiss_rate: number;
  average_time_to_read: number;
  average_time_to_click: number;
  by_channel: Record<NotificationChannel, {
    sent: number;
    delivered: number;
    failed: number;
    delivery_rate: number;
  }>;
  by_category: Record<NotificationCategory, {
    sent: number;
    read: number;
    clicked: number;
    read_rate: number;
    click_rate: number;
  }>;
  by_priority: Record<NotificationPriority, {
    sent: number;
    read: number;
    clicked: number;
    read_rate: number;
    click_rate: number;
  }>;
  trends: {
    daily: Array<{
      date: string;
      sent: number;
      read: number;
      clicked: number;
    }>;
    hourly: Array<{
      hour: number;
      sent: number;
      read: number;
      clicked: number;
    }>;
  };
}