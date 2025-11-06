// CortexBuild Platform - Subcontractors API Routes
// Version: 2.0.0 - Supabase Migration
// Last Updated: 2025-10-31

import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { Subcontractor, ApiResponse, PaginatedResponse } from '../types';

export function createSubcontractorsRouter(supabase: SupabaseClient): Router {
  const router = Router();

  // GET /api/subcontractors - List all subcontractors
  router.get('/', async (req: Request, res: Response) => {
    try {
      const {
        company_id,
        trade,
        status,
        search,
        page = '1',
        limit = '20'
      } = req.query as any;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      let query = supabase
        .from('subcontractors')
        .select('*', { count: 'exact' });

      // Apply filters
      if (company_id) {
        query = query.eq('company_id', company_id);
      }

      if (trade) {
        query = query.eq('trade', trade);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,company_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      // Add pagination and ordering
      query = query
        .order('name')
        .range(offset, offset + limitNum - 1);

      const { data: subcontractors, error, count } = await query;

      if (error) throw error;

      res.json({
        success: true,
        data: subcontractors || [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limitNum)
        }
      });
    } catch (error: any) {
      console.error('Get subcontractors error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // GET /api/subcontractors/:id - Get single subcontractor with projects
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: subcontractor, error: subcontractorError } = await supabase
        .from('subcontractors')
        .select('*')
        .eq('id', id)
        .single();

      if (subcontractorError || !subcontractor) {
        return res.status(404).json({
          success: false,
          error: 'Subcontractor not found'
        });
      }

      // Get assigned projects
      const { data: projects } = await supabase
        .from('project_subcontractors')
        .select(`
          *,
          projects!project_subcontractors_project_id_fkey(*)
        `)
        .eq('subcontractor_id', id);

      // Transform projects
      const transformedProjects = (projects || []).map((p: any) => ({
        ...p.projects,
        role: p.role,
        start_date: p.start_date,
        end_date: p.end_date
      }));

      res.json({
        success: true,
        data: {
          ...subcontractor,
          projects: transformedProjects
        }
      });
    } catch (error: any) {
      console.error('Get subcontractor error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/subcontractors - Create new subcontractor
  router.post('/', async (req: Request, res: Response) => {
    try {
      const {
        company_id,
        name,
        company_name,
        trade,
        email,
        phone,
        address,
        city,
        state,
        zip,
        license_number,
        insurance_expiry,
        hourly_rate,
        status = 'active'
      } = req.body;

      if (!company_id || !name || !trade) {
        return res.status(400).json({
          success: false,
          error: 'Company ID, name, and trade are required'
        });
      }

      const { data: subcontractor, error } = await supabase
        .from('subcontractors')
        .insert({
          company_id,
          name,
          company_name: company_name || null,
          trade,
          email: email || null,
          phone: phone || null,
          address: address || null,
          city: city || null,
          state: state || null,
          zip: zip || null,
          license_number: license_number || null,
          insurance_expiry: insurance_expiry || null,
          hourly_rate: hourly_rate || null,
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
            entity_type: 'subcontractor',
            entity_id: subcontractor.id,
            action: 'created',
            description: `Added subcontractor: ${name}`
          });
      } catch (activityError) {
        console.warn('Failed to log activity:', activityError);
      }

      res.status(201).json({
        success: true,
        data: subcontractor,
        message: 'Subcontractor created successfully'
      });
    } catch (error: any) {
      console.error('Create subcontractor error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/subcontractors/:id - Update subcontractor
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const { data: existing } = await supabase
        .from('subcontractors')
        .select('id, name')
        .eq('id', id)
        .single();

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Subcontractor not found'
        });
      }

      const { id: _, ...updateData } = updates;
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }

      const { data: subcontractor, error } = await supabase
        .from('subcontractors')
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
            entity_type: 'subcontractor',
            entity_id: id,
            action: 'updated',
            description: `Updated subcontractor: ${existing.name}`
          });
      } catch (activityError) {
        console.warn('Failed to log activity:', activityError);
      }

      res.json({
        success: true,
        data: subcontractor,
        message: 'Subcontractor updated successfully'
      });
    } catch (error: any) {
      console.error('Update subcontractor error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // DELETE /api/subcontractors/:id - Delete subcontractor
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: subcontractor } = await supabase
        .from('subcontractors')
        .select('id')
        .eq('id', id)
        .single();

      if (!subcontractor) {
        return res.status(404).json({
          success: false,
          error: 'Subcontractor not found'
        });
      }

      // Check if subcontractor is assigned to any projects
      const { count } = await supabase
        .from('project_subcontractors')
        .select('*', { count: 'exact', head: true })
        .eq('subcontractor_id', id);

      if ((count || 0) > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete subcontractor assigned to projects. Remove from projects first.'
        });
      }

      const { error } = await supabase
        .from('subcontractors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({
        success: true,
        message: 'Subcontractor deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete subcontractor error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}
