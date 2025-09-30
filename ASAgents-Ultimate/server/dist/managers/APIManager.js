import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { APIError, AuthenticationError, AuthorizationError, ValidationError } from '../types/managers.js';
import { SecurityManager } from './SecurityManager.js';
import { SecretsManager } from './SecretsManager.js';
export class APIManager {
    config;
    static instance;
    securityManager;
    secretsManager;
    endpoints = new Map();
    apiKeys = new Map();
    rateLimiters = new Map();
    requestCache = new Map();
    constructor(config) {
        this.config = config;
    }
    static async getInstance(config) {
        if (!APIManager.instance) {
            if (!config) {
                throw new APIError('APIManager requires config for initialization', 'MISSING_CONFIG');
            }
            APIManager.instance = new APIManager(config);
            await APIManager.instance.initialize();
        }
        return APIManager.instance;
    }
    async initialize() {
        try {
            this.securityManager = SecurityManager.getInstance();
            this.secretsManager = await SecretsManager.getInstance();
            // Load existing API keys
            await this.loadAPIKeys();
            // Setup default rate limiters
            this.setupDefaultRateLimiters();
        }
        catch (error) {
            throw new APIError('Failed to initialize APIManager', 'INITIALIZATION_ERROR', 500, { originalError: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    // ===== ENDPOINT MANAGEMENT =====
    /**
     * Register an API endpoint
     */
    registerEndpoint(endpoint) {
        const key = `${endpoint.method}:${endpoint.path}`;
        this.endpoints.set(key, endpoint);
        // Setup endpoint-specific rate limiter if configured
        if (endpoint.rateLimit) {
            this.setupRateLimiter(key, endpoint.rateLimit);
        }
    }
    /**
     * Get registered endpoint
     */
    getEndpoint(method, path) {
        const key = `${method}:${path}`;
        return this.endpoints.get(key);
    }
    /**
     * List all registered endpoints
     */
    listEndpoints() {
        return Array.from(this.endpoints.values());
    }
    // ===== API KEY MANAGEMENT =====
    /**
     * Generate a new API key
     */
    async generateAPIKey(name, userId, scopes = [], permissions = [], rateLimit, expiresAt, environment = 'development') {
        const apiKey = {
            id: this.securityManager.generateUUID(),
            key: this.securityManager.generateAPIKey('ak'),
            name,
            userId,
            scopes,
            permissions,
            rateLimit: rateLimit || this.config.defaultRateLimit,
            isActive: true,
            createdAt: new Date(),
            expiresAt,
            usageCount: 0,
            environment
        };
        // Store API key securely
        await this.secretsManager.setSecret(`api_key_${apiKey.id}`, JSON.stringify(apiKey), {
            type: 'api_key',
            environment,
            description: `API key for ${name}`,
            tags: ['api_key', 'generated']
        }, userId);
        this.apiKeys.set(apiKey.key, apiKey);
        return apiKey;
    }
    /**
     * Validate API key
     */
    async validateAPIKey(key) {
        try {
            // Check cache first
            if (this.apiKeys.has(key)) {
                const apiKey = this.apiKeys.get(key);
                // Check if key is active and not expired
                if (!apiKey.isActive) {
                    throw new AuthenticationError('API key is inactive');
                }
                if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
                    throw new AuthenticationError('API key has expired');
                }
                // Update usage
                apiKey.usageCount++;
                apiKey.lastUsed = new Date();
                return apiKey;
            }
            return null;
        }
        catch (error) {
            if (error instanceof AuthenticationError) {
                throw error;
            }
            throw new APIError('Failed to validate API key', 'API_KEY_VALIDATION_ERROR', 500, { originalError: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    /**
     * Revoke API key
     */
    async revokeAPIKey(keyId, userId) {
        try {
            // Find the API key
            const apiKey = Array.from(this.apiKeys.values()).find(k => k.id === keyId);
            if (!apiKey) {
                throw new APIError('API key not found', 'API_KEY_NOT_FOUND', 404);
            }
            // Mark as inactive
            apiKey.isActive = false;
            // Remove from cache
            this.apiKeys.delete(apiKey.key);
            // Delete from secrets storage
            await this.secretsManager.deleteSecret(`api_key_${keyId}`, apiKey.environment, userId);
        }
        catch (error) {
            if (error instanceof APIError) {
                throw error;
            }
            throw new APIError('Failed to revoke API key', 'API_KEY_REVOCATION_ERROR', 500, { keyId, originalError: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    // ===== MIDDLEWARE FUNCTIONS =====
    /**
     * Authentication middleware
     */
    authenticationMiddleware() {
        return async (req, res, next) => {
            try {
                if (!this.config.authentication.enabled) {
                    return next();
                }
                const authHeader = req.headers.authorization;
                const apiKeyHeader = req.headers['x-api-key'];
                let authenticated = false;
                let user = null;
                // JWT Authentication
                if (authHeader && authHeader.startsWith('Bearer ') && this.config.authentication.methods.includes('jwt')) {
                    const token = authHeader.substring(7);
                    try {
                        const jwtSecret = await this.secretsManager.getSecret('jwt_access_secret');
                        user = jwt.verify(token, jwtSecret);
                        authenticated = true;
                    }
                    catch (jwtError) {
                        throw new AuthenticationError('Invalid JWT token');
                    }
                }
                // API Key Authentication
                if (apiKeyHeader && this.config.authentication.methods.includes('api_key')) {
                    const apiKey = await this.validateAPIKey(apiKeyHeader);
                    if (apiKey) {
                        user = { apiKey };
                        authenticated = true;
                    }
                }
                if (!authenticated) {
                    throw new AuthenticationError('Authentication required');
                }
                // Attach user to request
                req.user = user;
                req.authenticated = true;
                next();
            }
            catch (error) {
                if (error instanceof AuthenticationError) {
                    res.status(401).json({
                        error: 'Authentication failed',
                        message: error.message,
                        code: error.code
                    });
                }
                else {
                    res.status(500).json({
                        error: 'Internal server error',
                        message: 'Authentication middleware error'
                    });
                }
            }
        };
    }
    /**
     * Authorization middleware
     */
    authorizationMiddleware(requiredPermissions = []) {
        return (req, res, next) => {
            try {
                const user = req.user;
                if (!user) {
                    throw new AuthorizationError('User not authenticated');
                }
                // Check permissions
                if (requiredPermissions.length > 0) {
                    const userPermissions = user.permissions || user.apiKey?.permissions || [];
                    const hasPermission = requiredPermissions.every(permission => userPermissions.includes(permission) || userPermissions.includes('*'));
                    if (!hasPermission) {
                        throw new AuthorizationError('Insufficient permissions');
                    }
                }
                next();
            }
            catch (error) {
                if (error instanceof AuthorizationError) {
                    res.status(403).json({
                        error: 'Authorization failed',
                        message: error.message,
                        code: error.code
                    });
                }
                else {
                    res.status(500).json({
                        error: 'Internal server error',
                        message: 'Authorization middleware error'
                    });
                }
            }
        };
    }
    /**
     * Rate limiting middleware
     */
    rateLimitMiddleware(endpointKey) {
        return (req, res, next) => {
            const limiterKey = endpointKey || 'default';
            const limiter = this.rateLimiters.get(limiterKey);
            if (limiter) {
                return limiter(req, res, next);
            }
            next();
        };
    }
    /**
     * Validation middleware
     */
    validationMiddleware(schema) {
        return (req, res, next) => {
            try {
                if (!this.config.validation.enabled) {
                    return next();
                }
                // Validate request body, query, and params
                const errors = [];
                if (schema.body && req.body) {
                    const bodyErrors = this.validateData(req.body, schema.body);
                    errors.push(...bodyErrors);
                }
                if (schema.query && req.query) {
                    const queryErrors = this.validateData(req.query, schema.query);
                    errors.push(...queryErrors);
                }
                if (schema.params && req.params) {
                    const paramErrors = this.validateData(req.params, schema.params);
                    errors.push(...paramErrors);
                }
                if (errors.length > 0) {
                    throw new ValidationError(`Validation failed: ${errors.join(', ')}`);
                }
                // Sanitize input if enabled
                if (this.config.validation.sanitizeInput) {
                    this.sanitizeRequestData(req);
                }
                next();
            }
            catch (error) {
                if (error instanceof ValidationError) {
                    res.status(400).json({
                        error: 'Validation failed',
                        message: error.message,
                        code: error.code,
                        details: error.metadata
                    });
                }
                else {
                    res.status(500).json({
                        error: 'Internal server error',
                        message: 'Validation middleware error'
                    });
                }
            }
        };
    }
    /**
     * Security headers middleware
     */
    securityHeadersMiddleware() {
        return (req, res, next) => {
            const headers = this.securityManager.getSecurityHeaders();
            Object.entries(headers).forEach(([key, value]) => {
                res.setHeader(key, value);
            });
            next();
        };
    }
    /**
     * Response formatting middleware
     */
    responseFormattingMiddleware() {
        return (req, res, next) => {
            const originalJson = res.json;
            res.json = function (data) {
                const formattedResponse = {
                    success: res.statusCode < 400,
                    statusCode: res.statusCode,
                    timestamp: new Date().toISOString(),
                    data: res.statusCode < 400 ? data : undefined,
                    error: res.statusCode >= 400 ? data : undefined,
                    requestId: req.headers['x-request-id'] || 'unknown'
                };
                return originalJson.call(this, formattedResponse);
            };
            next();
        };
    }
    // ===== PRIVATE HELPER METHODS =====
    async loadAPIKeys() {
        try {
            // In a real implementation, this would load API keys from storage
            // For now, we'll keep them in memory
        }
        catch (error) {
            console.warn('Failed to load API keys:', error);
        }
    }
    setupDefaultRateLimiters() {
        const defaultLimiter = rateLimit({
            windowMs: this.config.defaultRateLimit.windowMs,
            max: this.config.defaultRateLimit.requests,
            message: {
                error: 'Rate limit exceeded',
                message: 'Too many requests, please try again later',
                code: 'RATE_LIMIT_ERROR'
            },
            standardHeaders: true,
            legacyHeaders: false
        });
        this.rateLimiters.set('default', defaultLimiter);
    }
    setupRateLimiter(key, rateLimitConfig) {
        const limiter = rateLimit({
            windowMs: rateLimitConfig.windowMs,
            max: rateLimitConfig.requests,
            message: {
                error: 'Rate limit exceeded',
                message: 'Too many requests for this endpoint',
                code: 'RATE_LIMIT_ERROR'
            },
            standardHeaders: true,
            legacyHeaders: false
        });
        this.rateLimiters.set(key, limiter);
    }
    validateData(data, schema) {
        // Simple validation - in a real implementation, use a library like Joi or Yup
        const errors = [];
        if (schema.required) {
            schema.required.forEach((field) => {
                if (!(field in data) || data[field] === undefined || data[field] === null) {
                    errors.push(`Field '${field}' is required`);
                }
            });
        }
        return errors;
    }
    sanitizeRequestData(req) {
        if (req.body && typeof req.body === 'object') {
            this.sanitizeObject(req.body);
        }
        if (req.query && typeof req.query === 'object') {
            this.sanitizeObject(req.query);
        }
    }
    sanitizeObject(obj) {
        Object.keys(obj).forEach(key => {
            if (typeof obj[key] === 'string') {
                obj[key] = this.securityManager.sanitizeInput(obj[key]);
            }
            else if (typeof obj[key] === 'object' && obj[key] !== null) {
                this.sanitizeObject(obj[key]);
            }
        });
    }
    // ===== PUBLIC UTILITY METHODS =====
    /**
     * Get API statistics
     */
    getAPIStats() {
        const activeAPIKeys = Array.from(this.apiKeys.values()).filter(key => key.isActive).length;
        return {
            totalEndpoints: this.endpoints.size,
            totalAPIKeys: this.apiKeys.size,
            activeAPIKeys,
            cacheSize: this.requestCache.size
        };
    }
    /**
     * Clear request cache
     */
    clearCache() {
        this.requestCache.clear();
    }
    /**
     * Get configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
}
