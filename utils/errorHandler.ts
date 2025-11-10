/**
 * Centralized Error Handling Utility
 * Provides consistent error formatting, logging, and user-friendly messages
 */

export interface APIError {
  success: false;
  error: string;
  code: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface APISuccess<T> {
  success: true;
  data: T;
  timestamp: string;
}

export type APIResponse<T> = APISuccess<T> | APIError;

/**
 * Standard error codes for consistent error handling
 */
export const ErrorCodes = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  MISSING_TOKEN: 'MISSING_TOKEN',

  // Validation errors
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_FIELD: 'MISSING_FIELD',
  VALIDATION_FAILED: 'VALIDATION_FAILED',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_EXISTS: 'RESOURCE_EXISTS',

  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',

  // Method errors
  METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',

  // Rate limiting
  RATE_LIMITED: 'RATE_LIMITED',

  // Generic
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

/**
 * User-friendly error messages mapped to error codes
 */
const errorMessages: Record<string, string> = {
  [ErrorCodes.UNAUTHORIZED]: 'You are not authorized to perform this action. Please log in.',
  [ErrorCodes.INVALID_TOKEN]: 'Your session has expired. Please log in again.',
  [ErrorCodes.TOKEN_EXPIRED]: 'Your session has expired. Please log in again.',
  [ErrorCodes.MISSING_TOKEN]: 'Authentication required. Please log in.',

  [ErrorCodes.INVALID_INPUT]: 'Invalid input provided. Please check your data and try again.',
  [ErrorCodes.MISSING_FIELD]: 'Required field is missing. Please fill in all required fields.',
  [ErrorCodes.VALIDATION_FAILED]: 'Validation failed. Please check your input and try again.',

  [ErrorCodes.NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCodes.RESOURCE_EXISTS]: 'A resource with this name or identifier already exists.',

  [ErrorCodes.INTERNAL_ERROR]: 'An unexpected error occurred. Please try again later.',
  [ErrorCodes.DATABASE_ERROR]: 'A database error occurred. Please try again later.',
  [ErrorCodes.EXTERNAL_SERVICE_ERROR]: 'An external service error occurred. Please try again later.',

  [ErrorCodes.METHOD_NOT_ALLOWED]: 'This HTTP method is not allowed for this endpoint.',
  [ErrorCodes.NOT_IMPLEMENTED]: 'This feature is not yet implemented.',

  [ErrorCodes.RATE_LIMITED]: 'Too many requests. Please wait a moment and try again.',

  [ErrorCodes.UNKNOWN_ERROR]: 'An unknown error occurred. Please try again.'
};

/**
 * HTTP status codes mapped to error codes
 */
const statusCodes: Record<string, number> = {
  [ErrorCodes.UNAUTHORIZED]: 401,
  [ErrorCodes.INVALID_TOKEN]: 401,
  [ErrorCodes.TOKEN_EXPIRED]: 401,
  [ErrorCodes.MISSING_TOKEN]: 401,

  [ErrorCodes.INVALID_INPUT]: 400,
  [ErrorCodes.MISSING_FIELD]: 400,
  [ErrorCodes.VALIDATION_FAILED]: 400,

  [ErrorCodes.NOT_FOUND]: 404,
  [ErrorCodes.RESOURCE_EXISTS]: 409,

  [ErrorCodes.INTERNAL_ERROR]: 500,
  [ErrorCodes.DATABASE_ERROR]: 500,
  [ErrorCodes.EXTERNAL_SERVICE_ERROR]: 503,

  [ErrorCodes.METHOD_NOT_ALLOWED]: 405,
  [ErrorCodes.NOT_IMPLEMENTED]: 501,

  [ErrorCodes.RATE_LIMITED]: 429,

  [ErrorCodes.UNKNOWN_ERROR]: 500
};

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  code: string,
  message?: string,
  details?: Record<string, any>
): APIError {
  return {
    success: false,
    error: message || errorMessages[code] || errorMessages[ErrorCodes.UNKNOWN_ERROR],
    code,
    details,
    timestamp: new Date().toISOString()
  };
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(data: T): APISuccess<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };
}

/**
 * Get HTTP status code for error code
 */
export function getStatusCode(errorCode: string): number {
  return statusCodes[errorCode] || 500;
}

/**
 * Get user-friendly error message
 */
export function getUserMessage(errorCode: string): string {
  return errorMessages[errorCode] || errorMessages[ErrorCodes.UNKNOWN_ERROR];
}

/**
 * Logger utility for consistent logging
 */
export const logger = {
  /**
   * Log info level messages
   */
  info: (message: string, data?: Record<string, any>) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data || '');
  },

  /**
   * Log warning level messages
   */
  warn: (message: string, data?: Record<string, any>) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || '');
  },

  /**
   * Log error level messages with stack trace
   */
  error: (message: string, error?: Error | any, data?: Record<string, any>) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    console.error(
      `[ERROR] ${new Date().toISOString()} - ${message}`,
      { message: errorMessage, stack: errorStack, ...data }
    );
  },

  /**
   * Log API request
   */
  request: (method: string, path: string, data?: Record<string, any>) => {
    logger.info(`API Request: ${method} ${path}`, data);
  },

  /**
   * Log API response
   */
  response: (method: string, path: string, status: number, duration?: number) => {
    logger.info(`API Response: ${method} ${path} - Status: ${status}${duration ? ` - ${duration}ms` : ''}`);
  },

  /**
   * Log database operation
   */
  database: (operation: string, table: string, data?: Record<string, any>) => {
    logger.info(`Database: ${operation} on ${table}`, data);
  }
};

/**
 * Validate required fields
 */
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): { valid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter(
    field => data[field] === undefined || data[field] === null || data[field] === ''
  );

  return {
    valid: missingFields.length === 0,
    missingFields
  };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate JWT token format
 */
export function validateTokenFormat(token: string): boolean {
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
}

/**
 * Safely parse JSON with error handling
 */
export function safeJSONParse<T>(jsonString: string, defaultValue: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    logger.warn('JSON parse error', { jsonString, error: String(error) });
    return defaultValue;
  }
}

/**
 * Handle async errors in Express-like handlers
 */
export function asyncHandler(
  fn: (req: any, res: any) => Promise<any>
) {
  return (req: any, res: any) => {
    Promise.resolve(fn(req, res)).catch((error) => {
      logger.error('Async handler error', error);
      res.status(500).json(createErrorResponse(
        ErrorCodes.INTERNAL_ERROR,
        'An unexpected error occurred'
      ));
    });
  };
}

/**
 * Transform API error to user-friendly format
 */
export function transformError(error: any): APIError {
  // If already an APIError, return it
  if (error && typeof error === 'object' && 'code' in error && 'error' in error) {
    return error as APIError;
  }

  // If it's a standard error
  if (error instanceof Error) {
    return createErrorResponse(
      ErrorCodes.INTERNAL_ERROR,
      error.message
    );
  }

  // If it's a string
  if (typeof error === 'string') {
    return createErrorResponse(
      ErrorCodes.INTERNAL_ERROR,
      error
    );
  }

  // Default
  return createErrorResponse(
    ErrorCodes.UNKNOWN_ERROR,
    'An unknown error occurred'
  );
}
