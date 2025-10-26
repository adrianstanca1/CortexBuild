import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

// User presence tracking
const userPresence: { [userId: string]: { status: string; lastSeen: string; } } = {};

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const user = verifyAuth(req);

    // GET - Get user presence status
    if (req.method === 'GET') {
      const { user_ids } = req.query;

      let statuses;

      if (user_ids) {
        // Get specific users' status
        const userIdArray = (user_ids as string).split(',');
        statuses = userIdArray.map(userId => ({
          user_id: userId,
          status: userPresence[userId]?.status || 'offline',
          last_seen: userPresence[userId]?.lastSeen || null
        }));
      } else {
        // Get all users' status
        statuses = Object.keys(userPresence).map(userId => ({
          user_id: userId,
          status: userPresence[userId].status,
          last_seen: userPresence[userId].lastSeen
        }));
      }

      return res.status(200).json({
        success: true,
        data: statuses,
        online_count: Object.values(userPresence).filter(p => p.status === 'online').length,
        total_tracked: Object.keys(userPresence).length
      });
    }

    // POST - Update user presence
    if (req.method === 'POST') {
      const { status } = req.body;

      if (!['online', 'away', 'offline'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status. Must be: online, away, or offline'
        });
      }

      // Update user presence
      userPresence[user.userId] = {
        status,
        lastSeen: new Date().toISOString()
      };

      console.log(`👤 User ${user.email} status: ${status}`);

      // Publish presence update event to other users
      const presenceEvent = {
        type: 'user_presence_update',
        user_id: user.userId,
        status,
        timestamp: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        message: 'Status updated successfully',
        data: userPresence[user.userId],
        event: presenceEvent
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error: any) {
    console.error('❌ Status API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

// Clean up stale presence data (called periodically)
export function cleanupStalePresence() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  Object.keys(userPresence).forEach(userId => {
    if (userPresence[userId].lastSeen < fiveMinutesAgo) {
      userPresence[userId].status = 'offline';
    }
  });
}

// Auto-cleanup every 2 minutes
setInterval(cleanupStalePresence, 2 * 60 * 1000);

export { userPresence };
