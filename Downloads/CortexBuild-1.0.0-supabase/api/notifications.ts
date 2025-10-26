import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth } from './utils/auth';

interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    link?: string;
    created_at: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const user = verifyAuth(req);
        
        if (req.method === 'GET') {
            // Get notifications for current user
            const unreadOnly = req.query.unreadOnly === 'true';
            
            // Mock notifications - in production, fetch from database
            const notifications: Notification[] = [
                {
                    id: '1',
                    user_id: user.id,
                    title: 'Task nou adăugat',
                    message: 'Ai primit un nou task pentru proiectul "Renovare Vila"',
                    type: 'info',
                    read: false,
                    link: '/tasks/123',
                    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min ago
                },
                {
                    id: '2',
                    user_id: user.id,
                    title: 'Deadline apropiat',
                    message: 'Task "Instalare electrică" se apropie de deadline',
                    type: 'warning',
                    read: false,
                    link: '/tasks/456',
                    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
                },
                {
                    id: '3',
                    user_id: user.id,
                    title: 'Proiect finalizat',
                    message: 'Proiectul "Construire Magazin" a fost finalizat cu succes!',
                    type: 'success',
                    read: true,
                    link: '/projects/789',
                    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1d ago
                },
            ];

            const filteredNotifications = unreadOnly
                ? notifications.filter(n => !n.read)
                : notifications;

            return res.status(200).json({
                success: true,
                notifications: filteredNotifications,
            });
        }

        if (req.method === 'POST') {
            // Mark notification as read
            const { notificationId } = req.query;
            const { readAll, userId } = req.body;

            if (readAll) {
                // Mark all as read
                return res.status(200).json({
                    success: true,
                    message: 'All notifications marked as read',
                });
            }

            if (notificationId) {
                // Mark single notification as read
                return res.status(200).json({
                    success: true,
                    message: 'Notification marked as read',
                });
            }
        }

        if (req.method === 'DELETE') {
            // Delete notification
            return res.status(200).json({
                success: true,
                message: 'Notification deleted',
            });
        }

        return res.status(405).json({ success: false, error: 'Method not allowed' });
    } catch (error: any) {
        console.error('Notifications API error:', error);
        
        if (error.message === 'No token provided') {
            return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
}
