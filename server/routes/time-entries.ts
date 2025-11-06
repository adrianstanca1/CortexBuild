// CortexBuild Platform - Time Tracking API Routes
// Version: 2.0.0 - Supabase Migration
// Last Updated: 2025-10-31

import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { TimeEntry, ApiResponse, PaginatedResponse } from '../types';

export function createTimeEntriesRouter(supabase: SupabaseClient): Router {
  const router = Router();

  // GET /api/time-entries - List all time entries with filters
  router.get('/', async (req: Request, res: Response) => {
    try {
      const {
        user_id,
        project_id,
        task_id,
        billable,
        start_date,
        end_date,
        page = '1',
        limit = '50'
      } = req.query as any;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      let query = supabase
        .from('time_entries')
        .select(`
          *,
          users!time_entries_user_id_fkey(id, name),
          projects!time_entries_project_id_fkey(id, name),
          tasks!time_entries_task_id_fkey(id, title)
        `, { count: 'exact' });

      // Apply filters
      if (user_id) {
        query = query.eq('user_id', user_id);
      }

      if (project_id) {
        query = query.eq('project_id', project_id);
      }

      if (task_id) {
        query = query.eq('task_id', task_id);
      }

      if (billable !== undefined) {
        query = query.eq('billable', billable === 'true');
      }

      if (start_date) {
        query = query.gte('start_time', start_date);
      }

      if (end_date) {
        query = query.lte('start_time', end_date);
      }

      // Add pagination and ordering
      query = query
        .order('start_time', { ascending: false })
        .range(offset, offset + limitNum - 1);

      const { data: entries, error, count } = await query;

      if (error) throw error;

      // Transform data
      const transformedEntries = (entries || []).map((e: any) => {
        const users = Array.isArray(e.users) ? e.users[0] : e.users;
        const projects = Array.isArray(e.projects) ? e.projects[0] : e.projects;
        const tasks = Array.isArray(e.tasks) ? e.tasks[0] : e.tasks;
        return {
          ...e,
          user_name: users?.name || null,
          project_name: projects?.name || null,
          task_title: tasks?.title || null
        };
      });

      res.json({
        success: true,
        data: transformedEntries,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limitNum)
        }
      });
    } catch (error: any) {
      console.error('Get time entries error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // GET /api/time-entries/:id - Get single time entry
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: entry, error } = await supabase
        .from('time_entries')
        .select(`
          *,
          users!time_entries_user_id_fkey(id, name, email),
          projects!time_entries_project_id_fkey(id, name),
          tasks!time_entries_task_id_fkey(id, title)
        `)
        .eq('id', id)
        .single();

      if (error || !entry) {
        return res.status(404).json({
          success: false,
          error: 'Time entry not found'
        });
      }

      // Transform data
      const users = Array.isArray(entry.users) ? entry.users[0] : entry.users;
      const projects = Array.isArray(entry.projects) ? entry.projects[0] : entry.projects;
      const tasks = Array.isArray(entry.tasks) ? entry.tasks[0] : entry.tasks;

      const transformedEntry = {
        ...entry,
        user_name: users?.name || null,
        user_email: users?.email || null,
        project_name: projects?.name || null,
        task_title: tasks?.title || null
      };

      res.json({
        success: true,
        data: transformedEntry
      });
    } catch (error: any) {
      console.error('Get time entry error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/time-entries - Create/start new time entry
  router.post('/', async (req: Request, res: Response) => {
    try {
      const {
        user_id,
        project_id,
        task_id,
        description,
        start_time,
        billable = true,
        hourly_rate
      } = req.body;

      if (!user_id || !project_id) {
        return res.status(400).json({
          success: false,
          error: 'User ID and Project ID are required'
        });
      }

      const { data: entry, error } = await supabase
        .from('time_entries')
        .insert({
          user_id,
          project_id,
          task_id: task_id || null,
          description: description || null,
          start_time: start_time || new Date().toISOString(),
          billable,
          hourly_rate: hourly_rate || null
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      try {
        await supabase
          .from('activities')
          .insert({
            user_id,
            project_id,
            entity_type: 'time_entry',
            entity_id: entry.id,
            action: 'created',
            description: 'Started time tracking'
          });
      } catch (activityError) {
        console.warn('Failed to log activity:', activityError);
      }

      res.status(201).json({
        success: true,
        data: entry,
        message: 'Time entry started successfully'
      });
    } catch (error: any) {
      console.error('Create time entry error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/time-entries/:id - Update/stop time entry
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const { data: existing } = await supabase
        .from('time_entries')
        .select('id, start_time, end_time')
        .eq('id', id)
        .single();

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Time entry not found'
        });
      }

      // If stopping timer, calculate duration
      const updateData = { ...updates };
      if (updateData.end_time && !existing.end_time) {
        const startTime = new Date(existing.start_time).getTime();
        const endTime = new Date(updateData.end_time).getTime();
        updateData.duration = Math.round((endTime - startTime) / 1000 / 60); // minutes
      }

      const { id: _, ...updateFields } = updateData;
      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }

      const { data: entry, error } = await supabase
        .from('time_entries')
        .update(updateFields)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        data: entry,
        message: 'Time entry updated successfully'
      });
    } catch (error: any) {
      console.error('Update time entry error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // GET /api/time-entries/summary/stats - Get time summary
  router.get('/summary/stats', async (req: Request, res: Response) => {
    try {
      const { user_id, project_id, start_date, end_date } = req.query as any;

      let query = supabase
        .from('time_entries')
        .select('duration, billable', { count: 'exact' });

      // Apply filters
      if (user_id) {
        query = query.eq('user_id', user_id);
      }

      if (project_id) {
        query = query.eq('project_id', project_id);
      }

      if (start_date) {
        query = query.gte('start_time', start_date);
      }

      if (end_date) {
        query = query.lte('start_time', end_date);
      }

      const { data: entries, error, count } = await query;

      if (error) throw error;

      // Calculate summary
      const summary = {
        total_entries: count || 0,
        total_minutes: (entries || []).reduce((sum, e) => sum + (e.duration || 0), 0),
        billable_minutes: (entries || []).reduce((sum, e) => sum + (e.billable && e.duration ? e.duration : 0), 0),
        non_billable_minutes: (entries || []).reduce((sum, e) => sum + (!e.billable && e.duration ? e.duration : 0), 0)
      };

      res.json({
        success: true,
        data: summary
      });
    } catch (error: any) {
      console.error('Get time summary error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // DELETE /api/time-entries/:id - Delete time entry
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: entry } = await supabase
        .from('time_entries')
        .select('id')
        .eq('id', id)
        .single();

      if (!entry) {
        return res.status(404).json({
          success: false,
          error: 'Time entry not found'
        });
      }

      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({
        success: true,
        message: 'Time entry deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete time entry error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}
