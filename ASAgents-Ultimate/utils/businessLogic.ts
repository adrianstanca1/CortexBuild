/**
 * Business Logic Utilities
 * Common business logic functions for the application
 */

export interface FinancialMetrics {
  revenue: number;
  costs: number;
  profit: number;
  margin: number;
}

export interface ProjectMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  delayedProjects: number;
}

/**
 * Calculate financial metrics
 */
export const calculateFinancialMetrics = (
  revenue: number,
  costs: number
): FinancialMetrics => {
  const profit = revenue - costs;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

  return {
    revenue,
    costs,
    profit,
    margin
  };
};

/**
 * Calculate project completion percentage
 */
export const calculateProjectCompletion = (
  completedTasks: number,
  totalTasks: number
): number => {
  if (totalTasks === 0) return 0;
  return Math.round((completedTasks / totalTasks) * 100);
};

/**
 * Determine project status based on metrics
 */
export const determineProjectStatus = (
  completionPercentage: number,
  dueDate: string | Date,
  startDate: string | Date
): 'on-track' | 'at-risk' | 'delayed' | 'completed' => {
  if (completionPercentage >= 100) return 'completed';

  const now = new Date().getTime();
  const due = new Date(dueDate).getTime();
  const start = new Date(startDate).getTime();
  const totalDuration = due - start;
  const elapsed = now - start;
  const expectedCompletion = (elapsed / totalDuration) * 100;

  if (completionPercentage < expectedCompletion - 15) return 'delayed';
  if (completionPercentage < expectedCompletion - 5) return 'at-risk';
  return 'on-track';
};

/**
 * Calculate resource utilization
 */
export const calculateResourceUtilization = (
  hoursWorked: number,
  availableHours: number
): number => {
  if (availableHours === 0) return 0;
  return Math.round((hoursWorked / availableHours) * 100);
};

/**
 * Format currency
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD'
): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

/**
 * Calculate budget variance
 */
export const calculateBudgetVariance = (
  planned: number,
  actual: number
): { variance: number; percentageVariance: number; status: 'over' | 'under' | 'on-budget' } => {
  const variance = actual - planned;
  const percentageVariance = planned > 0 ? (variance / planned) * 100 : 0;

  let status: 'over' | 'under' | 'on-budget' = 'on-budget';
  if (Math.abs(percentageVariance) > 5) {
    status = variance > 0 ? 'over' : 'under';
  }

  return {
    variance,
    percentageVariance,
    status
  };
};

/**
 * Calculate project health score
 */
export const calculateProjectHealthScore = (metrics: {
  schedulePerformance: number; // 0-100
  costPerformance: number; // 0-100
  qualityMetrics: number; // 0-100
  teamSatisfaction: number; // 0-100
}): number => {
  const weights = {
    schedulePerformance: 0.3,
    costPerformance: 0.3,
    qualityMetrics: 0.25,
    teamSatisfaction: 0.15
  };

  const score =
    metrics.schedulePerformance * weights.schedulePerformance +
    metrics.costPerformance * weights.costPerformance +
    metrics.qualityMetrics * weights.qualityMetrics +
    metrics.teamSatisfaction * weights.teamSatisfaction;

  return Math.round(score);
};

/**
 * Determine priority level
 */
export const determinePriority = (
  daysUntilDue: number,
  importance: 'low' | 'medium' | 'high' | 'urgent'
): 'low' | 'medium' | 'high' | 'urgent' => {
  if (importance === 'urgent') return 'urgent';
  if (daysUntilDue <= 1) return 'urgent';
  if (daysUntilDue <= 3) return 'high';
  if (daysUntilDue <= 7) return 'medium';
  return importance;
};

/**
 * Calculate team productivity
 */
export const calculateTeamProductivity = (
  tasksCompleted: number,
  totalTasks: number,
  timeframe: 'day' | 'week' | 'month'
): { score: number; trend: 'up' | 'down' | 'stable' } => {
  const completionRate = totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0;
  
  // Mock trend for now - in real app, compare with previous period
  const trend: 'up' | 'down' | 'stable' = completionRate > 70 ? 'up' : completionRate < 50 ? 'down' : 'stable';

  return {
    score: Math.round(completionRate),
    trend
  };
};

export default {
  calculateFinancialMetrics,
  calculateProjectCompletion,
  determineProjectStatus,
  calculateResourceUtilization,
  formatCurrency,
  calculateBudgetVariance,
  calculateProjectHealthScore,
  determinePriority,
  calculateTeamProductivity
};
