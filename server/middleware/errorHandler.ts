import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Custom Application Error Class
 * Extends native Error with status code and operational flag
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);

    // Set error name to the class name
    this.name = this.constructor.name;
  }
}

/**
 * Common Error Types
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, 500);
  }
}

/**
 * Async Error Wrapper
 * Wraps async route handlers to catch errors automatically
 * 
 * Usage:
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await getUsers();
 *   res.json(users);
 * }));
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found Handler
 * Catches all unmatched routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new NotFoundError(`Route ${req.originalUrl}`);
  next(error);
};

/**
 * Development Error Response
 * Includes full stack trace for debugging
 */
const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    status: 'error',
    error: err.name,
    message: err.message,
    stack: err.stack,
    timestamp: err.timestamp,
  });
};

/**
 * Production Error Response
 * User-friendly messages only (no stack traces)
 */
const sendErrorProd = (err: AppError, res: Response) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      timestamp: err.timestamp,
    });
  } else {
    // Programming or unknown error: don't leak error details
    logger.error('NON-OPERATIONAL ERROR:', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong. Please try again later.',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Global Error Handler Middleware
 * Catches all errors passed via next(error)
 * 
 * IMPORTANT: Must be registered LAST in Express app (after all routes)
 */
export const globalErrorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default values
  let error = err as AppError;
  if (!error.statusCode) {
    error.statusCode = 500;
  }
  if (!error.timestamp) {
    error.timestamp = new Date().toISOString();
  }
  if (error.isOperational === undefined) {
    error.isOperational = false;
  }

  // Log error details
  logger.error({
    name: error.name,
    message: error.message,
    statusCode: error.statusCode,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: (req as any).user?.id || 'anonymous',
  });

  // Send appropriate response based on environment
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

/**
 * Uncaught Exception Handler
 * Handles synchronous errors not caught by try-catch
 */
export const handleUncaughtException = () => {
  process.on('uncaughtException', (err: Error) => {
    logger.error('UNCAUGHT EXCEPTION! Shutting down gracefully...', err);
    console.error('UNCAUGHT EXCEPTION:', err.name, err.message);
    console.error(err.stack);
    
    // Give server time to finish existing requests
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });
};

/**
 * Unhandled Rejection Handler
 * Handles rejected promises not caught by .catch()
 */
export const handleUnhandledRejection = () => {
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('UNHANDLED REJECTION! Shutting down gracefully...', reason);
    console.error('UNHANDLED REJECTION at:', promise);
    console.error('Reason:', reason);
    
    // Give server time to finish existing requests
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });
};

/**
 * Graceful Shutdown Handler
 * Ensures proper cleanup on SIGTERM/SIGINT
 */
export const handleShutdown = (server: any) => {
  const shutdown = (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    
    server.close(() => {
      console.log('✅ HTTP server closed');
      logger.info('Server shutdown complete');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('⚠️ Forcing shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

/**
 * Usage Examples:
 * 
 * 1. Throwing errors in routes:
 *    if (!user) throw new NotFoundError('User');
 *    if (!authorized) throw new AuthorizationError();
 * 
 * 2. Wrapping async handlers:
 *    router.get('/users', asyncHandler(async (req, res) => {
 *      const users = await getUsers(); // Errors automatically caught
 *      res.json(users);
 *    }));
 * 
 * 3. Manual error passing:
 *    try {
 *      const result = await riskyOperation();
 *    } catch (err) {
 *      return next(new DatabaseError('Operation failed'));
 *    }
 */
