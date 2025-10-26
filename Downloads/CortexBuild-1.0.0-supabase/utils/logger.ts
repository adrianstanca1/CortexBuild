type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
  userId?: string;
  sessionId?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private sessionId: string;

  constructor() {
    this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private createLogEntry(level: LogLevel, message: string, context?: any, userId?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userId,
      sessionId: this.sessionId
    };
  }

  private log(level: LogLevel, message: string, context?: any, userId?: string) {
    const entry = this.createLogEntry(level, message, context, userId);

    // Add to internal logs array
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }

    // Console logging with appropriate level
    const logMessage = `[${entry.timestamp}] ${level.toUpperCase()}: ${message}`;
    const logData = context ? { context, userId, sessionId: this.sessionId } : { userId, sessionId: this.sessionId };

    switch (level) {
      case 'debug':
        console.debug(logMessage, logData);
        break;
      case 'info':
        console.info(logMessage, logData);
        break;
      case 'warn':
        console.warn(logMessage, logData);
        break;
      case 'error':
        console.error(logMessage, logData);
        break;
    }

    // In production, you might want to send logs to a service
    if (process.env.NODE_ENV === 'production') {
      // Send to logging service
      this.sendToLoggingService(entry);
    }
  }

  debug(message: string, context?: any, userId?: string) {
    this.log('debug', message, context, userId);
  }

  info(message: string, context?: any, userId?: string) {
    this.log('info', message, context, userId);
  }

  warn(message: string, context?: any, userId?: string) {
    this.log('warn', message, context, userId);
  }

  error(message: string, context?: any, userId?: string) {
    this.log('error', message, context, userId);
  }

  // User action logging
  logUserAction(action: string, details?: any, userId?: string) {
    this.info(`User Action: ${action}`, details, userId);
  }

  // API call logging
  logApiCall(endpoint: string, method: string, statusCode?: number, duration?: number, userId?: string) {
    const level = statusCode && statusCode >= 400 ? 'warn' : 'info';
    this.log(level, `API Call: ${method} ${endpoint}`, {
      statusCode,
      duration: duration ? `${duration}ms` : undefined
    }, userId);
  }

  // Error logging with stack trace
  logError(error: Error, context?: any, userId?: string) {
    this.error(`Error: ${error.message}`, {
      stack: error.stack,
      ...context
    }, userId);
  }

  // Performance logging
  logPerformance(operation: string, duration: number, context?: any, userId?: string) {
    const level = duration > 5000 ? 'warn' : 'debug'; // Warn if operation takes more than 5 seconds
    this.log(level, `Performance: ${operation}`, {
      duration: `${duration}ms`,
      ...context
    }, userId);
  }

  // Get recent logs
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Get logs by level
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  // Get logs by user
  getLogsByUser(userId: string): LogEntry[] {
    return this.logs.filter(log => log.userId === userId);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }

  // Export logs (for debugging)
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  private sendToLoggingService(entry: LogEntry) {
    // In a real application, you would send this to your logging service
    // For example: Sentry, LogRocket, DataDog, etc.
    try {
      // Placeholder for logging service integration
      // fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry)
      // });
    } catch (error) {
      console.error('Failed to send log to service:', error);
    }
  }
}

// Create singleton instance
export const logger = new Logger();

// Convenience functions
export const logUserAction = (action: string, details?: any, userId?: string) =>
  logger.logUserAction(action, details, userId);

export const logApiCall = (endpoint: string, method: string, statusCode?: number, duration?: number, userId?: string) =>
  logger.logApiCall(endpoint, method, statusCode, duration, userId);

export const logError = (error: Error, context?: any, userId?: string) =>
  logger.logError(error, context, userId);

export const logPerformance = (operation: string, duration: number, context?: any, userId?: string) =>
  logger.logPerformance(operation, duration, context, userId);