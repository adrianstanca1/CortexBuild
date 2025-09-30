import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export function errorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: string[] = [];

  // Handle custom AppError
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }
  // Handle SQLite errors
  else if (error.message.includes('SQLITE_CONSTRAINT')) {
    statusCode = 400;
    if (error.message.includes('UNIQUE constraint failed')) {
      message = 'Resource already exists';
    } else if (error.message.includes('FOREIGN KEY constraint failed')) {
      message = 'Invalid reference to related resource';
    } else {
      message = 'Database constraint violation';
    }
  }
  // Handle JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  // Handle validation errors (from Joi)
  else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = [(error as any).details?.map((d: any) => d.message) || []].flat();
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: error.message,
      stack: error.stack,
      statusCode,
      url: req.url,
      method: req.method,
      body: req.body,
      query: req.query,
      params: req.params
    });
  }

  // Send error response
  const response: ApiResponse = {
    success: false,
    message,
    errors: errors.length > 0 ? errors : undefined
  };

  res.status(statusCode).json(response);
}

// 404 handler
export function notFoundHandler(req: Request, res: Response) {
  const response: ApiResponse = {
    success: false,
    message: `Route ${req.method} ${req.path} not found`
  };
  
  res.status(404).json(response);
}

// Async error wrapper
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Common error creators
export const errors = {
  notFound: (resource: string = 'Resource') => 
    new AppError(`${resource} not found`, 404),
  
  unauthorized: (message: string = 'Unauthorized') => 
    new AppError(message, 401),
  
  forbidden: (message: string = 'Forbidden') => 
    new AppError(message, 403),
  
  badRequest: (message: string = 'Bad request') => 
    new AppError(message, 400),
  
  conflict: (message: string = 'Resource already exists') => 
    new AppError(message, 409),
  
  unprocessable: (message: string = 'Unprocessable entity') => 
    new AppError(message, 422),
  
  internal: (message: string = 'Internal server error') => 
    new AppError(message, 500)
};
