import { Router } from 'express';
import { authenticateUser, type AuthenticatedRequest } from '../middleware/authenticate.js';
import { AnalyticsService } from '../services/analyticsService.js';
import { EnhancedIntegrationService } from '../services/enhancedIntegration.js';
import { realTimeService } from '../services/realTimeService.js';
import { logger } from '../utils/logger.js';

/**
 * Analytics API Routes
 * Provides advanced analytics, reporting, and business intelligence
 */

const router = Router();

// Generate comprehensive analytics report
router.get('/reports/:reportType', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const tenantId = req.user?.tenant_id;
    const { reportType } = req.params;
    const { timeframe = 'month' } = req.query;

    if (!tenantId) {
      return res.status(400).json({ message: 'Invalid user context' });
    }

    const validReportTypes = ['project_performance', 'team_productivity', 'financial_analysis', 'operational_efficiency'];
    if (!validReportTypes.includes(reportType)) {
      return res.status(400).json({ 
        message: 'Invalid report type',
        validTypes: validReportTypes
      });
    }

    const validTimeframes = ['week', 'month', 'quarter', 'year'];
    if (!validTimeframes.includes(timeframe as string)) {
      return res.status(400).json({ 
        message: 'Invalid timeframe',
        validTimeframes
      });
    }

    const report = await AnalyticsService.generateAnalyticsReport(
      tenantId,
      reportType as any,
      timeframe as any
    );

    // Broadcast real-time event for report generation
    realTimeService.broadcastEvent({
      type: 'system_alert',
      entityType: 'system',
      entityId: 'analytics',
      tenantId,
      userId: req.user?.sub,
      data: { 
        action: 'report_generated', 
        reportType, 
        timeframe,
        timestamp: new Date().toISOString() 
      },
      timestamp: new Date().toISOString()
    });

    return res.json(report);
  } catch (error) {
    logger.error({ error, reportType: req.params.reportType }, 'Failed to generate analytics report');
    return res.status(500).json({
      message: 'Failed to generate analytics report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get predictive analytics for project completion
router.get('/predictive/project-completion', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const tenantId = req.user?.tenant_id;

    if (!tenantId) {
      return res.status(400).json({ message: 'Invalid user context' });
    }

    const model = await AnalyticsService.generateProjectCompletionModel(tenantId);

    return res.json(model);
  } catch (error) {
    logger.error({ error, tenantId: req.user?.tenant_id }, 'Failed to generate predictive model');
    return res.status(500).json({
      message: 'Failed to generate predictive analytics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get real-time analytics metrics
router.get('/realtime/metrics', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const tenantId = req.user?.tenant_id;
    const userId = req.user?.sub;

    if (!tenantId || !userId) {
      return res.status(400).json({ message: 'Invalid user context' });
    }

    // Get enhanced dashboard data for real-time metrics
    const enhancedData = await EnhancedIntegrationService.getEnhancedDashboardData(tenantId, userId);
    
    // Extract real-time metrics
    const realTimeMetrics = {
      portfolioSummary: enhancedData.portfolioSummary,
      realTimeMetrics: enhancedData.realTimeMetrics,
      operationalInsights: enhancedData.operationalInsights,
      lastUpdated: new Date().toISOString()
    };

    return res.json(realTimeMetrics);
  } catch (error) {
    logger.error({ error, tenantId: req.user?.tenant_id }, 'Failed to fetch real-time metrics');
    return res.status(500).json({
      message: 'Failed to fetch real-time metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get analytics for specific date range
router.get('/custom-range', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const tenantId = req.user?.tenant_id;
    const { startDate, endDate, metrics } = req.query;

    if (!tenantId) {
      return res.status(400).json({ message: 'Invalid user context' });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const analytics = await EnhancedIntegrationService.getAnalyticsForPeriod(
      tenantId,
      startDate as string,
      endDate as string
    );

    // If specific metrics requested, filter the data
    let filteredAnalytics = analytics;
    if (metrics && typeof metrics === 'string') {
      const requestedMetrics = metrics.split(',');
      filteredAnalytics = analytics.filter((item: any) => 
        requestedMetrics.some(metric => 
          item.entity_type === metric || 
          item.action?.includes(metric)
        )
      );
    }

    return res.json({
      dateRange: { startDate, endDate },
      totalRecords: analytics.length,
      filteredRecords: filteredAnalytics.length,
      data: filteredAnalytics
    });
  } catch (error) {
    logger.error({ error, tenantId: req.user?.tenant_id }, 'Failed to fetch custom range analytics');
    return res.status(500).json({
      message: 'Failed to fetch analytics for date range',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user performance analytics
router.get('/user-performance/:userId?', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const tenantId = req.user?.tenant_id;
    const targetUserId = req.params.userId ? parseInt(req.params.userId) : req.user?.sub;

    if (!tenantId || !targetUserId) {
      return res.status(400).json({ message: 'Invalid user context' });
    }

    const metrics = await EnhancedIntegrationService.getUserPerformanceMetrics(tenantId, targetUserId);

    // Add additional calculated metrics
    const enhancedMetrics = {
      ...metrics,
      productivity_score: metrics.total_tasks > 0 
        ? Math.round((metrics.completed_tasks / metrics.total_tasks) * 100) 
        : 0,
      efficiency_rating: metrics.estimation_accuracy > 0 
        ? Math.round(metrics.estimation_accuracy) 
        : 0,
      workload_balance: metrics.avg_completion_time > 0 
        ? Math.round(100 - Math.min(metrics.avg_completion_time / 7, 1) * 100) 
        : 0,
      generated_at: new Date().toISOString()
    };

    return res.json(enhancedMetrics);
  } catch (error) {
    logger.error({ error, tenantId: req.user?.tenant_id }, 'Failed to fetch user performance analytics');
    return res.status(500).json({
      message: 'Failed to fetch user performance analytics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get trend analysis
router.get('/trends/:entityType', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const tenantId = req.user?.tenant_id;
    const { entityType } = req.params;
    const { period = '30', granularity = 'day' } = req.query;

    if (!tenantId) {
      return res.status(400).json({ message: 'Invalid user context' });
    }

    const validEntityTypes = ['projects', 'tasks', 'expenses', 'users'];
    if (!validEntityTypes.includes(entityType)) {
      return res.status(400).json({ 
        message: 'Invalid entity type',
        validTypes: validEntityTypes
      });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period as string));

    const analytics = await EnhancedIntegrationService.getAnalyticsForPeriod(
      tenantId,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    // Group data by granularity and entity type
    const trendData = analytics
      .filter((item: any) => item.entity_type === entityType.slice(0, -1)) // Remove 's' from plural
      .reduce((acc: any, item: any) => {
        const date = new Date(item.date);
        let key: string;
        
        if (granularity === 'week') {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
        } else if (granularity === 'month') {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        } else {
          key = item.date;
        }

        if (!acc[key]) {
          acc[key] = { date: key, count: 0, entities: [] };
        }
        acc[key].count++;
        acc[key].entities.push(item);
        
        return acc;
      }, {});

    const trendArray = Object.values(trendData).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate trend direction
    const recentData = trendArray.slice(-7); // Last 7 data points
    const earlierData = trendArray.slice(-14, -7); // Previous 7 data points
    
    const recentAvg = recentData.reduce((sum: number, item: any) => sum + item.count, 0) / recentData.length;
    const earlierAvg = earlierData.reduce((sum: number, item: any) => sum + item.count, 0) / earlierData.length;
    
    const trendDirection = recentAvg > earlierAvg ? 'up' : recentAvg < earlierAvg ? 'down' : 'stable';
    const trendPercentage = earlierAvg > 0 ? Math.abs((recentAvg - earlierAvg) / earlierAvg) * 100 : 0;

    return res.json({
      entityType,
      period: `${period} days`,
      granularity,
      trend: {
        direction: trendDirection,
        percentage: Math.round(trendPercentage * 100) / 100
      },
      dataPoints: trendArray.length,
      data: trendArray
    });
  } catch (error) {
    logger.error({ error, entityType: req.params.entityType }, 'Failed to fetch trend analysis');
    return res.status(500).json({
      message: 'Failed to fetch trend analysis',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get comparative analytics (compare different time periods)
router.get('/compare', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const tenantId = req.user?.tenant_id;
    const { 
      period1_start, 
      period1_end, 
      period2_start, 
      period2_end,
      metrics = 'projects,tasks,expenses'
    } = req.query;

    if (!tenantId) {
      return res.status(400).json({ message: 'Invalid user context' });
    }

    if (!period1_start || !period1_end || !period2_start || !period2_end) {
      return res.status(400).json({ 
        message: 'All period dates are required (period1_start, period1_end, period2_start, period2_end)' 
      });
    }

    // Get analytics for both periods
    const [period1Data, period2Data] = await Promise.all([
      EnhancedIntegrationService.getAnalyticsForPeriod(
        tenantId,
        period1_start as string,
        period1_end as string
      ),
      EnhancedIntegrationService.getAnalyticsForPeriod(
        tenantId,
        period2_start as string,
        period2_end as string
      )
    ]);

    const requestedMetrics = (metrics as string).split(',');
    
    // Calculate comparative metrics
    const comparison = requestedMetrics.map(metric => {
      const period1Count = period1Data.filter((item: any) => 
        item.entity_type === metric.slice(0, -1) // Remove 's' from plural
      ).length;
      
      const period2Count = period2Data.filter((item: any) => 
        item.entity_type === metric.slice(0, -1)
      ).length;
      
      const change = period1Count - period2Count;
      const changePercentage = period2Count > 0 ? (change / period2Count) * 100 : 0;
      
      return {
        metric,
        period1: {
          start: period1_start,
          end: period1_end,
          count: period1Count
        },
        period2: {
          start: period2_start,
          end: period2_end,
          count: period2Count
        },
        comparison: {
          change,
          changePercentage: Math.round(changePercentage * 100) / 100,
          trend: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'stable'
        }
      };
    });

    return res.json({
      comparisonType: 'period_over_period',
      metrics: comparison,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    logger.error({ error, tenantId: req.user?.tenant_id }, 'Failed to generate comparative analytics');
    return res.status(500).json({
      message: 'Failed to generate comparative analytics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
