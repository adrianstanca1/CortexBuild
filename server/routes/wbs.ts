/**
 * Work Breakdown Structure (WBS) API Routes
 * Handles WBS management for projects
 */

import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';

export function createWBSRouter(supabase: SupabaseClient): Router {
  const router = Router();

  // GET /api/projects/:id/wbs - Get WBS for project
  router.get('/projects/:id/wbs', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('wbs_structure')
        .select('*')
        .eq('project_id', id)
        .order('code');

      if (error) throw error;

      res.json({
        success: true,
        data
      });
    } catch (error: any) {
      console.error('WBS fetch error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch WBS'
      });
    }
  });

  // POST /api/projects/:id/wbs/nodes - Create WBS node
  router.post('/projects/:id/wbs/nodes', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const nodeData = {
        project_id: parseInt(id),
        ...req.body
      };

      const { data, error } = await supabase
        .from('wbs_structure')
        .insert(nodeData)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        data
      });
    } catch (error: any) {
      console.error('Create WBS node error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create WBS node'
      });
    }
  });

  // PUT /api/projects/:id/wbs/nodes/:nodeId - Update WBS node
  router.put('/projects/:id/wbs/nodes/:nodeId', async (req: Request, res: Response) => {
    try {
      const { nodeId } = req.params;

      const { data, error } = await supabase
        .from('wbs_structure')
        .update(req.body)
        .eq('id', nodeId)
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        data
      });
    } catch (error: any) {
      console.error('Update WBS node error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update WBS node'
      });
    }
  });

  // DELETE /api/projects/:id/wbs/nodes/:nodeId - Delete WBS node
  router.delete('/projects/:id/wbs/nodes/:nodeId', async (req: Request, res: Response) => {
    try {
      const { nodeId } = req.params;

      const { error } = await supabase
        .from('wbs_structure')
        .delete()
        .eq('id', nodeId);

      if (error) throw error;

      res.json({ success: true });
    } catch (error: any) {
      console.error('Delete WBS node error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete WBS node'
      });
    }
  });

  // GET /api/projects/:id/wbs/summary - Get WBS summary
  router.get('/projects/:id/wbs/summary', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: nodes } = await supabase
        .from('wbs_structure')
        .select('*')
        .eq('project_id', id);

      // Calculate summary statistics
      const summary = {
        totalNodes: nodes?.length || 0,
        totalBudget: nodes?.reduce((sum, node) => sum + parseFloat(node.cost_budget || 0), 0) || 0,
        totalActual: nodes?.reduce((sum, node) => sum + parseFloat(node.actual_cost || 0), 0) || 0,
        averageProgress: nodes?.reduce((sum, node) => sum + parseFloat(node.percentage_complete || 0), 0) / (nodes?.length || 1) || 0
      };

      res.json({
        success: true,
        data: summary
      });
    } catch (error: any) {
      console.error('WBS summary error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch WBS summary'
      });
    }
  });

  return router;
}

