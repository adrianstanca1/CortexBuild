// CortexBuild Advanced Analytics & Insights Service
export interface AnalyticsEvent {
  id: string;
  type: string;
  category: 'user' | 'system' | 'business' | 'performance' | 'security';
  properties: { [key: string]: any };
  userId?: string;
  sessionId: string;
  timestamp: string;
  source: 'web' | 'mobile' | 'api' | 'system';
  environment: 'development' | 'staging' | 'production';
}

export interface UserBehaviorAnalytics {
  userId: string;
  sessionDuration: number;
  pageViews: number;
  clickEvents: number;
  scrollDepth: number;
  timeOnPage: { [page: string]: number };
  conversionFunnels: ConversionFunnel[];
  userJourney: UserJourneyStep[];
  engagementScore: number;
  retentionData: RetentionData;
}

export interface ConversionFunnel {
  name: string;
  steps: FunnelStep[];
  conversionRate: number;
  dropOffPoints: string[];
  completionTime: number;
}

export interface FunnelStep {
  name: string;
  users: number;
  conversionRate: number;
  averageTime: number;
}

export interface UserJourneyStep {
  page: string;
  action: string;
  timestamp: string;
  duration: number;
  exitPoint: boolean;
}

export interface RetentionData {
  day1: number;
  day7: number;
  day30: number;
  cohortAnalysis: CohortData[];
}

export interface CohortData {
  cohort: string;
  size: number;
  retention: { [day: string]: number };
}

export interface BusinessMetrics {
  revenue: RevenueMetrics;
  productivity: ProductivityMetrics;
  quality: QualityMetrics;
  efficiency: EfficiencyMetrics;
  growth: GrowthMetrics;
  satisfaction: SatisfactionMetrics;
}

export interface RevenueMetrics {
  totalRevenue: number;
  revenueGrowth: number;
  averageProjectValue: number;
  profitMargin: number;
  revenuePerEmployee: number;
  monthlyRecurringRevenue: number;
  customerLifetimeValue: number;
  trends: TimeSeries[];
}

export interface ProductivityMetrics {
  tasksCompleted: number;
  averageTaskTime: number;
  teamUtilization: number;
  projectVelocity: number;
  deliveryTime: number;
  resourceEfficiency: number;
  trends: TimeSeries[];
}

export interface QualityMetrics {
  defectRate: number;
  reworkPercentage: number;
  customerSatisfaction: number;
  complianceScore: number;
  safetyIncidents: number;
  qualityScore: number;
  trends: TimeSeries[];
}

export interface EfficiencyMetrics {
  costPerProject: number;
  timeToCompletion: number;
  resourceUtilization: number;
  automationRate: number;
  processEfficiency: number;
  wasteReduction: number;
  trends: TimeSeries[];
}

export interface GrowthMetrics {
  userGrowth: number;
  projectGrowth: number;
  marketShare: number;
  expansionRate: number;
  churnRate: number;
  acquisitionCost: number;
  trends: TimeSeries[];
}

export interface SatisfactionMetrics {
  nps: number;
  csat: number;
  employeeSatisfaction: number;
  clientRetention: number;
  feedbackScore: number;
  supportTickets: number;
  trends: TimeSeries[];
}

export interface TimeSeries {
  date: string;
  value: number;
  label?: string;
}

export interface PredictiveInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'forecast' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  data: any;
  actionItems: string[];
  createdAt: string;
  expiresAt?: string;
}

export interface AdvancedReport {
  id: string;
  name: string;
  type: 'executive' | 'operational' | 'financial' | 'compliance' | 'custom';
  period: { start: string; end: string };
  sections: ReportSection[];
  insights: PredictiveInsight[];
  recommendations: string[];
  generatedAt: string;
  generatedBy: string;
}

export interface ReportSection {
  title: string;
  type: 'chart' | 'table' | 'kpi' | 'text' | 'image';
  data: any;
  visualization?: {
    chartType: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'gauge';
    options: any;
  };
}

export interface DataVisualization {
  id: string;
  name: string;
  type: 'dashboard' | 'chart' | 'table' | 'map' | 'timeline';
  config: VisualizationConfig;
  data: any;
  filters: DataFilter[];
  refreshRate: number;
  lastUpdated: string;
}

export interface VisualizationConfig {
  chartType?: string;
  dimensions: string[];
  measures: string[];
  colors: string[];
  layout: any;
  interactions: boolean;
  animations: boolean;
}

export interface DataFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'in';
  value: any;
  active: boolean;
}

class AdvancedAnalyticsService {
  private events: AnalyticsEvent[] = [];
  private userBehavior: Map<string, UserBehaviorAnalytics> = new Map();
  private businessMetrics: BusinessMetrics;
  private insights: PredictiveInsight[] = [];
  private reports: AdvancedReport[] = [];
  private visualizations: DataVisualization[] = [];

  constructor() {
    this.businessMetrics = this.initializeBusinessMetrics();
    this.generateMockData();
    this.startAnalyticsCollection();
  }

  private initializeBusinessMetrics(): BusinessMetrics {
    const now = new Date();
    const last30Days = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.random() * 100 + 50
    })).reverse();

    return {
      revenue: {
        totalRevenue: 2500000,
        revenueGrowth: 15.3,
        averageProjectValue: 125000,
        profitMargin: 22.5,
        revenuePerEmployee: 85000,
        monthlyRecurringRevenue: 180000,
        customerLifetimeValue: 450000,
        trends: last30Days
      },
      productivity: {
        tasksCompleted: 1247,
        averageTaskTime: 4.2,
        teamUtilization: 87.3,
        projectVelocity: 23.5,
        deliveryTime: 12.8,
        resourceEfficiency: 91.2,
        trends: last30Days.map(d => ({ ...d, value: Math.random() * 100 + 70 }))
      },
      quality: {
        defectRate: 2.1,
        reworkPercentage: 5.3,
        customerSatisfaction: 4.6,
        complianceScore: 94.2,
        safetyIncidents: 3,
        qualityScore: 92.8,
        trends: last30Days.map(d => ({ ...d, value: Math.random() * 20 + 80 }))
      },
      efficiency: {
        costPerProject: 98500,
        timeToCompletion: 45.2,
        resourceUtilization: 89.1,
        automationRate: 67.3,
        processEfficiency: 84.7,
        wasteReduction: 23.5,
        trends: last30Days.map(d => ({ ...d, value: Math.random() * 30 + 70 }))
      },
      growth: {
        userGrowth: 28.4,
        projectGrowth: 19.7,
        marketShare: 12.3,
        expansionRate: 34.2,
        churnRate: 4.1,
        acquisitionCost: 2500,
        trends: last30Days.map(d => ({ ...d, value: Math.random() * 50 + 25 }))
      },
      satisfaction: {
        nps: 67,
        csat: 4.3,
        employeeSatisfaction: 4.1,
        clientRetention: 94.2,
        feedbackScore: 4.4,
        supportTickets: 23,
        trends: last30Days.map(d => ({ ...d, value: Math.random() * 40 + 60 }))
      }
    };
  }

  private generateMockData(): void {
    // Generate mock events
    for (let i = 0; i < 1000; i++) {
      this.events.push({
        id: `event-${i}`,
        type: ['page_view', 'click', 'form_submit', 'task_complete', 'project_create'][Math.floor(Math.random() * 5)],
        category: ['user', 'system', 'business'][Math.floor(Math.random() * 3)] as any,
        properties: {
          page: '/dashboard',
          duration: Math.random() * 300,
          success: Math.random() > 0.1
        },
        userId: `user-${Math.floor(Math.random() * 50) + 1}`,
        sessionId: `session-${Math.floor(Math.random() * 100) + 1}`,
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        source: ['web', 'mobile', 'api'][Math.floor(Math.random() * 3)] as any,
        environment: 'production'
      });
    }

    // Generate insights
    this.insights = [
      {
        id: 'insight-1',
        type: 'trend',
        title: 'Project Completion Rate Improving',
        description: 'Project completion rates have increased by 15% over the last month due to improved task assignment algorithms.',
        confidence: 0.92,
        impact: 'high',
        category: 'productivity',
        data: { trend: 'upward', percentage: 15 },
        actionItems: [
          'Continue optimizing task assignment algorithms',
          'Expand successful practices to other teams',
          'Monitor for sustained improvement'
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: 'insight-2',
        type: 'anomaly',
        title: 'Unusual Spike in Safety Incidents',
        description: 'Safety incidents have increased by 40% in the last week, primarily on Project Alpha.',
        confidence: 0.87,
        impact: 'critical',
        category: 'safety',
        data: { spike: 40, project: 'Project Alpha' },
        actionItems: [
          'Immediate safety review for Project Alpha',
          'Additional safety training for team',
          'Review recent process changes'
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: 'insight-3',
        type: 'forecast',
        title: 'Revenue Forecast Exceeding Targets',
        description: 'Based on current trends, Q4 revenue is projected to exceed targets by 12%.',
        confidence: 0.84,
        impact: 'high',
        category: 'financial',
        data: { forecast: 2800000, target: 2500000 },
        actionItems: [
          'Prepare for increased capacity needs',
          'Consider accelerating expansion plans',
          'Update investor communications'
        ],
        createdAt: new Date().toISOString()
      }
    ];
  }

  private startAnalyticsCollection(): void {
    // Start periodic data collection
    setInterval(() => {
      this.collectRealTimeMetrics();
    }, 60000); // Every minute
  }

  private collectRealTimeMetrics(): void {
    // Simulate real-time metric collection
    const now = new Date().toISOString();
    
    // Update business metrics with new data points
    this.businessMetrics.revenue.trends.push({
      date: now.split('T')[0],
      value: this.businessMetrics.revenue.totalRevenue + (Math.random() - 0.5) * 10000
    });

    // Keep only last 30 days
    if (this.businessMetrics.revenue.trends.length > 30) {
      this.businessMetrics.revenue.trends = this.businessMetrics.revenue.trends.slice(-30);
    }
  }

  // Public API Methods
  async trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    this.events.push(analyticsEvent);

    // Keep only last 10000 events
    if (this.events.length > 10000) {
      this.events = this.events.slice(-10000);
    }

    // Process event for insights
    await this.processEventForInsights(analyticsEvent);
  }

  async getBusinessMetrics(period?: { start: string; end: string }): Promise<BusinessMetrics> {
    if (period) {
      // Filter metrics by period
      return this.filterMetricsByPeriod(this.businessMetrics, period);
    }
    return { ...this.businessMetrics };
  }

  async getUserBehaviorAnalytics(userId: string): Promise<UserBehaviorAnalytics | null> {
    const userEvents = this.events.filter(e => e.userId === userId);
    if (userEvents.length === 0) return null;

    // Calculate user behavior metrics
    const sessionDuration = this.calculateSessionDuration(userEvents);
    const pageViews = userEvents.filter(e => e.type === 'page_view').length;
    const clickEvents = userEvents.filter(e => e.type === 'click').length;
    
    return {
      userId,
      sessionDuration,
      pageViews,
      clickEvents,
      scrollDepth: Math.random() * 100,
      timeOnPage: this.calculateTimeOnPage(userEvents),
      conversionFunnels: this.calculateConversionFunnels(userEvents),
      userJourney: this.buildUserJourney(userEvents),
      engagementScore: this.calculateEngagementScore(userEvents),
      retentionData: this.calculateRetentionData(userId)
    };
  }

  async getPredictiveInsights(category?: string): Promise<PredictiveInsight[]> {
    let insights = [...this.insights];
    
    if (category) {
      insights = insights.filter(insight => insight.category === category);
    }

    return insights.sort((a, b) => {
      const impactOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });
  }

  async generateAdvancedReport(
    type: AdvancedReport['type'],
    period: { start: string; end: string },
    options?: any
  ): Promise<AdvancedReport> {
    const reportId = `report-${Date.now()}`;
    const metrics = await this.getBusinessMetrics(period);
    const insights = await this.getPredictiveInsights();

    const sections: ReportSection[] = [];

    switch (type) {
      case 'executive':
        sections.push(
          {
            title: 'Revenue Overview',
            type: 'kpi',
            data: {
              totalRevenue: metrics.revenue.totalRevenue,
              growth: metrics.revenue.revenueGrowth,
              margin: metrics.revenue.profitMargin
            }
          },
          {
            title: 'Revenue Trends',
            type: 'chart',
            data: metrics.revenue.trends,
            visualization: {
              chartType: 'line',
              options: { smooth: true, showPoints: true }
            }
          }
        );
        break;

      case 'operational':
        sections.push(
          {
            title: 'Productivity Metrics',
            type: 'kpi',
            data: {
              tasksCompleted: metrics.productivity.tasksCompleted,
              utilization: metrics.productivity.teamUtilization,
              velocity: metrics.productivity.projectVelocity
            }
          },
          {
            title: 'Quality Metrics',
            type: 'kpi',
            data: {
              qualityScore: metrics.quality.qualityScore,
              defectRate: metrics.quality.defectRate,
              satisfaction: metrics.quality.customerSatisfaction
            }
          }
        );
        break;

      case 'financial':
        sections.push(
          {
            title: 'Financial Performance',
            type: 'kpi',
            data: {
              revenue: metrics.revenue.totalRevenue,
              profitMargin: metrics.revenue.profitMargin,
              costPerProject: metrics.efficiency.costPerProject
            }
          }
        );
        break;
    }

    return {
      id: reportId,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
      type,
      period,
      sections,
      insights: insights.slice(0, 5),
      recommendations: this.generateRecommendations(metrics, insights),
      generatedAt: new Date().toISOString(),
      generatedBy: 'system'
    };
  }

  async createVisualization(config: Omit<DataVisualization, 'id' | 'lastUpdated'>): Promise<DataVisualization> {
    const visualization: DataVisualization = {
      ...config,
      id: `viz-${Date.now()}`,
      lastUpdated: new Date().toISOString()
    };

    this.visualizations.push(visualization);
    return visualization;
  }

  async getVisualizations(): Promise<DataVisualization[]> {
    return [...this.visualizations];
  }

  async getAdvancedAnalytics(): Promise<{
    totalEvents: number;
    uniqueUsers: number;
    averageSessionDuration: number;
    topPages: { page: string; views: number }[];
    conversionRates: { funnel: string; rate: number }[];
    realTimeUsers: number;
  }> {
    const uniqueUsers = new Set(this.events.map(e => e.userId).filter(Boolean)).size;
    const pageViews = this.events.filter(e => e.type === 'page_view');
    
    const topPages = this.getTopPages(pageViews);
    const conversionRates = this.getConversionRates();

    return {
      totalEvents: this.events.length,
      uniqueUsers,
      averageSessionDuration: this.calculateAverageSessionDuration(),
      topPages,
      conversionRates,
      realTimeUsers: Math.floor(Math.random() * 50) + 10
    };
  }

  // Private helper methods
  private async processEventForInsights(event: AnalyticsEvent): Promise<void> {
    // Analyze event for potential insights
    if (event.type === 'task_complete' && event.properties.duration > 480) { // 8 hours
      // Generate insight about long task duration
      this.insights.push({
        id: `insight-${Date.now()}`,
        type: 'anomaly',
        title: 'Unusually Long Task Duration Detected',
        description: `Task completion took ${event.properties.duration} minutes, significantly above average.`,
        confidence: 0.75,
        impact: 'medium',
        category: 'productivity',
        data: { taskDuration: event.properties.duration, userId: event.userId },
        actionItems: ['Review task complexity', 'Check for blockers', 'Provide additional support'],
        createdAt: new Date().toISOString()
      });
    }
  }

  private filterMetricsByPeriod(metrics: BusinessMetrics, period: { start: string; end: string }): BusinessMetrics {
    const start = new Date(period.start);
    const end = new Date(period.end);

    const filterTrends = (trends: TimeSeries[]) => 
      trends.filter(t => {
        const date = new Date(t.date);
        return date >= start && date <= end;
      });

    return {
      ...metrics,
      revenue: { ...metrics.revenue, trends: filterTrends(metrics.revenue.trends) },
      productivity: { ...metrics.productivity, trends: filterTrends(metrics.productivity.trends) },
      quality: { ...metrics.quality, trends: filterTrends(metrics.quality.trends) },
      efficiency: { ...metrics.efficiency, trends: filterTrends(metrics.efficiency.trends) },
      growth: { ...metrics.growth, trends: filterTrends(metrics.growth.trends) },
      satisfaction: { ...metrics.satisfaction, trends: filterTrends(metrics.satisfaction.trends) }
    };
  }

  private calculateSessionDuration(events: AnalyticsEvent[]): number {
    if (events.length < 2) return 0;
    
    const sessions = new Map<string, { start: number; end: number }>();
    
    events.forEach(event => {
      const timestamp = new Date(event.timestamp).getTime();
      const session = sessions.get(event.sessionId) || { start: timestamp, end: timestamp };
      
      session.start = Math.min(session.start, timestamp);
      session.end = Math.max(session.end, timestamp);
      sessions.set(event.sessionId, session);
    });

    const durations = Array.from(sessions.values()).map(s => s.end - s.start);
    return durations.reduce((sum, duration) => sum + duration, 0) / durations.length / 1000 / 60; // minutes
  }

  private calculateTimeOnPage(events: AnalyticsEvent[]): { [page: string]: number } {
    const timeOnPage: { [page: string]: number } = {};
    
    events.filter(e => e.type === 'page_view').forEach(event => {
      const page = event.properties.page || 'unknown';
      const duration = event.properties.duration || 0;
      timeOnPage[page] = (timeOnPage[page] || 0) + duration;
    });

    return timeOnPage;
  }

  private calculateConversionFunnels(events: AnalyticsEvent[]): ConversionFunnel[] {
    // Mock conversion funnel calculation
    return [
      {
        name: 'Project Creation Funnel',
        steps: [
          { name: 'Visit Projects Page', users: 100, conversionRate: 100, averageTime: 30 },
          { name: 'Click Create Project', users: 75, conversionRate: 75, averageTime: 45 },
          { name: 'Fill Project Form', users: 60, conversionRate: 80, averageTime: 180 },
          { name: 'Submit Project', users: 50, conversionRate: 83, averageTime: 15 }
        ],
        conversionRate: 50,
        dropOffPoints: ['Fill Project Form'],
        completionTime: 270
      }
    ];
  }

  private buildUserJourney(events: AnalyticsEvent[]): UserJourneyStep[] {
    return events.slice(0, 10).map(event => ({
      page: event.properties.page || 'unknown',
      action: event.type,
      timestamp: event.timestamp,
      duration: event.properties.duration || 0,
      exitPoint: false
    }));
  }

  private calculateEngagementScore(events: AnalyticsEvent[]): number {
    const pageViews = events.filter(e => e.type === 'page_view').length;
    const interactions = events.filter(e => e.type === 'click').length;
    const completions = events.filter(e => e.type === 'task_complete').length;
    
    return Math.min(100, (pageViews * 1 + interactions * 2 + completions * 5) / 10);
  }

  private calculateRetentionData(userId: string): RetentionData {
    // Mock retention data
    return {
      day1: 85,
      day7: 72,
      day30: 45,
      cohortAnalysis: [
        { cohort: '2024-01', size: 100, retention: { '1': 85, '7': 72, '30': 45 } },
        { cohort: '2024-02', size: 120, retention: { '1': 88, '7': 75, '30': 48 } }
      ]
    };
  }

  private calculateAverageSessionDuration(): number {
    const sessions = new Map<string, number>();
    
    this.events.forEach(event => {
      const duration = event.properties.duration || 0;
      sessions.set(event.sessionId, (sessions.get(event.sessionId) || 0) + duration);
    });

    const durations = Array.from(sessions.values());
    return durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
  }

  private getTopPages(pageViews: AnalyticsEvent[]): { page: string; views: number }[] {
    const pageCounts = new Map<string, number>();
    
    pageViews.forEach(event => {
      const page = event.properties.page || 'unknown';
      pageCounts.set(page, (pageCounts.get(page) || 0) + 1);
    });

    return Array.from(pageCounts.entries())
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }

  private getConversionRates(): { funnel: string; rate: number }[] {
    return [
      { funnel: 'Project Creation', rate: 50 },
      { funnel: 'Task Completion', rate: 85 },
      { funnel: 'RFI Response', rate: 72 }
    ];
  }

  private generateRecommendations(metrics: BusinessMetrics, insights: PredictiveInsight[]): string[] {
    const recommendations: string[] = [];

    if (metrics.quality.defectRate > 5) {
      recommendations.push('Implement additional quality control measures to reduce defect rate');
    }

    if (metrics.productivity.teamUtilization < 80) {
      recommendations.push('Optimize resource allocation to improve team utilization');
    }

    if (metrics.satisfaction.nps < 50) {
      recommendations.push('Focus on customer satisfaction initiatives to improve NPS score');
    }

    insights.forEach(insight => {
      if (insight.impact === 'critical') {
        recommendations.push(`Address critical issue: ${insight.title}`);
      }
    });

    return recommendations;
  }
}

export const advancedAnalyticsService = new AdvancedAnalyticsService();
export default advancedAnalyticsService;
