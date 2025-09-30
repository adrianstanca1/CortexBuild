import { 
  SecurityPolicy, 
  SecretsManagerConfig, 
  APIManagerConfig, 
  Environment 
} from '../types/managers.js';

// Default Security Policy
export const defaultSecurityPolicy: SecurityPolicy = {
  passwordMinLength: 12,
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumbers: true,
  passwordRequireSymbols: true,
  sessionTimeout: 3600000, // 1 hour in milliseconds
  maxLoginAttempts: 5,
  lockoutDuration: 900000, // 15 minutes in milliseconds
  jwtExpiresIn: '1h',
  refreshTokenExpiresIn: '7d',
  allowedOrigins: [
    'https://access-5018479851.webspace-host.com',
    'http://localhost:3000',
    'http://localhost:4000'
  ],
  trustedProxies: ['127.0.0.1', '::1'],
  securityHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  }
};

// Development Secrets Manager Configuration
export const developmentSecretsConfig: SecretsManagerConfig = {
  encryptionAlgorithm: 'aes-256-gcm',
  keyDerivationIterations: 100000,
  storageBackend: 'file',
  storagePath: './secrets',
  auditLogging: true,
  cacheEnabled: true,
  cacheTTL: 300, // 5 minutes
  rotationEnabled: true,
  defaultRotationInterval: 90 // 90 days
};

// Production Secrets Manager Configuration
export const productionSecretsConfig: SecretsManagerConfig = {
  encryptionAlgorithm: 'aes-256-gcm',
  keyDerivationIterations: 200000,
  storageBackend: 'file', // In production, use 'database' or 'cloud'
  storagePath: './secrets',
  auditLogging: true,
  cacheEnabled: true,
  cacheTTL: 600, // 10 minutes
  rotationEnabled: true,
  defaultRotationInterval: 30 // 30 days
};

// Development API Manager Configuration
export const developmentAPIConfig: APIManagerConfig = {
  baseUrl: 'http://localhost:4000',
  version: 'v1',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  defaultRateLimit: {
    requests: 100,
    windowMs: 60000 // 1 minute
  },
  authentication: {
    enabled: true,
    methods: ['jwt', 'api_key'],
    jwtExpiresIn: '1h'
  },
  validation: {
    enabled: true,
    strictMode: false,
    sanitizeInput: true
  },
  caching: {
    enabled: true,
    defaultTTL: 300,
    maxSize: 1000
  },
  compression: {
    enabled: true,
    threshold: 1024
  },
  cors: {
    enabled: true,
    origins: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization', 'X-API-Key'],
    credentials: true
  },
  security: {
    helmet: true,
    rateLimiting: true,
    requestSizeLimit: '10mb',
    parameterPollution: true
  }
};

// Production API Manager Configuration
export const productionAPIConfig: APIManagerConfig = {
  baseUrl: 'https://access-5018479851.webspace-host.com',
  version: 'v1',
  timeout: 30000,
  retries: 3,
  retryDelay: 2000,
  defaultRateLimit: {
    requests: 1000,
    windowMs: 60000 // 1 minute
  },
  authentication: {
    enabled: true,
    methods: ['jwt', 'api_key'],
    jwtExpiresIn: '1h'
  },
  validation: {
    enabled: true,
    strictMode: true,
    sanitizeInput: true
  },
  caching: {
    enabled: true,
    defaultTTL: 600,
    maxSize: 10000
  },
  compression: {
    enabled: true,
    threshold: 1024
  },
  cors: {
    enabled: true,
    origins: ['https://access-5018479851.webspace-host.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization', 'X-API-Key'],
    credentials: true
  },
  security: {
    helmet: true,
    rateLimiting: true,
    requestSizeLimit: '10mb',
    parameterPollution: true
  }
};

// Environment-specific configurations
export const getManagersConfig = (environment: Environment) => {
  const baseConfig = {
    environment,
    masterKey: process.env.MASTER_ENCRYPTION_KEY || 'dev-master-key-change-in-production',
    securityPolicy: defaultSecurityPolicy,
    enableMonitoring: true
  };

  switch (environment) {
    case 'development':
      return {
        ...baseConfig,
        secretsConfig: developmentSecretsConfig,
        apiConfig: developmentAPIConfig
      };
    
    case 'production':
      return {
        ...baseConfig,
        masterKey: process.env.MASTER_ENCRYPTION_KEY || (() => {
          throw new Error('MASTER_ENCRYPTION_KEY environment variable is required in production');
        })(),
        secretsConfig: productionSecretsConfig,
        apiConfig: productionAPIConfig
      };
    
    case 'staging':
      return {
        ...baseConfig,
        secretsConfig: {
          ...developmentSecretsConfig,
          rotationEnabled: true,
          defaultRotationInterval: 60 // 60 days
        },
        apiConfig: {
          ...developmentAPIConfig,
          baseUrl: 'https://staging.access-5018479851.webspace-host.com',
          defaultRateLimit: {
            requests: 500,
            windowMs: 60000
          }
        }
      };
    
    case 'test':
      return {
        ...baseConfig,
        secretsConfig: {
          ...developmentSecretsConfig,
          storageBackend: 'memory' as const,
          auditLogging: false,
          cacheEnabled: false,
          rotationEnabled: false
        },
        apiConfig: {
          ...developmentAPIConfig,
          baseUrl: 'http://localhost:4001',
          authentication: {
            enabled: false,
            methods: []
          },
          validation: {
            enabled: false,
            strictMode: false,
            sanitizeInput: false
          }
        }
      };
    
    default:
      throw new Error(`Unknown environment: ${environment}`);
  }
};

// Rate limiting configurations for different endpoint types
export const rateLimitConfigs = {
  // Authentication endpoints - stricter limits
  auth: {
    requests: 10,
    windowMs: 60000, // 1 minute
    burst: 5
  },
  
  // API endpoints - standard limits
  api: {
    requests: 100,
    windowMs: 60000, // 1 minute
    burst: 20
  },
  
  // File upload endpoints - lower limits
  upload: {
    requests: 10,
    windowMs: 60000, // 1 minute
    burst: 2
  },
  
  // Public endpoints - higher limits
  public: {
    requests: 1000,
    windowMs: 60000, // 1 minute
    burst: 100
  },
  
  // Admin endpoints - very strict limits
  admin: {
    requests: 50,
    windowMs: 60000, // 1 minute
    burst: 10
  }
};

// Validation schemas for common API endpoints
export const validationSchemas = {
  // User registration
  userRegistration: {
    body: {
      required: ['email', 'password', 'firstName', 'lastName'],
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 12 },
        firstName: { type: 'string', minLength: 1 },
        lastName: { type: 'string', minLength: 1 },
        role: { type: 'string', enum: ['owner', 'admin', 'manager', 'foreman', 'worker'] }
      }
    }
  },
  
  // User login
  userLogin: {
    body: {
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 1 },
        rememberMe: { type: 'boolean' }
      }
    }
  },
  
  // Project creation
  projectCreation: {
    body: {
      required: ['name', 'description'],
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 255 },
        description: { type: 'string', maxLength: 1000 },
        budget: { type: 'number', minimum: 0 },
        startDate: { type: 'string', format: 'date' },
        endDate: { type: 'string', format: 'date' }
      }
    }
  },
  
  // API key generation
  apiKeyGeneration: {
    body: {
      required: ['name'],
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 255 },
        scopes: { type: 'array', items: { type: 'string' } },
        permissions: { type: 'array', items: { type: 'string' } },
        expiresAt: { type: 'string', format: 'date-time' }
      }
    }
  }
};

// Feature flags configuration
export const defaultFeatureFlags = {
  development: {
    'multimodal-processing': true,
    'ai-features': true,
    'advanced-analytics': true,
    'real-time-collaboration': true,
    'debug-mode': true,
    'mock-data': true
  },
  
  staging: {
    'multimodal-processing': true,
    'ai-features': true,
    'advanced-analytics': true,
    'real-time-collaboration': false,
    'debug-mode': false,
    'mock-data': false
  },
  
  production: {
    'multimodal-processing': true,
    'ai-features': true,
    'advanced-analytics': false,
    'real-time-collaboration': false,
    'debug-mode': false,
    'mock-data': false
  },
  
  test: {
    'multimodal-processing': false,
    'ai-features': false,
    'advanced-analytics': false,
    'real-time-collaboration': false,
    'debug-mode': true,
    'mock-data': true
  }
};

// Monitoring alerts configuration
export const monitoringAlerts = {
  // System health alerts
  'system-health': {
    condition: 'system_health < 1',
    threshold: 1,
    severity: 'critical' as const,
    channels: ['console', 'email']
  },
  
  // API error rate alerts
  'api-error-rate': {
    condition: 'api_errors > 10',
    threshold: 10,
    severity: 'high' as const,
    channels: ['console', 'email']
  },
  
  // Authentication failure alerts
  'auth-failures': {
    condition: 'authentication_failures > 5',
    threshold: 5,
    severity: 'medium' as const,
    channels: ['console']
  },
  
  // Secrets access alerts
  'secrets-access': {
    condition: 'secrets_access > 100',
    threshold: 100,
    severity: 'medium' as const,
    channels: ['console']
  },
  
  // Rate limit alerts
  'rate-limit-exceeded': {
    condition: 'rate_limit_exceeded > 20',
    threshold: 20,
    severity: 'medium' as const,
    channels: ['console']
  }
};

// Export utility function to get complete configuration
export const getCompleteManagersConfig = (environment: Environment = 'development') => {
  const config = getManagersConfig(environment);
  
  return {
    ...config,
    rateLimitConfigs,
    validationSchemas,
    featureFlags: defaultFeatureFlags[environment],
    monitoringAlerts
  };
};
