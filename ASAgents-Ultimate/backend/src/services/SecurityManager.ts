/**
 * Advanced Security Manager
 * Handles encryption, authentication, session management, and security policies
 */

import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import { Request, Response, NextFunction } from 'express';

export interface SecurityPolicy {
  tenantId: string;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge: number; // days
    preventReuse: number; // number of previous passwords to check
  };
  sessionPolicy: {
    maxDuration: number; // minutes
    maxConcurrentSessions: number;
    requireMFA: boolean;
    ipWhitelist: string[];
    sessionTimeout: number; // minutes of inactivity
  };
  encryptionPolicy: {
    algorithm: string;
    keyRotationDays: number;
    encryptSensitiveFields: string[];
  };
  auditPolicy: {
    logLevel: 'minimal' | 'standard' | 'verbose';
    retentionDays: number;
    realTimeAlerts: boolean;
    sensitiveOperations: string[];
  };
  complianceSettings: {
    gdprCompliant: boolean;
    hipaaCompliant: boolean;
    sox404Compliant: boolean;
    dataRetentionDays: number;
    rightToBeForgatten: boolean;
  };
}

export interface SecurityEvent {
  id: string;
  tenantId: string;
  userId?: string;
  eventType: 'login_success' | 'login_failed' | 'password_changed' | 'mfa_enabled' | 'suspicious_activity' | 'data_access' | 'permission_denied';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  timestamp: Date;
}

export interface SecureSession {
  id: string;
  userId: string;
  tenantId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
  mfaVerified: boolean;
}

export class SecurityManager {
  private readonly db: any;
  private readonly jwtSecret: string;
  private readonly encryptionKey: Buffer;
  private readonly algorithm = 'aes-256-gcm';
  private readonly saltRounds = 12;

  constructor(database: any, jwtSecret: string, encryptionKey?: string) {
    this.db = database;
    this.jwtSecret = jwtSecret;
    this.encryptionKey = encryptionKey ? 
      Buffer.from(encryptionKey, 'hex') : 
      crypto.randomBytes(32);
  }

  /**
   * Authenticate user with enhanced security
   */
  async authenticateUser(
    email: string, 
    password: string, 
    ipAddress: string, 
    userAgent: string,
    mfaToken?: string
  ): Promise<{ success: boolean; user?: any; token?: string; requiresMFA?: boolean; reason?: string }> {
    try {
      // Check for rate limiting
      if (await this.isRateLimited(email, ipAddress)) {
        await this.logSecurityEvent({
          tenantId: 'system',
          eventType: 'login_failed',
          severity: 'medium',
          ipAddress,
          userAgent,
          details: { email, reason: 'rate_limited' }
        });
        return { success: false, reason: 'Rate limited. Try again later.' };
      }

      // Get user with security info
      const user = await this.db.get(`
        SELECT u.*, sp.session_policy, sp.password_policy 
        FROM users u
        LEFT JOIN security_policies sp ON u.tenant_id = sp.tenant_id
        WHERE u.email = ? AND u.is_active = 1
      `, [email]);

      if (!user) {
        await this.incrementFailedAttempts(email, ipAddress);
        await this.logSecurityEvent({
          tenantId: 'system',
          eventType: 'login_failed',
          severity: 'low',
          ipAddress,
          userAgent,
          details: { email, reason: 'user_not_found' }
        });
        return { success: false, reason: 'Invalid credentials' };
      }

      // Check if account is locked
      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        await this.logSecurityEvent({
          tenantId: user.tenant_id,
          userId: user.id,
          eventType: 'login_failed',
          severity: 'medium',
          ipAddress,
          userAgent,
          details: { reason: 'account_locked' }
        });
        return { success: false, reason: 'Account is locked' };
      }

      // Verify password
      const passwordValid = await bcrypt.compare(password, user.password_hash);
      if (!passwordValid) {
        await this.incrementFailedAttempts(email, ipAddress);
        await this.logSecurityEvent({
          tenantId: user.tenant_id,
          userId: user.id,
          eventType: 'login_failed',
          severity: 'low',
          ipAddress,
          userAgent,
          details: { reason: 'invalid_password' }
        });
        return { success: false, reason: 'Invalid credentials' };
      }

      // Check MFA requirement
      const sessionPolicy = user.session_policy ? JSON.parse(user.session_policy) : null;
      if ((sessionPolicy?.requireMFA || user.two_factor_enabled) && !mfaToken) {
        return { success: false, requiresMFA: true };
      }

      // Verify MFA if provided
      if (mfaToken && user.two_factor_enabled) {
        const mfaValid = speakeasy.totp.verify({
          secret: user.two_factor_secret,
          encoding: 'base32',
          token: mfaToken,
          window: 2
        });

        if (!mfaValid) {
          await this.logSecurityEvent({
            tenantId: user.tenant_id,
            userId: user.id,
            eventType: 'login_failed',
            severity: 'high',
            ipAddress,
            userAgent,
            details: { reason: 'invalid_mfa' }
          });
          return { success: false, reason: 'Invalid MFA token' };
        }
      }

      // Check IP whitelist if configured
      if (sessionPolicy?.ipWhitelist?.length > 0) {
        if (!sessionPolicy.ipWhitelist.includes(ipAddress)) {
          await this.logSecurityEvent({
            tenantId: user.tenant_id,
            userId: user.id,
            eventType: 'login_failed',
            severity: 'high',
            ipAddress,
            userAgent,
            details: { reason: 'ip_not_whitelisted' }
          });
          return { success: false, reason: 'IP address not authorized' };
        }
      }

      // Create secure session
      const session = await this.createSession(user.id, user.tenant_id, ipAddress, userAgent);

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          tenantId: user.tenant_id, 
          sessionId: session.id,
          mfaVerified: Boolean(mfaToken)
        },
        this.jwtSecret,
        { expiresIn: sessionPolicy?.maxDuration ? `${sessionPolicy.maxDuration}m` : '8h' }
      );

      // Reset failed attempts
      await this.resetFailedAttempts(user.id);

      // Update last login
      await this.db.run(`
        UPDATE users 
        SET last_login = ?, failed_login_attempts = 0, locked_until = NULL
        WHERE id = ?
      `, [new Date().toISOString(), user.id]);

      // Log successful login
      await this.logSecurityEvent({
        tenantId: user.tenant_id,
        userId: user.id,
        eventType: 'login_success',
        severity: 'low',
        ipAddress,
        userAgent,
        details: { sessionId: session.id }
      });

      return { 
        success: true, 
        user: this.sanitizeUser(user), 
        token 
      };

    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, reason: 'Internal error' };
    }
  }

  /**
   * Validate and refresh JWT token
   */
  async validateToken(token: string, ipAddress: string): Promise<{ valid: boolean; user?: any; reason?: string }> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      
      // Check if session is still valid
      const session = await this.db.get(`
        SELECT * FROM secure_sessions WHERE id = ? AND is_active = 1 AND expires_at > datetime('now')
      `, [decoded.sessionId]);

      if (!session) {
        return { valid: false, reason: 'Session expired' };
      }

      // Verify IP address hasn't changed (optional strict checking)
      if (session.ip_address !== ipAddress) {
        await this.logSecurityEvent({
          tenantId: decoded.tenantId,
          userId: decoded.userId,
          eventType: 'suspicious_activity',
          severity: 'high',
          ipAddress,
          userAgent: '',
          details: { reason: 'ip_address_changed', originalIp: session.ip_address }
        });
        // Could optionally invalidate session here based on security policy
      }

      // Get user data
      const user = await this.db.get(`
        SELECT * FROM users WHERE id = ? AND is_active = 1
      `, [decoded.userId]);

      if (!user) {
        return { valid: false, reason: 'User not found' };
      }

      // Update last activity
      await this.updateSessionActivity(decoded.sessionId);

      return { valid: true, user: this.sanitizeUser(user) };

    } catch (error) {
      console.error('Token validation error:', error);
      return { valid: false, reason: 'Invalid token' };
    }
  }

  /**
   * Enable Two-Factor Authentication
   */
  async enableTwoFactor(userId: string): Promise<{ secret: string; qrCodeUrl: string }> {
    const user = await this.db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      throw new Error('User not found');
    }

    const secret = speakeasy.generateSecret({
      name: `ASAgents (${user.email})`,
      issuer: 'ASAgents Construction Platform'
    });

    await this.db.run(`
      UPDATE users 
      SET two_factor_secret = ?, two_factor_enabled = 1, updated_at = ?
      WHERE id = ?
    `, [secret.base32, new Date().toISOString(), userId]);

    await this.logSecurityEvent({
      tenantId: user.tenant_id,
      userId,
      eventType: 'mfa_enabled',
      severity: 'low',
      ipAddress: '',
      userAgent: '',
      details: {}
    });

    return {
      secret: secret.base32,
      qrCodeUrl: secret.otpauth_url!
    };
  }

  /**
   * Encrypt sensitive data
   */
  encryptData(data: string): { encryptedData: string; iv: string; authTag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipherGCM(this.algorithm, this.encryptionKey, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encryptedData: encrypted,
      iv: iv.toString('hex'),
      authTag: cipher.getAuthTag().toString('hex')
    };
  }

  /**
   * Decrypt sensitive data
   */
  decryptData(encryptedData: string, iv: string, authTag: string): string {
    const decipher = crypto.createDecipherGCM(this.algorithm, this.encryptionKey, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Security middleware for Express
   */
  securityMiddleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        const validation = await this.validateToken(token, req.ip);
        
        if (!validation.valid) {
          return res.status(401).json({ error: validation.reason });
        }

        req.user = validation.user;
        next();
      } catch (error) {
        console.error('Security middleware error:', error);
        res.status(500).json({ error: 'Authentication failed' });
      }
    };
  }

  /**
   * Audit logging for sensitive operations
   */
  async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    const securityEvent: SecurityEvent = {
      id: this.generateId('sec'),
      timestamp: new Date(),
      ...event
    };

    await this.db.run(`
      INSERT INTO security_events (id, tenant_id, user_id, event_type, severity, ip_address, user_agent, details, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      securityEvent.id,
      securityEvent.tenantId,
      securityEvent.userId || null,
      securityEvent.eventType,
      securityEvent.severity,
      securityEvent.ipAddress,
      securityEvent.userAgent,
      JSON.stringify(securityEvent.details),
      securityEvent.timestamp.toISOString()
    ]);

    // Send real-time alerts for critical events
    if (securityEvent.severity === 'critical') {
      await this.sendSecurityAlert(securityEvent);
    }
  }

  // Private helper methods

  private async createSession(userId: string, tenantId: string, ipAddress: string, userAgent: string): Promise<SecureSession> {
    // Check concurrent session limit
    await this.enforceSessionLimits(userId);

    const session: SecureSession = {
      id: this.generateId('sess'),
      userId,
      tenantId,
      ipAddress,
      userAgent,
      createdAt: new Date(),
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
      isActive: true,
      mfaVerified: false
    };

    await this.db.run(`
      INSERT INTO secure_sessions (id, user_id, tenant_id, ip_address, user_agent, created_at, last_activity, expires_at, is_active, mfa_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      session.id, session.userId, session.tenantId, session.ipAddress, session.userAgent,
      session.createdAt.toISOString(), session.lastActivity.toISOString(), session.expiresAt.toISOString(),
      session.isActive ? 1 : 0, session.mfaVerified ? 1 : 0
    ]);

    return session;
  }

  private async isRateLimited(email: string, ipAddress: string): Promise<boolean> {
    const recentAttempts = await this.db.get(`
      SELECT COUNT(*) as count 
      FROM security_events 
      WHERE (details LIKE ? OR ip_address = ?) 
      AND event_type = 'login_failed' 
      AND timestamp > datetime('now', '-15 minutes')
    `, [`%${email}%`, ipAddress]);

    return recentAttempts.count >= 5; // Max 5 failed attempts in 15 minutes
  }

  private async incrementFailedAttempts(email: string, ipAddress: string): Promise<void> {
    await this.db.run(`
      UPDATE users 
      SET failed_login_attempts = failed_login_attempts + 1,
          locked_until = CASE 
            WHEN failed_login_attempts >= 4 THEN datetime('now', '+30 minutes')
            ELSE locked_until
          END
      WHERE email = ?
    `, [email]);
  }

  private async resetFailedAttempts(userId: string): Promise<void> {
    await this.db.run(`
      UPDATE users 
      SET failed_login_attempts = 0, locked_until = NULL
      WHERE id = ?
    `, [userId]);
  }

  private async updateSessionActivity(sessionId: string): Promise<void> {
    await this.db.run(`
      UPDATE secure_sessions 
      SET last_activity = ?
      WHERE id = ?
    `, [new Date().toISOString(), sessionId]);
  }

  private async enforceSessionLimits(userId: string): Promise<void> {
    // Deactivate old sessions if limit exceeded
    await this.db.run(`
      UPDATE secure_sessions 
      SET is_active = 0 
      WHERE user_id = ? 
      AND id NOT IN (
        SELECT id FROM secure_sessions 
        WHERE user_id = ? AND is_active = 1 
        ORDER BY created_at DESC 
        LIMIT 3
      )
    `, [userId, userId]);
  }

  private sanitizeUser(user: any): any {
    const { password_hash, two_factor_secret, ...sanitized } = user;
    return sanitized;
  }

  private async sendSecurityAlert(event: SecurityEvent): Promise<void> {
    // Implementation for sending real-time security alerts
    console.warn('SECURITY ALERT:', event);
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
  }
}