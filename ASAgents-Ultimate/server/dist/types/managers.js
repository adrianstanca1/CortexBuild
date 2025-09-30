// Types and interfaces for API Manager and Secrets Management System
// ===== ERROR TYPES =====
export class ManagerError extends Error {
    code;
    statusCode;
    metadata;
    constructor(message, code, statusCode = 500, metadata) {
        super(message);
        this.name = 'ManagerError';
        this.code = code;
        this.statusCode = statusCode;
        this.metadata = metadata;
    }
}
export class SecretsError extends ManagerError {
    constructor(message, code, metadata) {
        super(message, code, 500, metadata);
        this.name = 'SecretsError';
    }
}
export class APIError extends ManagerError {
    constructor(message, code, statusCode = 400, metadata) {
        super(message, code, statusCode, metadata);
        this.name = 'APIError';
    }
}
export class ValidationError extends ManagerError {
    constructor(message, field, value) {
        super(message, 'VALIDATION_ERROR', 400, { field, value });
        this.name = 'ValidationError';
    }
}
export class AuthenticationError extends ManagerError {
    constructor(message = 'Authentication failed') {
        super(message, 'AUTHENTICATION_ERROR', 401);
        this.name = 'AuthenticationError';
    }
}
export class AuthorizationError extends ManagerError {
    constructor(message = 'Authorization failed') {
        super(message, 'AUTHORIZATION_ERROR', 403);
        this.name = 'AuthorizationError';
    }
}
export class RateLimitError extends ManagerError {
    constructor(message = 'Rate limit exceeded', retryAfter) {
        super(message, 'RATE_LIMIT_ERROR', 429, { retryAfter });
        this.name = 'RateLimitError';
    }
}
