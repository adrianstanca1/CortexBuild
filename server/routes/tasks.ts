// CortexBuild Platform - Tasks API Routes
// Version: 2.0.0 - Supabase Migration
// Last Updated: 2025-10-31

import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { Task, ApiResponse, PaginatedResponse } from '../types';

export function createTasksRouter(supabase: SupabaseClient): Router {
  const router = Router();

  // GET /api/tasks - List all tasks
  router.get('/', async (req: Request, res: Response) => {
    try {
      const {
        project_id,
        milestone_id,
        assigned_to,
        status,
        priority,
        search,
        page = '1',
        limit = '50'
      } = req.query as any;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      let query = supabase
        .from('project_tasks_gantt')
        .select('*', { count: 'exact' });

      // Apply filters
      if (project_id) {
        query = query.eq('project_id', project_id);
      }

      if (milestone_id) {
        query = query.eq('milestone_id', milestone_id);
      }

      if (assigned_to) {
        query = query.eq('assigned_to', assigned_to);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (priority) {
        query = query.eq('priority', priority);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // Add pagination and ordering
      query = query
        .order('end_date', { ascending: true })
        .order('priority', { ascending: false })
        .range(offset, offset + limitNum - 1);

      const { data: tasks, error, count } = await query;

      if (error) throw error;

      // Transform data
      const transformedTasks = (tasks || []).map((t: any) => ({
        ...t,
        project_name: t.projects?.name || null,
        milestone_title: t.milestones?.name || null,
        assigned_to_name: t.users?.name || null
      }));

      res.json({
        success: true,
        data: transformedTasks,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limitNum)
        }
      });
    } catch (error: any) {
      console.error('Get tasks error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // GET /api/tasks/:id - Get single task
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: task, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects!tasks_project_id_fkey(id, name),
          milestones!tasks_milestone_id_fkey(id, name),
          users!tasks_assigned_to_fkey(id, name, email)
        `)
        .eq('id', id)
        .single();

      if (error || !task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        });
      }

      // Transform data
      const transformedTask = {
        ...task,
        project_name: task.projects?.name || null,
        milestone_title: task.milestones?.name || null,
        assigned_to_name: task.users?.name || null,
        assigned_to_email: task.users?.email || null
      };

      res.json({
        success: true,
        data: transformedTask
      });
    } catch (error: any) {
      console.error('Get task error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/tasks - Create new task
  router.post('/', async (req: Request, res: Response) => {
    try {
      const {
        project_id,
        milestone_id,
        title,
        description,
        assigned_to,
        status = 'pending',
        priority = 'medium',
        due_date,
        estimated_hours
      } = req.body;

      if (!project_id || !title) {
        return res.status(400).json({
          success: false,
          error: 'Project ID and title are required'
        });
      }

      const { data: task, error } = await supabase
        .from('tasks')
        .insert({
          project_id,
          milestone_id: milestone_id || null,
          title,
          description: description || null,
          assigned_to: assigned_to || null,
          status,
          priority,
          due_date: due_date || null,
          estimated_hours: estimated_hours || null
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      try {
        const userId = (req as any).user?.id || 'user-1';
        await supabase
          .from('activities')
          .insert({
            user_id: userId,
            project_id,
            entity_type: 'task',
            entity_id: task.id,
            action: 'created',
            description: `Created task: ${title}`
          });
      } catch (activityError) {
        console.warn('Failed to log activity:', activityError);
      }

      res.status(201).json({
        success: true,
        data: task,
        message: 'Task created successfully'
      });
    } catch (error: any) {
      console.error('Create task error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/tasks/:id - Update task
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const { data: existing } = await supabase
        .from('tasks')
        .select('id')
        .eq('id', id)
        .single();

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        });
      }

      const { id: _, ...updateData } = updates;
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }

      const { data: task, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        data: task,
        message: 'Task updated successfully'
      });
    } catch (error: any) {
      console.error('Update task error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/tasks/:id/complete - Mark task as complete
  router.put('/:id/complete', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: existing } = await supabase
        .from('tasks')
        .select('id, project_id, title')
        .eq('id', id)
        .single();

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        });
      }

      const { data: task, error } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      try {
        const userId = (req as any).user?.id || 'user-1';
        await supabase
          .from('activities')
          .insert({
            user_id: userId,
            project_id: existing.project_id,
            entity_type: 'task',
            entity_id: id,
            action: 'completed',
            description: `Completed task: ${existing.title}`
          });
      } catch (activityError) {
        console.warn('Failed to log activity:', activityError);
      }

      res.json({
        success: true,
        data: task,
        message: 'Task marked as complete'
      });
    } catch (error: any) {
      console.error('Complete task error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // DELETE /api/tasks/:id - Delete task
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: task } = await supabase
        .from('tasks')
        .select('id')
        .eq('id', id)
        .single();

      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Task not found'
        });
      }

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete task error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}
