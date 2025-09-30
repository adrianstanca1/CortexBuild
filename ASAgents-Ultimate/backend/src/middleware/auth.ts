import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../database/connection';
import { User } from '../types';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, 'password_hash'>;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  companyId?: string;
  tenantId?: string; // alias for future compatibility
}

// Generate JWT token
export function generateToken(user: Omit<User, 'password_hash'>): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    companyId: user.company_id,
    tenantId: user.company_id
  };
  
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '24h',
    issuer: 'asagents-api',
    audience: 'asagents-client'
  });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET, {
    issuer: 'asagents-api',
    audience: 'asagents-client'
  }) as JWTPayload;
}

// Authentication middleware
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const payload = verifyToken(token);
      
      // Get user from database to ensure they still exist and are active
      const db = getDatabase();
      const user = await db.get<User>(`
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
      
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
}

// Authorization middleware - check user roles
export function authorize(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
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

// Company access middleware - ensure user can only access their company's data
export function requireCompanyAccess(req: Request, res: Response, next: NextFunction) {
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

// Optional authentication - doesn't fail if no token provided
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without user
    }
    
    const token = authHeader.substring(7);
    
    try {
      const payload = verifyToken(token);
      
      const db = getDatabase();
      const user = await db.get<User>(`
        SELECT id, email, first_name, last_name, role, company_id, avatar_url, phone, is_active
        FROM users 
        WHERE id = ? AND is_active = 1
      `, [payload.userId]);
      
      if (user) {
        req.user = user;
      }
      
    } catch (jwtError) {
      // Invalid token, but continue without user
    }
    
    next();
    
  } catch (error) {
    console.error('Optional auth error:', error);
    next(); // Continue without user
  }
}
