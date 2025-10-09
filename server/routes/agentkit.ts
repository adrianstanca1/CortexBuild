import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import { authenticateToken } from '../auth';
import {
  listGlobalAgents,
  listCompanyAgents,
  subscribeAgent,
  unsubscribeAgent,
  runAgent,
  getAgentExecutions,
  listAgentSubscriptions,
  getAgentById
} from '../services/agentkit';

export const createAgentKitRouter = (db: Database.Database) => {
  const router = Router();

  router.use(authenticateToken);

  router.get('/catalog', (req: Request, res: Response) => {
    try {
      const agents = listGlobalAgents(db);
      res.json({ success: true, agents });
    } catch (error: any) {
      console.error('[AgentKit] catalog error', error);
      res.status(500).json({ success: false, error: 'Failed to load agent catalog' });
    }
  });

  router.get('/agents', (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const agents = listCompanyAgents(db, user.companyId);
      const subscriptions = listAgentSubscriptions(db, user.companyId);

      res.json({
        success: true,
        agents,
        subscriptions: subscriptions.map((sub: any) => ({
          id: sub.id,
          agentId: sub.agent_id,
          status: sub.status,
          seats: sub.seats,
          createdAt: sub.created_at,
          updatedAt: sub.updated_at
        }))
      });
    } catch (error: any) {
      console.error('[AgentKit] list agents error', error);
      res.status(500).json({ success: false, error: 'Failed to load agents' });
    }
  });

  router.post('/agents/:agentId/subscribe', (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { agentId } = req.params;
      const targetCompanyId =
        user.role === 'super_admin' && req.body.companyId ? req.body.companyId : user.companyId;

      const agent = subscribeAgent(db, agentId, targetCompanyId, user.id);
      res.json({ success: true, agent });
    } catch (error: any) {
      console.error('[AgentKit] subscribe error', error);
      res.status(400).json({ success: false, error: error.message || 'Failed to subscribe to agent' });
    }
  });

  router.delete('/agents/:agentId', (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { agentId } = req.params;

      unsubscribeAgent(db, agentId, user.companyId);
      res.json({ success: true });
    } catch (error: any) {
      console.error('[AgentKit] unsubscribe error', error);
      res.status(400).json({ success: false, error: error.message || 'Failed to unsubscribe agent' });
    }
  });

  router.post('/agents/:agentId/run', (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { agentId } = req.params;
      const agent = getAgentById(db, agentId);

      if (!agent) {
        return res.status(404).json({ success: false, error: 'Agent not found' });
      }

      const companyId = agent.companyId ?? user.companyId;
      if (companyId !== user.companyId && user.role !== 'super_admin') {
        return res.status(403).json({ success: false, error: 'Access denied to agent' });
      }

      const execution = runAgent(db, agentId, companyId, user.id, req.body?.input);

      res.json({
        success: true,
        execution
      });
    } catch (error: any) {
      console.error('[AgentKit] run error', error);
      res.status(400).json({ success: false, error: error.message || 'Failed to run agent' });
    }
  });

  router.get('/agents/:agentId/executions', (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { agentId } = req.params;

      const agent = getAgentById(db, agentId);
      if (!agent) {
        return res.status(404).json({ success: false, error: 'Agent not found' });
      }

      const companyId = agent.companyId ?? user.companyId;
      if (companyId !== user.companyId && user.role !== 'super_admin') {
        return res.status(403).json({ success: false, error: 'Access denied to executions' });
      }

      const limit = parseInt((req.query.limit as string) ?? '25', 10);
      const executions = getAgentExecutions(db, agentId, companyId, limit);

      res.json({
        success: true,
        executions
      });
    } catch (error: any) {
      console.error('[AgentKit] executions error', error);
      res.status(500).json({ success: false, error: 'Failed to load executions' });
    }
  });

  return router;
};
