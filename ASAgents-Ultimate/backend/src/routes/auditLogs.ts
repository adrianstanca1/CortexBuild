import { Router } from 'express';
import { getDatabase } from '../database/connection';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler, errors } from '../middleware/errorHandler';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Audit log helper function
export async function createAuditLog(
  companyId: string,
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  details?: any
) {
  const db = getDatabase();
  
  const auditData = {
    id: uuidv4(),
    company_id: companyId,
    user_id: userId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    details: details ? JSON.stringify(details) : null,
    ip_address: null, // Will be set by middleware if needed
    user_agent: null
  };
  
  await db.run(`
    INSERT INTO audit_logs (
      id, company_id, user_id, action, resource_type, 
      resource_id, details, ip_address, user_agent
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    auditData.id,
    auditData.company_id,
    auditData.user_id,
    auditData.action,
    auditData.resource_type,
    auditData.resource_id,
    auditData.details,
    auditData.ip_address,
    auditData.user_agent
  ]);
  
  return auditData.id;
}

// Get audit logs (admin only)
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  const { company_id, role } = req.user;
  
  // Only admins can view audit logs
  if (role !== 'admin') {
    throw errors.forbidden('Insufficient permissions to view audit logs');
  }
  
  const { 
    user_id, 
    resource_type, 
    action, 
    date_from, 
    date_to, 
    limit = 100,
    offset = 0
  } = req.query;
  
  let query = `
    SELECT al.*, 
           u.first_name || ' ' || u.last_name as user_name,
           u.email as user_email
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE al.company_id = ?
  `;
  const params = [company_id];
  
  if (user_id) {
    query += ' AND al.user_id = ?';
    params.push(user_id);
  }
  
  if (resource_type) {
    query += ' AND al.resource_type = ?';
    params.push(resource_type);
  }
  
  if (action) {
    query += ' AND al.action = ?';
    params.push(action);
  }
  
  if (date_from) {
    query += ' AND DATE(al.created_at) >= ?';
    params.push(date_from);
  }
  
  if (date_to) {
    query += ' AND DATE(al.created_at) <= ?';
    params.push(date_to);
  }
  
  query += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));
  
  const auditLogs = await db.all(query, params);
  
  // Parse details JSON
  const logsWithDetails = auditLogs.map(log => ({
    ...log,
    details: log.details ? JSON.parse(log.details) : null
  }));
  
  res.json({
    success: true,
    data: logsWithDetails
  });
}));

// Get audit log statistics (admin only)
router.get('/stats', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  const { company_id, role } = req.user;
  
  if (role !== 'admin') {
    throw errors.forbidden('Insufficient permissions to view audit statistics');
  }
  
  const stats = await db.all(`
    SELECT 
      action,
      resource_type,
      COUNT(*) as count,
      MAX(created_at) as last_occurrence
    FROM audit_logs 
    WHERE company_id = ?
    GROUP BY action, resource_type
    ORDER BY count DESC
  `, [company_id]);
  
  const totalLogs = await db.get(`
    SELECT COUNT(*) as total FROM audit_logs WHERE company_id = ?
  `, [company_id]);
  
  const recentActivity = await db.all(`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as activity_count
    FROM audit_logs 
    WHERE company_id = ? AND created_at >= DATE('now', '-30 days')
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `, [company_id]);
  
  res.json({
    success: true,
    data: {
      total_logs: totalLogs.total,
      action_stats: stats,
      recent_activity: recentActivity
    }
  });
}));

// Get audit logs for a specific resource
router.get('/resource/:resourceType/:resourceId', authenticate, asyncHandler(async (req, res) => {
  const db = getDatabase();
  const { resourceType, resourceId } = req.params;
  const { company_id, role } = req.user;
  
  if (role !== 'admin' && role !== 'project_manager') {
    throw errors.forbidden('Insufficient permissions to view resource audit logs');
  }
  
  const auditLogs = await db.all(`
    SELECT al.*, 
           u.first_name || ' ' || u.last_name as user_name
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE al.company_id = ? AND al.resource_type = ? AND al.resource_id = ?
    ORDER BY al.created_at DESC
  `, [company_id, resourceType, resourceId]);
  
  const logsWithDetails = auditLogs.map(log => ({
    ...log,
    details: log.details ? JSON.parse(log.details) : null
  }));
  
  res.json({
    success: true,
    data: logsWithDetails
  });
}));

export default router;