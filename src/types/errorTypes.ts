/**
 * Advanced Error Types
 * Comprehensive type definitions for error logging and monitoring
 */

/**
 * Error Severity Levels
 */
export enum ErrorSeverity {
    CRITICAL = 'critical',  // App crash, data loss, security breach
    HIGH = 'high',          // Feature completely broken
    MEDIUM = 'medium',      // Degraded user experience
    LOW = 'low',            // Minor issue, workaround available
    INFO = 'info'           // Informational, not an error
}

/**
 * Error Categories
 */
export enum ErrorCategory {
    UI = 'ui',                      // UI rendering errors
    API = 'api',                    // API call failures
    DATABASE = 'database',          // Database errors
    AUTH = 'auth',                  // Authentication/authorization errors
    VALIDATION = 'validation',      // Input validation errors
    NETWORK = 'network',            // Network connectivity errors
    PERFORMANCE = 'performance',    // Performance degradation
    SECURITY = 'security',          // Security-related errors
    UNKNOWN = 'unknown'             // Unknown/uncategorized errors
}

/**
 * User Action Breadcrumb
 * Tracks user actions leading up to an error
 */
export interface Breadcrumb {
    timestamp: string;
    type: 'navigation' | 'click' | 'input' | 'api' | 'error' | 'custom';
    category: string;
    message: string;
    data?: Record<string, any>;
    level?: 'info' | 'warning' | 'error';
}

/**
 * Performance Metrics
 */
export interface PerformanceMetrics {
    // Page load metrics
    pageLoadTime?: number;
    domContentLoaded?: number;
    firstContentfulPaint?: number;
    
    // Component metrics
    componentRenderTime?: number;
    componentMountTime?: number;
    
    // API metrics
    apiResponseTime?: number;
    apiCallCount?: number;
    
    // Memory metrics
    memoryUsage?: {
        usedJSHeapSize?: number;
        totalJSHeapSize?: number;
        jsHeapSizeLimit?: number;
    };
    
    // Custom metrics
    customMetrics?: Record<string, number>;
}

/**
 * Network Information
 */
export interface NetworkInfo {
    online: boolean;
    effectiveType?: string;  // '4g', '3g', '2g', 'slow-2g'
    downlink?: number;       // Mbps
    rtt?: number;            // Round-trip time in ms
    saveData?: boolean;      // Data saver mode
}

/**
 * Browser Information
 */
export interface BrowserInfo {
    name: string;
    version: string;
    os: string;
    osVersion: string;
    screenWidth: number;
    screenHeight: number;
    viewportWidth: number;
    viewportHeight: number;
    devicePixelRatio: number;
    language: string;
    timezone: string;
    cookiesEnabled: boolean;
    doNotTrack: boolean;
}

/**
 * Application State Snapshot
 */
export interface StateSnapshot {
    route: string;
    component?: string;
    props?: Record<string, any>;
    state?: Record<string, any>;
    localStorage?: Record<string, any>;
    sessionStorage?: Record<string, any>;
}

/**
 * Error Context
 * Complete context information for an error
 */
export interface ErrorContext {
    // User & Session
    userId?: string;
    sessionId: string;
    userEmail?: string;
    userRole?: string;
    
    // Browser & Device
    browser: BrowserInfo;
    
    // Application State
    appState: StateSnapshot;
    
    // User Journey
    breadcrumbs: Breadcrumb[];
    
    // Performance
    performance: PerformanceMetrics;
    
    // Network
    network: NetworkInfo;
    
    // Timing
    timestamp: string;
    
    // Custom data
    custom?: Record<string, any>;
}

/**
 * Categorized Error
 * Error with severity and category
 */
export interface CategorizedError {
    // Error details
    name: string;
    message: string;
    stack?: string;
    
    // Classification
    severity: ErrorSeverity;
    category: ErrorCategory;
    
    // Context
    context: ErrorContext;
    
    // Metadata
    errorId: string;
    timestamp: string;
    count: number;  // For aggregation
    
    // Recovery
    recovered?: boolean;
    recoveryAttempts?: number;
    recoveryTime?: number;
}

/**
 * Aggregated Error
 * Multiple occurrences of the same error
 */
export interface AggregatedError {
    // Error signature (for grouping)
    signature: string;
    
    // Error details
    name: string;
    message: string;
    stack?: string;
    
    // Classification
    severity: ErrorSeverity;
    category: ErrorCategory;
    
    // Aggregation data
    count: number;
    firstOccurrence: string;
    lastOccurrence: string;
    
    // Affected users
    affectedUsers: Set<string>;
    affectedSessions: Set<string>;
    
    // Sample contexts (keep first and last)
    firstContext: ErrorContext;
    lastContext: ErrorContext;
    
    // Recovery stats
    recoveryRate: number;  // Percentage
    averageRecoveryTime: number;  // ms
}

/**
 * Error Pattern
 * Detected pattern in errors
 */
export interface ErrorPattern {
    patternId: string;
    description: string;
    errors: string[];  // Error signatures
    frequency: number;
    severity: ErrorSeverity;
    recommendation?: string;
}

/**
 * Performance Issue
 * Detected performance degradation
 */
export interface PerformanceIssue {
    issueId: string;
    type: 'slow_render' | 'slow_api' | 'memory_leak' | 'high_cpu';
    component?: string;
    metric: string;
    value: number;
    threshold: number;
    severity: ErrorSeverity;
    timestamp: string;
    context: ErrorContext;
}

/**
 * Session Info
 * User session tracking
 */
export interface SessionInfo {
    sessionId: string;
    userId?: string;
    startTime: string;
    lastActivity: string;
    duration: number;  // ms
    pageViews: number;
    actions: number;
    errors: number;
    route: string;
    referrer?: string;
}

/**
 * Error Recovery Action
 */
export interface ErrorRecoveryAction {
    action: 'retry' | 'refresh' | 'navigate' | 'reset' | 'ignore';
    timestamp: string;
    success: boolean;
    duration: number;  // ms
}

/**
 * Error Log Entry
 * Complete error log entry for storage/transmission
 */
export interface ErrorLogEntry {
    // Core error
    error: CategorizedError;
    
    // Environment
    environment: 'development' | 'production' | 'staging';
    
    // Application info
    appVersion?: string;
    buildId?: string;
    
    // Recovery
    recoveryActions?: ErrorRecoveryAction[];
    
    // Metadata
    tags?: string[];
    fingerprint?: string;  // For deduplication
}

/**
 * Error Statistics
 * Aggregated error statistics
 */
export interface ErrorStatistics {
    totalErrors: number;
    errorsBySeverity: Record<ErrorSeverity, number>;
    errorsByCategory: Record<ErrorCategory, number>;
    uniqueErrors: number;
    affectedUsers: number;
    affectedSessions: number;
    averageRecoveryTime: number;
    recoveryRate: number;
    topErrors: AggregatedError[];
    recentErrors: CategorizedError[];
}

/**
 * Logger Configuration
 */
export interface LoggerConfig {
    // Enable/disable features
    enabled: boolean;
    captureConsole: boolean;
    captureBreadcrumbs: boolean;
    capturePerformance: boolean;
    captureNetwork: boolean;
    
    // Limits
    maxBreadcrumbs: number;
    maxErrors: number;
    maxAggregatedErrors: number;
    
    // Sampling
    sampleRate: number;  // 0-1, percentage of errors to log
    
    // Privacy
    sanitizeData: boolean;
    allowedKeys: string[];
    blockedKeys: string[];
    
    // Performance
    debounceMs: number;
    batchSize: number;
    
    // Environment
    environment: 'development' | 'production' | 'staging';
    
    // Callbacks
    beforeSend?: (error: ErrorLogEntry) => ErrorLogEntry | null;
    onError?: (error: Error) => void;
}

