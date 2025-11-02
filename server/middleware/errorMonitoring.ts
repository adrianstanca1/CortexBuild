// Error Monitoring Middleware for CortexBuild
// Comprehensive error tracking and logging system

import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

interface ErrorLog {
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  url?: string;
  method?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
}

class ErrorMonitor {
  private logFile: string;
  private errorCounts: Map<string, number> = new Map();
  private lastErrors: ErrorLog[] = [];
  private maxLogSize = 1000; // Keep last 1000 errors in memory

  constructor() {
    this.logFile = path.join(process.cwd(), 'logs', 'errors.log');
    this.ensureLogDirectory();
  }

  private ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  logError(error: Error | string, req?: Request, level: 'error' | 'warning' | 'info' = 'error') {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      level,
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      url: req?.url,
      method: req?.method,
      userId: (req as any)?.user?.id,
      ip: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.get('User-Agent')
    };

    // Add to memory
    this.lastErrors.unshift(errorLog);
    if (this.lastErrors.length > this.maxLogSize) {
      this.lastErrors.pop();
    }

    // Update error counts
    const errorKey = errorLog.message.substring(0, 100);
    this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);

    // Write to file
    this.writeToFile(errorLog);

    // Console output with colors
    const color = level === 'error' ? '\x1b[31m' : level === 'warning' ? '\x1b[33m' : '\x1b[36m';
    const reset = '\x1b[0m';
    console.log(`${color}[${level.toUpperCase()}]${reset} ${errorLog.message}`);
    
    if (errorLog.stack && level === 'error') {
      console.log(`${color}Stack:${reset} ${errorLog.stack}`);
    }
  }

  getLogFilePath(): string {
    return this.logFile;
  }

  private writeToFile(errorLog: ErrorLog) {
    try {
      const logLine = JSON.stringify(errorLog) + '\n';
      fs.appendFileSync(this.logFile, logLine);
    } catch (err) {
      console.error('Failed to write to error log:', err);
    }
  }

  getErrorStats() {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    const oneDayAgo = now - 86400000;

    const recentErrors = this.lastErrors.filter(
      log => new Date(log.timestamp).getTime() > oneHourAgo
    );

    const dailyErrors = this.lastErrors.filter(
      log => new Date(log.timestamp).getTime() > oneDayAgo
    );

    return {
      totalErrors: this.lastErrors.length,
      errorsLastHour: recentErrors.length,
      errorsLastDay: dailyErrors.length,
      topErrors: Array.from(this.errorCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([message, count]) => ({ message, count })),
      recentErrors: this.lastErrors.slice(0, 20)
    };
  }

  clearOldLogs() {
    // Keep only last 24 hours of logs
    const oneDayAgo = Date.now() - 86400000;
    this.lastErrors = this.lastErrors.filter(
      log => new Date(log.timestamp).getTime() > oneDayAgo
    );
  }
}

// Global error monitor instance
export const errorMonitor = new ErrorMonitor();

// Express error handling middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  errorMonitor.logError(err, req, 'error');

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const statusCode = (err as any).statusCode || 500;
  
  res.status(statusCode).json({
    error: isDevelopment ? err.message : 'Internal server error',
    timestamp: new Date().toISOString(),
    ...(isDevelopment && { stack: err.stack })
  });
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warning' : 'info';
    
    if (res.statusCode >= 400) {
      errorMonitor.logError(
        `${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`,
        req,
        level
      );
    }
  });
  
  next();
};

// Health check endpoint for error monitoring
export const getErrorStats = (req: Request, res: Response) => {
  const stats = errorMonitor.getErrorStats();
  res.json({
    status: 'ok',
    errorMonitoring: {
      ...stats,
      logFile: errorMonitor.getLogFilePath(),
      timestamp: new Date().toISOString()
    }
  });
};

// Cleanup function to run periodically
setInterval(() => {
  errorMonitor.clearOldLogs();
}, 3600000); // Run every hour
