// CortexBuild - Smart Tools API Routes
// Version: 2.0.0 - Supabase Migration
// Handles automation, cron jobs, and workflows
// Last Updated: 2025-10-31

import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import * as auth from '../auth-supabase';

export function createSmartToolsRouter(supabase: SupabaseClient): Router {
  const router = Router();

  // Middleware to get current user
  const getCurrentUser = async (req: any, res: Response, next: any) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await auth.getCurrentUserByToken(token);
      if (!user) {
        return res.status(401).json({ error: 'Invalid session' });
      }

      req.user = user;
      next();
    } catch (error: any) {
      res.status(401).json({ error: error.message || 'Unauthorized' });
    }
  };

  // GET /api/smart-tools - List all smart tools for company
  router.get('/', getCurrentUser, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      const { data: tools, error } = await supabase
        .from('smart_tools')
        .select('*')
        .eq('company_id', user.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({ success: true, data: tools || [] });
    } catch (error: any) {
      console.error('List smart tools error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/smart-tools - Create new smart tool
  router.post('/', getCurrentUser, async (req: Request, res: Response) => {
    try {
      const { name, description, tool_type, schedule, config } = req.body;
      const user = (req as any).user;

      if (!name || !tool_type) {
        return res.status(400).json({ error: 'Name and tool_type are required' });
      }

      // Calculate next run time for scheduled tools
      let next_run_at = null;
      if (tool_type === 'scheduled' && schedule) {
        const nextRun = new Date();
        nextRun.setHours(nextRun.getHours() + 1);
        next_run_at = nextRun.toISOString();
      }

      const { data: tool, error } = await supabase
        .from('smart_tools')
        .insert({
          company_id: user.company_id,
          name,
          description: description || '',
          tool_type,
          schedule: schedule || null,
          config: typeof config === 'string' ? config : JSON.stringify(config || {}),
          next_run_at
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      try {
        await supabase
          .from('activities')
          .insert({
            user_id: user.id,
            action: 'smart_tool_create',
            description: `Created smart tool: ${name}`
          });
      } catch (activityError) {
        console.warn('Failed to log activity:', activityError);
      }

      res.json({ success: true, data: tool });
    } catch (error: any) {
      console.error('Create smart tool error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // PUT /api/smart-tools/:id/toggle - Toggle tool active status
  router.put('/:id/toggle', getCurrentUser, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { is_active } = req.body;
      const user = (req as any).user;

      const { data: tool } = await supabase
        .from('smart_tools')
        .select('id')
        .eq('id', id)
        .eq('company_id', user.company_id)
        .single();

      if (!tool) {
        return res.status(404).json({ error: 'Smart tool not found' });
      }

      const { error } = await supabase
        .from('smart_tools')
        .update({ is_active: is_active || false })
        .eq('id', id);

      if (error) throw error;

      res.json({ success: true });
    } catch (error: any) {
      console.error('Toggle smart tool error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/smart-tools/:id/run - Execute tool manually
  router.post('/:id/run', getCurrentUser, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      const { data: tool } = await supabase
        .from('smart_tools')
        .select('id')
        .eq('id', id)
        .eq('company_id', user.company_id)
        .single();

      if (!tool) {
        return res.status(404).json({ error: 'Smart tool not found' });
      }

      // Create execution record
      const started_at = new Date().toISOString();
      const { data: execution, error: execError } = await supabase
        .from('smart_tool_executions')
        .insert({
          tool_id: id,
          status: 'running',
          started_at
        })
        .select()
        .single();

      if (execError) throw execError;

      // Simulate execution (in production, this would run actual tool logic)
      setTimeout(async () => {
        const completed_at = new Date().toISOString();
        await supabase
          .from('smart_tool_executions')
          .update({
            status: 'success',
            completed_at,
            output_data: { result: 'Tool executed successfully' }
          })
          .eq('id', execution.id);

        // Update tool last_run_at
        await supabase
          .from('smart_tools')
          .update({ last_run_at: completed_at })
          .eq('id', id);
      }, 1000);

      res.json({ success: true, message: 'Tool execution started' });
    } catch (error: any) {
      console.error('Run smart tool error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/smart-tools/:id - Delete smart tool
  router.delete('/:id', getCurrentUser, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      const { data: tool } = await supabase
        .from('smart_tools')
        .select('id')
        .eq('id', id)
        .eq('company_id', user.company_id)
        .single();

      if (!tool) {
        return res.status(404).json({ error: 'Smart tool not found' });
      }

      const { error } = await supabase
        .from('smart_tools')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({ success: true });
    } catch (error: any) {
      console.error('Delete smart tool error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/smart-tools/executions - Get recent executions
  router.get('/executions', getCurrentUser, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      const { data: executions, error } = await supabase
        .from('smart_tool_executions')
        .select(`
          *,
          smart_tools!smart_tool_executions_tool_id_fkey(id, company_id)
        `)
        .eq('smart_tools.company_id', user.company_id)
        .order('started_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Filter to only include executions from user's company
      const filtered = (executions || []).filter((e: any) => {
        const tools = Array.isArray(e.smart_tools) ? e.smart_tools : [e.smart_tools];
        return tools.some((t: any) => t?.company_id === user.company_id);
      });

      res.json({ success: true, data: filtered });
    } catch (error: any) {
      console.error('Get executions error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
