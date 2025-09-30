import { WebSocketServer, WebSocket } from 'ws';
import { logger } from '../utils/logger.js';
import { pool } from './db.js';
export class RealTimeService {
    wss = null;
    clients = new Map();
    eventQueue = [];
    isProcessing = false;
    heartbeatInterval = null;
    metricsInterval = null;
    /**
     * Initialize WebSocket server
     */
    initialize(server) {
        this.wss = new WebSocketServer({
            server,
            path: '/ws',
            perMessageDeflate: false
        });
        this.wss.on('connection', this.handleConnection.bind(this));
        this.startHeartbeat();
        this.startMetricsCollection();
        logger.info('Real-time WebSocket service initialized');
    }
    /**
     * Handle new WebSocket connection
     */
    handleConnection(ws, request) {
        const connectionId = this.generateConnectionId();
        const url = new URL(request.url, `http://${request.headers.host}`);
        const tenantId = parseInt(url.searchParams.get('tenantId') || '0');
        const userId = parseInt(url.searchParams.get('userId') || '0');
        if (!tenantId || !userId) {
            ws.close(1008, 'Missing tenantId or userId');
            return;
        }
        const client = {
            ws,
            tenantId,
            userId,
            subscriptions: new Set(),
            lastActivity: new Date(),
            metadata: {
                userAgent: request.headers['user-agent'],
                ipAddress: request.socket.remoteAddress,
                connectionId
            }
        };
        this.clients.set(connectionId, client);
        ws.on('message', (data) => this.handleMessage(connectionId, data));
        ws.on('close', () => this.handleDisconnection(connectionId));
        ws.on('error', (error) => this.handleError(connectionId, error));
        // Send welcome message
        this.sendToClient(connectionId, {
            type: 'connection_established',
            payload: {
                connectionId,
                serverTime: new Date().toISOString(),
                supportedEvents: [
                    'task_updated',
                    'project_updated',
                    'expense_created',
                    'notification_created',
                    'user_activity',
                    'system_alert'
                ]
            },
            timestamp: new Date().toISOString()
        });
        logger.info({ connectionId, tenantId, userId }, 'WebSocket client connected');
    }
    /**
     * Handle incoming WebSocket message
     */
    handleMessage(connectionId, data) {
        const client = this.clients.get(connectionId);
        if (!client)
            return;
        try {
            const message = JSON.parse(data.toString());
            client.lastActivity = new Date();
            switch (message.type) {
                case 'subscribe':
                    this.handleSubscription(connectionId, message.payload);
                    break;
                case 'unsubscribe':
                    this.handleUnsubscription(connectionId, message.payload);
                    break;
                case 'ping':
                    this.sendToClient(connectionId, {
                        type: 'pong',
                        payload: { timestamp: new Date().toISOString() },
                        timestamp: new Date().toISOString()
                    });
                    break;
                case 'request_data':
                    this.handleDataRequest(connectionId, message.payload);
                    break;
                default:
                    logger.warn({ connectionId, messageType: message.type }, 'Unknown message type');
            }
        }
        catch (error) {
            logger.error({ connectionId, error }, 'Error handling WebSocket message');
        }
    }
    /**
     * Handle subscription request
     */
    handleSubscription(connectionId, payload) {
        const client = this.clients.get(connectionId);
        if (!client)
            return;
        const { events } = payload;
        if (Array.isArray(events)) {
            events.forEach(event => client.subscriptions.add(event));
        }
        this.sendToClient(connectionId, {
            type: 'subscription_confirmed',
            payload: {
                subscriptions: Array.from(client.subscriptions)
            },
            timestamp: new Date().toISOString()
        });
        logger.debug({ connectionId, subscriptions: events }, 'Client subscribed to events');
    }
    /**
     * Handle unsubscription request
     */
    handleUnsubscription(connectionId, payload) {
        const client = this.clients.get(connectionId);
        if (!client)
            return;
        const { events } = payload;
        if (Array.isArray(events)) {
            events.forEach(event => client.subscriptions.delete(event));
        }
        this.sendToClient(connectionId, {
            type: 'unsubscription_confirmed',
            payload: {
                subscriptions: Array.from(client.subscriptions)
            },
            timestamp: new Date().toISOString()
        });
    }
    /**
     * Handle data request
     */
    async handleDataRequest(connectionId, payload) {
        const client = this.clients.get(connectionId);
        if (!client)
            return;
        try {
            const { dataType, filters } = payload;
            let data = null;
            switch (dataType) {
                case 'dashboard_metrics':
                    data = await this.getDashboardMetrics(client.tenantId);
                    break;
                case 'recent_activities':
                    data = await this.getRecentActivities(client.tenantId, filters?.limit || 10);
                    break;
                case 'notifications':
                    data = await this.getNotifications(client.tenantId, client.userId);
                    break;
                default:
                    throw new Error(`Unknown data type: ${dataType}`);
            }
            this.sendToClient(connectionId, {
                type: 'data_response',
                payload: {
                    dataType,
                    data,
                    requestId: payload.requestId
                },
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.sendToClient(connectionId, {
                type: 'data_error',
                payload: {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    requestId: payload.requestId
                },
                timestamp: new Date().toISOString()
            });
        }
    }
    /**
     * Handle client disconnection
     */
    handleDisconnection(connectionId) {
        const client = this.clients.get(connectionId);
        if (client) {
            logger.info({
                connectionId,
                tenantId: client.tenantId,
                userId: client.userId,
                duration: Date.now() - client.lastActivity.getTime()
            }, 'WebSocket client disconnected');
        }
        this.clients.delete(connectionId);
    }
    /**
     * Handle WebSocket error
     */
    handleError(connectionId, error) {
        logger.error({ connectionId, error }, 'WebSocket error');
        this.clients.delete(connectionId);
    }
    /**
     * Broadcast event to subscribed clients
     */
    broadcastEvent(event) {
        this.eventQueue.push(event);
        if (!this.isProcessing) {
            this.processEventQueue();
        }
    }
    /**
     * Process event queue
     */
    async processEventQueue() {
        if (this.isProcessing || this.eventQueue.length === 0)
            return;
        this.isProcessing = true;
        try {
            while (this.eventQueue.length > 0) {
                const event = this.eventQueue.shift();
                await this.processEvent(event);
            }
        }
        catch (error) {
            logger.error({ error }, 'Error processing event queue');
        }
        finally {
            this.isProcessing = false;
        }
    }
    /**
     * Process individual event
     */
    async processEvent(event) {
        const relevantClients = Array.from(this.clients.values()).filter(client => client.tenantId === event.tenantId &&
            client.subscriptions.has(event.type));
        const message = {
            type: 'real_time_event',
            payload: event,
            timestamp: event.timestamp
        };
        for (const client of relevantClients) {
            try {
                if (client.ws.readyState === WebSocket.OPEN) {
                    client.ws.send(JSON.stringify(message));
                }
            }
            catch (error) {
                logger.error({
                    connectionId: client.metadata.connectionId,
                    error
                }, 'Error sending event to client');
            }
        }
        logger.debug({
            eventType: event.type,
            clientCount: relevantClients.length
        }, 'Event broadcasted to clients');
    }
    /**
     * Send message to specific client
     */
    sendToClient(connectionId, message) {
        const client = this.clients.get(connectionId);
        if (!client || client.ws.readyState !== WebSocket.OPEN)
            return;
        try {
            client.ws.send(JSON.stringify(message));
        }
        catch (error) {
            logger.error({ connectionId, error }, 'Error sending message to client');
        }
    }
    /**
     * Start heartbeat to keep connections alive
     */
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            const now = new Date();
            const staleThreshold = 5 * 60 * 1000; // 5 minutes
            for (const [connectionId, client] of this.clients.entries()) {
                if (now.getTime() - client.lastActivity.getTime() > staleThreshold) {
                    logger.info({ connectionId }, 'Closing stale connection');
                    client.ws.close();
                    this.clients.delete(connectionId);
                }
                else if (client.ws.readyState === WebSocket.OPEN) {
                    // Send ping
                    this.sendToClient(connectionId, {
                        type: 'ping',
                        payload: { timestamp: now.toISOString() },
                        timestamp: now.toISOString()
                    });
                }
            }
        }, 30000); // Every 30 seconds
    }
    /**
     * Start metrics collection
     */
    startMetricsCollection() {
        this.metricsInterval = setInterval(async () => {
            try {
                const metrics = {
                    connectedClients: this.clients.size,
                    activeConnections: Array.from(this.clients.values()).filter(client => client.ws.readyState === WebSocket.OPEN).length,
                    eventQueueSize: this.eventQueue.length,
                    timestamp: new Date().toISOString()
                };
                // Broadcast metrics to subscribed clients
                this.broadcastEvent({
                    type: 'system_alert',
                    entityType: 'system',
                    entityId: 'metrics',
                    tenantId: 0, // System-wide
                    data: metrics,
                    timestamp: new Date().toISOString()
                });
            }
            catch (error) {
                logger.error({ error }, 'Error collecting metrics');
            }
        }, 60000); // Every minute
    }
    /**
     * Get dashboard metrics
     */
    async getDashboardMetrics(tenantId) {
        const [rows] = await pool.query(`SELECT 
         COUNT(DISTINCT p.id) as total_projects,
         COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_projects,
         COUNT(DISTINCT t.id) as total_tasks,
         COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END) as completed_tasks,
         COUNT(DISTINCT u.id) as total_users,
         COALESCE(SUM(e.amount), 0) as total_expenses
       FROM projects p
       LEFT JOIN tasks t ON p.id = t.project_id
       LEFT JOIN users u ON u.tenant_id = p.tenant_id
       LEFT JOIN expenses e ON p.id = e.project_id
       WHERE p.tenant_id = ?`, [tenantId]);
        return rows[0] || {};
    }
    /**
     * Get recent activities
     */
    async getRecentActivities(tenantId, limit) {
        const [rows] = await pool.query(`SELECT * FROM audit_logs 
       WHERE tenant_id = ? 
       ORDER BY created_at DESC 
       LIMIT ?`, [tenantId, limit]);
        return rows;
    }
    /**
     * Get notifications
     */
    async getNotifications(tenantId, userId) {
        const [rows] = await pool.query(`SELECT * FROM notifications 
       WHERE tenant_id = ? AND (user_id = ? OR user_id IS NULL) AND is_read = 0
       ORDER BY created_at DESC 
       LIMIT 20`, [tenantId, userId]);
        return rows;
    }
    /**
     * Generate unique connection ID
     */
    generateConnectionId() {
        return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Get connection statistics
     */
    getStats() {
        const connections = Array.from(this.clients.values());
        const tenantCounts = connections.reduce((acc, client) => {
            acc[client.tenantId] = (acc[client.tenantId] || 0) + 1;
            return acc;
        }, {});
        return {
            totalConnections: this.clients.size,
            activeConnections: connections.filter(c => c.ws.readyState === WebSocket.OPEN).length,
            tenantDistribution: tenantCounts,
            eventQueueSize: this.eventQueue.length,
            uptime: process.uptime()
        };
    }
    /**
     * Shutdown service
     */
    shutdown() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
        }
        for (const client of this.clients.values()) {
            client.ws.close();
        }
        if (this.wss) {
            this.wss.close();
        }
        logger.info('Real-time service shutdown complete');
    }
    /**
     * Get information about connected clients
     */
    getClientsInfo() {
        const clients = Array.from(this.clients.values()).map(client => ({
            connectionId: client.metadata.connectionId,
            tenantId: client.tenantId,
            userId: client.userId,
            subscriptions: Array.from(client.subscriptions),
            lastActivity: client.lastActivity,
            isConnected: client.ws.readyState === WebSocket.OPEN,
            userAgent: client.metadata.userAgent,
            ipAddress: client.metadata.ipAddress
        }));
        return {
            totalClients: this.clients.size,
            activeClients: clients.filter(c => c.isConnected).length,
            clients
        };
    }
}
export const realTimeService = new RealTimeService();
