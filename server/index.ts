/**
 * Express Server with Real Authentication
 * JWT-based auth with SQLite database
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { db, initDatabase } from './database';
import * as auth from './auth';
import * as mcp from './services/mcp';
import * as deploymentService from './services/deployment';
import { setupWebSocket } from './websocket';

// Import API route creators
import { createClientsRouter } from './routes/clients';
import { createProjectsRouter } from './routes/projects';
import { createRFIsRouter } from './routes/rfis';
import { createInvoicesRouter } from './routes/invoices';
import { createTimeEntriesRouter } from './routes/time-entries';
import { createSubcontractorsRouter } from './routes/subcontractors';
import { createPurchaseOrdersRouter } from './routes/purchase-orders';
import { createTasksRouter } from './routes/tasks';
import { createMilestonesRouter } from './routes/milestones';
import { createDocumentsRouter } from './routes/documents';
import { createModulesRouter } from './routes/modules';
import { createAdminRouter } from './routes/admin';
import { createMarketplaceRouter } from './routes/marketplace';
import { createGlobalMarketplaceRouter } from './routes/global-marketplace';
import { createWidgetsRouter } from './routes/widgets';
import { createSmartToolsRouter } from './routes/smart-tools';
import { createSDKRouter, initSdkTables } from './routes/sdk';
import adminSDKRouter from './routes/admin-sdk';
import { createEnhancedAdminRoutes } from './routes/enhanced-admin';
import { createAIChatRoutes } from './routes/ai-chat';
import { createDeveloperRoutes } from './routes/developer';
import { createIntegrationsRouter } from './routes/integrations';
import { createAgentKitRouter } from './routes/agentkit';
import { createWorkflowsRouter } from './routes/workflows';
import { createAutomationsRouter } from './routes/automations';
<<<<<<< Updated upstream
import { createMyApplicationsRouter } from './routes/my-applications';
import { createSubscriptionService, SubscriptionService } from './services/subscription-service';

// Import error handling middleware
import {
  globalErrorHandler,
  notFoundHandler,
  handleUncaughtException,
  handleUnhandledRejection,
  handleShutdown,
} from './middleware/errorHandler';
import { logger } from './utils/logger';

// Import rate limiting middleware
import {
  authRateLimit,
  generalRateLimit,
  adminRateLimit,
  uploadRateLimit
} from './middleware/rateLimiter';

// Import validation middleware
import {
  validateBody,
  loginSchema,
  registerSchema,
  refreshTokenSchema
} from './utils/validation';
=======
>>>>>>> Stashed changes

// Load environment variables from .env.local first, then .env
dotenv.config({ path: '.env.local' });
dotenv.config();

// Setup process-level error handlers (MUST be before any other code)
handleUncaughtException();
handleUnhandledRejection();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// HTTP Request logging middleware
app.use(logger.httpLogger());

// Request logging (keep for debugging)
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

/**
 * Auth Routes - Will be registered in startServer() after db initialization
 */

// POST /api/auth/refresh
app.post('/api/auth/refresh', validateBody(refreshTokenSchema), async (req, res) => {
    try {
        const { token } = req.body;

        const result = await auth.refreshToken(token);
        
        res.json({
            success: true,
            user: result.user,
            token: result.token
        });
    } catch (error: any) {
        console.error('Refresh token error:', error);
        res.status(401).json({ 
            success: false,
            error: error.message || 'Token refresh failed' 
        });
    }
});

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

/**
 * Chat Routes (AI Chatbot)
 */

// GET /api/chat/message - Get chat history
app.get('/api/chat/message', generalRateLimit, auth.authenticateToken, async (req, res) => {
    try {
        // For now, return empty history
        // TODO: Implement chat history from database
        res.json({
            success: true,
            data: [],
        });
    } catch (error: any) {
        console.error('Chat history error:', error);
        res.status(500).json({ error: error.message || 'Failed to load chat history' });
    }
});

// POST /api/chat/message
app.post('/api/chat/message', generalRateLimit, async (req, res) => {
            try {
                const { message, sessionId, currentPage } = req.body;
                const userId = (req as any).user.id;
                const companyId = (req as any).user.company_id;

                // Import chatbot dynamically
                const { GeminiChatbot } = await import('../lib/ai/gemini-client');
                const { ChatTools } = await import('../lib/ai/chat-tools');

                // Build context
                const chatContext = {
                    userId,
                    companyId,
                    userName: (req as any).user.name,
                    companyName: (req as any).user.company?.name || 'Company',
                    userRole: (req as any).user.role,
                    currentPage,
                    availableData: {},
                };

                // Initialize chatbot
                const chatbot = new GeminiChatbot();
                await chatbot.initializeChat(chatContext, []);

                // Send message
                const response = await chatbot.sendMessage(message, chatContext);

                res.json({
                    success: true,
                    data: {
                        message: response.message,
                        toolResults: [],
                        pendingConfirmations: [],
                    },
                });
            } catch (error: any) {
                console.error('Chat error:', error.message);
                res.status(500).json({ error: error.message || 'Chat failed' });
            }
        });

// DELETE /api/chat/message - Clear chat history
app.delete('/api/chat/message', generalRateLimit, auth.authenticateToken, async (req, res) => {
    try {
        const { sessionId } = req.query;
        // TODO: Implement chat history deletion from database
        // For now, just return success
        res.json({
            success: true,
            message: 'Chat history cleared successfully',
        });
    } catch (error: any) {
        console.error('Chat delete error:', error);
        res.status(500).json({ error: error.message || 'Failed to clear chat history' });
    }
});

/**
 * Start server
 */
const startServer = async () => {
    try {
        // Initialize database
        initDatabase();
        auth.setDatabase(db);

        // Initialize MCP tables
        console.log('🧠 Initializing MCP (Model Context Protocol)...');
        try {
            mcp.initializeMCPTables(db);
        } catch (error) {
            console.warn('⚠️ MCP initialization failed, continuing without MCP:', error.message);
        }

        // Initialize deployment tables
        console.log('🚀 Initializing Deployment tables...');
        deploymentService.initDeploymentTables(db);

        // Initialize SDK tables
        console.log('🔧 Initializing SDK Developer tables...');
        initSdkTables(db);

        // Initialize subscription service
        console.log('💳 Initializing Subscription service...');
        const subscriptionService = createSubscriptionService(db);

        // Register Auth routes
        console.log('🔐 Registering Auth routes...');

        app.post('/api/auth/login', authRateLimit, validateBody(loginSchema), (req, res) => {
            try {
                const { email, password } = req.body;

                const result = auth.login(db, email, password);

                res.json({
                    success: true,
                    user: result.user,
                    token: result.token
                });
            } catch (error: any) {
                console.error('Login error:', error);
                res.status(401).json({
                    success: false,
                    error: error.message || 'Login failed'
                });
            }
        });

        app.post('/api/auth/register', authRateLimit, validateBody(registerSchema), (req, res) => {
            try {
                const { email, password, name, companyName } = req.body;

                const result = auth.register(db, email, password, name, companyName);

                res.json({
                    success: true,
                    user: result.user,
                    token: result.token
                });
            } catch (error: any) {
                console.error('Registration error:', error);
                res.status(400).json({
                    success: false,
                    error: error.message || 'Registration failed'
                });
            }
        });

        app.post('/api/auth/logout', (req, res) => {
            try {
                const token = req.body?.token || req.headers.authorization?.replace('Bearer ', '') || '';

                if (token && token.trim()) {
                    auth.logout(db, token);
                }

                res.json({ success: true });
            } catch (error: any) {
                console.error('Logout error:', error);
                res.status(400).json({
                    success: false,
                    error: error.message || 'Logout failed'
                });
            }
        });

        app.get('/api/auth/me', (req, res) => {
            try {
                const token = req.headers.authorization?.replace('Bearer ', '');

                if (!token) {
                    return res.status(401).json({ error: 'Token is required' });
                }

                const user = auth.getCurrentUserByToken(db, token);

                res.json({
                    success: true,
                    user
                });
            } catch (error: any) {
                console.error('Verify token error:', error);
                res.status(401).json({
                    success: false,
                    error: error.message || 'Invalid token'
                });
            }
        });

        console.log('  ✓ Auth routes registered');

        // Register API routes
        console.log('📝 Registering API routes...');
        const clientsRouter = createClientsRouter(db);
        app.use('/api/clients', generalRateLimit, clientsRouter);
        console.log('  ✓ /api/clients');

        app.use('/api/projects', generalRateLimit, createProjectsRouter(db));
        console.log('  ✓ /api/projects');

        app.use('/api/rfis', generalRateLimit, createRFIsRouter(db));
        console.log('  ✓ /api/rfis');

        app.use('/api/invoices', generalRateLimit, createInvoicesRouter(db));
        console.log('  ✓ /api/invoices');

        app.use('/api/time-entries', generalRateLimit, createTimeEntriesRouter(db));
        console.log('  ✓ /api/time-entries');

        app.use('/api/subcontractors', generalRateLimit, createSubcontractorsRouter(db));
        console.log('  ✓ /api/subcontractors');

        app.use('/api/purchase-orders', generalRateLimit, createPurchaseOrdersRouter(db));
        console.log('  ✓ /api/purchase-orders');

        app.use('/api/tasks', generalRateLimit, createTasksRouter(db));
        console.log('  ✓ /api/tasks');

        app.use('/api/milestones', generalRateLimit, createMilestonesRouter(db));
        console.log('  ✓ /api/milestones');

        app.use('/api/documents', generalRateLimit, createDocumentsRouter(db));
        console.log('  ✓ /api/documents');

        app.use('/api/modules', generalRateLimit, createModulesRouter(db));
        console.log('  ✓ /api/modules');

        app.use('/api/admin', adminRateLimit, createAdminRouter(db));
        console.log('  ✓ /api/admin');

        app.use('/api/marketplace', generalRateLimit, createMarketplaceRouter(db));
        console.log('  ✓ /api/marketplace');

<<<<<<< Updated upstream
        app.use('/api/global-marketplace', generalRateLimit, createGlobalMarketplaceRouter(db));
        console.log('  ✓ /api/global-marketplace');

        app.use('/api/widgets', generalRateLimit, createWidgetsRouter(db));
=======
        app.use('/api/global-marketplace', createGlobalMarketplaceRouter(db));
        console.log('  ✓ /api/global-marketplace');

        app.use('/api/widgets', createWidgetsRouter(db));
>>>>>>> Stashed changes
        console.log('  ✓ /api/widgets');

        app.use('/api/smart-tools', generalRateLimit, createSmartToolsRouter(db));
        console.log('  ✓ /api/smart-tools');

        app.use('/api/sdk', generalRateLimit, createSDKRouter(db));
        console.log('  ✓ /api/sdk');

        app.use('/api/admin/sdk', adminRateLimit, adminSDKRouter);
        console.log('  ✓ /api/admin/sdk');

        app.use('/api/admin/enhanced', adminRateLimit, createEnhancedAdminRoutes(db));
        console.log('  ✓ /api/admin/enhanced');

        app.use('/api/ai', generalRateLimit, createAIChatRoutes(db));
        console.log('  ✓ /api/ai');

        app.use('/api/developer', generalRateLimit, createDeveloperRoutes(db));
        console.log('  ✓ /api/developer');

<<<<<<< Updated upstream
        app.use('/api/integrations', generalRateLimit, createIntegrationsRouter(db));
        console.log('  ✓ /api/integrations');

        app.use('/api/agentkit', generalRateLimit, createAgentKitRouter(db));
        console.log('  ✓ /api/agentkit');

        app.use('/api/workflows', generalRateLimit, createWorkflowsRouter(db));
        console.log('  ✓ /api/workflows');
=======
        app.use('/api/integrations', createIntegrationsRouter(db));
        console.log('  ✓ /api/integrations');

        app.use('/api/agentkit', createAgentKitRouter(db));
        console.log('  ✓ /api/agentkit');

        app.use('/api/workflows', createWorkflowsRouter(db));
        console.log('  ✓ /api/workflows');

        app.use('/api/automations', createAutomationsRouter(db));
        console.log('  ✓ /api/automations');

        console.log('✅ All 24 API routes registered successfully');
>>>>>>> Stashed changes

        app.use('/api/automations', generalRateLimit, createAutomationsRouter(db));
        console.log('  ✓ /api/automations');

        app.use('/api/my-applications', generalRateLimit, createMyApplicationsRouter(db));
        console.log('  ✓ /api/my-applications');

        // Stripe webhook endpoint (no auth required)
        app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
            const sig = req.headers['stripe-signature'] as string;
            const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

            if (!endpointSecret) {
                console.warn('⚠️ Stripe webhook received but no webhook secret configured');
                return res.status(400).json({ error: 'Webhook not configured' });
            }

            let event: Stripe.Event;

            try {
                event = subscriptionService.stripe?.webhooks.constructEvent(req.body, sig, endpointSecret) || req.body;
            } catch (err: any) {
                console.error(`⚠️ Webhook signature verification failed:`, err.message);
                return res.status(400).json({ error: `Webhook Error: ${err.message}` });
            }

            try {
                // Handle the event
                await subscriptionService.handleWebhookEvent(event);
                console.log(`✅ Stripe webhook processed: ${event.type}`);

                res.json({ received: true });
            } catch (error: any) {
                console.error('❌ Error processing Stripe webhook:', error);
                res.status(500).json({ error: 'Webhook processing failed' });
            }
        });

        // Subscription status check endpoint
        app.post('/api/subscriptions/check-status', async (req, res) => {
            try {
                await subscriptionService.updateSubscriptionStatuses();
                res.json({ success: true });
            } catch (error: any) {
                console.error('Error checking subscription status:', error);
                res.status(500).json({ error: 'Failed to check subscription status' });
            }
        });

        console.log('✅ All 27 API routes registered successfully');

        // ==================================================
        // ERROR HANDLING MIDDLEWARE (MUST BE LAST!)
        // ==================================================
        
        // 1. 404 Not Found Handler (catches unmatched routes)
        app.use(notFoundHandler);
        console.log('  ✓ 404 handler registered');

        // 2. Global Error Handler (catches all errors)
        app.use(globalErrorHandler);
        console.log('  ✓ Global error handler registered');

        // Clean up expired sessions every hour
        setInterval(() => {
            auth.cleanupExpiredSessions();
        }, 60 * 60 * 1000);

        // Check subscription statuses every 6 hours
        setInterval(async () => {
            try {
                await subscriptionService.updateSubscriptionStatuses();
                console.log('🔄 Subscription statuses updated');
            } catch (error) {
                console.error('❌ Error updating subscription statuses:', error);
            }
        }, 6 * 60 * 60 * 1000);

        // Create HTTP server for WebSocket support
        const server = createServer(app);

        // Setup WebSocket
        setupWebSocket(server, db);

        // Start listening
        server.listen(PORT, () => {
            console.log('');
            console.log('🚀 CortexBuild AI Platform Server');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`✅ Server running on http://localhost:${PORT}`);
            console.log(`✅ WebSocket server on ws://localhost:${PORT}/ws`);
            console.log(`✅ Database initialized`);
            console.log(`✅ Ready to accept requests`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('');
            console.log('Available endpoints:');
            console.log('');
            console.log('🔐 Auth:');
            console.log(`  POST   http://localhost:${PORT}/api/auth/login`);
            console.log(`  POST   http://localhost:${PORT}/api/auth/register`);
            console.log(`  POST   http://localhost:${PORT}/api/auth/logout`);
            console.log(`  GET    http://localhost:${PORT}/api/auth/me`);
            console.log('');
            console.log('📊 API Routes (70+ endpoints):');
            console.log(`  /api/clients - 5 endpoints`);
            console.log(`  /api/projects - 5 endpoints`);
            console.log(`  /api/rfis - 6 endpoints`);
            console.log(`  /api/invoices - 7 endpoints`);
            console.log(`  /api/time-entries - 6 endpoints`);
            console.log(`  /api/subcontractors - 5 endpoints`);
            console.log(`  /api/purchase-orders - 6 endpoints`);
            console.log(`  /api/tasks - 6 endpoints`);
            console.log(`  /api/milestones - 5 endpoints`);
            console.log(`  /api/documents - 5 endpoints`);
            console.log(`  /api/modules - 9 endpoints`);
            console.log(`  /api/ai - 4 endpoints`);
            console.log('');
            console.log('🤖 AI Features:');
            console.log(`  POST   http://localhost:${PORT}/api/ai/chat`);
            console.log(`  POST   http://localhost:${PORT}/api/ai/suggest`);
            console.log(`  GET    http://localhost:${PORT}/api/ai/usage`);
            console.log('');
            console.log('🔴 Live Collaboration:');
            console.log(`  WS     ws://localhost:${PORT}/ws`);
            console.log('');
            console.log('✅ Error Handling:');
            console.log('  - Global error handler: ACTIVE');
            console.log('  - 404 handler: ACTIVE');
            console.log('  - Uncaught exception handler: ACTIVE');
            console.log('  - Unhandled rejection handler: ACTIVE');
            console.log('  - Graceful shutdown: ACTIVE');
            console.log('  - Logging: ./logs/cortexbuild-YYYY-MM-DD.log');
        });

        // Setup graceful shutdown handlers
        handleShutdown(server);
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
