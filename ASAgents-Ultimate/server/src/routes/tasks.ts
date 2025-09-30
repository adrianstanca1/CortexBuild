import { Router } from 'express';
import { authenticateUser, type AuthenticatedRequest, requireRole } from '../middleware/authenticate.js';
import { pool } from '../services/db.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

interface TaskRow extends RowDataPacket {
  id: number;
  tenant_id: number;
  project_id: number | null;
  assigned_to: number | null;
  created_by: number;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  due_date: Date | null;
  completed_at: Date | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  tags: string | null;
  created_at: Date;
  updated_at: Date;
  project_name?: string;
  assigned_user_name?: string;
  created_by_name?: string;
}

const router = Router();

// Get all tasks for a tenant
router.get('/', authenticateUser, async (req: AuthenticatedRequest, res) => {
  const { project_id, assigned_to, status, priority } = req.query;
  
  let query = `
    SELECT t.*, 
           p.name as project_name,
           CONCAT(au.first_name, ' ', au.last_name) as assigned_user_name,
           CONCAT(cu.first_name, ' ', cu.last_name) as created_by_name
    FROM tasks t
    LEFT JOIN projects p ON t.project_id = p.id
    LEFT JOIN users au ON t.assigned_to = au.id
    LEFT JOIN users cu ON t.created_by = cu.id
    WHERE t.tenant_id = ?
  `;
  
  const params: any[] = [req.user?.tenant_id];
  
  if (project_id) {
    query += ' AND t.project_id = ?';
    params.push(project_id);
  }
  
  if (assigned_to) {
    query += ' AND t.assigned_to = ?';
    params.push(assigned_to);
  }
  
  if (status) {
    query += ' AND t.status = ?';
    params.push(status);
  }
  
  if (priority) {
    query += ' AND t.priority = ?';
    params.push(priority);
  }
  
  query += ' ORDER BY t.created_at DESC';
  
  try {
    const [rows] = await pool.query<TaskRow[]>(query, params);
    
    const tasks = rows.map(row => ({
      id: row.id,
      tenantId: row.tenant_id,
      projectId: row.project_id,
      assignedTo: row.assigned_to,
      createdBy: row.created_by,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      progress: row.progress,
      dueDate: row.due_date,
      completedAt: row.completed_at,
      estimatedHours: row.estimated_hours,
      actualHours: row.actual_hours,
      tags: row.tags ? JSON.parse(row.tags) : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      projectName: row.project_name,
      assignedUserName: row.assigned_user_name,
      createdByName: row.created_by_name
    }));
    
    return res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ message: 'Failed to fetch tasks' });
  }
});

// Get a specific task
router.get('/:id', authenticateUser, async (req: AuthenticatedRequest, res) => {
  const taskId = parseInt(req.params.id);
  
  try {
    const [rows] = await pool.query<TaskRow[]>(
      `SELECT t.*, 
              p.name as project_name,
              CONCAT(au.first_name, ' ', au.last_name) as assigned_user_name,
              CONCAT(cu.first_name, ' ', cu.last_name) as created_by_name
       FROM tasks t
       LEFT JOIN projects p ON t.project_id = p.id
       LEFT JOIN users au ON t.assigned_to = au.id
       LEFT JOIN users cu ON t.created_by = cu.id
       WHERE t.id = ? AND t.tenant_id = ?`,
      [taskId, req.user?.tenant_id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const row = rows[0];
    const task = {
      id: row.id,
      tenantId: row.tenant_id,
      projectId: row.project_id,
      assignedTo: row.assigned_to,
      createdBy: row.created_by,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      progress: row.progress,
      dueDate: row.due_date,
      completedAt: row.completed_at,
      estimatedHours: row.estimated_hours,
      actualHours: row.actual_hours,
      tags: row.tags ? JSON.parse(row.tags) : [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      projectName: row.project_name,
      assignedUserName: row.assigned_user_name,
      createdByName: row.created_by_name
    };
    
    return res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return res.status(500).json({ message: 'Failed to fetch task' });
  }
});

// Create a new task
router.post('/', authenticateUser, requireRole(['owner', 'admin', 'manager']), async (req: AuthenticatedRequest, res) => {
  const {
    projectId,
    assignedTo,
    title,
    description,
    status = 'todo',
    priority = 'medium',
    progress = 0,
    dueDate,
    estimatedHours,
    tags = []
  } = req.body;
  
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }
  
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO tasks (
        tenant_id, project_id, assigned_to, created_by, title, description,
        status, priority, progress, due_date, estimated_hours, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user?.tenant_id,
        projectId || null,
        assignedTo || null,
        req.user?.sub,
        title,
        description || null,
        status,
        priority,
        progress,
        dueDate || null,
        estimatedHours || null,
        tags.length > 0 ? JSON.stringify(tags) : null
      ]
    );
    
    return res.status(201).json({ 
      id: result.insertId,
      message: 'Task created successfully'
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({ message: 'Failed to create task' });
  }
});

// Update a task
router.put('/:id', authenticateUser, requireRole(['owner', 'admin', 'manager']), async (req: AuthenticatedRequest, res) => {
  const taskId = parseInt(req.params.id);
  const {
    projectId,
    assignedTo,
    title,
    description,
    status,
    priority,
    progress,
    dueDate,
    estimatedHours,
    actualHours,
    tags
  } = req.body;
  
  try {
    // Check if task exists and belongs to tenant
    const [existingRows] = await pool.query<TaskRow[]>(
      'SELECT id FROM tasks WHERE id = ? AND tenant_id = ?',
      [taskId, req.user?.tenant_id]
    );
    
    if (existingRows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const completedAt = status === 'done' ? new Date() : null;
    
    await pool.execute(
      `UPDATE tasks SET 
        project_id = ?, assigned_to = ?, title = ?, description = ?,
        status = ?, priority = ?, progress = ?, due_date = ?,
        estimated_hours = ?, actual_hours = ?, tags = ?, completed_at = ?
       WHERE id = ? AND tenant_id = ?`,
      [
        projectId || null,
        assignedTo || null,
        title,
        description || null,
        status,
        priority,
        progress,
        dueDate || null,
        estimatedHours || null,
        actualHours || null,
        tags && tags.length > 0 ? JSON.stringify(tags) : null,
        completedAt,
        taskId,
        req.user?.tenant_id
      ]
    );
    
    return res.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({ message: 'Failed to update task' });
  }
});

// Delete a task
router.delete('/:id', authenticateUser, requireRole(['owner', 'admin', 'manager']), async (req: AuthenticatedRequest, res) => {
  const taskId = parseInt(req.params.id);
  
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM tasks WHERE id = ? AND tenant_id = ?',
      [taskId, req.user?.tenant_id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    return res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({ message: 'Failed to delete task' });
  }
});

export default router;
