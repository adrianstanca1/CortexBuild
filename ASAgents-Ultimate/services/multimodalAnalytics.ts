// Multimodal Analytics Service
// Collects and analyzes usage patterns, processing metrics, and generates insights

import { MultimodalContent, MediaType, ProcessingResult } from '../types/multimodal';

export interface AnalyticsEvent {
  id: string;
  type: 'upload' | 'process' | 'search' | 'view' | 'download' | 'error';
  contentId?: string;
  mediaType?: MediaType;
  userId?: string;
  timestamp: Date;
  duration?: number;
  metadata?: Record<string, any>;
  error?: string;
}

export interface UsageMetrics {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsByMediaType: Record<MediaType, number>;
  averageProcessingTime: number;
  successRate: number;
  errorRate: number;
  peakUsageHours: number[];
  topUsers: Array<{ userId: string; eventCount: number }>;
}

export interface ContentMetrics {
  totalContent: number;
  contentByType: Record<MediaType, number>;
  totalStorageUsed: number;
  storageByType: Record<MediaType, number>;
  averageFileSize: number;
  averageQualityScore: number;
  topTags: Array<{ tag: string; count: number; growth: number }>;
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  cacheHitRate: number;
  throughput: number;
  errorRate: number;
  resourceUtilization: {
    cpu: number;
    memory: number;
    storage: number;
    bandwidth: number;
  };
}

export interface AIInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'recommendation' | 'prediction';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  timestamp: Date;
  data?: Record<string, any>;
  actionable: boolean;
}

export interface AnalyticsReport {
  timeRange: {
    start: Date;
    end: Date;
  };
  usageMetrics: UsageMetrics;
  contentMetrics: ContentMetrics;
  performanceMetrics: PerformanceMetrics;
  insights: AIInsight[];
  trends: Array<{
    metric: string;
    change: number;
    direction: 'up' | 'down' | 'stable';
    significance: 'high' | 'medium' | 'low';
  }>;
}

class MultimodalAnalyticsService {
  private events: AnalyticsEvent[] = [];
  private contentRegistry: Map<string, MultimodalContent> = new Map();
  private processingResults: Map<string, ProcessingResult> = new Map();
  private performanceData: Array<{ timestamp: Date; metrics: PerformanceMetrics }> = [];
  private insights: AIInsight[] = [];

  constructor() {
    this.initializeAnalytics();
  }

  private async initializeAnalytics(): Promise<void> {
    console.log('Initializing multimodal analytics service...');
    
    // Start periodic analysis
    setInterval(() => {
      this.generateInsights();
      this.cleanupOldData();
    }, 60000); // Every minute
  }

  // Event tracking
  async trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date()
    };

    this.events.push(analyticsEvent);
    
    // Trigger real-time analysis for critical events
    if (event.type === 'error' || (event.duration && event.duration > 10000)) {
      await this.analyzeEvent(analyticsEvent);
    }
  }

  async trackUpload(contentId: string, mediaType: MediaType, userId?: string, fileSize?: number): Promise<void> {
    await this.trackEvent({
      type: 'upload',
      contentId,
      mediaType,
      userId,
      metadata: { fileSize }
    });
  }

  async trackProcessing(contentId: string, mediaType: MediaType, duration: number, success: boolean, error?: string): Promise<void> {
    await this.trackEvent({
      type: success ? 'process' : 'error',
      contentId,
      mediaType,
      duration,
      error
    });
  }

  async trackSearch(query: string, resultCount: number, duration: number, userId?: string): Promise<void> {
    await this.trackEvent({
      type: 'search',
      userId,
      duration,
      metadata: { query, resultCount }
    });
  }

  async trackView(contentId: string, mediaType: MediaType, userId?: string): Promise<void> {
    await this.trackEvent({
      type: 'view',
      contentId,
      mediaType,
      userId
    });
  }

  // Content registration
  async registerContent(content: MultimodalContent, processingResult?: ProcessingResult): Promise<void> {
    this.contentRegistry.set(content.id, content);
    
    if (processingResult) {
      this.processingResults.set(content.id, processingResult);
    }
  }

  async updateContent(contentId: string, updates: Partial<MultimodalContent>): Promise<void> {
    const existing = this.contentRegistry.get(contentId);
    if (existing) {
      this.contentRegistry.set(contentId, { ...existing, ...updates });
    }
  }

  async removeContent(contentId: string): Promise<void> {
    this.contentRegistry.delete(contentId);
    this.processingResults.delete(contentId);
    
    // Remove related events (keep for historical analysis)
    // this.events = this.events.filter(event => event.contentId !== contentId);
  }

  // Performance tracking
  async recordPerformanceMetrics(metrics: PerformanceMetrics): Promise<void> {
    this.performanceData.push({
      timestamp: new Date(),
      metrics
    });

    // Keep only last 24 hours of performance data
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.performanceData = this.performanceData.filter(entry => entry.timestamp > cutoff);
  }

  // Analytics generation
  async generateReport(timeRange: { start: Date; end: Date }): Promise<AnalyticsReport> {
    const filteredEvents = this.events.filter(
      event => event.timestamp >= timeRange.start && event.timestamp <= timeRange.end
    );

    const usageMetrics = this.calculateUsageMetrics(filteredEvents);
    const contentMetrics = this.calculateContentMetrics();
    const performanceMetrics = this.calculateAveragePerformanceMetrics(timeRange);
    const insights = await this.generateInsights();
    const trends = this.calculateTrends(timeRange);

    return {
      timeRange,
      usageMetrics,
      contentMetrics,
      performanceMetrics,
      insights,
      trends
    };
  }

  private calculateUsageMetrics(events: AnalyticsEvent[]): UsageMetrics {
    const eventsByType: Record<string, number> = {};
    const eventsByMediaType: Record<MediaType, number> = {
      text: 0, image: 0, audio: 0, video: 0, document: 0, mixed: 0
    };
    const processingTimes: number[] = [];
    const userEventCounts: Record<string, number> = {};

    let successCount = 0;
    let errorCount = 0;

    for (const event of events) {
      // Count by type
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;

      // Count by media type
      if (event.mediaType) {
        eventsByMediaType[event.mediaType]++;
      }

      // Track processing times
      if (event.duration && event.type === 'process') {
        processingTimes.push(event.duration);
      }

      // Track success/error rates
      if (event.type === 'process') successCount++;
      if (event.type === 'error') errorCount++;

      // Track user activity
      if (event.userId) {
        userEventCounts[event.userId] = (userEventCounts[event.userId] || 0) + 1;
      }
    }

    const averageProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length 
      : 0;

    const totalProcessingEvents = successCount + errorCount;
    const successRate = totalProcessingEvents > 0 ? (successCount / totalProcessingEvents) * 100 : 0;
    const errorRate = totalProcessingEvents > 0 ? (errorCount / totalProcessingEvents) * 100 : 0;

    // Calculate peak usage hours
    const hourCounts: Record<number, number> = {};
    for (const event of events) {
      const hour = event.timestamp.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
    const peakUsageHours = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    // Top users
    const topUsers = Object.entries(userEventCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([userId, eventCount]) => ({ userId, eventCount }));

    return {
      totalEvents: events.length,
      eventsByType,
      eventsByMediaType,
      averageProcessingTime,
      successRate,
      errorRate,
      peakUsageHours,
      topUsers
    };
  }

  private calculateContentMetrics(): ContentMetrics {
    const contentByType: Record<MediaType, number> = {
      text: 0, image: 0, audio: 0, video: 0, document: 0, mixed: 0
    };
    const storageByType: Record<MediaType, number> = {
      text: 0, image: 0, audio: 0, video: 0, document: 0, mixed: 0
    };
    const tagCounts: Record<string, number> = {};
    let totalStorageUsed = 0;
    let totalFileSize = 0;
    let totalQualityScore = 0;
    let qualityScoreCount = 0;

    for (const content of this.contentRegistry.values()) {
      contentByType[content.type]++;

      const fileSize = content.metadata.fileSize || 0;
      totalFileSize += fileSize;
      totalStorageUsed += fileSize;
      storageByType[content.type] += fileSize;

      // Count tags
      if (content.tags) {
        for (const tag of content.tags) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      }

      // Calculate quality scores
      const processingResult = this.processingResults.get(content.id);
      if (processingResult) {
        const qualityScores = [
          processingResult.textAnalysis?.confidence,
          processingResult.imageAnalysis?.confidence,
          processingResult.audioAnalysis?.confidence,
          processingResult.videoAnalysis?.confidence
        ].filter(score => score !== undefined) as number[];

        if (qualityScores.length > 0) {
          const avgScore = qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;
          totalQualityScore += avgScore;
          qualityScoreCount++;
        }
      }
    }

    const averageFileSize = this.contentRegistry.size > 0 ? totalFileSize / this.contentRegistry.size : 0;
    const averageQualityScore = qualityScoreCount > 0 ? totalQualityScore / qualityScoreCount : 0;

    // Calculate tag growth (simplified - would need historical data)
    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count, growth: Math.random() * 20 - 10 })); // Mock growth

    return {
      totalContent: this.contentRegistry.size,
      contentByType,
      totalStorageUsed,
      storageByType,
      averageFileSize,
      averageQualityScore,
      topTags
    };
  }

  private calculateAveragePerformanceMetrics(timeRange: { start: Date; end: Date }): PerformanceMetrics {
    const relevantData = this.performanceData.filter(
      entry => entry.timestamp >= timeRange.start && entry.timestamp <= timeRange.end
    );

    if (relevantData.length === 0) {
      return {
        averageResponseTime: 0,
        cacheHitRate: 0,
        throughput: 0,
        errorRate: 0,
        resourceUtilization: { cpu: 0, memory: 0, storage: 0, bandwidth: 0 }
      };
    }

    const totals = relevantData.reduce(
      (acc, entry) => ({
        responseTime: acc.responseTime + entry.metrics.averageResponseTime,
        cacheHitRate: acc.cacheHitRate + entry.metrics.cacheHitRate,
        throughput: acc.throughput + entry.metrics.throughput,
        errorRate: acc.errorRate + entry.metrics.errorRate,
        cpu: acc.cpu + entry.metrics.resourceUtilization.cpu,
        memory: acc.memory + entry.metrics.resourceUtilization.memory,
        storage: acc.storage + entry.metrics.resourceUtilization.storage,
        bandwidth: acc.bandwidth + entry.metrics.resourceUtilization.bandwidth
      }),
      { responseTime: 0, cacheHitRate: 0, throughput: 0, errorRate: 0, cpu: 0, memory: 0, storage: 0, bandwidth: 0 }
    );

    const count = relevantData.length;

    return {
      averageResponseTime: totals.responseTime / count,
      cacheHitRate: totals.cacheHitRate / count,
      throughput: totals.throughput / count,
      errorRate: totals.errorRate / count,
      resourceUtilization: {
        cpu: totals.cpu / count,
        memory: totals.memory / count,
        storage: totals.storage / count,
        bandwidth: totals.bandwidth / count
      }
    };
  }

  private async generateInsights(): Promise<AIInsight[]> {
    const newInsights: AIInsight[] = [];

    // Analyze recent events for patterns
    const recentEvents = this.events.filter(
      event => event.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    // Detect processing time anomalies
    const processingTimes = recentEvents
      .filter(event => event.type === 'process' && event.duration)
      .map(event => event.duration!);

    if (processingTimes.length > 10) {
      const avgTime = processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length;
      const recentAvg = processingTimes.slice(-5).reduce((sum, time) => sum + time, 0) / 5;

      if (recentAvg > avgTime * 1.5) {
        newInsights.push({
          id: this.generateInsightId(),
          type: 'anomaly',
          title: 'Processing Time Spike Detected',
          description: `Recent processing times are ${Math.round((recentAvg / avgTime - 1) * 100)}% higher than average.`,
          impact: 'medium',
          confidence: 0.85,
          timestamp: new Date(),
          actionable: true
        });
      }
    }

    // Detect usage trends
    const uploadEvents = recentEvents.filter(event => event.type === 'upload');
    const mediaTypeCounts: Record<MediaType, number> = {
      text: 0, image: 0, audio: 0, video: 0, document: 0, mixed: 0
    };

    for (const event of uploadEvents) {
      if (event.mediaType) {
        mediaTypeCounts[event.mediaType]++;
      }
    }

    const dominantType = Object.entries(mediaTypeCounts)
      .sort(([, a], [, b]) => b - a)[0];

    if (dominantType && dominantType[1] > uploadEvents.length * 0.4) {
      newInsights.push({
        id: this.generateInsightId(),
        type: 'trend',
        title: `${dominantType[0]} Content Surge`,
        description: `${dominantType[0]} uploads represent ${Math.round((dominantType[1] / uploadEvents.length) * 100)}% of recent activity.`,
        impact: 'low',
        confidence: 0.75,
        timestamp: new Date(),
        actionable: false
      });
    }

    // Performance recommendations
    const errorEvents = recentEvents.filter(event => event.type === 'error');
    if (errorEvents.length > recentEvents.length * 0.05) {
      newInsights.push({
        id: this.generateInsightId(),
        type: 'recommendation',
        title: 'High Error Rate Detected',
        description: `Error rate is ${Math.round((errorEvents.length / recentEvents.length) * 100)}%. Consider reviewing processing pipelines.`,
        impact: 'high',
        confidence: 0.9,
        timestamp: new Date(),
        actionable: true
      });
    }

    // Add new insights to the collection
    this.insights.push(...newInsights);

    // Keep only recent insights
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days
    this.insights = this.insights.filter(insight => insight.timestamp > cutoff);

    return this.insights.slice(-10); // Return latest 10 insights
  }

  private calculateTrends(timeRange: { start: Date; end: Date }): Array<{
    metric: string;
    change: number;
    direction: 'up' | 'down' | 'stable';
    significance: 'high' | 'medium' | 'low';
  }> {
    // Simplified trend calculation
    // In a real implementation, this would compare with previous periods
    return [
      { metric: 'uploads', change: 12.5, direction: 'up', significance: 'medium' },
      { metric: 'processing_time', change: -5.2, direction: 'down', significance: 'low' },
      { metric: 'error_rate', change: 0.8, direction: 'up', significance: 'high' }
    ];
  }

  private async analyzeEvent(event: AnalyticsEvent): Promise<void> {
    // Real-time event analysis for critical events
    if (event.type === 'error') {
      console.warn('Error event detected:', event);
      // Could trigger alerts, notifications, etc.
    }

    if (event.duration && event.duration > 30000) { // 30 seconds
      console.warn('Long processing time detected:', event);
      // Could trigger performance investigation
    }
  }

  private cleanupOldData(): void {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
    this.events = this.events.filter(event => event.timestamp > cutoff);
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateInsightId(): string {
    return `ins_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public API methods
  async getUsageStats(timeRange?: { start: Date; end: Date }): Promise<UsageMetrics> {
    const range = timeRange || {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000),
      end: new Date()
    };

    const filteredEvents = this.events.filter(
      event => event.timestamp >= range.start && event.timestamp <= range.end
    );

    return this.calculateUsageMetrics(filteredEvents);
  }

  async getContentStats(): Promise<ContentMetrics> {
    return this.calculateContentMetrics();
  }

  async getInsights(limit: number = 10): Promise<AIInsight[]> {
    return this.insights.slice(-limit);
  }

  async exportData(format: 'json' | 'csv' = 'json'): Promise<string> {
    const data = {
      events: this.events,
      content: Array.from(this.contentRegistry.values()),
      insights: this.insights,
      performance: this.performanceData
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else {
      // CSV export would be implemented here
      return 'CSV export not implemented';
    }
  }
}

// Export singleton instance
export const multimodalAnalytics = new MultimodalAnalyticsService();
export { MultimodalAnalyticsService };
