import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

// Mock tasks database
let tasks = [
  {
    id: 'task-1',
    project_id: 'proj-1',
    title: 'Finalize structural drawings',
    description: 'Coordinate with structural engineer for final steel framing package',
    status: 'in-progress',
    priority: 'high',
    assigned_to: 'user-3',
    created_by: 'user-2',
    due_date: '2025-02-10',
    estimated_hours: 120,
    actual_hours: 48,
    progress: 40,
    tags: ['structural', 'engineering', 'critical-path'],
    created_at: new Date('2025-01-20').toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null
  },
  {
    id: 'task-2',
    project_id: 'proj-1',
    title: 'Issue procurement schedule',
    description: 'Compile long-lead items and issue procurement log',
    status: 'todo',
    priority: 'medium',
    assigned_to: 'user-5',
    created_by: 'user-2',
    due_date: '2025-02-05',
    estimated_hours: 40,
    actual_hours: 0,
    progress: 0,
    tags: ['procurement', 'logistics'],
    created_at: new Date('2025-01-22').toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: null
  }
];

const verifyAuth = (req: VercelRequest) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.substring(7);
  return jwt.verify(token, JWT_SECRET) as {
    userId: string;
    email: string;
    role: string;
  };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const user = verifyAuth(req);

    // GET - Fetch tasks with intelligent filtering
    if (req.method === 'GET') {
      const { project_id, status, priority, assigned_to, overdue, search } = req.query;

      let filteredTasks = [...tasks];

      // Filter by project
      if (project_id) {
        filteredTasks = filteredTasks.filter(t => t.project_id === project_id);
      }

      // Filter by status
      if (status) {
        filteredTasks = filteredTasks.filter(t => t.status === status);
      }

      // Filter by priority
      if (priority) {
        filteredTasks = filteredTasks.filter(t => t.priority === priority);
      }

      // Filter by assignee
      if (assigned_to) {
        filteredTasks = filteredTasks.filter(t => t.assigned_to === assigned_to);
      }

      // Filter overdue tasks
      if (overdue === 'true') {
        const today = new Date().toISOString().split('T')[0];
        filteredTasks = filteredTasks.filter(t =>
          t.status !== 'completed' && t.due_date && t.due_date < today
        );
      }

      // Search filter
      if (search) {
        const searchLower = (search as string).toLowerCase();
        filteredTasks = filteredTasks.filter(t =>
          t.title.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower) ||
          t.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      // Calculate task analytics
      const analytics = {
        total: filteredTasks.length,
        todo: filteredTasks.filter(t => t.status === 'todo').length,
        in_progress: filteredTasks.filter(t => t.status === 'in-progress').length,
        completed: filteredTasks.filter(t => t.status === 'completed').length,
        blocked: filteredTasks.filter(t => t.status === 'blocked').length,
        overdue: filteredTasks.filter(t => {
          const today = new Date().toISOString().split('T')[0];
          return t.status !== 'completed' && t.due_date && t.due_date < today;
        }).length,
        high_priority: filteredTasks.filter(t => t.priority === 'high' || t.priority === 'critical').length,
        avg_progress: Math.round(
          filteredTasks.reduce((sum, t) => sum + t.progress, 0) / filteredTasks.length || 0
        ),
        total_estimated_hours: filteredTasks.reduce((sum, t) => sum + t.estimated_hours, 0),
        total_actual_hours: filteredTasks.reduce((sum, t) => sum + t.actual_hours, 0)
      };

      console.log(`📋 Fetched ${filteredTasks.length} tasks for user ${user.email}`);

      return res.status(200).json({
        success: true,
        data: filteredTasks,
        analytics
      });
    }

    // POST - Create new task
    if (req.method === 'POST') {
      const taskData = req.body;

      if (!taskData.title || !taskData.project_id) {
        return res.status(400).json({
          success: false,
          error: 'Task title and project are required'
        });
      }

      const newTask = {
        id: `task-${Date.now()}`,
        project_id: taskData.project_id,
        title: taskData.title,
        description: taskData.description || '',
        status: taskData.status || 'todo',
        priority: taskData.priority || 'medium',
        assigned_to: taskData.assigned_to || null,
        created_by: user.userId,
        due_date: taskData.due_date || null,
        estimated_hours: parseFloat(taskData.estimated_hours) || 0,
        actual_hours: 0,
        progress: 0,
        tags: taskData.tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: null
      };

      tasks.push(newTask);

      console.log(`✅ Task created: ${newTask.title} by ${user.email}`);

      // Simulate real-time notification
      const notification = {
        type: 'task_created',
        task_id: newTask.id,
        message: `New task created: ${newTask.title}`,
        timestamp: new Date().toISOString()
      };

      return res.status(201).json({
        success: true,
        data: newTask,
        notification,
        message: 'Task created successfully'
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error: any) {
    console.error('❌ Tasks API error:', error);

    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
