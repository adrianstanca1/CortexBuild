import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

let tasks: any[] = []; // In production, this would be from database

const verifyAuth = (req: VercelRequest) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }
  const token = authHeader.substring(7);
  return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const user = verifyAuth(req);
    const { operation, task_ids, updates, filters } = req.body;

    if (!operation) {
      return res.status(400).json({
        success: false,
        error: 'Operation is required (update, delete, assign, change_status, change_priority)'
      });
    }

    let affectedTasks: any[] = [];
    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[]
    };

    // Get tasks to operate on
    if (task_ids && Array.isArray(task_ids)) {
      affectedTasks = tasks.filter(t => task_ids.includes(t.id));
    } else if (filters) {
      // Apply filters to select tasks
      affectedTasks = tasks.filter(t => {
        if (filters.project_id && t.project_id !== filters.project_id) return false;
        if (filters.status && t.status !== filters.status) return false;
        if (filters.priority && t.priority !== filters.priority) return false;
        if (filters.assigned_to && t.assigned_to !== filters.assigned_to) return false;
        return true;
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Either task_ids or filters must be provided'
      });
    }

    if (affectedTasks.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No tasks found matching criteria'
      });
    }

    // Perform batch operation
    switch (operation) {
      case 'update':
        if (!updates) {
          return res.status(400).json({ success: false, error: 'Updates object required' });
        }

        affectedTasks.forEach(task => {
          const taskIndex = tasks.findIndex(t => t.id === task.id);
          if (taskIndex !== -1) {
            tasks[taskIndex] = {
              ...task,
              ...updates,
              id: task.id,
              project_id: task.project_id,
              created_at: task.created_at,
              updated_at: new Date().toISOString()
            };
            results.success++;
          } else {
            results.failed++;
            results.errors.push({ task_id: task.id, error: 'Task not found' });
          }
        });
        break;

      case 'delete':
        // Check permissions
        if (user.role !== 'super_admin' && user.role !== 'company_admin' && user.role !== 'supervisor') {
          return res.status(403).json({ success: false, error: 'Insufficient permissions' });
        }

        affectedTasks.forEach(task => {
          const taskIndex = tasks.findIndex(t => t.id === task.id);
          if (taskIndex !== -1) {
            tasks.splice(taskIndex, 1);
            results.success++;
          } else {
            results.failed++;
            results.errors.push({ task_id: task.id, error: 'Task not found' });
          }
        });
        break;

      case 'assign':
        if (!updates?.assigned_to) {
          return res.status(400).json({ success: false, error: 'assigned_to is required' });
        }

        affectedTasks.forEach(task => {
          const taskIndex = tasks.findIndex(t => t.id === task.id);
          if (taskIndex !== -1) {
            tasks[taskIndex] = {
              ...task,
              assigned_to: updates.assigned_to,
              updated_at: new Date().toISOString()
            };
            results.success++;
          } else {
            results.failed++;
            results.errors.push({ task_id: task.id, error: 'Task not found' });
          }
        });
        break;

      case 'change_status':
        if (!updates?.status) {
          return res.status(400).json({ success: false, error: 'status is required' });
        }

        affectedTasks.forEach(task => {
          const taskIndex = tasks.findIndex(t => t.id === task.id);
          if (taskIndex !== -1) {
            const newStatus = updates.status;
            const progress = newStatus === 'completed' ? 100 :
                           newStatus === 'in-progress' ? (task.progress || 0) :
                           newStatus === 'todo' ? 0 : task.progress;

            tasks[taskIndex] = {
              ...task,
              status: newStatus,
              progress,
              completed_at: newStatus === 'completed' ? new Date().toISOString() : task.completed_at,
              updated_at: new Date().toISOString()
            };
            results.success++;
          } else {
            results.failed++;
            results.errors.push({ task_id: task.id, error: 'Task not found' });
          }
        });
        break;

      case 'change_priority':
        if (!updates?.priority) {
          return res.status(400).json({ success: false, error: 'priority is required' });
        }

        affectedTasks.forEach(task => {
          const taskIndex = tasks.findIndex(t => t.id === task.id);
          if (taskIndex !== -1) {
            tasks[taskIndex] = {
              ...task,
              priority: updates.priority,
              updated_at: new Date().toISOString()
            };
            results.success++;
          } else {
            results.failed++;
            results.errors.push({ task_id: task.id, error: 'Task not found' });
          }
        });
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid operation. Supported: update, delete, assign, change_status, change_priority'
        });
    }

    console.log(`✅ Batch ${operation}: ${results.success} succeeded, ${results.failed} failed`);

    // Create activity log
    const activity = {
      type: 'batch_task_operation',
      operation,
      user_id: user.userId,
      affected_count: results.success,
      timestamp: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      message: `Batch operation completed`,
      results,
      activity,
      total_affected: affectedTasks.length
    });

  } catch (error: any) {
    console.error('❌ Batch tasks API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
