// CortexBuild Platform - Clients API Routes
// Version: 2.0.0 - Supabase Migration
// Last Updated: 2025-10-31

import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { Client, ApiResponse, PaginatedResponse } from '../types';
import {
  validateBody,
  validateQuery,
  validateParams,
  createClientSchema,
  updateClientSchema,
  clientFiltersSchema,
  idParamSchema
} from '../utils/validation';

export function createClientsRouter(supabase: SupabaseClient): Router {
  const router = Router();

  // GET /api/clients - List all clients
  router.get('/', validateQuery(clientFiltersSchema), async (req: Request, res: Response) => {
    try {
      const {
        search,
        is_active,
        page = 1,
        limit = 20
      } = req.query as any;

      const pageNum = page;
      const limitNum = limit;
      const offset = (pageNum - 1) * limitNum;

      let query = supabase
        .from('clients')
        .select('*', { count: 'exact' });

      if (search) {
        query = query.or(`name.ilike.%${search}%,contact_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      if (is_active !== undefined) {
        query = query.eq('is_active', is_active === 'true');
      }

      // Add pagination
      query = query
        .order('name')
        .range(offset, offset + limitNum - 1);

      const { data: clients, error, count } = await query;

      if (error) throw error;

      res.json({
        success: true,
        data: clients || [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limitNum)
        }
      });
    } catch (error: any) {
      console.error('Get clients error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // GET /api/clients/:id - Get single client
  router.get('/:id', validateParams(idParamSchema), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (clientError || !client) {
        return res.status(404).json({
          success: false,
          error: 'Client not found'
        });
      }

      // Get client projects
      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', id)
        .order('created_at', { ascending: false });

      // Get client invoices
      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', id)
        .order('issue_date', { ascending: false })
        .limit(10);

      res.json({
        success: true,
        data: {
          ...client,
          projects: projects || [],
          invoices: invoices || []
        }
      });
    } catch (error: any) {
      console.error('Get client error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/clients - Create new client
  router.post('/', validateBody(createClientSchema), (req: Request, res: Response) => {
    try {
      const {
        company_id,
        name,
        contact_name,
        email,
        phone,
        address,
        city,
        state,
        zip_code,
        country = 'US',
        website,
        tax_id,
        payment_terms = 30,
        credit_limit,
        notes
      } = req.body;

      const result = db.prepare(`
        INSERT INTO clients (
          company_id, name, contact_name, email, phone, address, city, state,
          zip_code, country, website, tax_id, payment_terms, credit_limit, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        company_id, name, contact_name, email, phone, address, city, state,
        zip_code, country, website, tax_id, payment_terms, credit_limit, notes
      );

      if (error) throw error;

      res.status(201).json({
        success: true,
        data: client,
        message: 'Client created successfully'
      });
    } catch (error: any) {
      console.error('Create client error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/clients/:id - Update client
  router.put('/:id', validateParams(idParamSchema), validateBody(updateClientSchema), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Check if client exists
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('id', id)
        .single();

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Client not found'
        });
      }

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field]);

      if (error) throw error;

      res.json({
        success: true,
        data: client,
        message: 'Client updated successfully'
      });
    } catch (error: any) {
      console.error('Update client error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // DELETE /api/clients/:id - Delete client
  router.delete('/:id', validateParams(idParamSchema), (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('id', id)
        .single();

      if (!client) {
        return res.status(404).json({
          success: false,
          error: 'Client not found'
        });
      }

      // Check if client has projects
      const { count } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', id);

      if ((count || 0) > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete client with existing projects'
        });
      }

      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({
        success: true,
        message: 'Client deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete client error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}

