// CortexBuild AI Service - Intelligent insights and automation
import { Project, Task, RFI, User, AISuggestion } from '../types';
import { projectService } from './projectService';
import { dataService } from './dataService';

export interface AIInsight {
  id: string;
  type: 'risk' | 'opportunity' | 'optimization' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  suggestedActions: string[];
  relatedEntities: {
    type: 'project' | 'task' | 'rfi' | 'user';
    id: string;
    name: string;
  }[];
  createdAt: string;
}

export interface AIAnalytics {
  projectHealthScore: number;
  riskFactors: string[];
  opportunities: string[];
  predictions: {
    completionDate: string;
    budgetForecast: number;
    riskLevel: string;
  };
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    action: string;
    impact: string;
  }[];
}

export interface AIAutomation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  actions: string[];
  enabled: boolean;
  lastRun?: string;
  successRate: number;
}

class AIService {
  
  // Generate AI insights for a project
  async generateProjectInsights(projectId: string): Promise<AIInsight[]> {
    const projectDetails = await projectService.getProjectDetails(projectId);
    if (!projectDetails) return [];

    const { project, progress, risk } = projectDetails;
    const insights: AIInsight[] = [];

    // Risk-based insights
    if (risk.level === 'High' || risk.level === 'Critical') {
      insights.push({
        id: `risk-${projectId}-${Date.now()}`,
        type: 'risk',
        title: 'High Project Risk Detected',
        description: `Project ${project.name} has been flagged as ${risk.level} risk due to: ${risk.factors.join(', ')}`,
        confidence: 0.85,
        impact: 'high',
        actionable: true,
        suggestedActions: risk.recommendations,
        relatedEntities: [{
          type: 'project',
          id: project.id,
          name: project.name
        }],
        createdAt: new Date().toISOString()
      });
    }

    // Schedule insights
    if (!progress.isOnSchedule) {
      insights.push({
        id: `schedule-${projectId}-${Date.now()}`,
        type: 'optimization',
        title: 'Schedule Optimization Opportunity',
        description: `Project is behind schedule. Current completion: ${progress.completionPercentage}%`,
        confidence: 0.78,
        impact: 'medium',
        actionable: true,
        suggestedActions: [
          'Review critical path tasks',
          'Consider additional resources',
          'Reassess timeline with stakeholders'
        ],
        relatedEntities: [{
          type: 'project',
          id: project.id,
          name: project.name
        }],
        createdAt: new Date().toISOString()
      });
    }

    // Budget insights
    if (progress.budgetStatus === 'over') {
      insights.push({
        id: `budget-${projectId}-${Date.now()}`,
        type: 'risk',
        title: 'Budget Overrun Alert',
        description: 'Project spending has exceeded budget allocation',
        confidence: 0.92,
        impact: 'high',
        actionable: true,
        suggestedActions: [
          'Review expense categories',
          'Implement cost control measures',
          'Negotiate with suppliers'
        ],
        relatedEntities: [{
          type: 'project',
          id: project.id,
          name: project.name
        }],
        createdAt: new Date().toISOString()
      });
    }

    // Opportunity insights
    if (progress.completionPercentage > 80 && progress.isOnSchedule) {
      insights.push({
        id: `opportunity-${projectId}-${Date.now()}`,
        type: 'opportunity',
        title: 'Early Completion Opportunity',
        description: 'Project is on track for early completion',
        confidence: 0.72,
        impact: 'medium',
        actionable: true,
        suggestedActions: [
          'Consider accelerating remaining tasks',
          'Reallocate resources to other projects',
          'Plan early handover procedures'
        ],
        relatedEntities: [{
          type: 'project',
          id: project.id,
          name: project.name
        }],
        createdAt: new Date().toISOString()
      });
    }

    return insights;
  }

  // Generate AI suggestions for user actions
  async generateAISuggestion(user: User): Promise<AISuggestion | null> {
    const projects = await dataService.getProjects(user.companyId);
    const userProjects = projects.filter(p => p.projectManagerId === user.id);

    if (userProjects.length === 0) {
      return {
        id: `suggestion-${Date.now()}`,
        title: 'Get Started with Your First Project',
        description: 'Create your first project to begin tracking tasks, RFIs, and progress.',
        type: 'action',
        priority: 'medium',
        actionText: 'Create Project',
        actionLink: {
          screen: 'projects',
          params: { action: 'create' }
        },
        createdAt: new Date().toISOString()
      };
    }

    // Find project with highest risk
    const highRiskProject = userProjects.find(p => p.snapshot.aiRiskLevel === 'High');
    if (highRiskProject) {
      return {
        id: `suggestion-${Date.now()}`,
        title: 'Review High-Risk Project',
        description: `${highRiskProject.name} requires immediate attention due to ${highRiskProject.snapshot.overdueTasks} overdue tasks.`,
        type: 'alert',
        priority: 'high',
        actionText: 'Review Project',
        actionLink: {
          screen: 'project-home',
          params: { projectId: highRiskProject.id }
        },
        createdAt: new Date().toISOString()
      };
    }

    // Find projects with many open RFIs
    const rfiProject = userProjects.find(p => p.snapshot.openRFIs > 10);
    if (rfiProject) {
      return {
        id: `suggestion-${Date.now()}`,
        title: 'Address Open RFIs',
        description: `${rfiProject.name} has ${rfiProject.snapshot.openRFIs} open RFIs that need attention.`,
        type: 'action',
        priority: 'medium',
        actionText: 'Review RFIs',
        actionLink: {
          screen: 'rfis',
          params: { projectId: rfiProject.id }
        },
        createdAt: new Date().toISOString()
      };
    }

    // Default suggestion for active users
    return {
      id: `suggestion-${Date.now()}`,
      title: 'Daily Progress Review',
      description: 'Review today\'s tasks and update project progress.',
      type: 'action',
      priority: 'low',
      actionText: 'View My Day',
      actionLink: {
        screen: 'my-day',
        params: {}
      },
      createdAt: new Date().toISOString()
    };
  }

  // Analyze project health using AI
  async analyzeProjectHealth(projectId: string): Promise<AIAnalytics> {
    const projectDetails = await projectService.getProjectDetails(projectId);
    if (!projectDetails) {
      throw new Error('Project not found');
    }

    const { project, progress, risk } = projectDetails;
    const tasks = await dataService.getTasks(projectId);
    const rfis = await dataService.getRFIs(projectId);

    // Calculate health score (0-100)
    let healthScore = 100;
    
    // Deduct points for risks
    if (risk.level === 'Critical') healthScore -= 40;
    else if (risk.level === 'High') healthScore -= 25;
    else if (risk.level === 'Medium') healthScore -= 10;

    // Deduct points for schedule delays
    if (!progress.isOnSchedule) healthScore -= 15;

    // Deduct points for budget overruns
    if (progress.budgetStatus === 'over') healthScore -= 20;

    // Deduct points for overdue tasks
    const overdueTasks = tasks.filter(t => {
      if (!t.dueDate || t.status === 'Completed') return false;
      return new Date(t.dueDate) < new Date();
    });
    healthScore -= overdueTasks.length * 2;

    healthScore = Math.max(0, healthScore);

    // Generate predictions
    const predictions = this.generatePredictions(project, progress, tasks);

    // Generate recommendations
    const recommendations = this.generateRecommendations(project, progress, risk, tasks, rfis);

    return {
      projectHealthScore: healthScore,
      riskFactors: risk.factors,
      opportunities: this.identifyOpportunities(project, progress),
      predictions,
      recommendations
    };
  }

  private generatePredictions(project: Project, progress: ProjectProgress, tasks: Task[]) {
    // Simple prediction logic (in real implementation, this would use ML models)
    const currentDate = new Date();
    const endDate = new Date(project.endDate || '');
    
    // Predict completion date based on current progress
    const remainingWork = 100 - progress.completionPercentage;
    const workRate = progress.completionPercentage / this.getDaysSinceStart(project);
    const daysToComplete = remainingWork / workRate;
    
    const predictedCompletion = new Date(currentDate.getTime() + daysToComplete * 24 * 60 * 60 * 1000);

    // Predict budget forecast
    const currentSpent = project.spent || 0;
    const spendRate = currentSpent / this.getDaysSinceStart(project);
    const remainingDays = Math.max(0, (endDate.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000));
    const budgetForecast = currentSpent + (spendRate * remainingDays);

    // Predict risk level
    let riskLevel = 'Low';
    if (predictedCompletion > endDate) riskLevel = 'High';
    else if (budgetForecast > (project.budget || 0) * 1.1) riskLevel = 'Medium';

    return {
      completionDate: predictedCompletion.toISOString().split('T')[0],
      budgetForecast: Math.round(budgetForecast),
      riskLevel
    };
  }

  private getDaysSinceStart(project: Project): number {
    if (!project.startDate) return 1;
    const startDate = new Date(project.startDate);
    const currentDate = new Date();
    return Math.max(1, (currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  }

  private generateRecommendations(
    project: Project, 
    progress: ProjectProgress, 
    risk: any, 
    tasks: Task[], 
    rfis: RFI[]
  ) {
    const recommendations: AIAnalytics['recommendations'] = [];

    // High priority recommendations
    if (risk.level === 'Critical' || risk.level === 'High') {
      recommendations.push({
        priority: 'high',
        action: 'Conduct emergency project review',
        impact: 'Prevent project failure and cost overruns'
      });
    }

    if (progress.budgetStatus === 'over') {
      recommendations.push({
        priority: 'high',
        action: 'Implement immediate cost control measures',
        impact: 'Reduce budget overrun by 10-15%'
      });
    }

    // Medium priority recommendations
    const openRFIs = rfis.filter(r => r.status === 'Open');
    if (openRFIs.length > 5) {
      recommendations.push({
        priority: 'medium',
        action: 'Accelerate RFI resolution process',
        impact: 'Reduce project delays and improve workflow'
      });
    }

    if (!progress.isOnSchedule) {
      recommendations.push({
        priority: 'medium',
        action: 'Optimize task scheduling and resource allocation',
        impact: 'Improve schedule adherence by 20%'
      });
    }

    // Low priority recommendations
    if (progress.completionPercentage > 50) {
      recommendations.push({
        priority: 'low',
        action: 'Begin planning project closure activities',
        impact: 'Ensure smooth project handover'
      });
    }

    return recommendations;
  }

  private identifyOpportunities(project: Project, progress: ProjectProgress): string[] {
    const opportunities: string[] = [];

    if (progress.budgetStatus === 'under') {
      opportunities.push('Budget surplus available for scope expansion');
    }

    if (progress.isOnSchedule && progress.completionPercentage > 70) {
      opportunities.push('Potential for early project completion');
    }

    if (progress.completionPercentage > 80) {
      opportunities.push('Resource reallocation opportunity to other projects');
    }

    return opportunities;
  }

  // Get available AI automations
  async getAvailableAutomations(): Promise<AIAutomation[]> {
    return [
      {
        id: 'auto-task-assignment',
        name: 'Automatic Task Assignment',
        description: 'Automatically assign tasks based on team member skills and availability',
        trigger: 'New task created',
        actions: ['Analyze task requirements', 'Match with team skills', 'Assign to best fit'],
        enabled: true,
        successRate: 87
      },
      {
        id: 'rfi-reminder',
        name: 'RFI Response Reminders',
        description: 'Send automated reminders for overdue RFI responses',
        trigger: 'RFI due date approaching',
        actions: ['Check RFI status', 'Send reminder notification', 'Escalate if needed'],
        enabled: true,
        successRate: 94
      },
      {
        id: 'risk-detection',
        name: 'Risk Detection & Alerts',
        description: 'Monitor project metrics and alert on potential risks',
        trigger: 'Daily project analysis',
        actions: ['Analyze project data', 'Identify risk patterns', 'Send risk alerts'],
        enabled: true,
        successRate: 78
      },
      {
        id: 'budget-tracking',
        name: 'Budget Variance Tracking',
        description: 'Track budget variances and predict overruns',
        trigger: 'Weekly budget review',
        actions: ['Calculate budget variance', 'Predict future spending', 'Alert on overruns'],
        enabled: false,
        successRate: 82
      }
    ];
  }

  // Chat with AI assistant
  async chatWithAI(message: string, context?: any): Promise<string> {
    // Mock AI chat response (in real implementation, this would call an LLM)
    const responses = [
      "I can help you analyze your project data and provide insights. What specific information are you looking for?",
      "Based on your project metrics, I recommend focusing on the overdue tasks first to get back on schedule.",
      "Your project health score is looking good! The main area for improvement is RFI response time.",
      "I've identified a potential risk in your budget allocation. Would you like me to provide detailed recommendations?",
      "The AI analysis suggests optimizing your resource allocation could improve efficiency by 15%."
    ];

    // Simple keyword-based response selection
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('risk')) {
      return "I've analyzed your project risks. The main concerns are schedule delays and budget variance. I recommend immediate review of critical path tasks.";
    }
    if (lowerMessage.includes('budget')) {
      return "Your current budget utilization is within acceptable ranges. However, I predict a 5% overrun if current spending trends continue.";
    }
    if (lowerMessage.includes('schedule')) {
      return "Based on current progress, your project is 3 days behind schedule. I suggest reallocating resources to critical path tasks.";
    }

    return responses[Math.floor(Math.random() * responses.length)];
  }
}

export const aiService = new AIService();
export default aiService;
