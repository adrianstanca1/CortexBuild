"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wss = exports.server = exports.app = void 0;
exports.broadcast = broadcast;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const http_1 = require("http");
const ws_1 = require("ws");
const connection_1 = require("./database/connection");
const migrate_1 = require("./database/migrate");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_1 = __importDefault(require("./routes/auth"));
const projects_1 = __importDefault(require("./routes/projects"));
const invoices_1 = __importDefault(require("./routes/invoices"));
const health_1 = __importDefault(require("./routes/health"));
const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:4002,http://localhost:4003';
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
exports.server = server;
const wss = new ws_1.WebSocketServer({
    server,
    path: '/ws'
});
exports.wss = wss;
wss.on('connection', (ws, req) => {
    console.log('🔌 WebSocket client connected');
    ws.send(JSON.stringify({
        type: 'connection',
        data: {
            message: 'Connected to ASAgents WebSocket server',
            timestamp: new Date().toISOString()
        }
    }));
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());
            console.log('📨 WebSocket message received:', message);
            ws.send(JSON.stringify({
                type: 'echo',
                data: message,
                timestamp: new Date().toISOString()
            }));
        }
        catch (error) {
            console.error('❌ WebSocket message error:', error);
        }
    });
    ws.on('close', () => {
        console.log('🔌 WebSocket client disconnected');
    });
    ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
    });
});
function broadcast(message) {
    const data = JSON.stringify({
        ...message,
        timestamp: new Date().toISOString()
    });
    wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send(data);
        }
    });
}
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false
}));
app.use((0, cors_1.default)({
    origin: CORS_ORIGIN.split(',').map(origin => origin.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use((0, compression_1.default)());
if (NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined'));
}
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((req, res, next) => {
    if (NODE_ENV === 'development') {
        console.log(`📝 ${req.method} ${req.path}`, {
            query: req.query,
            body: req.method !== 'GET' ? req.body : undefined,
            headers: {
                authorization: req.headers.authorization ? '[REDACTED]' : undefined,
                'content-type': req.headers['content-type']
            }
        });
    }
    next();
});
app.use('/api/health', health_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/projects', projects_1.default);
app.use('/api/invoices', invoices_1.default);
app.get('/', (req, res) => {
    res.json({
        success: true,
        data: {
            name: 'ASAgents Backend API',
            version: '1.0.0',
            environment: NODE_ENV,
            timestamp: new Date().toISOString(),
            endpoints: {
                health: '/api/health',
                auth: '/api/auth',
                projects: '/api/projects',
                invoices: '/api/invoices'
            },
            websocket: '/ws'
        }
    });
});
app.get('/api', (req, res) => {
    res.json({
        success: true,
        data: {
            name: 'ASAgents Backend API',
            version: '1.0.0',
            environment: NODE_ENV,
            endpoints: [
                'GET /api/health - Health check',
                'POST /api/auth/login - User login',
                'GET /api/auth/me - Get current user',
                'GET /api/projects - List projects',
                'POST /api/projects - Create project',
                'GET /api/invoices - List invoices',
                'POST /api/invoices - Create invoice'
            ],
            websocket: 'ws://localhost:' + PORT + '/ws'
        }
    });
});
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
async function startServer() {
    try {
        console.log('🚀 Starting ASAgents Backend Server...');
        console.log(`📊 Environment: ${NODE_ENV}`);
        console.log(`🌐 CORS Origin: ${CORS_ORIGIN}`);
        console.log('🗄️ Initializing database...');
        const db = (0, connection_1.getDatabase)();
        console.log('🔄 Running database migrations...');
        await (0, migrate_1.runMigrations)();
        const dbHealth = await db.healthCheck();
        if (dbHealth.status === 'connected') {
            console.log('✅ Database connected successfully');
        }
        else {
            throw new Error('Database connection failed');
        }
        server.listen(PORT, () => {
            console.log(`🎉 Server running on port ${PORT}`);
            console.log(`📡 API: http://localhost:${PORT}/api`);
            console.log(`🔌 WebSocket: ws://localhost:${PORT}/ws`);
            console.log(`❤️ Health Check: http://localhost:${PORT}/api/health`);
            console.log('✨ ASAgents Backend is ready!');
        });
    }
    catch (error) {
        console.error('💥 Failed to start server:', error);
        process.exit(1);
    }
}
process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('🔌 HTTP server closed');
    });
    wss.close(() => {
        console.log('🔌 WebSocket server closed');
    });
    try {
        const db = (0, connection_1.getDatabase)();
        await db.close();
        console.log('🗄️ Database connection closed');
    }
    catch (error) {
        console.error('❌ Error closing database:', error);
    }
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('🛑 SIGINT received, shutting down gracefully...');
    server.close(() => {
        console.log('🔌 HTTP server closed');
    });
    wss.close(() => {
        console.log('🔌 WebSocket server closed');
    });
    try {
        const db = (0, connection_1.getDatabase)();
        await db.close();
        console.log('🗄️ Database connection closed');
    }
    catch (error) {
        console.error('❌ Error closing database:', error);
    }
    process.exit(0);
});
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
startServer();
//# sourceMappingURL=index.js.map