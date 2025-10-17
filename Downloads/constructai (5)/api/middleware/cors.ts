/**
 * CORS Middleware with Enhanced Security
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export interface CorsOptions {
    allowedOrigins?: string[];
    allowCredentials?: boolean;
    allowedMethods?: string[];
    allowedHeaders?: string[];
    maxAge?: number;
}

const defaultOptions: CorsOptions = {
    allowedOrigins: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'http://127.0.0.1:3002', 'http://127.0.0.1:3003'],
    allowCredentials: true,
    allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'X-CSRF-Token',
        'X-Requested-With',
        'Accept',
        'Accept-Version',
        'Content-Length',
        'Content-MD5',
        'Content-Type',
        'Date',
        'X-Api-Version',
        'Authorization'
    ],
    maxAge: 86400 // 24 hours
};

export function setCorsHeaders(
    req: VercelRequest,
    res: VercelResponse,
    options: CorsOptions = {}
): void {
    const opts = { ...defaultOptions, ...options };

    // Determine allowed origin
    const origin = req.headers.origin || '';
    const allowedOrigin = opts.allowedOrigins?.includes('*')
        ? '*'
        : opts.allowedOrigins?.includes(origin)
        ? origin
        : opts.allowedOrigins?.[0] || origin;

    // Only set wildcard if credentials are not required
    if (allowedOrigin === '*' && opts.allowCredentials) {
        // If credentials are required, use the request origin if it's in the allowed list
        res.setHeader('Access-Control-Allow-Origin', origin || opts.allowedOrigins?.[0] || '*');
    } else {
        res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    }

    if (opts.allowCredentials) {
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.setHeader('Access-Control-Allow-Methods', opts.allowedMethods?.join(', ') || '');
    res.setHeader('Access-Control-Allow-Headers', opts.allowedHeaders?.join(', ') || '');

    if (opts.maxAge) {
        res.setHeader('Access-Control-Max-Age', opts.maxAge.toString());
    }
}

export function handleCors(
    req: VercelRequest,
    res: VercelResponse,
    options?: CorsOptions
): boolean {
    setCorsHeaders(req, res, options);

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return true;
    }

    return false;
}

