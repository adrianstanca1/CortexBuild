// CortexBuild Project Management Service
import { Project, Task, RFI, User, ProjectSnapshot, DailyLog, Photo } from '../types';
import { dataService } from './dataService';

export interface ProjectAnalytics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  totalSpent: number;
  budgetUtilization: number;
  averageProjectDuration: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
}

export interface ProjectProgress {
  tasksCompleted: number;
  totalTasks: number;
  completionPercentage: number;
  milestonesAchieved: number;
  totalMilestones: number;
  daysRemaining: number;
  isOnSchedule: boolean;
  budgetStatus: 'under' | 'on-track' | 'over';
}

export interface ProjectRisk {
  level: 'Low' | 'Medium' | 'High' | 'Critical';
  factors: string[];
  recommendations: string[];
  score: number;
}

class ProjectService {
  
  // Get all projects with optional filtering
  async getProjects(filters?: {
    companyId?: string;
    status?: string;
    managerId?: string;
    search?: string;
  }): Promise<Project[]> {
    let projects = await dataService.getProjects(filters?.companyId);
    
    if (filters?.status) {
      projects = projects.filter(p => p.status === filters.status);
    }
    
    if (filters?.managerId) {
      projects = projects.filter(p => p.projectManagerId === filters.managerId);
    }
    
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      projects = projects.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.location.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }
    
    return projects;
  }

  // Get project with detailed information
  async getProjectDetails(projectId: string): Promise<{
    project: Project;
    progress: ProjectProgress;
    risk: ProjectRisk;
    recentActivity: any[];
    team: User[];
  } | null> {
    const project = await dataService.getProject(projectId);
    if (!project) return null;

    const tasks = await dataService.getTasks(projectId);
    const rfis = await dataService.getRFIs(projectId);
    const team = await dataService.getUsers(project.companyId);

    const progress = this.calculateProjectProgress(project, tasks);
    const risk = this.assessProjectRisk(project, tasks, rfis);
    const recentActivity = await this.getRecentActivity(projectId);

    return {
      project,
      progress,
      risk,
      recentActivity,
      team: team.slice(0, 10) // Limit to 10 team members for overview
    };
  }

  // Calculate project progress metrics
  private calculateProjectProgress(project: Project, tasks: Task[]): ProjectProgress {
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const totalTasks = tasks.length;
    const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Calculate days remaining
    const endDate = new Date(project.endDate || '');
    const today = new Date();
    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Determine if on schedule (simplified logic)
    const expectedProgress = this.calculateExpectedProgress(project);
    const isOnSchedule = completionPercentage >= expectedProgress - 10; // 10% tolerance

    // Budget status
    const budgetUtilization = project.budget ? (project.spent || 0) / project.budget : 0;
    let budgetStatus: 'under' | 'on-track' | 'over' = 'on-track';
    if (budgetUtilization < 0.8) budgetStatus = 'under';
    if (budgetUtilization > 1.1) budgetStatus = 'over';

    return {
      tasksCompleted: completedTasks,
      totalTasks,
      completionPercentage: Math.round(completionPercentage),
      milestonesAchieved: 0, // TODO: Implement milestones
      totalMilestones: 0,
      daysRemaining,
      isOnSchedule,
      budgetStatus
    };
  }

  // Calculate expected progress based on timeline
  private calculateExpectedProgress(project: Project): number {
    if (!project.startDate || !project.endDate) return 0;

    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    const today = new Date();

    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = today.getTime() - startDate.getTime();

    return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
  }

  // Assess project risk level
  private assessProjectRisk(project: Project, tasks: Task[], rfis: RFI[]): ProjectRisk {
    const factors: string[] = [];
    let score = 0;

    // Check overdue tasks
    const overdueTasks = tasks.filter(t => {
      if (!t.dueDate || t.status === 'Completed') return false;
      return new Date(t.dueDate) < new Date();
    });

    if (overdueTasks.length > 0) {
      factors.push(`${overdueTasks.length} overdue tasks`);
      score += overdueTasks.length * 10;
    }

    // Check open RFIs
    const openRFIs = rfis.filter(r => r.status === 'Open');
    if (openRFIs.length > 5) {
      factors.push(`${openRFIs.length} open RFIs`);
      score += openRFIs.length * 5;
    }

    // Check budget overrun
    if (project.budget && project.spent) {
      const budgetUtilization = project.spent / project.budget;
      if (budgetUtilization > 0.9) {
        factors.push('Budget utilization over 90%');
        score += 20;
      }
    }

    // Check timeline
    const progress = this.calculateProjectProgress(project, tasks);
    if (!progress.isOnSchedule) {
      factors.push('Behind schedule');
      score += 15;
    }

    // Determine risk level and recommendations
    let level: ProjectRisk['level'] = 'Low';
    const recommendations: string[] = [];

    if (score >= 50) {
      level = 'Critical';
      recommendations.push('Immediate intervention required');
      recommendations.push('Review project scope and timeline');
      recommendations.push('Consider additional resources');
    } else if (score >= 30) {
      level = 'High';
      recommendations.push('Close monitoring required');
      recommendations.push('Address overdue items immediately');
    } else if (score >= 15) {
      level = 'Medium';
      recommendations.push('Regular monitoring recommended');
      recommendations.push('Proactive issue resolution');
    } else {
      recommendations.push('Continue current approach');
      recommendations.push('Maintain regular progress reviews');
    }

    return {
      level,
      factors,
      recommendations,
      score
    };
  }

  // Get recent project activity
  private async getRecentActivity(projectId: string): Promise<any[]> {
    const tasks = await dataService.getTasks(projectId);
    const rfis = await dataService.getRFIs(projectId);

    const activities: any[] = [];

    // Add task activities
    tasks.forEach(task => {
      if (task.history) {
        task.history.forEach(event => {
          activities.push({
            id: `task-${task.id}-${event.timestamp}`,
            type: 'task',
            title: `Task: ${task.title}`,
            description: event.change,
            timestamp: event.timestamp,
            author: event.author,
            icon: 'task'
          });
        });
      }
    });

    // Add RFI activities
    rfis.forEach(rfi => {
      activities.push({
        id: `rfi-${rfi.id}`,
        type: 'rfi',
        title: `RFI: ${rfi.title}`,
        description: `RFI submitted by ${rfi.submittedBy}`,
        timestamp: rfi.createdAt,
        author: rfi.submittedBy,
        icon: 'rfi'
      });
    });

    // Sort by timestamp (most recent first)
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20); // Limit to 20 most recent activities
  }

  // Get project analytics for dashboard
  async getProjectAnalytics(companyId?: string): Promise<ProjectAnalytics> {
    const projects = await dataService.getProjects(companyId);

    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'In Progress').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;

    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalSpent = projects.reduce((sum, p) => sum + (p.spent || 0), 0);
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Calculate average project duration
    const completedProjectsWithDates = projects.filter(p => 
      p.status === 'Completed' && p.startDate && p.endDate
    );
    
    const averageProjectDuration = completedProjectsWithDates.length > 0
      ? completedProjectsWithDates.reduce((sum, p) => {
          const start = new Date(p.startDate!);
          const end = new Date(p.endDate!);
          return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        }, 0) / completedProjectsWithDates.length
      : 0;

    // Risk distribution
    const riskDistribution = {
      low: projects.filter(p => p.snapshot.aiRiskLevel === 'Low').length,
      medium: projects.filter(p => p.snapshot.aiRiskLevel === 'Medium').length,
      high: projects.filter(p => p.snapshot.aiRiskLevel === 'High').length
    };

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalBudget,
      totalSpent,
      budgetUtilization: Math.round(budgetUtilization),
      averageProjectDuration: Math.round(averageProjectDuration),
      riskDistribution
    };
  }

  // Create new project
  async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    return await dataService.createProject(projectData);
  }

  // Update project
  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project | null> {
    return await dataService.updateProject(projectId, updates);
  }

  // Get project dashboard data
  async getProjectDashboard(projectId: string): Promise<{
    project: Project;
    stats: {
      tasksTotal: number;
      tasksCompleted: number;
      rfisOpen: number;
      teamMembers: number;
    };
    recentTasks: Task[];
    recentRFIs: RFI[];
    progress: ProjectProgress;
  } | null> {
    const project = await dataService.getProject(projectId);
    if (!project) return null;

    const tasks = await dataService.getTasks(projectId);
    const rfis = await dataService.getRFIs(projectId);
    const team = await dataService.getUsers(project.companyId);

    const stats = {
      tasksTotal: tasks.length,
      tasksCompleted: tasks.filter(t => t.status === 'Completed').length,
      rfisOpen: rfis.filter(r => r.status === 'Open').length,
      teamMembers: team.length
    };

    const recentTasks = tasks
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);

    const recentRFIs = rfis
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);

    const progress = this.calculateProjectProgress(project, tasks);

    return {
      project,
      stats,
      recentTasks,
      recentRFIs,
      progress
    };
  }
}

export const projectService = new ProjectService();
export default projectService;
