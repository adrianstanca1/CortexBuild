/**
 * Authentication Logic
 * Real JWT-based authentication
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import * as db from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TOKEN_EXPIRY = '24h';

interface JWTPayload {
    userId: string;
    email: string;
}

/**
 * Login with email and password
 */
export const login = async (email: string, password: string) => {
    console.log('🔐 [Auth] Login attempt:', email);

    // Find user
    const user = await db.findUserByEmail(email);
    
    if (!user) {
        console.error('❌ [Auth] User not found');
        throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
        console.error('❌ [Auth] Invalid password');
        throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = jwt.sign(
        { userId: user.id, email: user.email } as JWTPayload,
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
    );

    // Create session in database
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.createSession({
        id: sessionId,
        userId: user.id,
        token,
        expiresAt
    });

    console.log('✅ [Auth] Login successful:', user.name);

    // Return user data (without password) and token
    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            companyId: user.company_id
        },
        token
    };
};

/**
 * Register new user
 */
export const register = async (data: {
    email: string;
    password: string;
    name: string;
    companyName: string;
}) => {
    console.log('📝 [Auth] Register attempt:', data.email);

    // Check if user already exists
    const existingUser = await db.findUserByEmail(data.email);
    
    if (existingUser) {
        console.error('❌ [Auth] User already exists');
        throw new Error('User with this email already exists');
    }

    // Find or create company
    let company = await db.findCompanyByName(data.companyName);
    
    if (!company) {
        const companyId = uuidv4();
        company = await db.createCompany({
            id: companyId,
            name: data.companyName
        });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user
    const userId = uuidv4();
    const user = await db.createUser({
        id: userId,
        email: data.email,
        passwordHash,
        name: data.name,
        role: 'company_admin',
        companyId: company.id
    });

    // Generate JWT token
    const token = jwt.sign(
        { userId: user.id, email: user.email } as JWTPayload,
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
    );

    // Create session
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.createSession({
        id: sessionId,
        userId: user.id,
        token,
        expiresAt
    });

    console.log('✅ [Auth] Registration successful:', user.name);

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            companyId: user.company_id
        },
        token
    };
};

/**
 * Verify JWT token
 */
export const verifyToken = async (token: string) => {
    try {
        // Verify JWT
        const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;

        // Check if session exists in database
        const session = await db.findSessionByToken(token);
        
        if (!session) {
            throw new Error('Session not found');
        }

        // Check if session expired
        if (new Date(session.expires_at) < new Date()) {
            await db.deleteSession(token);
            throw new Error('Session expired');
        }

        // Get user
        const user = await db.findUserById(payload.userId);
        
        if (!user) {
            throw new Error('User not found');
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            companyId: user.company_id
        };
    } catch (error) {
        console.error('❌ [Auth] Token verification failed:', error);
        throw new Error('Invalid or expired token');
    }
};

/**
 * Logout
 */
export const logout = async (token: string) => {
    console.log('👋 [Auth] Logout');
    await db.deleteSession(token);
};

/**
 * Refresh token
 */
export const refreshToken = async (oldToken: string) => {
    // Verify old token
    const user = await verifyToken(oldToken);

    // Delete old session
    await db.deleteSession(oldToken);

    // Generate new token
    const newToken = jwt.sign(
        { userId: user.id, email: user.email } as JWTPayload,
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
    );

    // Create new session
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.createSession({
        id: sessionId,
        userId: user.id,
        token: newToken,
        expiresAt
    });

    console.log('🔄 [Auth] Token refreshed');

    return {
        user,
        token: newToken
    };
};

/**
 * Clean up expired sessions (run periodically)
 */
export const cleanupExpiredSessions = async () => {
    await db.deleteExpiredSessions();
    console.log('🧹 [Auth] Expired sessions cleaned up');
};

/**
 * Express middleware to authenticate requests
 */
export const authenticateToken = async (req: any, res: any, next: any) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const user = await verifyToken(token);
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

