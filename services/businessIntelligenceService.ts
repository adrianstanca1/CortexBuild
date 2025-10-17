// CortexBuild Advanced Business Intelligence Service
import { Project, Task, User } from '../types';

export interface KPI {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'operational' | 'quality' | 'safety' | 'productivity' | 'customer';
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  lastUpdated: string;
  historicalData: { date: string; value: number }[];
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  userId: string;
  isDefault: boolean;
  widgets: DashboardWidget[];
  layout: WidgetLayout[];
  filters: DashboardFilter[];
  refreshInterval: number; // minutes
  createdAt: string;
  updatedAt: string;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'kpi' | 'table' | 'map' | 'gauge' | 'progress' | 'list' | 'calendar';
  title: string;
  dataSource: string;
  configuration: WidgetConfiguration;
  refreshRate: number; // seconds
  permissions: string[];
}

export interface WidgetConfiguration {
  chartType?: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter' | 'heatmap';
  metrics: string[];
  dimensions: string[];
  filters: { [key: string]: any };
  timeRange: { start: string; end: string; period: 'day' | 'week' | 'month' | 'quarter' | 'year' };
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max';
  colors: string[];
  showLegend: boolean;
  showDataLabels: boolean;
}

export interface WidgetLayout {
  widgetId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
}

export interface DashboardFilter {
  id: string;
  name: string;
  type: 'date' | 'select' | 'multiselect' | 'range' | 'text';
  field: string;
  defaultValue: any;
  options?: { label: string; value: any }[];
  required: boolean;
}

export interface DataVisualization {
  id: string;
  name: string;
  type: 'chart' | 'report' | 'dashboard';
  data: any[];
  configuration: VisualizationConfig;
  insights: DataInsight[];
  createdAt: string;
}

export interface VisualizationConfig {
  xAxis: { field: string; label: string; type: 'category' | 'datetime' | 'numeric' };
  yAxis: { field: string; label: string; type: 'numeric' };
  series: { field: string; label: string; color: string }[];
  title: string;
  subtitle?: string;
  theme: 'light' | 'dark' | 'corporate';
}

export interface DataInsight {
  type: 'trend' | 'anomaly' | 'correlation' | 'forecast' | 'comparison';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  data: any;
}

export interface AdvancedReport {
  id: string;
  name: string;
  description: string;
  category: 'executive' | 'operational' | 'financial' | 'compliance' | 'custom';
  template: ReportTemplate;
  parameters: ReportParameter[];
  schedule: ReportSchedule;
  recipients: string[];
  format: 'pdf' | 'excel' | 'powerpoint' | 'html';
  status: 'draft' | 'active' | 'archived';
  lastGenerated?: string;
  nextGeneration?: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  sections: ReportSection[];
  styling: ReportStyling;
}

export interface ReportSection {
  id: string;
  type: 'header' | 'summary' | 'chart' | 'table' | 'text' | 'image' | 'kpi-grid';
  title: string;
  content: any;
  configuration: any;
  order: number;
}

export interface ReportParameter {
  name: string;
  type: 'date' | 'project' | 'user' | 'department' | 'custom';
  required: boolean;
  defaultValue: any;
  description: string;
}

export interface ReportSchedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  time: string; // HH:MM format
  timezone: string;
}

export interface ReportStyling {
  theme: 'corporate' | 'modern' | 'minimal' | 'colorful';
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  logo?: string;
  headerFooter: boolean;
}

class BusinessIntelligenceService {
  private kpis: KPI[] = [];
  private dashboards: Dashboard[] = [];
  private reports: AdvancedReport[] = [];
  private visualizations: DataVisualization[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    const now = new Date();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
      return {
        date: date.toISOString().split('T')[0],
        value: Math.random() * 100 + 50
      };
    });

    // Initialize KPIs
    this.kpis = [
      {
        id: 'kpi-revenue',
        name: 'Monthly Revenue',
        description: 'Total revenue generated this month',
        category: 'financial',
        value: 2450000,
        target: 2500000,
        unit: '£',
        trend: 'up',
        trendPercentage: 12.5,
        status: 'good',
        lastUpdated: now.toISOString(),
        historicalData: last30Days.map(d => ({ ...d, value: d.value * 25000 }))
      },
      {
        id: 'kpi-projects-ontime',
        name: 'Projects On Time',
        description: 'Percentage of projects delivered on schedule',
        category: 'operational',
        value: 87,
        target: 90,
        unit: '%',
        trend: 'up',
        trendPercentage: 5.2,
        status: 'good',
        lastUpdated: now.toISOString(),
        historicalData: last30Days.map(d => ({ ...d, value: Math.min(100, d.value + 30) }))
      },
      {
        id: 'kpi-safety-incidents',
        name: 'Safety Incidents',
        description: 'Number of safety incidents this month',
        category: 'safety',
        value: 2,
        target: 0,
        unit: 'incidents',
        trend: 'down',
        trendPercentage: -50,
        status: 'warning',
        lastUpdated: now.toISOString(),
        historicalData: last30Days.map(d => ({ ...d, value: Math.floor(Math.random() * 5) }))
      },
      {
        id: 'kpi-quality-score',
        name: 'Quality Score',
        description: 'Average quality score across all inspections',
        category: 'quality',
        value: 92.3,
        target: 95,
        unit: '/100',
        trend: 'up',
        trendPercentage: 3.1,
        status: 'good',
        lastUpdated: now.toISOString(),
        historicalData: last30Days.map(d => ({ ...d, value: Math.min(100, d.value + 40) }))
      },
      {
        id: 'kpi-productivity',
        name: 'Team Productivity',
        description: 'Tasks completed per day per team member',
        category: 'productivity',
        value: 4.2,
        target: 5.0,
        unit: 'tasks/day',
        trend: 'stable',
        trendPercentage: 0.5,
        status: 'warning',
        lastUpdated: now.toISOString(),
        historicalData: last30Days.map(d => ({ ...d, value: d.value / 20 + 3 }))
      },
      {
        id: 'kpi-customer-satisfaction',
        name: 'Customer Satisfaction',
        description: 'Average customer satisfaction rating',
        category: 'customer',
        value: 4.6,
        target: 4.5,
        unit: '/5',
        trend: 'up',
        trendPercentage: 8.2,
        status: 'excellent',
        lastUpdated: now.toISOString(),
        historicalData: last30Days.map(d => ({ ...d, value: Math.min(5, d.value / 25 + 3.5) }))
      }
    ];

    // Initialize sample dashboard
    this.dashboards = [
      {
        id: 'dashboard-executive',
        name: 'Executive Dashboard',
        description: 'High-level overview for executive leadership',
        userId: 'user-1',
        isDefault: true,
        widgets: [
          {
            id: 'widget-revenue-chart',
            type: 'chart',
            title: 'Revenue Trend',
            dataSource: 'financial-data',
            configuration: {
              chartType: 'line',
              metrics: ['revenue'],
              dimensions: ['date'],
              timeRange: { start: '2024-01-01', end: '2024-12-31', period: 'month' },
              aggregation: 'sum',
              colors: ['#3B82F6'],
              showLegend: true,
              showDataLabels: false,
              filters: {}
            },
            refreshRate: 300,
            permissions: ['view_financial']
          },
          {
            id: 'widget-kpi-grid',
            type: 'kpi',
            title: 'Key Performance Indicators',
            dataSource: 'kpi-data',
            configuration: {
              metrics: ['revenue', 'projects-ontime', 'quality-score', 'customer-satisfaction'],
              filters: {},
              timeRange: { start: '2024-10-01', end: '2024-10-31', period: 'month' },
              aggregation: 'avg',
              colors: [],
              showLegend: false,
              showDataLabels: true
            },
            refreshRate: 60,
            permissions: ['view_kpis']
          }
        ],
        layout: [
          { widgetId: 'widget-revenue-chart', x: 0, y: 0, width: 8, height: 4 },
          { widgetId: 'widget-kpi-grid', x: 8, y: 0, width: 4, height: 4 }
        ],
        filters: [
          {
            id: 'date-filter',
            name: 'Date Range',
            type: 'date',
            field: 'date',
            defaultValue: { start: '2024-10-01', end: '2024-10-31' },
            required: true
          }
        ],
        refreshInterval: 15,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      }
    ];

    // Initialize sample reports
    this.reports = [
      {
        id: 'report-monthly-executive',
        name: 'Monthly Executive Report',
        description: 'Comprehensive monthly report for executive leadership',
        category: 'executive',
        template: {
          id: 'template-executive',
          name: 'Executive Template',
          sections: [
            {
              id: 'section-header',
              type: 'header',
              title: 'Monthly Executive Report',
              content: { subtitle: 'Construction Performance Overview' },
              configuration: {},
              order: 1
            },
            {
              id: 'section-summary',
              type: 'summary',
              title: 'Executive Summary',
              content: { text: 'Key highlights and performance metrics for the month' },
              configuration: {},
              order: 2
            },
            {
              id: 'section-kpis',
              type: 'kpi-grid',
              title: 'Key Performance Indicators',
              content: { kpis: ['revenue', 'projects-ontime', 'quality-score'] },
              configuration: { columns: 3 },
              order: 3
            }
          ],
          styling: {
            theme: 'corporate',
            primaryColor: '#1F2937',
            secondaryColor: '#3B82F6',
            fontFamily: 'Arial, sans-serif',
            headerFooter: true
          }
        },
        parameters: [
          {
            name: 'month',
            type: 'date',
            required: true,
            defaultValue: now.toISOString().split('T')[0],
            description: 'Report month'
          }
        ],
        schedule: {
          enabled: true,
          frequency: 'monthly',
          dayOfMonth: 1,
          time: '09:00',
          timezone: 'Europe/London'
        },
        recipients: ['executive@company.com'],
        format: 'pdf',
        status: 'active',
        lastGenerated: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        nextGeneration: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  // Get all KPIs
  async getKPIs(category?: string): Promise<KPI[]> {
    let kpis = [...this.kpis];
    
    if (category) {
      kpis = kpis.filter(kpi => kpi.category === category);
    }

    return kpis;
  }

  // Get KPI by ID
  async getKPI(id: string): Promise<KPI | null> {
    return this.kpis.find(kpi => kpi.id === id) || null;
  }

  // Update KPI value
  async updateKPI(id: string, value: number): Promise<KPI | null> {
    const kpi = this.kpis.find(k => k.id === id);
    if (!kpi) return null;

    const previousValue = kpi.value;
    kpi.value = value;
    kpi.lastUpdated = new Date().toISOString();

    // Calculate trend
    if (value > previousValue) {
      kpi.trend = 'up';
      kpi.trendPercentage = ((value - previousValue) / previousValue) * 100;
    } else if (value < previousValue) {
      kpi.trend = 'down';
      kpi.trendPercentage = ((previousValue - value) / previousValue) * 100;
    } else {
      kpi.trend = 'stable';
      kpi.trendPercentage = 0;
    }

    // Update status based on target
    const targetPercentage = (value / kpi.target) * 100;
    if (targetPercentage >= 100) {
      kpi.status = 'excellent';
    } else if (targetPercentage >= 90) {
      kpi.status = 'good';
    } else if (targetPercentage >= 75) {
      kpi.status = 'warning';
    } else {
      kpi.status = 'critical';
    }

    // Add to historical data
    kpi.historicalData.push({
      date: new Date().toISOString().split('T')[0],
      value
    });

    // Keep only last 30 days
    if (kpi.historicalData.length > 30) {
      kpi.historicalData = kpi.historicalData.slice(-30);
    }

    return kpi;
  }

  // Get dashboards for user
  async getDashboards(userId: string): Promise<Dashboard[]> {
    return this.dashboards.filter(dashboard => dashboard.userId === userId);
  }

  // Create custom dashboard
  async createDashboard(dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dashboard> {
    const now = new Date().toISOString();
    const newDashboard: Dashboard = {
      ...dashboard,
      id: `dashboard-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };

    this.dashboards.push(newDashboard);
    return newDashboard;
  }

  // Generate data visualization
  async generateVisualization(config: {
    type: 'chart' | 'report';
    dataSource: string;
    configuration: VisualizationConfig;
  }): Promise<DataVisualization> {
    // Mock data generation based on configuration
    const mockData = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
      value: Math.random() * 1000000 + 500000,
      target: 800000
    }));

    const insights: DataInsight[] = [
      {
        type: 'trend',
        title: 'Positive Growth Trend',
        description: 'Data shows consistent upward trend over the last 6 months',
        confidence: 0.87,
        impact: 'high',
        data: { trendPercentage: 15.3 }
      },
      {
        type: 'anomaly',
        title: 'Unusual Peak in July',
        description: 'July shows 40% higher values than average, investigate potential causes',
        confidence: 0.92,
        impact: 'medium',
        data: { month: 'July', deviation: 40 }
      }
    ];

    const visualization: DataVisualization = {
      id: `viz-${Date.now()}`,
      name: config.configuration.title,
      type: config.type,
      data: mockData,
      configuration: config.configuration,
      insights,
      createdAt: new Date().toISOString()
    };

    this.visualizations.push(visualization);
    return visualization;
  }

  // Get advanced reports
  async getReports(category?: string): Promise<AdvancedReport[]> {
    let reports = [...this.reports];
    
    if (category) {
      reports = reports.filter(report => report.category === category);
    }

    return reports;
  }

  // Generate report
  async generateReport(reportId: string, parameters: { [key: string]: any }): Promise<{
    reportId: string;
    generatedAt: string;
    format: string;
    downloadUrl: string;
    size: number;
  }> {
    const report = this.reports.find(r => r.id === reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    // Simulate report generation
    const generatedAt = new Date().toISOString();
    const downloadUrl = `/api/reports/${reportId}/download/${Date.now()}`;
    const size = Math.floor(Math.random() * 5000000) + 1000000; // 1-5MB

    // Update last generated time
    report.lastGenerated = generatedAt;

    return {
      reportId,
      generatedAt,
      format: report.format,
      downloadUrl,
      size
    };
  }

  // Get business insights
  async getBusinessInsights(): Promise<{
    summary: string;
    keyFindings: string[];
    recommendations: string[];
    riskFactors: string[];
    opportunities: string[];
  }> {
    return {
      summary: 'Overall business performance is strong with revenue growth of 12.5% and quality scores above target. Safety incidents require attention.',
      keyFindings: [
        'Revenue is 98% of monthly target with strong growth trend',
        'Project delivery on-time rate at 87%, slightly below 90% target',
        'Quality scores consistently above 90% across all projects',
        'Customer satisfaction at 4.6/5, exceeding target of 4.5',
        'Team productivity stable but below optimal levels'
      ],
      recommendations: [
        'Implement additional project management training to improve on-time delivery',
        'Invest in productivity tools to increase tasks completed per day',
        'Enhance safety protocols to reduce incident rate to zero',
        'Continue quality excellence initiatives to maintain high scores'
      ],
      riskFactors: [
        'Safety incidents trending upward - immediate attention required',
        'Productivity below target may impact future project timelines',
        'Resource allocation optimization needed for peak efficiency'
      ],
      opportunities: [
        'Customer satisfaction above target indicates potential for premium pricing',
        'Quality excellence can be leveraged for competitive advantage',
        'Strong revenue growth suggests market expansion opportunities'
      ]
    };
  }

  // Export data for external systems
  async exportData(format: 'csv' | 'json' | 'xml', dataType: 'kpis' | 'projects' | 'all'): Promise<{
    format: string;
    downloadUrl: string;
    recordCount: number;
    generatedAt: string;
  }> {
    let recordCount = 0;
    
    switch (dataType) {
      case 'kpis':
        recordCount = this.kpis.length;
        break;
      case 'all':
        recordCount = this.kpis.length + this.dashboards.length + this.reports.length;
        break;
      default:
        recordCount = 100; // Mock project count
    }

    return {
      format,
      downloadUrl: `/api/export/${dataType}.${format}?t=${Date.now()}`,
      recordCount,
      generatedAt: new Date().toISOString()
    };
  }
}

export const businessIntelligenceService = new BusinessIntelligenceService();
export default businessIntelligenceService;
