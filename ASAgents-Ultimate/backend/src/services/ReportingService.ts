import { Request, Response } from 'express';
import { Database } from '../database.js';
import { QueryResult } from 'mysql2';

export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  type: 'dashboard' | 'tabular' | 'chart' | 'kpi';
  category: string;
  query: string;
  parameters: ReportParameter[];
  visualizations: ReportVisualization[];
  accessRoles: string[];
  isPublic: boolean;
  refreshInterval?: number;
  tenantId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportParameter {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'select';
  label: string;
  required: boolean;
  defaultValue?: any;
  options?: any[];
}

export interface ReportVisualization {
  id: string;
  type: 'table' | 'line-chart' | 'bar-chart' | 'pie-chart' | 'metric' | 'gauge';
  title: string;
  config: any;
  position: { x: number; y: number; width: number; height: number };
}

export interface ReportExecution {
  id: string;
  reportId: string;
  parameters: any;
  status: 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  executedBy: string;
  executedAt: Date;
  completedAt?: Date;
  tenantId: string;
}

export class ReportingService {
  private db: Database;
  private cache: Map<string, any> = new Map();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Create a new report definition
   */
  async createReport(report: Omit<ReportDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date();

    await this.db.executeQuery(`
      INSERT INTO report_definitions
      (id, name, description, type, category, query, parameters, visualizations, 
       access_roles, is_public, refresh_interval, tenant_id, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      report.name,
      report.description,
      report.type,
      report.category,
      report.query,
      JSON.stringify(report.parameters),
      JSON.stringify(report.visualizations),
      JSON.stringify(report.accessRoles),
      report.isPublic,
      report.refreshInterval,
      report.tenantId,
      report.createdBy,
      now,
      now
    ]);

    return id;
  }

  /**
   * Execute a report
   */
  async executeReport(reportId: string, parameters: any, userId: string, tenantId: string): Promise<string> {
    const executionId = crypto.randomUUID();
    
    // Check cache first
    const cacheKey = this.getCacheKey(reportId, parameters);
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return this.createExecutionFromCache(executionId, reportId, parameters, userId, tenantId, cached.data);
    }

    // Get report definition
    const report = await this.getReportDefinition(reportId, tenantId);
    if (!report) {
      throw new Error('Report not found');
    }

    // Check permissions
    if (!await this.hasReportAccess(report, userId, tenantId)) {
      throw new Error('Access denied');
    }

    // Create execution record
    await this.db.executeQuery(`
      INSERT INTO report_executions
      (id, report_id, parameters, status, executed_by, executed_at, tenant_id)
      VALUES (?, ?, ?, 'running', ?, NOW(), ?)
    `, [executionId, reportId, JSON.stringify(parameters), userId, tenantId]);

    // Execute report asynchronously
    this.executeReportAsync(executionId, report, parameters, tenantId);

    return executionId;
  }

  /**
   * Execute report asynchronously
   */
  private async executeReportAsync(executionId: string, report: ReportDefinition, parameters: any, tenantId: string): Promise<void> {
    try {
      const result = await this.runReportQuery(report.query, parameters, tenantId);
      
      // Cache result
      const cacheKey = this.getCacheKey(report.id, parameters);
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      // Update execution record
      await this.db.executeQuery(`
        UPDATE report_executions
        SET status = 'completed', result = ?, completed_at = NOW()
        WHERE id = ?
      `, [JSON.stringify(result), executionId]);

    } catch (error) {
      console.error('Report execution failed:', error);
      
      await this.db.executeQuery(`
        UPDATE report_executions
        SET status = 'failed', error = ?, completed_at = NOW()
        WHERE id = ?
      `, [String(error), executionId]);
    }
  }

  /**
   * Run report query with parameters
   */
  private async runReportQuery(query: string, parameters: any, tenantId: string): Promise<any> {
    // Replace parameters in query
    let processedQuery = query;
    const params = [tenantId]; // Always include tenant_id for security

    for (const [key, value] of Object.entries(parameters)) {
      if (processedQuery.includes(`{{${key}}}`)) {
        processedQuery = processedQuery.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), '?');
        params.push(value);
      }
    }

    // Ensure tenant isolation
    if (!processedQuery.toLowerCase().includes('tenant_id')) {
      throw new Error('Query must include tenant_id filter for security');
    }

    const result = await this.db.executeQuery(processedQuery, params) as QueryResult;
    return Array.isArray(result) ? result : [];
  }

  /**
   * Get predefined analytics reports
   */
  async getAnalyticsReports(tenantId: string): Promise<any> {
    const reports = {
      projectOverview: await this.getProjectOverview(tenantId),
      financialSummary: await this.getFinancialSummary(tenantId),
      taskMetrics: await this.getTaskMetrics(tenantId),
      teamPerformance: await this.getTeamPerformance(tenantId),
      safetyMetrics: await this.getSafetyMetrics(tenantId),
      equipmentUtilization: await this.getEquipmentUtilization(tenantId)
    };

    return reports;
  }

  /**
   * Project Overview Analytics
   */
  private async getProjectOverview(tenantId: string): Promise<any> {
    const [projects, phases, timeline] = await Promise.all([
      this.db.executeQuery(`
        SELECT 
          status,
          COUNT(*) as count,
          AVG(DATEDIFF(COALESCE(end_date, NOW()), start_date)) as avg_duration
        FROM projects 
        WHERE tenant_id = ? 
        GROUP BY status
      `, [tenantId]),
      
      this.db.executeQuery(`
        SELECT 
          COUNT(*) as total_projects,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
          SUM(CASE WHEN status = 'planning' THEN 1 ELSE 0 END) as planning,
          SUM(CASE WHEN end_date < NOW() AND status != 'completed' THEN 1 ELSE 0 END) as overdue
        FROM projects 
        WHERE tenant_id = ?
      `, [tenantId]),
      
      this.db.executeQuery(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as projects_started
        FROM projects 
        WHERE tenant_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month
      `, [tenantId])
    ]);

    return {
      statusBreakdown: projects,
      summary: (phases as any[])[0] || {},
      timeline: timeline
    };
  }

  /**
   * Financial Summary Analytics
   */
  private async getFinancialSummary(tenantId: string): Promise<any> {
    const [budget, expenses, revenue] = await Promise.all([
      this.db.executeQuery(`
        SELECT 
          SUM(budget) as total_budget,
          SUM(CASE WHEN status = 'completed' THEN budget ELSE 0 END) as completed_budget,
          AVG(budget) as avg_budget
        FROM projects 
        WHERE tenant_id = ?
      `, [tenantId]),
      
      this.db.executeQuery(`
        SELECT 
          category,
          SUM(amount) as total_amount,
          COUNT(*) as count
        FROM expenses 
        WHERE tenant_id = ?
        GROUP BY category
      `, [tenantId]),
      
      this.db.executeQuery(`
        SELECT 
          DATE_FORMAT(date, '%Y-%m') as month,
          SUM(amount) as monthly_expenses
        FROM expenses 
        WHERE tenant_id = ? AND date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(date, '%Y-%m')
        ORDER BY month
      `, [tenantId])
    ]);

    return {
      budgetSummary: (budget as any[])[0] || {},
      expensesByCategory: expenses,
      monthlyTrend: revenue
    };
  }

  /**
   * Task Metrics Analytics
   */
  private async getTaskMetrics(tenantId: string): Promise<any> {
    const [status, priority, productivity] = await Promise.all([
      this.db.executeQuery(`
        SELECT 
          status,
          priority,
          COUNT(*) as count,
          AVG(DATEDIFF(COALESCE(completed_at, NOW()), created_at)) as avg_completion_days
        FROM tasks 
        WHERE tenant_id = ?
        GROUP BY status, priority
      `, [tenantId]),
      
      this.db.executeQuery(`
        SELECT 
          assigned_to,
          COUNT(*) as total_tasks,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
          AVG(DATEDIFF(COALESCE(completed_at, NOW()), created_at)) as avg_completion_time
        FROM tasks t
        WHERE tenant_id = ? AND assigned_to IS NOT NULL
        GROUP BY assigned_to
      `, [tenantId]),
      
      this.db.executeQuery(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m-%d') as date,
          COUNT(*) as tasks_created,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as tasks_completed
        FROM tasks 
        WHERE tenant_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
        ORDER BY date
      `, [tenantId])
    ]);

    return {
      statusAndPriority: status,
      teamProductivity: priority,
      dailyActivity: productivity
    };
  }

  /**
   * Team Performance Analytics
   */
  private async getTeamPerformance(tenantId: string): Promise<any> {
    const [performance, workload, efficiency] = await Promise.all([
      this.db.executeQuery(`
        SELECT 
          u.name,
          u.role,
          COUNT(t.id) as total_tasks,
          SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
          AVG(CASE WHEN t.status = 'completed' 
              THEN DATEDIFF(t.completed_at, t.created_at) 
              ELSE NULL END) as avg_completion_time,
          COUNT(p.id) as projects_involved
        FROM users u
        LEFT JOIN tasks t ON u.id = t.assigned_to AND t.tenant_id = ?
        LEFT JOIN project_members pm ON u.id = pm.user_id
        LEFT JOIN projects p ON pm.project_id = p.id AND p.tenant_id = ?
        WHERE u.tenant_id = ?
        GROUP BY u.id, u.name, u.role
      `, [tenantId, tenantId, tenantId]),
      
      this.db.executeQuery(`
        SELECT 
          u.name,
          COUNT(CASE WHEN t.status = 'pending' THEN 1 END) as pending_tasks,
          COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as active_tasks,
          COUNT(CASE WHEN t.priority = 'high' THEN 1 END) as high_priority_tasks
        FROM users u
        LEFT JOIN tasks t ON u.id = t.assigned_to AND t.tenant_id = ?
        WHERE u.tenant_id = ?
        GROUP BY u.id, u.name
      `, [tenantId, tenantId]),
      
      this.db.executeQuery(`
        SELECT 
          DATE_FORMAT(t.created_at, '%Y-%m') as month,
          u.name,
          COUNT(*) as tasks_assigned,
          SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as tasks_completed
        FROM users u
        LEFT JOIN tasks t ON u.id = t.assigned_to AND t.tenant_id = ?
        WHERE u.tenant_id = ? AND t.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(t.created_at, '%Y-%m'), u.id, u.name
        ORDER BY month, u.name
      `, [tenantId, tenantId])
    ]);

    return {
      individualPerformance: performance,
      currentWorkload: workload,
      monthlyEfficiency: efficiency
    };
  }

  /**
   * Safety Metrics Analytics
   */
  private async getSafetyMetrics(tenantId: string): Promise<any> {
    const [incidents, trends, projects] = await Promise.all([
      this.db.executeQuery(`
        SELECT 
          severity,
          type,
          COUNT(*) as count,
          AVG(DATEDIFF(COALESCE(resolved_at, NOW()), incident_date)) as avg_resolution_days
        FROM safety_incidents 
        WHERE tenant_id = ?
        GROUP BY severity, type
      `, [tenantId]),
      
      this.db.executeQuery(`
        SELECT 
          DATE_FORMAT(incident_date, '%Y-%m') as month,
          COUNT(*) as incident_count,
          SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high_severity
        FROM safety_incidents 
        WHERE tenant_id = ? AND incident_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(incident_date, '%Y-%m')
        ORDER BY month
      `, [tenantId]),
      
      this.db.executeQuery(`
        SELECT 
          p.name as project_name,
          COUNT(si.id) as incident_count,
          SUM(CASE WHEN si.severity = 'high' THEN 1 ELSE 0 END) as high_severity_count
        FROM projects p
        LEFT JOIN safety_incidents si ON p.id = si.project_id
        WHERE p.tenant_id = ?
        GROUP BY p.id, p.name
        HAVING incident_count > 0
        ORDER BY incident_count DESC
      `, [tenantId])
    ]);

    return {
      incidentsByType: incidents,
      monthlyTrends: trends,
      projectRisks: projects
    };
  }

  /**
   * Equipment Utilization Analytics
   */
  private async getEquipmentUtilization(tenantId: string): Promise<any> {
    const [utilization, maintenance, costs] = await Promise.all([
      this.db.executeQuery(`
        SELECT 
          name,
          type,
          status,
          purchase_cost,
          DATEDIFF(NOW(), purchase_date) as age_days,
          maintenance_cost
        FROM equipment 
        WHERE tenant_id = ?
        ORDER BY purchase_cost DESC
      `, [tenantId]),
      
      this.db.executeQuery(`
        SELECT 
          type,
          AVG(maintenance_cost) as avg_maintenance_cost,
          COUNT(*) as equipment_count,
          SUM(CASE WHEN status = 'operational' THEN 1 ELSE 0 END) as operational_count
        FROM equipment 
        WHERE tenant_id = ?
        GROUP BY type
      `, [tenantId]),
      
      this.db.executeQuery(`
        SELECT 
          DATE_FORMAT(purchase_date, '%Y') as year,
          SUM(purchase_cost) as total_purchases,
          SUM(maintenance_cost) as total_maintenance,
          COUNT(*) as equipment_acquired
        FROM equipment 
        WHERE tenant_id = ?
        GROUP BY DATE_FORMAT(purchase_date, '%Y')
        ORDER BY year DESC
      `, [tenantId])
    ]);

    return {
      equipmentStatus: utilization,
      maintenanceSummary: maintenance,
      yearlyInvestment: costs
    };
  }

  /**
   * Generate executive dashboard data
   */
  async getExecutiveDashboard(tenantId: string): Promise<any> {
    const [kpis, alerts, trends] = await Promise.all([
      this.getKPIs(tenantId),
      this.getAlerts(tenantId),
      this.getTrends(tenantId)
    ]);

    return {
      kpis,
      alerts,
      trends,
      generatedAt: new Date()
    };
  }

  /**
   * Get Key Performance Indicators
   */
  private async getKPIs(tenantId: string): Promise<any> {
    const result = await this.db.executeQuery(`
      SELECT 
        (SELECT COUNT(*) FROM projects WHERE tenant_id = ? AND status = 'active') as active_projects,
        (SELECT COUNT(*) FROM tasks WHERE tenant_id = ? AND status = 'pending') as pending_tasks,
        (SELECT COUNT(*) FROM users WHERE tenant_id = ?) as team_size,
        (SELECT SUM(budget) FROM projects WHERE tenant_id = ?) as total_budget,
        (SELECT SUM(amount) FROM expenses WHERE tenant_id = ? AND date >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as monthly_expenses,
        (SELECT COUNT(*) FROM safety_incidents WHERE tenant_id = ? AND incident_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as monthly_incidents
    `, [tenantId, tenantId, tenantId, tenantId, tenantId, tenantId]) as QueryResult;

    return (result as any[])[0] || {};
  }

  /**
   * Get system alerts
   */
  private async getAlerts(tenantId: string): Promise<any[]> {
    const alerts = [];

    // Overdue projects
    const overdueProjects = await this.db.executeQuery(`
      SELECT name, end_date 
      FROM projects 
      WHERE tenant_id = ? AND end_date < NOW() AND status != 'completed'
      LIMIT 5
    `, [tenantId]) as QueryResult;

    for (const project of overdueProjects as any[]) {
      alerts.push({
        type: 'warning',
        title: 'Overdue Project',
        message: `${project.name} is overdue`,
        priority: 'high'
      });
    }

    // High-severity safety incidents
    const recentIncidents = await this.db.executeQuery(`
      SELECT description, incident_date
      FROM safety_incidents
      WHERE tenant_id = ? AND severity = 'high' AND incident_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      LIMIT 3
    `, [tenantId]) as QueryResult;

    for (const incident of recentIncidents as any[]) {
      alerts.push({
        type: 'error',
        title: 'Safety Incident',
        message: incident.description,
        priority: 'critical'
      });
    }

    return alerts;
  }

  /**
   * Get trend data
   */
  private async getTrends(tenantId: string): Promise<any> {
    const [projectTrends, financialTrends, productivityTrends] = await Promise.all([
      this.db.executeQuery(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as projects_started
        FROM projects 
        WHERE tenant_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY month
        ORDER BY month
      `, [tenantId]),
      
      this.db.executeQuery(`
        SELECT 
          DATE_FORMAT(date, '%Y-%m') as month,
          SUM(amount) as expenses
        FROM expenses 
        WHERE tenant_id = ? AND date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY month
        ORDER BY month
      `, [tenantId]),
      
      this.db.executeQuery(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as tasks_created,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as tasks_completed
        FROM tasks 
        WHERE tenant_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY month
        ORDER BY month
      `, [tenantId])
    ]);

    return {
      projects: projectTrends,
      financial: financialTrends,
      productivity: productivityTrends
    };
  }

  /**
   * Helper methods
   */
  private async getReportDefinition(reportId: string, tenantId: string): Promise<ReportDefinition | null> {
    const result = await this.db.executeQuery(`
      SELECT * FROM report_definitions
      WHERE id = ? AND tenant_id = ?
    `, [reportId, tenantId]) as QueryResult;

    if (result.length === 0) return null;

    const row = (result as any)[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      type: row.type,
      category: row.category,
      query: row.query,
      parameters: JSON.parse(row.parameters),
      visualizations: JSON.parse(row.visualizations),
      accessRoles: JSON.parse(row.access_roles),
      isPublic: row.is_public,
      refreshInterval: row.refresh_interval,
      tenantId: row.tenant_id,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private async hasReportAccess(report: ReportDefinition, userId: string, tenantId: string): Promise<boolean> {
    if (report.isPublic) return true;

    const result = await this.db.executeQuery(`
      SELECT role FROM users WHERE id = ? AND tenant_id = ?
    `, [userId, tenantId]) as QueryResult;

    if (result.length === 0) return false;

    const userRole = (result as any)[0].role;
    return report.accessRoles.includes(userRole);
  }

  private getCacheKey(reportId: string, parameters: any): string {
    return `${reportId}_${JSON.stringify(parameters)}`;
  }

  private async createExecutionFromCache(
    executionId: string,
    reportId: string,
    parameters: any,
    userId: string,
    tenantId: string,
    data: any
  ): Promise<string> {
    await this.db.executeQuery(`
      INSERT INTO report_executions
      (id, report_id, parameters, status, result, executed_by, executed_at, completed_at, tenant_id)
      VALUES (?, ?, ?, 'completed', ?, ?, NOW(), NOW(), ?)
    `, [executionId, reportId, JSON.stringify(parameters), JSON.stringify(data), userId, tenantId]);

    return executionId;
  }

  /**
   * Express middleware for reporting operations
   */
  middleware() {
    return {
      /**
       * Get analytics dashboard
       */
      getAnalytics: async (req: Request, res: Response) => {
        try {
          const tenantId = (req as any).tenantId;
          const analytics = await this.getAnalyticsReports(tenantId);

          res.json({
            success: true,
            data: analytics
          });
        } catch (error) {
          console.error('Analytics error:', error);
          res.status(500).json({ error: 'Failed to get analytics' });
        }
      },

      /**
       * Get executive dashboard
       */
      getExecutiveDashboard: async (req: Request, res: Response) => {
        try {
          const tenantId = (req as any).tenantId;
          const dashboard = await this.getExecutiveDashboard(tenantId);

          res.json({
            success: true,
            data: dashboard
          });
        } catch (error) {
          console.error('Executive dashboard error:', error);
          res.status(500).json({ error: 'Failed to get executive dashboard' });
        }
      },

      /**
       * Execute custom report
       */
      executeReport: async (req: Request, res: Response) => {
        try {
          const { reportId } = req.params;
          const { parameters } = req.body;
          const userId = (req as any).user.id;
          const tenantId = (req as any).tenantId;

          const executionId = await this.executeReport(reportId, parameters, userId, tenantId);

          res.json({
            success: true,
            executionId
          });
        } catch (error) {
          console.error('Report execution error:', error);
          res.status(500).json({ error: 'Failed to execute report' });
        }
      }
    };
  }
}