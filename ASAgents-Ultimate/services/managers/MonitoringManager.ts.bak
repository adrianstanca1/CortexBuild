import { 
  LogEntry, 
  Metric, 
  Alert, 
  LogLevel, 
  ManagerError 
} from '../../types/managers';

export class MonitoringManager {
  private static instance: MonitoringManager;
  private logs: LogEntry[] = [];
  private metrics: Map<string, Metric[]> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private logListeners: Function[] = [];
  private metricListeners: Function[] = [];
  private alertListeners: Function[] = [];
  private maxLogEntries = 10000;
  private maxMetricsPerName = 1000;

  private constructor() {}

  public static getInstance(): MonitoringManager {
    if (!MonitoringManager.instance) {
      MonitoringManager.instance = new MonitoringManager();
    }
    return MonitoringManager.instance;
  }

  // ===== LOGGING METHODS =====

  /**
   * Log a message
   */
  public log(
    level: LogLevel,
    message: string,
    category: string = 'general',
    metadata?: Record<string, any>,
    userId?: string,
    sessionId?: string,
    requestId?: string
  ): void {
    const logEntry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      level,
      message,
      category,
      metadata,
      userId,
      sessionId,
      requestId
    };

    this.addLogEntry(logEntry);
  }

  /**
   * Log debug message
   */
  public debug(message: string, category?: string, metadata?: Record<string, any>): void {
    this.log('debug', message, category, metadata);
  }

  /**
   * Log info message
   */
  public info(message: string, category?: string, metadata?: Record<string, any>): void {
    this.log('info', message, category, metadata);
  }

  /**
   * Log warning message
   */
  public warn(message: string, category?: string, metadata?: Record<string, any>): void {
    this.log('warn', message, category, metadata);
  }

  /**
   * Log error message
   */
  public error(message: string, error?: Error, category?: string, metadata?: Record<string, any>): void {
    const errorMetadata = error ? {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      ...metadata
    } : metadata;

    this.log('error', message, category, errorMetadata);
  }

  /**
   * Log fatal error message
   */
  public fatal(message: string, error?: Error, category?: string, metadata?: Record<string, any>): void {
    const errorMetadata = error ? {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      ...metadata
    } : metadata;

    this.log('fatal', message, category, errorMetadata);
  }

  /**
   * Log API request
   */
  public logAPIRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    userId?: string,
    requestId?: string,
    metadata?: Record<string, any>
  ): void {
    this.log('info', `${method} ${path} - ${statusCode}`, 'api', {
      method,
      path,
      statusCode,
      duration,
      ...metadata
    }, userId, undefined, requestId);
  }

  /**
   * Log security event
   */
  public logSecurityEvent(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details: Record<string, any>,
    userId?: string,
    ipAddress?: string
  ): void {
    this.log('warn', `Security event: ${event}`, 'security', {
      event,
      severity,
      details,
      ipAddress
    }, userId);

    // Trigger alert for high/critical security events
    if (severity === 'high' || severity === 'critical') {
      this.triggerAlert(`security_${event}`, `Security event: ${event}`, severity);
    }
  }

  /**
   * Get logs with filtering
   */
  public getLogs(
    filters?: {
      level?: LogLevel;
      category?: string;
      userId?: string;
      startTime?: Date;
      endTime?: Date;
      limit?: number;
    }
  ): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (filters) {
      if (filters.level) {
        filteredLogs = filteredLogs.filter(log => log.level === filters.level);
      }

      if (filters.category) {
        filteredLogs = filteredLogs.filter(log => log.category === filters.category);
      }

      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
      }

      if (filters.startTime) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startTime!);
      }

      if (filters.endTime) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endTime!);
      }

      if (filters.limit) {
        filteredLogs = filteredLogs.slice(-filters.limit);
      }
    }

    return filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Clear logs
   */
  public clearLogs(): void {
    this.logs = [];
  }

  // ===== METRICS METHODS =====

  /**
   * Record a metric
   */
  public recordMetric(
    name: string,
    value: number,
    type: Metric['type'] = 'gauge',
    tags?: Record<string, string>
  ): void {
    const metric: Metric = {
      name,
      value,
      type,
      tags,
      timestamp: new Date()
    };

    this.addMetric(metric);
    this.notifyMetricListeners(metric);
  }

  /**
   * Increment a counter
   */
  public incrementCounter(name: string, value: number = 1, tags?: Record<string, string>): void {
    this.recordMetric(name, value, 'counter', tags);
  }

  /**
   * Record a gauge value
   */
  public recordGauge(name: string, value: number, tags?: Record<string, string>): void {
    this.recordMetric(name, value, 'gauge', tags);
  }

  /**
   * Record a histogram value
   */
  public recordHistogram(name: string, value: number, tags?: Record<string, string>): void {
    this.recordMetric(name, value, 'histogram', tags);
  }

  /**
   * Record a timer value
   */
  public recordTimer(name: string, duration: number, tags?: Record<string, string>): void {
    this.recordMetric(name, duration, 'timer', tags);
  }

  /**
   * Start a timer
   */
  public startTimer(name: string, tags?: Record<string, string>): () => void {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      this.recordTimer(name, duration, tags);
    };
  }

  /**
   * Get metrics
   */
  public getMetrics(
    name?: string,
    startTime?: Date,
    endTime?: Date
  ): Metric[] {
    let allMetrics: Metric[] = [];

    if (name) {
      allMetrics = this.metrics.get(name) || [];
    } else {
      for (const metrics of this.metrics.values()) {
        allMetrics.push(...metrics);
      }
    }

    if (startTime || endTime) {
      allMetrics = allMetrics.filter(metric => {
        if (startTime && metric.timestamp < startTime) return false;
        if (endTime && metric.timestamp > endTime) return false;
        return true;
      });
    }

    return allMetrics.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get metric statistics
   */
  public getMetricStats(name: string, startTime?: Date, endTime?: Date): {
    count: number;
    min: number;
    max: number;
    avg: number;
    sum: number;
  } | null {
    const metrics = this.getMetrics(name, startTime, endTime);
    
    if (metrics.length === 0) {
      return null;
    }

    const values = metrics.map(m => m.value);
    
    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      sum: values.reduce((sum, val) => sum + val, 0)
    };
  }

  // ===== ALERTS METHODS =====

  /**
   * Create an alert
   */
  public createAlert(
    name: string,
    condition: string,
    threshold: number,
    severity: Alert['severity'] = 'medium',
    channels: string[] = ['console']
  ): void {
    const alert: Alert = {
      id: this.generateId(),
      name,
      condition,
      threshold,
      severity,
      enabled: true,
      channels,
      createdAt: new Date()
    };

    this.alerts.set(name, alert);
  }

  /**
   * Trigger an alert
   */
  public triggerAlert(
    name: string,
    message: string,
    severity: Alert['severity'] = 'medium',
    metadata?: Record<string, any>
  ): void {
    const alert = this.alerts.get(name);
    
    if (!alert || !alert.enabled) {
      return;
    }

    // Update last triggered time
    alert.lastTriggered = new Date();

    // Log the alert
    this.log('warn', `Alert triggered: ${message}`, 'alert', {
      alertName: name,
      severity,
      ...metadata
    });

    // Notify alert listeners
    this.notifyAlertListeners({
      ...alert,
      message,
      metadata
    });

    // Send to configured channels
    this.sendAlertToChannels(alert, message, metadata);
  }

  /**
   * Get alerts
   */
  public getAlerts(): Alert[] {
    return Array.from(this.alerts.values());
  }

  /**
   * Enable/disable alert
   */
  public setAlertEnabled(name: string, enabled: boolean): void {
    const alert = this.alerts.get(name);
    if (alert) {
      alert.enabled = enabled;
    }
  }

  /**
   * Delete alert
   */
  public deleteAlert(name: string): void {
    this.alerts.delete(name);
  }

  // ===== EVENT LISTENERS =====

  /**
   * Add log listener
   */
  public onLog(callback: (log: LogEntry) => void): () => void {
    this.logListeners.push(callback);
    
    return () => {
      const index = this.logListeners.indexOf(callback);
      if (index > -1) {
        this.logListeners.splice(index, 1);
      }
    };
  }

  /**
   * Add metric listener
   */
  public onMetric(callback: (metric: Metric) => void): () => void {
    this.metricListeners.push(callback);
    
    return () => {
      const index = this.metricListeners.indexOf(callback);
      if (index > -1) {
        this.metricListeners.splice(index, 1);
      }
    };
  }

  /**
   * Add alert listener
   */
  public onAlert(callback: (alert: Alert & { message: string; metadata?: Record<string, any> }) => void): () => void {
    this.alertListeners.push(callback);
    
    return () => {
      const index = this.alertListeners.indexOf(callback);
      if (index > -1) {
        this.alertListeners.splice(index, 1);
      }
    };
  }

  // ===== PRIVATE HELPER METHODS =====

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private addLogEntry(logEntry: LogEntry): void {
    this.logs.push(logEntry);
    
    // Trim logs if exceeding max entries
    if (this.logs.length > this.maxLogEntries) {
      this.logs = this.logs.slice(-this.maxLogEntries);
    }

    this.notifyLogListeners(logEntry);
  }

  private addMetric(metric: Metric): void {
    if (!this.metrics.has(metric.name)) {
      this.metrics.set(metric.name, []);
    }

    const metrics = this.metrics.get(metric.name)!;
    metrics.push(metric);

    // Trim metrics if exceeding max entries per name
    if (metrics.length > this.maxMetricsPerName) {
      metrics.splice(0, metrics.length - this.maxMetricsPerName);
    }
  }

  private notifyLogListeners(log: LogEntry): void {
    this.logListeners.forEach(listener => {
      try {
        listener(log);
      } catch (error) {
        console.error('Error in log listener:', error);
      }
    });
  }

  private notifyMetricListeners(metric: Metric): void {
    this.metricListeners.forEach(listener => {
      try {
        listener(metric);
      } catch (error) {
        console.error('Error in metric listener:', error);
      }
    });
  }

  private notifyAlertListeners(alert: Alert & { message: string; metadata?: Record<string, any> }): void {
    this.alertListeners.forEach(listener => {
      try {
        listener(alert);
      } catch (error) {
        console.error('Error in alert listener:', error);
      }
    });
  }

  private sendAlertToChannels(
    alert: Alert,
    message: string,
    metadata?: Record<string, any>
  ): void {
    alert.channels.forEach(channel => {
      switch (channel) {
        case 'console':
          console.warn(`[ALERT] ${alert.name}: ${message}`, metadata);
          break;
        case 'email':
          // In a real implementation, send email
          break;
        case 'slack':
          // In a real implementation, send to Slack
          break;
        case 'webhook':
          // In a real implementation, send to webhook
          break;
      }
    });
  }

  // ===== PUBLIC UTILITY METHODS =====

  /**
   * Get monitoring statistics
   */
  public getStats(): {
    totalLogs: number;
    totalMetrics: number;
    totalAlerts: number;
    enabledAlerts: number;
    logsByLevel: Record<LogLevel, number>;
  } {
    const logsByLevel: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      fatal: 0
    };

    this.logs.forEach(log => {
      logsByLevel[log.level]++;
    });

    const alerts = Array.from(this.alerts.values());

    return {
      totalLogs: this.logs.length,
      totalMetrics: Array.from(this.metrics.values()).reduce((sum, metrics) => sum + metrics.length, 0),
      totalAlerts: alerts.length,
      enabledAlerts: alerts.filter(a => a.enabled).length,
      logsByLevel
    };
  }

  /**
   * Export logs to JSON
   */
  public exportLogs(filters?: Parameters<typeof this.getLogs>[0]): string {
    const logs = this.getLogs(filters);
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Export metrics to JSON
   */
  public exportMetrics(name?: string, startTime?: Date, endTime?: Date): string {
    const metrics = this.getMetrics(name, startTime, endTime);
    return JSON.stringify(metrics, null, 2);
  }

  /**
   * Health check
   */
  public healthCheck(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, boolean>;
    timestamp: Date;
  } {
    const checks = {
      logsWritable: true,
      metricsWritable: true,
      alertsEnabled: this.alerts.size > 0
    };

    const failedChecks = Object.values(checks).filter(check => !check).length;
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (failedChecks > 0) {
      status = failedChecks === Object.keys(checks).length ? 'unhealthy' : 'degraded';
    }

    return {
      status,
      checks,
      timestamp: new Date()
    };
  }
}
