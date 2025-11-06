import fs from 'fs';
import path from 'path';

/**
 * Simple Logger Utility
 * Lightweight alternative to Winston for CortexBuild
 * Provides console + file logging with rotation
 */

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  stack?: string;
}

class Logger {
  private logDir: string;
  private maxLogSize: number = 10 * 1024 * 1024; // 10MB
  private maxLogFiles: number = 5;
  private isDevelopment: boolean;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.ensureLogDirectory();
  }

  /**
   * Ensure logs directory exists
   */
  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Format log entry for console output
   */
  private formatConsoleLog(entry: LogEntry): string {
    const colors = {
      ERROR: '\x1b[31m', // Red
      WARN: '\x1b[33m',  // Yellow
      INFO: '\x1b[36m',  // Cyan
      DEBUG: '\x1b[90m', // Gray
      RESET: '\x1b[0m',
    };

    const color = colors[entry.level] || colors.RESET;
    const reset = colors.RESET;

    let log = `${color}[${entry.timestamp}] ${entry.level}${reset}: ${entry.message}`;

    if (entry.data && Object.keys(entry.data).length > 0) {
      log += `\n${JSON.stringify(entry.data, null, 2)}`;
    }

    if (entry.stack) {
      log += `\n${entry.stack}`;
    }

    return log;
  }

  /**
   * Format log entry for file output
   */
  private formatFileLog(entry: LogEntry): string {
    return JSON.stringify(entry) + '\n';
  }

  /**
   * Get current log file path
   */
  private getLogFilePath(): string {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return path.join(this.logDir, `cortexbuild-${date}.log`);
  }

  /**
   * Rotate log files if current file is too large
   */
  private rotateLogsIfNeeded(): void {
    const currentLogPath = this.getLogFilePath();

    try {
      if (fs.existsSync(currentLogPath)) {
        const stats = fs.statSync(currentLogPath);

        if (stats.size > this.maxLogSize) {
          // Rename current log with timestamp
          const timestamp = Date.now();
          const rotatedPath = currentLogPath.replace('.log', `.${timestamp}.log`);
          fs.renameSync(currentLogPath, rotatedPath);

          // Clean up old log files
          this.cleanupOldLogs();
        }
      }
    } catch (err) {
      console.error('Error rotating logs:', err);
    }
  }

  /**
   * Clean up old log files (keep only maxLogFiles)
   */
  private cleanupOldLogs(): void {
    try {
      const files = fs.readdirSync(this.logDir)
        .filter(file => file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(this.logDir, file),
          time: fs.statSync(path.join(this.logDir, file)).mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time);

      // Delete files beyond maxLogFiles limit
      files.slice(this.maxLogFiles).forEach(file => {
        fs.unlinkSync(file.path);
      });
    } catch (err) {
      console.error('Error cleaning up old logs:', err);
    }
  }

  /**
   * Write log entry to file
   */
  private writeToFile(entry: LogEntry): void {
    // Skip file logging in development (console only)
    if (this.isDevelopment && entry.level === LogLevel.DEBUG) {
      return;
    }

    try {
      this.rotateLogsIfNeeded();
      const logPath = this.getLogFilePath();
      const formattedLog = this.formatFileLog(entry);
      fs.appendFileSync(logPath, formattedLog);
    } catch (err) {
      console.error('Failed to write log to file:', err);
    }
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: this.sanitizeData(data),
    };

    // Extract stack trace if data is an Error
    if (data instanceof Error) {
      entry.stack = data.stack;
      entry.data = {
        name: data.name,
        message: data.message,
        ...entry.data,
      };
    }

    // Console output
    console.log(this.formatConsoleLog(entry));

    // File output (production only for DEBUG, always for others)
    if (!this.isDevelopment || level !== LogLevel.DEBUG) {
      this.writeToFile(entry);
    }
  }

  /**
   * Sanitize sensitive data before logging
   */
  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = { ...data };
    const sensitiveKeys = [
      'password',
      'token',
      'apiKey',
      'api_key',
      'secret',
      'authorization',
      'cookie',
      'session',
    ];

    for (const key in sanitized) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        sanitized[key] = '***REDACTED***';
      }
    }

    return sanitized;
  }

  /**
   * Public logging methods
   */
  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * HTTP Request Logger Middleware
   * Use this in Express app for request logging
   */
  httpLogger() {
    return (req: any, res: any, next: any) => {
      const start = Date.now();

      // Log request
      this.info(`${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        userId: req.user?.id || 'anonymous',
      });

      // Log response
      res.on('finish', () => {
        const duration = Date.now() - start;
        const level = res.statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;

        this.log(
          level,
          `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
          {
            statusCode: res.statusCode,
            duration,
            userId: req.user?.id || 'anonymous',
          }
        );
      });

      next();
    };
  }

  /**
   * Get log file contents (for admin dashboard)
   */
  getRecentLogs(lines: number = 100): string[] {
    try {
      const logPath = this.getLogFilePath();
      if (!fs.existsSync(logPath)) {
        return [];
      }

      const content = fs.readFileSync(logPath, 'utf-8');
      const allLines = content.split('\n').filter(line => line.trim());
      return allLines.slice(-lines);
    } catch (err) {
      this.error('Failed to read log file', err);
      return [];
    }
  }

  /**
   * Clear all logs (for admin cleanup)
   */
  clearLogs(): void {
    try {
      const files = fs.readdirSync(this.logDir);
      files.forEach(file => {
        if (file.endsWith('.log')) {
          fs.unlinkSync(path.join(this.logDir, file));
        }
      });
      this.info('All logs cleared');
    } catch (err) {
      this.error('Failed to clear logs', err);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

/**
 * Usage Examples:
 * 
 * 1. Basic logging:
 *    logger.info('Server started on port 3001');
 *    logger.error('Database connection failed', { error: err });
 * 
 * 2. HTTP request logging (in Express app):
 *    app.use(logger.httpLogger());
 * 
 * 3. Error logging:
 *    try {
 *      // risky operation
 *    } catch (err) {
 *      logger.error('Operation failed', err);
 *    }
 * 
 * 4. Debug logging (development only):
 *    logger.debug('Query executed', { query, params, duration });
 * 
 * 5. Get recent logs (admin dashboard):
 *    const logs = logger.getRecentLogs(50);
 */
