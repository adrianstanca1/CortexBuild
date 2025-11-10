/**
 * Logout API Endpoint
 * POST /api/auth/logout
 *
 * Invalidates the current session token
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed',
            code: 'METHOD_NOT_ALLOWED'
        });
    }

    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Missing or invalid authorization token',
                code: 'UNAUTHORIZED'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        try {
            // Verify token to ensure it's valid
            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret) {
                console.error('JWT secret not configured');
                return res.status(500).json({
                    error: 'Internal server error',
                    code: 'INTERNAL_ERROR'
                });
            }

            const decoded = jwt.verify(token, jwtSecret, {
                issuer: 'cortexbuild-auth',
                audience: 'cortexbuild-users'
            }) as any;

            // Log the logout event
            console.log('LOGOUT_EVENT:', {
                userId: decoded.userId,
                email: decoded.email,
                sessionId: decoded.sessionId,
                timestamp: new Date().toISOString()
            });

            return res.status(200).json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (tokenError: any) {
            console.error('Token verification failed:', tokenError.message);
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token',
                code: 'INVALID_TOKEN'
            });
        }

    } catch (error: any) {
        console.error('Logout error:', error.message);
        return res.status(500).json({
            error: 'Internal server error',
            code: 'INTERNAL_ERROR'
        });
    }
}