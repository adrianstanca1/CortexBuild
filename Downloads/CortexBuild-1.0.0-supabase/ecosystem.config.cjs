module.exports = {
  apps: [
    {
      name: 'cortexbuild-server',
      script: 'server/index.ts',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    },
    {
      name: 'cortexbuild-worker',
      script: 'server/worker.ts',
      instances: 'max',
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        WORKER_TYPE: 'agent-executor'
      },
      env_production: {
        NODE_ENV: 'production',
        WORKER_TYPE: 'agent-executor'
      }
    }
  ]
};