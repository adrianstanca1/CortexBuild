/**
 * Advanced analytics service for tracking user behavior and system performance
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface UserSession {
  id: string;
  userId?: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  events: AnalyticsEvent[];
  userAgent: string;
  referrer: string;
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private events: AnalyticsEvent[] = [];
  private metrics: PerformanceMetric[] = [];
  private currentSession: UserSession;
  private batchSize = 50;
  private flushInterval = 30000; // 30 seconds
  private maxRetries = 3;

  private constructor() {
    this.currentSession = this.createSession();
    this.setupPerformanceMonitoring();
    this.setupAutoFlush();
    this.setupPageVisibilityTracking();
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Event tracking
  track(eventName: string, properties?: Record<string, any>): void {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: this.sanitizeProperties(properties),
      timestamp: Date.now(),
      userId: this.getCurrentUserId(),
      sessionId: this.currentSession.id,
      metadata: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
      },
    };

    this.events.push(event);
    this.currentSession.events.push(event);
    this.updateSessionActivity();

    // Auto-flush if batch size reached
    if (this.events.length >= this.batchSize) {
      this.flush();
    }
  }

  // Page view tracking
  trackPageView(path: string, title?: string): void {
    this.track('page_view', {
      path,
      title: title || document.title,
      referrer: document.referrer,
    });

    this.currentSession.pageViews++;
  }

  // User interaction tracking
  trackClick(element: string, properties?: Record<string, any>): void {
    this.track('click', {
      element,
      ...properties,
    });
  }

  trackFormSubmit(formName: string, success: boolean, errors?: string[]): void {
    this.track('form_submit', {
      form_name: formName,
      success,
      errors,
    });
  }

  trackSearch(query: string, results: number, filters?: Record<string, any>): void {
    this.track('search', {
      query,
      results_count: results,
      filters,
    });
  }

  trackError(error: Error, context?: Record<string, any>): void {
    this.track('error', {
      error_name: error.name,
      error_message: error.message,
      error_stack: error.stack,
      context,
    });
  }

  // Performance tracking
  trackPerformance(name: string, value: number, unit: string, tags?: Record<string, string>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags,
    };

    this.metrics.push(metric);

    // Auto-flush metrics if batch size reached
    if (this.metrics.length >= this.batchSize) {
      this.flushMetrics();
    }
  }

  trackLoadTime(pageName: string, loadTime: number): void {
    this.trackPerformance('page_load_time', loadTime, 'ms', { page: pageName });
  }

  trackApiCall(endpoint: string, method: string, duration: number, status: number): void {
    this.trackPerformance('api_call_duration', duration, 'ms', {
      endpoint,
      method,
      status: status.toString(),
    });
  }

  // User identification
  identify(userId: string, traits?: Record<string, any>): void {
    this.currentSession.userId = userId;
    
    this.track('identify', {
      user_id: userId,
      traits: this.sanitizeProperties(traits),
    });
  }

  // Session management
  startNewSession(): void {
    this.endCurrentSession();
    this.currentSession = this.createSession();
  }

  endCurrentSession(): void {
    this.track('session_end', {
      session_duration: Date.now() - this.currentSession.startTime,
      page_views: this.currentSession.pageViews,
      events_count: this.currentSession.events.length,
    });

    this.flush();
  }

  // Data export and analysis
  getSessionData(): UserSession {
    return { ...this.currentSession };
  }

  getEventsSummary(timeRange?: { start: number; end: number }) {
    const events = timeRange 
      ? this.events.filter(e => e.timestamp! >= timeRange.start && e.timestamp! <= timeRange.end)
      : this.events;

    const summary = events.reduce((acc, event) => {
      acc[event.name] = (acc[event.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEvents: events.length,
      eventTypes: Object.keys(summary).length,
      breakdown: summary,
    };
  }

  getPerformanceMetrics(metricName?: string) {
    const metrics = metricName 
      ? this.metrics.filter(m => m.name === metricName)
      : this.metrics;

    if (metrics.length === 0) return null;

    const values = metrics.map(m => m.value);
    return {
      count: metrics.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      p95: this.percentile(values, 95),
      p99: this.percentile(values, 99),
    };
  }

  // Data persistence and transmission
  async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      await this.sendEvents(eventsToSend);
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-queue events for retry
      this.events.unshift(...eventsToSend);
    }
  }

  async flushMetrics(): Promise<void> {
    if (this.metrics.length === 0) return;

    const metricsToSend = [...this.metrics];
    this.metrics = [];

    try {
      await this.sendMetrics(metricsToSend);
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
      // Re-queue metrics for retry
      this.metrics.unshift(...metricsToSend);
    }
  }

  // Private methods
  private createSession(): UserSession {
    return {
      id: this.generateSessionId(),
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 0,
      events: [],
      userAgent: navigator.userAgent,
      referrer: document.referrer,
    };
  }

  private updateSessionActivity(): void {
    this.currentSession.lastActivity = Date.now();
  }

  private getCurrentUserId(): string | undefined {
    return this.currentSession.userId;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeProperties(properties?: Record<string, any>): Record<string, any> | undefined {
    if (!properties) return undefined;

    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(properties)) {
      // Skip functions and undefined values
      if (typeof value === 'function' || value === undefined) continue;
      
      // Truncate long strings
      if (typeof value === 'string' && value.length > 1000) {
        sanitized[key] = value.substring(0, 1000) + '...';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private setupPerformanceMonitoring(): void {
    // Monitor page load performance
    if ('performance' in window && 'getEntriesByType' in performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            this.trackLoadTime('initial_page_load', navigation.loadEventEnd - navigation.fetchStart);
          }
        }, 0);
      });
    }

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.trackPerformance('long_task', entry.duration, 'ms');
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        console.warn('Long task monitoring not supported');
      }
    }
  }

  private setupAutoFlush(): void {
    setInterval(() => {
      this.flush();
      this.flushMetrics();
    }, this.flushInterval);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.endCurrentSession();
    });
  }

  private setupPageVisibilityTracking(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.track('page_hidden');
      } else {
        this.track('page_visible');
        this.updateSessionActivity();
      }
    });
  }

  private async sendEvents(events: AnalyticsEvent[]): Promise<void> {
    // In a real implementation, this would send to your analytics backend
    console.log('Sending analytics events:', events);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async sendMetrics(metrics: PerformanceMetric[]): Promise<void> {
    // In a real implementation, this would send to your metrics backend
    console.log('Sending performance metrics:', metrics);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private percentile(values: number[], p: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index];
  }
}

// Export singleton instance
export const analytics = AnalyticsService.getInstance();
