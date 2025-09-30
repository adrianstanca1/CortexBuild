"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.authenticate = authenticate;
exports.authorize = authorize;
exports.requireCompanyAccess = requireCompanyAccess;
exports.optionalAuth = optionalAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const connection_1 = require("../database/connection");
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
function generateToken(user) {
    const payload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        companyId: user.company_id,
        tenantId: user.company_id
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
        expiresIn: '24h',
        issuer: 'asagents-api',
        audience: 'asagents-client'
    });
}
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET, {
        issuer: 'asagents-api',
        audience: 'asagents-client'
    });
}
async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }
        const token = authHeader.substring(7);
        try {
            const payload = verifyToken(token);
            const db = (0, connection_1.getDatabase)();
            const user = await db.get(`
        SELECT id, email, first_name, last_name, role, company_id, avatar_url, phone, is_active
        FROM users 
        WHERE id = ? AND is_active = 1
      `, [payload.userId]);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found or inactive'
                });
            }
            req.user = user;
            next();
        }
        catch (jwtError) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
    }
    catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication failed'
        });
    }
}
function authorize(roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }
        next();
    };
}
function requireCompanyAccess(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    if (!req.user.company_id) {
        return res.status(403).json({
            success: false,
            message: 'User must belong to a company'
        });
    }
    next();
}
async function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }
        const token = authHeader.substring(7);
        try {
            const payload = verifyToken(token);
            const db = (0, connection_1.getDatabase)();
            const user = await db.get(`
        SELECT id, email, first_name, last_name, role, company_id, avatar_url, phone, is_active
        FROM users 
        WHERE id = ? AND is_active = 1
      `, [payload.userId]);
            if (user) {
                req.user = user;
            }
        }
        catch (jwtError) {
        }
        next();
    }
    catch (error) {
        console.error('Optional auth error:', error);
        next();
    }
}
//# sourceMappingURL=auth.js.map