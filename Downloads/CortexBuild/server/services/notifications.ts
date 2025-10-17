/**
 * Notifications Service
 * Handles email notifications and in-app notifications
 */

import Database from 'better-sqlite3';

export interface EmailNotification {
  to: string;
  subject: string;
  body: string;
  html?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: string;
    encoding?: string;
  }>;
}

export interface InAppNotification {
  userId: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
}

/**
 * Create in-app notification
 */
export function createNotification(
  db: Database.Database,
  notification: InAppNotification
) {
  try {
    const stmt = db.prepare(`
      INSERT INTO notifications (
        user_id, title, message, type, action_url, action_text, metadata, read, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(
      notification.userId,
      notification.title,
      notification.message,
      notification.type,
      notification.actionUrl || null,
      notification.actionText || null,
      notification.metadata ? JSON.stringify(notification.metadata) : null
    );

    return {
      success: true,
      notificationId: result.lastInsertRowid,
      notification
    };
  } catch (error: any) {
    console.error('Create notification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get user notifications
 */
export function getUserNotifications(
  db: Database.Database,
  userId: number,
  options: { unreadOnly?: boolean; limit?: number; offset?: number } = {}
) {
  try {
    const { unreadOnly = false, limit = 50, offset = 0 } = options;

    const whereClause = unreadOnly ? 'WHERE user_id = ? AND read = 0' : 'WHERE user_id = ?';

    const stmt = db.prepare(`
      SELECT * FROM notifications
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);

    const notifications = stmt.all(userId, limit, offset);

    // Get total count
    const countStmt = db.prepare(`
      SELECT COUNT(*) as total FROM notifications ${whereClause}
    `);
    const { total } = countStmt.get(userId) as { total: number };

    // Get unread count
    const unreadStmt = db.prepare(`
      SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND read = 0
    `);
    const { unread } = unreadStmt.get(userId) as { unread: number };

    return {
      success: true,
      notifications,
      total,
      unread,
      limit,
      offset
    };
  } catch (error: any) {
    console.error('Get notifications error:', error);
    return {
      success: false,
      error: error.message,
      notifications: []
    };
  }
}

/**
 * Mark notification as read
 */
export function markAsRead(
  db: Database.Database,
  notificationId: number,
  userId: number
) {
  try {
    const stmt = db.prepare(`
      UPDATE notifications
      SET read = 1, read_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `);

    const result = stmt.run(notificationId, userId);

    return {
      success: result.changes > 0,
      notificationId
    };
  } catch (error: any) {
    console.error('Mark as read error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Mark all notifications as read
 */
export function markAllAsRead(db: Database.Database, userId: number) {
  try {
    const stmt = db.prepare(`
      UPDATE notifications
      SET read = 1, read_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND read = 0
    `);

    const result = stmt.run(userId);

    return {
      success: true,
      marked: result.changes
    };
  } catch (error: any) {
    console.error('Mark all as read error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Delete notification
 */
export function deleteNotification(
  db: Database.Database,
  notificationId: number,
  userId: number
) {
  try {
    const stmt = db.prepare(`
      DELETE FROM notifications WHERE id = ? AND user_id = ?
    `);

    const result = stmt.run(notificationId, userId);

    return {
      success: result.changes > 0,
      notificationId
    };
  } catch (error: any) {
    console.error('Delete notification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send email notification (mock implementation)
 * In production, integrate with SendGrid, AWS SES, or similar service
 */
export async function sendEmail(email: EmailNotification) {
  try {
    // Mock email sending
    console.log('📧 Email notification (mock):', {
      to: email.to,
      subject: email.subject,
      body: email.body.substring(0, 100) + '...'
    });

    // In production, use a real email service:
    // await sendGridClient.send(email);
    // or
    // await sesClient.sendEmail(email);

    return {
      success: true,
      message: 'Email sent successfully (mock)',
      email: {
        to: email.to,
        subject: email.subject
      }
    };
  } catch (error: any) {
    console.error('Send email error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send notification to multiple users
 */
export function sendBulkNotifications(
  db: Database.Database,
  userIds: number[],
  notification: Omit<InAppNotification, 'userId'>
) {
  try {
    const transaction = db.transaction(() => {
      const results = [];

      for (const userId of userIds) {
        const result = createNotification(db, {
          ...notification,
          userId
        });
        results.push(result);
      }

      return results;
    });

    const results = transaction();
    const successful = results.filter(r => r.success).length;

    return {
      success: true,
      total: userIds.length,
      successful,
      failed: userIds.length - successful
    };
  } catch (error: any) {
    console.error('Bulk notifications error:', error);
    return {
      success: false,
      error: error.message,
      total: userIds.length,
      successful: 0
    };
  }
}

/**
 * Notification templates
 */
export const NotificationTemplates = {
  taskAssigned: (taskName: string, assignedBy: string) => ({
    title: 'New Task Assigned',
    message: `${assignedBy} has assigned you to task: ${taskName}`,
    type: 'info' as const,
    actionUrl: '/tasks',
    actionText: 'View Task'
  }),

  taskCompleted: (taskName: string, completedBy: string) => ({
    title: 'Task Completed',
    message: `${completedBy} has completed task: ${taskName}`,
    type: 'success' as const,
    actionUrl: '/tasks',
    actionText: 'View Task'
  }),

  projectUpdate: (projectName: string, updateType: string) => ({
    title: 'Project Update',
    message: `${projectName}: ${updateType}`,
    type: 'info' as const,
    actionUrl: '/projects',
    actionText: 'View Project'
  }),

  rfiResponse: (rfiNumber: string) => ({
    title: 'RFI Response Received',
    message: `Response received for RFI #${rfiNumber}`,
    type: 'info' as const,
    actionUrl: '/rfis',
    actionText: 'View RFI'
  }),

  invoiceApproved: (invoiceNumber: string, amount: number) => ({
    title: 'Invoice Approved',
    message: `Invoice #${invoiceNumber} for $${amount.toFixed(2)} has been approved`,
    type: 'success' as const,
    actionUrl: '/invoices',
    actionText: 'View Invoice'
  }),

  systemAlert: (message: string) => ({
    title: 'System Alert',
    message,
    type: 'warning' as const
  }),

  criticalError: (message: string) => ({
    title: 'Critical Error',
    message,
    type: 'error' as const
  })
};

/**
 * Initialize notifications table if it doesn't exist
 */
export function initNotificationsTable(db: Database.Database) {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT CHECK(type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
        action_url TEXT,
        action_text TEXT,
        metadata TEXT,
        read INTEGER DEFAULT 0,
        read_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
    `);

    console.log('✅ Notifications table initialized');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Failed to initialize notifications table:', error);
    return { success: false, error: error.message };
  }
}
