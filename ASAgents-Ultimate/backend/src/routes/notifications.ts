import { Router } from 'express';
import { getDatabase } from '../database/connection';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler, errors } from '../middleware/errorHandler';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Notification routes
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  const { id: user_id } = req.user;
  const { read, type, limit = 50 } = req.query;
  
  let query = `
    SELECT * FROM notifications 
    WHERE user_id = ?
  `;
  const params = [user_id];
  
  if (read !== undefined) {
    query += ' AND read = ?';
    params.push(read === 'true' ? 1 : 0);
  }
  
  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }
  
  query += ' ORDER BY created_at DESC LIMIT ?';
  params.push(Number(limit));
  
  const notifications = await db.all(query, params);
  
  res.json({
    success: true,
    data: notifications
  });
}));

router.post('/', authenticate, validate(Joi.object({
  user_id: Joi.string().optional(), // If not provided, defaults to current user
  title: Joi.string().required(),
  message: Joi.string().required(),
  type: Joi.string().valid('info', 'success', 'warning', 'error', 'reminder').default('info'),
  action_url: Joi.string().optional(),
  metadata: Joi.object().optional()
})), asyncHandler(async (req, res) => {
  const db = getDatabase();
  const { company_id } = req.user;
  
  const notificationData = {
    id: uuidv4(),
    ...req.body,
    company_id,
    user_id: req.body.user_id || req.user.id,
    read: false
  };
  
  await db.run(`
    INSERT INTO notifications (
      id, company_id, user_id, title, message, type, 
      action_url, metadata, read
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    notificationData.id,
    notificationData.company_id,
    notificationData.user_id,
    notificationData.title,
    notificationData.message,
    notificationData.type,
    notificationData.action_url,
    JSON.stringify(notificationData.metadata),
    notificationData.read
  ]);
  
  const notification = await db.get('SELECT * FROM notifications WHERE id = ?', [notificationData.id]);
  
  // TODO: Send real-time notification via WebSocket
  // webSocketManager.sendToUser(notificationData.user_id, 'notification', notification);
  
  res.status(201).json({
    success: true,
    data: notification
  });
}));

// Mark notification as read
router.put('/:id/read', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { id: user_id } = req.user;
  
  const notification = await db.get('SELECT * FROM notifications WHERE id = ? AND user_id = ?', [id, user_id]);
  if (!notification) {
    throw errors.notFound('Notification not found');
  }
  
  await db.run(`
    UPDATE notifications 
    SET read = 1, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `, [id]);
  
  res.json({
    success: true,
    message: 'Notification marked as read'
  });
}));

// Mark all notifications as read
router.put('/mark-all-read', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  const { id: user_id } = req.user;
  
  await db.run(`
    UPDATE notifications 
    SET read = 1, updated_at = CURRENT_TIMESTAMP 
    WHERE user_id = ? AND read = 0
  `, [user_id]);
  
  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
}));

router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { id: user_id } = req.user;
  
  const notification = await db.get('SELECT * FROM notifications WHERE id = ? AND user_id = ?', [id, user_id]);
  if (!notification) {
    throw errors.notFound('Notification not found');
  }
  
  await db.run('DELETE FROM notifications WHERE id = ?', [id]);
  
  res.json({
    success: true,
    message: 'Notification deleted successfully'
  });
}));

// Get notification counts
router.get('/counts', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  const { id: user_id } = req.user;
  
  const counts = await db.get(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN read = 0 THEN 1 ELSE 0 END) as unread,
      SUM(CASE WHEN type = 'error' AND read = 0 THEN 1 ELSE 0 END) as errors,
      SUM(CASE WHEN type = 'warning' AND read = 0 THEN 1 ELSE 0 END) as warnings
    FROM notifications 
    WHERE user_id = ?
  `, [user_id]);
  
  res.json({
    success: true,
    data: counts
  });
}));

// Bulk create notifications (for system/admin use)
router.post('/bulk', authenticate, validate(Joi.object({
  user_ids: Joi.array().items(Joi.string()).required(),
  title: Joi.string().required(),
  message: Joi.string().required(),
  type: Joi.string().valid('info', 'success', 'warning', 'error', 'reminder').default('info'),
  action_url: Joi.string().optional(),
  metadata: Joi.object().optional()
})), asyncHandler(async (req, res) => {
  const db = getDatabase();
  const { company_id, role } = req.user;
  const { user_ids, ...notificationData } = req.body;
  
  // Only admins and project managers can send bulk notifications
  if (role !== 'admin' && role !== 'project_manager') {
    throw errors.forbidden('Insufficient permissions for bulk notifications');
  }
  
  const notifications = [];
  
  for (const userId of user_ids) {
    const notification = {
      id: uuidv4(),
      ...notificationData,
      company_id,
      user_id: userId,
      read: false
    };
    
    await db.run(`
      INSERT INTO notifications (
        id, company_id, user_id, title, message, type, 
        action_url, metadata, read
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      notification.id,
      notification.company_id,
      notification.user_id,
      notification.title,
      notification.message,
      notification.type,
      notification.action_url,
      JSON.stringify(notification.metadata),
      notification.read
    ]);
    
    notifications.push(notification);
  }
  
  res.status(201).json({
    success: true,
    data: notifications,
    message: `${notifications.length} notifications created successfully`
  });
}));

export default router;