// PM2 Ecosystem Configuration for ASAgents Platform Production Deployment

module.exports = {
  apps: [
    {
      // Backend API Server
      name: 'asagents-backend',
      script: './backend/src/index.ts',
      interpreter: 'node',
      interpreter_args: '--loader tsx',
      cwd: './backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 5001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5001,
        HOST: '0.0.0.0'
      },
      // Monitoring and Restart Configuration
      max_memory_restart: '500M',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      
      // Logging Configuration
      log_file: './logs/backend-combined.log',
      out_file: './logs/backend-out.log',
      error_file: './logs/backend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Health Monitoring
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
      
      // Advanced Configuration
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,
      
      // Environment Variables
      env_file: './.env.production',
      
      // Watch Configuration (disabled in production)
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads', '*.log'],
      
      // Source Map Support
      source_map_support: true,
      
      // Graceful Shutdown
      kill_retry_time: 100,
      
      // Process Title
      name: 'asagents-backend-prod'
    },
    
    {
      // Frontend Static Server (if serving with PM2)
      name: 'asagents-frontend',
      script: 'serve',
      args: '-s dist -l 4003 -n',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      instances: 1,
      exec_mode: 'fork',
      
      // Monitoring
      max_memory_restart: '200M',
      min_uptime: '10s',
      max_restarts: 5,
      
      // Logging
      log_file: './logs/frontend-combined.log',
      out_file: './logs/frontend-out.log',
      error_file: './logs/frontend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Watch Configuration
      watch: false,
      
      // Process Title
      name: 'asagents-frontend-prod'
    }
  ],

  // Deployment Configuration
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server.com'],
      ref: 'origin/main',
      repo: 'https://github.com/adrianstanca1/final.git',
      path: '/var/www/asagents-platform',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'ssh_options': 'StrictHostKeyChecking=no'
    },
    
    staging: {
      user: 'deploy',
      host: ['staging-server.com'],
      ref: 'origin/develop',
      repo: 'https://github.com/adrianstanca1/final.git',
      path: '/var/www/asagents-platform-staging',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging',
      'ssh_options': 'StrictHostKeyChecking=no'
    }
  }
};
