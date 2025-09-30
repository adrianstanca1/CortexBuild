import { Router } from 'express';
import { healthCheck } from '../services/db.js';
import { authenticateUser, type AuthenticatedRequest, requireRole } from '../middleware/authenticate.js';

const router = Router();

// Global managers instance (will be set by main server)
let managers: any = null;

export function setManagers(managersInstance: any) {
  managers = managersInstance;
}

router.get('/health', async (_req, res) => {
  const database = await healthCheck();

  let managersHealth = null;
  if (managers) {
    try {
      managersHealth = await managers.performHealthCheck();
    } catch (error) {
      managersHealth = { overall: 'unhealthy', error: 'Failed to check managers health' };
    }
  }

  const overallStatus = database && (!managersHealth || managersHealth.overall !== 'unhealthy')
    ? 'ok'
    : 'degraded';

  return res.json({
    status: overallStatus,
    database,
    managers: managersHealth,
    timestamp: new Date().toISOString()
  });
});

// Enhanced health check with detailed information
router.get('/health/detailed', authenticateUser, requireRole(['owner', 'admin']), async (req: AuthenticatedRequest, res) => {
  try {
    const database = await healthCheck();

    let managersHealth = null;
    let systemStats = null;

    if (managers) {
      try {
        managersHealth = await managers.performHealthCheck();
        systemStats = managers.getSystemStats();
      } catch (error) {
        managersHealth = { overall: 'unhealthy', error: 'Failed to check managers health' };
      }
    }

    return res.json({
      status: database && (!managersHealth || managersHealth.overall !== 'unhealthy') ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database: {
        connected: database,
        status: database ? 'healthy' : 'unhealthy'
      },
      managers: managersHealth,
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
        environment: process.env.NODE_ENV || 'development'
      },
      stats: systemStats
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to perform detailed health check',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// System metrics endpoint
router.get('/metrics', authenticateUser, requireRole(['owner', 'admin']), async (req: AuthenticatedRequest, res) => {
  try {
    if (!managers) {
      return res.status(503).json({ message: 'Managers not available' });
    }

    const stats = managers.getSystemStats();
    const healthCheck = await managers.performHealthCheck();

    return res.json({
      health: healthCheck,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch system metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Configuration endpoint
router.get('/config', authenticateUser, requireRole(['owner', 'admin']), async (req: AuthenticatedRequest, res) => {
  try {
    if (!managers) {
      return res.status(503).json({ message: 'Managers not available' });
    }

    const environment = (process.env.NODE_ENV as any) || 'development';
    const config = await managers.config.getEnvironmentConfig(environment);

    return res.json({
      environment,
      config,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch system configuration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
