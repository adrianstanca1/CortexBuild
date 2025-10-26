import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

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
    tags: ['structural', 'engineering'],
    created_at: new Date('2025-01-20').toISOString(),
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
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const user = verifyAuth(req);
    const { id } = req.query;

    // GET - Fetch single task
    if (req.method === 'GET') {
      const task = tasks.find(t => t.id === id);

      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      return res.status(200).json({ success: true, data: task });
    }

    // PUT/PATCH - Update task (with real-time notification)
    if (req.method === 'PUT' || req.method === 'PATCH') {
      const taskIndex = tasks.findIndex(t => t.id === id);

      if (taskIndex === -1) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      const updates = req.body;
      const oldStatus = tasks[taskIndex].status;

      // Handle completion
      if (updates.status === 'completed' && oldStatus !== 'completed') {
        updates.completed_at = new Date().toISOString();
        updates.progress = 100;
      }

      tasks[taskIndex] = {
        ...tasks[taskIndex],
        ...updates,
        id: tasks[taskIndex].id,
        updated_at: new Date().toISOString()
      };

      console.log(`✅ Task updated: ${tasks[taskIndex].title}`);

      // Real-time notification
      const notification = {
        type: 'task_updated',
        task_id: tasks[taskIndex].id,
        message: `Task updated: ${tasks[taskIndex].title}`,
        changes: Object.keys(updates),
        timestamp: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        data: tasks[taskIndex],
        notification,
        message: 'Task updated successfully'
      });
    }

    // DELETE - Delete task
    if (req.method === 'DELETE') {
      const taskIndex = tasks.findIndex(t => t.id === id);

      if (taskIndex === -1) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      const deletedTask = tasks[taskIndex];
      tasks.splice(taskIndex, 1);

      console.log(`🗑️ Task deleted: ${deletedTask.title}`);

      return res.status(200).json({
        success: true,
        message: 'Task deleted successfully'
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error: any) {
    console.error('❌ Task API error:', error);

    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
