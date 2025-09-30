// Types and interfaces for API Manager and Secrets Management System

export type Environment = 'development' | 'staging' | 'production' | 'test';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type SecretType = 'api_key' | 'oauth_token' | 'jwt_secret' | 'database_credential' | 'encryption_key' | 'certificate';
export type APIMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

// ===== SECRETS MANAGER TYPES =====

export interface SecretMetadata {
  id: string;
  key: string;
  type: SecretType;
  environment: Environment;
  description?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  rotationInterval?: number; // in days
  lastRotated?: Date;
  accessCount: number;
  lastAccessed?: Date;
  isActive: boolean;
  permissions: string[];
}

export interface SecretValue {
  value: string;
  encrypted: boolean;
  checksum: string;
}

export interface Secret extends SecretMetadata {
  encryptedValue: string;
  salt: string;
  iv: string;
}

export interface SecretAccess {
  secretId: string;
  userId?: string;
  action: 'read' | 'write' | 'rotate' | 'delete';
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

export interface SecretsManagerConfig {
  encryptionAlgorithm: string;
  keyDerivationIterations: number;
  masterKey?: string;
  storageBackend: 'file' | 'memory' | 'database' | 'cloud';
  storagePath?: string;
  auditLogging: boolean;
  cacheEnabled: boolean;
  cacheTTL: number; // in seconds
  rotationEnabled: boolean;
  defaultRotationInterval: number; // in days
}

// ===== API MANAGER TYPES =====

export interface APIKey {
  id: string;
  key: string;
  name: string;
  userId?: string;
  scopes: string[];
  permissions: string[];
  rateLimit: RateLimit;
  isActive: boolean;
  createdAt: Date;
  expiresAt?: Date;
  lastUsed?: Date;
  usageCount: number;
  ipWhitelist?: string[];
  environment: Environment;
}

export interface RateLimit {
  requests: number;
  windowMs: number;
  burst?: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface APIRequest {
  id: string;
  method: APIMethod;
  path: string;
  headers: Record<string, string>;
  query: Record<string, any>;
  body?: any;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  apiKey?: string;
  userId?: string;
  authenticated: boolean;
  authorized: boolean;
}

export interface APIResponse {
  statusCode: number;
  headers: Record<string, string>;
  body?: any;
  timestamp: Date;
  duration: number; // in milliseconds
  cached: boolean;
  compressed: boolean;
}

export interface APIEndpoint {
  path: string;
  method: APIMethod;
  handler: Function;
  middleware: string[];
  authentication: boolean;
  authorization?: string[];
  rateLimit?: RateLimit;
  validation?: {
    query?: any;
    body?: any;
    params?: any;
  };
  cache?: {
    enabled: boolean;
    ttl: number;
    key?: string;
  };
  documentation?: {
    summary: string;
    description?: string;
    tags?: string[];
    parameters?: any[];
    responses?: Record<number, any>;
  };
}

export interface APIManagerConfig {
  baseUrl: string;
  version: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  defaultRateLimit: RateLimit;
  authentication: {
    enabled: boolean;
    methods: ('jwt' | 'api_key' | 'oauth')[];
    jwtSecret?: string;
    jwtExpiresIn?: string;
  };
  validation: {
    enabled: boolean;
    strictMode: boolean;
    sanitizeInput: boolean;
  };
  caching: {
    enabled: boolean;
    defaultTTL: number;
    maxSize: number;
  };
  compression: {
    enabled: boolean;
    threshold: number;
  };
  cors: {
    enabled: boolean;
    origins: string[];
    methods: APIMethod[];
    headers: string[];
    credentials: boolean;
  };
  security: {
    helmet: boolean;
    rateLimiting: boolean;
    requestSizeLimit: string;
    parameterPollution: boolean;
  };
}

// ===== CONFIGURATION MANAGER TYPES =====

export interface Configuration {
  id: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  environment: Environment;
  description?: string;
  tags?: string[];
  isSecret: boolean;
  isRequired: boolean;
  defaultValue?: any;
  validation?: {
    schema?: any;
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureFlag {
  id: string;
  name: string;
  enabled: boolean;
  environment: Environment;
  conditions?: {
    userId?: string[];
    userRole?: string[];
    ipAddress?: string[];
    percentage?: number;
    startDate?: Date;
    endDate?: Date;
  };
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ===== SECURITY MANAGER TYPES =====

export interface EncryptionResult {
  encrypted: string;
  salt: string;
  iv: string;
  algorithm: string;
  keyDerivation: string;
}

export interface SecurityPolicy {
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSymbols: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  jwtExpiresIn: string;
  refreshTokenExpiresIn: string;
  allowedOrigins: string[];
  trustedProxies: string[];
  securityHeaders: Record<string, string>;
}

// ===== MONITORING MANAGER TYPES =====

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  category: string;
  metadata?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  duration?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
}

export interface Metric {
  name: string;
  value: number;
  type: 'counter' | 'gauge' | 'histogram' | 'timer';
  tags?: Record<string, string>;
  timestamp: Date;
}

export interface Alert {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  channels: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  lastTriggered?: Date;
}

// ===== ERROR TYPES =====

export class ManagerError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly metadata?: Record<string, any>;

  constructor(message: string, code: string, statusCode: number = 500, metadata?: Record<string, any>) {
    super(message);
    this.name = 'ManagerError';
    this.code = code;
    this.statusCode = statusCode;
    this.metadata = metadata;
  }
}

export class SecretsError extends ManagerError {
  constructor(message: string, code: string, metadata?: Record<string, any>) {
    super(message, code, 500, metadata);
    this.name = 'SecretsError';
  }
}

export class APIError extends ManagerError {
  constructor(message: string, code: string, statusCode: number = 400, metadata?: Record<string, any>) {
    super(message, code, statusCode, metadata);
    this.name = 'APIError';
  }
}

export class ValidationError extends ManagerError {
  constructor(message: string, field?: string, value?: any) {
    super(message, 'VALIDATION_ERROR', 400, { field, value });
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends ManagerError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ManagerError {
  constructor(message: string = 'Authorization failed') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class RateLimitError extends ManagerError {
  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message, 'RATE_LIMIT_ERROR', 429, { retryAfter });
    this.name = 'RateLimitError';
  }
}
