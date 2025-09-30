"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const connection_1 = require("../database/connection");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const startTime = Date.now();
    const db = (0, connection_1.getDatabase)();
    const dbHealth = await db.healthCheck();
    const memoryUsage = process.memoryUsage();
    const memoryTotal = memoryUsage.heapTotal;
    const memoryUsed = memoryUsage.heapUsed;
    const memoryPercentage = Math.round((memoryUsed / memoryTotal) * 100);
    const uptime = process.uptime();
    let status = 'healthy';
    if (dbHealth.status === 'disconnected') {
        status = 'unhealthy';
    }
    else if (memoryPercentage > 90 || (dbHealth.responseTime && dbHealth.responseTime > 1000)) {
        status = 'degraded';
    }
    const dbStats = await db.getStats();
    const healthData = {
        status,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        uptime,
        database: {
            status: dbHealth.status,
            response_time: dbHealth.responseTime,
            tables: dbStats.tables,
            total_rows: dbStats.totalRows,
            size_bytes: dbStats.databaseSize
        },
        memory: {
            used: memoryUsed,
            total: memoryTotal,
            percentage: memoryPercentage
        },
        services: {
            api: true,
            websocket: true,
            file_storage: true
        },
        environment: process.env.NODE_ENV || 'development',
        node_version: process.version
    };
    const responseTime = Date.now() - startTime;
    const response = {
        success: true,
        data: healthData,
        meta: {
            response_time_ms: responseTime
        }
    };
    const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;
    res.status(statusCode).json(response);
}));
router.get('/detailed', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const db = (0, connection_1.getDatabase)();
    const tables = await db.all(`
      SELECT 
        name,
        (SELECT COUNT(*) FROM sqlite_master WHERE type='index' AND tbl_name=m.name) as index_count
      FROM sqlite_master m
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `);
    const tableStats = [];
    for (const table of tables) {
        try {
            const result = await db.get(`SELECT COUNT(*) as count FROM ${table.name}`);
            tableStats.push({
                name: table.name,
                row_count: result.count,
                index_count: table.index_count
            });
        }
        catch (error) {
            tableStats.push({
                name: table.name,
                row_count: 0,
                index_count: table.index_count,
                error: 'Unable to count rows'
            });
        }
    }
    const processInfo = {
        pid: process.pid,
        platform: process.platform,
        arch: process.arch,
        node_version: process.version,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu_usage: process.cpuUsage()
    };
    const envVars = {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        DATABASE_URL: process.env.DATABASE_URL ? '[REDACTED]' : undefined,
        JWT_SECRET: process.env.JWT_SECRET ? '[REDACTED]' : undefined
    };
    const response = {
        success: true,
        data: {
            database: {
                tables: tableStats,
                connection_status: db.connected ? 'connected' : 'disconnected'
            },
            process: processInfo,
            environment: envVars,
            timestamp: new Date().toISOString()
        }
    };
    res.json(response);
}));
router.get('/ping', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const response = {
        success: true,
        data: {
            message: 'pong',
            timestamp: new Date().toISOString()
        }
    };
    res.json(response);
}));
router.get('/db', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const db = (0, connection_1.getDatabase)();
    const startTime = Date.now();
    try {
        await db.get('SELECT 1 as test');
        const responseTime = Date.now() - startTime;
        const response = {
            success: true,
            data: {
                status: 'connected',
                response_time_ms: responseTime,
                timestamp: new Date().toISOString()
            }
        };
        res.json(response);
    }
    catch (error) {
        const response = {
            success: false,
            message: 'Database connection failed',
            data: {
                status: 'disconnected',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            }
        };
        res.status(503).json(response);
    }
}));
exports.default = router;
//# sourceMappingURL=health.js.map