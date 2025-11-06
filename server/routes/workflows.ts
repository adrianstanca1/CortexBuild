// CortexBuild - Workflows API Routes
// Version: 2.0.0 - Supabase Migration
// Last Updated: 2025-10-31

import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { authenticateToken } from '../auth-supabase';
import { v4 as uuidv4 } from 'uuid';

export const createWorkflowsRouter = (supabase: SupabaseClient) => {
  const router = Router();

  router.use(authenticateToken);

  // GET /api/workflows - List workflows for company
  router.get('/', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const includeInactive = req.query.includeInactive !== 'false';

      let query = supabase
        .from('workflows')
        .select('*');

      // Apply company filter
      if (user.role === 'super_admin' && req.query.companyId) {
        query = query.eq('company_id', req.query.companyId as string);
      } else {
        query = query.eq('company_id', user.company_id || user.companyId);
      }

      // Filter active/inactive
      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      query = query.order('created_at', { ascending: false });

      const { data: workflows, error } = await query;

      if (error) throw error;

      res.json({ 
        success: true, 
        workflows: (workflows || []).map((w: any) => ({
          ...w,
          definition: w.definition ? (typeof w.definition === 'string' ? JSON.parse(w.definition) : w.definition) : {},
          is_active: w.is_active === true || w.is_active === 1
        }))
      });
    } catch (error: any) {
      console.error('[Workflows] list error', error);
      res.status(500).json({ success: false, error: 'Failed to load workflows' });
    }
  });

  // GET /api/workflows/all - List all workflows (super admin only)
  router.get('/all', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (user.role !== 'super_admin') {
        return res.status(403).json({ success: false, error: 'Super admin only' });
      }

      const limit = parseInt((req.query.limit as string) ?? '100', 10);

      const { data: workflows, error } = await supabase
        .from('workflows')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      res.json({ 
        success: true, 
        workflows: (workflows || []).map((w: any) => ({
          ...w,
          definition: w.definition ? (typeof w.definition === 'string' ? JSON.parse(w.definition) : w.definition) : {},
          is_active: w.is_active === true || w.is_active === 1
        }))
      });
    } catch (error: any) {
      console.error('[Workflows] list all error', error);
      res.status(500).json({ success: false, error: 'Failed to load workflows' });
    }
  });

  // GET /api/workflows/templates - List workflow templates
  router.get('/templates', async (_req: Request, res: Response) => {
    try {
      // Return static templates for now
      const templates = [
        {
          id: 'template-1',
          name: 'Project Creation Workflow',
          description: 'Automatically create tasks when a project is created',
          definition: { steps: [] }
        }
      ];

      res.json({ success: true, templates });
    } catch (error: any) {
      console.error('[Workflows] templates error', error);
      res.status(500).json({ success: false, error: 'Failed to load templates' });
    }
  });

  // GET /api/workflows/builder/blocks - Get builder blocks
  router.get('/builder/blocks', async (_req: Request, res: Response) => {
    try {
      // Return static builder blocks
      const blocks = [
        { id: 'trigger', type: 'trigger', name: 'Trigger', icon: '⚡' },
        { id: 'action', type: 'action', name: 'Action', icon: '⚙️' },
        { id: 'condition', type: 'condition', name: 'Condition', icon: '❓' }
      ];

      res.json({ success: true, blocks });
    } catch (error: any) {
      console.error('[Workflows] builder blocks error', error);
      res.status(500).json({ success: false, error: 'Failed to load builder blocks' });
    }
  });

  // POST /api/workflows - Create new workflow
  router.post('/', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { name, description, definition } = req.body;

      if (!name) {
        return res.status(400).json({ success: false, error: 'Name is required' });
      }

      const id = uuidv4();
      const { data: workflow, error } = await supabase
        .from('workflows')
        .insert({
          id,
          company_id: user.company_id || user.companyId,
          name,
          description: description || '',
          definition: typeof definition === 'string' ? definition : JSON.stringify(definition || {}),
          is_active: false,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      res.json({ 
        success: true, 
        workflow: {
          ...workflow,
          definition: workflow.definition ? (typeof workflow.definition === 'string' ? JSON.parse(workflow.definition) : workflow.definition) : {},
          is_active: workflow.is_active === true || workflow.is_active === 1
        }
      });
    } catch (error: any) {
      console.error('[Workflows] create error', error);
      res.status(400).json({ success: false, error: error.message || 'Failed to create workflow' });
    }
  });

  // PUT /api/workflows/:id - Update workflow
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      // Verify workflow belongs to company
      const { data: existing } = await supabase
        .from('workflows')
        .select('id')
        .eq('id', id)
        .eq('company_id', user.company_id || user.companyId)
        .single();

      if (!existing) {
        return res.status(404).json({ success: false, error: 'Workflow not found' });
      }

      const updates: any = {};
      if (req.body.name !== undefined) updates.name = req.body.name;
      if (req.body.description !== undefined) updates.description = req.body.description;
      if (req.body.definition !== undefined) {
        updates.definition = typeof req.body.definition === 'string' 
          ? req.body.definition 
          : JSON.stringify(req.body.definition);
      }

      const { data: workflow, error } = await supabase
        .from('workflows')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({ 
        success: true, 
        workflow: {
          ...workflow,
          definition: workflow.definition ? (typeof workflow.definition === 'string' ? JSON.parse(workflow.definition) : workflow.definition) : {},
          is_active: workflow.is_active === true || workflow.is_active === 1
        }
      });
    } catch (error: any) {
      console.error('[Workflows] update error', error);
      res.status(400).json({ success: false, error: error.message || 'Failed to update workflow' });
    }
  });

  // POST /api/workflows/:id/activate - Activate workflow
  router.post('/:id/activate', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const { data: existing } = await supabase
        .from('workflows')
        .select('id')
        .eq('id', id)
        .eq('company_id', user.company_id || user.companyId)
        .single();

      if (!existing) {
        return res.status(404).json({ success: false, error: 'Workflow not found' });
      }

      const { data: workflow, error } = await supabase
        .from('workflows')
        .update({ is_active: true })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({ 
        success: true, 
        workflow: {
          ...workflow,
          definition: workflow.definition ? (typeof workflow.definition === 'string' ? JSON.parse(workflow.definition) : workflow.definition) : {},
          is_active: true
        }
      });
    } catch (error: any) {
      console.error('[Workflows] activate error', error);
      res.status(400).json({ success: false, error: error.message || 'Failed to activate workflow' });
    }
  });

  // POST /api/workflows/:id/deactivate - Deactivate workflow
  router.post('/:id/deactivate', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const { data: existing } = await supabase
        .from('workflows')
        .select('id')
        .eq('id', id)
        .eq('company_id', user.company_id || user.companyId)
        .single();

      if (!existing) {
        return res.status(404).json({ success: false, error: 'Workflow not found' });
      }

      const { data: workflow, error } = await supabase
        .from('workflows')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({ 
        success: true, 
        workflow: {
          ...workflow,
          definition: workflow.definition ? (typeof workflow.definition === 'string' ? JSON.parse(workflow.definition) : workflow.definition) : {},
          is_active: false
        }
      });
    } catch (error: any) {
      console.error('[Workflows] deactivate error', error);
      res.status(400).json({ success: false, error: error.message || 'Failed to deactivate workflow' });
    }
  });

  // POST /api/workflows/:id/run - Run workflow manually
  router.post('/:id/run', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const { data: workflow } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', id)
        .single();

      if (!workflow) {
        return res.status(404).json({ success: false, error: 'Workflow not found' });
      }

      if (workflow.company_id !== (user.company_id || user.companyId) && user.role !== 'super_admin') {
        return res.status(403).json({ success: false, error: 'Access denied to workflow' });
      }

      // Create workflow run
      const runId = uuidv4();
      const { data: run, error } = await supabase
        .from('workflow_runs')
        .insert({
          id: runId,
          workflow_id: id,
          company_id: workflow.company_id,
          status: 'running',
          trigger: typeof req.body?.trigger === 'string' ? req.body.trigger : JSON.stringify(req.body?.trigger || { type: 'manual', user: user.email }),
          input: typeof req.body?.input === 'string' ? req.body.input : JSON.stringify(req.body?.input || {}),
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // In a real implementation, this would execute the workflow steps
      // For now, mark as completed
      setTimeout(async () => {
        await supabase
          .from('workflow_runs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', runId);
      }, 1000);

      res.json({ 
        success: true, 
        run: {
          ...run,
          trigger: typeof run.trigger === 'string' ? JSON.parse(run.trigger) : run.trigger,
          input: typeof run.input === 'string' ? JSON.parse(run.input) : run.input
        }
      });
    } catch (error: any) {
      console.error('[Workflows] run error', error);
      res.status(400).json({ success: false, error: error.message || 'Failed to run workflow' });
    }
  });

  // GET /api/workflows/:id/runs - List workflow runs
  router.get('/:id/runs', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const { data: workflow } = await supabase
        .from('workflows')
        .select('id, company_id')
        .eq('id', id)
        .single();

      if (!workflow) {
        return res.status(404).json({ success: false, error: 'Workflow not found' });
      }

      if (workflow.company_id !== (user.company_id || user.companyId) && user.role !== 'super_admin') {
        return res.status(403).json({ success: false, error: 'Access denied to workflow runs' });
      }

      const limit = parseInt((req.query.limit as string) ?? '20', 10);

      const { data: runs, error } = await supabase
        .from('workflow_runs')
        .select('*')
        .eq('workflow_id', id)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Get run steps
      const runsWithSteps = await Promise.all(
        (runs || []).map(async (run: any) => {
          const { data: steps } = await supabase
            .from('workflow_run_steps')
            .select('*')
            .eq('run_id', run.id)
            .order('step_order');

          return {
            ...run,
            trigger: typeof run.trigger === 'string' ? JSON.parse(run.trigger) : run.trigger,
            input: typeof run.input === 'string' ? JSON.parse(run.input) : run.input,
            steps: steps || []
          };
        })
      );

      res.json({ success: true, runs: runsWithSteps });
    } catch (error: any) {
      console.error('[Workflows] runs error', error);
      res.status(500).json({ success: false, error: 'Failed to load workflow runs' });
    }
  });

  return router;
};
