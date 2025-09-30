import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { logger } from '../utils/logger.js';
class Auth0Middleware {
    config;
    jwksClient;
    constructor() {
        this.config = {
            domain: process.env.AUTH0_DOMAIN || 'dev-8fnhhin0d5z8ssix.uk.auth0.com',
            audience: process.env.AUTH0_AUDIENCE || 'https://asagents.co.uk/api',
            issuer: process.env.AUTH0_ISSUER || 'https://dev-8fnhhin0d5z8ssix.uk.auth0.com/'
        };
        this.jwksClient = jwksClient({
            jwksUri: `https://${this.config.domain}/.well-known/jwks.json`,
            requestHeaders: {},
            timeout: 30000,
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5
        });
    }
    // Get signing key for JWT verification
    getKey = (header, callback) => {
        this.jwksClient.getSigningKey(header.kid, (err, key) => {
            if (err) {
                logger.error({ error: err }, 'Failed to get signing key');
                return callback(err);
            }
            const signingKey = key?.getPublicKey();
            callback(null, signingKey);
        });
    };
    // Verify JWT token
    verifyToken = (token) => {
        return new Promise((resolve, reject) => {
            jwt.verify(token, this.getKey, {
                audience: this.config.audience,
                issuer: this.config.issuer,
                algorithms: ['RS256']
            }, (err, decoded) => {
                if (err) {
                    logger.error({ error: err }, 'JWT verification failed');
                    return reject(err);
                }
                if (!decoded || typeof decoded !== 'object') {
                    return reject(new Error('Invalid token payload'));
                }
                const user = {
                    sub: decoded.sub,
                    email: decoded.email,
                    name: decoded.name,
                    picture: decoded.picture,
                    email_verified: decoded.email_verified,
                    permissions: decoded.permissions || [],
                    roles: decoded['https://asagents.co.uk/roles'] || []
                };
                resolve(user);
            });
        });
    };
    // Middleware to authenticate requests
    authenticate = () => {
        return async (req, res, next) => {
            try {
                const authHeader = req.headers.authorization;
                if (!authHeader) {
                    return res.status(401).json({
                        error: 'Authorization header missing',
                        message: 'Please provide a valid access token'
                    });
                }
                const token = authHeader.replace('Bearer ', '');
                if (!token) {
                    return res.status(401).json({
                        error: 'Access token missing',
                        message: 'Please provide a valid access token'
                    });
                }
                // Verify the token
                const user = await this.verifyToken(token);
                // Attach user and token to request
                req.user = user;
                req.token = token;
                logger.info({ userId: user.sub, email: user.email }, 'User authenticated via Auth0');
                next();
            }
            catch (error) {
                logger.error({ error }, 'Auth0 authentication failed');
                return res.status(401).json({
                    error: 'Authentication failed',
                    message: 'Invalid or expired access token'
                });
            }
        };
    };
    // Middleware to check specific permissions
    requirePermission = (permission) => {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Authentication required',
                    message: 'Please authenticate first'
                });
            }
            const userPermissions = req.user.permissions || [];
            if (!userPermissions.includes(permission)) {
                logger.warn({
                    userId: req.user.sub,
                    requiredPermission: permission,
                    userPermissions
                }, 'Permission denied');
                return res.status(403).json({
                    error: 'Permission denied',
                    message: `Required permission: ${permission}`
                });
            }
            next();
        };
    };
    // Middleware to check specific roles
    requireRole = (role) => {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({
                    error: 'Authentication required',
                    message: 'Please authenticate first'
                });
            }
            const userRoles = req.user.roles || [];
            if (!userRoles.includes(role)) {
                logger.warn({
                    userId: req.user.sub,
                    requiredRole: role,
                    userRoles
                }, 'Role access denied');
                return res.status(403).json({
                    error: 'Access denied',
                    message: `Required role: ${role}`
                });
            }
            next();
        };
    };
    // Get user profile endpoint
    getUserProfile = () => {
        return async (req, res) => {
            try {
                if (!req.user) {
                    return res.status(401).json({
                        error: 'Authentication required',
                        message: 'Please authenticate first'
                    });
                }
                // Return user profile
                res.json({
                    success: true,
                    user: {
                        id: req.user.sub,
                        email: req.user.email,
                        name: req.user.name,
                        picture: req.user.picture,
                        emailVerified: req.user.email_verified,
                        permissions: req.user.permissions,
                        roles: req.user.roles
                    }
                });
            }
            catch (error) {
                logger.error({ error }, 'Get user profile failed');
                res.status(500).json({
                    error: 'Internal server error',
                    message: 'Failed to get user profile'
                });
            }
        };
    };
}
// Export singleton instance
export const auth0Middleware = new Auth0Middleware();
export default auth0Middleware;
