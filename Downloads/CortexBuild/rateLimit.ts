/**
 * Rate Limiting Middleware for Vercel Serverless Functions
 * Uses in-memory store (suitable for serverless)
 */

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

const store: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach(key => {
        if (store[key].resetTime < now) {
            delete store[key];
        }
    });
}, 5 * 60 * 1000);

export interface RateLimitConfig {
    windowMs: number;  // Time window in milliseconds
    maxRequests: number;  // Max requests per window
}

export function rateLimit(config: RateLimitConfig) {
    return (identifier: string): { allowed: boolean; remaining: number; resetTime: number } => {
        const now = Date.now();
        const key = identifier;

        // Initialize or reset if window expired
        if (!store[key] || store[key].resetTime < now) {
            store[key] = {
                count: 0,
                resetTime: now + config.windowMs
            };
        }

        // Increment count
        store[key].count++;

        const allowed = store[key].count <= config.maxRequests;
        const remaining = Math.max(0, config.maxRequests - store[key].count);

        return {
            allowed,
            remaining,
            resetTime: store[key].resetTime
        };
    };
}

// Pre-configured rate limiters
export const loginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5 // 5 login attempts per 15 minutes
});

export const apiRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60 // 60 requests per minute
});

export const registerRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3 // 3 registrations per hour
});

