// Manager type definitions

// Base interfaces
export interface ManagerConfig {
  enabled: boolean;
  options?: Record<string, any>;
}

// API Manager types
export type APIMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface APIKey {
  id: string;
  key: string;
  name: string;
  permissions: string[];
  createdAt: Date;
  expiresAt?: Date;
  userId?: string;
  isActive?: boolean;
  usageCount?: number;
  lastUsed?: Date;
  environment?: Environment;
  rateLimit?: RateLimit;
  scopes?: string[];
}

export interface APIRequest {
  id: string;
  method: APIMethod;
  endpoint: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: Date;
}

export interface APIResponse<T = any> {
  status: number;
  data?: T;
  error?: string;
  headers: Record<string, string>;
  timestamp: Date;
}

export interface APIEndpoint {
  path: string;
  method: APIMethod;
  description?: string;
  requiresAuth: boolean;
  rateLimit?: RateLimit;
}

export interface RateLimit {
  maxRequests: number;
  windowMs: number;
  remaining?: number;
  resetAt?: Date;
}

export class APIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode: number = 500,
    public metadata?: Record<string, any>
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends APIError {
  constructor(message: string = 'Not authorized') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class RateLimitError extends APIError {
  constructor(message: string = 'Rate limit exceeded', public resetAt?: Date) {
    super(message, 429, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

export class ValidationError extends APIError {
  constructor(message: string, public errors?: Record<string, string[]>, public metadata?: Record<string, any>) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export interface APIManagerConfig extends ManagerConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  defaultRateLimit?: RateLimit;
  authentication?: {
    type: 'jwt' | 'api_key' | 'oauth';
    jwtSecret?: string;
    tokenExpiry?: number;
    enabled?: boolean;
    methods?: string[];
  };
  validation?: {
    enabled: boolean;
    schemas?: Record<string, any>;
    sanitizeInput?: boolean;
  };
}

// Configuration Manager types
export interface Configuration {
  id: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  environment?: string;
  updatedAt: Date;
  // Additional properties for ConfigurationManager
  description?: string;
  tags?: string[];
  isSecret?: boolean;
  isRequired?: boolean;
  defaultValue?: any;
  validation?: any;
  createdAt?: Date;
}

export interface FeatureFlag {
  id: string;
  name: string;
  enabled: boolean;
  rolloutPercentage?: number;
  conditions?: Record<string, any>;
}

export interface ConfigurationManagerConfig extends ManagerConfig {
  configPath?: string;
  autoReload?: boolean;
}

// Monitoring Manager types
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  stack?: string;
  // Additional properties
  category?: string;
  userId?: string;
}

export interface Metric {
  name: string;
  value: number;
  unit?: string;
  tags?: Record<string, string>;
  timestamp: Date;
  // Additional properties
  type?: string;
}

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  source: string;
  timestamp: Date;
  resolved: boolean;
  metadata?: Record<string, any>;
  // Additional properties
  name?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  enabled?: boolean;
  lastTriggered?: Date;
  channels?: string[];
}

export interface MonitoringManagerConfig extends ManagerConfig {
  sampleRate?: number;
  environment?: string;
}

// Security Manager types
export interface SecurityPolicy {
  id: string;
  name: string;
  rules: SecurityRule[];
  enabled: boolean;
  createdAt: Date;
}

export interface SecurityRule {
  id: string;
  type: 'ip_whitelist' | 'rate_limit' | 'auth_required' | 'cors' | 'csrf';
  config: Record<string, any>;
  enabled: boolean;
}

export interface SecretsManagerConfig extends ManagerConfig {
  provider?: 'env' | 'vault' | 'aws' | 'file';
  encryption?: boolean;
  storageBackend?: 'file' | 'memory' | 'database';
  storagePath?: string;
  cacheEnabled?: boolean;
  cacheTTL?: number;
  rotationEnabled?: boolean;
  rotationInterval?: number;
  defaultRotationInterval?: number; // Default rotation interval in milliseconds
  encryptionAlgorithm?: string; // Encryption algorithm (e.g., 'aes-256-cbc')
  auditLogging?: boolean; // Enable audit logging
}

export interface SecurityManagerConfig extends ManagerConfig {
  enableCSRF?: boolean;
  enableXSS?: boolean;
}

export interface ManagerMetrics {
  requestCount: number;
  errorCount: number;
  averageLatency: number;
  lastUpdate: Date;
}

// General Manager Error
export class ManagerError extends Error {
  constructor(
    message: string,
    public code: string = 'MANAGER_ERROR',
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'ManagerError';
  }
}

// Secrets Manager types
export type Environment = 'development' | 'staging' | 'production' | 'test';
export type SecretType = 'api_key' | 'password' | 'token' | 'certificate' | 'key_pair' | 'config' | 'jwt_secret' | 'encryption_key';

export interface Secret {
  id: string;
  name: string;
  type: SecretType;
  value: SecretValue;
  metadata: SecretMetadata;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  rotationConfig?: SecretRotationConfig;
  // Additional properties for SecretsManager
  key?: string;
  encryptedValue?: string;
  environment?: Environment;
  isActive?: boolean;
  description?: string;
  salt?: string;
  iv?: string;
}

export interface SecretValue {
  encrypted: string;
  algorithm?: string;
  iv?: string;
}

export interface SecretMetadata {
  environment: Environment;
  description?: string;
  tags?: string[];
  owner?: string;
  version: number;
  previousVersions?: string[];
  type?: SecretType;
  // Additional properties for SecretsManager
  key?: string;
  expiresAt?: Date;
  rotationInterval?: number;
  permissions?: string[];
}

export interface SecretAccess {
  secretId: string;
  accessedBy: string;
  accessedAt: Date;
  action: 'read' | 'write' | 'delete' | 'rotate';
  success: boolean;
  metadata?: Record<string, any>;
  userId?: string;
}

export interface SecretRotationConfig {
  enabled: boolean;
  interval: number; // in days
  lastRotated?: Date;
  nextRotation?: Date;
  notifyBefore?: number; // days before rotation
}

export class SecretsError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'SecretsError';
  }
}
