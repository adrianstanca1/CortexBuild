import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import {
  APIKey,
  APIRequest,
  APIResponse,
  APIEndpoint,
  APIManagerConfig,
  RateLimit,
  APIMethod,
  Environment,
  APIError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  ValidationError
} from '../types/managers.js';
import { SecurityManager } from './SecurityManager.js';
import { SecretsManager } from './SecretsManager.js';

export class APIManager {
  private static instance: APIManager;
  private securityManager!: SecurityManager;
  private secretsManager!: SecretsManager;
  private endpoints: Map<string, APIEndpoint> = new Map();
  private apiKeys: Map<string, APIKey> = new Map();
  private rateLimiters: Map<string, any> = new Map();
  private requestCache: Map<string, { response: any; timestamp: number }> = new Map();

  private constructor(private config: APIManagerConfig) {}

  public static async getInstance(config?: APIManagerConfig): Promise<APIManager> {
    if (!APIManager.instance) {
      if (!config) {
        throw new APIError('APIManager requires config for initialization', 'MISSING_CONFIG');
      }
      APIManager.instance = new APIManager(config);
      await APIManager.instance.initialize();
    }
    return APIManager.instance;
  }

  private async initialize(): Promise<void> {
    try {
      this.securityManager = SecurityManager.getInstance();
      this.secretsManager = await SecretsManager.getInstance();
      
      // Load existing API keys
      await this.loadAPIKeys();
      
      // Setup default rate limiters
      this.setupDefaultRateLimiters();
      
    } catch (error) {
      throw new APIError(
        'Failed to initialize APIManager',
        'INITIALIZATION_ERROR',
        500,
        { originalError: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  // ===== ENDPOINT MANAGEMENT =====

  /**
   * Register an API endpoint
   */
  public registerEndpoint(endpoint: APIEndpoint): void {
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
  public getEndpoint(method: APIMethod, path: string): APIEndpoint | undefined {
    const key = `${method}:${path}`;
    return this.endpoints.get(key);
  }

  /**
   * List all registered endpoints
   */
  public listEndpoints(): APIEndpoint[] {
    return Array.from(this.endpoints.values());
  }

  // ===== API KEY MANAGEMENT =====

  /**
   * Generate a new API key
   */
  public async generateAPIKey(
    name: string,
    userId?: string,
    scopes: string[] = [],
    permissions: string[] = [],
    rateLimit?: RateLimit,
    expiresAt?: Date,
    environment: Environment = 'development'
  ): Promise<APIKey> {
    const apiKey: APIKey = {
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
    await this.secretsManager.setSecret(
      `api_key_${apiKey.id}`,
      JSON.stringify(apiKey),
      {
        type: 'api_key',
        environment,
        description: `API key for ${name}`,
        tags: ['api_key', 'generated']
      },
      userId
    );
    
    this.apiKeys.set(apiKey.key, apiKey);
    return apiKey;
  }

  /**
   * Validate API key
   */
  public async validateAPIKey(key: string): Promise<APIKey | null> {
    try {
      // Check cache first
      if (this.apiKeys.has(key)) {
        const apiKey = this.apiKeys.get(key)!;
        
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
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new APIError(
        'Failed to validate API key',
        'API_KEY_VALIDATION_ERROR',
        500,
        { originalError: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  /**
   * Revoke API key
   */
  public async revokeAPIKey(keyId: string, userId?: string): Promise<void> {
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
      
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        'Failed to revoke API key',
        'API_KEY_REVOCATION_ERROR',
        500,
        { keyId, originalError: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  // ===== MIDDLEWARE FUNCTIONS =====

  /**
   * Authentication middleware
   */
  public authenticationMiddleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!this.config.authentication.enabled) {
          return next();
        }
        
        const authHeader = req.headers.authorization;
        const apiKeyHeader = req.headers['x-api-key'] as string;
        
        let authenticated = false;
        let user: any = null;
        
        // JWT Authentication
        if (authHeader && authHeader.startsWith('Bearer ') && this.config.authentication.methods.includes('jwt')) {
          const token = authHeader.substring(7);
          try {
            const jwtSecret = await this.secretsManager.getSecret('jwt_access_secret');
            user = jwt.verify(token, jwtSecret);
            authenticated = true;
          } catch (jwtError) {
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
        (req as any).user = user;
        (req as any).authenticated = true;
        
        next();
      } catch (error) {
        if (error instanceof AuthenticationError) {
          res.status(401).json({
            error: 'Authentication failed',
            message: error.message,
            code: error.code
          });
        } else {
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
  public authorizationMiddleware(requiredPermissions: string[] = []) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = (req as any).user;
        
        if (!user) {
          throw new AuthorizationError('User not authenticated');
        }
        
        // Check permissions
        if (requiredPermissions.length > 0) {
          const userPermissions = user.permissions || user.apiKey?.permissions || [];
          const hasPermission = requiredPermissions.every(permission => 
            userPermissions.includes(permission) || userPermissions.includes('*')
          );
          
          if (!hasPermission) {
            throw new AuthorizationError('Insufficient permissions');
          }
        }
        
        next();
      } catch (error) {
        if (error instanceof AuthorizationError) {
          res.status(403).json({
            error: 'Authorization failed',
            message: error.message,
            code: error.code
          });
        } else {
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
  public rateLimitMiddleware(endpointKey?: string) {
    return (req: Request, res: Response, next: NextFunction) => {
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
  public validationMiddleware(schema: any) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!this.config.validation.enabled) {
          return next();
        }
        
        // Validate request body, query, and params
        const errors: string[] = [];
        
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
      } catch (error) {
        if (error instanceof ValidationError) {
          res.status(400).json({
            error: 'Validation failed',
            message: error.message,
            code: error.code,
            details: error.metadata
          });
        } else {
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
  public securityHeadersMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
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
  public responseFormattingMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const originalJson = res.json;
      
      res.json = function(data: any) {
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

  private async loadAPIKeys(): Promise<void> {
    try {
      // In a real implementation, this would load API keys from storage
      // For now, we'll keep them in memory
    } catch (error) {
      console.warn('Failed to load API keys:', error);
    }
  }

  private setupDefaultRateLimiters(): void {
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

  private setupRateLimiter(key: string, rateLimitConfig: RateLimit): void {
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

  private validateData(data: any, schema: any): string[] {
    // Simple validation - in a real implementation, use a library like Joi or Yup
    const errors: string[] = [];
    
    if (schema.required) {
      schema.required.forEach((field: string) => {
        if (!(field in data) || data[field] === undefined || data[field] === null) {
          errors.push(`Field '${field}' is required`);
        }
      });
    }
    
    return errors;
  }

  private sanitizeRequestData(req: Request): void {
    if (req.body && typeof req.body === 'object') {
      this.sanitizeObject(req.body);
    }
    
    if (req.query && typeof req.query === 'object') {
      this.sanitizeObject(req.query);
    }
  }

  private sanitizeObject(obj: any): void {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string') {
        obj[key] = this.securityManager.sanitizeInput(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.sanitizeObject(obj[key]);
      }
    });
  }

  // ===== PUBLIC UTILITY METHODS =====

  /**
   * Get API statistics
   */
  public getAPIStats(): {
    totalEndpoints: number;
    totalAPIKeys: number;
    activeAPIKeys: number;
    cacheSize: number;
  } {
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
  public clearCache(): void {
    this.requestCache.clear();
  }

  /**
   * Get configuration
   */
  public getConfig(): APIManagerConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<APIManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
