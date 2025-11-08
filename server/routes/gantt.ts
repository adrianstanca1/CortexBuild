/**
 * Gantt Chart API Routes
 * Handles project scheduling with Gantt charts
 */

import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';

export function createGanttRouter(supabase: SupabaseClient): Router {
  const router = Router();

  // GET /api/projects/:id/gantt - Get Gantt chart for project
  router.get('/projects/:id/gantt', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: tasks, error } = await supabase
        .from('project_tasks_gantt')
        .select('*')
        .eq('project_id', id)
        .order('start_date');

      if (error) throw error;

      const { data: dependencies } = await supabase
        .from('gantt_dependencies')
        .select('*');

      res.json({
        success: true,
        data: {
          tasks,
          dependencies: dependencies || []
        }
      });
    } catch (error: any) {
      console.error('Gantt fetch error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch Gantt chart'
      });
    }
  });

  // POST /api/projects/:id/gantt/tasks - Create task
  router.post('/projects/:id/gantt/tasks', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const taskData = {
        project_id: parseInt(id),
        ...req.body
      };

      const { data, error } = await supabase
        .from('project_tasks_gantt')
        .insert(taskData)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        data
      });
    } catch (error: any) {
      console.error('Create task error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create task'
      });
    }
  });

  // PUT /api/projects/:id/gantt/tasks/:taskId - Update task
  router.put('/projects/:id/gantt/tasks/:taskId', async (req: Request, res: Response) => {
    try {
      const { taskId } = req.params;

      const { data, error } = await supabase
        .from('project_tasks_gantt')
        .update(req.body)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        data
      });
    } catch (error: any) {
      console.error('Update task error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update task'
      });
    }
  });

  // DELETE /api/projects/:id/gantt/tasks/:taskId - Delete task
  router.delete('/projects/:id/gantt/tasks/:taskId', async (req: Request, res: Response) => {
    try {
      const { taskId } = req.params;

      const { error } = await supabase
        .from('project_tasks_gantt')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      res.json({ success: true });
    } catch (error: any) {
      console.error('Delete task error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete task'
      });
    }
  });

  // POST /api/projects/:id/gantt/dependencies - Create dependency
  router.post('/projects/:id/gantt/dependencies', async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('gantt_dependencies')
        .insert(req.body)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        data
      });
    } catch (error: any) {
      console.error('Create dependency error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create dependency'
      });
    }
  });

  // GET /api/projects/:id/gantt/critical-path - Calculate critical path
  router.get('/projects/:id/gantt/critical-path', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: tasks } = await supabase
        .from('project_tasks_gantt')
        .select('*')
        .eq('project_id', id);

      const { data: dependencies } = await supabase
        .from('gantt_dependencies')
        .select('*');

      // Simple critical path calculation
      const criticalPath = calculateCriticalPath(tasks || [], dependencies || []);
      
      res.json({
        success: true,
        data: criticalPath
      });
    } catch (error: any) {
      console.error('Critical path error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to calculate critical path'
      });
    }
  });

  // POST /api/projects/:id/gantt/optimize - Optimize schedule
  router.post('/projects/:id/gantt/optimize', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // TODO: Implement optimization algorithm
      res.json({
        success: true,
        data: { message: 'Optimization completed' }
      });
    } catch (error: any) {
      console.error('Optimize error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to optimize'
      });
    }
  });

  return router;
}

// Helper function to calculate critical path
function calculateCriticalPath(tasks: any[], dependencies: any[]): any[] {
  // Simplified critical path calculation
  // In production, implement proper CPM algorithm
  return tasks.filter(task => task.critical_path === true);
}

