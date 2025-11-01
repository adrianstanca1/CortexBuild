// CortexBuild Platform - Projects API Routes
// Version: 2.0.0 - Supabase Migration
// Last Updated: 2025-10-31

import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { Project, ApiResponse, PaginatedResponse, ProjectFilters } from '../types';
import { logProjectActivity } from '../utils/activity-logger';

export function createProjectsRouter(supabase: SupabaseClient): Router {
  const router = Router();

  // GET /api/projects - List all projects with filters
  router.get('/', async (req: Request, res: Response) => {
    try {
      const {
        status,
        priority,
        client_id,
        project_manager_id,
        company_id,
        search,
        page = '1',
        limit = '20'
      } = req.query as any;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      // Build query with joins
      let query = supabase
        .from('projects')
        .select(`
          *,
          companies!projects_company_id_fkey(id, name),
          users!projects_project_manager_id_fkey(id, name)
        `, { count: 'exact' });

      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }

      if (priority) {
        query = query.eq('priority', priority);
      }

      if (client_id) {
        query = query.eq('client_id', client_id);
      }

      if (project_manager_id) {
        query = query.eq('project_manager_id', project_manager_id);
      }

      if (company_id) {
        query = query.eq('company_id', company_id);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,project_number.ilike.%${search}%`);
      }

      // Add pagination and ordering
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limitNum - 1);

      const { data: projects, error, count } = await query;

      if (error) throw error;

      // Transform data to match expected format
      const transformedProjects = (projects || []).map((p: any) => ({
        ...p,
        client_name: p.clients?.name || null,
        manager_name: p.users?.name || null
      }));

      const response: PaginatedResponse<Project> = {
        success: true,
        data: transformedProjects as Project[],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limitNum)
        }
      };

      res.json(response);
    } catch (error: any) {
      console.error('Get projects error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // GET /api/projects/:id - Get single project
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select(`
          *,
          clients!projects_client_id_fkey(id, name, email, phone),
          users!projects_project_manager_id_fkey(id, name, email)
        `)
        .eq('id', id)
        .single();

      if (projectError || !project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      // Get related data
      const [tasksResult, milestonesResult, teamResult, activitiesResult] = await Promise.all([
        supabase
          .from('tasks')
          .select(`
            *,
            users!tasks_assigned_to_fkey(id, name)
          `)
          .eq('project_id', id)
          .order('order_index', { ascending: true })
          .order('created_at', { ascending: true }),
        supabase
          .from('milestones')
          .select('*')
          .eq('project_id', id)
          .order('due_date', { ascending: true }),
        supabase
          .from('project_team')
          .select(`
            *,
            users!project_team_user_id_fkey(id, name, email, avatar)
          `)
          .eq('project_id', id)
          .is('left_at', null),
        supabase
          .from('activities')
          .select(`
            *,
            users!activities_user_id_fkey(id, name)
          `)
          .eq('project_id', id)
          .order('created_at', { ascending: false })
          .limit(20)
      ]);

      // Transform data
      const transformedProject: any = {
        ...project,
        client_name: project.clients?.name || null,
        client_email: project.clients?.email || null,
        client_phone: project.clients?.phone || null,
        manager_name: project.users?.name || null,
        manager_email: project.users?.email || null,
        tasks: (tasksResult.data || []).map((t: any) => ({
          ...t,
          assigned_to_name: t.users?.name || null
        })),
        milestones: milestonesResult.data || [],
        team: (teamResult.data || []).map((t: any) => ({
          ...t,
          full_name: t.users?.name || null,
          email: t.users?.email || null,
          avatar_url: t.users?.avatar || null
        })),
        activities: (activitiesResult.data || []).map((a: any) => ({
          ...a,
          user_name: a.users?.name || null
        }))
      };

      const response: ApiResponse = {
        success: true,
        data: transformedProject
      };

      res.json(response);
    } catch (error: any) {
      console.error('Get project error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/projects - Create new project
  router.post('/', async (req: Request, res: Response) => {
    try {
      const {
        company_id,
        name,
        description,
        project_number,
        status = 'planning',
        priority = 'medium',
        start_date,
        end_date,
        budget,
        address,
        city,
        state,
        zip_code,
        client_id,
        project_manager_id
      } = req.body;

      // Validation
      if (!company_id || !name) {
        return res.status(400).json({
          success: false,
          error: 'Company ID and name are required'
        });
      }

      console.log('Creating project with:', {
        company_id, name, description, project_number, status, priority,
        start_date, end_date, budget, address, city, state, zip_code,
        client_id, project_manager_id
      });

      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          company_id,
          name,
          description,
          project_number,
          status,
          priority,
          start_date: start_date || null,
          end_date: end_date || null,
          budget: budget || null,
          address: address || null,
          city: city || null,
          state: state || null,
          zip_code: zip_code || null,
          client_id: client_id || null,
          project_manager_id: project_manager_id || null
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity (if function exists)
      try {
        const userId = (req as any).user?.id || 'user-1';
        await supabase
          .from('activities')
          .insert({
            user_id: userId,
            project_id: project.id,
            entity_type: 'project',
            entity_id: project.id,
            action: 'created',
            description: `Created project: ${name}`
          });
      } catch (activityError) {
        console.warn('Failed to log activity:', activityError);
      }

      res.status(201).json({
        success: true,
        data: project,
        message: 'Project created successfully'
      });
    } catch (error: any) {
      console.error('Create project error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/projects/:id - Update project
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Check if project exists
      const { data: existing } = await supabase
        .from('projects')
        .select('id, name')
        .eq('id', id)
        .single();

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      // Remove id from updates
      const { id: _, ...updateData } = updates;
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }

      const { data: project, error } = await supabase
        .from('projects')
        .update(updateData)
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
            project_id: id,
            entity_type: 'project',
            entity_id: id,
            action: 'updated',
            description: `Updated project: ${existing.name}`
          });
      } catch (activityError) {
        console.warn('Failed to log activity:', activityError);
      }

      res.json({
        success: true,
        data: project,
        message: 'Project updated successfully'
      });
    } catch (error: any) {
      console.error('Update project error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // DELETE /api/projects/:id - Delete project
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('id', id)
        .single();

      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete project error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}
