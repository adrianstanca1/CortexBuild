import { Router } from 'express';
import { authenticateUser } from '../middleware/authenticate.js';
import { pool } from '../services/db.js';
const router = Router();
// Get notifications for the authenticated user
router.get('/', authenticateUser, async (req, res) => {
    const { limit = 50, offset = 0, unread_only = false } = req.query;
    try {
        let query = `
      SELECT id, tenant_id, user_id, type, title, message, data, is_read, created_at, read_at
      FROM notifications 
      WHERE user_id = ? AND tenant_id = ?
    `;
        const params = [req.user?.sub, req.user?.tenant_id];
        if (unread_only === 'true') {
            query += ' AND is_read = FALSE';
        }
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));
        const [rows] = await pool.query(query, params);
        const notifications = rows.map(row => ({
            id: row.id,
            tenantId: row.tenant_id,
            userId: row.user_id,
            type: row.type,
            title: row.title,
            message: row.message,
            data: row.data ? JSON.parse(row.data) : null,
            isRead: row.is_read,
            createdAt: row.created_at,
            readAt: row.read_at
        }));
        return res.json(notifications);
    }
    catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({ message: 'Failed to fetch notifications' });
    }
});
// Get unread notification count
router.get('/unread-count', authenticateUser, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND tenant_id = ? AND is_read = FALSE', [req.user?.sub, req.user?.tenant_id]);
        return res.json({ count: rows[0]?.count || 0 });
    }
    catch (error) {
        console.error('Error fetching unread count:', error);
        return res.status(500).json({ message: 'Failed to fetch unread count' });
    }
});
// Mark notification as read
router.patch('/:id/read', authenticateUser, async (req, res) => {
    const notificationId = parseInt(req.params.id);
    try {
        const [result] = await pool.execute(`UPDATE notifications 
       SET is_read = TRUE, read_at = NOW() 
       WHERE id = ? AND user_id = ? AND tenant_id = ?`, [notificationId, req.user?.sub, req.user?.tenant_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        return res.json({ message: 'Notification marked as read' });
    }
    catch (error) {
        console.error('Error marking notification as read:', error);
        return res.status(500).json({ message: 'Failed to mark notification as read' });
    }
});
// Mark all notifications as read
router.patch('/mark-all-read', authenticateUser, async (req, res) => {
    try {
        await pool.execute(`UPDATE notifications 
       SET is_read = TRUE, read_at = NOW() 
       WHERE user_id = ? AND tenant_id = ? AND is_read = FALSE`, [req.user?.sub, req.user?.tenant_id]);
        return res.json({ message: 'All notifications marked as read' });
    }
    catch (error) {
        console.error('Error marking all notifications as read:', error);
        return res.status(500).json({ message: 'Failed to mark all notifications as read' });
    }
});
// Create a new notification (for system use)
router.post('/', authenticateUser, async (req, res) => {
    const { userId, type, title, message, data } = req.body;
    if (!userId || !type || !title || !message) {
        return res.status(400).json({
            message: 'userId, type, title, and message are required'
        });
    }
    try {
        // Verify the target user belongs to the same tenant
        const [userCheck] = await pool.query('SELECT id FROM users WHERE id = ? AND tenant_id = ?', [userId, req.user?.tenant_id]);
        if (userCheck.length === 0) {
            return res.status(404).json({ message: 'Target user not found' });
        }
        const [result] = await pool.execute(`INSERT INTO notifications (tenant_id, user_id, type, title, message, data)
       VALUES (?, ?, ?, ?, ?, ?)`, [
            req.user?.tenant_id,
            userId,
            type,
            title,
            message,
            data ? JSON.stringify(data) : null
        ]);
        return res.status(201).json({
            id: result.insertId,
            message: 'Notification created successfully'
        });
    }
    catch (error) {
        console.error('Error creating notification:', error);
        return res.status(500).json({ message: 'Failed to create notification' });
    }
});
// Delete a notification
router.delete('/:id', authenticateUser, async (req, res) => {
    const notificationId = parseInt(req.params.id);
    try {
        const [result] = await pool.execute('DELETE FROM notifications WHERE id = ? AND user_id = ? AND tenant_id = ?', [notificationId, req.user?.sub, req.user?.tenant_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        return res.json({ message: 'Notification deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting notification:', error);
        return res.status(500).json({ message: 'Failed to delete notification' });
    }
});
// Bulk operations
router.post('/bulk', authenticateUser, async (req, res) => {
    const { action, notificationIds } = req.body;
    if (!action || !Array.isArray(notificationIds) || notificationIds.length === 0) {
        return res.status(400).json({
            message: 'Action and notificationIds array are required'
        });
    }
    try {
        const placeholders = notificationIds.map(() => '?').join(',');
        const params = [...notificationIds, req.user?.sub, req.user?.tenant_id];
        let query = '';
        let successMessage = '';
        switch (action) {
            case 'mark_read':
                query = `UPDATE notifications 
                 SET is_read = TRUE, read_at = NOW() 
                 WHERE id IN (${placeholders}) AND user_id = ? AND tenant_id = ?`;
                successMessage = 'Notifications marked as read';
                break;
            case 'delete':
                query = `DELETE FROM notifications 
                 WHERE id IN (${placeholders}) AND user_id = ? AND tenant_id = ?`;
                successMessage = 'Notifications deleted';
                break;
            default:
                return res.status(400).json({ message: 'Invalid action' });
        }
        const [result] = await pool.execute(query, params);
        return res.json({
            message: successMessage,
            affectedRows: result.affectedRows
        });
    }
    catch (error) {
        console.error('Error performing bulk operation:', error);
        return res.status(500).json({ message: 'Failed to perform bulk operation' });
    }
});
// Get notification preferences (placeholder for future implementation)
router.get('/preferences', authenticateUser, async (req, res) => {
    // This would typically fetch user notification preferences from a settings table
    const defaultPreferences = {
        email: {
            taskAssigned: true,
            taskDue: true,
            projectUpdates: true,
            systemAlerts: true
        },
        push: {
            taskAssigned: true,
            taskDue: false,
            projectUpdates: false,
            systemAlerts: true
        },
        inApp: {
            taskAssigned: true,
            taskDue: true,
            projectUpdates: true,
            systemAlerts: true
        }
    };
    return res.json(defaultPreferences);
});
// Update notification preferences (placeholder for future implementation)
router.put('/preferences', authenticateUser, async (req, res) => {
    const preferences = req.body;
    // This would typically save user notification preferences to a settings table
    // For now, just return success
    return res.json({
        message: 'Notification preferences updated successfully',
        preferences
    });
});
export default router;
