import { User } from '../types';

export interface RealTimeEvent {
  type: 'task_updated' | 'project_updated' | 'expense_created' | 'notification_created' | 'user_activity' | 'system_alert';
  entityType: 'task' | 'project' | 'expense' | 'notification' | 'user' | 'system';
  entityId: string | number;
  tenantId: number;
  userId?: number;
  data: any;
  timestamp: string;
}

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
  tenantId?: number;
  userId?: number;
}

export type EventCallback = (event: RealTimeEvent) => void;
export type ConnectionCallback = (connected: boolean) => void;

export class RealTimeClient {
  private static instance: RealTimeClient;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventSubscriptions = new Map<string, Set<EventCallback>>();
  private connectionCallbacks = new Set<ConnectionCallback>();
  private user: User | null = null;
  private tenantId: number | null = null;
  private isConnecting = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): RealTimeClient {
    if (!RealTimeClient.instance) {
      RealTimeClient.instance = new RealTimeClient();
    }
    return RealTimeClient.instance;
  }

  /**
   * Initialize connection with user context
   */
  connect(user: User, tenantId: number): void {
    if (this.isConnecting || (this.ws?.readyState === WebSocket.OPEN && this.user?.id === user.id)) {
      return;
    }

    this.user = user;
    this.tenantId = tenantId;
    this.isConnecting = true;

    this.disconnect(); // Close any existing connection

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws?tenantId=${tenantId}&userId=${user.id}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Real-time WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.notifyConnectionCallbacks(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Real-time WebSocket disconnected');
        this.isConnecting = false;
        this.stopHeartbeat();
        this.notifyConnectionCallbacks(false);
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.stopHeartbeat();
    this.notifyConnectionCallbacks(false);
  }

  /**
   * Subscribe to specific event types
   */
  subscribe(eventType: string, callback: EventCallback): () => void {
    if (!this.eventSubscriptions.has(eventType)) {
      this.eventSubscriptions.set(eventType, new Set());
    }
    
    this.eventSubscriptions.get(eventType)!.add(callback);

    // Send subscription message to server
    this.sendMessage({
      type: 'subscribe',
      payload: { events: [eventType] },
      timestamp: new Date().toISOString()
    });

    // Return unsubscribe function
    return () => {
      const callbacks = this.eventSubscriptions.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.eventSubscriptions.delete(eventType);
          // Send unsubscribe message to server
          this.sendMessage({
            type: 'unsubscribe',
            payload: { events: [eventType] },
            timestamp: new Date().toISOString()
          });
        }
      }
    };
  }

  /**
   * Subscribe to connection status changes
   */
  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.add(callback);
    
    // Immediately notify of current status
    callback(this.isConnected());

    return () => {
      this.connectionCallbacks.delete(callback);
    };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Request specific data from server
   */
  requestData(dataType: string, filters?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected()) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const requestId = this.generateRequestId();
      
      // Set up one-time listener for response
      const handleResponse = (message: WebSocketMessage) => {
        if (message.type === 'data_response' && message.payload.requestId === requestId) {
          resolve(message.payload.data);
          this.ws?.removeEventListener('message', handleResponse);
        } else if (message.type === 'data_error' && message.payload.requestId === requestId) {
          reject(new Error(message.payload.error));
          this.ws?.removeEventListener('message', handleResponse);
        }
      };

      this.ws?.addEventListener('message', handleResponse);

      // Send request
      this.sendMessage({
        type: 'request_data',
        payload: { dataType, filters, requestId },
        timestamp: new Date().toISOString()
      });

      // Set timeout
      setTimeout(() => {
        this.ws?.removeEventListener('message', handleResponse);
        reject(new Error('Request timeout'));
      }, 10000);
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'connection_established':
        console.log('WebSocket connection established:', message.payload);
        break;
      case 'real_time_event':
        this.handleRealTimeEvent(message.payload);
        break;
      case 'ping':
        this.sendMessage({
          type: 'pong',
          payload: { timestamp: new Date().toISOString() },
          timestamp: new Date().toISOString()
        });
        break;
      case 'pong':
        // Heartbeat response received
        break;
      default:
        console.log('Received WebSocket message:', message);
    }
  }

  /**
   * Handle real-time events
   */
  private handleRealTimeEvent(event: RealTimeEvent): void {
    const callbacks = this.eventSubscriptions.get(event.type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in event callback:', error);
        }
      });
    }
  }

  /**
   * Send message to server
   */
  private sendMessage(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts || !this.user || !this.tenantId) {
      console.error('Max reconnection attempts reached');
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;

    setTimeout(() => {
      if (this.user && this.tenantId) {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect(this.user, this.tenantId);
      }
    }, delay);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.sendMessage({
          type: 'ping',
          payload: { timestamp: new Date().toISOString() },
          timestamp: new Date().toISOString()
        });
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Notify connection callbacks
   */
  private notifyConnectionCallbacks(connected: boolean): void {
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        console.error('Error in connection callback:', error);
      }
    });
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const realTimeClient = RealTimeClient.getInstance();
