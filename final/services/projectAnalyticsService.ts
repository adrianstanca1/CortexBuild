// 🏗️ Project Analytics Service
// Comprehensive analytics service for project metrics and insights

export interface ProjectMetrics {
  id: string;
  projectId: string;
  date: Date;
  budget: BudgetMetrics;
  schedule: ScheduleMetrics;
  quality: QualityMetrics;
  safety: SafetyMetrics;
  productivity: ProductivityMetrics;
  risks: RiskMetrics;
  team: TeamMetrics;
}

export interface BudgetMetrics {
  totalBudget: number;
  spentToDate: number;
  committedCosts: number;
  forecastAtCompletion: number;
  varianceAtCompletion: number;
  costPerformanceIndex: number;
  budgetPerformanceIndex: number;
  earnedValue: number;
  plannedValue: number;
  actualCost: number;
  costByCategory: { [category: string]: number };
  changeOrderValue: number;
  contingencyUsed: number;
  contingencyRemaining: number;
}

export interface ScheduleMetrics {
  totalDuration: number; // days
  elapsedDays: number;
  remainingDays: number;
  percentComplete: number;
  schedulePerformanceIndex: number;
  criticalPathDelay: number;
  milestonesTotal: number;
  milestonesCompleted: number;
  milestonesOverdue: number;
  tasksTotal: number;
  tasksCompleted: number;
  tasksInProgress: number;
  tasksOverdue: number;
  forecastCompletion: Date;
  originalCompletion: Date;
  scheduleVariance: number; // days
}

export interface QualityMetrics {
  inspectionsPassed: number;
  inspectionsFailed: number;
  inspectionsTotal: number;
  defectRate: number;
  reworkHours: number;
  reworkCost: number;
  qualityScore: number;
  punchListItems: number;
  punchListResolved: number;
  nonConformanceReports: number;
  customerSatisfactionScore: number;
  qualityTrends: QualityTrend[];
}

export interface SafetyMetrics {
  incidentRate: number;
  nearMissReports: number;
  safetyTrainingHours: number;
  safetyInspections: number;
  safetyViolations: number;
  daysWithoutIncident: number;
  safetyScore: number;
  ppeComplianceRate: number;
  safetyMeetingsHeld: number;
  hazardsIdentified: number;
  hazardsResolved: number;
}

export interface ProductivityMetrics {
  laborHoursPlanned: number;
  laborHoursActual: number;
  laborEfficiency: number;
  equipmentUtilization: number;
  materialWastePercentage: number;
  dailyProductionRate: number;
  unitsCompleted: number;
  unitsPlanned: number;
  productivityTrends: ProductivityTrend[];
  teamProductivity: { [teamId: string]: number };
}

export interface RiskMetrics {
  totalRisks: number;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
  mitigatedRisks: number;
  riskScore: number;
  riskTrends: RiskTrend[];
  topRisks: Risk[];
}

export interface TeamMetrics {
  totalMembers: number;
  activeMembers: number;
  utilizationRate: number;
  overtimeHours: number;
  absenteeismRate: number;
  turnoverRate: number;
  trainingHours: number;
  performanceScore: number;
  teamSatisfaction: number;
  skillsGapAnalysis: SkillGap[];
}

export interface QualityTrend {
  date: Date;
  score: number;
  defectRate: number;
  inspectionPassRate: number;
}

export interface ProductivityTrend {
  date: Date;
  efficiency: number;
  outputRate: number;
  laborHours: number;
}

export interface RiskTrend {
  date: Date;
  totalRisks: number;
  riskScore: number;
  mitigatedRisks: number;
}

export interface Risk {
  id: string;
  title: string;
  probability: number;
  impact: number;
  riskScore: number;
  status: 'open' | 'mitigated' | 'closed';
  category: string;
}

export interface SkillGap {
  skill: string;
  required: number;
  current: number;
  gap: number;
}

export interface AnalyticsFilter {
  dateRange: {
    start: Date;
    end: Date;
  };
  metrics?: string[];
  granularity?: 'daily' | 'weekly' | 'monthly';
  compareToBaseline?: boolean;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'gauge';
  title: string;
  data: any;
  config: WidgetConfig;
}

export interface WidgetConfig {
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  showTrend?: boolean;
  showComparison?: boolean;
  thresholds?: { [key: string]: number };
  colors?: string[];
  size?: 'small' | 'medium' | 'large';
}

export class ProjectAnalyticsService {
  private baseUrl = '/api/analytics';

  // ===== PROJECT METRICS =====

  async getProjectMetrics(projectId: string, filter?: AnalyticsFilter): Promise<ProjectMetrics[]> {
    try {
      const params = new URLSearchParams();
      if (filter) {
        params.append('start', filter.dateRange.start.toISOString());
        params.append('end', filter.dateRange.end.toISOString());
        if (filter.granularity) params.append('granularity', filter.granularity);
        if (filter.metrics) filter.metrics.forEach(m => params.append('metrics', m));
      }
      
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/metrics?${params}`);
      if (!response.ok) throw new Error('Failed to fetch project metrics');
      return await response.json();
    } catch (error) {
      console.error('Error fetching project metrics:', error);
      return this.getMockProjectMetrics(projectId);
    }
  }

  async getBudgetAnalysis(projectId: string): Promise<BudgetMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/budget`);
      if (!response.ok) throw new Error('Failed to fetch budget analysis');
      return await response.json();
    } catch (error) {
      console.error('Error fetching budget analysis:', error);
      return this.getMockBudgetMetrics();
    }
  }

  async getScheduleAnalysis(projectId: string): Promise<ScheduleMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/schedule`);
      if (!response.ok) throw new Error('Failed to fetch schedule analysis');
      return await response.json();
    } catch (error) {
      console.error('Error fetching schedule analysis:', error);
      return this.getMockScheduleMetrics();
    }
  }

  async getQualityMetrics(projectId: string): Promise<QualityMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/quality`);
      if (!response.ok) throw new Error('Failed to fetch quality metrics');
      return await response.json();
    } catch (error) {
      console.error('Error fetching quality metrics:', error);
      return this.getMockQualityMetrics();
    }
  }

  async getSafetyMetrics(projectId: string): Promise<SafetyMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/safety`);
      if (!response.ok) throw new Error('Failed to fetch safety metrics');
      return await response.json();
    } catch (error) {
      console.error('Error fetching safety metrics:', error);
      return this.getMockSafetyMetrics();
    }
  }

  async getProductivityMetrics(projectId: string): Promise<ProductivityMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/productivity`);
      if (!response.ok) throw new Error('Failed to fetch productivity metrics');
      return await response.json();
    } catch (error) {
      console.error('Error fetching productivity metrics:', error);
      return this.getMockProductivityMetrics();
    }
  }

  async getRiskAnalysis(projectId: string): Promise<RiskMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/risks`);
      if (!response.ok) throw new Error('Failed to fetch risk analysis');
      return await response.json();
    } catch (error) {
      console.error('Error fetching risk analysis:', error);
      return this.getMockRiskMetrics();
    }
  }

  async getTeamMetrics(projectId: string): Promise<TeamMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/team`);
      if (!response.ok) throw new Error('Failed to fetch team metrics');
      return await response.json();
    } catch (error) {
      console.error('Error fetching team metrics:', error);
      return this.getMockTeamMetrics();
    }
  }

  // ===== DASHBOARD WIDGETS =====

  async getDashboardWidgets(projectId: string): Promise<DashboardWidget[]> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/dashboard`);
      if (!response.ok) throw new Error('Failed to fetch dashboard widgets');
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard widgets:', error);
      return this.getMockDashboardWidgets();
    }
  }

  async updateDashboardWidget(projectId: string, widgetId: string, config: WidgetConfig): Promise<DashboardWidget> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/dashboard/${widgetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (!response.ok) throw new Error('Failed to update dashboard widget');
      return await response.json();
    } catch (error) {
      console.error('Error updating dashboard widget:', error);
      return this.getMockDashboardWidgets()[0];
    }
  }

  // ===== MOCK DATA METHODS =====

  private getMockProjectMetrics(projectId: string): ProjectMetrics[] {
    const now = new Date();
    const metrics: ProjectMetrics[] = [];
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      metrics.push({
        id: `metrics-${i}`,
        projectId,
        date,
        budget: this.getMockBudgetMetrics(),
        schedule: this.getMockScheduleMetrics(),
        quality: this.getMockQualityMetrics(),
        safety: this.getMockSafetyMetrics(),
        productivity: this.getMockProductivityMetrics(),
        risks: this.getMockRiskMetrics(),
        team: this.getMockTeamMetrics()
      });
    }
    
    return metrics;
  }

  private getMockBudgetMetrics(): BudgetMetrics {
    return {
      totalBudget: 2500000,
      spentToDate: 1750000,
      committedCosts: 200000,
      forecastAtCompletion: 2450000,
      varianceAtCompletion: -50000,
      costPerformanceIndex: 1.02,
      budgetPerformanceIndex: 0.98,
      earnedValue: 1800000,
      plannedValue: 1850000,
      actualCost: 1750000,
      costByCategory: {
        'Labor': 850000,
        'Materials': 650000,
        'Equipment': 150000,
        'Subcontractors': 100000
      },
      changeOrderValue: 75000,
      contingencyUsed: 125000,
      contingencyRemaining: 125000
    };
  }

  private getMockScheduleMetrics(): ScheduleMetrics {
    return {
      totalDuration: 365,
      elapsedDays: 245,
      remainingDays: 125,
      percentComplete: 67,
      schedulePerformanceIndex: 0.97,
      criticalPathDelay: 5,
      milestonesTotal: 12,
      milestonesCompleted: 8,
      milestonesOverdue: 1,
      tasksTotal: 156,
      tasksCompleted: 104,
      tasksInProgress: 28,
      tasksOverdue: 8,
      forecastCompletion: new Date(Date.now() + 130 * 24 * 60 * 60 * 1000),
      originalCompletion: new Date(Date.now() + 125 * 24 * 60 * 60 * 1000),
      scheduleVariance: 5
    };
  }

  private getMockQualityMetrics(): QualityMetrics {
    return {
      inspectionsPassed: 45,
      inspectionsFailed: 3,
      inspectionsTotal: 48,
      defectRate: 2.1,
      reworkHours: 120,
      reworkCost: 15000,
      qualityScore: 94,
      punchListItems: 23,
      punchListResolved: 18,
      nonConformanceReports: 2,
      customerSatisfactionScore: 4.6,
      qualityTrends: [
        { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), score: 92, defectRate: 2.5, inspectionPassRate: 92 },
        { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), score: 93, defectRate: 2.3, inspectionPassRate: 94 },
        { date: new Date(), score: 94, defectRate: 2.1, inspectionPassRate: 94 }
      ]
    };
  }

  private getMockSafetyMetrics(): SafetyMetrics {
    return {
      incidentRate: 0.8,
      nearMissReports: 12,
      safetyTrainingHours: 480,
      safetyInspections: 24,
      safetyViolations: 3,
      daysWithoutIncident: 45,
      safetyScore: 96,
      ppeComplianceRate: 98,
      safetyMeetingsHeld: 16,
      hazardsIdentified: 28,
      hazardsResolved: 25
    };
  }

  private getMockProductivityMetrics(): ProductivityMetrics {
    return {
      laborHoursPlanned: 12000,
      laborHoursActual: 11800,
      laborEfficiency: 102,
      equipmentUtilization: 87,
      materialWastePercentage: 3.2,
      dailyProductionRate: 95,
      unitsCompleted: 2340,
      unitsPlanned: 2400,
      productivityTrends: [
        { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), efficiency: 98, outputRate: 92, laborHours: 400 },
        { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), efficiency: 100, outputRate: 94, laborHours: 420 },
        { date: new Date(), efficiency: 102, outputRate: 95, laborHours: 380 }
      ],
      teamProductivity: {
        'team-1': 105,
        'team-2': 98,
        'team-3': 103
      }
    };
  }

  private getMockRiskMetrics(): RiskMetrics {
    return {
      totalRisks: 18,
      highRisks: 2,
      mediumRisks: 8,
      lowRisks: 8,
      mitigatedRisks: 12,
      riskScore: 24,
      riskTrends: [
        { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), totalRisks: 22, riskScore: 32, mitigatedRisks: 8 },
        { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), totalRisks: 20, riskScore: 28, mitigatedRisks: 10 },
        { date: new Date(), totalRisks: 18, riskScore: 24, mitigatedRisks: 12 }
      ],
      topRisks: [
        { id: 'risk-1', title: 'Weather delays', probability: 0.7, impact: 0.8, riskScore: 0.56, status: 'open', category: 'Schedule' },
        { id: 'risk-2', title: 'Material price increase', probability: 0.6, impact: 0.7, riskScore: 0.42, status: 'mitigated', category: 'Cost' }
      ]
    };
  }

  private getMockTeamMetrics(): TeamMetrics {
    return {
      totalMembers: 45,
      activeMembers: 42,
      utilizationRate: 89,
      overtimeHours: 240,
      absenteeismRate: 3.2,
      turnoverRate: 8.5,
      trainingHours: 180,
      performanceScore: 87,
      teamSatisfaction: 4.2,
      skillsGapAnalysis: [
        { skill: 'Advanced Welding', required: 8, current: 6, gap: 2 },
        { skill: 'Project Management', required: 5, current: 3, gap: 2 },
        { skill: 'Safety Training', required: 45, current: 42, gap: 3 }
      ]
    };
  }

  private getMockDashboardWidgets(): DashboardWidget[] {
    return [
      {
        id: 'budget-overview',
        type: 'chart',
        title: 'Budget Performance',
        data: {
          planned: 1850000,
          actual: 1750000,
          forecast: 2450000
        },
        config: {
          chartType: 'bar',
          showTrend: true,
          size: 'medium'
        }
      },
      {
        id: 'schedule-progress',
        type: 'gauge',
        title: 'Schedule Progress',
        data: {
          value: 67,
          target: 70
        },
        config: {
          thresholds: { warning: 60, critical: 50 },
          size: 'small'
        }
      },
      {
        id: 'quality-score',
        type: 'metric',
        title: 'Quality Score',
        data: {
          value: 94,
          trend: 2,
          previous: 92
        },
        config: {
          showTrend: true,
          size: 'small'
        }
      }
    ];
  }
}

export const projectAnalyticsService = new ProjectAnalyticsService();
