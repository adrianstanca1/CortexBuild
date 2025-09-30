import { websocketService } from './websocketService';
import { apiClient } from './apiClient';
import { geminiService } from './geminiService';
import { openaiService } from './openaiService';

class ConnectivityService {
  private connectionStatus = {
    backend: 'unknown',
    database: 'unknown',
    websocket: 'unknown',
    ai: 'unknown'
  };

  private healthCheckInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.initializeHealthChecks();
    this.setupEventListeners();
  }

  // Initialize health checks
  async initializeHealthChecks() {
    await this.checkAllConnections();
    this.startHealthCheckInterval();
  }

  // Check all system connections
  async checkAllConnections(): Promise<Record<string, string>> {
    const checks = await Promise.allSettled([
      this.checkBackendHealth(),
      this.checkDatabaseHealth(),
      this.checkWebSocketHealth(),
      this.checkAIServicesHealth()
    ]);

    this.connectionStatus = {
      backend: checks[0].status === 'fulfilled' ? 'connected' : 'disconnected',
      database: checks[1].status === 'fulfilled' ? 'connected' : 'disconnected',
      websocket: checks[2].status === 'fulfilled' ? 'connected' : 'disconnected',
      ai: checks[3].status === 'fulfilled' ? 'connected' : 'disconnected'
    };

    // Emit connectivity status update
    window.dispatchEvent(new CustomEvent('connectivity-update', {
      detail: this.connectionStatus
    }));

    return this.connectionStatus;
  }

  // Backend health check
  private async checkBackendHealth(): Promise<void> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/health`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (!response.ok) {
        throw new Error(`Backend health check failed: ${response.status}`);
      }

      const data = await response.json();
      if (data.status !== 'healthy') {
        throw new Error('Backend reports unhealthy status');
      }
    } catch (error) {
      console.error('Backend health check failed:', error);
      throw error;
    }
  }

  // Database health check
  private async checkDatabaseHealth(): Promise<void> {
    try {
      const response = await apiClient.get('/api/system/database/health');
      if (response.data.status !== 'connected') {
        throw new Error('Database connection failed');
      }
    } catch (error) {
      console.error('Database health check failed:', error);
      throw error;
    }
  }

  // WebSocket health check
  private async checkWebSocketHealth(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('WebSocket health check timeout'));
      }, 5000);

      if (websocketService.isConnected()) {
        clearTimeout(timeout);
        resolve();
      } else {
        websocketService.connect()
          .then(() => {
            clearTimeout(timeout);
            resolve();
          })
          .catch((error) => {
            clearTimeout(timeout);
            reject(error);
          });
      }
    });
  }

  // AI services health check
  private async checkAIServicesHealth(): Promise<void> {
    try {
      // Test Gemini connection
      await geminiService.testConnection();
      
      // Test OpenAI connection if configured
      if (import.meta.env.VITE_ENABLE_OPENAI === 'true') {
        await openaiService.testConnection?.();
      }
    } catch (error) {
      console.error('AI services health check failed:', error);
      throw error;
    }
  }

  // Start periodic health checks
  private startHealthCheckInterval() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(() => {
      this.checkAllConnections().catch(console.error);
    }, 30000); // Check every 30 seconds
  }

  // Setup event listeners for connection events
  private setupEventListeners() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('Network connection restored');
      this.handleReconnect();
    });

    window.addEventListener('offline', () => {
      console.log('Network connection lost');
      this.connectionStatus = {
        backend: 'disconnected',
        database: 'disconnected',
        websocket: 'disconnected',
        ai: 'disconnected'
      };
    });

    // Listen for WebSocket connection events
    websocketService.on('connected', () => {
      console.log('WebSocket connected');
      this.connectionStatus.websocket = 'connected';
    });

    websocketService.on('disconnected', () => {
      console.log('WebSocket disconnected');
      this.connectionStatus.websocket = 'disconnected';
      this.handleReconnect();
    });
  }

  // Handle reconnection logic
  private async handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    try {
      await this.checkAllConnections();
      this.reconnectAttempts = 0; // Reset on successful reconnection
    } catch (error) {
      console.error('Reconnection failed:', error);
      
      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      setTimeout(() => this.handleReconnect(), delay);
    }
  }

  // Get current connection status
  getConnectionStatus() {
    return { ...this.connectionStatus };
  }

  // Check if all critical services are connected
  isFullyConnected(): boolean {
    return Object.values(this.connectionStatus).every(status => status === 'connected');
  }

  // Check if any critical service is disconnected
  hasConnectionIssues(): boolean {
    return Object.values(this.connectionStatus).some(status => status === 'disconnected');
  }

  // Force reconnection
  async forceReconnect(): Promise<void> {
    this.reconnectAttempts = 0;
    await this.handleReconnect();
  }

  // Cleanup
  destroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}

export const connectivityService = new ConnectivityService();