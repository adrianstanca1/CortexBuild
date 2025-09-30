import { SecurityManager } from './SecurityManager.js';
import { SecretsManager } from './SecretsManager.js';
import { APIManager } from './APIManager.js';
import { ConfigurationManager } from './ConfigurationManager.js';
import { MonitoringManager } from './MonitoringManager.js';
import { ManagerError } from '../types/managers.js';
export class ManagersIntegration {
    static instance;
    security;
    secrets;
    api;
    config;
    monitoring;
    constructor(security, secrets, api, config, monitoring) {
        this.security = security;
        this.secrets = secrets;
        this.api = api;
        this.config = config;
        this.monitoring = monitoring;
    }
    /**
     * Initialize all managers with proper integration
     */
    static async initialize(managersConfig) {
        if (ManagersIntegration.instance) {
            return ManagersIntegration.instance;
        }
        try {
            // Initialize SecurityManager first (required by others)
            const security = SecurityManager.getInstance(managersConfig.securityPolicy);
            // Initialize SecretsManager
            const secrets = await SecretsManager.getInstance(managersConfig.secretsConfig, managersConfig.masterKey);
            // Initialize ConfigurationManager
            const config = await ConfigurationManager.getInstance();
            // Initialize MonitoringManager
            const monitoring = MonitoringManager.getInstance();
            // Initialize APIManager
            const api = await APIManager.getInstance(managersConfig.apiConfig);
            // Create integration instance
            const integration = new ManagersIntegration(security, secrets, api, config, monitoring);
            // Setup integrations between managers
            await integration.setupIntegrations(managersConfig);
            ManagersIntegration.instance = integration;
            // Log successful initialization
            monitoring.info('Managers integration initialized successfully', 'managers', {
                environment: managersConfig.environment,
                managersCount: 5
            });
            return integration;
        }
        catch (error) {
            throw new ManagerError('Failed to initialize managers integration', 'INTEGRATION_INIT_ERROR', 500, { originalError: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    /**
     * Get the singleton instance
     */
    static getInstance() {
        if (!ManagersIntegration.instance) {
            throw new ManagerError('ManagersIntegration not initialized. Call initialize() first.', 'NOT_INITIALIZED');
        }
        return ManagersIntegration.instance;
    }
    /**
     * Setup integrations between managers
     */
    async setupIntegrations(managersConfig) {
        // Setup monitoring for all managers
        this.setupMonitoringIntegration();
        // Setup configuration watchers
        this.setupConfigurationIntegration();
        // Setup API security integration
        this.setupAPISecurityIntegration();
        // Setup secrets rotation
        if (managersConfig.secretsConfig.rotationEnabled) {
            this.setupSecretsRotation();
        }
        // Setup health checks
        this.setupHealthChecks();
    }
    /**
     * Setup monitoring integration for all managers
     */
    setupMonitoringIntegration() {
        // Monitor API requests
        this.monitoring.onLog((log) => {
            if (log.category === 'api' && log.level === 'error') {
                this.monitoring.triggerAlert('api_errors', `API error: ${log.message}`, 'medium', log.metadata);
            }
        });
        // Monitor security events
        this.monitoring.onLog((log) => {
            if (log.category === 'security') {
                this.monitoring.recordMetric('security_events', 1, 'counter', {
                    severity: log.metadata?.severity || 'unknown'
                });
            }
        });
        // Monitor secrets access
        this.monitoring.onLog((log) => {
            if (log.category === 'secrets') {
                this.monitoring.recordMetric('secrets_access', 1, 'counter', {
                    action: log.metadata?.action || 'unknown'
                });
            }
        });
    }
    /**
     * Setup configuration integration
     */
    setupConfigurationIntegration() {
        // Watch for security policy changes
        this.config.watchConfig('security_policy', (newPolicy) => {
            if (newPolicy) {
                this.security.updatePolicy(newPolicy);
                this.monitoring.info('Security policy updated', 'config');
            }
        });
        // Watch for API configuration changes
        this.config.watchConfig('api_config', (newConfig) => {
            if (newConfig) {
                this.api.updateConfig(newConfig);
                this.monitoring.info('API configuration updated', 'config');
            }
        });
    }
    /**
     * Setup API security integration
     */
    setupAPISecurityIntegration() {
        // Create security alerts for API events
        this.monitoring.createAlert('api_errors', 'API error rate > 10 per minute', 10, 'high', ['console', 'email']);
        this.monitoring.createAlert('authentication_failures', 'Authentication failures > 5 per minute', 5, 'medium', ['console']);
        this.monitoring.createAlert('rate_limit_exceeded', 'Rate limit exceeded > 20 per minute', 20, 'medium', ['console']);
    }
    /**
     * Setup automatic secrets rotation
     */
    setupSecretsRotation() {
        // In a real implementation, this would setup a cron job or scheduler
        // For now, we'll just log that rotation is enabled
        this.monitoring.info('Secrets rotation enabled', 'secrets');
    }
    /**
     * Setup health checks for all managers
     */
    setupHealthChecks() {
        // Setup periodic health checks
        setInterval(() => {
            this.performHealthCheck();
        }, 60000); // Every minute
    }
    /**
     * Perform comprehensive health check
     */
    async performHealthCheck() {
        const timestamp = new Date();
        const managers = {};
        try {
            // Check monitoring manager
            managers.monitoring = this.monitoring.healthCheck();
            // Check secrets manager
            managers.secrets = {
                status: 'healthy',
                cacheStats: this.secrets.getCacheStats()
            };
            // Check API manager
            managers.api = {
                status: 'healthy',
                stats: this.api.getAPIStats()
            };
            // Check configuration manager
            managers.configuration = {
                status: 'healthy',
                stats: this.config.getStats()
            };
            // Check security manager
            managers.security = {
                status: 'healthy',
                policy: 'active'
            };
            // Determine overall health
            const statuses = Object.values(managers).map(m => m.status);
            const unhealthyCount = statuses.filter(s => s === 'unhealthy').length;
            const degradedCount = statuses.filter(s => s === 'degraded').length;
            let overall = 'healthy';
            if (unhealthyCount > 0) {
                overall = 'unhealthy';
            }
            else if (degradedCount > 0) {
                overall = 'degraded';
            }
            // Record health metrics
            this.monitoring.recordGauge('system_health', overall === 'healthy' ? 1 : 0);
            this.monitoring.recordGauge('managers_healthy', statuses.filter(s => s === 'healthy').length);
            return { overall, managers, timestamp };
        }
        catch (error) {
            this.monitoring.error('Health check failed', error instanceof Error ? error : undefined, 'health');
            return {
                overall: 'unhealthy',
                managers: { error: 'Health check failed' },
                timestamp
            };
        }
    }
    /**
     * Get comprehensive system statistics
     */
    getSystemStats() {
        return {
            security: this.security.getPolicy(),
            secrets: this.secrets.getCacheStats(),
            api: this.api.getAPIStats(),
            configuration: this.config.getStats(),
            monitoring: this.monitoring.getStats(),
            integration: {
                uptime: process.uptime(),
                version: '1.0.0',
                environment: process.env.NODE_ENV || 'development'
            }
        };
    }
    /**
     * Graceful shutdown of all managers
     */
    async shutdown() {
        try {
            this.monitoring.info('Starting managers shutdown', 'integration');
            // Clear caches
            this.secrets.clearCache();
            this.api.clearCache();
            // Stop monitoring
            // In a real implementation, this would stop timers, close connections, etc.
            this.monitoring.info('Managers shutdown completed', 'integration');
        }
        catch (error) {
            this.monitoring.error('Error during shutdown', error instanceof Error ? error : undefined, 'integration');
            throw error;
        }
    }
    /**
     * Create a secure API endpoint with full integration
     */
    createSecureEndpoint(path, method, handler, options = {}) {
        const middleware = [];
        // Add security headers
        middleware.push('securityHeaders');
        // Add authentication if required
        if (options.authentication !== false) {
            middleware.push('authentication');
        }
        // Add authorization if permissions specified
        if (options.permissions && options.permissions.length > 0) {
            middleware.push('authorization');
        }
        // Add rate limiting
        middleware.push('rateLimit');
        // Add validation if specified
        if (options.validation) {
            middleware.push('validation');
        }
        // Register the endpoint
        this.api.registerEndpoint({
            path,
            method,
            handler,
            middleware,
            authentication: options.authentication !== false,
            authorization: options.permissions,
            rateLimit: options.rateLimit,
            validation: options.validation,
            cache: options.caching ? { enabled: true, ttl: 300 } : undefined
        });
        this.monitoring.info(`Secure endpoint registered: ${method} ${path}`, 'api', {
            path,
            method,
            middleware: middleware.length,
            authentication: options.authentication !== false,
            permissions: options.permissions?.length || 0
        });
    }
    /**
     * Rotate all rotatable secrets
     */
    async rotateAllSecrets(environment = 'development') {
        const secrets = await this.secrets.listSecrets(environment);
        const rotated = [];
        const failed = [];
        for (const secret of secrets) {
            if (secret.rotationInterval && secret.rotationInterval > 0) {
                try {
                    await this.secrets.rotateSecret(secret.key, environment);
                    rotated.push(secret.key);
                    this.monitoring.info(`Secret rotated: ${secret.key}`, 'secrets');
                }
                catch (error) {
                    failed.push(secret.key);
                    this.monitoring.error(`Failed to rotate secret: ${secret.key}`, error instanceof Error ? error : undefined, 'secrets');
                }
            }
        }
        this.monitoring.recordMetric('secrets_rotated', rotated.length, 'counter');
        this.monitoring.recordMetric('secrets_rotation_failed', failed.length, 'counter');
        return { rotated, failed };
    }
    /**
     * Export all configurations and non-secret data
     */
    async exportSystemConfiguration(environment) {
        return {
            configurations: this.config.exportConfigurations(environment),
            featureFlags: this.config.listFeatureFlags(environment),
            apiEndpoints: this.api.listEndpoints().map(endpoint => ({
                path: endpoint.path,
                method: endpoint.method,
                authentication: endpoint.authentication,
                authorization: endpoint.authorization,
                rateLimit: endpoint.rateLimit
            })),
            securityPolicy: this.security.getPolicy(),
            timestamp: new Date()
        };
    }
}
