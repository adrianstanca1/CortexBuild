/**
 * Structured Logging Middleware
 */

export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR'
}

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: Record<string, any>;
    error?: {
        message: string;
        stack?: string;
    };
}

class Logger {
    private formatLog(entry: LogEntry): string {
        return JSON.stringify({
            ...entry,
            timestamp: new Date().toISOString()
        });
    }

    debug(message: string, context?: Record<string, any>) {
        if (process.env.NODE_ENV === 'development') {
            console.log(this.formatLog({ timestamp: '', level: LogLevel.DEBUG, message, context }));
        }
    }

    info(message: string, context?: Record<string, any>) {
        console.log(this.formatLog({ timestamp: '', level: LogLevel.INFO, message, context }));
    }

    warn(message: string, context?: Record<string, any>) {
        console.warn(this.formatLog({ timestamp: '', level: LogLevel.WARN, message, context }));
    }

    error(message: string, error?: Error, context?: Record<string, any>) {
        console.error(this.formatLog({
            timestamp: '',
            level: LogLevel.ERROR,
            message,
            context,
            error: error ? {
                message: error.message,
                stack: error.stack
            } : undefined
        }));
    }
}

export const logger = new Logger();

// Request logging helper
export function logRequest(method: string, path: string, context?: Record<string, any>) {
    logger.info(`${method} ${path}`, context);
}

// Response logging helper
export function logResponse(method: string, path: string, status: number, duration: number) {
    logger.info(`${method} ${path} - ${status}`, { duration: `${duration}ms` });
}

