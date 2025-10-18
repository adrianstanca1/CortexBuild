/**
 * Global Error Handler
 * Task 2.1: Error Handling & Resilience
 * Copilot + Augment Collaboration
 * 
 * AUGMENT: Frontend error handling
 * COPILOT: Backend error handling (to be implemented)
 */

/**
 * Custom Application Error Class
 * Extends Error with additional metadata for better error handling
 */
export class AppError extends Error {
    public readonly code: string;
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly timestamp: Date;
    public readonly context?: Record<string, any>;

    constructor(
        message: string,
        code: string = 'UNKNOWN_ERROR',
        statusCode: number = 500,
        isOperational: boolean = true,
        context?: Record<string, any>
    ) {
        super(message);
        
        // Maintains proper stack trace for where error was thrown
        Object.setPrototypeOf(this, AppError.prototype);
        
        this.name = 'AppError';
        this.code = code;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.timestamp = new Date();
        this.context = context;

        // Capture stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Predefined Error Types for Common Scenarios
 */
export class ValidationError extends AppError {
    constructor(message: string, context?: Record<string, any>) {
        super(message, 'VALIDATION_ERROR', 400, true, context);
        this.name = 'ValidationError';
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication required', context?: Record<string, any>) {
        super(message, 'AUTHENTICATION_ERROR', 401, true, context);
        this.name = 'AuthenticationError';
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Insufficient permissions', context?: Record<string, any>) {
        super(message, 'AUTHORIZATION_ERROR', 403, true, context);
        this.name = 'AuthorizationError';
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string = 'Resource', context?: Record<string, any>) {
        super(`${resource} not found`, 'NOT_FOUND', 404, true, context);
        this.name = 'NotFoundError';
    }
}

export class ConflictError extends AppError {
    constructor(message: string, context?: Record<string, any>) {
        super(message, 'CONFLICT_ERROR', 409, true, context);
        this.name = 'ConflictError';
    }
}

export class NetworkError extends AppError {
    constructor(message: string = 'Network request failed', context?: Record<string, any>) {
        super(message, 'NETWORK_ERROR', 0, true, context);
        this.name = 'NetworkError';
    }
}

export class DatabaseError extends AppError {
    constructor(message: string, context?: Record<string, any>) {
        super(message, 'DATABASE_ERROR', 500, true, context);
        this.name = 'DatabaseError';
    }
}

export class APIError extends AppError {
    constructor(message: string, statusCode: number = 500, context?: Record<string, any>) {
        super(message, 'API_ERROR', statusCode, true, context);
        this.name = 'APIError';
    }
}

/**
 * Error Logger
 * Logs errors to console with proper formatting
 * In production, this would send to error tracking service (Sentry, LogRocket, etc.)
 */
export class ErrorLogger {
    private static isDevelopment = import.meta.env.DEV;

    static log(error: Error | AppError, context?: Record<string, any>): void {
        const errorInfo = {
            name: error.name,
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            ...(error instanceof AppError && {
                code: error.code,
                statusCode: error.statusCode,
                isOperational: error.isOperational,
                errorContext: error.context,
            }),
            ...context,
        };

        if (this.isDevelopment) {
            console.group(`🔴 Error: ${error.name}`);
            console.error('Message:', error.message);
            console.error('Details:', errorInfo);
            if (error.stack) {
                console.error('Stack:', error.stack);
            }
            console.groupEnd();
        } else {
            // In production, send to error tracking service
            console.error('Error:', errorInfo);
            // TODO: Send to Sentry/LogRocket/etc.
            // Sentry.captureException(error, { extra: errorInfo });
        }
    }

    static logWarning(message: string, context?: Record<string, any>): void {
        const warningInfo = {
            message,
            timestamp: new Date().toISOString(),
            ...context,
        };

        if (this.isDevelopment) {
            console.warn('⚠️ Warning:', message, warningInfo);
        } else {
            console.warn('Warning:', warningInfo);
        }
    }

    static logInfo(message: string, context?: Record<string, any>): void {
        if (this.isDevelopment) {
            console.info('ℹ️ Info:', message, context);
        }
    }
}

/**
 * Global Error Handler
 * Handles errors consistently across the application
 */
export class GlobalErrorHandler {
    /**
     * Handle error and return user-friendly message
     */
    static handle(error: Error | AppError, showToast: boolean = true): string {
        // Log the error
        ErrorLogger.log(error);

        // Determine user-friendly message
        let userMessage: string;

        if (error instanceof AppError) {
            userMessage = error.message;
        } else if (error instanceof TypeError) {
            userMessage = 'A technical error occurred. Please try again.';
        } else if (error instanceof SyntaxError) {
            userMessage = 'Invalid data format. Please check your input.';
        } else {
            userMessage = 'An unexpected error occurred. Please try again.';
        }

        // Show toast notification if requested
        if (showToast && typeof window !== 'undefined') {
            // Import toast dynamically to avoid circular dependencies
            import('react-hot-toast').then(({ default: toast }) => {
                if (error instanceof AppError && error.statusCode < 500) {
                    toast.error(userMessage);
                } else {
                    toast.error('Something went wrong. Please try again.');
                }
            });
        }

        return userMessage;
    }

    /**
     * Handle API errors from fetch/axios responses
     */
    static handleApiError(error: any): AppError {
        // Network error (no response)
        if (!error.response && error.request) {
            return new NetworkError('Unable to connect to server. Please check your internet connection.');
        }

        // HTTP error response
        if (error.response) {
            const { status, data } = error.response;
            const message = data?.message || data?.error || 'An error occurred';
            const context = { status, data };

            switch (status) {
                case 400:
                    return new ValidationError(message, context);
                case 401:
                    return new AuthenticationError(message, context);
                case 403:
                    return new AuthorizationError(message, context);
                case 404:
                    return new NotFoundError(data?.resource || 'Resource', context);
                case 409:
                    return new ConflictError(message, context);
                case 500:
                case 502:
                case 503:
                case 504:
                    return new AppError('Server error. Please try again later.', 'SERVER_ERROR', status, true, context);
                default:
                    return new AppError(message, 'API_ERROR', status, true, context);
            }
        }

        // Unknown error
        return new AppError(error.message || 'An unexpected error occurred', 'UNKNOWN_ERROR', 500, false);
    }

    /**
     * Async error wrapper for try-catch blocks
     */
    static async wrapAsync<T>(
        fn: () => Promise<T>,
        errorMessage?: string
    ): Promise<T> {
        try {
            return await fn();
        } catch (error) {
            const appError = error instanceof AppError 
                ? error 
                : this.handleApiError(error);
            
            if (errorMessage) {
                appError.message = errorMessage;
            }
            
            throw appError;
        }
    }

    /**
     * Retry logic for failed operations
     */
    static async retry<T>(
        fn: () => Promise<T>,
        maxRetries: number = 3,
        delay: number = 1000
    ): Promise<T> {
        let lastError: Error;

        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error as Error;
                ErrorLogger.logWarning(`Retry attempt ${i + 1}/${maxRetries} failed`, {
                    error: error instanceof Error ? error.message : String(error),
                });

                if (i < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
                }
            }
        }

        throw lastError!;
    }
}

/**
 * Error Handler Hook for React Components
 * Usage: const handleError = useErrorHandler();
 */
export const createErrorHandler = (componentName?: string) => {
    return (error: Error | AppError, context?: Record<string, any>) => {
        const enrichedContext = {
            ...context,
            component: componentName,
        };

        GlobalErrorHandler.handle(error);
        ErrorLogger.log(error, enrichedContext);
    };
};

/**
 * Utility function to check if error is operational
 */
export const isOperationalError = (error: Error): boolean => {
    if (error instanceof AppError) {
        return error.isOperational;
    }
    return false;
};

/**
 * Error handling wrapper for API calls
 */
export const withErrorHandling = async <T>(
    fn: () => Promise<T>,
    errorMessage?: string
): Promise<T> => {
    try {
        return await fn();
    } catch (error) {
        const appError = error instanceof AppError 
            ? error 
            : GlobalErrorHandler.handleApiError(error);
        
        if (errorMessage) {
            appError.message = errorMessage;
        }
        
        throw appError;
    }
};

/**
 * Export all error types for easy import
 */
export {
    AppError as default,
};

