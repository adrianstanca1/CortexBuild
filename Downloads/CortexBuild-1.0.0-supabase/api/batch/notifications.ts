import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

let notifications: any[] = []; // In production, this would be from database

const verifyAuth = (req: VercelRequest) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }
  const token = authHeader.substring(7);
  return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const user = verifyAuth(req);
    const { operation, notification_ids, mark_all, filters } = req.body;

    if (!operation) {
      return res.status(400).json({
        success: false,
        error: 'Operation is required (mark_read, mark_unread, delete, delete_all_read)'
      });
    }

    let affectedNotifications: any[] = [];
    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[]
    };

    // Get notifications to operate on
    if (mark_all) {
      affectedNotifications = notifications.filter(n => n.user_id === user.userId);
    } else if (notification_ids && Array.isArray(notification_ids)) {
      affectedNotifications = notifications.filter(n =>
        notification_ids.includes(n.id) && n.user_id === user.userId
      );
    } else if (filters) {
      affectedNotifications = notifications.filter(n => {
        if (n.user_id !== user.userId) return false;
        if (filters.type && n.type !== filters.type) return false;
        if (filters.priority && n.priority !== filters.priority) return false;
        if (filters.is_read !== undefined && n.is_read !== filters.is_read) return false;
        return true;
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Either notification_ids, mark_all, or filters must be provided'
      });
    }

    if (affectedNotifications.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No notifications found matching criteria'
      });
    }

    // Perform batch operation
    switch (operation) {
      case 'mark_read':
        affectedNotifications.forEach(notif => {
          const notifIndex = notifications.findIndex(n => n.id === notif.id);
          if (notifIndex !== -1) {
            notifications[notifIndex].is_read = 1;
            notifications[notifIndex].read_at = new Date().toISOString();
            results.success++;
          } else {
            results.failed++;
            results.errors.push({ notification_id: notif.id, error: 'Notification not found' });
          }
        });
        break;

      case 'mark_unread':
        affectedNotifications.forEach(notif => {
          const notifIndex = notifications.findIndex(n => n.id === notif.id);
          if (notifIndex !== -1) {
            notifications[notifIndex].is_read = 0;
            notifications[notifIndex].read_at = null;
            results.success++;
          } else {
            results.failed++;
            results.errors.push({ notification_id: notif.id, error: 'Notification not found' });
          }
        });
        break;

      case 'delete':
        affectedNotifications.forEach(notif => {
          const notifIndex = notifications.findIndex(n => n.id === notif.id);
          if (notifIndex !== -1) {
            notifications.splice(notifIndex, 1);
            results.success++;
          } else {
            results.failed++;
            results.errors.push({ notification_id: notif.id, error: 'Notification not found' });
          }
        });
        break;

      case 'delete_all_read':
        const readNotifications = notifications.filter(n =>
          n.user_id === user.userId && n.is_read === 1
        );

        readNotifications.forEach(notif => {
          const notifIndex = notifications.findIndex(n => n.id === notif.id);
          if (notifIndex !== -1) {
            notifications.splice(notifIndex, 1);
            results.success++;
          }
        });
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid operation. Supported: mark_read, mark_unread, delete, delete_all_read'
        });
    }

    console.log(`✅ Batch notification ${operation}: ${results.success} succeeded, ${results.failed} failed`);

    // Calculate remaining notifications
    const remaining = notifications.filter(n => n.user_id === user.userId);
    const unread = remaining.filter(n => !n.is_read).length;

    return res.status(200).json({
      success: true,
      message: `Batch operation completed`,
      results,
      total_affected: affectedNotifications.length,
      remaining: {
        total: remaining.length,
        unread
      }
    });

  } catch (error: any) {
    console.error('❌ Batch notifications API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
