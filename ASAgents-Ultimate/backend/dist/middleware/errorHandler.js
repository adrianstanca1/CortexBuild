"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errors = exports.AppError = void 0;
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
exports.asyncHandler = asyncHandler;
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
function errorHandler(error, req, res, next) {
    let statusCode = 500;
    let message = 'Internal server error';
    let errors = [];
    if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
    }
    else if (error.message.includes('SQLITE_CONSTRAINT')) {
        statusCode = 400;
        if (error.message.includes('UNIQUE constraint failed')) {
            message = 'Resource already exists';
        }
        else if (error.message.includes('FOREIGN KEY constraint failed')) {
            message = 'Invalid reference to related resource';
        }
        else {
            message = 'Database constraint violation';
        }
    }
    else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    else if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    else if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed';
        errors = [error.details?.map((d) => d.message) || []].flat();
    }
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
    const response = {
        success: false,
        message,
        errors: errors.length > 0 ? errors : undefined
    };
    res.status(statusCode).json(response);
}
function notFoundHandler(req, res) {
    const response = {
        success: false,
        message: `Route ${req.method} ${req.path} not found`
    };
    res.status(404).json(response);
}
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
exports.errors = {
    notFound: (resource = 'Resource') => new AppError(`${resource} not found`, 404),
    unauthorized: (message = 'Unauthorized') => new AppError(message, 401),
    forbidden: (message = 'Forbidden') => new AppError(message, 403),
    badRequest: (message = 'Bad request') => new AppError(message, 400),
    conflict: (message = 'Resource already exists') => new AppError(message, 409),
    unprocessable: (message = 'Unprocessable entity') => new AppError(message, 422),
    internal: (message = 'Internal server error') => new AppError(message, 500)
};
//# sourceMappingURL=errorHandler.js.map