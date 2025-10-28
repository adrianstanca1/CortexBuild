import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

// In-memory event store (in production, use Redis or similar)
const eventStore: { [userId: string]: any[] } = {};

const verifyAuth = (req: VercelRequest) => {
  const token = req.query.token as string;
  if (!token) {
    throw new Error('No token provided');
  }
  return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const user = verifyAuth(req);

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    console.log(`📡 SSE connection established for user ${user.email}`);

    // Initialize event store for user if not exists
    if (!eventStore[user.userId]) {
      eventStore[user.userId] = [];
    }

    // Send initial connection event
    res.write(`data: ${JSON.stringify({
      type: 'connected',
      message: 'Real-time connection established',
      userId: user.userId,
      timestamp: new Date().toISOString()
    })}\n\n`);

    // Keep connection alive with heartbeat
    const heartbeat = setInterval(() => {
      res.write(`:heartbeat ${new Date().toISOString()}\n\n`);
    }, 30000); // Every 30 seconds

    // Check for pending events every 2 seconds
    const eventChecker = setInterval(() => {
      const userEvents = eventStore[user.userId] || [];

      if (userEvents.length > 0) {
        // Send all pending events
        userEvents.forEach(event => {
          res.write(`data: ${JSON.stringify(event)}\n\n`);
        });

        // Clear sent events
        eventStore[user.userId] = [];
      }
    }, 2000);

    // Clean up on connection close
    req.on('close', () => {
      clearInterval(heartbeat);
      clearInterval(eventChecker);
      console.log(`📡 SSE connection closed for user ${user.email}`);
    });

  } catch (error: any) {
    console.error('❌ SSE error:', error);
    if (error.message === 'No token provided') {
      res.status(401).json({ error: 'Authentication required' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

// Export event store for other APIs to push events
export { eventStore };
