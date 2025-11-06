// CortexBuild Advanced Performance Monitoring Service
export interface PerformanceMetric {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'network' | 'user';
  value: number;
  unit: string;
  timestamp: string;
  threshold: {
    warning: number;
    critical: number;
  };
  status: 'good' | 'warning' | 'critical';
  trend: 'improving' | 'stable' | 'degrading';
  metadata: any;
}

export interface PerformanceReport {
  id: string;
  period: { start: string; end: string };
  summary: {
    overallScore: number;
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    uptime: number;
  };
  metrics: PerformanceMetric[];
  insights: PerformanceInsight[];
  recommendations: PerformanceRecommendation[];
  generatedAt: string;
}

export interface PerformanceInsight {
  type: 'bottleneck' | 'optimization' | 'anomaly' | 'trend';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  data: any;
}

export interface PerformanceRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'optimization' | 'scaling' | 'caching' | 'infrastructure';
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedImpact: string;
  implementationEffort: 'low' | 'medium' | 'high';
  steps: string[];
}

export interface UserExperienceMetric {
  userId: string;
  sessionId: string;
  pageLoadTime: number;
  timeToInteractive: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  navigationTiming: NavigationTiming;
  resourceTiming: ResourceTiming[];
  userActions: UserAction[];
  errors: ClientError[];
  timestamp: string;
}

export interface NavigationTiming {
  domainLookup: number;
  tcpConnect: number;
  request: number;
  response: number;
  domProcessing: number;
  domComplete: number;
  loadComplete: number;
}

export interface ResourceTiming {
  name: string;
  type: 'script' | 'stylesheet' | 'image' | 'font' | 'xhr' | 'fetch';
  size: number;
  duration: number;
  startTime: number;
  cached: boolean;
}

export interface UserAction {
  type: 'click' | 'scroll' | 'input' | 'navigation';
  element: string;
  timestamp: number;
  duration?: number;
  data?: any;
}

export interface ClientError {
  type: 'javascript' | 'network' | 'resource';
  message: string;
  stack?: string;
  url?: string;
  line?: number;
  column?: number;
  timestamp: number;
}

export interface SystemResource {
  cpu: {
    usage: number;
    cores: number;
    loadAverage: number[];
  };
  memory: {
    used: number;
    total: number;
    free: number;
    cached: number;
  };
  disk: {
    used: number;
    total: number;
    free: number;
    iops: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
    latency: number;
  };
  timestamp: string;
}

class PerformanceService {
  private metrics: PerformanceMetric[] = [];
  private userMetrics: UserExperienceMetric[] = [];
  private systemResources: SystemResource[] = [];
  private performanceObserver: PerformanceObserver | null = null;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeMonitoring();
    this.generateMockData();
  }

  private initializeMonitoring() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        // Monitor navigation timing
        this.performanceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.processPerformanceEntry(entry);
          }
        });

        this.performanceObserver.observe({
          entryTypes: ['navigation', 'resource', 'measure', 'paint', 'largest-contentful-paint']
        });
      } catch (error) {
        console.warn('Performance monitoring not available:', error);
      }
    }

    // Start system monitoring
    this.startSystemMonitoring();
  }

  private startSystemMonitoring() {
    this.monitoringInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, 30000); // Every 30 seconds
  }

  private processPerformanceEntry(entry: PerformanceEntry) {
    const now = new Date().toISOString();

    switch (entry.entryType) {
      case 'navigation': {
        const navEntry = entry as PerformanceNavigationTiming;
        this.addMetric({
          id: `nav-${Date.now()}`,
          name: 'Page Load Time',
          category: 'frontend',
          value: navEntry.loadEventEnd - navEntry.fetchStart,
          unit: 'ms',
          timestamp: now,
          threshold: { warning: 3000, critical: 5000 },
          status: this.getMetricStatus(navEntry.loadEventEnd - navEntry.fetchStart, 3000, 5000),
          trend: 'stable',
          metadata: { url: navEntry.name }
        });
        break;
      }

      case 'resource': {
        const resEntry = entry as PerformanceResourceTiming;
        if (resEntry.duration > 1000) { // Only track slow resources
          this.addMetric({
            id: `res-${Date.now()}`,
            name: 'Resource Load Time',
            category: 'network',
            value: resEntry.duration,
            unit: 'ms',
            timestamp: now,
            threshold: { warning: 1000, critical: 3000 },
            status: this.getMetricStatus(resEntry.duration, 1000, 3000),
            trend: 'stable',
            metadata: {
              url: resEntry.name,
              size: resEntry.transferSize,
              type: this.getResourceType(resEntry.name)
            }
          });
        }
        break;
      }

      case 'largest-contentful-paint':
        this.addMetric({
          id: `lcp-${Date.now()}`,
          name: 'Largest Contentful Paint',
          category: 'frontend',
          value: entry.startTime,
          unit: 'ms',
          timestamp: now,
          threshold: { warning: 2500, critical: 4000 },
          status: this.getMetricStatus(entry.startTime, 2500, 4000),
          trend: 'stable',
          metadata: {}
        });
        break;
    }
  }

  private collectSystemMetrics() {
    // Simulate system resource collection
    const systemResource: SystemResource = {
      cpu: {
        usage: Math.random() * 100,
        cores: 8,
        loadAverage: [Math.random() * 2, Math.random() * 2, Math.random() * 2]
      },
      memory: {
        used: Math.random() * 8000000000, // 8GB
        total: 16000000000, // 16GB
        free: Math.random() * 8000000000,
        cached: Math.random() * 2000000000
      },
      disk: {
        used: Math.random() * 500000000000, // 500GB
        total: 1000000000000, // 1TB
        free: Math.random() * 500000000000,
        iops: Math.random() * 1000
      },
      network: {
        bytesIn: Math.random() * 1000000,
        bytesOut: Math.random() * 1000000,
        packetsIn: Math.random() * 10000,
        packetsOut: Math.random() * 10000,
        latency: Math.random() * 100
      },
      timestamp: new Date().toISOString()
    };

    this.systemResources.push(systemResource);

    // Keep only last 100 entries
    if (this.systemResources.length > 100) {
      this.systemResources = this.systemResources.slice(-100);
    }

    // Generate metrics from system resources
    this.generateSystemMetrics(systemResource);
  }

  private generateSystemMetrics(resource: SystemResource) {
    const now = new Date().toISOString();

    // CPU Usage Metric
    this.addMetric({
      id: `cpu-${Date.now()}`,
      name: 'CPU Usage',
      category: 'backend',
      value: resource.cpu.usage,
      unit: '%',
      timestamp: now,
      threshold: { warning: 70, critical: 90 },
      status: this.getMetricStatus(resource.cpu.usage, 70, 90),
      trend: this.calculateTrend('cpu', resource.cpu.usage),
      metadata: { cores: resource.cpu.cores, loadAverage: resource.cpu.loadAverage }
    });

    // Memory Usage Metric
    const memoryUsagePercent = (resource.memory.used / resource.memory.total) * 100;
    this.addMetric({
      id: `mem-${Date.now()}`,
      name: 'Memory Usage',
      category: 'backend',
      value: memoryUsagePercent,
      unit: '%',
      timestamp: now,
      threshold: { warning: 80, critical: 95 },
      status: this.getMetricStatus(memoryUsagePercent, 80, 95),
      trend: this.calculateTrend('memory', memoryUsagePercent),
      metadata: {
        used: resource.memory.used,
        total: resource.memory.total,
        free: resource.memory.free
      }
    });

    // Network Latency Metric
    this.addMetric({
      id: `net-${Date.now()}`,
      name: 'Network Latency',
      category: 'network',
      value: resource.network.latency,
      unit: 'ms',
      timestamp: now,
      threshold: { warning: 100, critical: 200 },
      status: this.getMetricStatus(resource.network.latency, 100, 200),
      trend: this.calculateTrend('network', resource.network.latency),
      metadata: {
        bytesIn: resource.network.bytesIn,
        bytesOut: resource.network.bytesOut
      }
    });
  }

  private generateMockData() {
    const now = new Date();

    // Generate historical metrics for the last 24 hours
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000).toISOString();

      // Response Time Metric
      const responseTime = 150 + Math.random() * 100;
      this.addMetric({
        id: `resp-${Date.now()}-${i}`,
        name: 'API Response Time',
        category: 'backend',
        value: responseTime,
        unit: 'ms',
        timestamp,
        threshold: { warning: 200, critical: 500 },
        status: this.getMetricStatus(responseTime, 200, 500),
        trend: 'stable',
        metadata: { endpoint: '/api/projects' }
      });

      // Error Rate Metric
      const errorRate = Math.random() * 5;
      this.addMetric({
        id: `err-${Date.now()}-${i}`,
        name: 'Error Rate',
        category: 'backend',
        value: errorRate,
        unit: '%',
        timestamp,
        threshold: { warning: 2, critical: 5 },
        status: this.getMetricStatus(errorRate, 2, 5),
        trend: 'improving',
        metadata: { totalRequests: Math.floor(Math.random() * 1000) + 500 }
      });

      // Throughput Metric
      const throughput = 800 + Math.random() * 400;
      this.addMetric({
        id: `thr-${Date.now()}-${i}`,
        name: 'Request Throughput',
        category: 'backend',
        value: throughput,
        unit: 'req/min',
        timestamp,
        threshold: { warning: 500, critical: 200 },
        status: throughput > 500 ? 'good' : throughput > 200 ? 'warning' : 'critical',
        trend: 'stable',
        metadata: {}
      });
    }
  }

  // Public API Methods
  async getMetrics(category?: string, timeRange?: { start: string; end: string }): Promise<PerformanceMetric[]> {
    let filteredMetrics = [...this.metrics];

    if (category) {
      filteredMetrics = filteredMetrics.filter(metric => metric.category === category);
    }

    if (timeRange) {
      const start = new Date(timeRange.start);
      const end = new Date(timeRange.end);
      filteredMetrics = filteredMetrics.filter(metric => {
        const metricTime = new Date(metric.timestamp);
        return metricTime >= start && metricTime <= end;
      });
    }

    return filteredMetrics.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getLatestMetrics(): Promise<PerformanceMetric[]> {
    const latest = new Map<string, PerformanceMetric>();

    this.metrics.forEach(metric => {
      const key = `${metric.name}-${metric.category}`;
      if (!latest.has(key) || new Date(metric.timestamp) > new Date(latest.get(key)!.timestamp)) {
        latest.set(key, metric);
      }
    });

    return Array.from(latest.values());
  }

  async generatePerformanceReport(period: { start: string; end: string }): Promise<PerformanceReport> {
    const metrics = await this.getMetrics(undefined, period);

    const summary = this.calculateSummary(metrics);
    const insights = this.generateInsights(metrics);
    const recommendations = this.generateRecommendations(insights);

    return {
      id: `report-${Date.now()}`,
      period,
      summary,
      metrics,
      insights,
      recommendations,
      generatedAt: new Date().toISOString()
    };
  }

  async trackUserExperience(userMetric: Omit<UserExperienceMetric, 'timestamp'>): Promise<void> {
    const metric: UserExperienceMetric = {
      ...userMetric,
      timestamp: new Date().toISOString()
    };

    this.userMetrics.push(metric);

    // Keep only last 1000 user metrics
    if (this.userMetrics.length > 1000) {
      this.userMetrics = this.userMetrics.slice(-1000);
    }

    // Generate performance metrics from user experience data
    this.generateUserMetrics(metric);
  }

  async getSystemResources(timeRange?: { start: string; end: string }): Promise<SystemResource[]> {
    let resources = [...this.systemResources];

    if (timeRange) {
      const start = new Date(timeRange.start);
      const end = new Date(timeRange.end);
      resources = resources.filter(resource => {
        const resourceTime = new Date(resource.timestamp);
        return resourceTime >= start && resourceTime <= end;
      });
    }

    return resources.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getPerformanceScore(): Promise<{
    overall: number;
    frontend: number;
    backend: number;
    network: number;
    user: number;
  }> {
    const latestMetrics = await this.getLatestMetrics();

    const scores = {
      frontend: this.calculateCategoryScore(latestMetrics.filter(m => m.category === 'frontend')),
      backend: this.calculateCategoryScore(latestMetrics.filter(m => m.category === 'backend')),
      network: this.calculateCategoryScore(latestMetrics.filter(m => m.category === 'network')),
      user: this.calculateCategoryScore(latestMetrics.filter(m => m.category === 'user'))
    };

    const overall = (scores.frontend + scores.backend + scores.network + scores.user) / 4;

    return { overall, ...scores };
  }

  // Private Helper Methods
  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  private getMetricStatus(value: number, warning: number, critical: number): 'good' | 'warning' | 'critical' {
    if (value >= critical) return 'critical';
    if (value >= warning) return 'warning';
    return 'good';
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.gif')) return 'image';
    if (url.includes('.woff') || url.includes('.ttf')) return 'font';
    return 'other';
  }

  private calculateTrend(metricType: string, currentValue: number): 'improving' | 'stable' | 'degrading' {
    // Simple trend calculation based on recent values
    const recentMetrics = this.metrics
      .filter(m => m.name.toLowerCase().includes(metricType))
      .slice(-5);

    if (recentMetrics.length < 3) return 'stable';

    const values = recentMetrics.map(m => m.value);
    const trend = values[values.length - 1] - values[0];

    if (Math.abs(trend) < values[0] * 0.1) return 'stable';
    return trend > 0 ? 'degrading' : 'improving';
  }

  private calculateSummary(metrics: PerformanceMetric[]) {
    const responseTimeMetrics = metrics.filter(m => m.name.includes('Response Time'));
    const errorMetrics = metrics.filter(m => m.name.includes('Error Rate'));
    const throughputMetrics = metrics.filter(m => m.name.includes('Throughput'));

    return {
      overallScore: this.calculateCategoryScore(metrics),
      totalRequests: throughputMetrics.reduce((sum, m) => sum + (m.metadata?.totalRequests || 0), 0),
      averageResponseTime: responseTimeMetrics.length > 0
        ? responseTimeMetrics.reduce((sum, m) => sum + m.value, 0) / responseTimeMetrics.length
        : 0,
      errorRate: errorMetrics.length > 0
        ? errorMetrics.reduce((sum, m) => sum + m.value, 0) / errorMetrics.length
        : 0,
      uptime: 99.9 // Mock uptime
    };
  }

  private calculateCategoryScore(metrics: PerformanceMetric[]): number {
    if (metrics.length === 0) return 100;

    const scores = metrics.map(metric => {
      switch (metric.status) {
        case 'good': return 100;
        case 'warning': return 70;
        case 'critical': return 30;
        default: return 50;
      }
    });

    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  private generateInsights(metrics: PerformanceMetric[]): PerformanceInsight[] {
    const insights: PerformanceInsight[] = [];

    // Check for bottlenecks
    const slowMetrics = metrics.filter(m => m.status === 'critical');
    if (slowMetrics.length > 0) {
      insights.push({
        type: 'bottleneck',
        title: 'Performance Bottlenecks Detected',
        description: `${slowMetrics.length} metrics are showing critical performance issues`,
        impact: 'high',
        confidence: 0.9,
        data: { affectedMetrics: slowMetrics.map(m => m.name) }
      });
    }

    // Check for trends
    const degradingMetrics = metrics.filter(m => m.trend === 'degrading');
    if (degradingMetrics.length > metrics.length * 0.3) {
      insights.push({
        type: 'trend',
        title: 'Performance Degradation Trend',
        description: 'Multiple metrics showing degrading performance over time',
        impact: 'medium',
        confidence: 0.8,
        data: { degradingCount: degradingMetrics.length, totalCount: metrics.length }
      });
    }

    return insights;
  }

  private generateRecommendations(insights: PerformanceInsight[]): PerformanceRecommendation[] {
    const recommendations: PerformanceRecommendation[] = [];

    insights.forEach(insight => {
      switch (insight.type) {
        case 'bottleneck':
          recommendations.push({
            id: `rec-${Date.now()}`,
            title: 'Optimize Critical Performance Bottlenecks',
            description: 'Address the identified performance bottlenecks to improve overall system performance',
            category: 'optimization',
            priority: 'high',
            estimatedImpact: '30-50% performance improvement',
            implementationEffort: 'medium',
            steps: [
              'Identify root cause of bottlenecks',
              'Implement caching strategies',
              'Optimize database queries',
              'Consider horizontal scaling'
            ]
          });
          break;

        case 'trend':
          recommendations.push({
            id: `rec-${Date.now()}`,
            title: 'Address Performance Degradation',
            description: 'Investigate and resolve the underlying causes of performance degradation',
            category: 'optimization',
            priority: 'medium',
            estimatedImpact: '15-25% performance improvement',
            implementationEffort: 'medium',
            steps: [
              'Analyze performance trends',
              'Review recent code changes',
              'Check system resource utilization',
              'Implement monitoring alerts'
            ]
          });
          break;
      }
    });

    return recommendations;
  }

  private generateUserMetrics(userMetric: UserExperienceMetric): void {
    const now = new Date().toISOString();

    // Page Load Time
    this.addMetric({
      id: `user-load-${Date.now()}`,
      name: 'User Page Load Time',
      category: 'user',
      value: userMetric.pageLoadTime,
      unit: 'ms',
      timestamp: now,
      threshold: { warning: 3000, critical: 5000 },
      status: this.getMetricStatus(userMetric.pageLoadTime, 3000, 5000),
      trend: 'stable',
      metadata: { userId: userMetric.userId, sessionId: userMetric.sessionId }
    });

    // First Input Delay
    this.addMetric({
      id: `user-fid-${Date.now()}`,
      name: 'First Input Delay',
      category: 'user',
      value: userMetric.firstInputDelay,
      unit: 'ms',
      timestamp: now,
      threshold: { warning: 100, critical: 300 },
      status: this.getMetricStatus(userMetric.firstInputDelay, 100, 300),
      trend: 'stable',
      metadata: { userId: userMetric.userId }
    });
  }

  // Cleanup
  destroy(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
}

export const performanceService = new PerformanceService();
export default performanceService;
