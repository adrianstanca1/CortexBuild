/**
 * Logout API Endpoint
 * POST /api/auth/logout
 *
 * Invalidates the current session token
 * Uses centralized error handling for consistency
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import {
    createErrorResponse,
    createSuccessResponse,
    ErrorCodes,
    getStatusCode,
    logger,
    validateTokenFormat
} from '../../utils/errorHandler';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        const error = createErrorResponse(ErrorCodes.METHOD_NOT_ALLOWED);
        return res.status(getStatusCode(ErrorCodes.METHOD_NOT_ALLOWED)).json(error);
    }

    try {
        const clientIP = req.headers['x-forwarded-for'] as string || 'unknown';
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            logger.warn('Logout attempt without token', { ip: clientIP });
            const error = createErrorResponse(
                ErrorCodes.MISSING_TOKEN,
                'Missing or invalid authorization token'
            );
            return res.status(getStatusCode(ErrorCodes.MISSING_TOKEN)).json(error);
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        try {
            // Validate token format before verification
            if (!validateTokenFormat(token)) {
                logger.warn('Invalid token format in logout', {
                    tokenLength: token.length,
                    ip: clientIP
                });
                const error = createErrorResponse(
                    ErrorCodes.INVALID_TOKEN,
                    'Your session has expired. Please log in again.'
                );
                return res.status(getStatusCode(ErrorCodes.INVALID_TOKEN)).json(error);
            }

            // Verify token to ensure it's valid
            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret) {
                logger.error('JWT secret not configured');
                const error = createErrorResponse(ErrorCodes.INTERNAL_ERROR);
                return res.status(getStatusCode(ErrorCodes.INTERNAL_ERROR)).json(error);
            }

            const decoded = jwt.verify(token, jwtSecret, {
                issuer: 'cortexbuild-auth',
                audience: 'cortexbuild-users'
            }) as any;

            // Log the logout event with context
            logger.info('User logout successful', {
                userId: decoded.userId,
                email: decoded.email,
                sessionId: decoded.sessionId,
                ip: clientIP
            });

            const response = createSuccessResponse({
                message: 'Logged out successfully',
                userId: decoded.userId,
                sessionId: decoded.sessionId
            });

            return res.status(200).json(response);

        } catch (tokenError: any) {
            logger.warn('Token verification failed in logout', {
                error: tokenError.message,
                code: tokenError.code,
                ip: clientIP
            });

            const errorCode = tokenError.code === 'TokenExpiredError'
                ? ErrorCodes.TOKEN_EXPIRED
                : ErrorCodes.INVALID_TOKEN;

            const error = createErrorResponse(
                errorCode,
                'Your session has expired. Please log in again.'
            );
            return res.status(getStatusCode(errorCode)).json(error);
        }

    } catch (error: any) {
        logger.error('Logout handler error', error, {
            method: req.method,
            url: req.url
        });

        const apiError = createErrorResponse(
            ErrorCodes.INTERNAL_ERROR,
            'An unexpected error occurred during logout'
        );
        return res.status(getStatusCode(ErrorCodes.INTERNAL_ERROR)).json(apiError);
    }
}