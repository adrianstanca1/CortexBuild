import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import Database from 'better-sqlite3';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';
const TOKEN_EXPIRY = '24h';

interface JWTPayload {
    userId: string;
    email: string;
}

export const login = (db: Database.Database, email: string, password: string) => {
    console.log('🔐 [Auth] Login attempt:', email);
    
    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email) as any;
    
    if (!user) {
        console.error('❌ [Auth] User not found');
        throw new Error('Invalid email or password');
    }
    
    const isValidPassword = bcrypt.compareSync(password, user.password_hash);
    
    if (!isValidPassword) {
        console.error('❌ [Auth] Invalid password');
        throw new Error('Invalid email or password');
    }
    
    const token = jwt.sign(
        { userId: user.id, email: user.email } as JWTPayload,
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
    );
    
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    db.prepare('INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)').run(
        sessionId, user.id, token, expiresAt.toISOString()
    );
    
    console.log('✅ [Auth] Login successful');
    
    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            company_id: user.company_id
        }
    };
};

export const register = (db: Database.Database, email: string, password: string, name: string, companyId: string) => {
    console.log('📝 [Auth] Registration attempt:', email);
    
    const existingUser = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email);
    
    if (existingUser) {
        console.error('❌ [Auth] User already exists');
        throw new Error('User already exists');
    }
    
    const passwordHash = bcrypt.hashSync(password, 10);
    const userId = uuidv4();
    
    db.prepare('INSERT INTO users (id, email, password_hash, name, role, company_id) VALUES (?, ?, ?, ?, ?, ?)').run(
        userId, email, passwordHash, name, 'user', companyId
    );
    
    console.log('✅ [Auth] User registered successfully');
    
    return login(db, email, password);
};

export const verifyToken = (token: string): JWTPayload => {
    try {
        const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
        return payload;
    } catch (error) {
        throw new Error('Invalid token');
    }
};

export const getCurrentUser = (db: Database.Database, token: string) => {
    const payload = verifyToken(token);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.userId) as any;
    
    if (!user) {
        throw new Error('User not found');
    }
    
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company_id: user.company_id
    };
};

export const logout = (db: Database.Database, token: string) => {
    console.log('👋 [Auth] Logout');
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return { success: true };
};

export const authenticateToken = (db: Database.Database) => {
    return (req: any, res: any, next: any) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }

        try {
            const payload = verifyToken(token);
            req.user = payload;
            next();
        } catch (error) {
            return res.status(403).json({ success: false, error: 'Invalid token' });
        }
    };
};

export default {
    login,
    register,
    verifyToken,
    getCurrentUser,
    logout,
    authenticateToken
};
