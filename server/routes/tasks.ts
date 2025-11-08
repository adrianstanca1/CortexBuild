// CortexBuild Platform - Tasks API Routes
// Version: 2.0.0 - Supabase Migration
// Last Updated: 2025-10-31

import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { Task, ApiResponse, PaginatedResponse } from '../types';
import {
  validateBody,
  validateQuery,
  validateParams,
  createTaskSchema,
  updateTaskSchema,
  taskFiltersSchema,
  idParamSchema
} from '../utils/validation';

export function createTasksRouter(supabase: SupabaseClient): Router {
  const router = Router();

  // GET /api/tasks - List all tasks
  router.get('/', validateQuery(taskFiltersSchema), async (req: Request, res: Response) => {
    try {
      const {
        project_id,
        milestone_id,
        assigned_to,
        status,
        priority,
        search,
        page = 1,
        limit = 50
      } = req.query as any;

      const pageNum = page;
      const limitNum = limit;
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
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
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
  router.get('/:id', validateParams(idParamSchema), async (req: Request, res: Response) => {
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
  router.post('/', validateBody(createTaskSchema), (req: Request, res: Response) => {
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

      const result = db.prepare(`
        INSERT INTO tasks (
          project_id, milestone_id, title, description, assigned_to,
          status, priority, due_date, estimated_hours
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        project_id, milestone_id, title, description, assigned_to,
        status, priority, due_date, estimated_hours
      );

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
  router.put('/:id', validateParams(idParamSchema), validateBody(updateTaskSchema), (req: Request, res: Response) => {
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

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field]);

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
  router.put('/:id/complete', validateParams(idParamSchema), (req: Request, res: Response) => {
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
  router.delete('/:id', validateParams(idParamSchema), (req: Request, res: Response) => {
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
