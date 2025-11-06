// CortexBuild - AgentKit API Routes
// Version: 2.0.0 - Supabase Migration
// Last Updated: 2025-10-31

import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { authenticateToken } from '../auth-supabase';
import { v4 as uuidv4 } from 'uuid';

export const createAgentKitRouter = (supabase: SupabaseClient) => {
  const router = Router();

  router.use(authenticateToken);

  // GET /api/agentkit/catalog - List global agents catalog
  router.get('/catalog', async (req: Request, res: Response) => {
    try {
      const { data: agents, error } = await supabase
        .from('global_agents')
        .select('*')
        .eq('is_public', true)
        .order('name');

      if (error) throw error;

      res.json({ success: true, agents: agents || [] });
    } catch (error: any) {
      console.error('[AgentKit] catalog error', error);
      res.status(500).json({ success: false, error: 'Failed to load agent catalog' });
    }
  });

  // GET /api/agentkit/agents - List company agents and subscriptions
  router.get('/agents', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const companyId = user.company_id || user.companyId;

      // Get company agents
      const { data: agents, error: agentsError } = await supabase
        .from('ai_agents')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (agentsError) throw agentsError;

      // Get agent subscriptions
      const { data: subscriptions, error: subsError } = await supabase
        .from('agent_subscriptions')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (subsError) throw subsError;

      res.json({
        success: true,
        agents: agents || [],
        subscriptions: (subscriptions || []).map((sub: any) => ({
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

  // POST /api/agentkit/agents/:agentId/subscribe - Subscribe to an agent
  router.post('/agents/:agentId/subscribe', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { agentId } = req.params;
      const targetCompanyId =
        user.role === 'super_admin' && req.body.companyId ? req.body.companyId : (user.company_id || user.companyId);

      // Check if agent exists in global catalog
      const { data: globalAgent } = await supabase
        .from('global_agents')
        .select('*')
        .eq('id', agentId)
        .eq('is_public', true)
        .single();

      if (!globalAgent) {
        return res.status(404).json({ success: false, error: 'Agent not found in catalog' });
      }

      // Check if already subscribed
      const { data: existing } = await supabase
        .from('agent_subscriptions')
        .select('id')
        .eq('agent_id', agentId)
        .eq('company_id', targetCompanyId)
        .single();

      if (existing) {
        return res.status(400).json({ success: false, error: 'Already subscribed to this agent' });
      }

      // Create subscription
      const { data: subscription, error } = await supabase
        .from('agent_subscriptions')
        .insert({
          agent_id: agentId,
          company_id: targetCompanyId,
          status: 'active',
          seats: 1,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Create company agent instance
      const { data: agent, error: agentError } = await supabase
        .from('ai_agents')
        .insert({
          company_id: targetCompanyId,
          name: globalAgent.name,
          description: globalAgent.description,
          status: 'active',
          config: globalAgent.config || {},
          created_by: user.id
        })
        .select()
        .single();

      if (agentError) throw agentError;

      res.json({ success: true, agent });
    } catch (error: any) {
      console.error('[AgentKit] subscribe error', error);
      res.status(400).json({ success: false, error: error.message || 'Failed to subscribe to agent' });
    }
  });

  // DELETE /api/agentkit/agents/:agentId - Unsubscribe from an agent
  router.delete('/agents/:agentId', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { agentId } = req.params;
      const companyId = user.company_id || user.companyId;

      // Check if subscribed
      const { data: subscription } = await supabase
        .from('agent_subscriptions')
        .select('id')
        .eq('agent_id', agentId)
        .eq('company_id', companyId)
        .single();

      if (!subscription) {
        return res.status(404).json({ success: false, error: 'Subscription not found' });
      }

      // Delete subscription
      await supabase
        .from('agent_subscriptions')
        .delete()
        .eq('id', subscription.id);

      // Optionally delete company agent instance
      await supabase
        .from('ai_agents')
        .delete()
        .eq('company_id', companyId)
        .eq('name', (await supabase.from('global_agents').select('name').eq('id', agentId).single()).data?.name || '');

      res.json({ success: true });
    } catch (error: any) {
      console.error('[AgentKit] unsubscribe error', error);
      res.status(400).json({ success: false, error: error.message || 'Failed to unsubscribe agent' });
    }
  });

  // POST /api/agentkit/agents/:agentId/run - Run an agent
  router.post('/agents/:agentId/run', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { agentId } = req.params;
      const input = req.body?.input || {};

      // Get agent (from global or company)
      let agent: any = null;
      
      // Try to get from company agents first
      const companyId = user.company_id || user.companyId;
      const { data: companyAgent } = await supabase
        .from('ai_agents')
        .select('*')
        .eq('id', agentId)
        .eq('company_id', companyId)
        .single();

      if (companyAgent) {
        agent = companyAgent;
      } else {
        // Try global agents
        const { data: globalAgent } = await supabase
          .from('global_agents')
          .select('*')
          .eq('id', agentId)
          .single();

        if (!globalAgent) {
          return res.status(404).json({ success: false, error: 'Agent not found' });
        }

        // Check if company has subscription
        const { data: subscription } = await supabase
          .from('agent_subscriptions')
          .select('*')
          .eq('agent_id', agentId)
          .eq('company_id', companyId)
          .eq('status', 'active')
          .single();

        if (!subscription && user.role !== 'super_admin') {
          return res.status(403).json({ success: false, error: 'Access denied to agent' });
        }

        agent = globalAgent;
      }

      const agentCompanyId = agent.company_id || companyId;
      if (agentCompanyId !== companyId && user.role !== 'super_admin') {
        return res.status(403).json({ success: false, error: 'Access denied to agent' });
      }

      // Create execution record
      const executionId = uuidv4();
      const { data: execution, error } = await supabase
        .from('agent_executions')
        .insert({
          id: executionId,
          agent_id: agentId,
          company_id: companyId,
          status: 'running',
          input: typeof input === 'string' ? input : JSON.stringify(input),
          started_at: new Date().toISOString(),
          started_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // In a real implementation, this would run the agent logic
      // For now, simulate execution
      setTimeout(async () => {
        await supabase
          .from('agent_executions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            output: JSON.stringify({ result: 'Agent executed successfully', input })
          })
          .eq('id', executionId);
      }, 1000);

      res.json({
        success: true,
        execution: {
          ...execution,
          input: typeof execution.input === 'string' ? JSON.parse(execution.input) : execution.input
        }
      });
    } catch (error: any) {
      console.error('[AgentKit] run error', error);
      res.status(400).json({ success: false, error: error.message || 'Failed to run agent' });
    }
  });

  // GET /api/agentkit/agents/:agentId/executions - Get agent executions
  router.get('/agents/:agentId/executions', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { agentId } = req.params;
      const limit = parseInt((req.query.limit as string) ?? '25', 10);
      const companyId = user.company_id || user.companyId;

      // Verify agent access
      const { data: companyAgent } = await supabase
        .from('ai_agents')
        .select('company_id')
        .eq('id', agentId)
        .eq('company_id', companyId)
        .single();

      const { data: globalAgent } = await supabase
        .from('global_agents')
        .select('id')
        .eq('id', agentId)
        .single();

      const { data: subscription } = await supabase
        .from('agent_subscriptions')
        .select('*')
        .eq('agent_id', agentId)
        .eq('company_id', companyId)
        .single();

      if (!companyAgent && !globalAgent) {
        return res.status(404).json({ success: false, error: 'Agent not found' });
      }

      if (companyAgent?.company_id !== companyId && !subscription && user.role !== 'super_admin') {
        return res.status(403).json({ success: false, error: 'Access denied to executions' });
      }

      // Get executions
      const { data: executions, error } = await supabase
        .from('agent_executions')
        .select('*')
        .eq('agent_id', agentId)
        .eq('company_id', companyId)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const transformed = (executions || []).map((e: any) => ({
        ...e,
        input: e.input ? (typeof e.input === 'string' ? JSON.parse(e.input) : e.input) : {},
        output: e.output ? (typeof e.output === 'string' ? JSON.parse(e.output) : e.output) : {}
      }));

      res.json({
        success: true,
        executions: transformed
      });
    } catch (error: any) {
      console.error('[AgentKit] executions error', error);
      res.status(500).json({ success: false, error: 'Failed to load executions' });
    }
  });

  return router;
};
