import fs from 'node:fs';
import path from 'node:path';
import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import { getCurrentUser } from '../auth';

const router = Router();
const db = new Database('cortexbuild.db');

// Middleware to check if user is super admin
const checkSuperAdmin = (req: Request, res: Response, next: Function) => {
  const user = (req as any).user;
  if (user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  next();
};

// ============================================
// USER ACCESS CONTROL
// ============================================

// PATCH /api/admin/sdk/users/:id/access - Update user SDK access
router.patch('/users/:id/access', getCurrentUser, checkSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { sdk_access } = req.body;

    // Update or create SDK developer record
    const existing = db.prepare('SELECT * FROM sdk_developers WHERE user_id = ?').get(id);
    
    if (existing) {
      db.prepare('UPDATE sdk_developers SET sdk_access = ? WHERE user_id = ?').run(sdk_access ? 1 : 0, id);
    } else {
      db.prepare(`
        INSERT INTO sdk_developers (user_id, subscription_tier, api_requests_used, api_requests_limit, sdk_access)
        VALUES (?, 'free', 0, 10, ?)
      `).run(id, sdk_access ? 1 : 0);
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Update SDK access error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/admin/sdk/users/:id/tier - Update user SDK tier
router.patch('/users/:id/tier', getCurrentUser, checkSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tier } = req.body;

    const limits: Record<string, number> = {
      free: 10,
      starter: 100,
      pro: 1000,
      enterprise: -1
    };

    db.prepare(`
      UPDATE sdk_developers 
      SET subscription_tier = ?, api_requests_limit = ?
      WHERE user_id = ?
    `).run(tier, limits[tier] || 10, id);

    res.json({ success: true });
  } catch (error: any) {
    console.error('Update SDK tier error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// USAGE MONITORING
// ============================================

// GET /api/admin/sdk/usage - Get overall usage statistics
router.get('/usage', getCurrentUser, checkSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { range = '7d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    if (range === '24h') startDate.setHours(now.getHours() - 24);
    else if (range === '7d') startDate.setDate(now.getDate() - 7);
    else if (range === '30d') startDate.setDate(now.getDate() - 30);
    else if (range === '90d') startDate.setDate(now.getDate() - 90);

    const startTimestamp = startDate.toISOString();

    // Get total requests
    const totalRequests = db.prepare(`
      SELECT COUNT(*) as count FROM ai_requests
      WHERE created_at >= ?
    `).get(startTimestamp) as any;

    // Get total cost
    const totalCost = db.prepare(`
      SELECT SUM(cost) as total FROM ai_requests
      WHERE created_at >= ?
    `).get(startTimestamp) as any;

    // Get total tokens
    const totalTokens = db.prepare(`
      SELECT SUM(tokens_used) as total FROM ai_requests
      WHERE created_at >= ?
    `).get(startTimestamp) as any;

    // Get active users
    const activeUsers = db.prepare(`
      SELECT COUNT(DISTINCT user_id) as count FROM ai_requests
      WHERE created_at >= ?
    `).get(startTimestamp) as any;

    // Get today's requests
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const requestsToday = db.prepare(`
      SELECT COUNT(*) as count FROM ai_requests
      WHERE created_at >= ?
    `).get(todayStart.toISOString()) as any;

    // Get today's cost
    const costToday = db.prepare(`
      SELECT SUM(cost) as total FROM ai_requests
      WHERE created_at >= ?
    `).get(todayStart.toISOString()) as any;

    // Get this month's requests
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const requestsThisMonth = db.prepare(`
      SELECT COUNT(*) as count FROM ai_requests
      WHERE created_at >= ?
    `).get(monthStart.toISOString()) as any;

    // Get this month's cost
    const costThisMonth = db.prepare(`
      SELECT SUM(cost) as total FROM ai_requests
      WHERE created_at >= ?
    `).get(monthStart.toISOString()) as any;

    // Get average response time
    const avgResponseTime = db.prepare(`
      SELECT AVG(response_time_ms) as avg FROM ai_requests
      WHERE created_at >= ? AND response_time_ms IS NOT NULL
    `).get(startTimestamp) as any;

    // Get success rate
    const successRate = db.prepare(`
      SELECT 
        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) * 1.0 / COUNT(*) as rate
      FROM ai_requests
      WHERE created_at >= ?
    `).get(startTimestamp) as any;

    res.json({
      success: true,
      data: {
        total_requests: totalRequests.count || 0,
        total_cost: totalCost.total || 0,
        total_tokens: totalTokens.total || 0,
        active_users: activeUsers.count || 0,
        requests_today: requestsToday.count || 0,
        cost_today: costToday.total || 0,
        requests_this_month: requestsThisMonth.count || 0,
        cost_this_month: costThisMonth.total || 0,
        avg_response_time: avgResponseTime.avg || 0,
        success_rate: successRate.rate || 0
      }
    });
  } catch (error: any) {
    console.error('Get usage stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/sdk/usage/by-user - Get usage by user
router.get('/usage/by-user', getCurrentUser, checkSuperAdmin, async (req: Request, res: Response) => {
  try {
    const userUsage = db.prepare(`
      SELECT 
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        c.name as company_name,
        sd.subscription_tier as tier,
        COUNT(ar.id) as total_requests,
        SUM(ar.cost) as total_cost,
        SUM(ar.tokens_used) as total_tokens,
        MAX(ar.created_at) as last_request
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      LEFT JOIN sdk_developers sd ON u.id = sd.user_id
      LEFT JOIN ai_requests ar ON u.id = ar.user_id
      WHERE sd.sdk_access = 1
      GROUP BY u.id
      ORDER BY total_requests DESC
    `).all();

    res.json({ success: true, data: userUsage });
  } catch (error: any) {
    console.error('Get user usage error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/sdk/usage/recent - Get recent requests
router.get('/usage/recent', getCurrentUser, checkSuperAdmin, async (req: Request, res: Response) => {
  try {
    const recentRequests = db.prepare(`
      SELECT 
        ar.id,
        u.email as user_email,
        ar.request_type,
        ar.tokens_used,
        ar.cost,
        ar.created_at as timestamp,
        ar.success
      FROM ai_requests ar
      JOIN users u ON ar.user_id = u.id
      ORDER BY ar.created_at DESC
      LIMIT 100
    `).all();

    res.json({ success: true, data: recentRequests });
  } catch (error: any) {
    console.error('Get recent requests error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/sdk/usage/export - Export usage report
router.get('/usage/export', getCurrentUser, checkSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { range = '7d' } = req.query;
    
    const now = new Date();
    let startDate = new Date();
    if (range === '24h') startDate.setHours(now.getHours() - 24);
    else if (range === '7d') startDate.setDate(now.getDate() - 7);
    else if (range === '30d') startDate.setDate(now.getDate() - 30);
    else if (range === '90d') startDate.setDate(now.getDate() - 90);

    const requests = db.prepare(`
      SELECT 
        ar.created_at,
        u.email,
        u.name,
        c.name as company,
        ar.request_type,
        ar.tokens_used,
        ar.cost,
        ar.success
      FROM ai_requests ar
      JOIN users u ON ar.user_id = u.id
      LEFT JOIN companies c ON u.company_id = c.id
      WHERE ar.created_at >= ?
      ORDER BY ar.created_at DESC
    `).all(startDate.toISOString());

    // Convert to CSV
    const headers = ['Timestamp', 'User Email', 'User Name', 'Company', 'Request Type', 'Tokens', 'Cost', 'Success'];
    const csv = [
      headers.join(','),
      ...requests.map((r: any) => [
        r.created_at,
        r.email,
        r.name,
        r.company,
        r.request_type,
        r.tokens_used,
        r.cost,
        r.success ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=usage-report-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error: any) {
    console.error('Export usage error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// DATABASE CAPABILITY MANAGEMENT
// ============================================

// GET /api/admin/sdk/database-stats - Get database statistics
router.get('/database-stats', getCurrentUser, checkSuperAdmin, async (req: Request, res: Response) => {
  try {
    // Get database size
    const dbSize = db.prepare(`
      SELECT page_count * page_size / 1024.0 / 1024.0 as size_mb
      FROM pragma_page_count(), pragma_page_size()
    `).get() as any;

    // Get table count
    const tableCount = db.prepare(`
      SELECT COUNT(*) as count FROM sqlite_master WHERE type = 'table'
    `).get() as any;

    // Get total records (approximate)
    const tables = db.prepare(`
      SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
    `).all() as any[];

    let totalRecords = 0;
    const largestTables: any[] = [];

    for (const table of tables) {
      try {
        const count = db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get() as any;
        totalRecords += count.count;
        
        // Estimate table size (rough approximation)
        const tableSize = (count.count * 1024) / 1024 / 1024; // Very rough estimate
        largestTables.push({
          name: table.name,
          row_count: count.count,
          size_mb: tableSize
        });
      } catch (e) {
        // Skip tables that can't be counted
      }
    }

    // Sort by size and take top 10
    largestTables.sort((a, b) => b.size_mb - a.size_mb);

    res.json({
      success: true,
      data: {
        total_size_mb: dbSize.size_mb,
        table_count: tableCount.count,
        total_records: totalRecords,
        largest_tables: largestTables.slice(0, 10)
      }
    });
  } catch (error: any) {
    console.error('Get database stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/sdk/company-quotas - Get company quotas
router.get('/company-quotas', getCurrentUser, checkSuperAdmin, async (req: Request, res: Response) => {
  try {
    const quotas = db.prepare(`
      SELECT 
        c.id as company_id,
        c.name as company_name,
        0 as storage_used_mb,
        1000 as storage_limit_mb,
        COUNT(DISTINCT p.id) as record_count,
        10000 as record_limit,
        COUNT(DISTINCT u.id) as user_count,
        50 as user_limit
      FROM companies c
      LEFT JOIN users u ON c.id = u.company_id
      LEFT JOIN projects p ON c.id = p.company_id
      GROUP BY c.id
    `).all();

    res.json({ success: true, data: quotas });
  } catch (error: any) {
    console.error('Get company quotas error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/sdk/user-quotas - Get user quotas
router.get('/user-quotas', getCurrentUser, checkSuperAdmin, async (req: Request, res: Response) => {
  try {
    const quotas = db.prepare(`
      SELECT 
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        c.name as company_name,
        0 as storage_used_mb,
        100 as storage_limit_mb,
        sd.api_requests_used,
        sd.api_requests_limit
      FROM users u
      LEFT JOIN companies c ON u.company_id = c.id
      LEFT JOIN sdk_developers sd ON u.id = sd.user_id
      WHERE sd.sdk_access = 1
    `).all();

    res.json({ success: true, data: quotas });
  } catch (error: any) {
    console.error('Get user quotas error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/sdk/database-backup - Create database backup
router.post('/database-backup', getCurrentUser, checkSuperAdmin, async (req: Request, res: Response) => {
  try {
    const backupPath = path.join(__dirname, '../../cortexbuild-backup.db');
    
    // Use SQLite backup API
    db.backup(backupPath);
    
    // Send file
    res.download(backupPath, `cortexbuild-backup-${new Date().toISOString().split('T')[0]}.db`, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Clean up backup file
      fs.unlinkSync(backupPath);
    });
  } catch (error: any) {
    console.error('Database backup error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// DEVELOPER DASHBOARD ENDPOINTS
// ============================================

// GET /api/admin/sdk/stats - Get comprehensive SDK statistics
router.get('/stats', getCurrentUser, checkSuperAdmin, async (req: Request, res: Response) => {
  try {
    // Get total developers from sdk_profiles
    const totalDevelopers = db.prepare(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM sdk_profiles
    `).get() as { count: number };

    // Get active developers (used API in last 30 days)
    const activeDevelopers = db.prepare(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM api_usage_logs
      WHERE created_at >= datetime('now', '-30 days')
    `).get() as { count: number };

    // Get total apps
    const totalApps = db.prepare(`
      SELECT COUNT(*) as count FROM sdk_apps
    `).get() as { count: number };

    // Get total workflows
    const totalWorkflows = db.prepare(`
      SELECT COUNT(*) as count FROM sdk_workflows
    `).get() as { count: number };

    // Get total agents
    const totalAgents = db.prepare(`
      SELECT COUNT(*) as count FROM ai_agents
    `).get() as { count: number };

    // Get API requests today
    const apiRequestsToday = db.prepare(`
      SELECT COUNT(*) as count
      FROM api_usage_logs
      WHERE DATE(created_at) = DATE('now')
    `).get() as { count: number };

    // Get API requests this month
    const apiRequestsMonth = db.prepare(`
      SELECT COUNT(*) as count
      FROM api_usage_logs
      WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    `).get() as { count: number };

    // Get total cost this month
    const totalCostResult = db.prepare(`
      SELECT COALESCE(SUM(cost), 0) as total
      FROM api_usage_logs
      WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    `).get() as { total: number };

    // Average response time (mock for now)
    const avgResponseTime = 245;

    const stats = {
      totalDevelopers: totalDevelopers.count,
      activeDevelopers: activeDevelopers.count,
      totalApps: totalApps.count,
      totalWorkflows: totalWorkflows.count,
      totalAgents: totalAgents.count,
      apiRequestsToday: apiRequestsToday.count,
      apiRequestsMonth: apiRequestsMonth.count,
      totalCost: totalCostResult.total,
      avgResponseTime
    };

    res.json({ success: true, stats });
  } catch (error: any) {
    console.error('Get SDK stats error:', error);
    res.status(500).json({ error: 'Failed to get SDK stats' });
  }
});

// GET /api/admin/sdk/developers - Get all developer profiles
router.get('/developers', getCurrentUser, checkSuperAdmin, async (req: Request, res: Response) => {
  try {
    const developers = db.prepare(`
      SELECT
        sp.*,
        u.name as userName,
        u.email as userEmail
      FROM sdk_profiles sp
      JOIN users u ON sp.user_id = u.id
      ORDER BY sp.created_at DESC
    `).all();

    res.json({ success: true, developers });
  } catch (error: any) {
    console.error('Get developers error:', error);
    res.status(500).json({ error: 'Failed to get developers' });
  }
});

// GET /api/admin/sdk/usage-logs - Get API usage logs
router.get('/usage-logs', getCurrentUser, checkSuperAdmin, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;

    const logs = db.prepare(`
      SELECT
        aul.*,
        u.name as userName,
        u.email as userEmail
      FROM api_usage_logs aul
      JOIN users u ON aul.user_id = u.id
      ORDER BY aul.created_at DESC
      LIMIT ?
    `).all(limit);

    res.json({ success: true, logs });
  } catch (error: any) {
    console.error('Get usage logs error:', error);
    res.status(500).json({ error: 'Failed to get usage logs' });
  }
});

// GET /api/admin/sdk/apps - Get all SDK apps
router.get('/apps', getCurrentUser, checkSuperAdmin, async (req: Request, res: Response) => {
  try {
    const apps = db.prepare(`
      SELECT
        sa.*,
        u.name as developer_name,
        u.email as developer_email
      FROM sdk_apps sa
      JOIN users u ON sa.developer_id = u.id
      ORDER BY sa.created_at DESC
    `).all();

    res.json({ success: true, apps });
  } catch (error: any) {
    console.error('Get SDK apps error:', error);
    res.status(500).json({ error: 'Failed to get SDK apps' });
  }
});

export default router;

