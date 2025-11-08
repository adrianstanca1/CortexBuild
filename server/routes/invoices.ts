// CortexBuild Platform - Invoices API Routes
// Version: 2.0.0 - Supabase Migration
// Last Updated: 2025-10-31

import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { Invoice, InvoiceItem, ApiResponse, PaginatedResponse } from '../types';

export function createInvoicesRouter(supabase: SupabaseClient): Router {
  const router = Router();

  // GET /api/invoices - List all invoices with filters
  router.get('/', async (req: Request, res: Response) => {
    try {
      const {
        client_id,
        project_id,
        status,
        search,
        page = '1',
        limit = '20'
      } = req.query as any;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      let query = supabase
        .from('invoices')
        .select(`
          *,
          clients!invoices_client_id_fkey(id, name),
          projects!invoices_project_id_fkey(id, name)
        `, { count: 'exact' });

      // Apply filters
      if (client_id) {
        query = query.eq('client_id', client_id);
      }

      if (project_id) {
        query = query.eq('project_id', project_id);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (search) {
        query = query.or(`invoice_number.ilike.%${search}%,clients.name.ilike.%${search}%`);
      }

      // Add pagination and ordering
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limitNum - 1);

      const { data: invoices, error, count } = await query;

      if (error) throw error;

      // Transform data
      const transformedInvoices = (invoices || []).map((i: any) => {
        const clients = Array.isArray(i.clients) ? i.clients[0] : i.clients;
        const projects = Array.isArray(i.projects) ? i.projects[0] : i.projects;
        return {
          ...i,
          client_name: clients?.name || null,
          project_name: projects?.name || null
        };
      });

      res.json({
        success: true,
        data: transformedInvoices,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limitNum)
        }
      });
    } catch (error: any) {
      console.error('Get invoices error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // GET /api/invoices/:id - Get single invoice with line items
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          clients!invoices_client_id_fkey(id, name, email, phone),
          projects!invoices_project_id_fkey(id, name)
        `)
        .eq('id', id)
        .single();

      if (invoiceError || !invoice) {
        return res.status(404).json({
          success: false,
          error: 'Invoice not found'
        });
      }

      // Get line items
      const { data: items } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', id)
        .order('id');

      // Transform data
      const clients = Array.isArray(invoice.clients) ? invoice.clients[0] : invoice.clients;
      const projects = Array.isArray(invoice.projects) ? invoice.projects[0] : invoice.projects;

      const transformedInvoice = {
        ...invoice,
        client_name: clients?.name || null,
        client_email: clients?.email || null,
        client_phone: clients?.phone || null,
        project_name: projects?.name || null,
        items: items || []
      };

      res.json({
        success: true,
        data: transformedInvoice
      });
    } catch (error: any) {
      console.error('Get invoice error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/invoices - Create new invoice with line items
  router.post('/', async (req: Request, res: Response) => {
    try {
      const {
        client_id,
        project_id,
        invoice_number,
        issue_date,
        due_date,
        subtotal,
        tax_rate = 0,
        tax_amount = 0,
        total,
        notes,
        items = []
      } = req.body;

      if (!client_id || !invoice_number || !issue_date || !due_date || !total) {
        return res.status(400).json({
          success: false,
          error: 'Client ID, invoice number, issue date, due date, and total are required'
        });
      }

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          client_id,
          project_id: project_id || null,
          invoice_number,
          issue_date,
          due_date,
          subtotal,
          tax_rate,
          tax_amount,
          total,
          notes: notes || null
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create line items if provided
      if (items.length > 0 && invoice) {
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(
            items.map((item: InvoiceItem) => ({
              invoice_id: invoice.id,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              amount: item.amount
            }))
          );

        if (itemsError) {
          console.warn('Failed to create invoice items:', itemsError);
        }
      }

      // Log activity
      try {
        const userId = (req as any).user?.id || 'user-1';
        await supabase
          .from('activities')
          .insert({
            user_id: userId,
            project_id: project_id || null,
            entity_type: 'invoice',
            entity_id: invoice.id,
            action: 'created',
            description: `Created invoice: ${invoice_number}`
          });
      } catch (activityError) {
        console.warn('Failed to log activity:', activityError);
      }

      res.status(201).json({
        success: true,
        data: invoice,
        message: 'Invoice created successfully'
      });
    } catch (error: any) {
      console.error('Create invoice error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/invoices/:id - Update invoice
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const { data: existing } = await supabase
        .from('invoices')
        .select('id')
        .eq('id', id)
        .single();

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Invoice not found'
        });
      }

      const { id: _, items, ...updateData } = updates;

      // Update invoice if there are fields to update
      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('invoices')
          .update(updateData)
          .eq('id', id);

        if (updateError) throw updateError;
      }

      // Update line items if provided
      if (items) {
        // Delete existing items
        await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', id);

        // Insert new items
        if (items.length > 0) {
          const { error: itemsError } = await supabase
            .from('invoice_items')
            .insert(
              items.map((item: InvoiceItem) => ({
                invoice_id: id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                amount: item.amount
              }))
            );

          if (itemsError) throw itemsError;
        }
      }

      // Get updated invoice
      const { data: invoice } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();

      res.json({
        success: true,
        data: invoice,
        message: 'Invoice updated successfully'
      });
    } catch (error: any) {
      console.error('Update invoice error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/invoices/:id/send - Send invoice to client
  router.put('/:id/send', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: existing } = await supabase
        .from('invoices')
        .select('id')
        .eq('id', id)
        .single();

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Invoice not found'
        });
      }

      const { data: invoice, error } = await supabase
        .from('invoices')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        data: invoice,
        message: 'Invoice sent successfully'
      });
    } catch (error: any) {
      console.error('Send invoice error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/invoices/:id/pay - Mark invoice as paid
  router.put('/:id/pay', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { payment_date } = req.body;

      const { data: existing } = await supabase
        .from('invoices')
        .select('id')
        .eq('id', id)
        .single();

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Invoice not found'
        });
      }

      const { data: invoice, error } = await supabase
        .from('invoices')
        .update({
          status: 'paid',
          paid_at: payment_date || new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        data: invoice,
        message: 'Invoice marked as paid'
      });
    } catch (error: any) {
      console.error('Pay invoice error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // DELETE /api/invoices/:id - Delete invoice
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: invoice } = await supabase
        .from('invoices')
        .select('id')
        .eq('id', id)
        .single();

      if (!invoice) {
        return res.status(404).json({
          success: false,
          error: 'Invoice not found'
        });
      }

      // Delete line items first
      await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', id);

      // Delete invoice
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({
        success: true,
        message: 'Invoice deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete invoice error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}
