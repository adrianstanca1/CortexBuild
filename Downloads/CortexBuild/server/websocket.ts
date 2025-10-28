import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { verifyToken } from './auth';
import type { Database } from 'better-sqlite3';

interface Client {
  ws: WebSocket;
  userId: number;
  userName: string;
  userEmail: string;
  lastActivity: Date;
  currentPage: string;
}

const clients = new Map<WebSocket, Client>();

export function setupWebSocket(server: any, db: Database) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request: IncomingMessage, socket: any, head: Buffer) => {
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    
    if (url.pathname === '/ws') {
      const token = url.searchParams.get('token');
      
      if (!token) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      try {
        const user = verifyToken(token);
        
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request, user);
        });
      } catch (error) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
      }
    }
  });

  wss.on('connection', (ws: WebSocket, request: IncomingMessage, user: any) => {
    console.log(`✅ WebSocket client connected: ${user.email}`);

    // Get user details from database
    const userDetails = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(user.userId) as any;

    const client: Client = {
      ws,
      userId: user.userId,
      userName: userDetails?.name || 'Unknown User',
      userEmail: userDetails?.email || user.email,
      lastActivity: new Date(),
      currentPage: 'Dashboard'
    };

    clients.set(ws, client);

    // Send initial connection success
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'Successfully connected to CortexBuild WebSocket'
    }));

    // Broadcast user joined
    broadcastToAll({
      type: 'user_joined',
      userId: client.userId,
      userName: client.userName
    }, ws);

    // Send active users list
    sendActiveUsers(ws);

    // Handle incoming messages
    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        handleMessage(ws, message, client, db);
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      console.log(`❌ WebSocket client disconnected: ${client.userEmail}`);
      clients.delete(ws);
      
      broadcastToAll({
        type: 'user_left',
        userId: client.userId,
        userName: client.userName
      });

      broadcastActiveUsers();
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });

    // Send periodic heartbeat
    const heartbeat = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'heartbeat' }));
      } else {
        clearInterval(heartbeat);
      }
    }, 30000);

    // Broadcast active users to all
    broadcastActiveUsers();
  });

  function handleMessage(ws: WebSocket, message: any, client: Client, db: Database) {
    client.lastActivity = new Date();

    switch (message.type) {
      case 'chat_message':
        handleChatMessage(ws, message, client);
        break;
      
      case 'page_change':
        client.currentPage = message.page || 'Dashboard';
        broadcastActiveUsers();
        break;
      
      case 'activity':
        broadcastActivity(client, message.action, message.target);
        break;
      
      case 'typing':
        broadcastToAll({
          type: 'user_typing',
          userId: client.userId,
          userName: client.userName
        }, ws);
        break;
      
      default:
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Unknown message type'
        }));
    }
  }

  function handleChatMessage(ws: WebSocket, message: any, client: Client) {
    const chatMessage = {
      type: 'chat_message',
      id: Date.now().toString(),
      userId: client.userId,
      userName: client.userName,
      message: message.message,
      timestamp: new Date().toISOString()
    };

    // Broadcast to all clients
    broadcastToAll(chatMessage);
  }

  function broadcastActivity(client: Client, action: string, target: string) {
    broadcastToAll({
      type: 'activity',
      id: Date.now().toString(),
      userId: client.userId,
      userName: client.userName,
      action,
      target,
      timestamp: new Date().toISOString()
    });
  }

  function sendActiveUsers(ws: WebSocket) {
    const users = Array.from(clients.values()).map(client => ({
      id: client.userId,
      name: client.userName,
      email: client.userEmail,
      status: 'online',
      currentPage: client.currentPage,
      lastActivity: getRelativeTime(client.lastActivity)
    }));

    ws.send(JSON.stringify({
      type: 'users_update',
      users
    }));
  }

  function broadcastActiveUsers() {
    const users = Array.from(clients.values()).map(client => ({
      id: client.userId,
      name: client.userName,
      email: client.userEmail,
      status: 'online',
      currentPage: client.currentPage,
      lastActivity: getRelativeTime(client.lastActivity)
    }));

    broadcastToAll({
      type: 'users_update',
      users
    });
  }

  function broadcastToAll(message: any, exclude?: WebSocket) {
    const data = JSON.stringify(message);
    clients.forEach((client, ws) => {
      if (ws !== exclude && ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });
  }

  function getRelativeTime(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  console.log('✅ WebSocket server initialized');
  
  return wss;
}

