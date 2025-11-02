// CortexBuild Notification Service - Real-time notifications and alerts
import { User, Project, Task, RFI } from '../types';

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'task' | 'rfi' | 'project' | 'system';
  title: string;
  message: string;
  data?: any; // Additional data for the notification
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'task' | 'project' | 'rfi' | 'system' | 'deadline' | 'approval' | 'mention';
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
  relatedEntityType?: 'project' | 'task' | 'rfi' | 'user';
  relatedEntityId?: string;
}

export interface NotificationPreferences {
  userId: string;
  email: {
    enabled: boolean;
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
    types: string[];
  };
  push: {
    enabled: boolean;
    types: string[];
  };
  inApp: {
    enabled: boolean;
    types: string[];
  };
  quiet: {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string;   // HH:MM format
  };
}

export interface NotificationTemplate {
  id: string;
  type: string;
  title: string;
  message: string;
  variables: string[]; // Variables that can be replaced in the template
}

class NotificationService {
  private notifications: Notification[] = [];
  private preferences: Map<string, NotificationPreferences> = new Map();
  private templates: NotificationTemplate[] = [];
  private subscribers: Map<string, (notification: Notification) => void> = new Map();

  constructor() {
    this.initializeTemplates();
    this.initializeMockNotifications();
  }

  private initializeTemplates() {
    this.templates = [
      {
        id: 'task-assigned',
        type: 'task',
        title: 'New Task Assigned',
        message: 'You have been assigned a new task: {{taskTitle}} in project {{projectName}}',
        variables: ['taskTitle', 'projectName', 'assignedBy']
      },
      {
        id: 'task-overdue',
        type: 'warning',
        title: 'Task Overdue',
        message: 'Task "{{taskTitle}}" is overdue. Due date was {{dueDate}}',
        variables: ['taskTitle', 'dueDate', 'projectName']
      },
      {
        id: 'rfi-response',
        type: 'rfi',
        title: 'RFI Response Received',
        message: 'Your RFI "{{rfiTitle}}" has received a response from {{responder}}',
        variables: ['rfiTitle', 'responder', 'projectName']
      },
      {
        id: 'project-milestone',
        type: 'success',
        title: 'Milestone Achieved',
        message: 'Project {{projectName}} has reached milestone: {{milestoneName}}',
        variables: ['projectName', 'milestoneName']
      },
      {
        id: 'budget-alert',
        type: 'warning',
        title: 'Budget Alert',
        message: 'Project {{projectName}} is {{percentage}}% over budget',
        variables: ['projectName', 'percentage', 'amount']
      },
      {
        id: 'deadline-reminder',
        type: 'info',
        title: 'Deadline Reminder',
        message: '{{entityType}} "{{entityTitle}}" is due in {{timeRemaining}}',
        variables: ['entityType', 'entityTitle', 'timeRemaining', 'projectName']
      }
    ];
  }

  private initializeMockNotifications() {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    this.notifications = [
      {
        id: 'notif-1',
        userId: 'user-3',
        type: 'task',
        title: 'New Task Assigned',
        message: 'You have been assigned a new task: Install facade panels - Floor 15-20 in project Canary Wharf Tower Renovation',
        data: { taskId: 'task-1', projectId: 'project-1' },
        read: false,
        actionUrl: '/task-detail/task-1',
        actionText: 'View Task',
        priority: 'high',
        category: 'task',
        createdAt: now.toISOString(),
        relatedEntityType: 'task',
        relatedEntityId: 'task-1'
      },
      {
        id: 'notif-2',
        userId: 'user-2',
        type: 'warning',
        title: 'Budget Alert',
        message: 'Project Canary Wharf Tower Renovation is 15% over budget',
        data: { projectId: 'project-1', percentage: 15 },
        read: true,
        priority: 'high',
        category: 'project',
        createdAt: yesterday.toISOString(),
        readAt: yesterday.toISOString(),
        relatedEntityType: 'project',
        relatedEntityId: 'project-1'
      },
      {
        id: 'notif-3',
        userId: 'user-3',
        type: 'rfi',
        title: 'RFI Response Received',
        message: 'Your RFI "Clarification on Window Frame Specifications" has received a response from Mike Thompson',
        data: { rfiId: 'rfi-1', responderId: 'user-foreman-1' },
        read: false,
        actionUrl: '/rfi-detail/rfi-1',
        actionText: 'View Response',
        priority: 'medium',
        category: 'rfi',
        createdAt: twoDaysAgo.toISOString(),
        relatedEntityType: 'rfi',
        relatedEntityId: 'rfi-1'
      }
    ];
  }

  // Get notifications for a user
  async getNotifications(
    userId: string,
    filters: {
      read?: boolean;
      type?: string;
      category?: string;
      priority?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
    let userNotifications = this.notifications.filter(n => n.userId === userId);

    // Apply filters
    if (filters.read !== undefined) {
      userNotifications = userNotifications.filter(n => n.read === filters.read);
    }

    if (filters.type) {
      userNotifications = userNotifications.filter(n => n.type === filters.type);
    }

    if (filters.category) {
      userNotifications = userNotifications.filter(n => n.category === filters.category);
    }

    if (filters.priority) {
      userNotifications = userNotifications.filter(n => n.priority === filters.priority);
    }

    // Sort by creation date (newest first)
    userNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Calculate unread count
    const unreadCount = this.notifications.filter(n => n.userId === userId && !n.read).length;

    // Apply pagination
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    const paginatedNotifications = userNotifications.slice(offset, offset + limit);

    return {
      notifications: paginatedNotifications,
      total: userNotifications.length,
      unreadCount
    };
  }

  // Create a new notification
  async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    this.notifications.push(newNotification);

    // Notify subscribers
    const subscriber = this.subscribers.get(notification.userId);
    if (subscriber) {
      subscriber(newNotification);
    }

    return newNotification;
  }

  // Create notification from template
  async createFromTemplate(
    templateId: string,
    userId: string,
    variables: { [key: string]: string },
    options: {
      priority?: Notification['priority'];
      actionUrl?: string;
      actionText?: string;
      expiresAt?: string;
      relatedEntityType?: string;
      relatedEntityId?: string;
    } = {}
  ): Promise<Notification> {
    const template = this.templates.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Replace variables in title and message
    let title = template.title;
    let message = template.message;

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      title = title.replace(new RegExp(placeholder, 'g'), value);
      message = message.replace(new RegExp(placeholder, 'g'), value);
    });

    return this.createNotification({
      userId,
      type: template.type as Notification['type'],
      title,
      message,
      data: variables,
      read: false,
      priority: options.priority || 'medium',
      category: this.getCategoryFromType(template.type),
      actionUrl: options.actionUrl,
      actionText: options.actionText,
      expiresAt: options.expiresAt,
      relatedEntityType: options.relatedEntityType as any,
      relatedEntityId: options.relatedEntityId
    });
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<boolean> {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (!notification) return false;

    notification.read = true;
    notification.readAt = new Date().toISOString();
    return true;
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<number> {
    const userNotifications = this.notifications.filter(n => n.userId === userId && !n.read);
    const now = new Date().toISOString();

    userNotifications.forEach(notification => {
      notification.read = true;
      notification.readAt = now;
    });

    return userNotifications.length;
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<boolean> {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index === -1) return false;

    this.notifications.splice(index, 1);
    return true;
  }

  // Get notification preferences for a user
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    const existing = this.preferences.get(userId);
    if (existing) return existing;

    // Default preferences
    const defaultPreferences: NotificationPreferences = {
      userId,
      email: {
        enabled: true,
        frequency: 'immediate',
        types: ['task', 'rfi', 'deadline', 'approval']
      },
      push: {
        enabled: true,
        types: ['task', 'rfi', 'urgent']
      },
      inApp: {
        enabled: true,
        types: ['task', 'rfi', 'project', 'system', 'deadline', 'approval', 'mention']
      },
      quiet: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00'
      }
    };

    this.preferences.set(userId, defaultPreferences);
    return defaultPreferences;
  }

  // Update notification preferences
  async updatePreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const current = await this.getPreferences(userId);
    const updated = { ...current, ...preferences };
    this.preferences.set(userId, updated);
    return updated;
  }

  // Subscribe to real-time notifications
  subscribe(userId: string, callback: (notification: Notification) => void): () => void {
    this.subscribers.set(userId, callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(userId);
    };
  }

  // Generate automatic notifications based on system events
  async generateTaskNotifications(task: Task, event: 'created' | 'assigned' | 'completed' | 'overdue'): Promise<void> {
    switch (event) {
      case 'assigned':
        if (task.assignedToId) {
          await this.createFromTemplate('task-assigned', task.assignedToId, {
            taskTitle: task.title,
            projectName: 'Project Name', // Would fetch from project service
            assignedBy: task.createdBy
          }, {
            priority: task.priority === 'High' ? 'high' : 'medium',
            actionUrl: `/task-detail/${task.id}`,
            actionText: 'View Task',
            relatedEntityType: 'task',
            relatedEntityId: task.id
          });
        }
        break;

      case 'overdue':
        if (task.assignedToId && task.dueDate) {
          await this.createFromTemplate('task-overdue', task.assignedToId, {
            taskTitle: task.title,
            dueDate: new Date(task.dueDate).toLocaleDateString(),
            projectName: 'Project Name'
          }, {
            priority: 'high',
            actionUrl: `/task-detail/${task.id}`,
            actionText: 'View Task',
            relatedEntityType: 'task',
            relatedEntityId: task.id
          });
        }
        break;
    }
  }

  async generateRFINotifications(rfi: RFI, event: 'created' | 'responded' | 'overdue'): Promise<void> {
    switch (event) {
      case 'responded':
        await this.createFromTemplate('rfi-response', rfi.submittedById, {
          rfiTitle: rfi.title,
          responder: 'Responder Name', // Would fetch from user service
          projectName: 'Project Name'
        }, {
          priority: 'medium',
          actionUrl: `/rfi-detail/${rfi.id}`,
          actionText: 'View Response',
          relatedEntityType: 'rfi',
          relatedEntityId: rfi.id
        });
        break;
    }
  }

  async generateProjectNotifications(project: Project, event: 'milestone' | 'budget-alert' | 'deadline'): Promise<void> {
    // Implementation would depend on project events
  }

  // Clean up expired notifications
  async cleanupExpiredNotifications(): Promise<number> {
    const now = new Date();
    const initialCount = this.notifications.length;

    this.notifications = this.notifications.filter(notification => {
      if (!notification.expiresAt) return true;
      return new Date(notification.expiresAt) > now;
    });

    return initialCount - this.notifications.length;
  }

  // Get notification statistics
  async getNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    byType: { [type: string]: number };
    byPriority: { [priority: string]: number };
    todayCount: number;
    weekCount: number;
  }> {
    const userNotifications = this.notifications.filter(n => n.userId === userId);
    const unread = userNotifications.filter(n => !n.read).length;

    const byType: { [type: string]: number } = {};
    const byPriority: { [priority: string]: number } = {};

    userNotifications.forEach(notification => {
      byType[notification.type] = (byType[notification.type] || 0) + 1;
      byPriority[notification.priority] = (byPriority[notification.priority] || 0) + 1;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = userNotifications.filter(n => new Date(n.createdAt) >= today).length;

    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekCount = userNotifications.filter(n => new Date(n.createdAt) >= weekAgo).length;

    return {
      total: userNotifications.length,
      unread,
      byType,
      byPriority,
      todayCount,
      weekCount
    };
  }

  private getCategoryFromType(type: string): Notification['category'] {
    const mapping: { [key: string]: Notification['category'] } = {
      'task': 'task',
      'rfi': 'rfi',
      'project': 'project',
      'warning': 'deadline',
      'success': 'system',
      'info': 'system',
      'error': 'system'
    };
    return mapping[type] || 'system';
  }
}

export const notificationService = new NotificationService();
export default notificationService;
