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
import { createEnhancedFeaturesRoutes } from './routes/enhanced-features';
import { createReportingBIMRoutes } from './routes/reporting-bim';

// Load environment variables from .env.local first, then .env
dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

/**
 * Auth Routes - Will be registered in startServer() after db initialization
 */

// POST /api/auth/refresh
app.post('/api/auth/refresh', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

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
app.get('/api/chat/message', auth.authenticateToken, async (req, res) => {
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
app.post('/api/chat/message', auth.authenticateToken, async (req, res) => {
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

/**
 * Start server
 */
const startServer = async () => {
    try {
        // Initialize database
        await initDatabase();
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

        // Register Auth routes
        console.log('🔐 Registering Auth routes...');

        app.post('/api/auth/login', (req, res) => {
            try {
                const { email, password } = req.body;

                if (!email || !password) {
                    return res.status(400).json({ error: 'Email and password are required' });
                }

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

        app.post('/api/auth/register', (req, res) => {
            try {
                const { email, password, name, companyName } = req.body;

                if (!email || !password || !name || !companyName) {
                    return res.status(400).json({
                        error: 'Email, password, name, and company name are required'
                    });
                }

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
                const token = req.headers.authorization?.replace('Bearer ', '');

                if (!token) {
                    return res.status(400).json({ error: 'Token is required' });
                }

                auth.logout(db, token);

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
        app.use('/api/clients', clientsRouter);
        console.log('  ✓ /api/clients');

        app.use('/api/projects', createProjectsRouter(db));
        console.log('  ✓ /api/projects');

        app.use('/api/rfis', createRFIsRouter(db));
        console.log('  ✓ /api/rfis');

        app.use('/api/invoices', createInvoicesRouter(db));
        console.log('  ✓ /api/invoices');

        app.use('/api/time-entries', createTimeEntriesRouter(db));
        console.log('  ✓ /api/time-entries');

        app.use('/api/subcontractors', createSubcontractorsRouter(db));
        console.log('  ✓ /api/subcontractors');

        app.use('/api/purchase-orders', createPurchaseOrdersRouter(db));
        console.log('  ✓ /api/purchase-orders');

        app.use('/api/tasks', createTasksRouter(db));
        console.log('  ✓ /api/tasks');

        app.use('/api/milestones', createMilestonesRouter(db));
        console.log('  ✓ /api/milestones');

        app.use('/api/documents', createDocumentsRouter(db));
        console.log('  ✓ /api/documents');

        app.use('/api/modules', createModulesRouter(db));
        console.log('  ✓ /api/modules');

        app.use('/api/admin', createAdminRouter(db));
        console.log('  ✓ /api/admin');

        app.use('/api/marketplace', createMarketplaceRouter(db));
        console.log('  ✓ /api/marketplace');

        app.use('/api/global-marketplace', createGlobalMarketplaceRouter(db));
        console.log('  ✓ /api/global-marketplace');

        app.use('/api/widgets', createWidgetsRouter(db));
        console.log('  ✓ /api/widgets');

        app.use('/api/smart-tools', createSmartToolsRouter(db));
        console.log('  ✓ /api/smart-tools');

        app.use('/api/sdk', createSDKRouter(db));
        console.log('  ✓ /api/sdk');

        app.use('/api/admin/sdk', adminSDKRouter);
        console.log('  ✓ /api/admin/sdk');

        app.use('/api/admin/enhanced', createEnhancedAdminRoutes(db));
        console.log('  ✓ /api/admin/enhanced');

        app.use('/api/ai', createAIChatRoutes(db));
        console.log('  ✓ /api/ai');

        app.use('/api/developer', createDeveloperRoutes(db));
        console.log('  ✓ /api/developer');

        app.use('/api/integrations', createIntegrationsRouter(db));
        console.log('  ✓ /api/integrations');

        app.use('/api/agentkit', createAgentKitRouter(db));
        console.log('  ✓ /api/agentkit');

        app.use('/api/workflows', createWorkflowsRouter(db));
        console.log('  ✓ /api/workflows');

        app.use('/api/automations', createAutomationsRouter(db));
        console.log('  ✓ /api/automations');

        app.use('/api/enhanced', createEnhancedFeaturesRoutes(db));
        console.log('  ✓ /api/enhanced (chat history, notifications, construction features)');

        app.use('/api/reporting', createReportingBIMRoutes(db));
        console.log('  ✓ /api/reporting (daily logs, weekly reports, BIM, clash detection, IoT)');

        console.log('✅ All 26 API routes registered successfully');

        // Register 404 handler AFTER all routes
        app.use((req, res) => {
            console.log(`❌ 404 Not Found: ${req.method} ${req.path}`);
            res.status(404).json({ error: 'Not found' });
        });

        // Register error handler LAST
        app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            console.error('Server error:', err);
            res.status(500).json({
                error: 'Internal server error',
                message: err.message
            });
        });

        // Clean up expired sessions every hour
        setInterval(() => {
            auth.cleanupExpiredSessions();
        }, 60 * 60 * 1000);

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
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
