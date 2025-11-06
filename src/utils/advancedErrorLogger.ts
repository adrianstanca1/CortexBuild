/**
 * Advanced Error Logger
 * Comprehensive error logging with categorization, deduplication, and rich context
 */

import {
    ErrorSeverity,
    ErrorCategory,
    CategorizedError,
    AggregatedError,
    ErrorContext,
    ErrorLogEntry,
    ErrorStatistics,
    LoggerConfig,
    Breadcrumb,
    ErrorRecoveryAction
} from '../types/errorTypes';
import { loggingConfig } from '../config/logging.config';

/**
 * Advanced Error Logger Class
 */
export class AdvancedErrorLogger {
    private static instance: AdvancedErrorLogger;
    private config: LoggerConfig;
    private errors: Map<string, CategorizedError> = new Map();
    private aggregatedErrors: Map<string, AggregatedError> = new Map();
    private breadcrumbs: Breadcrumb[] = [];
    private sessionId: string;

    private constructor(config?: Partial<LoggerConfig>) {
        this.config = {
            enabled: true,
            captureConsole: true,
            captureBreadcrumbs: true,
            capturePerformance: true,
            captureNetwork: true,
            maxBreadcrumbs: 50,
            maxErrors: 100,
            maxAggregatedErrors: 50,
            sampleRate: 1.0,
            sanitizeData: true,
            allowedKeys: [],
            blockedKeys: ['password', 'token', 'secret', 'apiKey', 'creditCard'],
            debounceMs: 100,
            batchSize: 10,
            environment: import.meta.env.DEV ? 'development' : 'production',
            ...config
        };

        this.sessionId = this.generateSessionId();
        this.setupConsoleCapture();
    }

    /**
     * Get singleton instance
     */
    public static getInstance(config?: Partial<LoggerConfig>): AdvancedErrorLogger {
        if (!AdvancedErrorLogger.instance) {
            AdvancedErrorLogger.instance = new AdvancedErrorLogger(config);
        }
        return AdvancedErrorLogger.instance;
    }

    /**
     * Log an error with full context
     */
    public logError(
        error: Error,
        context?: Partial<ErrorContext>,
        severity?: ErrorSeverity,
        category?: ErrorCategory
    ): string {
        if (!this.config.enabled) return '';

        // Sample rate check
        if (Math.random() > this.config.sampleRate) return '';

        // Categorize error
        const categorizedError = this.categorizeError(error, context, severity, category);

        // Store error
        this.errors.set(categorizedError.errorId, categorizedError);

        // Aggregate error
        this.aggregateError(categorizedError);

        // Log to console (development)
        if (this.config.environment === 'development') {
            this.logToConsole(categorizedError);
        }

        // Send to logging service (production)
        if (this.config.environment === 'production') {
            this.sendToLoggingService(categorizedError);
        }

        // Cleanup old errors
        this.cleanup();

        return categorizedError.errorId;
    }

    /**
     * Add breadcrumb (user action tracking)
     */
    public addBreadcrumb(breadcrumb: Breadcrumb): void {
        if (!this.config.captureBreadcrumbs) return;

        this.breadcrumbs.push({
            ...breadcrumb,
            timestamp: new Date().toISOString()
        });

        // Keep only last N breadcrumbs
        if (this.breadcrumbs.length > this.config.maxBreadcrumbs) {
            this.breadcrumbs.shift();
        }
    }

    /**
     * Log error recovery action
     */
    public logRecovery(errorId: string, action: ErrorRecoveryAction): void {
        const error = this.errors.get(errorId);
        if (!error) return;

        error.recovered = action.success;
        error.recoveryAttempts = (error.recoveryAttempts || 0) + 1;
        if (action.success) {
            error.recoveryTime = action.duration;
        }

        // Update aggregated error
        const signature = this.getErrorSignature(error);
        const aggregated = this.aggregatedErrors.get(signature);
        if (aggregated && action.success) {
            const totalRecoveries = aggregated.count * aggregated.recoveryRate + 1;
            aggregated.recoveryRate = totalRecoveries / (aggregated.count + 1);
            aggregated.averageRecoveryTime = 
                (aggregated.averageRecoveryTime * (aggregated.count - 1) + action.duration) / aggregated.count;
        }
    }

    /**
     * Get error statistics
     */
    public getStatistics(): ErrorStatistics {
        const errors = Array.from(this.errors.values());
        const aggregated = Array.from(this.aggregatedErrors.values());

        const errorsBySeverity = errors.reduce((acc, err) => {
            acc[err.severity] = (acc[err.severity] || 0) + 1;
            return acc;
        }, {} as Record<ErrorSeverity, number>);

        const errorsByCategory = errors.reduce((acc, err) => {
            acc[err.category] = (acc[err.category] || 0) + 1;
            return acc;
        }, {} as Record<ErrorCategory, number>);

        const affectedUsers = new Set(errors.map(e => e.context.userId).filter(Boolean));
        const affectedSessions = new Set(errors.map(e => e.context.sessionId));

        const recoveredErrors = errors.filter(e => e.recovered);
        const recoveryRate = errors.length > 0 ? recoveredErrors.length / errors.length : 0;
        const averageRecoveryTime = recoveredErrors.length > 0
            ? recoveredErrors.reduce((sum, e) => sum + (e.recoveryTime || 0), 0) / recoveredErrors.length
            : 0;

        return {
            totalErrors: errors.length,
            errorsBySeverity,
            errorsByCategory,
            uniqueErrors: aggregated.length,
            affectedUsers: affectedUsers.size,
            affectedSessions: affectedSessions.size,
            averageRecoveryTime,
            recoveryRate,
            topErrors: aggregated.sort((a, b) => b.count - a.count).slice(0, 10),
            recentErrors: errors.slice(-20)
        };
    }

    /**
     * Get breadcrumbs
     */
    public getBreadcrumbs(): Breadcrumb[] {
        return [...this.breadcrumbs];
    }

    /**
     * Clear all errors
     */
    public clear(): void {
        this.errors.clear();
        this.aggregatedErrors.clear();
        this.breadcrumbs = [];
    }

    /**
     * Categorize error
     */
    private categorizeError(
        error: Error,
        context?: Partial<ErrorContext>,
        severity?: ErrorSeverity,
        category?: ErrorCategory
    ): CategorizedError {
        const errorId = this.generateErrorId();
        const timestamp = new Date().toISOString();

        // Auto-detect severity if not provided
        const detectedSeverity = severity || this.detectSeverity(error);

        // Auto-detect category if not provided
        const detectedCategory = category || this.detectCategory(error);

        // Build full context
        const fullContext: ErrorContext = {
            sessionId: this.sessionId,
            userId: context?.userId,
            userEmail: context?.userEmail,
            userRole: context?.userRole,
            browser: context?.browser || this.getBrowserInfo(),
            appState: context?.appState || this.getAppState(),
            breadcrumbs: this.getBreadcrumbs(),
            performance: context?.performance || {},
            network: context?.network || this.getNetworkInfo(),
            timestamp,
            custom: context?.custom
        };

        return {
            name: error.name,
            message: error.message,
            stack: error.stack,
            severity: detectedSeverity,
            category: detectedCategory,
            context: fullContext,
            errorId,
            timestamp,
            count: 1,
            recovered: false,
            recoveryAttempts: 0
        };
    }

    /**
     * Aggregate similar errors
     */
    private aggregateError(error: CategorizedError): void {
        const signature = this.getErrorSignature(error);
        const existing = this.aggregatedErrors.get(signature);

        if (existing) {
            existing.count++;
            existing.lastOccurrence = error.timestamp;
            existing.lastContext = error.context;
            existing.affectedUsers.add(error.context.userId || 'anonymous');
            existing.affectedSessions.add(error.context.sessionId);
        } else {
            this.aggregatedErrors.set(signature, {
                signature,
                name: error.name,
                message: error.message,
                stack: error.stack,
                severity: error.severity,
                category: error.category,
                count: 1,
                firstOccurrence: error.timestamp,
                lastOccurrence: error.timestamp,
                affectedUsers: new Set([error.context.userId || 'anonymous']),
                affectedSessions: new Set([error.context.sessionId]),
                firstContext: error.context,
                lastContext: error.context,
                recoveryRate: 0,
                averageRecoveryTime: 0
            });
        }

        // Cleanup old aggregated errors
        if (this.aggregatedErrors.size > this.config.maxAggregatedErrors) {
            const oldest = Array.from(this.aggregatedErrors.entries())
                .sort((a, b) => a[1].lastOccurrence.localeCompare(b[1].lastOccurrence))[0];
            this.aggregatedErrors.delete(oldest[0]);
        }
    }

    /**
     * Get error signature for grouping
     */
    private getErrorSignature(error: CategorizedError): string {
        // Use error name, message (first 100 chars), and first stack line
        const stackLine = error.stack?.split('\n')[1]?.trim() || '';
        return `${error.name}:${error.message.substring(0, 100)}:${stackLine}`;
    }

    /**
     * Detect error severity
     */
    private detectSeverity(error: Error): ErrorSeverity {
        const message = error.message.toLowerCase();
        const name = error.name.toLowerCase();

        // Critical errors
        if (name.includes('security') || message.includes('security')) {
            return ErrorSeverity.CRITICAL;
        }
        if (message.includes('crash') || message.includes('fatal')) {
            return ErrorSeverity.CRITICAL;
        }

        // High severity
        if (name.includes('syntax') || name.includes('reference')) {
            return ErrorSeverity.HIGH;
        }
        if (message.includes('failed') || message.includes('error')) {
            return ErrorSeverity.HIGH;
        }

        // Medium severity
        if (message.includes('warning') || message.includes('deprecated')) {
            return ErrorSeverity.MEDIUM;
        }

        // Default to medium
        return ErrorSeverity.MEDIUM;
    }

    /**
     * Detect error category
     */
    private detectCategory(error: Error): ErrorCategory {
        const message = error.message.toLowerCase();
        const name = error.name.toLowerCase();

        if (name.includes('network') || message.includes('network') || message.includes('fetch')) {
            return ErrorCategory.NETWORK;
        }
        if (name.includes('auth') || message.includes('auth') || message.includes('unauthorized')) {
            return ErrorCategory.AUTH;
        }
        if (message.includes('validation') || message.includes('invalid')) {
            return ErrorCategory.VALIDATION;
        }
        if (message.includes('database') || message.includes('sql')) {
            return ErrorCategory.DATABASE;
        }
        if (message.includes('api') || message.includes('endpoint')) {
            return ErrorCategory.API;
        }
        if (name.includes('render') || message.includes('component')) {
            return ErrorCategory.UI;
        }

        return ErrorCategory.UNKNOWN;
    }

    /**
     * Get browser info
     */
    private getBrowserInfo() {
        const ua = navigator.userAgent;
        return {
            name: this.detectBrowser(ua),
            version: this.detectBrowserVersion(ua),
            os: this.detectOS(ua),
            osVersion: '',
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            cookiesEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack === '1'
        };
    }

    /**
     * Get app state
     */
    private getAppState() {
        return {
            route: window.location.pathname,
            component: undefined,
            props: undefined,
            state: undefined,
            localStorage: this.config.sanitizeData ? {} : this.getLocalStorage(),
            sessionStorage: this.config.sanitizeData ? {} : this.getSessionStorage()
        };
    }

    /**
     * Get network info
     */
    private getNetworkInfo() {
        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
        return {
            online: navigator.onLine,
            effectiveType: connection?.effectiveType,
            downlink: connection?.downlink,
            rtt: connection?.rtt,
            saveData: connection?.saveData
        };
    }

    /**
     * Log to console (development)
     */
    private logToConsole(error: CategorizedError): void {
        // Only log if errors are enabled and verbose, or if critical
        if (!loggingConfig.errors.enabled) return;
        if (!loggingConfig.errors.verbose && error.severity !== ErrorSeverity.CRITICAL) return;

        const emoji = this.getSeverityEmoji(error.severity);
        console.group(`${emoji} ${error.severity.toUpperCase()}: ${error.name}`);
        console.error('Message:', error.message);
        console.error('Category:', error.category);
        console.error('Error ID:', error.errorId);
        if (loggingConfig.errors.verbose) {
            console.error('Context:', error.context);
            if (error.stack) {
                console.error('Stack:', error.stack);
            }
        }
        console.groupEnd();
    }

    /**
     * Send to logging service (production)
     */
    private sendToLoggingService(error: CategorizedError): void {
        // TODO: Integrate with Sentry, LogRocket, etc.
        // For now, just log to console
        console.error('[Error Logger]', {
            errorId: error.errorId,
            severity: error.severity,
            category: error.category,
            message: error.message
        });
    }

    /**
     * Setup console capture
     */
    private setupConsoleCapture(): void {
        if (!this.config.captureConsole || !loggingConfig.errors.captureConsole) return;

        const originalError = console.error;
        const originalWarn = console.warn;

        console.error = (...args: any[]) => {
            if (loggingConfig.errors.captureBreadcrumbs) {
                this.addBreadcrumb({
                    timestamp: new Date().toISOString(),
                    type: 'error',
                    category: 'console',
                    message: args.join(' '),
                    level: 'error'
                });
            }
            originalError.apply(console, args);
        };

        console.warn = (...args: any[]) => {
            if (loggingConfig.errors.captureBreadcrumbs) {
                this.addBreadcrumb({
                    timestamp: new Date().toISOString(),
                    type: 'error',
                    category: 'console',
                    message: args.join(' '),
                    level: 'warning'
                });
            }
            originalWarn.apply(console, args);
        };
    }

    /**
     * Cleanup old errors
     */
    private cleanup(): void {
        if (this.errors.size > this.config.maxErrors) {
            const oldest = Array.from(this.errors.entries())
                .sort((a, b) => a[1].timestamp.localeCompare(b[1].timestamp))[0];
            this.errors.delete(oldest[0]);
        }
    }

    /**
     * Generate session ID
     */
    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }

    /**
     * Generate error ID
     */
    private generateErrorId(): string {
        return `error_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }

    /**
     * Get severity emoji
     */
    private getSeverityEmoji(severity: ErrorSeverity): string {
        const emojis = {
            [ErrorSeverity.CRITICAL]: '🔴',
            [ErrorSeverity.HIGH]: '🟠',
            [ErrorSeverity.MEDIUM]: '🟡',
            [ErrorSeverity.LOW]: '🟢',
            [ErrorSeverity.INFO]: 'ℹ️'
        };
        return emojis[severity] || '⚠️';
    }

    /**
     * Detect browser
     */
    private detectBrowser(ua: string): string {
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        return 'Unknown';
    }

    /**
     * Detect browser version
     */
    private detectBrowserVersion(ua: string): string {
        const match = ua.match(/(Chrome|Firefox|Safari|Edge)\/(\d+)/);
        return match ? match[2] : 'Unknown';
    }

    /**
     * Detect OS
     */
    private detectOS(ua: string): string {
        if (ua.includes('Windows')) return 'Windows';
        if (ua.includes('Mac')) return 'macOS';
        if (ua.includes('Linux')) return 'Linux';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('iOS')) return 'iOS';
        return 'Unknown';
    }

    /**
     * Get localStorage (sanitized)
     */
    private getLocalStorage(): Record<string, any> {
        try {
            const storage: Record<string, any> = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && !this.config.blockedKeys.includes(key)) {
                    storage[key] = localStorage.getItem(key);
                }
            }
            return storage;
        } catch {
            return {};
        }
    }

    /**
     * Get sessionStorage (sanitized)
     */
    private getSessionStorage(): Record<string, any> {
        try {
            const storage: Record<string, any> = {};
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key && !this.config.blockedKeys.includes(key)) {
                    storage[key] = sessionStorage.getItem(key);
                }
            }
            return storage;
        } catch {
            return {};
        }
    }
}

/**
 * Export singleton instance
 */
export const advancedErrorLogger = AdvancedErrorLogger.getInstance();

/**
 * Convenience functions
 */
export const logError = (error: Error, context?: Partial<ErrorContext>, severity?: ErrorSeverity, category?: ErrorCategory) =>
    advancedErrorLogger.logError(error, context, severity, category);

export const addBreadcrumb = (breadcrumb: Breadcrumb) =>
    advancedErrorLogger.addBreadcrumb(breadcrumb);

export const logRecovery = (errorId: string, action: ErrorRecoveryAction) =>
    advancedErrorLogger.logRecovery(errorId, action);

export const getErrorStatistics = () =>
    advancedErrorLogger.getStatistics();

