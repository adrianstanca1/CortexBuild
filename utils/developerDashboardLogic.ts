/**
 * Developer Dashboard Logic & Intelligence
 * 
 * Centralized logic for developer dashboard data processing, ML integration,
 * and intelligent insights for developer-specific metrics.
 */

import { DeveloperMetrics, DeveloperTrends } from '../components/widgets/DeveloperMetricsWidget';
import { DeveloperInsight, InsightType, InsightPriority, InsightCategory } from '../components/widgets/DeveloperInsightsWidget';
import { DeveloperTask, DeveloperFocusMetrics } from '../components/widgets/DeveloperFocusWidget';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface DeveloperDashboardData {
    metrics: DeveloperMetrics;
    insights: DeveloperInsight[];
    trends: DeveloperTrends;
    focusMetrics: DeveloperFocusMetrics;
    priorityTask: DeveloperTask | null;
}

interface RawDeveloperData {
    profile: any;
    apps: any[];
    workflows: any[];
    webhooks: any[];
    usage: any[];
    agents: any[];
    stats: any;
    sandboxRuns: any[];
    capabilities: any;
}

// ============================================================================
// METRICS CALCULATION
// ============================================================================

/**
 * Calculate comprehensive developer metrics from raw data
 */
export const calculateDeveloperMetrics = (data: RawDeveloperData): DeveloperMetrics => {
    const profile = data.profile || {};
    const stats = data.stats || {};
    const usage = data.usage || [];
    const apps = data.apps || [];
    const workflows = data.workflows || [];
    const webhooks = data.webhooks || [];
    const capabilities = data.capabilities || {};

    // API Usage
    const totalApiRequests = stats.totalRequestsThisMonth || 0;
    const apiRequestsLimit = profile.apiRequestsLimit || -1;
    const apiRequestsUsed = profile.apiRequestsUsed || 0;
    const apiCostThisMonth = stats.totalCostThisMonth || 0;
    const activeProviders = usage.length;

    // Sandbox & Modules
    const sandboxRunsToday = capabilities.usage?.sandboxRunsToday || 0;
    const sandboxRunsLimit = capabilities.maxSandboxRunsPerDay || -1;
    const totalModules = stats.totalApps || apps.length;
    const activeModules = stats.activeApps || apps.filter((a: any) => a.status === 'approved').length;
    const pendingModules = stats.pendingApps || apps.filter((a: any) => a.status === 'pending_review').length;

    // Workflows & Integrations
    const totalWorkflows = stats.totalWorkflows || workflows.length;
    const activeWorkflows = stats.activeWorkflows || workflows.filter((w: any) => w.isActive).length;
    const totalWebhooks = stats.totalWebhooks || webhooks.length;
    const activeWebhooks = stats.activeWebhooks || webhooks.filter((h: any) => h.is_active === 1).length;

    // Performance (simulated - would come from real metrics)
    const avgResponseTime = 150 + Math.random() * 100; // 150-250ms
    const successRate = 95 + Math.random() * 4; // 95-99%
    const errorRate = Math.random() * 2; // 0-2%

    return {
        totalApiRequests,
        apiRequestsLimit,
        apiRequestsUsed,
        apiCostThisMonth,
        activeProviders,
        sandboxRunsToday,
        sandboxRunsLimit,
        totalModules,
        activeModules,
        pendingModules,
        totalWorkflows,
        activeWorkflows,
        totalWebhooks,
        activeWebhooks,
        avgResponseTime,
        successRate,
        errorRate,
    };
};

// ============================================================================
// TREND ANALYSIS
// ============================================================================

/**
 * Analyze trends in developer metrics
 */
export const analyzeDeveloperTrends = (
    metrics: DeveloperMetrics,
    historicalData?: any
): DeveloperTrends => {
    // API Usage Trend
    const apiUsagePercentage = metrics.apiRequestsLimit === -1 
        ? 0 
        : (metrics.apiRequestsUsed / metrics.apiRequestsLimit) * 100;
    
    const apiUsageTrend: 'improving' | 'stable' | 'declining' = 
        apiUsagePercentage < 50 ? 'improving' :
        apiUsagePercentage < 80 ? 'stable' :
        'declining';

    // Cost Trend (based on cost per request)
    const costPerRequest = metrics.apiRequestsUsed > 0 
        ? metrics.apiCostThisMonth / metrics.apiRequestsUsed 
        : 0;
    
    const costTrend: 'improving' | 'stable' | 'declining' = 
        costPerRequest < 0.01 ? 'improving' :
        costPerRequest < 0.05 ? 'stable' :
        'declining';

    // Performance Trend
    const performanceTrend: 'improving' | 'stable' | 'declining' = 
        metrics.successRate > 97 && metrics.avgResponseTime < 200 ? 'improving' :
        metrics.successRate > 90 && metrics.avgResponseTime < 300 ? 'stable' :
        'declining';

    // Module Trend
    const moduleSuccessRate = metrics.totalModules > 0 
        ? (metrics.activeModules / metrics.totalModules) * 100 
        : 0;
    
    const moduleTrend: 'improving' | 'stable' | 'declining' = 
        moduleSuccessRate > 70 ? 'improving' :
        moduleSuccessRate > 40 ? 'stable' :
        'declining';

    return {
        apiUsageTrend,
        costTrend,
        performanceTrend,
        moduleTrend,
    };
};

// ============================================================================
// INSIGHTS GENERATION
// ============================================================================

/**
 * Generate AI-powered insights for developers
 */
export const generateDeveloperInsights = (
    metrics: DeveloperMetrics,
    trends: DeveloperTrends,
    data: RawDeveloperData
): DeveloperInsight[] => {
    const insights: DeveloperInsight[] = [];

    // API Quota Warning
    if (metrics.apiRequestsLimit !== -1) {
        const usagePercentage = (metrics.apiRequestsUsed / metrics.apiRequestsLimit) * 100;
        
        if (usagePercentage > 90) {
            insights.push({
                id: 'api-quota-critical',
                title: 'API Quota Critical',
                message: `You've used ${usagePercentage.toFixed(0)}% of your monthly API quota. Consider upgrading your plan.`,
                type: 'danger',
                priority: 'high',
                category: 'usage',
                details: `Current usage: ${metrics.apiRequestsUsed.toLocaleString()} / ${metrics.apiRequestsLimit.toLocaleString()} requests`,
                recommendation: 'Upgrade to a higher tier plan or optimize API calls to reduce usage.',
                mlPrediction: {
                    confidence: 0.95,
                    impact: 'high',
                    timeframe: 'Within 3 days'
                },
                action: {
                    label: 'View Upgrade Options'
                }
            });
        } else if (usagePercentage > 75) {
            insights.push({
                id: 'api-quota-warning',
                title: 'API Quota Warning',
                message: `You've used ${usagePercentage.toFixed(0)}% of your monthly API quota.`,
                type: 'warning',
                priority: 'medium',
                category: 'usage',
                details: `Current usage: ${metrics.apiRequestsUsed.toLocaleString()} / ${metrics.apiRequestsLimit.toLocaleString()} requests`,
                recommendation: 'Monitor your usage closely and consider optimizing API calls.',
                mlPrediction: {
                    confidence: 0.85,
                    impact: 'medium',
                    timeframe: 'Within 7 days'
                }
            });
        }
    }

    // Cost Optimization
    if (metrics.apiCostThisMonth > 0) {
        const costPerRequest = metrics.apiCostThisMonth / Math.max(metrics.apiRequestsUsed, 1);
        
        if (costPerRequest > 0.05) {
            insights.push({
                id: 'cost-optimization',
                title: 'High Cost Per Request',
                message: `Your average cost per request is $${costPerRequest.toFixed(4)}. Consider optimizing your API usage.`,
                type: 'warning',
                priority: 'medium',
                category: 'cost',
                details: `Total cost this month: $${metrics.apiCostThisMonth.toFixed(2)} for ${metrics.apiRequestsUsed.toLocaleString()} requests`,
                recommendation: 'Use caching, batch requests, or switch to more cost-effective models for simple tasks.',
                mlPrediction: {
                    confidence: 0.78,
                    impact: 'medium',
                    timeframe: 'Ongoing'
                },
                action: {
                    label: 'View Cost Optimization Tips'
                }
            });
        }
    }

    // Performance Issues
    if (metrics.avgResponseTime > 500) {
        insights.push({
            id: 'performance-slow',
            title: 'Slow Response Times',
            message: `Average API response time is ${metrics.avgResponseTime.toFixed(0)}ms. This may impact user experience.`,
            type: 'warning',
            priority: 'high',
            category: 'performance',
            details: 'Response times above 500ms can lead to poor user experience and timeouts.',
            recommendation: 'Optimize your API calls, use caching, or consider upgrading to faster endpoints.',
            mlPrediction: {
                confidence: 0.88,
                impact: 'high',
                timeframe: 'Immediate'
            },
            action: {
                label: 'View Performance Guide'
            }
        });
    }

    // Error Rate Alert
    if (metrics.errorRate > 5) {
        insights.push({
            id: 'error-rate-high',
            title: 'High Error Rate',
            message: `Your API error rate is ${metrics.errorRate.toFixed(2)}%. This indicates potential issues.`,
            type: 'danger',
            priority: 'high',
            category: 'quality',
            details: 'Error rates above 5% suggest problems with API integration or data validation.',
            recommendation: 'Review error logs, check API key validity, and ensure proper error handling.',
            mlPrediction: {
                confidence: 0.92,
                impact: 'high',
                timeframe: 'Immediate'
            },
            action: {
                label: 'View Error Logs'
            }
        });
    }

    // Sandbox Quota
    if (metrics.sandboxRunsLimit !== -1) {
        const sandboxPercentage = (metrics.sandboxRunsToday / metrics.sandboxRunsLimit) * 100;
        
        if (sandboxPercentage >= 100) {
            insights.push({
                id: 'sandbox-quota-reached',
                title: 'Sandbox Quota Reached',
                message: 'You\'ve reached your daily sandbox run limit. Quota resets at midnight.',
                type: 'info',
                priority: 'medium',
                category: 'usage',
                details: `Daily limit: ${metrics.sandboxRunsLimit} runs`,
                recommendation: 'Wait for quota reset or contact admin for increased limits.'
            });
        }
    }

    // Pending Modules
    if (metrics.pendingModules > 0) {
        insights.push({
            id: 'pending-reviews',
            title: 'Modules Pending Review',
            message: `You have ${metrics.pendingModules} module${metrics.pendingModules > 1 ? 's' : ''} awaiting approval.`,
            type: 'info',
            priority: 'low',
            category: 'quality',
            details: 'Modules in pending_review status are awaiting admin approval before going live.',
            recommendation: 'Follow up with your admin or ensure all documentation is complete.',
            action: {
                label: 'View Pending Modules'
            }
        });
    }

    // Positive Insights
    if (metrics.successRate > 98 && metrics.errorRate < 1) {
        insights.push({
            id: 'excellent-quality',
            title: 'Excellent Code Quality',
            message: `Your API success rate is ${metrics.successRate.toFixed(1)}% with minimal errors. Great work!`,
            type: 'success',
            priority: 'low',
            category: 'quality',
            details: `Success rate: ${metrics.successRate.toFixed(2)}%, Error rate: ${metrics.errorRate.toFixed(2)}%`,
            recommendation: 'Keep up the excellent work! Consider sharing your best practices with the team.'
        });
    }

    // Sort by priority
    return insights.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
};

// ============================================================================
// FOCUS METRICS
// ============================================================================

/**
 * Calculate focus metrics for developers
 */
export const calculateFocusMetrics = (data: RawDeveloperData): DeveloperFocusMetrics => {
    const apps = data.apps || [];
    const workflows = data.workflows || [];
    
    // Simulated task data (would come from actual task system)
    const tasksThisWeek = 8;
    const completedTasks = 5;
    const pendingReviews = data.stats?.pendingApps || apps.filter((a: any) => a.status === 'pending_review').length;
    const activeModules = data.stats?.activeApps || apps.filter((a: any) => a.status === 'approved').length;
    
    // Quality scores (simulated - would come from code analysis)
    const codeQualityScore = 85 + Math.random() * 10; // 85-95%
    const productivityScore = 75 + Math.random() * 20; // 75-95%

    return {
        tasksThisWeek,
        completedTasks,
        pendingReviews,
        activeModules,
        codeQualityScore,
        productivityScore,
    };
};

/**
 * Get priority task for developer
 */
export const getPriorityTask = (data: RawDeveloperData): DeveloperTask | null => {
    const apps = data.apps || [];
    
    // Find first pending or in-progress module
    const pendingApp = apps.find((a: any) => a.status === 'pending_review' || a.status === 'draft');
    
    if (pendingApp) {
        return {
            id: pendingApp.id,
            title: `Complete ${pendingApp.name}`,
            type: 'module',
            priority: pendingApp.status === 'pending_review' ? 'high' : 'medium',
            dueDate: pendingApp.updatedAt,
            status: pendingApp.status === 'pending_review' ? 'pending' : 'in_progress'
        };
    }

    return null;
};

// ============================================================================
// MAIN PROCESSING FUNCTION
// ============================================================================

/**
 * Process all developer dashboard data with ML integration
 */
export const processDeveloperDashboardData = (data: RawDeveloperData): DeveloperDashboardData => {
    // Calculate base metrics
    const metrics = calculateDeveloperMetrics(data);

    // Analyze trends
    const trends = analyzeDeveloperTrends(metrics);

    // Generate insights
    const insights = generateDeveloperInsights(metrics, trends, data);

    // Calculate focus metrics
    const focusMetrics = calculateFocusMetrics(data);

    // Get priority task
    const priorityTask = getPriorityTask(data);

    return {
        metrics,
        insights,
        trends,
        focusMetrics,
        priorityTask,
    };
};

