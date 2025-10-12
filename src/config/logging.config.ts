/**
 * Centralized Logging Configuration
 * Controls all logging behavior across the application
 */

export interface LoggingConfig {
    // Global settings
    enabled: boolean;
    environment: 'development' | 'production' | 'test';
    
    // Console logging
    console: {
        enabled: boolean;
        level: 'debug' | 'info' | 'warn' | 'error' | 'none';
        colorize: boolean;
        timestamp: boolean;
    };
    
    // Performance monitoring
    performance: {
        enabled: boolean;
        webVitals: boolean;
        navigation: boolean;
        interactions: boolean;
        memory: boolean;
        verbose: boolean; // Detailed logs
    };
    
    // Error logging
    errors: {
        enabled: boolean;
        captureConsole: boolean;
        captureBreadcrumbs: boolean;
        verbose: boolean;
    };
    
    // API logging
    api: {
        enabled: boolean;
        logRequests: boolean;
        logResponses: boolean;
        logErrors: boolean;
        verbose: boolean;
    };
    
    // Monitoring & Alerting
    monitoring: {
        enabled: boolean;
        alerts: boolean;
        metrics: boolean;
        verbose: boolean;
    };
}

/**
 * Get logging configuration based on environment
 */
export function getLoggingConfig(): LoggingConfig {
    const isDev = import.meta.env.DEV;
    const isTest = import.meta.env.MODE === 'test';
    
    // Production: Minimal logging
    if (!isDev && !isTest) {
        return {
            enabled: true,
            environment: 'production',
            console: {
                enabled: false, // No console logs in production
                level: 'error',
                colorize: false,
                timestamp: true
            },
            performance: {
                enabled: true,
                webVitals: true,
                navigation: false,
                interactions: false,
                memory: false,
                verbose: false
            },
            errors: {
                enabled: true,
                captureConsole: false,
                captureBreadcrumbs: true,
                verbose: false
            },
            api: {
                enabled: true,
                logRequests: false,
                logResponses: false,
                logErrors: true,
                verbose: false
            },
            monitoring: {
                enabled: true,
                alerts: true,
                metrics: true,
                verbose: false
            }
        };
    }
    
    // Test: Minimal logging
    if (isTest) {
        return {
            enabled: false,
            environment: 'test',
            console: {
                enabled: false,
                level: 'none',
                colorize: false,
                timestamp: false
            },
            performance: {
                enabled: false,
                webVitals: false,
                navigation: false,
                interactions: false,
                memory: false,
                verbose: false
            },
            errors: {
                enabled: false,
                captureConsole: false,
                captureBreadcrumbs: false,
                verbose: false
            },
            api: {
                enabled: false,
                logRequests: false,
                logResponses: false,
                logErrors: false,
                verbose: false
            },
            monitoring: {
                enabled: false,
                alerts: false,
                metrics: false,
                verbose: false
            }
        };
    }
    
    // Development: Moderate logging (not verbose)
    return {
        enabled: true,
        environment: 'development',
        console: {
            enabled: true,
            level: 'info', // Only info and above
            colorize: true,
            timestamp: true
        },
        performance: {
            enabled: true,
            webVitals: true, // Keep web vitals
            navigation: false, // Disable navigation timing logs
            interactions: false, // Disable interaction logs
            memory: false, // Disable memory logs
            verbose: false // No verbose performance logs
        },
        errors: {
            enabled: true,
            captureConsole: true,
            captureBreadcrumbs: true,
            verbose: false // Only log critical errors
        },
        api: {
            enabled: true,
            logRequests: false, // Disable request logs
            logResponses: false, // Disable response logs
            logErrors: true, // Keep error logs
            verbose: false
        },
        monitoring: {
            enabled: true,
            alerts: false, // Disable alerts in dev
            metrics: false, // Disable metric logs
            verbose: false
        }
    };
}

/**
 * Logger utility with config awareness
 */
export class Logger {
    private static config = getLoggingConfig();
    
    static debug(...args: any[]): void {
        if (!this.config.console.enabled || this.config.console.level === 'none') return;
        if (['debug'].includes(this.config.console.level)) {
            console.log(...args);
        }
    }
    
    static info(...args: any[]): void {
        if (!this.config.console.enabled || this.config.console.level === 'none') return;
        if (['debug', 'info'].includes(this.config.console.level)) {
            console.log(...args);
        }
    }
    
    static warn(...args: any[]): void {
        if (!this.config.console.enabled || this.config.console.level === 'none') return;
        if (['debug', 'info', 'warn'].includes(this.config.console.level)) {
            console.warn(...args);
        }
    }
    
    static error(...args: any[]): void {
        if (!this.config.console.enabled || this.config.console.level === 'none') return;
        console.error(...args);
    }
    
    static group(label: string): void {
        if (!this.config.console.enabled || this.config.console.level === 'none') return;
        console.group(label);
    }
    
    static groupEnd(): void {
        if (!this.config.console.enabled || this.config.console.level === 'none') return;
        console.groupEnd();
    }
}

export const loggingConfig = getLoggingConfig();

