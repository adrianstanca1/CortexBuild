/**
 * Dashboard Logic & Intelligence
 * 
 * Centralized logic for dashboard data processing, ML integration,
 * and intelligent insights across all dashboard types.
 */

import { Project, Task, User } from '../types';
import { PredictionResult } from './neuralNetwork';
import { getMLPredictor } from './mlPredictor';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface DashboardMetrics {
    // Project Metrics
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    delayedProjects: number;
    
    // Task Metrics
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    upcomingTasks: number;
    
    // Financial Metrics
    totalBudget: number;
    spentBudget: number;
    remainingBudget: number;
    budgetUtilization: number;
    
    // Risk Metrics
    highRiskProjects: number;
    mediumRiskProjects: number;
    lowRiskProjects: number;
    overallRiskScore: number;
    
    // Performance Metrics
    onTimeDeliveryRate: number;
    budgetComplianceRate: number;
    taskCompletionRate: number;
    teamProductivity: number;
}

export interface ProjectInsight {
    projectId: string;
    projectName: string;
    type: 'warning' | 'success' | 'info' | 'danger';
    priority: 'high' | 'medium' | 'low';
    title: string;
    message: string;
    prediction?: PredictionResult;
    actionable: boolean;
    suggestedAction?: string;
}

export interface DashboardData {
    metrics: DashboardMetrics;
    insights: ProjectInsight[];
    predictions: Map<string, PredictionResult>;
    trends: {
        budgetTrend: 'improving' | 'stable' | 'declining';
        timelineTrend: 'improving' | 'stable' | 'declining';
        riskTrend: 'improving' | 'stable' | 'declining';
    };
}

// ============================================================================
// METRICS CALCULATION
// ============================================================================

/**
 * Calculate comprehensive dashboard metrics from projects and tasks
 */
export const calculateDashboardMetrics = (
    projects: Project[],
    tasks: Task[]
): DashboardMetrics => {
    // Project Metrics
    const activeProjects = projects.filter(p => p.status === 'In Progress').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const delayedProjects = projects.filter(p => {
        const endDate = new Date(p.endDate);
        const today = new Date();
        return p.status === 'In Progress' && endDate < today;
    }).length;

    // Task Metrics
    const completedTasks = tasks.filter(t => t.status === 'Done').length;
    const overdueTasks = tasks.filter(t => {
        const dueDate = new Date(t.dueDate);
        const today = new Date();
        return t.status !== 'Done' && dueDate < today;
    }).length;
    const upcomingTasks = tasks.filter(t => {
        const dueDate = new Date(t.dueDate);
        const today = new Date();
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        return t.status !== 'Done' && dueDate >= today && dueDate <= weekFromNow;
    }).length;

    // Financial Metrics
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const spentBudget = projects.reduce((sum, p) => sum + (p.budget * (p.snapshot.budgetUtilization / 100)), 0);
    const remainingBudget = totalBudget - spentBudget;
    const budgetUtilization = totalBudget > 0 ? (spentBudget / totalBudget) * 100 : 0;

    // Performance Metrics
    const onTimeDeliveryRate = projects.length > 0 
        ? ((projects.length - delayedProjects) / projects.length) * 100 
        : 100;
    const budgetComplianceRate = projects.length > 0
        ? (projects.filter(p => p.snapshot.budgetUtilization <= 100).length / projects.length) * 100
        : 100;
    const taskCompletionRate = tasks.length > 0
        ? (completedTasks / tasks.length) * 100
        : 0;
    const teamProductivity = (onTimeDeliveryRate + budgetComplianceRate + taskCompletionRate) / 3;

    return {
        totalProjects: projects.length,
        activeProjects,
        completedProjects,
        delayedProjects,
        totalTasks: tasks.length,
        completedTasks,
        overdueTasks,
        upcomingTasks,
        totalBudget,
        spentBudget,
        remainingBudget,
        budgetUtilization,
        highRiskProjects: 0, // Will be calculated with ML
        mediumRiskProjects: 0,
        lowRiskProjects: 0,
        overallRiskScore: 0,
        onTimeDeliveryRate,
        budgetComplianceRate,
        taskCompletionRate,
        teamProductivity,
    };
};

// ============================================================================
// ML INTEGRATION
// ============================================================================

/**
 * Generate ML predictions for all projects
 */
export const generateProjectPredictions = async (
    projects: Project[],
    currentUser: User
): Promise<Map<string, PredictionResult>> => {
    const predictor = getMLPredictor();
    const predictions = new Map<string, PredictionResult>();

    for (const project of projects) {
        try {
            const prediction = await predictor.predictProjectOutcome(project, currentUser);
            predictions.set(project.id, prediction);
        } catch (error) {
            console.error(`Failed to predict for project ${project.id}:`, error);
        }
    }

    return predictions;
};

/**
 * Update metrics with ML risk data
 */
export const enrichMetricsWithML = (
    metrics: DashboardMetrics,
    predictions: Map<string, PredictionResult>
): DashboardMetrics => {
    let totalRisk = 0;
    let highRisk = 0;
    let mediumRisk = 0;
    let lowRisk = 0;

    predictions.forEach(prediction => {
        const riskScore = prediction.prediction[2]; // Risk score from neural network
        totalRisk += riskScore;

        if (riskScore > 70) {
            highRisk++;
        } else if (riskScore > 40) {
            mediumRisk++;
        } else {
            lowRisk++;
        }
    });

    const overallRiskScore = predictions.size > 0 ? totalRisk / predictions.size : 0;

    return {
        ...metrics,
        highRiskProjects: highRisk,
        mediumRiskProjects: mediumRisk,
        lowRiskProjects: lowRisk,
        overallRiskScore,
    };
};

// ============================================================================
// INSIGHTS GENERATION
// ============================================================================

/**
 * Generate actionable insights from projects and predictions
 */
export const generateInsights = (
    projects: Project[],
    predictions: Map<string, PredictionResult>,
    metrics: DashboardMetrics
): ProjectInsight[] => {
    const insights: ProjectInsight[] = [];

    // High Risk Projects
    predictions.forEach((prediction, projectId) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const riskScore = prediction.prediction[2];
        
        if (riskScore > 70) {
            insights.push({
                projectId,
                projectName: project.name,
                type: 'danger',
                priority: 'high',
                title: 'High Risk Alert',
                message: `${project.name} has a ${riskScore.toFixed(0)}% risk score. Immediate attention required.`,
                prediction,
                actionable: true,
                suggestedAction: 'Review project timeline and budget allocation',
            });
        }
    });

    // Budget Overruns
    projects.forEach(project => {
        if (project.snapshot.budgetUtilization > 90) {
            const prediction = predictions.get(project.id);
            insights.push({
                projectId: project.id,
                projectName: project.name,
                type: 'warning',
                priority: 'high',
                title: 'Budget Alert',
                message: `${project.name} is at ${project.snapshot.budgetUtilization.toFixed(0)}% budget utilization.`,
                prediction,
                actionable: true,
                suggestedAction: 'Review expenses and adjust budget forecast',
            });
        }
    });

    // Timeline Delays
    projects.forEach(project => {
        const endDate = new Date(project.endDate);
        const today = new Date();
        const prediction = predictions.get(project.id);
        
        if (project.status === 'In Progress' && endDate < today) {
            insights.push({
                projectId: project.id,
                projectName: project.name,
                type: 'warning',
                priority: 'medium',
                title: 'Timeline Delay',
                message: `${project.name} is past its deadline.`,
                prediction,
                actionable: true,
                suggestedAction: 'Update timeline and communicate with stakeholders',
            });
        }
    });

    // Positive Insights
    projects.forEach(project => {
        const prediction = predictions.get(project.id);
        if (!prediction) return;

        const riskScore = prediction.prediction[2];
        const budgetUtilization = project.snapshot.budgetUtilization;

        if (riskScore < 30 && budgetUtilization < 80) {
            insights.push({
                projectId: project.id,
                projectName: project.name,
                type: 'success',
                priority: 'low',
                title: 'On Track',
                message: `${project.name} is performing well with low risk and good budget control.`,
                prediction,
                actionable: false,
            });
        }
    });

    // Sort by priority
    return insights.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
};

// ============================================================================
// TREND ANALYSIS
// ============================================================================

/**
 * Analyze trends from historical data
 */
export const analyzeTrends = (
    predictions: Map<string, PredictionResult>
): DashboardData['trends'] => {
    // Simple trend analysis based on current predictions
    // In a real app, this would compare with historical data
    
    let totalBudgetOverrun = 0;
    let totalDelay = 0;
    let totalRisk = 0;
    let count = 0;

    predictions.forEach(prediction => {
        totalBudgetOverrun += prediction.prediction[0];
        totalDelay += prediction.prediction[1];
        totalRisk += prediction.prediction[2];
        count++;
    });

    const avgBudgetOverrun = count > 0 ? totalBudgetOverrun / count : 0;
    const avgDelay = count > 0 ? totalDelay / count : 0;
    const avgRisk = count > 0 ? totalRisk / count : 0;

    return {
        budgetTrend: avgBudgetOverrun < 5 ? 'improving' : avgBudgetOverrun > 10 ? 'declining' : 'stable',
        timelineTrend: avgDelay < 5 ? 'improving' : avgDelay > 10 ? 'declining' : 'stable',
        riskTrend: avgRisk < 40 ? 'improving' : avgRisk > 60 ? 'declining' : 'stable',
    };
};

// ============================================================================
// MAIN DASHBOARD DATA PROCESSOR
// ============================================================================

/**
 * Process all dashboard data with ML integration
 */
export const processDashboardData = async (
    projects: Project[],
    tasks: Task[],
    currentUser: User
): Promise<DashboardData> => {
    // Calculate base metrics
    let metrics = calculateDashboardMetrics(projects, tasks);

    // Generate ML predictions
    const predictions = await generateProjectPredictions(projects, currentUser);

    // Enrich metrics with ML data
    metrics = enrichMetricsWithML(metrics, predictions);

    // Generate insights
    const insights = generateInsights(projects, predictions, metrics);

    // Analyze trends
    const trends = analyzeTrends(predictions);

    return {
        metrics,
        insights,
        predictions,
        trends,
    };
};

