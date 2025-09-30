import { pool } from './db.js';
import { logger } from '../utils/logger.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

/**
 * Backend Integration Service
 * Provides unified data access and business logic for the ASAgents platform
 */

export interface DashboardData {
  projects: any[];
  tasks: any[];
  expenses: any[];
  team: any[];
  notifications: any[];
  portfolioSummary: any;
  operationalInsights: any;
  metadata: any;
}

export interface ProjectFilters {
  status?: string;
  ownerId?: number;
  startDate?: string;
  endDate?: string;
}

export interface TaskFilters {
  projectId?: number;
  assignedTo?: number;
  status?: string;
  priority?: string;
  dueDate?: string;
}

export class IntegrationService {
  /**
   * Get comprehensive dashboard data for a tenant
   */
  static async getDashboardData(tenantId: number, userId: number): Promise<DashboardData> {
    try {
      // Get recent projects
      const [projects] = await pool.query<RowDataPacket[]>(
        `SELECT p.*, 
                COUNT(t.id) as task_count,
                SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as completed_tasks,
                COALESCE(SUM(e.amount), 0) as total_expenses
         FROM projects p
         LEFT JOIN tasks t ON p.id = t.project_id
         LEFT JOIN expenses e ON p.id = e.project_id AND e.status = 'approved'
         WHERE p.tenant_id = ?
         GROUP BY p.id
         ORDER BY p.updated_at DESC
         LIMIT 10`,
        [tenantId]
      );

      // Get recent tasks
      const [tasks] = await pool.query<RowDataPacket[]>(
        `SELECT t.*, 
                p.name as project_name,
                CONCAT(u.first_name, ' ', u.last_name) as assigned_user_name
         FROM tasks t
         LEFT JOIN projects p ON t.project_id = p.id
         LEFT JOIN users u ON t.assigned_to = u.id
         WHERE p.tenant_id = ?
         ORDER BY t.updated_at DESC
         LIMIT 20`,
        [tenantId]
      );

      // Get recent expenses
      const [expenses] = await pool.query<RowDataPacket[]>(
        `SELECT e.*, 
                p.name as project_name,
                CONCAT(u.first_name, ' ', u.last_name) as user_name
         FROM expenses e
         LEFT JOIN projects p ON e.project_id = p.id
         LEFT JOIN users u ON e.user_id = u.id
         WHERE p.tenant_id = ?
         ORDER BY e.created_at DESC
         LIMIT 15`,
        [tenantId]
      );

      // Get team members
      const [team] = await pool.query<RowDataPacket[]>(
        `SELECT id, email, first_name, last_name, role, is_active, last_login_at, created_at
         FROM users
         WHERE tenant_id = ? AND is_active = TRUE
         ORDER BY first_name, last_name`,
        [tenantId]
      );

      // Get recent notifications
      const [notifications] = await pool.query<RowDataPacket[]>(
        `SELECT id, type, title, message, is_read, created_at
         FROM notifications 
         WHERE user_id = ? AND tenant_id = ?
         ORDER BY created_at DESC
         LIMIT 10`,
        [userId, tenantId]
      );

      // Calculate portfolio summary
      const portfolioSummary = await this.calculatePortfolioSummary(tenantId);

      // Generate operational insights
      const operationalInsights = await this.generateOperationalInsights(tenantId);

      return {
        projects: projects.map(this.formatProject),
        tasks: tasks.map(this.formatTask),
        expenses: expenses.map(this.formatExpense),
        team: team.map(this.formatUser),
        notifications: notifications.map(this.formatNotification),
        portfolioSummary,
        operationalInsights,
        metadata: {
          source: 'backend',
          generatedAt: new Date().toISOString(),
          usedFallback: false,
          projectCount: projects.length,
          taskCount: tasks.length,
          teamSize: team.length
        }
      };
    } catch (error) {
      logger.error({ error }, 'Failed to get dashboard data');
      throw new Error('Failed to retrieve dashboard data');
    }
  }

  /**
   * Get projects with filtering
   */
  static async getProjects(tenantId: number, filters: ProjectFilters = {}): Promise<any[]> {
    let query = `
      SELECT p.*, 
             COUNT(t.id) as task_count,
             SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as completed_tasks,
             COALESCE(SUM(e.amount), 0) as total_expenses
      FROM projects p
      LEFT JOIN tasks t ON p.id = t.project_id
      LEFT JOIN expenses e ON p.id = e.project_id AND e.status = 'approved'
      WHERE p.tenant_id = ?
    `;
    
    const params: any[] = [tenantId];

    if (filters.status) {
      query += ' AND p.status = ?';
      params.push(filters.status);
    }

    if (filters.ownerId) {
      query += ' AND p.owner_id = ?';
      params.push(filters.ownerId);
    }

    if (filters.startDate) {
      query += ' AND p.start_date >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      query += ' AND p.end_date <= ?';
      params.push(filters.endDate);
    }

    query += ' GROUP BY p.id ORDER BY p.updated_at DESC';

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return rows.map(this.formatProject);
  }

  /**
   * Get tasks with filtering
   */
  static async getTasks(tenantId: number, filters: TaskFilters = {}): Promise<any[]> {
    let query = `
      SELECT t.*, 
             p.name as project_name,
             CONCAT(au.first_name, ' ', au.last_name) as assigned_user_name,
             CONCAT(cu.first_name, ' ', cu.last_name) as created_by_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users au ON t.assigned_to = au.id
      LEFT JOIN users cu ON t.created_by = cu.id
      WHERE p.tenant_id = ?
    `;
    
    const params: any[] = [tenantId];

    if (filters.projectId) {
      query += ' AND t.project_id = ?';
      params.push(filters.projectId);
    }

    if (filters.assignedTo) {
      query += ' AND t.assigned_to = ?';
      params.push(filters.assignedTo);
    }

    if (filters.status) {
      query += ' AND t.status = ?';
      params.push(filters.status);
    }

    if (filters.priority) {
      query += ' AND t.priority = ?';
      params.push(filters.priority);
    }

    if (filters.dueDate) {
      query += ' AND DATE(t.due_date) = ?';
      params.push(filters.dueDate);
    }

    query += ' ORDER BY t.updated_at DESC';

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return rows.map(this.formatTask);
  }

  /**
   * Calculate portfolio summary statistics
   */
  private static async calculatePortfolioSummary(tenantId: number): Promise<any> {
    const [projectStats] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total_projects,
        SUM(CASE WHEN status IN ('active', 'in_progress') THEN 1 ELSE 0 END) as active_projects,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_projects,
        COALESCE(SUM(budget), 0) as total_budget
       FROM projects 
       WHERE tenant_id = ?`,
      [tenantId]
    );

    const [taskStats] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN due_date < NOW() AND status != 'done' THEN 1 ELSE 0 END) as overdue_tasks
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE p.tenant_id = ?`,
      [tenantId]
    );

    const [expenseStats] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) as total_spent,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_expenses
       FROM expenses e
       JOIN projects p ON e.project_id = p.id
       WHERE p.tenant_id = ?`,
      [tenantId]
    );

    const project = projectStats[0] || {};
    const task = taskStats[0] || {};
    const expense = expenseStats[0] || {};

    return {
      totalProjects: project.total_projects || 0,
      activeProjects: project.active_projects || 0,
      completedProjects: project.completed_projects || 0,
      totalBudget: project.total_budget || 0,
      totalSpent: expense.total_spent || 0,
      budgetUtilization: project.total_budget > 0 
        ? ((expense.total_spent || 0) / project.total_budget) * 100 
        : 0,
      completionRate: project.total_projects > 0 
        ? ((project.completed_projects || 0) / project.total_projects) * 100 
        : 0,
      taskCompletionRate: task.total_tasks > 0 
        ? ((task.completed_tasks || 0) / task.total_tasks) * 100 
        : 0,
      overdueTasksCount: task.overdue_tasks || 0,
      pendingExpensesCount: expense.pending_expenses || 0
    };
  }

  /**
   * Generate operational insights
   */
  private static async generateOperationalInsights(tenantId: number): Promise<any> {
    const portfolioSummary = await this.calculatePortfolioSummary(tenantId);
    
    return {
      projectHealth: portfolioSummary.activeProjects > 0 ? 'good' : 'attention',
      taskBacklog: portfolioSummary.overdueTasksCount,
      budgetStatus: portfolioSummary.budgetUtilization > 90 ? 'critical' : 
                   portfolioSummary.budgetUtilization > 75 ? 'warning' : 'good',
      teamUtilization: 85, // This would need more complex calculation
      upcomingDeadlines: portfolioSummary.overdueTasksCount,
      recommendations: this.generateRecommendations(portfolioSummary)
    };
  }

  /**
   * Generate recommendations based on data
   */
  private static generateRecommendations(portfolioSummary: any): string[] {
    const recommendations: string[] = [];

    if (portfolioSummary.budgetUtilization > 90) {
      recommendations.push('Budget utilization is high. Consider reviewing project expenses.');
    }

    if (portfolioSummary.overdueTasksCount > 5) {
      recommendations.push('Multiple overdue tasks detected. Review task assignments and deadlines.');
    }

    if (portfolioSummary.completionRate < 50) {
      recommendations.push('Project completion rate is low. Consider reviewing project timelines.');
    }

    if (portfolioSummary.taskCompletionRate < 60) {
      recommendations.push('Task completion rate needs improvement. Consider team capacity planning.');
    }

    return recommendations;
  }

  /**
   * Format project data for frontend
   */
  private static formatProject(row: any): any {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      ownerId: row.owner_id,
      code: row.code,
      name: row.name,
      description: row.description,
      status: row.status,
      budget: row.budget,
      progress: row.progress,
      priority: row.priority,
      startDate: row.start_date,
      endDate: row.end_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      taskCount: row.task_count || 0,
      completedTasks: row.completed_tasks || 0,
      totalExpenses: row.total_expenses || 0
    };
  }

  /**
   * Format task data for frontend
   */
  private static formatTask(row: any): any {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      projectId: row.project_id,
      assignedTo: row.assigned_to,
      createdBy: row.created_by,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      progress: row.progress,
      dueDate: row.due_date,
      completedAt: row.completed_at,
      estimatedHours: row.estimated_hours,
      actualHours: row.actual_hours,
      tags: row.tags ? JSON.parse(row.tags) : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      projectName: row.project_name,
      assignedUserName: row.assigned_user_name,
      createdByName: row.created_by_name
    };
  }

  /**
   * Format expense data for frontend
   */
  private static formatExpense(row: any): any {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      projectId: row.project_id,
      userId: row.user_id,
      category: row.category,
      description: row.description,
      amount: row.amount,
      expenseDate: row.expense_date,
      status: row.status,
      receiptUrl: row.receipt_url,
      notes: row.notes,
      approvedBy: row.approved_by,
      approvedAt: row.approved_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      projectName: row.project_name,
      userName: row.user_name
    };
  }

  /**
   * Format user data for frontend
   */
  private static formatUser(row: any): any {
    return {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role,
      phone: row.phone,
      avatarUrl: row.avatar_url,
      isActive: row.is_active,
      lastLogin: row.last_login_at,
      createdAt: row.created_at
    };
  }

  /**
   * Format notification data for frontend
   */
  private static formatNotification(row: any): any {
    return {
      id: row.id,
      type: row.type,
      title: row.title,
      message: row.message,
      data: row.data ? JSON.parse(row.data) : null,
      isRead: row.is_read,
      createdAt: row.created_at
    };
  }
}
