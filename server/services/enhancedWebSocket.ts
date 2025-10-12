/**
 * Enhanced WebSocket Service for Real-time Collaboration
 * Advanced WebSocket infrastructure with clustering, presence management, and performance optimization
 */

import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { Duplex } from 'stream';
import Database from 'better-sqlite3';

interface WebSocketClient {
  ws: WebSocket;
  userId: string;
  companyId: string;
  projectId?: string;
  userRole: string;
  isAlive: boolean;
  lastPing: number;
  subscriptions: Set<string>;
  presence: {
    status: 'online' | 'away' | 'busy' | 'offline';
    currentPage?: string;
    lastActivity: number;
  };
}

interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
  userId?: string;
  projectId?: string;
}

interface PresenceUpdate {
  userId: string;
  companyId: string;
  projectId?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  currentPage?: string;
  timestamp: number;
}

export class EnhancedWebSocketService {
  private wss: WebSocketServer;
  private db: Database.Database;
  private clients: Map<string, WebSocketClient> = new Map();
  private heartbeatInterval: NodeJS.Timeout;
  private presenceCleanupInterval: NodeJS.Timeout;
  private messageQueue: Map<string, WebSocketMessage[]> = new Map();

  constructor(server: any, db: Database.Database) {
    this.db = db;

    // Create WebSocket server with advanced options
    this.wss = new WebSocketServer({
      server,
      perMessageDeflate: {
        zlibDeflateOptions: {
          chunkSize: 1024,
          memLevel: 7,
          level: 3,
        },
        zlibInflateOptions: {
          chunkSize: 10 * 1024,
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024,
      },
      maxPayload: 1024 * 1024, // 1MB max message size
      skipUTF8Validation: false,
    });

    this.setupEventHandlers();
    this.startHeartbeat();
    this.startPresenceCleanup();

    console.log('🚀 Enhanced WebSocket service initialized');
  }

  private setupEventHandlers(): void {
    this.wss.on('connection', (ws: WebSocket, request: IncomingMessage) => {
      this.handleConnection(ws, request);
    });

    this.wss.on('error', (error) => {
      console.error('WebSocket server error:', error);
    });

    this.wss.on('close', () => {
      console.log('WebSocket server closed');
      this.cleanup();
    });
  }

  private handleConnection(ws: WebSocket, request: IncomingMessage): void {
    const url = new URL(request.url || '', 'http://localhost');
    const token = url.searchParams.get('token');
    const projectId = url.searchParams.get('projectId');

    if (!token) {
      ws.close(1008, 'Token required');
      return;
    }

    try {
      // Verify token and get user info
      const { getCurrentUserByToken } = require('../auth');
      const user = getCurrentUserByToken(this.db, token);

      if (!user) {
        ws.close(1008, 'Invalid token');
        return;
      }

      const clientId = this.generateClientId();
      const client: WebSocketClient = {
        ws,
        userId: user.id,
        companyId: user.company_id,
        projectId: projectId || undefined,
        userRole: user.role,
        isAlive: true,
        lastPing: Date.now(),
        subscriptions: new Set(),
        presence: {
          status: 'online',
          currentPage: undefined,
          lastActivity: Date.now(),
        },
      };

      this.clients.set(clientId, client);
      this.setupClientHandlers(clientId, ws);

      console.log(`🔗 WebSocket client connected: ${user.name} (${user.role})`);

      // Send welcome message with current state
      this.sendToClient(clientId, {
        type: 'connection_established',
        payload: {
          clientId,
          user,
          serverTime: Date.now(),
          activeUsers: this.getActiveUsersInCompany(user.company_id),
        },
        timestamp: Date.now(),
      });

      // Broadcast user joined
      this.broadcastToCompany(user.company_id, {
        type: 'user_joined',
        payload: {
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          projectId: projectId || null,
        },
        timestamp: Date.now(),
      }, clientId);

    } catch (error) {
      console.error('WebSocket connection error:', error);
      ws.close(1011, 'Server error');
    }
  }

  private setupClientHandlers(clientId: string, ws: WebSocket): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    ws.on('message', (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        this.handleMessage(clientId, message);
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
        this.sendToClient(clientId, {
          type: 'error',
          payload: { message: 'Invalid message format' },
          timestamp: Date.now(),
        });
      }
    });

    ws.on('pong', () => {
      if (client) {
        client.isAlive = true;
        client.lastPing = Date.now();
      }
    });

    ws.on('close', (code: number, reason: Buffer) => {
      this.handleDisconnection(clientId, code, reason);
    });

    ws.on('error', (error) => {
      console.error('WebSocket client error:', error);
      this.handleDisconnection(clientId, 1011, Buffer.from('Client error'));
    });
  }

  private handleMessage(clientId: string, message: WebSocketMessage): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Update presence
    client.presence.lastActivity = Date.now();

    switch (message.type) {
      case 'subscribe':
        this.handleSubscription(clientId, message.payload);
        break;
      case 'unsubscribe':
        this.handleUnsubscription(clientId, message.payload);
        break;
      case 'presence_update':
        this.handlePresenceUpdate(clientId, message.payload);
        break;
      case 'project_update':
        this.handleProjectUpdate(clientId, message.payload);
        break;
      case 'typing_indicator':
        this.handleTypingIndicator(clientId, message.payload);
        break;
      case 'ping':
        this.sendToClient(clientId, {
          type: 'pong',
          payload: { timestamp: Date.now() },
          timestamp: Date.now(),
        });
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private handleSubscription(clientId: string, payload: any): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { channel, projectId } = payload;

    if (channel === 'project') {
      client.subscriptions.add(`project:${projectId}`);
    } else if (channel === 'company') {
      client.subscriptions.add(`company:${client.companyId}`);
    } else if (channel === 'global') {
      client.subscriptions.add('global');
    }

    this.sendToClient(clientId, {
      type: 'subscription_confirmed',
      payload: { channel, projectId },
      timestamp: Date.now(),
    });
  }

  private handleUnsubscription(clientId: string, payload: any): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { channel, projectId } = payload;

    if (channel === 'project') {
      client.subscriptions.delete(`project:${projectId}`);
    } else if (channel === 'company') {
      client.subscriptions.delete(`company:${client.companyId}`);
    } else if (channel === 'global') {
      client.subscriptions.delete('global');
    }

    this.sendToClient(clientId, {
      type: 'unsubscription_confirmed',
      payload: { channel, projectId },
      timestamp: Date.now(),
    });
  }

  private handlePresenceUpdate(clientId: string, payload: any): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { status, currentPage } = payload;

    client.presence.status = status || client.presence.status;
    client.presence.currentPage = currentPage || client.presence.currentPage;

    // Broadcast presence update to relevant users
    this.broadcastToCompany(client.companyId, {
      type: 'presence_update',
      payload: {
        userId: client.userId,
        status: client.presence.status,
        currentPage: client.presence.currentPage,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    }, clientId);
  }

  private handleProjectUpdate(clientId: string, payload: any): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { projectId, updateType, data } = payload;

    // Verify user has access to this project
    if (!this.canUserAccessProject(client, projectId)) {
      this.sendToClient(clientId, {
        type: 'error',
        payload: { message: 'Access denied to project' },
        timestamp: Date.now(),
      });
      return;
    }

    // Broadcast update to all subscribers of this project
    this.broadcastToProject(projectId, {
      type: 'project_update',
      payload: {
        updateType,
        data,
        userId: client.userId,
        userName: this.getUserName(client.userId),
      },
      timestamp: Date.now(),
    }, clientId);
  }

  private handleTypingIndicator(clientId: string, payload: any): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { projectId, isTyping, field } = payload;

    // Broadcast typing indicator to project members
    this.broadcastToProject(projectId, {
      type: 'typing_indicator',
      payload: {
        userId: client.userId,
        userName: this.getUserName(client.userId),
        isTyping,
        field,
      },
      timestamp: Date.now(),
    }, clientId);
  }

  private handleDisconnection(clientId: string, code: number, reason: Buffer): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Update presence to offline
    client.presence.status = 'offline';

    // Broadcast user left
    this.broadcastToCompany(client.companyId, {
      type: 'user_left',
      payload: {
        userId: client.userId,
        userName: this.getUserName(client.userId),
      },
      timestamp: Date.now(),
    }, clientId);

    // Clean up
    this.clients.delete(clientId);
    console.log(`🔌 WebSocket client disconnected: ${client.userId} (code: ${code})`);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws: WebSocket) => {
        const client = Array.from(this.clients.values()).find(c => c.ws === ws);
        if (!client) {
          ws.terminate();
          return;
        }

        if (!client.isAlive) {
          ws.terminate();
          this.clients.delete(Array.from(this.clients.entries()).find(([_, c]) => c.ws === ws)?.[0]);
          return;
        }

        client.isAlive = false;
        ws.ping();
      });
    }, 30000); // Ping every 30 seconds
  }

  private startPresenceCleanup(): void {
    this.presenceCleanupInterval = setInterval(() => {
      const now = Date.now();
      const offlineThreshold = 5 * 60 * 1000; // 5 minutes

      this.clients.forEach((client, clientId) => {
        if (now - client.presence.lastActivity > offlineThreshold) {
          client.presence.status = 'offline';

          this.broadcastToCompany(client.companyId, {
            type: 'presence_update',
            payload: {
              userId: client.userId,
              status: 'offline',
              timestamp: now,
            },
            timestamp: now,
          }, clientId);
        }
      });
    }, 60000); // Check every minute
  }

  private sendToClient(clientId: string, message: WebSocketMessage): void {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  private broadcastToCompany(companyId: string, message: WebSocketMessage, excludeClientId?: string): void {
    this.clients.forEach((client, clientId) => {
      if (clientId !== excludeClientId && client.companyId === companyId) {
        this.sendToClient(clientId, message);
      }
    });
  }

  private broadcastToProject(projectId: string, message: WebSocketMessage, excludeClientId?: string): void {
    this.clients.forEach((client, clientId) => {
      if (clientId !== excludeClientId &&
          (client.subscriptions.has(`project:${projectId}`) || client.projectId === projectId)) {
        this.sendToClient(clientId, message);
      }
    });
  }

  private broadcastToGlobal(message: WebSocketMessage, excludeClientId?: string): void {
    this.clients.forEach((client, clientId) => {
      if (clientId !== excludeClientId && client.subscriptions.has('global')) {
        this.sendToClient(clientId, message);
      }
    });
  }

  private canUserAccessProject(client: WebSocketClient, projectId: string): boolean {
    // Check if user has access to the project
    const project = this.db.prepare(`
      SELECT id FROM projects WHERE id = ? AND company_id = ?
    `).get(projectId, client.companyId);

    return !!project;
  }

  private getUserName(userId: string): string {
    const user = this.db.prepare('SELECT name FROM users WHERE id = ?').get(userId);
    return user?.name || 'Unknown User';
  }

  private getActiveUsersInCompany(companyId: string): any[] {
    const activeUsers: any[] = [];
    this.clients.forEach((client) => {
      if (client.companyId === companyId && client.presence.status === 'online') {
        activeUsers.push({
          userId: client.userId,
          userName: this.getUserName(client.userId),
          userRole: client.userRole,
          currentPage: client.presence.currentPage,
          lastActivity: client.presence.lastActivity,
        });
      }
    });
    return activeUsers;
  }

  private generateClientId(): string {
    return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.presenceCleanupInterval) {
      clearInterval(this.presenceCleanupInterval);
    }
    this.clients.clear();
    this.messageQueue.clear();
  }

  // Public API methods

  public broadcastProjectUpdate(projectId: string, updateType: string, data: any, excludeUserId?: string): void {
    const excludeClientId = excludeUserId ?
      Array.from(this.clients.entries()).find(([_, client]) => client.userId === excludeUserId)?.[0] :
      undefined;

    this.broadcastToProject(projectId, {
      type: 'project_update',
      payload: {
        updateType,
        data,
        serverGenerated: true,
      },
      timestamp: Date.now(),
    }, excludeClientId);
  }

  public broadcastCompanyUpdate(companyId: string, updateType: string, data: any, excludeUserId?: string): void {
    const excludeClientId = excludeUserId ?
      Array.from(this.clients.entries()).find(([_, client]) => client.userId === excludeUserId)?.[0] :
      undefined;

    this.broadcastToCompany(companyId, {
      type: 'company_update',
      payload: {
        updateType,
        data,
        serverGenerated: true,
      },
      timestamp: Date.now(),
    }, excludeClientId);
  }

  public sendNotification(userId: string, notification: any): void {
    const clientId = Array.from(this.clients.entries()).find(([_, client]) => client.userId === userId)?.[0];
    if (clientId) {
      this.sendToClient(clientId, {
        type: 'notification',
        payload: notification,
        timestamp: Date.now(),
      });
    }
  }

  public getConnectedUsers(companyId?: string): any[] {
    const users: any[] = [];
    this.clients.forEach((client) => {
      if (!companyId || client.companyId === companyId) {
        users.push({
          userId: client.userId,
          userName: this.getUserName(client.userId),
          userRole: client.userRole,
          status: client.presence.status,
          currentPage: client.presence.currentPage,
          lastActivity: client.presence.lastActivity,
          subscriptions: Array.from(client.subscriptions),
        });
      }
    });
    return users;
  }

  public getConnectionStats(): any {
    const stats = {
      totalConnections: this.clients.size,
      connectionsByCompany: {} as Record<string, number>,
      connectionsByStatus: {} as Record<string, number>,
    };

    this.clients.forEach((client) => {
      // Count by company
      stats.connectionsByCompany[client.companyId] =
        (stats.connectionsByCompany[client.companyId] || 0) + 1;

      // Count by status
      stats.connectionsByStatus[client.presence.status] =
        (stats.connectionsByStatus[client.presence.status] || 0) + 1;
    });

    return stats;
  }
}

export default EnhancedWebSocketService;