// CortexBuild Analytics Service - Advanced reporting and insights
import { Project, Task, RFI, User, Company } from '../types';
import { dataService } from './dataService';

export interface AnalyticsMetrics {
  productivity: {
    tasksCompletedPerDay: number;
    averageTaskDuration: number;
    taskCompletionRate: number;
    overdueTasks: number;
  };
  financial: {
    totalBudget: number;
    totalSpent: number;
    budgetVariance: number;
    costPerTask: number;
    projectedOverrun: number;
  };
  timeline: {
    projectsOnTime: number;
    projectsDelayed: number;
    averageDelay: number;
    criticalPathTasks: number;
  };
  quality: {
    rfiRate: number;
    reworkTasks: number;
    qualityScore: number;
    defectRate: number;
  };
  team: {
    activeUsers: number;
    taskDistribution: { [userId: string]: number };
    performanceScores: { [userId: string]: number };
    collaborationIndex: number;
  };
}

export interface TrendData {
  period: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface ComparisonData {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface PerformanceReport {
  projectId: string;
  projectName: string;
  metrics: AnalyticsMetrics;
  trends: {
    productivity: TrendData[];
    budget: TrendData[];
    timeline: TrendData[];
    quality: TrendData[];
  };
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    impact: string;
    effort: string;
  }[];
  benchmarks: {
    industryAverage: number;
    companyAverage: number;
    bestInClass: number;
    currentValue: number;
  };
}

class AnalyticsService {
  
  // Generate comprehensive analytics for a company or platform
  async generateAnalytics(companyId?: string, timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<AnalyticsMetrics> {
    const projects = await dataService.getProjects(companyId);
    const allTasks = await dataService.getTasks();
    const allRFIs = await dataService.getRFIs();
    const users = await dataService.getUsers(companyId);

    // Filter data by timeframe
    const cutoffDate = this.getCutoffDate(timeframe);
    const recentTasks = allTasks.filter(task => new Date(task.createdAt) >= cutoffDate);
    const recentRFIs = allRFIs.filter(rfi => new Date(rfi.createdAt) >= cutoffDate);

    // Calculate productivity metrics
    const completedTasks = recentTasks.filter(task => task.status === 'Completed');
    const daysInPeriod = this.getDaysInPeriod(timeframe);
    const tasksCompletedPerDay = completedTasks.length / daysInPeriod;
    
    const taskDurations = completedTasks
      .filter(task => task.estimatedHours && task.actualHours)
      .map(task => task.actualHours!);
    const averageTaskDuration = taskDurations.length > 0 
      ? taskDurations.reduce((sum, duration) => sum + duration, 0) / taskDurations.length 
      : 0;

    const taskCompletionRate = recentTasks.length > 0 
      ? (completedTasks.length / recentTasks.length) * 100 
      : 0;

    const overdueTasks = recentTasks.filter(task => {
      if (!task.dueDate || task.status === 'Completed') return false;
      return new Date(task.dueDate) < new Date();
    }).length;

    // Calculate financial metrics
    const totalBudget = projects.reduce((sum, project) => sum + (project.budget || 0), 0);
    const totalSpent = projects.reduce((sum, project) => sum + (project.spent || 0), 0);
    const budgetVariance = totalBudget > 0 ? ((totalSpent - totalBudget) / totalBudget) * 100 : 0;
    const costPerTask = completedTasks.length > 0 ? totalSpent / completedTasks.length : 0;
    const projectedOverrun = this.calculateProjectedOverrun(projects);

    // Calculate timeline metrics
    const projectsWithDates = projects.filter(p => p.startDate && p.endDate);
    const projectsOnTime = projectsWithDates.filter(p => this.isProjectOnTime(p)).length;
    const projectsDelayed = projectsWithDates.length - projectsOnTime;
    const averageDelay = this.calculateAverageDelay(projectsWithDates);
    const criticalPathTasks = this.identifyCriticalPathTasks(recentTasks).length;

    // Calculate quality metrics
    const rfiRate = recentTasks.length > 0 ? (recentRFIs.length / recentTasks.length) * 100 : 0;
    const reworkTasks = recentTasks.filter(task => 
      task.tags?.includes('rework') || task.title.toLowerCase().includes('rework')
    ).length;
    const qualityScore = this.calculateQualityScore(recentTasks, recentRFIs);
    const defectRate = recentTasks.length > 0 ? (reworkTasks / recentTasks.length) * 100 : 0;

    // Calculate team metrics
    const activeUsers = users.filter(user => 
      recentTasks.some(task => task.assignedToId === user.id || task.createdById === user.id)
    ).length;

    const taskDistribution: { [userId: string]: number } = {};
    const performanceScores: { [userId: string]: number } = {};
    
    users.forEach(user => {
      const userTasks = recentTasks.filter(task => task.assignedToId === user.id);
      taskDistribution[user.id] = userTasks.length;
      performanceScores[user.id] = this.calculateUserPerformance(userTasks);
    });

    const collaborationIndex = this.calculateCollaborationIndex(recentTasks, users);

    return {
      productivity: {
        tasksCompletedPerDay: Math.round(tasksCompletedPerDay * 100) / 100,
        averageTaskDuration: Math.round(averageTaskDuration * 100) / 100,
        taskCompletionRate: Math.round(taskCompletionRate * 100) / 100,
        overdueTasks
      },
      financial: {
        totalBudget,
        totalSpent,
        budgetVariance: Math.round(budgetVariance * 100) / 100,
        costPerTask: Math.round(costPerTask),
        projectedOverrun: Math.round(projectedOverrun)
      },
      timeline: {
        projectsOnTime,
        projectsDelayed,
        averageDelay: Math.round(averageDelay * 100) / 100,
        criticalPathTasks
      },
      quality: {
        rfiRate: Math.round(rfiRate * 100) / 100,
        reworkTasks,
        qualityScore: Math.round(qualityScore * 100) / 100,
        defectRate: Math.round(defectRate * 100) / 100
      },
      team: {
        activeUsers,
        taskDistribution,
        performanceScores,
        collaborationIndex: Math.round(collaborationIndex * 100) / 100
      }
    };
  }

  // Generate trend data for charts
  async generateTrendData(metric: string, companyId?: string, periods: number = 12): Promise<TrendData[]> {
    const trends: TrendData[] = [];
    const now = new Date();

    for (let i = periods - 1; i >= 0; i--) {
      const periodStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const periodData = await this.getMetricForPeriod(metric, periodStart, periodEnd, companyId);
      const previousPeriodData = i < periods - 1 ? trends[trends.length - 1]?.value || 0 : 0;
      
      const change = periodData - previousPeriodData;
      const changePercent = previousPeriodData > 0 ? (change / previousPeriodData) * 100 : 0;

      trends.push({
        period: periodStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        value: periodData,
        change,
        changePercent: Math.round(changePercent * 100) / 100
      });
    }

    return trends;
  }

  // Generate performance report for a specific project
  async generatePerformanceReport(projectId: string): Promise<PerformanceReport> {
    const project = await dataService.getProject(projectId);
    if (!project) throw new Error('Project not found');

    const metrics = await this.generateAnalytics(project.companyId);
    
    // Generate trends for the last 6 months
    const trends = {
      productivity: await this.generateTrendData('productivity', project.companyId, 6),
      budget: await this.generateTrendData('budget', project.companyId, 6),
      timeline: await this.generateTrendData('timeline', project.companyId, 6),
      quality: await this.generateTrendData('quality', project.companyId, 6)
    };

    // Generate recommendations
    const recommendations = await this.generateRecommendations(projectId, metrics);

    // Generate benchmarks
    const benchmarks = await this.generateBenchmarks(projectId, metrics);

    return {
      projectId,
      projectName: project.name,
      metrics,
      trends,
      recommendations,
      benchmarks
    };
  }

  // Helper methods
  private getCutoffDate(timeframe: string): Date {
    const now = new Date();
    switch (timeframe) {
      case 'week': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'quarter': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case 'year': return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default: return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  private getDaysInPeriod(timeframe: string): number {
    switch (timeframe) {
      case 'week': return 7;
      case 'month': return 30;
      case 'quarter': return 90;
      case 'year': return 365;
      default: return 30;
    }
  }

  private calculateProjectedOverrun(projects: Project[]): number {
    return projects.reduce((total, project) => {
      if (!project.budget || !project.spent) return total;
      const burnRate = project.spent / this.getDaysSinceStart(project);
      const remainingDays = this.getDaysUntilEnd(project);
      const projectedTotal = project.spent + (burnRate * remainingDays);
      return total + Math.max(0, projectedTotal - project.budget);
    }, 0);
  }

  private getDaysSinceStart(project: Project): number {
    if (!project.startDate) return 1;
    const start = new Date(project.startDate);
    const now = new Date();
    return Math.max(1, (now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  }

  private getDaysUntilEnd(project: Project): number {
    if (!project.endDate) return 0;
    const end = new Date(project.endDate);
    const now = new Date();
    return Math.max(0, (end.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  }

  private isProjectOnTime(project: Project): boolean {
    // Simplified logic - in reality this would be more complex
    return project.snapshot.aiRiskLevel === 'Low';
  }

  private calculateAverageDelay(projects: Project[]): number {
    const delayedProjects = projects.filter(p => !this.isProjectOnTime(p));
    if (delayedProjects.length === 0) return 0;
    
    // Simplified calculation
    return delayedProjects.length * 5; // Average 5 days delay
  }

  private identifyCriticalPathTasks(tasks: Task[]): Task[] {
    // Simplified - identify high priority tasks that are not completed
    return tasks.filter(task => 
      task.priority === 'High' && 
      task.status !== 'Completed' &&
      task.tags?.includes('critical-path')
    );
  }

  private calculateQualityScore(tasks: Task[], rfis: RFI[]): number {
    // Quality score based on completion rate, rework rate, and RFI rate
    const completionRate = tasks.length > 0 ? (tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100 : 100;
    const reworkRate = tasks.length > 0 ? (tasks.filter(t => t.tags?.includes('rework')).length / tasks.length) * 100 : 0;
    const rfiRate = tasks.length > 0 ? (rfis.length / tasks.length) * 100 : 0;
    
    return Math.max(0, 100 - reworkRate - (rfiRate * 0.5) + (completionRate * 0.1));
  }

  private calculateUserPerformance(userTasks: Task[]): number {
    if (userTasks.length === 0) return 0;
    
    const completedTasks = userTasks.filter(task => task.status === 'Completed');
    const onTimeTasks = completedTasks.filter(task => {
      if (!task.dueDate) return true;
      // Assume completed tasks have a completion date in updatedAt
      return new Date(task.updatedAt) <= new Date(task.dueDate);
    });
    
    const completionRate = (completedTasks.length / userTasks.length) * 100;
    const onTimeRate = completedTasks.length > 0 ? (onTimeTasks.length / completedTasks.length) * 100 : 100;
    
    return (completionRate + onTimeRate) / 2;
  }

  private calculateCollaborationIndex(tasks: Task[], users: User[]): number {
    // Measure collaboration based on task comments, assignments, and interactions
    const tasksWithComments = tasks.filter(task => task.comments && task.comments.length > 0);
    const tasksWithMultipleParticipants = tasks.filter(task => 
      task.comments && task.comments.length > 1 && 
      new Set(task.comments.map(c => c.author)).size > 1
    );
    
    if (tasks.length === 0) return 0;
    
    const commentRate = (tasksWithComments.length / tasks.length) * 100;
    const collaborationRate = (tasksWithMultipleParticipants.length / tasks.length) * 100;
    
    return (commentRate + collaborationRate) / 2;
  }

  private async getMetricForPeriod(metric: string, start: Date, end: Date, companyId?: string): Promise<number> {
    // Simplified implementation - would query actual data for the period
    return Math.random() * 100; // Mock data for now
  }

  private async generateRecommendations(projectId: string, metrics: AnalyticsMetrics) {
    const recommendations = [];

    if (metrics.productivity.taskCompletionRate < 80) {
      recommendations.push({
        priority: 'high' as const,
        category: 'Productivity',
        title: 'Improve Task Completion Rate',
        description: 'Task completion rate is below target. Consider reviewing task assignments and deadlines.',
        impact: 'High - Could improve project delivery by 15-20%',
        effort: 'Medium - Requires process review and team training'
      });
    }

    if (metrics.financial.budgetVariance > 10) {
      recommendations.push({
        priority: 'high' as const,
        category: 'Financial',
        title: 'Address Budget Overrun',
        description: 'Project is significantly over budget. Immediate cost control measures needed.',
        impact: 'Critical - Prevent further financial losses',
        effort: 'High - Requires stakeholder approval and process changes'
      });
    }

    if (metrics.quality.rfiRate > 20) {
      recommendations.push({
        priority: 'medium' as const,
        category: 'Quality',
        title: 'Reduce RFI Rate',
        description: 'High RFI rate indicates unclear specifications or communication issues.',
        impact: 'Medium - Improve project efficiency and reduce delays',
        effort: 'Medium - Improve documentation and communication processes'
      });
    }

    return recommendations;
  }

  private async generateBenchmarks(projectId: string, metrics: AnalyticsMetrics) {
    // Mock benchmarks - in reality these would come from industry data
    return {
      industryAverage: 75,
      companyAverage: 82,
      bestInClass: 95,
      currentValue: metrics.productivity.taskCompletionRate
    };
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
