/**
 * Parallel Processing Configuration
 * Environment variables and defaults for worker and queue management
 */

export const parallelProcessingConfig = {
  // PM2 Worker Configuration
  pm2: {
    workerInstances: process.env.PM2_WORKER_INSTANCES || 'max',
    maxMemory: process.env.PM2_WORKER_MAX_MEMORY || '512MB',
    execMode: process.env.PM2_WORKER_EXEC_MODE || 'fork'
  },

  // Queue Configuration
  queue: {
    maxConcurrentJobs: parseInt(process.env.QUEUE_MAX_CONCURRENT_JOBS || '3'),
    jobTimeoutSeconds: parseInt(process.env.QUEUE_JOB_TIMEOUT_SECONDS || '300'),
    cleanupDays: parseInt(process.env.QUEUE_CLEANUP_DAYS || '30'),
    resetStuckJobsMinutes: parseInt(process.env.QUEUE_RESET_STUCK_JOBS_MINUTES || '10')
  },

  // Worker Process Configuration
  worker: {
    type: process.env.WORKER_TYPE || 'agent-executor',
    heartbeatInterval: parseInt(process.env.WORKER_HEARTBEAT_INTERVAL || '30000'),
    maxMemoryMB: parseInt(process.env.WORKER_MAX_MEMORY_MB || '256'),
    maxCpuPercent: parseInt(process.env.WORKER_MAX_CPU_PERCENT || '80')
  },

  // Agent Configuration
  agent: {
    maxConcurrentJobs: parseInt(process.env.AGENT_MAX_CONCURRENT_JOBS || '1'),
    defaultTimeoutSeconds: parseInt(process.env.AGENT_DEFAULT_TIMEOUT_SECONDS || '300'),
    executorPath: process.env.AGENT_EXECUTOR_PATH || './server/agent-executor.js'
  },

  // Database Configuration
  database: {
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000')
  }
};

export default parallelProcessingConfig;