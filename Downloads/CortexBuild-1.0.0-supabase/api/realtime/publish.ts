import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

// Shared event store (in production, use Redis pub/sub)
const eventStore: { [userId: string]: any[] } = {};

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

    const {
      type,
      data,
      recipients, // array of user IDs, or 'all', or 'company-{id}'
      priority = 'normal',
      ttl = 3600 // Time to live in seconds
    } = req.body;

    if (!type || !data) {
      return res.status(400).json({
        success: false,
        error: 'Event type and data are required'
      });
    }

    // Create event object
    const event = {
      id: `evt-${Date.now()}`,
      type,
      data,
      priority,
      sender: user.userId,
      timestamp: new Date().toISOString(),
      expires_at: new Date(Date.now() + (ttl * 1000)).toISOString()
    };

    let recipientCount = 0;

    // Determine recipients
    if (recipients === 'all') {
      // Broadcast to all connected users (super admin only)
      if (user.role !== 'super_admin') {
        return res.status(403).json({
          success: false,
          error: 'Only super admins can broadcast to all users'
        });
      }

      Object.keys(eventStore).forEach(userId => {
        if (!eventStore[userId]) eventStore[userId] = [];
        eventStore[userId].push(event);
        recipientCount++;
      });

    } else if (typeof recipients === 'string' && recipients.startsWith('company-')) {
      // Broadcast to company (company admin only)
      if (user.role !== 'super_admin' && user.role !== 'company_admin') {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }

      // In production, query users by company_id
      // For now, just broadcast to all
      Object.keys(eventStore).forEach(userId => {
        if (!eventStore[userId]) eventStore[userId] = [];
        eventStore[userId].push(event);
        recipientCount++;
      });

    } else if (Array.isArray(recipients)) {
      // Send to specific users
      recipients.forEach(userId => {
        if (!eventStore[userId]) eventStore[userId] = [];
        eventStore[userId].push(event);
        recipientCount++;
      });

    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid recipients format'
      });
    }

    console.log(`📤 Event published: ${type} to ${recipientCount} recipient(s)`);

    return res.status(200).json({
      success: true,
      message: 'Event published successfully',
      event_id: event.id,
      recipients: recipientCount,
      timestamp: event.timestamp
    });

  } catch (error: any) {
    console.error('❌ Publish API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

// Utility function to publish events (can be imported by other APIs)
export function publishEvent(type: string, data: any, recipients: string | string[], sender?: string) {
  const event = {
    id: `evt-${Date.now()}`,
    type,
    data,
    priority: 'normal',
    sender: sender || 'system',
    timestamp: new Date().toISOString()
  };

  if (recipients === 'all') {
    Object.keys(eventStore).forEach(userId => {
      if (!eventStore[userId]) eventStore[userId] = [];
      eventStore[userId].push(event);
    });
  } else if (Array.isArray(recipients)) {
    recipients.forEach(userId => {
      if (!eventStore[userId]) eventStore[userId] = [];
      eventStore[userId].push(event);
    });
  }

  return event;
}

export { eventStore };
