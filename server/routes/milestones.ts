// CortexBuild Platform - Milestones API Routes
// Version: 2.0.0 - Supabase Migration
// Last Updated: 2025-10-31

import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { Milestone, ApiResponse, PaginatedResponse } from '../types';

export function createMilestonesRouter(supabase: SupabaseClient): Router {
  const router = Router();

  // GET /api/milestones - List all milestones
  router.get('/', async (req: Request, res: Response) => {
    try {
      const {
        project_id,
        status,
        search,
        page = '1',
        limit = '50'
      } = req.query as any;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      let query = supabase
        .from('milestones')
        .select(`
          *,
          projects!milestones_project_id_fkey(id, name),
          tasks!tasks_milestone_id_fkey(id, status)
        `, { count: 'exact' });

      // Apply filters
      if (project_id) {
        query = query.eq('project_id', project_id);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // Add pagination and ordering
      query = query
        .order('due_date', { ascending: true })
        .range(offset, offset + limitNum - 1);

      const { data: milestones, error, count } = await query;

      if (error) throw error;

      // Transform data and calculate task counts
      const transformedMilestones = (milestones || []).map((m: any) => {
        const projects = Array.isArray(m.projects) ? m.projects[0] : m.projects;
        const tasks = m.tasks || [];
        const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;

        return {
          ...m,
          project_name: projects?.name || null,
          task_count: tasks.length,
          completed_tasks: completedTasks
        };
      });

      res.json({
        success: true,
        data: transformedMilestones,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limitNum)
        }
      });
    } catch (error: any) {
      console.error('Get milestones error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // GET /api/milestones/:id - Get single milestone with tasks
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: milestone, error: milestoneError } = await supabase
        .from('milestones')
        .select(`
          *,
          projects!milestones_project_id_fkey(id, name)
        `)
        .eq('id', id)
        .single();

      if (milestoneError || !milestone) {
        return res.status(404).json({
          success: false,
          error: 'Milestone not found'
        });
      }

      // Get associated tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select(`
          *,
          users!tasks_assigned_to_fkey(id, name)
        `)
        .eq('milestone_id', id)
        .order('due_date', { ascending: true });

      // Transform data
      const projects = Array.isArray(milestone.projects) ? milestone.projects[0] : milestone.projects;
      const transformedTasks = (tasks || []).map((t: any) => {
        const users = Array.isArray(t.users) ? t.users[0] : t.users;
        return {
          ...t,
          assigned_to_name: users?.name || null
        };
      });

      const transformedMilestone = {
        ...milestone,
        project_name: projects?.name || null,
        tasks: transformedTasks
      };

      res.json({
        success: true,
        data: transformedMilestone
      });
    } catch (error: any) {
      console.error('Get milestone error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/milestones - Create new milestone
  router.post('/', async (req: Request, res: Response) => {
    try {
      const {
        project_id,
        title,
        description,
        due_date,
        status = 'pending'
      } = req.body;

      if (!project_id || !title || !due_date) {
        return res.status(400).json({
          success: false,
          error: 'Project ID, title, and due date are required'
        });
      }

      const { data: milestone, error } = await supabase
        .from('milestones')
        .insert({
          project_id,
          name: title, // Note: database uses 'name' but API accepts 'title'
          description: description || null,
          due_date,
          status
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
            entity_type: 'milestone',
            entity_id: milestone.id,
            action: 'created',
            description: `Created milestone: ${title}`
          });
      } catch (activityError) {
        console.warn('Failed to log activity:', activityError);
      }

      res.status(201).json({
        success: true,
        data: milestone,
        message: 'Milestone created successfully'
      });
    } catch (error: any) {
      console.error('Create milestone error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/milestones/:id - Update milestone
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const { data: existing } = await supabase
        .from('milestones')
        .select('id, name, project_id')
        .eq('id', id)
        .single();

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Milestone not found'
        });
      }

      // Map 'title' to 'name' if provided
      const updateData = { ...updates };
      if (updateData.title) {
        updateData.name = updateData.title;
        delete updateData.title;
      }

      const { id: _, ...updateFields } = updateData;
      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }

      const { data: milestone, error } = await supabase
        .from('milestones')
        .update(updateFields)
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
            entity_type: 'milestone',
            entity_id: id,
            action: 'updated',
            description: `Updated milestone: ${existing.name}`
          });
      } catch (activityError) {
        console.warn('Failed to log activity:', activityError);
      }

      res.json({
        success: true,
        data: milestone,
        message: 'Milestone updated successfully'
      });
    } catch (error: any) {
      console.error('Update milestone error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // DELETE /api/milestones/:id - Delete milestone
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: milestone } = await supabase
        .from('milestones')
        .select('id')
        .eq('id', id)
        .single();

      if (!milestone) {
        return res.status(404).json({
          success: false,
          error: 'Milestone not found'
        });
      }

      // Check if milestone has tasks
      const { count } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('milestone_id', id);

      if ((count || 0) > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete milestone with associated tasks. Remove tasks first.'
        });
      }

      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({
        success: true,
        message: 'Milestone deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete milestone error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}
