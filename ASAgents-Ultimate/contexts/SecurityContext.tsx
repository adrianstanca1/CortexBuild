import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '../types';
import { 
  sessionManager, 
  auditLogger, 
  loginRateLimiter, 
  apiRateLimiter,
  generateCSRFToken,
  validateCSRFToken,
  type SessionData 
} from '../utils/security';

interface SecurityContextType {
  // Session management
  currentSession: SessionData | null;
  isAuthenticated: boolean;
  csrfToken: string;
  
  // Rate limiting
  checkLoginRateLimit: (identifier: string) => boolean;
  checkApiRateLimit: (identifier: string) => boolean;
  
  // CSRF protection
  validateCSRF: (token: string) => boolean;
  refreshCSRFToken: () => void;
  
  // Audit logging
  logAction: (action: string, resource: string, details?: any, success?: boolean) => void;
  
  // Security monitoring
  securityAlerts: SecurityAlert[];
  dismissAlert: (id: string) => void;
  
  // Session management
  createSession: (user: User, ipAddress: string, userAgent: string) => string;
  destroySession: () => void;
  refreshSession: () => void;
  
  // IP filtering
  isIPAllowed: (ip: string) => boolean;
  
  // Security settings
  securitySettings: SecuritySettings;
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => void;
}

interface SecurityAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  dismissed: boolean;
}

interface SecuritySettings {
  sessionTimeout: number;
  maxLoginAttempts: number;
  requireTwoFactor: boolean;
  ipWhitelist: string[];
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
  };
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within a SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: React.ReactNode;
  user?: User;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children, user }) => {
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const [csrfToken, setCsrfToken] = useState<string>(generateCSRFToken());
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    maxLoginAttempts: 5,
    requireTwoFactor: false,
    ipWhitelist: [],
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: false,
    },
  });

  // Get client IP address (simplified - in production, use proper IP detection)
  const getClientIP = useCallback((): string => {
    // In a real application, this would come from the server
    return '127.0.0.1';
  }, []);

  // Get user agent
  const getUserAgent = useCallback((): string => {
    return navigator.userAgent;
  }, []);

  // Create a new session
  const createSession = useCallback((user: User, ipAddress: string, userAgent: string): string => {
    const sessionId = crypto.randomUUID();
    const sessionData: Omit<SessionData, 'loginTime' | 'lastActivity'> = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      ipAddress,
      userAgent,
    };

    sessionManager.createSession(sessionId, sessionData);
    const session = sessionManager.getSession(sessionId);
    setCurrentSession(session);

    // Log successful login
    auditLogger.log({
      userId: user.id,
      action: 'login',
      resource: 'session',
      details: { ipAddress, userAgent },
      ipAddress,
      userAgent,
      success: true,
    });

    return sessionId;
  }, []);

  // Destroy current session
  const destroySession = useCallback(() => {
    if (currentSession) {
      auditLogger.log({
        userId: currentSession.userId,
        action: 'logout',
        resource: 'session',
        details: {},
        ipAddress: currentSession.ipAddress,
        userAgent: currentSession.userAgent,
        success: true,
      });

      sessionManager.destroySession(currentSession.userId);
      setCurrentSession(null);
    }
  }, [currentSession]);

  // Refresh current session
  const refreshSession = useCallback(() => {
    if (currentSession) {
      const updated = sessionManager.getSession(currentSession.userId);
      setCurrentSession(updated);
    }
  }, [currentSession]);

  // Check login rate limit
  const checkLoginRateLimit = useCallback((identifier: string): boolean => {
    const allowed = loginRateLimiter.isAllowed(identifier);
    if (!allowed) {
      addSecurityAlert('warning', 'Rate Limit Exceeded', 'Too many login attempts. Please try again later.');
    }
    return allowed;
  }, []);

  // Check API rate limit
  const checkApiRateLimit = useCallback((identifier: string): boolean => {
    return apiRateLimiter.isAllowed(identifier);
  }, []);

  // Validate CSRF token
  const validateCSRF = useCallback((token: string): boolean => {
    return validateCSRFToken(token, csrfToken);
  }, [csrfToken]);

  // Refresh CSRF token
  const refreshCSRFToken = useCallback(() => {
    setCsrfToken(generateCSRFToken());
  }, []);

  // Log security action
  const logAction = useCallback((
    action: string, 
    resource: string, 
    details: any = {}, 
    success: boolean = true
  ) => {
    if (currentSession) {
      auditLogger.log({
        userId: currentSession.userId,
        action,
        resource,
        details,
        ipAddress: currentSession.ipAddress,
        userAgent: currentSession.userAgent,
        success,
      });
    }
  }, [currentSession]);

  // Add security alert
  const addSecurityAlert = useCallback((
    type: SecurityAlert['type'], 
    title: string, 
    message: string
  ) => {
    const alert: SecurityAlert = {
      id: crypto.randomUUID(),
      type,
      title,
      message,
      timestamp: new Date(),
      dismissed: false,
    };
    setSecurityAlerts(prev => [alert, ...prev]);
  }, []);

  // Dismiss security alert
  const dismissAlert = useCallback((id: string) => {
    setSecurityAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, dismissed: true } : alert
    ));
  }, []);

  // Check if IP is allowed
  const isIPAllowed = useCallback((ip: string): boolean => {
    if (securitySettings.ipWhitelist.length === 0) return true;
    
    return securitySettings.ipWhitelist.some(allowedIP => {
      if (allowedIP.includes('/')) {
        // CIDR notation - simplified check
        const [network, prefix] = allowedIP.split('/');
        // In production, use proper CIDR matching
        return ip.startsWith(network.split('.').slice(0, parseInt(prefix) / 8).join('.'));
      }
      return ip === allowedIP;
    });
  }, [securitySettings.ipWhitelist]);

  // Update security settings
  const updateSecuritySettings = useCallback((settings: Partial<SecuritySettings>) => {
    setSecuritySettings(prev => ({ ...prev, ...settings }));
    
    if (currentSession) {
      logAction('update_security_settings', 'settings', settings);
    }
  }, [currentSession, logAction]);

  // Monitor for security threats
  useEffect(() => {
    const interval = setInterval(() => {
      // Clean up expired sessions
      sessionManager.cleanupExpiredSessions();
      
      // Clean up rate limiters
      loginRateLimiter.cleanup();
      apiRateLimiter.cleanup();
      
      // Check for suspicious activity
      const recentLogs = auditLogger.getLogs({
        startDate: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
      });
      
      const failedLogins = recentLogs.filter(log => 
        log.action === 'login' && !log.success
      ).length;
      
      if (failedLogins > 10) {
        addSecurityAlert(
          'warning', 
          'Suspicious Activity Detected', 
          `${failedLogins} failed login attempts in the last 5 minutes`
        );
      }
      
      // Check for multiple sessions from same user
      if (currentSession) {
        const userSessions = sessionManager.getSessionsByUser(currentSession.userId);
        if (userSessions.length > 3) {
          addSecurityAlert(
            'info',
            'Multiple Sessions Detected',
            `You have ${userSessions.length} active sessions`
          );
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [currentSession, addSecurityAlert]);

  // Initialize session if user is provided
  useEffect(() => {
    if (user && !currentSession) {
      const ip = getClientIP();
      const userAgent = getUserAgent();
      
      if (isIPAllowed(ip)) {
        createSession(user, ip, userAgent);
      } else {
        addSecurityAlert('error', 'Access Denied', 'Your IP address is not allowed');
      }
    }
  }, [user, currentSession, createSession, getClientIP, getUserAgent, isIPAllowed, addSecurityAlert]);

  // Refresh CSRF token periodically
  useEffect(() => {
    const interval = setInterval(refreshCSRFToken, 15 * 60 * 1000); // Every 15 minutes
    return () => clearInterval(interval);
  }, [refreshCSRFToken]);

  const value: SecurityContextType = {
    currentSession,
    isAuthenticated: !!currentSession,
    csrfToken,
    checkLoginRateLimit,
    checkApiRateLimit,
    validateCSRF,
    refreshCSRFToken,
    logAction,
    securityAlerts: securityAlerts.filter(alert => !alert.dismissed),
    dismissAlert,
    createSession,
    destroySession,
    refreshSession,
    isIPAllowed,
    securitySettings,
    updateSecuritySettings,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};
