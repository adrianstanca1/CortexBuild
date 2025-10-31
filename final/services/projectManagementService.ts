// 🏗️ Advanced Project Management Service
// Comprehensive project management capabilities inspired by Procore and Fieldwire

import { 
  ProjectTemplate, 
  ProjectBudget, 
  CostCode, 
  ChangeOrder, 
  ProjectSchedule, 
  ScheduleActivity, 
  ProjectRisk, 
  ProjectIssue,
  ProjectMetrics,
  QualityControlPlan,
  InspectionPoint
} from '../types/project-management';

export class ProjectManagementService {
  private baseUrl = '/api/projects';

  // ===== PROJECT TEMPLATES =====
  
  async getProjectTemplates(): Promise<ProjectTemplate[]> {
    try {
      const response = await fetch(`${this.baseUrl}/templates`);
      if (!response.ok) throw new Error('Failed to fetch project templates');
      return await response.json();
    } catch (error) {
      console.error('Error fetching project templates:', error);
      return this.getMockProjectTemplates();
    }
  }

  async createProjectFromTemplate(templateId: string, projectData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/from-template/${templateId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      if (!response.ok) throw new Error('Failed to create project from template');
      return await response.json();
    } catch (error) {
      console.error('Error creating project from template:', error);
      return this.mockCreateProjectFromTemplate(templateId, projectData);
    }
  }

  // ===== BUDGET MANAGEMENT =====

  async getProjectBudget(projectId: string): Promise<ProjectBudget> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/budget`);
      if (!response.ok) throw new Error('Failed to fetch project budget');
      return await response.json();
    } catch (error) {
      console.error('Error fetching project budget:', error);
      return this.getMockProjectBudget(projectId);
    }
  }

  async updateBudget(projectId: string, budget: Partial<ProjectBudget>): Promise<ProjectBudget> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/budget`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budget)
      });
      if (!response.ok) throw new Error('Failed to update budget');
      return await response.json();
    } catch (error) {
      console.error('Error updating budget:', error);
      return this.getMockProjectBudget(projectId);
    }
  }

  async getCostCodes(projectId: string): Promise<CostCode[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/cost-codes`);
      if (!response.ok) throw new Error('Failed to fetch cost codes');
      return await response.json();
    } catch (error) {
      console.error('Error fetching cost codes:', error);
      return this.getMockCostCodes();
    }
  }

  async updateCostCode(projectId: string, costCodeId: string, updates: Partial<CostCode>): Promise<CostCode> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/cost-codes/${costCodeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update cost code');
      return await response.json();
    } catch (error) {
      console.error('Error updating cost code:', error);
      return this.getMockCostCodes()[0];
    }
  }

  // ===== CHANGE ORDER MANAGEMENT =====

  async getChangeOrders(projectId: string): Promise<ChangeOrder[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/change-orders`);
      if (!response.ok) throw new Error('Failed to fetch change orders');
      return await response.json();
    } catch (error) {
      console.error('Error fetching change orders:', error);
      return this.getMockChangeOrders();
    }
  }

  async createChangeOrder(projectId: string, changeOrder: Partial<ChangeOrder>): Promise<ChangeOrder> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/change-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changeOrder)
      });
      if (!response.ok) throw new Error('Failed to create change order');
      return await response.json();
    } catch (error) {
      console.error('Error creating change order:', error);
      return this.getMockChangeOrders()[0];
    }
  }

  async approveChangeOrder(projectId: string, changeOrderId: string, approval: any): Promise<ChangeOrder> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/change-orders/${changeOrderId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approval)
      });
      if (!response.ok) throw new Error('Failed to approve change order');
      return await response.json();
    } catch (error) {
      console.error('Error approving change order:', error);
      return this.getMockChangeOrders()[0];
    }
  }

  // ===== SCHEDULE MANAGEMENT =====

  async getProjectSchedule(projectId: string): Promise<ProjectSchedule> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/schedule`);
      if (!response.ok) throw new Error('Failed to fetch project schedule');
      return await response.json();
    } catch (error) {
      console.error('Error fetching project schedule:', error);
      return this.getMockProjectSchedule(projectId);
    }
  }

  async updateScheduleActivity(projectId: string, activityId: string, updates: Partial<ScheduleActivity>): Promise<ScheduleActivity> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/schedule/activities/${activityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update schedule activity');
      return await response.json();
    } catch (error) {
      console.error('Error updating schedule activity:', error);
      return this.getMockScheduleActivities()[0];
    }
  }

  async calculateCriticalPath(projectId: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/schedule/critical-path`);
      if (!response.ok) throw new Error('Failed to calculate critical path');
      return await response.json();
    } catch (error) {
      console.error('Error calculating critical path:', error);
      return ['activity-1', 'activity-3', 'activity-5'];
    }
  }

  // ===== RISK MANAGEMENT =====

  async getProjectRisks(projectId: string): Promise<ProjectRisk[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/risks`);
      if (!response.ok) throw new Error('Failed to fetch project risks');
      return await response.json();
    } catch (error) {
      console.error('Error fetching project risks:', error);
      return this.getMockProjectRisks();
    }
  }

  async createRisk(projectId: string, risk: Partial<ProjectRisk>): Promise<ProjectRisk> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/risks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(risk)
      });
      if (!response.ok) throw new Error('Failed to create risk');
      return await response.json();
    } catch (error) {
      console.error('Error creating risk:', error);
      return this.getMockProjectRisks()[0];
    }
  }

  async assessRisk(projectId: string, riskId: string, assessment: any): Promise<ProjectRisk> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/risks/${riskId}/assess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessment)
      });
      if (!response.ok) throw new Error('Failed to assess risk');
      return await response.json();
    } catch (error) {
      console.error('Error assessing risk:', error);
      return this.getMockProjectRisks()[0];
    }
  }

  // ===== ISSUE MANAGEMENT =====

  async getProjectIssues(projectId: string): Promise<ProjectIssue[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/issues`);
      if (!response.ok) throw new Error('Failed to fetch project issues');
      return await response.json();
    } catch (error) {
      console.error('Error fetching project issues:', error);
      return this.getMockProjectIssues();
    }
  }

  async createIssue(projectId: string, issue: Partial<ProjectIssue>): Promise<ProjectIssue> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issue)
      });
      if (!response.ok) throw new Error('Failed to create issue');
      return await response.json();
    } catch (error) {
      console.error('Error creating issue:', error);
      return this.getMockProjectIssues()[0];
    }
  }

  async resolveIssue(projectId: string, issueId: string, resolution: any): Promise<ProjectIssue> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/issues/${issueId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resolution)
      });
      if (!response.ok) throw new Error('Failed to resolve issue');
      return await response.json();
    } catch (error) {
      console.error('Error resolving issue:', error);
      return this.getMockProjectIssues()[0];
    }
  }

  // ===== QUALITY CONTROL =====

  async getQualityControlPlan(projectId: string): Promise<QualityControlPlan> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/quality-control`);
      if (!response.ok) throw new Error('Failed to fetch quality control plan');
      return await response.json();
    } catch (error) {
      console.error('Error fetching quality control plan:', error);
      return this.getMockQualityControlPlan(projectId);
    }
  }

  async createInspection(projectId: string, inspection: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/inspections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inspection)
      });
      if (!response.ok) throw new Error('Failed to create inspection');
      return await response.json();
    } catch (error) {
      console.error('Error creating inspection:', error);
      return { id: 'mock-inspection-1', ...inspection };
    }
  }

  // ===== PROJECT METRICS =====

  async getProjectMetrics(projectId: string, dateRange?: { start: Date; end: Date }): Promise<ProjectMetrics[]> {
    try {
      const params = dateRange ? `?start=${dateRange.start.toISOString()}&end=${dateRange.end.toISOString()}` : '';
      const response = await fetch(`${this.baseUrl}/${projectId}/metrics${params}`);
      if (!response.ok) throw new Error('Failed to fetch project metrics');
      return await response.json();
    } catch (error) {
      console.error('Error fetching project metrics:', error);
      return this.getMockProjectMetrics(projectId);
    }
  }

  async generateProjectReport(projectId: string, reportType: string, options: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/${projectId}/reports/${reportType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      });
      if (!response.ok) throw new Error('Failed to generate project report');
      return await response.json();
    } catch (error) {
      console.error('Error generating project report:', error);
      return { reportUrl: '/mock-report.pdf', generatedAt: new Date() };
    }
  }

  // ===== MOCK DATA METHODS =====

  private getMockProjectTemplates(): ProjectTemplate[] {
    return [
      {
        id: 'template-1',
        name: 'Commercial Office Building',
        description: 'Standard template for commercial office construction',
        category: 'commercial' as any,
        phases: [],
        defaultBudget: {} as any,
        defaultTeam: [],
        customFields: [],
        workflows: [],
        createdBy: 'system',
        createdAt: new Date(),
        isPublic: true
      }
    ];
  }

  private mockCreateProjectFromTemplate(templateId: string, projectData: any): any {
    return {
      id: `project-${Date.now()}`,
      templateId,
      ...projectData,
      createdAt: new Date()
    };
  }

  private getMockProjectBudget(projectId: string): ProjectBudget {
    return {
      id: `budget-${projectId}`,
      projectId,
      version: '1.0',
      status: 'active' as any,
      originalBudget: 1000000,
      currentBudget: 1050000,
      actualCost: 750000,
      commitments: 200000,
      forecastToComplete: 300000,
      contingency: 50000,
      costCodes: this.getMockCostCodes(),
      changeOrders: [],
      approvals: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private getMockCostCodes(): CostCode[] {
    return [
      {
        id: 'cc-1',
        code: '03-30-00',
        name: 'Cast-in-Place Concrete',
        category: 'material' as any,
        phase: 'Structure',
        budgetAmount: 150000,
        actualCost: 125000,
        commitments: 0,
        forecastToComplete: 0,
        variance: -25000,
        percentComplete: 100,
        unit: 'CY',
        quantity: 500,
        unitCost: 300,
        laborCost: 75000,
        materialCost: 50000,
        equipmentCost: 0,
        subcontractorCost: 0,
        otherCost: 0
      }
    ];
  }

  private getMockChangeOrders(): ChangeOrder[] {
    return [
      {
        id: 'co-1',
        number: 'CO-001',
        title: 'Additional Electrical Outlets',
        description: 'Add 20 additional electrical outlets in office areas',
        type: 'addition' as any,
        status: 'approved' as any,
        requestedBy: 'owner-1',
        assignedTo: 'pm-1',
        reason: 'owner_request' as any,
        costImpact: 15000,
        scheduleImpact: 3,
        costCodes: ['16-10-00'],
        attachments: [],
        approvals: [],
        workflow: {} as any,
        createdAt: new Date(),
        updatedAt: new Date(),
        approvedAt: new Date()
      }
    ];
  }

  private getMockProjectSchedule(projectId: string): ProjectSchedule {
    return {
      id: `schedule-${projectId}`,
      projectId,
      name: 'Master Schedule',
      version: '1.0',
      status: 'active' as any,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      baselineStartDate: new Date(),
      baselineEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      activities: this.getMockScheduleActivities(),
      milestones: [],
      criticalPath: ['activity-1', 'activity-3'],
      resources: [],
      calendars: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private getMockScheduleActivities(): ScheduleActivity[] {
    return [
      {
        id: 'activity-1',
        wbsCode: '1.1.1',
        name: 'Site Preparation',
        description: 'Clear and prepare construction site',
        type: 'task' as any,
        status: 'completed' as any,
        duration: 5,
        originalDuration: 5,
        remainingDuration: 0,
        percentComplete: 100,
        startDate: new Date(),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        predecessors: [],
        successors: [],
        resources: [],
        costCodes: ['02-41-00'],
        location: 'Site',
        phase: 'Preparation',
        responsible: 'foreman-1',
        constraints: [],
        notes: '',
        attachments: []
      }
    ];
  }

  private getMockProjectRisks(): ProjectRisk[] {
    return [
      {
        id: 'risk-1',
        projectId: 'project-1',
        title: 'Weather Delays',
        description: 'Potential delays due to adverse weather conditions',
        category: 'schedule' as any,
        type: 'external' as any,
        probability: 3 as any,
        impact: 3 as any,
        riskScore: 9,
        status: 'assessed' as any,
        owner: 'pm-1',
        identifiedBy: 'pm-1',
        identifiedDate: new Date(),
        mitigationPlan: 'Monitor weather forecasts and adjust schedule accordingly',
        contingencyPlan: 'Have indoor work ready as backup',
        costImpact: 25000,
        scheduleImpact: 10,
        qualityImpact: 2 as any,
        safetyImpact: 1 as any,
        mitigationActions: [],
        reviews: [],
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  private getMockProjectIssues(): ProjectIssue[] {
    return [
      {
        id: 'issue-1',
        projectId: 'project-1',
        title: 'Concrete Quality Issue',
        description: 'Concrete pour did not meet specified strength requirements',
        category: 'quality' as any,
        priority: 'high' as any,
        severity: 'major' as any,
        status: 'open' as any,
        reportedBy: 'inspector-1',
        assignedTo: 'pm-1',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        resolution: '',
        rootCause: '',
        preventiveActions: '',
        costImpact: 50000,
        scheduleImpact: 14,
        relatedRisks: [],
        relatedChangeOrders: [],
        attachments: [],
        comments: [],
        workflow: {} as any,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  private getMockQualityControlPlan(projectId: string): QualityControlPlan {
    return {
      id: `qcp-${projectId}`,
      projectId,
      name: 'Quality Control Plan',
      version: '1.0',
      status: 'active' as any,
      scope: 'All construction activities',
      objectives: ['Ensure quality standards', 'Minimize rework'],
      standards: [],
      inspectionPoints: [],
      testingRequirements: [],
      deliverables: [],
      roles: [],
      procedures: [],
      approvals: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private getMockProjectMetrics(projectId: string): ProjectMetrics[] {
    return [
      {
        id: `metrics-${projectId}`,
        projectId,
        date: new Date(),
        schedule: {
          plannedProgress: 50,
          actualProgress: 45,
          scheduleVariance: -5,
          schedulePerformanceIndex: 0.9,
          criticalPathDelay: 3,
          milestonesOnTrack: 8,
          milestonesDelayed: 2,
          activitiesCompleted: 25,
          activitiesInProgress: 10,
          activitiesNotStarted: 15
        },
        cost: {
          budgetedCostOfWork: 500000,
          actualCostOfWork: 520000,
          earnedValue: 450000,
          costVariance: -70000,
          scheduleVariance: -50000,
          costPerformanceIndex: 0.87,
          schedulePerformanceIndex: 0.9,
          estimateAtCompletion: 1150000,
          estimateToComplete: 630000,
          varianceAtCompletion: 150000
        },
        quality: {} as any,
        safety: {} as any,
        productivity: {} as any,
        team: {} as any,
        risk: {} as any
      }
    ];
  }
}

export const projectManagementService = new ProjectManagementService();
