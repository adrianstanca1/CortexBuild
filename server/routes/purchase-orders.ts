// CortexBuild Platform - Purchase Orders API Routes
// Version: 2.0.0 - Supabase Migration
// Last Updated: 2025-10-31

import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { PurchaseOrder, PurchaseOrderItem, ApiResponse, PaginatedResponse } from '../types';

export function createPurchaseOrdersRouter(supabase: SupabaseClient): Router {
  const router = Router();

  // GET /api/purchase-orders - List all purchase orders
  router.get('/', async (req: Request, res: Response) => {
    try {
      const {
        project_id,
        vendor_id,
        status,
        search,
        page = '1',
        limit = '20'
      } = req.query as any;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      let query = supabase
        .from('purchase_orders')
        .select(`
          *,
          projects!purchase_orders_project_id_fkey(id, name),
          subcontractors!purchase_orders_vendor_id_fkey(id, name)
        `, { count: 'exact' });

      // Apply filters
      if (project_id) {
        query = query.eq('project_id', project_id);
      }

      if (vendor_id) {
        query = query.eq('vendor_id', vendor_id);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (search) {
        query = query.or(`po_number.ilike.%${search}%,subcontractors.name.ilike.%${search}%`);
      }

      // Add pagination and ordering
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limitNum - 1);

      const { data: orders, error, count } = await query;

      if (error) throw error;

      // Transform data
      const transformedOrders = (orders || []).map((o: any) => {
        const projects = Array.isArray(o.projects) ? o.projects[0] : o.projects;
        const subcontractors = Array.isArray(o.subcontractors) ? o.subcontractors[0] : o.subcontractors;
        return {
          ...o,
          project_name: projects?.name || null,
          vendor_name: subcontractors?.name || null
        };
      });

      res.json({
        success: true,
        data: transformedOrders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limitNum)
        }
      });
    } catch (error: any) {
      console.error('Get purchase orders error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // GET /api/purchase-orders/:id - Get single PO with items
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: po, error: poError } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          projects!purchase_orders_project_id_fkey(id, name),
          subcontractors!purchase_orders_vendor_id_fkey(id, name, email, phone)
        `)
        .eq('id', id)
        .single();

      if (poError || !po) {
        return res.status(404).json({
          success: false,
          error: 'Purchase order not found'
        });
      }

      // Get line items
      const { data: items } = await supabase
        .from('purchase_order_items')
        .select('*')
        .eq('po_id', id)
        .order('id');

      // Transform data
      const projects = Array.isArray(po.projects) ? po.projects[0] : po.projects;
      const subcontractors = Array.isArray(po.subcontractors) ? po.subcontractors[0] : po.subcontractors;

      const transformedPO = {
        ...po,
        project_name: projects?.name || null,
        vendor_name: subcontractors?.name || null,
        vendor_email: subcontractors?.email || null,
        vendor_phone: subcontractors?.phone || null,
        items: items || []
      };

      res.json({
        success: true,
        data: transformedPO
      });
    } catch (error: any) {
      console.error('Get purchase order error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/purchase-orders - Create new PO
  router.post('/', async (req: Request, res: Response) => {
    try {
      const {
        project_id,
        vendor_id,
        po_number,
        order_date,
        delivery_date,
        subtotal,
        tax_amount = 0,
        total,
        notes,
        items = []
      } = req.body;

      if (!project_id || !vendor_id || !po_number || !order_date || !total) {
        return res.status(400).json({
          success: false,
          error: 'Project ID, vendor ID, PO number, order date, and total are required'
        });
      }

      // Create purchase order
      const { data: po, error: poError } = await supabase
        .from('purchase_orders')
        .insert({
          project_id,
          vendor_id,
          po_number,
          order_date,
          delivery_date: delivery_date || null,
          subtotal,
          tax_amount,
          total,
          notes: notes || null
        })
        .select()
        .single();

      if (poError) throw poError;

      // Create line items if provided
      if (items.length > 0 && po) {
        const { error: itemsError } = await supabase
          .from('purchase_order_items')
          .insert(
            items.map((item: PurchaseOrderItem) => ({
              po_id: po.id,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              amount: item.amount
            }))
          );

        if (itemsError) {
          console.warn('Failed to create PO items:', itemsError);
        }
      }

      // Log activity
      try {
        const userId = (req as any).user?.id || 'user-1';
        await supabase
          .from('activities')
          .insert({
            user_id: userId,
            project_id,
            entity_type: 'purchase_order',
            entity_id: po.id,
            action: 'created',
            description: `Created PO: ${po_number}`
          });
      } catch (activityError) {
        console.warn('Failed to log activity:', activityError);
      }

      res.status(201).json({
        success: true,
        data: po,
        message: 'Purchase order created successfully'
      });
    } catch (error: any) {
      console.error('Create purchase order error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/purchase-orders/:id - Update PO
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const { data: existing } = await supabase
        .from('purchase_orders')
        .select('id')
        .eq('id', id)
        .single();

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Purchase order not found'
        });
      }

      const { id: _, items, ...updateData } = updates;

      // Update PO if there are fields to update
      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('purchase_orders')
          .update(updateData)
          .eq('id', id);

        if (updateError) throw updateError;
      }

      // Update line items if provided
      if (items) {
        // Delete existing items
        await supabase
          .from('purchase_order_items')
          .delete()
          .eq('po_id', id);

        // Insert new items
        if (items.length > 0) {
          const { error: itemsError } = await supabase
            .from('purchase_order_items')
            .insert(
              items.map((item: PurchaseOrderItem) => ({
                po_id: id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                amount: item.amount
              }))
            );

          if (itemsError) throw itemsError;
        }
      }

      // Get updated PO
      const { data: po } = await supabase
        .from('purchase_orders')
        .select('*')
        .eq('id', id)
        .single();

      res.json({
        success: true,
        data: po,
        message: 'Purchase order updated successfully'
      });
    } catch (error: any) {
      console.error('Update purchase order error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/purchase-orders/:id/approve - Approve PO
  router.put('/:id/approve', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: existing } = await supabase
        .from('purchase_orders')
        .select('id')
        .eq('id', id)
        .single();

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Purchase order not found'
        });
      }

      const { data: po, error } = await supabase
        .from('purchase_orders')
        .update({
          status: 'approved'
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        data: po,
        message: 'Purchase order approved'
      });
    } catch (error: any) {
      console.error('Approve purchase order error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // DELETE /api/purchase-orders/:id - Delete PO
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: po } = await supabase
        .from('purchase_orders')
        .select('id')
        .eq('id', id)
        .single();

      if (!po) {
        return res.status(404).json({
          success: false,
          error: 'Purchase order not found'
        });
      }

      // Delete line items first
      await supabase
        .from('purchase_order_items')
        .delete()
        .eq('po_id', id);

      // Delete PO
      const { error } = await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({
        success: true,
        message: 'Purchase order deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete purchase order error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}
