import { Router } from 'express';
import { authenticateUser, type AuthenticatedRequest } from '../middleware/authenticate.js';
import { pool } from '../services/db.js';
import { IntegrationService } from '../services/integration.js';
import { EnhancedIntegrationService } from '../services/enhancedIntegration.js';
import { realTimeService } from '../services/realTimeService.js';
import type { RowDataPacket } from 'mysql2/promise';

interface ProjectSummaryRow extends RowDataPacket {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_budget: number;
  total_spent: number;
}

interface TaskSummaryRow extends RowDataPacket {
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  in_progress_tasks: number;
}

interface ExpenseSummaryRow extends RowDataPacket {
  total_expenses: number;
  pending_expenses: number;
  approved_expenses: number;
  total_amount: number;
}

interface RecentActivityRow extends RowDataPacket {
  id: number;
  type: string;
  description: string;
  user_name: string;
  created_at: Date;
  project_name?: string;
}

const router = Router();

// Get dashboard snapshot
router.get('/snapshot', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const tenantId = req.user?.tenant_id;
    const userId = req.user?.sub;

    if (!tenantId || !userId) {
      return res.status(400).json({ message: 'Invalid user context' });
    }

    // Use integration service for comprehensive dashboard data
    const dashboardData = await IntegrationService.getDashboardData(tenantId, userId);

    return res.json(dashboardData);
  } catch (error) {
    console.error('Error generating dashboard snapshot:', error);
    return res.status(500).json({
      message: 'Failed to generate dashboard snapshot',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get enhanced dashboard data with comprehensive analytics
router.get('/enhanced', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const tenantId = req.user?.tenant_id;
    const userId = req.user?.sub;

    if (!tenantId || !userId) {
      return res.status(400).json({ message: 'Invalid user context' });
    }

    // Use enhanced integration service for comprehensive dashboard data
    const enhancedData = await EnhancedIntegrationService.getEnhancedDashboardData(tenantId, userId);

    // Broadcast real-time event for dashboard access
    realTimeService.broadcastEvent({
      type: 'user_activity',
      entityType: 'user',
      entityId: userId,
      tenantId,
      userId,
      data: { action: 'dashboard_accessed', timestamp: new Date().toISOString() },
      timestamp: new Date().toISOString()
    });

    return res.json(enhancedData);
  } catch (error) {
    console.error('Error generating enhanced dashboard data:', error);
    return res.status(500).json({
      message: 'Failed to generate enhanced dashboard data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get analytics for specific time period
router.get('/analytics/period', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const tenantId = req.user?.tenant_id;
    const { startDate, endDate } = req.query;

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

    return res.json(analytics);
  } catch (error) {
    console.error('Error fetching period analytics:', error);
    return res.status(500).json({
      message: 'Failed to fetch analytics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user performance metrics
router.get('/analytics/user/:userId', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const tenantId = req.user?.tenant_id;
    const { userId } = req.params;

    if (!tenantId) {
      return res.status(400).json({ message: 'Invalid user context' });
    }

    const metrics = await EnhancedIntegrationService.getUserPerformanceMetrics(
      tenantId,
      parseInt(userId)
    );

    return res.json(metrics);
  } catch (error) {
    console.error('Error fetching user performance metrics:', error);
    return res.status(500).json({
      message: 'Failed to fetch user metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get real-time connection statistics
router.get('/realtime/stats', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const stats = realTimeService.getStats();
    return res.json(stats);
  } catch (error) {
    console.error('Error fetching real-time stats:', error);
    return res.status(500).json({
      message: 'Failed to fetch real-time statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
    


// Get project statistics
router.get('/stats/projects', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const tenantId = req.user?.tenant_id;
    
    const [stats] = await pool.query<RowDataPacket[]>(
      `SELECT 
        status,
        COUNT(*) as count,
        COALESCE(SUM(budget), 0) as total_budget
       FROM projects 
       WHERE tenant_id = ?
       GROUP BY status`,
      [tenantId]
    );
    
    return res.json(stats);
  } catch (error) {
    console.error('Error fetching project stats:', error);
    return res.status(500).json({ message: 'Failed to fetch project statistics' });
  }
});

// Get task statistics
router.get('/stats/tasks', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const tenantId = req.user?.tenant_id;
    
    const [stats] = await pool.query<RowDataPacket[]>(
      `SELECT 
        t.status,
        t.priority,
        COUNT(*) as count
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE p.tenant_id = ?
       GROUP BY t.status, t.priority`,
      [tenantId]
    );
    
    return res.json(stats);
  } catch (error) {
    console.error('Error fetching task stats:', error);
    return res.status(500).json({ message: 'Failed to fetch task statistics' });
  }
});

// Get financial overview
router.get('/stats/financial', authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const tenantId = req.user?.tenant_id;
    
    // Get project budgets
    const [projectBudgets] = await pool.query<RowDataPacket[]>(
      `SELECT 
        COALESCE(SUM(budget), 0) as total_budget,
        COUNT(*) as project_count
       FROM projects 
       WHERE tenant_id = ?`,
      [tenantId]
    );
    
    // Get expense totals
    const [expenseTotals] = await pool.query<RowDataPacket[]>(
      `SELECT 
        e.status,
        COUNT(*) as count,
        COALESCE(SUM(e.amount), 0) as total_amount
       FROM expenses e
       JOIN projects p ON e.project_id = p.id
       WHERE p.tenant_id = ?
       GROUP BY e.status`,
      [tenantId]
    );
    
    return res.json({
      budgets: projectBudgets[0] || { total_budget: 0, project_count: 0 },
      expenses: expenseTotals
    });
  } catch (error) {
    console.error('Error fetching financial stats:', error);
    return res.status(500).json({ message: 'Failed to fetch financial statistics' });
  }
});

export default router;
