/**
 * Notifications Routes
 * Handles in-app notifications and email notifications
 */

import express from 'express';
import Database from 'better-sqlite3';
import { verifyToken } from '../auth';
import * as notif from '../services/notifications';

export function createNotificationsRouter(db: Database.Database) {
  const router = express.Router();

  /**
   * GET /api/notifications
   * Get user notifications
   */
  router.get('/', verifyToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const unreadOnly = req.query.unreadOnly === 'true';
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = notif.getUserNotifications(db, user.id, {
        unreadOnly,
        limit,
        offset
      });

      res.json(result);
    } catch (error: any) {
      console.error('Get notifications error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/notifications
   * Create a new notification
   */
  router.post('/', verifyToken, async (req, res) => {
    try {
      const notification = req.body as notif.InAppNotification;

      if (!notification.userId || !notification.title || !notification.message) {
        return res.status(400).json({
          success: false,
          error: 'userId, title, and message are required'
        });
      }

      const result = notif.createNotification(db, notification);
      res.json(result);
    } catch (error: any) {
      console.error('Create notification error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/notifications/bulk
   * Send notifications to multiple users
   */
  router.post('/bulk', verifyToken, async (req, res) => {
    try {
      const { userIds, notification } = req.body;

      if (!userIds || !Array.isArray(userIds) || !notification) {
        return res.status(400).json({
          success: false,
          error: 'userIds array and notification object are required'
        });
      }

      // Check if user has admin permissions
      const user = (req as any).user;
      if (user.role !== 'super_admin' && user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions for bulk notifications'
        });
      }

      const result = notif.sendBulkNotifications(db, userIds, notification);
      res.json(result);
    } catch (error: any) {
      console.error('Bulk notifications error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * PATCH /api/notifications/:id/read
   * Mark notification as read
   */
  router.patch('/:id/read', verifyToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const notificationId = parseInt(req.params.id);

      const result = notif.markAsRead(db, notificationId, user.id);

      if (result.success) {
        res.json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error: any) {
      console.error('Mark as read error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/notifications/mark-all-read
   * Mark all notifications as read
   */
  router.post('/mark-all-read', verifyToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const result = notif.markAllAsRead(db, user.id);
      res.json(result);
    } catch (error: any) {
      console.error('Mark all as read error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * DELETE /api/notifications/:id
   * Delete notification
   */
  router.delete('/:id', verifyToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const notificationId = parseInt(req.params.id);

      const result = notif.deleteNotification(db, notificationId, user.id);

      if (result.success) {
        res.json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error: any) {
      console.error('Delete notification error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/notifications/send-email
   * Send email notification
   */
  router.post('/send-email', verifyToken, async (req, res) => {
    try {
      const email = req.body as notif.EmailNotification;

      if (!email.to || !email.subject || !email.body) {
        return res.status(400).json({
          success: false,
          error: 'to, subject, and body are required'
        });
      }

      // Check if user has permission
      const user = (req as any).user;
      if (user.role !== 'super_admin' && user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions to send emails'
        });
      }

      const result = await notif.sendEmail(email);
      res.json(result);
    } catch (error: any) {
      console.error('Send email error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/notifications/templates
   * Get available notification templates
   */
  router.get('/templates', verifyToken, async (req, res) => {
    try {
      const templates = Object.keys(notif.NotificationTemplates).map(key => ({
        name: key,
        description: key.replace(/([A-Z])/g, ' $1').trim()
      }));

      res.json({
        success: true,
        templates
      });
    } catch (error: any) {
      console.error('Get templates error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}
