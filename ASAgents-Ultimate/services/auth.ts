// Enhanced authentication and authorization service
import { User, Permission, RolePermissions, Role } from '../types';
import { securityValidation } from './validationService';

export interface SecurityContext {
  user: User;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  lastActivity: number;
  permissions: Set<Permission>;
}

export interface LoginAttempt {
  email: string;
  timestamp: number;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export class AuthService {
  private static instance: AuthService;
  private loginAttempts: Map<string, LoginAttempt[]> = new Map();
  private activeSessions: Map<string, SecurityContext> = new Map();
  private maxLoginAttempts = 5;
  private lockoutDuration = 15 * 60 * 1000; // 15 minutes
  private sessionTimeout = 30 * 60 * 1000; // 30 minutes

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Enhanced permission checking with context
  hasPermission(user: User | null, permission: Permission, context?: any): boolean {
    if (!user) {
      return false;
    }

    // Principal admin has all permissions
    if (user.role === Role.PRINCIPAL_ADMIN) {
      return true;
    }

    const userPermissions = RolePermissions[user.role];
    if (!userPermissions) {
      return false;
    }

    const hasBasePermission = userPermissions.has(permission);

    // Additional context-based checks
    if (hasBasePermission && context) {
      return this.checkContextualPermissions(user, permission, context);
    }

    return hasBasePermission;
  }

  // Check if user is locked out due to failed login attempts
  isAccountLocked(email: string): boolean {
    const attempts = this.loginAttempts.get(email) || [];
    const recentFailures = attempts.filter(attempt =>
      !attempt.success &&
      Date.now() - attempt.timestamp < this.lockoutDuration
    );

    return recentFailures.length >= this.maxLoginAttempts;
  }

  // Record login attempt
  recordLoginAttempt(email: string, success: boolean, metadata?: Partial<LoginAttempt>): void {
    const attempts = this.loginAttempts.get(email) || [];

    attempts.push({
      email,
      timestamp: Date.now(),
      success,
      ...metadata,
    });

    // Keep only recent attempts (last 24 hours)
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentAttempts = attempts.filter(attempt => attempt.timestamp > dayAgo);

    this.loginAttempts.set(email, recentAttempts);
  }

  // Clear account lockout - useful for development/demo purposes
  clearAccountLockout(email: string): void {
    this.loginAttempts.delete(email);
  }

  // Get lockout info for debugging
  getLockoutInfo(email: string): { isLocked: boolean; failedAttempts: number; lockoutExpiresAt?: number } {
    const attempts = this.loginAttempts.get(email) || [];
    const recentFailures = attempts.filter(attempt =>
      !attempt.success &&
      Date.now() - attempt.timestamp < this.lockoutDuration
    );
    
    const isLocked = recentFailures.length >= this.maxLoginAttempts;
    let lockoutExpiresAt: number | undefined;
    
    if (isLocked && recentFailures.length > 0) {
      const oldestFailure = recentFailures[0];
      lockoutExpiresAt = oldestFailure.timestamp + this.lockoutDuration;
    }
    
    return {
      isLocked,
      failedAttempts: recentFailures.length,
      lockoutExpiresAt
    };
  }

  // Validate password strength
  validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check against common passwords
    if (this.isCommonPassword(password)) {
      errors.push('Password is too common, please choose a more unique password');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Session management
  createSession(user: User, metadata?: Partial<SecurityContext>): string {
    const sessionId = this.generateSessionId();
    const permissions = new Set(RolePermissions[user.role] || []);

    const context: SecurityContext = {
      user,
      sessionId,
      lastActivity: Date.now(),
      permissions,
      ...metadata,
    };

    this.activeSessions.set(sessionId, context);

    // Cleanup expired sessions
    this.cleanupExpiredSessions();

    return sessionId;
  }

  validateSession(sessionId: string): SecurityContext | null {
    const session = this.activeSessions.get(sessionId);

    if (!session) {
      return null;
    }

    // Check if session has expired
    if (Date.now() - session.lastActivity > this.sessionTimeout) {
      this.activeSessions.delete(sessionId);
      return null;
    }

    // Update last activity
    session.lastActivity = Date.now();

    return session;
  }

  revokeSession(sessionId: string): boolean {
    return this.activeSessions.delete(sessionId);
  }

  revokeAllUserSessions(userId: string): number {
    let revokedCount = 0;

    for (const [sessionId, context] of this.activeSessions.entries()) {
      if (context.user.id === userId) {
        this.activeSessions.delete(sessionId);
        revokedCount++;
      }
    }

    return revokedCount;
  }

  // Security monitoring
  getSecurityMetrics() {
    const now = Date.now();
    const hourAgo = now - 60 * 60 * 1000;

    let totalAttempts = 0;
    let failedAttempts = 0;
    let lockedAccounts = 0;

    for (const attempts of this.loginAttempts.values()) {
      const recentAttempts = attempts.filter(a => a.timestamp > hourAgo);
      totalAttempts += recentAttempts.length;
      failedAttempts += recentAttempts.filter(a => !a.success).length;

      const recentFailures = recentAttempts.filter(a => !a.success);
      if (recentFailures.length >= this.maxLoginAttempts) {
        lockedAccounts++;
      }
    }

    return {
      activeSessions: this.activeSessions.size,
      totalLoginAttempts: totalAttempts,
      failedLoginAttempts: failedAttempts,
      lockedAccounts,
      successRate: totalAttempts > 0 ? ((totalAttempts - failedAttempts) / totalAttempts) * 100 : 100,
    };
  }

  // Private methods
  private checkContextualPermissions(user: User, permission: Permission, context: any): boolean {
    // Example: Users can only edit their own profile
    if (permission === Permission.MANAGE_TEAM && context.userId) {
      return user.id === context.userId || this.hasPermission(user, Permission.MANAGE_TEAM);
    }

    // Example: Project managers can only access their assigned projects
    if (permission === Permission.VIEW_ALL_PROJECTS && context.projectId) {
      // This would need to check project assignments in a real implementation
      return true;
    }

    return true;
  }

  private isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey',
    ];

    return commonPasswords.includes(password.toLowerCase());
  }

  private generateSessionId(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private cleanupExpiredSessions(): void {
    const now = Date.now();

    for (const [sessionId, context] of this.activeSessions.entries()) {
      if (now - context.lastActivity > this.sessionTimeout) {
        this.activeSessions.delete(sessionId);
      }
    }
  }
}

// Legacy function for backward compatibility
export const hasPermission = (user: User | null, permission: Permission): boolean => {
  return AuthService.getInstance().hasPermission(user, permission);
};

// Export singleton instance
export const authService = AuthService.getInstance();
