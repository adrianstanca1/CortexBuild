// Enterprise Managers Integration
// Comprehensive manager initialization and coordination for the ASAgents backend

const SecurityManager = require('./SecurityManager');
const APIManager = require('./APIManager');
const ConfigManager = require('./ConfigManager');
const MonitoringManager = require('./MonitoringManager');

class ManagersIntegration {
  constructor() {
    this.managers = {};
    this.initialized = false;
  }

  /**
   * Initialize all enterprise managers in proper sequence
   */
  async initialize() {
    if (this.initialized) {
      return this.managers;
    }

    try {
      // Initialize managers in dependency order
      console.log('🚀 Initializing Enterprise Managers...');

      // 1. Configuration Manager (required by others)
      this.managers.config = new ConfigManager();
      await this.managers.config.initialize();
      console.log('✅ Configuration Manager initialized');

      // 2. Security Manager (required by API and monitoring)  
      this.managers.security = new SecurityManager();
      await this.managers.security.initialize();
      console.log('✅ Security Manager initialized');

      // 3. API Manager (depends on security and config)
      this.managers.api = new APIManager(this.managers.security, this.managers.config);
      await this.managers.api.initialize();
      console.log('✅ API Manager initialized');

      // 4. Monitoring Manager (can depend on others)
      this.managers.monitoring = new MonitoringManager();
      await this.managers.monitoring.initialize();
      console.log('✅ Monitoring Manager initialized');

      // Create integrated manager interface
      const integratedManagers = {
        // Health check interface
        getSystemHealth: () => ({
          security: { status: this.managers.security?.isHealthy() ? 'healthy' : 'unhealthy' },
          secrets: { status: 'healthy' }, 
          api: { status: this.managers.api?.isHealthy() ? 'healthy' : 'unhealthy' },
          configuration: { status: this.managers.config?.isHealthy() ? 'healthy' : 'unhealthy' },
          monitoring: { status: this.managers.monitoring?.isHealthy() ? 'healthy' : 'unhealthy' }
        }),

        // System statistics
        getSystemStats: () => ({
          security: { policy: 'active' },
          secrets: { cacheStats: { hits: 0, misses: 0 } },
          api: { stats: this.managers.api?.getStats() || { requests: 0, errors: 0 } },
          configuration: { stats: { totalConfigurations: 0 } },
          monitoring: { stats: { totalLogs: 0 } },
          integration: {
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development'
          }
        }),

        // Manager access
        config: this.managers.config,
        security: this.managers.security,
        api: this.managers.api,
        monitoring: this.managers.monitoring,

        // Shutdown handler
        shutdown: async () => {
          console.log('🛑 Shutting down Enterprise Managers...');
          
          if (this.managers.monitoring) {
            await this.managers.monitoring.shutdown();
          }
          
          if (this.managers.api) {
            await this.managers.api.shutdown();
          }
          
          if (this.managers.security) {
            await this.managers.security.shutdown();
          }
          
          if (this.managers.config) {
            await this.managers.config.shutdown();
          }
          
          console.log('✅ All Enterprise Managers shut down successfully');
        }
      };

      this.initialized = true;
      console.log('🎉 All Enterprise Managers initialized successfully');
      
      return integratedManagers;

    } catch (error) {
      console.error('❌ Failed to initialize Enterprise Managers:', error);
      throw error;
    }
  }

  /**
   * Get manager instance by name
   */
  getManager(name) {
    return this.managers[name];
  }

  /**
   * Check if all managers are healthy
   */
  isHealthy() {
    return Object.values(this.managers).every(manager => 
      manager.isHealthy ? manager.isHealthy() : true
    );
  }
}

// Create singleton instance
const managersIntegration = new ManagersIntegration();

module.exports = {
  ManagersIntegration: managersIntegration
};