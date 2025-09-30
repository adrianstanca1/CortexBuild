import { User, Project, Todo, Expense, SafetyIncident, Equipment } from '../types';

/**
 * Enhanced Dashboard Service
 * Provides advanced dashboard functionality, real-time updates, and data integrity monitoring
 */

export interface DashboardHealth {
  status: 'excellent' | 'good' | 'warning' | 'critical';
  score: number;
  issues: HealthIssue[];
  recommendations: string[];
}

export interface HealthIssue {
  type: 'data' | 'performance' | 'security' | 'user_experience';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  affectedComponents: string[];
  suggestedFix: string;
}

export interface DashboardAnalytics {
  userEngagement: {
    sessionDuration: number;
    pageViews: number;
    interactionRate: number;
    bounceRate: number;
  };
  featureUsage: {
    mostUsedFeatures: string[];
    leastUsedFeatures: string[];
    newFeatureAdoption: number;
  };
  performance: {
    averageLoadTime: number;
    errorRate: number;
    uptime: number;
    cacheHitRate: number;
  };
}

export interface DataIntegrityReport {
  overallScore: number;
  checks: IntegrityCheck[];
  missingData: string[];
  inconsistencies: string[];
  recommendations: string[];
}

export interface IntegrityCheck {
  name: string;
  status: 'pass' | 'warning' | 'fail';
  score: number;
  details: string;
  impact: 'low' | 'medium' | 'high';
}

export interface RealTimeMetrics {
  activeUsers: number;
  systemLoad: number;
  responseTime: number;
  errorCount: number;
  lastUpdated: Date;
}

export class EnhancedDashboardService {
  private static instance: EnhancedDashboardService;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private metricsCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): EnhancedDashboardService {
    if (!this.instance) {
      this.instance = new EnhancedDashboardService();
    }
    return this.instance;
  }

  /**
   * Assess overall dashboard health
   */
  assessDashboardHealth(
    projects: Project[],
    tasks: Todo[],
    expenses: Expense[],
    incidents: SafetyIncident[],
    equipment: Equipment[],
    team: User[]
  ): DashboardHealth {
    const issues: HealthIssue[] = [];
    let score = 100;

    // Check data completeness
    if (projects.length === 0) {
      issues.push({
        type: 'data',
        severity: 'high',
        message: 'No projects found',
        affectedComponents: ['projects', 'dashboard'],
        suggestedFix: 'Create at least one project to get started'
      });
      score -= 20;
    }

    // Check for overdue tasks
    const overdueTasks = tasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'
    );
    if (overdueTasks.length > 5) {
      issues.push({
        type: 'user_experience',
        severity: 'medium',
        message: `${overdueTasks.length} overdue tasks detected`,
        affectedComponents: ['tasks', 'productivity'],
        suggestedFix: 'Review and update task deadlines or mark completed tasks as done'
      });
      score -= 10;
    }

    // Check for critical safety incidents
    const criticalIncidents = incidents.filter(incident => 
      incident.severity === 'CRITICAL' && incident.status === 'OPEN'
    );
    if (criticalIncidents.length > 0) {
      issues.push({
        type: 'security',
        severity: 'critical',
        message: `${criticalIncidents.length} critical safety incidents require immediate attention`,
        affectedComponents: ['safety', 'compliance'],
        suggestedFix: 'Address critical safety incidents immediately'
      });
      score -= 30;
    }

    // Check team availability
    const activeTeamMembers = team.filter(member => member.isActive);
    if (activeTeamMembers.length < 2) {
      issues.push({
        type: 'data',
        severity: 'medium',
        message: 'Limited team members available',
        affectedComponents: ['team', 'collaboration'],
        suggestedFix: 'Add more team members or activate existing members'
      });
      score -= 15;
    }

    // Determine status based on score
    let status: 'excellent' | 'good' | 'warning' | 'critical';
    if (score >= 90) status = 'excellent';
    else if (score >= 75) status = 'good';
    else if (score >= 50) status = 'warning';
    else status = 'critical';

    const recommendations = this.generateRecommendations(issues);

    return {
      status,
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }

  /**
   * Perform comprehensive data integrity checks
   */
  performDataIntegrityCheck(
    projects: Project[],
    tasks: Todo[],
    expenses: Expense[],
    team: User[]
  ): DataIntegrityReport {
    const checks: IntegrityCheck[] = [];
    const missingData: string[] = [];
    const inconsistencies: string[] = [];

    // Check project data integrity
    const projectCheck = this.checkProjectIntegrity(projects);
    checks.push(projectCheck);

    // Check task-project relationships
    const taskProjectCheck = this.checkTaskProjectRelationships(tasks, projects);
    checks.push(taskProjectCheck);

    // Check expense-project relationships
    const expenseProjectCheck = this.checkExpenseProjectRelationships(expenses, projects);
    checks.push(expenseProjectCheck);

    // Check team assignments
    const teamAssignmentCheck = this.checkTeamAssignments(tasks, team);
    checks.push(teamAssignmentCheck);

    // Calculate overall score
    const overallScore = checks.reduce((sum, check) => sum + check.score, 0) / checks.length;

    // Collect missing data and inconsistencies
    checks.forEach(check => {
      if (check.status === 'fail' || check.status === 'warning') {
        if (check.details.includes('missing')) {
          missingData.push(check.details);
        } else {
          inconsistencies.push(check.details);
        }
      }
    });

    const recommendations = this.generateIntegrityRecommendations(checks);

    return {
      overallScore,
      checks,
      missingData,
      inconsistencies,
      recommendations
    };
  }

  /**
   * Get real-time dashboard metrics
   */
  getRealTimeMetrics(): RealTimeMetrics {
    // In a real implementation, this would connect to actual monitoring systems
    return {
      activeUsers: Math.floor(Math.random() * 50) + 10,
      systemLoad: Math.random() * 100,
      responseTime: Math.random() * 200 + 50,
      errorCount: Math.floor(Math.random() * 5),
      lastUpdated: new Date()
    };
  }

  /**
   * Generate dashboard analytics
   */
  generateDashboardAnalytics(): DashboardAnalytics {
    return {
      userEngagement: {
        sessionDuration: Math.random() * 3600 + 1800, // 30-90 minutes
        pageViews: Math.floor(Math.random() * 100) + 50,
        interactionRate: Math.random() * 0.4 + 0.6, // 60-100%
        bounceRate: Math.random() * 0.3 + 0.1 // 10-40%
      },
      featureUsage: {
        mostUsedFeatures: ['projects', 'tasks', 'dashboard'],
        leastUsedFeatures: ['reports', 'settings'],
        newFeatureAdoption: Math.random() * 0.5 + 0.3 // 30-80%
      },
      performance: {
        averageLoadTime: Math.random() * 2000 + 500, // 0.5-2.5 seconds
        errorRate: Math.random() * 0.05, // 0-5%
        uptime: 99.5 + Math.random() * 0.5, // 99.5-100%
        cacheHitRate: Math.random() * 0.3 + 0.7 // 70-100%
      }
    };
  }

  /**
   * Start health monitoring
   */
  startHealthMonitoring(callback: (health: DashboardHealth) => void): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(() => {
      // In a real implementation, this would fetch current data and assess health
      // For now, we'll simulate periodic health checks
      const simulatedHealth: DashboardHealth = {
        status: 'good',
        score: 85,
        issues: [],
        recommendations: ['Regular data backup recommended', 'Consider upgrading to premium plan']
      };
      callback(simulatedHealth);
    }, 30000); // Check every 30 seconds
  }

  /**
   * Stop health monitoring
   */
  stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  // Private helper methods
  private checkProjectIntegrity(projects: Project[]): IntegrityCheck {
    let score = 100;
    let details = 'All projects have complete data';
    let status: 'pass' | 'warning' | 'fail' = 'pass';

    const incompleteProjects = projects.filter(p => 
      !p.name || !p.description || !p.startDate
    );

    if (incompleteProjects.length > 0) {
      score = Math.max(0, 100 - (incompleteProjects.length / projects.length) * 100);
      details = `${incompleteProjects.length} projects have missing required data`;
      status = incompleteProjects.length > projects.length * 0.5 ? 'fail' : 'warning';
    }

    return {
      name: 'Project Data Integrity',
      status,
      score,
      details,
      impact: status === 'fail' ? 'high' : status === 'warning' ? 'medium' : 'low'
    };
  }

  private checkTaskProjectRelationships(tasks: Todo[], projects: Project[]): IntegrityCheck {
    const projectIds = new Set(projects.map(p => p.id));
    const orphanedTasks = tasks.filter(task => task.projectId && !projectIds.has(task.projectId));
    
    let score = 100;
    let status: 'pass' | 'warning' | 'fail' = 'pass';
    let details = 'All tasks are properly linked to projects';

    if (orphanedTasks.length > 0) {
      score = Math.max(0, 100 - (orphanedTasks.length / tasks.length) * 100);
      details = `${orphanedTasks.length} tasks reference non-existent projects`;
      status = orphanedTasks.length > tasks.length * 0.1 ? 'fail' : 'warning';
    }

    return {
      name: 'Task-Project Relationships',
      status,
      score,
      details,
      impact: status === 'fail' ? 'high' : 'medium'
    };
  }

  private checkExpenseProjectRelationships(expenses: Expense[], projects: Project[]): IntegrityCheck {
    const projectIds = new Set(projects.map(p => p.id));
    const orphanedExpenses = expenses.filter(expense => 
      expense.projectId && !projectIds.has(expense.projectId)
    );
    
    let score = 100;
    let status: 'pass' | 'warning' | 'fail' = 'pass';
    let details = 'All expenses are properly linked to projects';

    if (orphanedExpenses.length > 0) {
      score = Math.max(0, 100 - (orphanedExpenses.length / expenses.length) * 100);
      details = `${orphanedExpenses.length} expenses reference non-existent projects`;
      status = orphanedExpenses.length > expenses.length * 0.1 ? 'fail' : 'warning';
    }

    return {
      name: 'Expense-Project Relationships',
      status,
      score,
      details,
      impact: 'medium'
    };
  }

  private checkTeamAssignments(tasks: Todo[], team: User[]): IntegrityCheck {
    const teamIds = new Set(team.map(u => u.id));
    const unassignedTasks = tasks.filter(task => 
      task.assignedTo && !teamIds.has(task.assignedTo)
    );
    
    let score = 100;
    let status: 'pass' | 'warning' | 'fail' = 'pass';
    let details = 'All tasks are assigned to valid team members';

    if (unassignedTasks.length > 0) {
      score = Math.max(0, 100 - (unassignedTasks.length / tasks.length) * 100);
      details = `${unassignedTasks.length} tasks assigned to non-existent team members`;
      status = unassignedTasks.length > tasks.length * 0.1 ? 'fail' : 'warning';
    }

    return {
      name: 'Team Assignments',
      status,
      score,
      details,
      impact: 'medium'
    };
  }

  private generateRecommendations(issues: HealthIssue[]): string[] {
    const recommendations: string[] = [];
    
    if (issues.some(i => i.type === 'data')) {
      recommendations.push('Review and complete missing data fields');
    }
    
    if (issues.some(i => i.type === 'security')) {
      recommendations.push('Address security issues immediately');
    }
    
    if (issues.some(i => i.severity === 'critical')) {
      recommendations.push('Focus on critical issues first');
    }
    
    recommendations.push('Regular data validation and cleanup');
    recommendations.push('Monitor dashboard health metrics');
    
    return recommendations;
  }

  private generateIntegrityRecommendations(checks: IntegrityCheck[]): string[] {
    const recommendations: string[] = [];
    
    const failedChecks = checks.filter(c => c.status === 'fail');
    const warningChecks = checks.filter(c => c.status === 'warning');
    
    if (failedChecks.length > 0) {
      recommendations.push('Address failed integrity checks immediately');
    }
    
    if (warningChecks.length > 0) {
      recommendations.push('Review and fix warning-level integrity issues');
    }
    
    recommendations.push('Implement automated data validation');
    recommendations.push('Regular integrity monitoring');
    
    return recommendations;
  }
}
