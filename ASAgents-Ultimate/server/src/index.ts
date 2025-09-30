import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import fs from 'node:fs/promises';
import { env } from './utils/env.js';
import { logger } from './utils/logger.js';
import authRoutes from './routes/auth.js';
import documentRoutes from './routes/documents.js';
import projectRoutes from './routes/projects.js';
import invoiceRoutes from './routes/invoices.js';
import systemRoutes, { setManagers } from './routes/system.js';
import taskRoutes from './routes/tasks.js';
import companyRoutes from './routes/companies.js';
import expenseRoutes from './routes/expenses.js';
import userRoutes from './routes/users.js';
import dashboardRoutes from './routes/dashboard.js';
import notificationRoutes from './routes/notifications.js';
import analyticsRoutes from './routes/analytics.js';
import timeTrackingRoutes from './routes/timeTracking.js';
import adminRoutes from './routes/admin.js';
// import auth0Routes from './routes/auth0.js';
import tenantRoutes from './routes/tenants.js';
import testRoutes from './routes/test.js';
import { authenticateUser } from './middleware/authenticate.js';
import { realTimeService } from './services/realTimeService.js';

// Import our new managers system
import { ManagersIntegration } from './managers/ManagersIntegration.js';
import { getCompleteManagersConfig } from './config/managers-config.js';
import type { Environment } from './types/managers.js';

const app = express();

// Global managers instance
let managers: ManagersIntegration;

// Initialize managers system
async function initializeManagers() {
  try {
    const environment: Environment = (process.env.NODE_ENV as Environment) || 'development';
    const config = getCompleteManagersConfig(environment);

    logger.info(`Initializing ASAgents Managers for ${environment} environment...`);

    // Initialize all managers with integration
    managers = await ManagersIntegration.initialize(config);

    logger.info('✅ Managers initialized successfully!');

    // Setup initial secrets from environment
    await setupInitialSecrets();

    return managers;
  } catch (error) {
    logger.error({ error }, '❌ Failed to initialize managers');
    throw error;
  }
}

// Setup initial secrets from environment variables
async function setupInitialSecrets() {
  const environment: Environment = (process.env.NODE_ENV as Environment) || 'development';

  try {
    // JWT secrets
    if (env.jwtAccessSecret) {
      await managers.secrets.setSecret(
        'jwt_access_secret',
        env.jwtAccessSecret,
        {
          type: 'jwt_secret',
          environment,
          description: 'JWT access token secret',
          rotationInterval: 90
        }
      );
    }

    if (env.jwtRefreshSecret) {
      await managers.secrets.setSecret(
        'jwt_refresh_secret',
        env.jwtRefreshSecret,
        {
          type: 'jwt_secret',
          environment,
          description: 'JWT refresh token secret',
          rotationInterval: 90
        }
      );
    }

    // Database credentials
    await managers.secrets.setSecret(
      'db_password',
      env.dbPassword,
      {
        type: 'database_credential',
        environment,
        description: 'Database password',
        rotationInterval: 180
      }
    );

    logger.info('✅ Initial secrets setup complete');
  } catch (error) {
    logger.error({ error }, 'Failed to setup initial secrets');
  }
}

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/time-tracking', timeTrackingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/test', testRoutes);

app.get('/api/me', authenticateUser, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthenticated' });
  }

  return res.json({ user: req.user });
});

app.use('/docs', express.static(env.uploadRoot));

// Create and configure the Express app for serverless environments
export async function createServer() {
  try {
    // Initialize managers first
    await initializeManagers();

    // Pass managers to system routes
    if (managers) {
      setManagers(managers);
    }

    // Setup enhanced middleware using managers
    if (managers) {
      // Use managers' security middleware
      app.use(managers.api.securityHeadersMiddleware());

      // Enhanced authentication middleware for protected routes
      app.use('/api', (req, res, next) => {
        // Skip auth for public endpoints
        if (req.path === '/system/health' || req.path === '/auth/login' || req.path === '/auth/register') {
          return next();
        }

        // Use our enhanced authentication
        return managers.api.authenticationMiddleware()(req, res, next);
      });

      // Enhanced rate limiting
      app.use('/api', managers.api.rateLimitMiddleware());

      // Response formatting
      app.use('/api', managers.api.responseFormattingMiddleware());
    }

    await fs.mkdir(env.uploadRoot, { recursive: true });

    // Skip WebSocket initialization in serverless environment
    if (!process.env.VERCEL) {
      // For serverless, we'll initialize WebSocket later when we have a server instance
      logger.info('WebSocket initialization deferred for serverless compatibility');
    } else {
      logger.info('Skipping WebSocket initialization in serverless environment');
    }

    return app;
  } catch (error) {
    logger.error({ error }, 'Failed to create server');
    throw error;
  }
}

async function bootstrap() {
  try {
    // Initialize the server for local development
    await createServer();

    await fs.mkdir(env.uploadRoot, { recursive: true });
    const port = Number(process.env.PORT ?? 4000);

    const server = app.listen(port, () => {
      logger.info(`🚀 ASAgents API Server listening on :${port}`);
      logger.info(`📊 Health check: http://localhost:${port}/api/system/health`);
      logger.info(`🔌 WebSocket server available at ws://localhost:${port}/ws`);

      if (managers) {
        // Log startup metrics
        managers.monitoring.info('Server started', 'server', { port });
        managers.monitoring.recordMetric('server_starts', 1, 'counter');
      }
    });

    // Initialize WebSocket server for real-time features
    realTimeService.initialize(server);
    logger.info('✅ Real-time WebSocket service initialized');
  } catch (error) {
    logger.error({ error }, 'Failed to bootstrap server');
    throw error;
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('🛑 Received SIGTERM, shutting down gracefully...');

  // Shutdown real-time service
  realTimeService.shutdown();

  if (managers) {
    await managers.shutdown();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('🛑 Received SIGINT, shutting down gracefully...');

  // Shutdown real-time service
  realTimeService.shutdown();

  if (managers) {
    await managers.shutdown();
  }
  process.exit(0);
});

// Export app for serverless functions
export { app };

// Only run bootstrap if not in serverless environment
if (!process.env.VERCEL) {
  bootstrap().catch((error) => {
    logger.error({ error }, 'Failed to start API');
    process.exit(1);
  });
}
