/**
 * Project Budgets API Routes
 * Handles budget management with CSI MasterFormat cost codes
 */

import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';

export function createBudgetsRouter(supabase: SupabaseClient): Router {
  const router = Router();

  // GET /api/projects/:id/budgets - Get budgets for project
  router.get('/projects/:id/budgets', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('project_budgets')
        .select(`
          *,
          csi_masterformat(*)
        `)
        .eq('project_id', id)
        .order('cost_code');

      if (error) throw error;

      res.json({
        success: true,
        data
      });
    } catch (error: any) {
      console.error('Budgets fetch error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch budgets'
      });
    }
  });

  // POST /api/projects/:id/budgets - Create budget
  router.post('/projects/:id/budgets', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const budgetData = {
        project_id: parseInt(id),
        ...req.body
      };

      const { data, error } = await supabase
        .from('project_budgets')
        .insert(budgetData)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        data
      });
    } catch (error: any) {
      console.error('Create budget error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create budget'
      });
    }
  });

  // PUT /api/projects/:id/budgets/:budgetId - Update budget
  router.put('/projects/:id/budgets/:budgetId', async (req: Request, res: Response) => {
    try {
      const { budgetId } = req.params;

      const { data, error } = await supabase
        .from('project_budgets')
        .update(req.body)
        .eq('id', budgetId)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        data
      });
    } catch (error: any) {
      console.error('Update budget error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update budget'
      });
    }
  });

  // GET /api/cost-codes - Get all CSI MasterFormat cost codes
  router.get('/cost-codes', async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('csi_masterformat')
        .select('*')
        .order('code');

      if (error) throw error;

      res.json({
        success: true,
        data
      });
    } catch (error: any) {
      console.error('Cost codes fetch error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch cost codes'
      });
    }
  });

  // GET /api/cost-codes/:code - Get specific cost code
  router.get('/cost-codes/:code', async (req: Request, res: Response) => {
    try {
      const { code } = req.params;

      const { data, error } = await supabase
        .from('csi_masterformat')
        .select('*')
        .eq('code', code)
        .single();

      if (error) throw error;

      res.json({
        success: true,
        data
      });
    } catch (error: any) {
      console.error('Cost code fetch error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch cost code'
      });
    }
  });

  return router;
}

