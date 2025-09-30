// Security utilities for the ASAgents platform

// Content Security Policy headers
export const getCSPHeaders = (): Record<string, string> => {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' ws: wss:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
};

// Password hashing and verification
export const hashPassword = async (password: string): Promise<string> => {
  // In a real application, use bcrypt or similar
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'salt'); // Use proper salt in production
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const hashedPassword = await hashPassword(password);
  return hashedPassword === hash;
};

// JWT token utilities (simplified - use proper JWT library in production)
export const createJWTToken = (payload: any, secret: string, expiresIn: number = 3600): string => {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn,
  };

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(tokenPayload));
  const signature = btoa(`${encodedHeader}.${encodedPayload}.${secret}`); // Simplified

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

export const verifyJWTToken = (token: string, secret: string): any | null => {
  try {
    const [header, payload, signature] = token.split('.');
    const expectedSignature = btoa(`${header}.${payload}.${secret}`);
    
    if (signature !== expectedSignature) {
      return null;
    }

    const decodedPayload = JSON.parse(atob(payload));
    const now = Math.floor(Date.now() / 1000);

    if (decodedPayload.exp && decodedPayload.exp < now) {
      return null; // Token expired
    }

    return decodedPayload;
  } catch {
    return null;
  }
};

// Input sanitization for XSS prevention
export const sanitizeForXSS = (input: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return input.replace(/[&<>"'/]/g, (s) => map[s]);
};

// SQL injection prevention helpers
export const escapeSQLString = (input: string): string => {
  return input.replace(/'/g, "''").replace(/\\/g, '\\\\');
};

export const validateSQLIdentifier = (identifier: string): boolean => {
  // Only allow alphanumeric characters and underscores
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier);
};

// CSRF protection
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const validateCSRFToken = (token: string, sessionToken: string): boolean => {
  return token === sessionToken && token.length === 64;
};

// Session management
export interface SessionData {
  userId: string;
  email: string;
  role: string;
  tenantId: number;
  loginTime: number;
  lastActivity: number;
  ipAddress: string;
  userAgent: string;
}

export class SessionManager {
  private sessions = new Map<string, SessionData>();
  private readonly sessionTimeout = 30 * 60 * 1000; // 30 minutes

  createSession(sessionId: string, data: Omit<SessionData, 'loginTime' | 'lastActivity'>): void {
    const now = Date.now();
    this.sessions.set(sessionId, {
      ...data,
      loginTime: now,
      lastActivity: now,
    });
  }

  getSession(sessionId: string): SessionData | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const now = Date.now();
    if (now - session.lastActivity > this.sessionTimeout) {
      this.sessions.delete(sessionId);
      return null;
    }

    // Update last activity
    session.lastActivity = now;
    return session;
  }

  updateSession(sessionId: string, updates: Partial<SessionData>): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    Object.assign(session, updates, { lastActivity: Date.now() });
    return true;
  }

  destroySession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.sessionTimeout) {
        this.sessions.delete(sessionId);
      }
    }
  }

  getAllSessions(): SessionData[] {
    return Array.from(this.sessions.values());
  }

  getSessionsByUser(userId: string): SessionData[] {
    return Array.from(this.sessions.values()).filter(s => s.userId === userId);
  }

  destroyUserSessions(userId: string): void {
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

// Rate limiting
export class RateLimiter {
  private requests = new Map<string, number[]>();

  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }
    
    const userRequests = this.requests.get(identifier)!;
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart);
    
    if (validRequests.length >= this.maxRequests) {
      return false; // Rate limit exceeded
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true; // Request allowed
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      return this.maxRequests;
    }
    
    const userRequests = this.requests.get(identifier)!;
    const validRequests = userRequests.filter(time => time > windowStart);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    for (const [identifier, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => time > windowStart);
      if (validRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validRequests);
      }
    }
  }
}

// IP address validation and filtering
export const isValidIPAddress = (ip: string): boolean => {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

export const isIPInRange = (ip: string, cidr: string): boolean => {
  const [network, prefixLength] = cidr.split('/');
  const prefix = parseInt(prefixLength, 10);
  
  // Simplified IPv4 CIDR check
  const ipParts = ip.split('.').map(Number);
  const networkParts = network.split('.').map(Number);
  
  const ipInt = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
  const networkInt = (networkParts[0] << 24) + (networkParts[1] << 16) + (networkParts[2] << 8) + networkParts[3];
  
  const mask = ~((1 << (32 - prefix)) - 1);
  
  return (ipInt & mask) === (networkInt & mask);
};

export const isIPWhitelisted = (ip: string, whitelist: string[]): boolean => {
  if (whitelist.length === 0) return true; // No restrictions
  
  return whitelist.some(entry => {
    if (entry.includes('/')) {
      return isIPInRange(ip, entry);
    }
    return ip === entry;
  });
};

// Audit logging
export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
}

export class AuditLogger {
  private logs: AuditLogEntry[] = [];

  log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    const auditEntry: AuditLogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...entry,
    };
    
    this.logs.push(auditEntry);
    
    // In production, send to external logging service
    console.log('AUDIT:', auditEntry);
  }

  getLogs(filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    success?: boolean;
  }): AuditLogEntry[] {
    let filteredLogs = this.logs;

    if (filters) {
      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
      }
      if (filters.action) {
        filteredLogs = filteredLogs.filter(log => log.action === filters.action);
      }
      if (filters.resource) {
        filteredLogs = filteredLogs.filter(log => log.resource === filters.resource);
      }
      if (filters.startDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!);
      }
      if (filters.success !== undefined) {
        filteredLogs = filteredLogs.filter(log => log.success === filters.success);
      }
    }

    return filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  clearLogs(): void {
    this.logs = [];
  }
}

// Security headers middleware
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// File upload security
export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 10MB limit' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'txt', 'xls', 'xlsx'];
  
  if (!extension || !allowedExtensions.includes(extension)) {
    return { valid: false, error: 'File extension not allowed' };
  }

  return { valid: true };
};

// Create singleton instances
export const sessionManager = new SessionManager();
export const auditLogger = new AuditLogger();
export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
export const apiRateLimiter = new RateLimiter(100, 60 * 1000); // 100 requests per minute
