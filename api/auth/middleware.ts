/**
 * JWT Token Verification Middleware
 * Verifies JWT tokens and extracts user information
 */

import jwt from 'jsonwebtoken';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export interface AuthenticatedRequest extends VercelRequest {
    user?: {
        userId: string;
        email: string;
        role: string;
        companyId: string;
        sessionId: string;
        issuedAt: number;
    };
}

export interface AuthContext {
    user: AuthenticatedRequest['user'];
    isAuthenticated: boolean;
}

export const verifyToken = async (req: AuthenticatedRequest, res: VercelResponse): Promise<AuthContext> => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { user: undefined, isAuthenticated: false };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT secret not configured');
        }

        const decoded = jwt.verify(token, jwtSecret, {
            issuer: 'cortexbuild-auth',
            audience: 'cortexbuild-users'
        }) as any;

        // Add user info to request
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            companyId: decoded.companyId,
            sessionId: decoded.sessionId,
            issuedAt: decoded.issuedAt
        };

        return { user: req.user, isAuthenticated: true };
    } catch (error: any) {
        console.log('JWT verification failed:', error.message);
        return { user: undefined, isAuthenticated: false };
    }
};

export const requireAuth = (handler: (req: AuthenticatedRequest, res: VercelResponse) => Promise<void>) => {
    return async (req: AuthenticatedRequest, res: VercelResponse) => {
        const authContext = await verifyToken(req, res);
        
        if (!authContext.isAuthenticated) {
            return res.status(401).json({
                error: 'Authentication required',
                code: 'UNAUTHORIZED'
            });
        }

        return handler(req, res);
    };
};

export const requireRole = (allowedRoles: string[]) => {
    return (handler: (req: AuthenticatedRequest, res: VercelResponse) => Promise<void>) => {
        return async (req: AuthenticatedRequest, res: VercelResponse) => {
            const authContext = await verifyToken(req, res);
            
            if (!authContext.isAuthenticated) {
                return res.status(401).json({
                    error: 'Authentication required',
                    code: 'UNAUTHORIZED'
                });
            }

            if (!authContext.user || !allowedRoles.includes(authContext.user.role)) {
                return res.status(403).json({
                    error: 'Insufficient permissions',
                    code: 'FORBIDDEN',
                    requiredRoles: allowedRoles,
                    userRole: authContext.user?.role
                });
            }

            return handler(req, res);
        };
    };
};