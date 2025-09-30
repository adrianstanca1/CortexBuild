import { ManagerError } from '../types/managers.js';
import { SecretsManager } from './SecretsManager.js';
export class ConfigurationManager {
    static instance;
    configurations = new Map();
    featureFlags = new Map();
    secretsManager;
    watchers = new Map();
    constructor() { }
    static async getInstance() {
        if (!ConfigurationManager.instance) {
            ConfigurationManager.instance = new ConfigurationManager();
            await ConfigurationManager.instance.initialize();
        }
        return ConfigurationManager.instance;
    }
    async initialize() {
        try {
            this.secretsManager = await SecretsManager.getInstance();
            await this.loadConfigurations();
            await this.loadFeatureFlags();
        }
        catch (error) {
            throw new ManagerError('Failed to initialize ConfigurationManager', 'INITIALIZATION_ERROR', 500, { originalError: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    // ===== CONFIGURATION MANAGEMENT =====
    /**
     * Set a configuration value
     */
    async setConfig(key, value, environment = 'development', options = {}) {
        try {
            const configId = this.generateConfigId(key, environment);
            const now = new Date();
            const config = {
                id: configId,
                key,
                value,
                type: this.inferType(value),
                environment,
                description: options.description,
                tags: options.tags || [],
                isSecret: options.isSecret || false,
                isRequired: options.isRequired || false,
                defaultValue: options.defaultValue,
                validation: options.validation,
                createdAt: options.createdAt || now,
                updatedAt: now
            };
            // Validate the configuration
            this.validateConfiguration(config);
            // Store as secret if marked as secret
            if (config.isSecret) {
                await this.secretsManager.setSecret(`config_${configId}`, JSON.stringify(value), {
                    type: 'api_key',
                    environment,
                    description: `Configuration: ${key}`,
                    tags: ['configuration', 'secret']
                });
            }
            this.configurations.set(configId, config);
            // Notify watchers
            this.notifyWatchers(key, value, environment);
        }
        catch (error) {
            throw new ManagerError(`Failed to set configuration: ${key}`, 'CONFIG_SET_ERROR', 500, { key, environment, originalError: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    /**
     * Get a configuration value
     */
    async getConfig(key, environment = 'development', defaultValue) {
        try {
            const configId = this.generateConfigId(key, environment);
            const config = this.configurations.get(configId);
            if (!config) {
                if (defaultValue !== undefined) {
                    return defaultValue;
                }
                throw new ManagerError(`Configuration not found: ${key}`, 'CONFIG_NOT_FOUND', 404, { key, environment });
            }
            // Get value from secrets if it's a secret
            if (config.isSecret) {
                const secretValue = await this.secretsManager.getSecret(`config_${configId}`, environment);
                return JSON.parse(secretValue);
            }
            return config.value;
        }
        catch (error) {
            if (error instanceof ManagerError) {
                throw error;
            }
            throw new ManagerError(`Failed to get configuration: ${key}`, 'CONFIG_GET_ERROR', 500, { key, environment, originalError: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    /**
     * Delete a configuration
     */
    async deleteConfig(key, environment = 'development') {
        try {
            const configId = this.generateConfigId(key, environment);
            const config = this.configurations.get(configId);
            if (!config) {
                throw new ManagerError(`Configuration not found: ${key}`, 'CONFIG_NOT_FOUND', 404, { key, environment });
            }
            // Delete from secrets if it's a secret
            if (config.isSecret) {
                await this.secretsManager.deleteSecret(`config_${configId}`, environment);
            }
            this.configurations.delete(configId);
            // Notify watchers
            this.notifyWatchers(key, undefined, environment);
        }
        catch (error) {
            if (error instanceof ManagerError) {
                throw error;
            }
            throw new ManagerError(`Failed to delete configuration: ${key}`, 'CONFIG_DELETE_ERROR', 500, { key, environment, originalError: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    /**
     * List all configurations for an environment
     */
    listConfigs(environment) {
        const configs = Array.from(this.configurations.values());
        if (environment) {
            return configs.filter(config => config.environment === environment);
        }
        return configs;
    }
    /**
     * Watch for configuration changes
     */
    watchConfig(key, callback) {
        if (!this.watchers.has(key)) {
            this.watchers.set(key, []);
        }
        this.watchers.get(key).push(callback);
        // Return unwatch function
        return () => {
            const callbacks = this.watchers.get(key);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        };
    }
    // ===== FEATURE FLAGS MANAGEMENT =====
    /**
     * Set a feature flag
     */
    setFeatureFlag(name, enabled, environment = 'development', conditions, metadata) {
        const flagId = this.generateFlagId(name, environment);
        const now = new Date();
        const flag = {
            id: flagId,
            name,
            enabled,
            environment,
            conditions,
            metadata,
            createdAt: this.featureFlags.get(flagId)?.createdAt || now,
            updatedAt: now
        };
        this.featureFlags.set(flagId, flag);
    }
    /**
     * Check if a feature is enabled
     */
    isFeatureEnabled(name, environment = 'development', context) {
        const flagId = this.generateFlagId(name, environment);
        const flag = this.featureFlags.get(flagId);
        if (!flag) {
            return false;
        }
        if (!flag.enabled) {
            return false;
        }
        // Check conditions if they exist
        if (flag.conditions) {
            return this.evaluateConditions(flag.conditions, context);
        }
        return true;
    }
    /**
     * Get feature flag details
     */
    getFeatureFlag(name, environment = 'development') {
        const flagId = this.generateFlagId(name, environment);
        return this.featureFlags.get(flagId) || null;
    }
    /**
     * List all feature flags
     */
    listFeatureFlags(environment) {
        const flags = Array.from(this.featureFlags.values());
        if (environment) {
            return flags.filter(flag => flag.environment === environment);
        }
        return flags;
    }
    /**
     * Delete a feature flag
     */
    deleteFeatureFlag(name, environment = 'development') {
        const flagId = this.generateFlagId(name, environment);
        this.featureFlags.delete(flagId);
    }
    // ===== ENVIRONMENT MANAGEMENT =====
    /**
     * Get all configurations for an environment
     */
    async getEnvironmentConfig(environment) {
        const configs = this.listConfigs(environment);
        const result = {};
        for (const config of configs) {
            try {
                result[config.key] = await this.getConfig(config.key, environment);
            }
            catch (error) {
                // Skip failed configurations
                console.warn(`Failed to load config ${config.key}:`, error);
            }
        }
        return result;
    }
    /**
     * Validate environment configuration
     */
    async validateEnvironment(environment) {
        const configs = this.listConfigs(environment);
        const errors = [];
        for (const config of configs) {
            if (config.isRequired) {
                try {
                    const value = await this.getConfig(config.key, environment);
                    if (value === undefined || value === null) {
                        errors.push(`Required configuration missing: ${config.key}`);
                    }
                }
                catch (error) {
                    errors.push(`Failed to load required configuration: ${config.key}`);
                }
            }
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    // ===== PRIVATE HELPER METHODS =====
    generateConfigId(key, environment) {
        return `${environment}:${key}`;
    }
    generateFlagId(name, environment) {
        return `${environment}:${name}`;
    }
    inferType(value) {
        if (typeof value === 'string')
            return 'string';
        if (typeof value === 'number')
            return 'number';
        if (typeof value === 'boolean')
            return 'boolean';
        if (Array.isArray(value))
            return 'array';
        if (typeof value === 'object')
            return 'object';
        return 'string';
    }
    validateConfiguration(config) {
        if (!config.validation)
            return;
        const { validation, value } = config;
        if (validation.min !== undefined && typeof value === 'number' && value < validation.min) {
            throw new ManagerError(`Value ${value} is below minimum ${validation.min}`, 'VALIDATION_ERROR');
        }
        if (validation.max !== undefined && typeof value === 'number' && value > validation.max) {
            throw new ManagerError(`Value ${value} is above maximum ${validation.max}`, 'VALIDATION_ERROR');
        }
        if (validation.pattern && typeof value === 'string' && !new RegExp(validation.pattern).test(value)) {
            throw new ManagerError(`Value does not match pattern ${validation.pattern}`, 'VALIDATION_ERROR');
        }
        if (validation.enum && !validation.enum.includes(value)) {
            throw new ManagerError(`Value must be one of: ${validation.enum.join(', ')}`, 'VALIDATION_ERROR');
        }
    }
    evaluateConditions(conditions, context) {
        if (!conditions || !context)
            return true;
        // Check user ID
        if (conditions.userId && context.userId) {
            if (!conditions.userId.includes(context.userId)) {
                return false;
            }
        }
        // Check user role
        if (conditions.userRole && context.userRole) {
            if (!conditions.userRole.includes(context.userRole)) {
                return false;
            }
        }
        // Check IP address
        if (conditions.ipAddress && context.ipAddress) {
            if (!conditions.ipAddress.includes(context.ipAddress)) {
                return false;
            }
        }
        // Check percentage rollout
        if (conditions.percentage !== undefined) {
            const hash = this.hashString(context.userId || context.ipAddress || 'anonymous');
            const percentage = (hash % 100) + 1;
            if (percentage > conditions.percentage) {
                return false;
            }
        }
        // Check date range
        const now = new Date();
        if (conditions.startDate && now < conditions.startDate) {
            return false;
        }
        if (conditions.endDate && now > conditions.endDate) {
            return false;
        }
        return true;
    }
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }
    notifyWatchers(key, value, environment) {
        const callbacks = this.watchers.get(key);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(value, environment);
                }
                catch (error) {
                    console.error(`Error in configuration watcher for ${key}:`, error);
                }
            });
        }
    }
    async loadConfigurations() {
        // In a real implementation, this would load configurations from storage
        // For now, we'll initialize with empty configurations
    }
    async loadFeatureFlags() {
        // In a real implementation, this would load feature flags from storage
        // For now, we'll initialize with empty feature flags
    }
    // ===== PUBLIC UTILITY METHODS =====
    /**
     * Export configurations to JSON
     */
    exportConfigurations(environment) {
        const configs = this.listConfigs(environment);
        const result = {};
        configs.forEach(config => {
            if (!config.isSecret) {
                result[config.key] = {
                    value: config.value,
                    type: config.type,
                    environment: config.environment,
                    description: config.description,
                    tags: config.tags
                };
            }
        });
        return result;
    }
    /**
     * Import configurations from JSON
     */
    async importConfigurations(data, environment = 'development') {
        for (const [key, configData] of Object.entries(data)) {
            await this.setConfig(key, configData.value, environment, {
                description: configData.description,
                tags: configData.tags
            });
        }
    }
    /**
     * Get statistics
     */
    getStats() {
        const configs = Array.from(this.configurations.values());
        const flags = Array.from(this.featureFlags.values());
        return {
            totalConfigurations: configs.length,
            secretConfigurations: configs.filter(c => c.isSecret).length,
            totalFeatureFlags: flags.length,
            enabledFeatureFlags: flags.filter(f => f.enabled).length
        };
    }
}
