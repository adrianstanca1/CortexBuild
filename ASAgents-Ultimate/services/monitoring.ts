/**
 * ASAgents Platform - Production Monitoring System
 * Comprehensive monitoring with performance metrics, error tracking, and alerting
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

interface ErrorEvent {
  message: string;
  stack?: string;
  url?: string;
  line?: number;
  column?: number;
  timestamp: number;
  userId?: string;
  sessionId: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface SystemHealth {
  cpu: number;
  memory: number;
  uptime: number;
  activeConnections: number;
  responseTime: number;
  errorRate: number;
  timestamp: number;
}

class ProductionMonitor {
  private metrics: PerformanceMetric[] = [];
  private errors: ErrorEvent[] = [];
  private sessionId: string;
  private startTime: number;
  private enabled: boolean;
  private sentryInitialized: boolean = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.enabled = this.shouldEnableMonitoring();
    
    if (this.enabled) {
      this.initialize();
    }
  }

  private shouldEnableMonitoring(): boolean {
    return typeof window !== 'undefined' && 
           (process.env.NODE_ENV === 'production' || 
            process.env.ENABLE_MONITORING === 'true');
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async initialize(): Promise<void> {
    if (typeof window === 'undefined') return;

    // Initialize error tracking
    this.setupErrorHandling();
    
    // Initialize performance monitoring
    this.setupPerformanceMonitoring();
    
    // Initialize Sentry if available
    await this.initializeSentry();
    
    // Start periodic health checks
    this.startHealthMonitoring();
    
    console.log('🔍 Production monitoring initialized');
  }

  private setupErrorHandling(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        line: event.lineno,
        column: event.colno,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        severity: 'medium',
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        severity: 'high',
      });
    });

    // Console error interception
    const originalConsoleError = console.error;
    console.error = (...args) => {
      this.captureError({
        message: args.join(' '),
        timestamp: Date.now(),
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        severity: 'low',
      });
      originalConsoleError.apply(console, args);
    };
  }

  private setupPerformanceMonitoring(): void {
    // Web Vitals monitoring
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: 'lcp',
            value: entry.startTime,
            timestamp: Date.now(),
            tags: { type: 'web-vital' },
          });
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: 'fid',
            value: entry.processingStart - entry.startTime,
            timestamp: Date.now(),
            tags: { type: 'web-vital' },
          });
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.recordMetric({
          name: 'cls',
          value: clsValue,
          timestamp: Date.now(),
          tags: { type: 'web-vital' },
        });
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    }

    // Resource timing monitoring
    this.monitorResourceLoading();
    
    // API response time monitoring
    this.monitorApiCalls();
  }

  private monitorResourceLoading(): void {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          this.recordMetric({
            name: 'resource_load_time',
            value: entry.responseEnd - entry.startTime,
            timestamp: Date.now(),
            tags: {
              resource: entry.name.split('/').pop() || 'unknown',
              type: entry.initiatorType,
            },
          });
        }
      }
    });
    observer.observe({ type: 'resource', buffered: true });
  }

  private monitorApiCalls(): void {
    // Intercept fetch API
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = typeof args[0] === 'string' ? args[0] : args[0].url;
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        
        this.recordMetric({
          name: 'api_response_time',
          value: endTime - startTime,
          timestamp: Date.now(),
          tags: {
            endpoint: url.replace(/^.*\/api\//, '/api/'),
            status: response.status.toString(),
            method: args[1]?.method || 'GET',
          },
        });

        // Monitor error rates
        if (!response.ok) {
          this.captureError({
            message: `API Error: ${response.status} ${response.statusText}`,
            url: url,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            userAgent: navigator.userAgent,
            severity: response.status >= 500 ? 'high' : 'medium',
          });
        }

        return response;
      } catch (error: any) {
        const endTime = performance.now();
        
        this.recordMetric({
          name: 'api_response_time',
          value: endTime - startTime,
          timestamp: Date.now(),
          tags: {
            endpoint: url.replace(/^.*\/api\//, '/api/'),
            status: 'error',
            method: args[1]?.method || 'GET',
          },
        });

        this.captureError({
          message: `API Network Error: ${error.message}`,
          stack: error.stack,
          url: url,
          timestamp: Date.now(),
          sessionId: this.sessionId,
          userAgent: navigator.userAgent,
          severity: 'critical',
        });

        throw error;
      }
    };
  }

  private async initializeSentry(): Promise<void> {
    const sentryDsn = process.env.VITE_SENTRY_DSN || process.env.SENTRY_DSN;
    
    if (!sentryDsn) {
      console.warn('Sentry DSN not configured - error tracking disabled');
      return;
    }

    try {
      // Dynamically import Sentry to avoid bundling if not needed
      const Sentry = await import('@sentry/browser');
      const { Integrations } = await import('@sentry/tracing');

      Sentry.init({
        dsn: sentryDsn,
        integrations: [
          new Integrations.BrowserTracing(),
        ],
        tracesSampleRate: 0.1,
        environment: process.env.NODE_ENV,
      });

      this.sentryInitialized = true;
      console.log('✅ Sentry error tracking initialized');
    } catch (error) {
      console.warn('Failed to initialize Sentry:', error);
    }
  }

  private startHealthMonitoring(): void {
    // Send health metrics every 30 seconds
    setInterval(() => {
      this.collectSystemHealth();
    }, 30000);

    // Send accumulated metrics every 5 minutes
    setInterval(() => {
      this.sendMetrics();
    }, 300000);
  }

  private collectSystemHealth(): void {
    if (!('performance' in window)) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    const health: SystemHealth = {
      cpu: 0, // Not available in browser
      memory: (performance as any).memory?.usedJSHeapSize || 0,
      uptime: Date.now() - this.startTime,
      activeConnections: 0, // Not available in browser
      responseTime: navigation ? navigation.responseEnd - navigation.requestStart : 0,
      errorRate: this.calculateErrorRate(),
      timestamp: Date.now(),
    };

    this.recordMetric({
      name: 'system_health',
      value: health.memory,
      timestamp: Date.now(),
      tags: {
        type: 'memory',
        session: this.sessionId,
      },
    });
  }

  private calculateErrorRate(): number {
    const recentErrors = this.errors.filter(
      error => Date.now() - error.timestamp < 300000 // Last 5 minutes
    );
    return recentErrors.length;
  }

  public captureError(error: ErrorEvent): void {
    if (!this.enabled) return;

    this.errors.push(error);

    // Send to Sentry if initialized
    if (this.sentryInitialized && window.Sentry) {
      window.Sentry.captureException(new Error(error.message), {
        tags: {
          sessionId: error.sessionId,
          severity: error.severity,
        },
        extra: {
          url: error.url,
          line: error.line,
          column: error.column,
          stack: error.stack,
        },
      });
    }

    // Alert on critical errors
    if (error.severity === 'critical') {
      this.sendAlert(error);
    }

    console.error('🚨 Error captured:', error);
  }

  public recordMetric(metric: PerformanceMetric): void {
    if (!this.enabled) return;

    this.metrics.push(metric);

    // Keep only last 1000 metrics in memory
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  public getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(metric => metric.name === name);
    }
    return [...this.metrics];
  }

  public getErrors(severity?: ErrorEvent['severity']): ErrorEvent[] {
    if (severity) {
      return this.errors.filter(error => error.severity === severity);
    }
    return [...this.errors];
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public async sendMetrics(): Promise<void> {
    if (!this.enabled || this.metrics.length === 0) return;

    try {
      const endpoint = '/api/monitoring/metrics';
      const metricsToSend = [...this.metrics];
      
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          metrics: metricsToSend,
          timestamp: Date.now(),
        }),
      });

      // Clear sent metrics
      this.metrics = [];
      
      console.log(`📊 Sent ${metricsToSend.length} metrics to monitoring service`);
    } catch (error) {
      console.warn('Failed to send metrics:', error);
    }
  }

  private async sendAlert(error: ErrorEvent): Promise<void> {
    try {
      await fetch('/api/monitoring/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'error',
          severity: error.severity,
          message: error.message,
          details: error,
          timestamp: Date.now(),
        }),
      });
    } catch (alertError) {
      console.warn('Failed to send alert:', alertError);
    }
  }
}

// Global monitor instance
export const monitor = new ProductionMonitor();

// Performance measurement utilities
export const measurePerformance = (name: string) => {
  const startTime = performance.now();
  
  return {
    end: () => {
      const endTime = performance.now();
      monitor.recordMetric({
        name: `custom_${name}`,
        value: endTime - startTime,
        timestamp: Date.now(),
        tags: { type: 'custom' },
      });
    },
  };
};

// Error boundary integration
export const captureError = (error: Error, context?: Record<string, any>) => {
  monitor.captureError({
    message: error.message,
    stack: error.stack,
    timestamp: Date.now(),
    sessionId: monitor.getSessionId(),
    userAgent: navigator.userAgent,
    severity: 'medium',
    ...context,
  });
};

// React integration
export const withMonitoring = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => {
    React.useEffect(() => {
      const measurement = measurePerformance(`component_${Component.name}`);
      return measurement.end;
    }, []);

    return React.createElement(Component, props);
  };
};

export default monitor;