// CortexBuild Platform - RFIs API Routes
// Version: 2.0.0 - Supabase Migration
// Last Updated: 2025-10-31

import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { RFI, ApiResponse, PaginatedResponse } from '../types';

export function createRFIsRouter(supabase: SupabaseClient): Router {
  const router = Router();

  // GET /api/rfis - List all RFIs with filters
  router.get('/', async (req: Request, res: Response) => {
    try {
      const {
        project_id,
        status,
        priority,
        assigned_to,
        search,
        page = '1',
        limit = '20'
      } = req.query as any;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      let query = supabase
        .from('rfis')
        .select(`
          *,
          projects!rfis_project_id_fkey(id, name),
          users!rfis_submitted_by_fkey(id, name),
          users!rfis_assigned_to_fkey(id, name)
        `, { count: 'exact' });

      // Apply filters
      if (project_id) {
        query = query.eq('project_id', project_id);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (priority) {
        query = query.eq('priority', priority);
      }

      if (assigned_to) {
        query = query.eq('assigned_to', assigned_to);
      }

      if (search) {
        query = query.or(`subject.ilike.%${search}%,question.ilike.%${search}%,rfi_number.ilike.%${search}%`);
      }

      // Add pagination and ordering
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limitNum - 1);

      const { data: rfis, error, count } = await query;

      if (error) throw error;

      // Transform data - Supabase returns arrays for joined tables
      const transformedRFIs = (rfis || []).map((r: any) => {
        // Handle the case where joined data might be an array or object
        const projects = Array.isArray(r.projects) ? r.projects[0] : r.projects;
        const submittedBy = Array.isArray(r.users) ? r.users.find((u: any) => u.id === r.submitted_by) : r.users;
        const assignedTo = Array.isArray(r.users) ? r.users.find((u: any) => u.id === r.assigned_to) : null;

        return {
          ...r,
          project_name: projects?.name || null,
          submitted_by_name: submittedBy?.name || null,
          assigned_to_name: assignedTo?.name || null
        };
      });

      res.json({
        success: true,
        data: transformedRFIs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limitNum)
        }
      });
    } catch (error: any) {
      console.error('Get RFIs error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // GET /api/rfis/:id - Get single RFI
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: rfi, error } = await supabase
        .from('rfis')
        .select(`
          *,
          projects!rfis_project_id_fkey(id, name),
          users!rfis_submitted_by_fkey(id, name, email),
          users!rfis_assigned_to_fkey(id, name, email)
        `)
        .eq('id', id)
        .single();

      if (error || !rfi) {
        return res.status(404).json({
          success: false,
          error: 'RFI not found'
        });
      }

      // Transform data
      const projects = Array.isArray(rfi.projects) ? rfi.projects[0] : rfi.projects;
      const users = Array.isArray(rfi.users) ? rfi.users : [rfi.users].filter(Boolean);
      const submittedBy = users.find((u: any) => u.id === rfi.submitted_by);
      const assignedTo = users.find((u: any) => u.id === rfi.assigned_to);

      const transformedRFI = {
        ...rfi,
        project_name: projects?.name || null,
        submitted_by_name: submittedBy?.name || null,
        submitted_by_email: submittedBy?.email || null,
        assigned_to_name: assignedTo?.name || null,
        assigned_to_email: assignedTo?.email || null
      };

      res.json({
        success: true,
        data: transformedRFI
      });
    } catch (error: any) {
      console.error('Get RFI error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/rfis - Create new RFI
  router.post('/', async (req: Request, res: Response) => {
    try {
      const {
        project_id,
        rfi_number,
        subject,
        question,
        priority = 'medium',
        submitted_by,
        assigned_to,
        due_date
      } = req.body;

      if (!project_id || !rfi_number || !subject || !question || !submitted_by) {
        return res.status(400).json({
          success: false,
          error: 'Project ID, RFI number, subject, question, and submitted_by are required'
        });
      }

      const { data: rfi, error } = await supabase
        .from('rfis')
        .insert({
          project_id,
          rfi_number,
          subject,
          question,
          priority,
          submitted_by,
          assigned_to: assigned_to || null,
          due_date: due_date || null
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      try {
        await supabase
          .from('activities')
          .insert({
            user_id: submitted_by,
            project_id,
            entity_type: 'rfi',
            entity_id: rfi.id,
            action: 'created',
            description: `Created RFI: ${rfi_number} - ${subject}`
          });
      } catch (activityError) {
        console.warn('Failed to log activity:', activityError);
      }

      res.status(201).json({
        success: true,
        data: rfi,
        message: 'RFI created successfully'
      });
    } catch (error: any) {
      console.error('Create RFI error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/rfis/:id - Update RFI
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const { data: existing } = await supabase
        .from('rfis')
        .select('id, project_id, rfi_number')
        .eq('id', id)
        .single();

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'RFI not found'
        });
      }

      const { id: _, ...updateData } = updates;
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }

      const { data: rfi, error } = await supabase
        .from('rfis')
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
            project_id: existing.project_id,
            entity_type: 'rfi',
            entity_id: id,
            action: 'updated',
            description: `Updated RFI: ${existing.rfi_number}`
          });
      } catch (activityError) {
        console.warn('Failed to log activity:', activityError);
      }

      res.json({
        success: true,
        data: rfi,
        message: 'RFI updated successfully'
      });
    } catch (error: any) {
      console.error('Update RFI error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/rfis/:id/answer - Answer RFI
  router.put('/:id/answer', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { answer } = req.body;

      if (!answer) {
        return res.status(400).json({
          success: false,
          error: 'Answer is required'
        });
      }

      const { data: existing } = await supabase
        .from('rfis')
        .select('id, project_id, rfi_number')
        .eq('id', id)
        .single();

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'RFI not found'
        });
      }

      const { data: rfi, error } = await supabase
        .from('rfis')
        .update({
          answer,
          status: 'answered',
          answered_at: new Date().toISOString()
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
            entity_type: 'rfi',
            entity_id: id,
            action: 'answered',
            description: `Answered RFI: ${existing.rfi_number}`
          });
      } catch (activityError) {
        console.warn('Failed to log activity:', activityError);
      }

      res.json({
        success: true,
        data: rfi,
        message: 'RFI answered successfully'
      });
    } catch (error: any) {
      console.error('Answer RFI error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // DELETE /api/rfis/:id - Delete RFI
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: rfi } = await supabase
        .from('rfis')
        .select('id')
        .eq('id', id)
        .single();

      if (!rfi) {
        return res.status(404).json({
          success: false,
          error: 'RFI not found'
        });
      }

      const { error } = await supabase
        .from('rfis')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({
        success: true,
        message: 'RFI deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete RFI error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}
