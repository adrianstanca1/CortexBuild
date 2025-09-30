import { Router } from 'express';
import { getDatabase } from '../database/connection';
import { asyncHandler } from '../middleware/errorHandler';
import { HealthCheckResponse, ApiResponse } from '../types';

const router = Router();

// Health check endpoint
router.get('/',
  asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const db = getDatabase();
    
    // Check database health
    const dbHealth = await db.healthCheck();
    
    // Get memory usage
    const memoryUsage = process.memoryUsage();
    const memoryTotal = memoryUsage.heapTotal;
    const memoryUsed = memoryUsage.heapUsed;
    const memoryPercentage = Math.round((memoryUsed / memoryTotal) * 100);
    
    // Calculate uptime
    const uptime = process.uptime();
    
    // Determine overall health status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (dbHealth.status === 'disconnected') {
      status = 'unhealthy';
    } else if (memoryPercentage > 90 || (dbHealth.responseTime && dbHealth.responseTime > 1000)) {
      status = 'degraded';
    }
    
    // Get database stats
    const dbStats = await db.getStats();
    
    const healthData: HealthCheckResponse = {
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
        websocket: true, // Assume WebSocket is healthy if API is responding
        file_storage: true // Assume file storage is healthy
      },
      environment: process.env.NODE_ENV || 'development',
      node_version: process.version
    };
    
    const responseTime = Date.now() - startTime;
    
    const response: ApiResponse<HealthCheckResponse> = {
      success: true,
      data: healthData,
      meta: {
        response_time_ms: responseTime
      }
    };
    
    // Set appropriate HTTP status code based on health
    const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(response);
  })
);

// Detailed system information (admin only)
router.get('/detailed',
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    
    // Get detailed database information
    const tables = await db.all(`
      SELECT 
        name,
        (SELECT COUNT(*) FROM sqlite_master WHERE type='index' AND tbl_name=m.name) as index_count
      FROM sqlite_master m
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `);
    
    // Get table row counts
    const tableStats: Array<{
      name: string;
      row_count: number;
      index_count: number;
      error?: string;
    }> = [];
    for (const table of tables as { name: string; index_count: number }[]) {
      try {
        const result = await db.get(`SELECT COUNT(*) as count FROM ${table.name}`);
        tableStats.push({
          name: table.name,
          row_count: (result as { count: number }).count,
          index_count: table.index_count
        });
      } catch (error) {
        tableStats.push({
          name: table.name,
          row_count: 0,
          index_count: table.index_count,
          error: 'Unable to count rows'
        });
      }
    }
    
    // Get process information
    const processInfo = {
      pid: process.pid,
      platform: process.platform,
      arch: process.arch,
      node_version: process.version,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu_usage: process.cpuUsage()
    };
    
    // Get environment variables (filtered for security)
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      DATABASE_URL: process.env.DATABASE_URL ? '[REDACTED]' : undefined,
      JWT_SECRET: process.env.JWT_SECRET ? '[REDACTED]' : undefined
    };
    
    const response: ApiResponse = {
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
  })
);

// Simple ping endpoint
router.get('/ping',
  asyncHandler(async (req, res) => {
    const response: ApiResponse = {
      success: true,
      data: {
        message: 'pong',
        timestamp: new Date().toISOString()
      }
    };
    
    res.json(response);
  })
);

// Database connectivity test
router.get('/db',
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    const startTime = Date.now();
    
    try {
      await db.get('SELECT 1 as test');
      const responseTime = Date.now() - startTime;
      
      const response: ApiResponse = {
        success: true,
        data: {
          status: 'connected',
          response_time_ms: responseTime,
          timestamp: new Date().toISOString()
        }
      };
      
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
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
  })
);

export default router;
