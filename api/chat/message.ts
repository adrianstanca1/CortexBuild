// Chat Message API Endpoint
import { handleChatRequest } from '../chat';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { sessionId } = req.query;
    const { message } = req.body || {};
    
    // Mock user ID for demo purposes
    const userId = 'demo-user-123';

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    if (req.method === 'GET') {
      // Get chat history
      const messages = await handleChatRequest({ sessionId, userId });
      return res.status(200).json({ messages });
    }

    if (req.method === 'POST') {
      // Send message
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const response = await handleChatRequest({ sessionId, message, userId });
      return res.status(200).json({ message: response });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
