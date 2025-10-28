import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import { authenticateToken } from '../auth';
import {
  listWorkflows,
  listAllWorkflows,
  createWorkflow,
  updateWorkflow,
  toggleWorkflow,
  runWorkflow,
  listWorkflowRuns,
  listWorkflowRunSteps,
  listTemplates,
  getWorkflow,
  getBuilderBlocks
} from '../services/workflows';

export const createWorkflowsRouter = (db: Database.Database) => {
  const router = Router();

  router.use(authenticateToken);

  router.get('/', (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const includeInactive = req.query.includeInactive !== 'false';

      if (user.role === 'super_admin' && req.query.companyId) {
        const workflows = listWorkflows(db, req.query.companyId as string, includeInactive);
        return res.json({ success: true, workflows });
      }

      const workflows = listWorkflows(db, user.companyId, includeInactive);
      res.json({ success: true, workflows });
    } catch (error: any) {
      console.error('[Workflows] list error', error);
      res.status(500).json({ success: false, error: 'Failed to load workflows' });
    }
  });

  router.get('/all', (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      if (user.role !== 'super_admin') {
        return res.status(403).json({ success: false, error: 'Super admin only' });
      }

      const workflows = listAllWorkflows(db, parseInt((req.query.limit as string) ?? '100', 10));
      res.json({ success: true, workflows });
    } catch (error: any) {
      console.error('[Workflows] list all error', error);
      res.status(500).json({ success: false, error: 'Failed to load workflows' });
    }
  });

  router.get('/templates', (_req: Request, res: Response) => {
    try {
      const templates = listTemplates(db);
      res.json({ success: true, templates });
    } catch (error: any) {
      console.error('[Workflows] templates error', error);
      res.status(500).json({ success: false, error: 'Failed to load templates' });
    }
  });

  router.get('/builder/blocks', (_req: Request, res: Response) => {
    try {
      const blocks = getBuilderBlocks();
      res.json({ success: true, blocks });
    } catch (error: any) {
      console.error('[Workflows] builder blocks error', error);
      res.status(500).json({ success: false, error: 'Failed to load builder blocks' });
    }
  });

  router.post('/', (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const workflow = createWorkflow(db, user.companyId, {
        name: req.body.name,
        description: req.body.description,
        definition: req.body.definition,
        createdBy: user.id
      });

      res.json({ success: true, workflow });
    } catch (error: any) {
      console.error('[Workflows] create error', error);
      res.status(400).json({ success: false, error: error.message || 'Failed to create workflow' });
    }
  });

  router.put('/:id', (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const workflow = updateWorkflow(db, req.params.id, user.companyId, req.body ?? {});
      res.json({ success: true, workflow });
    } catch (error: any) {
      console.error('[Workflows] update error', error);
      res.status(400).json({ success: false, error: error.message || 'Failed to update workflow' });
    }
  });

  router.post('/:id/activate', (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const workflow = toggleWorkflow(db, req.params.id, user.companyId, true);
      res.json({ success: true, workflow });
    } catch (error: any) {
      console.error('[Workflows] activate error', error);
      res.status(400).json({ success: false, error: error.message || 'Failed to activate workflow' });
    }
  });

  router.post('/:id/deactivate', (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const workflow = toggleWorkflow(db, req.params.id, user.companyId, false);
      res.json({ success: true, workflow });
    } catch (error: any) {
      console.error('[Workflows] deactivate error', error);
      res.status(400).json({ success: false, error: error.message || 'Failed to deactivate workflow' });
    }
  });

  router.post('/:id/run', (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const workflow = getWorkflow(db, req.params.id);
      if (!workflow) {
        return res.status(404).json({ success: false, error: 'Workflow not found' });
      }

      if (workflow.companyId !== user.companyId && user.role !== 'super_admin') {
        return res.status(403).json({ success: false, error: 'Access denied to workflow' });
      }

      const run = runWorkflow(
        db,
        req.params.id,
        workflow.companyId,
        req.body?.trigger ?? { type: 'manual', user: user.email },
        req.body?.input
      );

      res.json({ success: true, run });
    } catch (error: any) {
      console.error('[Workflows] run error', error);
      res.status(400).json({ success: false, error: error.message || 'Failed to run workflow' });
    }
  });

  router.get('/:id/runs', (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const workflow = getWorkflow(db, req.params.id);
      if (!workflow) {
        return res.status(404).json({ success: false, error: 'Workflow not found' });
      }

      if (workflow.companyId !== user.companyId && user.role !== 'super_admin') {
        return res.status(403).json({ success: false, error: 'Access denied to workflow runs' });
      }

      const limit = parseInt((req.query.limit as string) ?? '20', 10);
      const runs = listWorkflowRuns(db, workflow.id, workflow.companyId, limit);

      res.json({
        success: true,
        runs: runs.map(run => ({
          ...run,
          steps: listWorkflowRunSteps(db, run.id)
        }))
      });
    } catch (error: any) {
      console.error('[Workflows] runs error', error);
      res.status(500).json({ success: false, error: 'Failed to load workflow runs' });
    }
  });

  return router;
};
