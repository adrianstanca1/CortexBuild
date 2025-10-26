import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

let notifications = [
  {
    id: 'notif-1',
    user_id: 'user-2',
    type: 'task_assigned',
    title: 'New task assigned',
    message: 'Mike Wilson assigned you task: Finalize structural drawings',
    link: '/tasks/task-1',
    is_read: 0,
    priority: 'medium',
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'notif-2',
    user_id: 'user-2',
    type: 'deadline_approaching',
    title: 'Deadline approaching',
    message: 'Task "Issue procurement schedule" is due in 2 days',
    link: '/tasks/task-2',
    is_read: 0,
    priority: 'high',
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'notif-3',
    user_id: 'user-2',
    type: 'project_update',
    title: 'Project milestone reached',
    message: 'Metropolis Tower has reached 35% completion',
    link: '/projects/proj-1',
    is_read: 1,
    priority: 'low',
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const user = verifyAuth(req);

    // GET - Fetch notifications for user
    if (req.method === 'GET') {
      const { is_read, type, priority } = req.query;
      let userNotifications = notifications.filter(n => n.user_id === user.userId);

      if (is_read !== undefined) {
        userNotifications = userNotifications.filter(n => n.is_read === parseInt(is_read as string));
      }

      if (type) {
        userNotifications = userNotifications.filter(n => n.type === type);
      }

      if (priority) {
        userNotifications = userNotifications.filter(n => n.priority === priority);
      }

      // Sort by newest first
      userNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const summary = {
        total: userNotifications.length,
        unread: userNotifications.filter(n => !n.is_read).length,
        high_priority: userNotifications.filter(n => n.priority === 'high').length,
        by_type: {
          task_assigned: userNotifications.filter(n => n.type === 'task_assigned').length,
          deadline_approaching: userNotifications.filter(n => n.type === 'deadline_approaching').length,
          project_update: userNotifications.filter(n => n.type === 'project_update').length,
          budget_alert: userNotifications.filter(n => n.type === 'budget_alert').length
        }
      };

      console.log(`📬 Fetched ${userNotifications.length} notifications for ${user.email}`);

      return res.status(200).json({ success: true, data: userNotifications, summary });
    }

    // POST - Create notification
    if (req.method === 'POST') {
      const notifData = req.body;

      if (!notifData.user_id || !notifData.message) {
        return res.status(400).json({ success: false, error: 'User and message are required' });
      }

      const newNotification = {
        id: `notif-${Date.now()}`,
        user_id: notifData.user_id,
        type: notifData.type || 'general',
        title: notifData.title || 'Notification',
        message: notifData.message,
        link: notifData.link || null,
        is_read: 0,
        priority: notifData.priority || 'medium',
        created_at: new Date().toISOString()
      };

      notifications.push(newNotification);

      console.log(`✅ Notification created for user ${notifData.user_id}`);

      return res.status(201).json({ success: true, data: newNotification, message: 'Notification created' });
    }

    // PATCH - Mark notification as read
    if (req.method === 'PATCH') {
      const { notification_ids, mark_all_read } = req.body;

      if (mark_all_read) {
        // Mark all user's notifications as read
        notifications.forEach(n => {
          if (n.user_id === user.userId) {
            n.is_read = 1;
          }
        });

        console.log(`✅ All notifications marked as read for ${user.email}`);

        return res.status(200).json({ success: true, message: 'All notifications marked as read' });
      }

      if (notification_ids && Array.isArray(notification_ids)) {
        notifications.forEach(n => {
          if (notification_ids.includes(n.id) && n.user_id === user.userId) {
            n.is_read = 1;
          }
        });

        console.log(`✅ ${notification_ids.length} notifications marked as read`);

        return res.status(200).json({ success: true, message: 'Notifications marked as read' });
      }

      return res.status(400).json({ success: false, error: 'Invalid request' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error: any) {
    console.error('❌ Notifications API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
