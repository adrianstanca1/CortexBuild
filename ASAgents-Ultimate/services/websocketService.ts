import environment from '../config/environment';
import { performanceMonitor } from '../utils/performance';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
  id?: string;
  tenantId?: number;
  userId?: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

export interface WebSocketOptions {
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  debug?: boolean;
  autoConnect?: boolean;
  messageQueueSize?: number;
  compressionEnabled?: boolean;
}

export interface ConnectionStats {
  connected: boolean;
  reconnectAttempts: number;
  lastConnected?: Date;
  lastDisconnected?: Date;
  messagesSent: number;
  messagesReceived: number;
  bytesTransferred: number;
  averageLatency: number;
}

type EventHandler = (data: any, message: WebSocketMessage) => void;
type ConnectionHandler = (stats: ConnectionStats) => void;
type ErrorHandler = (error: Error) => void;

class EnhancedWebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private options: Required<WebSocketOptions>;
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private disconnectionHandlers: Set<ConnectionHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();
  private messageQueue: WebSocketMessage[] = [];
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private shouldReconnect = true;
  private stats: ConnectionStats;
  private latencyMeasurements: number[] = [];
  private authToken: string | null = null;
  private tenantId: number | null = null;
  private userId: string | null = null;

  constructor(options: WebSocketOptions = {}) {
    const env = environment;
    this.url = env.wsUrl || 'ws://localhost:3001';
    this.options = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      debug: false,
      autoConnect: true,
      messageQueueSize: 100,
      compressionEnabled: true,
      ...options,
    };

    this.stats = {
      connected: false,
      reconnectAttempts: 0,
      messagesSent: 0,
      messagesReceived: 0,
      bytesTransferred: 0,
      averageLatency: 0,
    };

    if (this.options.autoConnect) {
      this.connect().catch(error => {
        this.log('Auto-connect failed:', error);
      });
    }
  }

  // Set authentication details
  setAuth(token: string, tenantId?: number, userId?: string): void {
    this.authToken = token;
    this.tenantId = tenantId || null;
    this.userId = userId || null;
    
    // Reconnect with new auth if already connected
    if (this.isConnected()) {
      this.disconnect();
      this.connect();
    }
  }

  // Clear authentication
  clearAuth(): void {
    this.authToken = null;
    this.tenantId = null;
    this.userId = null;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        return;
      }

      this.isConnecting = true;
      this.log('Connecting to WebSocket...');

      try {
        // Build URL with auth parameters
        let wsUrl = this.url;
        const params = new URLSearchParams();
        
        if (this.authToken) {
          params.append('token', this.authToken);
        }
        if (this.tenantId) {
          params.append('tenantId', this.tenantId.toString());
        }
        if (this.userId) {
          params.append('userId', this.userId);
        }
        
        if (params.toString()) {
          wsUrl += `?${params.toString()}`;
        }

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.stats.connected = true;
          this.stats.lastConnected = new Date();
          this.startHeartbeat();
          this.processMessageQueue();
          this.notifyConnectionHandlers();
          
          // Record connection metric
          performanceMonitor.recordMetric({
            name: 'websocket_connection',
            value: 1,
            timestamp: Date.now(),
            type: 'counter',
          });
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
            this.stats.messagesReceived++;
            this.stats.bytesTransferred += event.data.length;
          } catch (error) {
            this.log('Failed to parse message:', error);
            this.notifyErrorHandlers(new Error('Failed to parse WebSocket message'));
          }
        };

        this.ws.onclose = (event) => {
          this.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.stats.connected = false;
          this.stats.lastDisconnected = new Date();
          this.stopHeartbeat();
          this.notifyDisconnectionHandlers();
          
          // Record disconnection metric
          performanceMonitor.recordMetric({
            name: 'websocket_disconnection',
            value: 1,
            timestamp: Date.now(),
            type: 'counter',
            tags: { code: event.code.toString() },
          });
          
          if (this.shouldReconnect && this.reconnectAttempts < this.options.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          this.log('WebSocket error:', error);
          this.isConnecting = false;
          this.notifyErrorHandlers(new Error('WebSocket connection error'));
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.clearReconnectTimer();
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.stats.connected = false;
  }

  send(type: string, data: any, options: { priority?: WebSocketMessage['priority'] } = {}): void {
    const message: WebSocketMessage = {
      type,
      data,
      timestamp: Date.now(),
      id: this.generateId(),
      tenantId: this.tenantId || undefined,
      userId: this.userId || undefined,
      priority: options.priority || 'normal',
    };

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.sendMessage(message);
    } else {
      // Queue message for later delivery
      this.queueMessage(message);
      this.log('Message queued (not connected):', message);
    }
  }

  // Send with acknowledgment
  sendWithAck(type: string, data: any, timeout: number = 5000): Promise<any> {
    return new Promise((resolve, reject) => {
      const messageId = this.generateId();
      const timeoutId = setTimeout(() => {
        this.off(`ack_${messageId}`, ackHandler);
        reject(new Error('Message acknowledgment timeout'));
      }, timeout);

      const ackHandler = (ackData: any) => {
        clearTimeout(timeoutId);
        resolve(ackData);
      };

      this.on(`ack_${messageId}`, ackHandler);
      
      this.send(type, { ...data, _ackId: messageId });
    });
  }

  // Subscribe to specific events with filters
  subscribe(event: string, handler: EventHandler, filters?: Record<string, any>): () => void {
    const wrappedHandler = (data: any, message: WebSocketMessage) => {
      // Apply filters if provided
      if (filters) {
        for (const [key, value] of Object.entries(filters)) {
          if (message[key as keyof WebSocketMessage] !== value) {
            return; // Skip this message
          }
        }
      }
      handler(data, message);
    };

    this.on(event, wrappedHandler);
    
    // Return unsubscribe function
    return () => this.off(event, wrappedHandler);
  }

  on(event: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  off(event: string, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }
    }
  }

  onConnect(handler: ConnectionHandler): void {
    this.connectionHandlers.add(handler);
  }

  onDisconnect(handler: ConnectionHandler): void {
    this.disconnectionHandlers.add(handler);
  }

  onError(handler: ErrorHandler): void {
    this.errorHandlers.add(handler);
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getStats(): ConnectionStats {
    return { ...this.stats };
  }

  // Clear message queue
  clearQueue(): void {
    this.messageQueue = [];
  }

  // Get queue size
  getQueueSize(): number {
    return this.messageQueue.length;
  }

  private sendMessage(message: WebSocketMessage): void {
    try {
      const messageStr = JSON.stringify(message);
      this.ws!.send(messageStr);
      this.stats.messagesSent++;
      this.stats.bytesTransferred += messageStr.length;
      this.log('Sent message:', message);

      // Record latency measurement for heartbeat
      if (message.type === 'heartbeat') {
        this.latencyMeasurements.push(Date.now());
      }
    } catch (error) {
      this.log('Failed to send message:', error);
      this.notifyErrorHandlers(new Error('Failed to send WebSocket message'));
    }
  }

  private queueMessage(message: WebSocketMessage): void {
    // Remove oldest messages if queue is full
    if (this.messageQueue.length >= this.options.messageQueueSize) {
      this.messageQueue.shift();
    }

    // Add message to queue (prioritize by priority)
    if (message.priority === 'critical') {
      this.messageQueue.unshift(message);
    } else {
      this.messageQueue.push(message);
    }
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected()) {
      const message = this.messageQueue.shift()!;
      this.sendMessage(message);
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    this.log('Received message:', message);

    // Handle heartbeat response
    if (message.type === 'heartbeat_ack') {
      this.updateLatency(message.timestamp);
      return;
    }

    // Handle acknowledgment messages
    if (message.type.startsWith('ack_')) {
      const handlers = this.eventHandlers.get(message.type);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(message.data, message);
          } catch (error) {
            this.log('Error in ack handler:', error);
          }
        });
      }
      return;
    }

    // Notify event handlers
    const handlers = this.eventHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message.data, message);
        } catch (error) {
          this.log('Error in event handler:', error);
          this.notifyErrorHandlers(error as Error);
        }
      });
    }

    // Send acknowledgment if requested
    if (message.data?._ackId) {
      this.send(`ack_${message.data._ackId}`, { received: true });
    }
  }

  private updateLatency(serverTimestamp: number): void {
    const now = Date.now();
    const latency = now - serverTimestamp;

    this.latencyMeasurements.push(latency);

    // Keep only last 10 measurements
    if (this.latencyMeasurements.length > 10) {
      this.latencyMeasurements.shift();
    }

    // Calculate average latency
    this.stats.averageLatency = this.latencyMeasurements.reduce((a, b) => a + b, 0) / this.latencyMeasurements.length;
  }

  private scheduleReconnect(): void {
    this.clearReconnectTimer();
    this.reconnectAttempts++;
    this.stats.reconnectAttempts = this.reconnectAttempts;

    const delay = Math.min(
      this.options.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    this.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        this.log('Reconnect failed:', error);
        this.notifyErrorHandlers(new Error('Reconnection failed'));
      });
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      this.send('heartbeat', { timestamp: Date.now() });
    }, this.options.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private notifyConnectionHandlers(): void {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(this.getStats());
      } catch (error) {
        this.log('Error in connection handler:', error);
      }
    });
  }

  private notifyDisconnectionHandlers(): void {
    this.disconnectionHandlers.forEach(handler => {
      try {
        handler(this.getStats());
      } catch (error) {
        this.log('Error in disconnection handler:', error);
      }
    });
  }

  private notifyErrorHandlers(error: Error): void {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (handlerError) {
        this.log('Error in error handler:', handlerError);
      }
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private log(...args: any[]): void {
    if (this.options.debug) {
      console.log('[WebSocket]', ...args);
    }
  }
}

// Create singleton instance
export const websocketService = new EnhancedWebSocketService({ debug: true });

// Export types
export type { WebSocketMessage, WebSocketOptions, ConnectionStats };
