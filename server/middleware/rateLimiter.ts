/**
 * Rate Limiting Middleware for CortexBuild API
 * Provides configurable rate limiting with different strategies per endpoint type
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: Request) => string; // Function to generate rate limit key
  skipSuccessfulRequests?: boolean; // Whether to count successful requests
  skipFailedRequests?: boolean; // Whether to count failed requests
  message?: string; // Custom error message
  standardHeaders?: boolean; // Return rate limit headers
  legacyHeaders?: boolean; // Support for legacy headers
}

interface RateLimitStore {
  [key: string]: {
    requests: number;
    resetTime: number;
    firstRequest: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      keyGenerator: (req) => this.getDefaultKey(req),
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      message: 'Too many requests',
      standardHeaders: true,
      legacyHeaders: false,
      ...config,
    };

    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private getDefaultKey(req: Request): string {
    // Use IP address as default key
    return req.ip || req.connection.remoteAddress || 'unknown';
  }

  private generateKey(req: Request): string {
    return this.config.keyGenerator!(req);
  }

  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  private getResetTime(windowMs: number): number {
    return Date.now() + windowMs;
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = this.generateKey(req);
      const now = Date.now();
      const windowMs = this.config.windowMs;

      // Initialize or get existing rate limit data
      if (!this.store[key]) {
        this.store[key] = {
          requests: 0,
          resetTime: this.getResetTime(windowMs),
          firstRequest: now,
        };
      }

      const rateLimitData = this.store[key];

      // Reset window if expired
      if (now >= rateLimitData.resetTime) {
        rateLimitData.requests = 0;
        rateLimitData.resetTime = this.getResetTime(windowMs);
        rateLimitData.firstRequest = now;
      }

      // Check if request should be counted
      const shouldCountRequest = this.shouldCountRequest(req, res);

      if (shouldCountRequest) {
        rateLimitData.requests++;
      }

      // Set rate limit headers
      if (this.config.standardHeaders) {
        res.set({
          'X-RateLimit-Limit': this.config.maxRequests.toString(),
          'X-RateLimit-Remaining': Math.max(0, this.config.maxRequests - rateLimitData.requests).toString(),
          'X-RateLimit-Reset': rateLimitData.resetTime.toString(),
        });
      }

      if (this.config.legacyHeaders) {
        res.set({
          'X-RateLimit-Limit': this.config.maxRequests.toString(),
          'X-RateLimit-Remaining': Math.max(0, this.config.maxRequests - rateLimitData.requests).toString(),
          'X-RateLimit-Reset': new Date(rateLimitData.resetTime).toUTCString(),
        });
      }

      // Check if rate limit exceeded
      if (rateLimitData.requests > this.config.maxRequests) {
        const resetIn = Math.ceil((rateLimitData.resetTime - now) / 1000);

        res.status(429).json({
          success: false,
          error: this.config.message || 'Too many requests',
          code: 'RATE_LIMITED',
          retryAfter: resetIn,
          details: {
            limit: this.config.maxRequests,
            windowMs: this.config.windowMs,
            resetIn,
          },
        });
        return;
      }

      next();
    };
  }

  private shouldCountRequest(req: Request, res: Response): boolean {
    // Always count the request for now
    // In the future, we could implement logic to skip certain requests
    return true;
  }

  // Get current rate limit status for a key
  getStatus(key: string) {
    return this.store[key] || null;
  }

  // Reset rate limit for a key
  reset(key: string) {
    if (this.store[key]) {
      delete this.store[key];
    }
  }

  // Get all rate limit data (for debugging)
  getAllStatus() {
    return { ...this.store };
  }
}

// Pre-configured rate limiters for different endpoint types
export const createAuthRateLimiter = () => {
  return new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 requests per 15 minutes
    message: 'Too many authentication attempts. Please try again later.',
  });
};

export const createGeneralRateLimiter = () => {
  return new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    message: 'Too many API requests. Please slow down.',
  });
};

export const createAdminRateLimiter = () => {
  return new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 1000, // 1000 requests per hour
    message: 'Admin API rate limit exceeded. Please try again later.',
  });
};

export const createUploadRateLimiter = () => {
  return new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 uploads per hour
    message: 'Upload limit exceeded. Please try again later.',
  });
};

// Custom rate limiter factory
export const createCustomRateLimiter = (config: RateLimitConfig) => {
  return new RateLimiter(config);
};

// Middleware functions for easy use in routes
export const authRateLimit = createAuthRateLimiter().middleware();
export const generalRateLimit = createGeneralRateLimiter().middleware();
export const adminRateLimit = createAdminRateLimiter().middleware();
export const uploadRateLimit = createUploadRateLimiter().middleware();

export default RateLimiter;