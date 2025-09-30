export interface ErrorReport {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  userId?: string;
  companyId?: string;
  componentStack?: string;
  errorBoundary?: string;
  metadata?: Record<string, any>;
}

export interface ErrorStats {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsByComponent: Record<string, number>;
  recentErrors: ErrorReport[];
  errorRate: number;
  topErrors: Array<{
    message: string;
    count: number;
    firstSeen: string;
    lastSeen: string;
  }>;
}

export class ErrorTrackingService {
  private static instance: ErrorTrackingService;
  private errors: ErrorReport[] = [];
  private readonly maxErrors = 1000; // Keep last 1000 errors
  private readonly errorCounts = new Map<string, number>();
  private readonly startTime = Date.now();

  static getInstance(): ErrorTrackingService {
    if (!ErrorTrackingService.instance) {
      ErrorTrackingService.instance = new ErrorTrackingService();
      ErrorTrackingService.instance.initialize();
    }
    return ErrorTrackingService.instance;
  }

  private initialize(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError({
        level: 'error',
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        userAgent: navigator.userAgent,
        metadata: {
          line: event.lineno,
          column: event.colno,
          type: 'javascript'
        }
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        level: 'error',
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        metadata: {
          type: 'promise',
          reason: event.reason
        }
      });
    });

    // Console error override
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError.apply(console, args);
      
      const message = args.map(arg => 
        typeof arg === 'string' ? arg : JSON.stringify(arg)
      ).join(' ');
      
      this.captureError({
        level: 'error',
        message: `Console Error: ${message}`,
        url: window.location.href,
        userAgent: navigator.userAgent,
        metadata: {
          type: 'console',
          args: args.slice(0, 5) // Limit args to prevent huge payloads
        }
      });
    };

    // Load persisted errors from localStorage
    this.loadPersistedErrors();
  }

  captureError(errorData: Partial<ErrorReport>): string {
    const errorId = this.generateErrorId();
    const timestamp = new Date().toISOString();
    
    const error: ErrorReport = {
      id: errorId,
      timestamp,
      level: errorData.level || 'error',
      message: errorData.message || 'Unknown error',
      stack: errorData.stack,
      url: errorData.url || window.location.href,
      userAgent: errorData.userAgent || navigator.userAgent,
      userId: errorData.userId,
      companyId: errorData.companyId,
      componentStack: errorData.componentStack,
      errorBoundary: errorData.errorBoundary,
      metadata: errorData.metadata
    };

    this.errors.unshift(error);
    
    // Maintain max errors limit
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Update error counts for tracking
    const errorKey = this.getErrorKey(error);
    this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);

    // Persist to localStorage (last 100 errors)
    this.persistErrors();

    // Log to console in development
    if (import.meta.env.DEV) {
      console.group(`🚨 Error Captured [${error.level.toUpperCase()}]`);
      console.log('Message:', error.message);
      console.log('URL:', error.url);
      console.log('Timestamp:', error.timestamp);
      if (error.stack) console.log('Stack:', error.stack);
      if (error.metadata) console.log('Metadata:', error.metadata);
      console.groupEnd();
    }

    return errorId;
  }

  captureException(error: Error, context?: {
    userId?: string;
    companyId?: string;
    componentStack?: string;
    errorBoundary?: string;
    level?: 'error' | 'warning' | 'info';
    metadata?: Record<string, any>;
  }): string {
    return this.captureError({
      level: context?.level || 'error',
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: context?.userId,
      companyId: context?.companyId,
      componentStack: context?.componentStack,
      errorBoundary: context?.errorBoundary,
      metadata: {
        errorName: error.name,
        ...context?.metadata
      }
    });
  }

  getErrorStats(): ErrorStats {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const recentErrors = this.errors.filter(
      error => new Date(error.timestamp).getTime() > oneHourAgo
    );

    // Group errors by type
    const errorsByType: Record<string, number> = {};
    const errorsByComponent: Record<string, number> = {};
    
    this.errors.forEach(error => {
      const errorType = this.getErrorType(error);
      errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;

      const component = this.getErrorComponent(error);
      if (component) {
        errorsByComponent[component] = (errorsByComponent[component] || 0) + 1;
      }
    });

    // Calculate error rate (errors per hour)
    const uptimeHours = (now - this.startTime) / (1000 * 60 * 60);
    const errorRate = uptimeHours > 0 ? this.errors.length / uptimeHours : 0;

    // Get top errors
    const topErrors = Array.from(this.errorCounts.entries())
      .map(([key, count]) => {
        const errors = this.errors.filter(e => this.getErrorKey(e) === key);
        return {
          message: key,
          count,
          firstSeen: errors[errors.length - 1]?.timestamp || '',
          lastSeen: errors[0]?.timestamp || ''
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalErrors: this.errors.length,
      errorsByType,
      errorsByComponent,
      recentErrors: recentErrors.slice(0, 20),
      errorRate,
      topErrors
    };
  }

  getRecentErrors(limit = 50): ErrorReport[] {
    return this.errors.slice(0, limit);
  }

  clearErrors(): void {
    this.errors = [];
    this.errorCounts.clear();
    localStorage.removeItem('asagents_error_tracking');
  }

  exportErrors(): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      errors: this.errors,
      stats: this.getErrorStats()
    };
    return JSON.stringify(exportData, null, 2);
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private getErrorKey(error: ErrorReport): string {
    // Create a unique key for grouping similar errors
    return `${error.message.substring(0, 100)}|${error.url.split('/').pop()}`;
  }

  private getErrorType(error: ErrorReport): string {
    if (error.metadata?.type) {
      return error.metadata.type;
    }
    
    if (error.message.includes('Network')) return 'Network';
    if (error.message.includes('Permission')) return 'Permission';
    if (error.message.includes('Not Found')) return 'NotFound';
    if (error.message.includes('Timeout')) return 'Timeout';
    if (error.stack?.includes('React')) return 'React';
    if (error.stack?.includes('async')) return 'Async';
    
    return 'JavaScript';
  }

  private getErrorComponent(error: ErrorReport): string | null {
    if (error.errorBoundary) {
      return error.errorBoundary;
    }
    
    if (error.componentStack) {
      // Extract component name from React component stack
      const regex = /at (\w+)/;
      const match = regex.exec(error.componentStack);
      return match ? match[1] : null;
    }
    
    if (error.stack) {
      // Try to extract component/function name from stack
      const lines = error.stack.split('\n');
      for (const line of lines) {
        const regex = /at (\w+)/;
        const match = regex.exec(line);
        if (match && match[1] !== 'Object' && match[1] !== 'Module') {
          return match[1];
        }
      }
    }
    
    return null;
  }

  private persistErrors(): void {
    try {
      const errorsToSave = this.errors.slice(0, 100); // Save last 100 errors
      localStorage.setItem('asagents_error_tracking', JSON.stringify(errorsToSave));
    } catch (error) {
      console.warn('Failed to persist error tracking data:', error);
    }
  }

  private loadPersistedErrors(): void {
    try {
      const saved = localStorage.getItem('asagents_error_tracking');
      if (saved) {
        const parsedErrors = JSON.parse(saved) as ErrorReport[];
        this.errors = parsedErrors.filter(error => 
          // Only load errors from last 24 hours
          new Date(error.timestamp).getTime() > Date.now() - (24 * 60 * 60 * 1000)
        );
        
        // Rebuild error counts
        this.errors.forEach(error => {
          const key = this.getErrorKey(error);
          this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);
        });
      }
    } catch (error) {
      console.warn('Failed to load persisted error tracking data:', error);
    }
  }
}

export const errorTracker = ErrorTrackingService.getInstance();