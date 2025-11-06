import { Router } from 'express';
import { Database } from 'better-sqlite3';
import * as auth from '../auth';

export function createAgentsRouter(db: Database) {
  const router = Router();

  // Get all agents for the current user
  router.get('/', auth.authenticateToken, (req, res) => {
    try {
      const userId = (req as any).user.userId;

      const agents = db.prepare(`
        SELECT
          a.*,
          COUNT(DISTINCT e.id) as totalRuns,
          CAST(COUNT(CASE WHEN e.status = 'completed' THEN 1 END) AS REAL) / NULLIF(COUNT(e.id), 0) * 100 as successRate,
          AVG(e.duration) as avgExecutionTime
        FROM ai_agents a
        LEFT JOIN agent_executions e ON e.agent_id = a.id
        WHERE a.user_id = ?
        GROUP BY a.id
        ORDER BY a.created_at DESC
      `).all(userId);

      // Parse JSON fields
      const agentsFormatted = agents.map((a: any) => ({
        ...a,
        config: a.config ? JSON.parse(a.config) : {},
        totalRuns: a.totalRuns || 0,
        successRate: Math.round(a.successRate || 0),
        avgExecutionTime: parseFloat((a.avgExecutionTime || 0).toFixed(2))
      }));

      res.json(agentsFormatted);
    } catch (error) {
      console.error('Error fetching agents:', error);
      res.status(500).json({ error: 'Failed to fetch agents' });
    }
  });

  // Get a single agent
  router.get('/:id', auth.authenticateToken, (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;

      const agent = db.prepare(`
        SELECT * FROM ai_agents
        WHERE id = ? AND user_id = ?
      `).get(id, userId);

      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      res.json({
        ...agent,
        config: agent.config ? JSON.parse(agent.config) : {}
      });
    } catch (error) {
      console.error('Error fetching agent:', error);
      res.status(500).json({ error: 'Failed to fetch agent' });
    }
  });

  // Create a new agent
  router.post('/', auth.authenticateToken, (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const { name, description, type, model, temperature, maxTokens, systemPrompt, tools } = req.body;

      if (!name || !type) {
        return res.status(400).json({ error: 'Name and type are required' });
      }

      const config = {
        model: model || 'gpt-4-turbo',
        temperature: temperature || 0.7,
        maxTokens: maxTokens || 2000,
        systemPrompt: systemPrompt || '',
        tools: tools || []
      };

      const result = db.prepare(`
        INSERT INTO ai_agents (user_id, name, description, type, status, config, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'active', ?, datetime('now'), datetime('now'))
      `).run(userId, name, description, type, JSON.stringify(config));

      const agent = db.prepare('SELECT * FROM ai_agents WHERE id = ?').get(result.lastInsertRowid);

      res.status(201).json({
        ...agent,
        config: JSON.parse(agent.config),
        totalRuns: 0,
        successRate: 0,
        avgExecutionTime: 0
      });
    } catch (error) {
      console.error('Error creating agent:', error);
      res.status(500).json({ error: 'Failed to create agent' });
    }
  });

  // Update agent
  router.patch('/:id', auth.authenticateToken, (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;
      const { name, description, type, model, temperature, maxTokens, systemPrompt, tools } = req.body;

      // Check if agent exists and belongs to user
      const agent = db.prepare('SELECT * FROM ai_agents WHERE id = ? AND user_id = ?').get(id, userId);
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      const currentConfig = JSON.parse(agent.config);
      const newConfig = {
        model: model !== undefined ? model : currentConfig.model,
        temperature: temperature !== undefined ? temperature : currentConfig.temperature,
        maxTokens: maxTokens !== undefined ? maxTokens : currentConfig.maxTokens,
        systemPrompt: systemPrompt !== undefined ? systemPrompt : currentConfig.systemPrompt,
        tools: tools !== undefined ? tools : currentConfig.tools
      };

      db.prepare(`
        UPDATE ai_agents
        SET name = COALESCE(?, name),
            description = COALESCE(?, description),
            type = COALESCE(?, type),
            config = ?,
            updated_at = datetime('now')
        WHERE id = ? AND user_id = ?
      `).run(name, description, type, JSON.stringify(newConfig), id, userId);

      const updatedAgent = db.prepare('SELECT * FROM ai_agents WHERE id = ?').get(id);

      res.json({
        ...updatedAgent,
        config: JSON.parse(updatedAgent.config)
      });
    } catch (error) {
      console.error('Error updating agent:', error);
      res.status(500).json({ error: 'Failed to update agent' });
    }
  });

  // Update agent status
  router.patch('/:id/status', auth.authenticateToken, (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;
      const { status } = req.body;

      if (!['active', 'paused', 'error'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const result = db.prepare(`
        UPDATE ai_agents
        SET status = ?, updated_at = datetime('now')
        WHERE id = ? AND user_id = ?
      `).run(status, id, userId);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      res.json({ message: 'Status updated successfully' });
    } catch (error) {
      console.error('Error updating agent status:', error);
      res.status(500).json({ error: 'Failed to update status' });
    }
  });

  // Delete agent
  router.delete('/:id', auth.authenticateToken, (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;

      // Delete agent executions first
      db.prepare('DELETE FROM agent_executions WHERE agent_id = ?').run(id);

      // Delete agent
      const result = db.prepare('DELETE FROM ai_agents WHERE id = ? AND user_id = ?').run(id, userId);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      res.json({ message: 'Agent deleted successfully' });
    } catch (error) {
      console.error('Error deleting agent:', error);
      res.status(500).json({ error: 'Failed to delete agent' });
    }
  });

  // Execute agent
  router.post('/:id/execute', auth.authenticateToken, async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;
      const { input } = req.body;

      if (!input) {
        return res.status(400).json({ error: 'Input is required' });
      }

      // Get agent
      const agent = db.prepare('SELECT * FROM ai_agents WHERE id = ? AND user_id = ?').get(id, userId);
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      if (agent.status !== 'active') {
        return res.status(400).json({ error: 'Agent is not active' });
      }

      const config = JSON.parse(agent.config);
      const startTime = Date.now();

      // Create execution record
      const executionResult = db.prepare(`
        INSERT INTO agent_executions (agent_id, status, input, started_at)
        VALUES (?, 'running', ?, datetime('now'))
      `).run(id, input);

      const executionId = executionResult.lastInsertRowid;

      try {
        // Execute with OpenAI (you'll need to import your AI service)
        const aiService = await import('../services/ai');

        const messages = [
          { role: 'system', content: config.systemPrompt || 'You are a helpful AI assistant.' },
          { role: 'user', content: input }
        ];

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: config.model || 'gpt-4-turbo',
            messages,
            temperature: config.temperature || 0.7,
            max_tokens: config.maxTokens || 2000
          })
        });

        if (!response.ok) {
          throw new Error('OpenAI API error');
        }

        const data = await response.json();
        const output = data.choices[0].message.content;
        const tokensUsed = data.usage.total_tokens;
        const duration = (Date.now() - startTime) / 1000;

        // Calculate cost (approximate)
        const cost = (tokensUsed / 1000) * 0.01; // $0.01 per 1K tokens

        // Update execution record
        db.prepare(`
          UPDATE agent_executions
          SET status = 'completed',
              output = ?,
              completed_at = datetime('now'),
              duration = ?,
              tokens_used = ?,
              cost = ?
          WHERE id = ?
        `).run(output, duration, tokensUsed, cost, executionId);

        // Update agent last_run
        db.prepare(`
          UPDATE ai_agents
          SET last_run = datetime('now')
          WHERE id = ?
        `).run(id);

        const execution = db.prepare('SELECT * FROM agent_executions WHERE id = ?').get(executionId);
        res.json(execution);

      } catch (error: any) {
        const duration = (Date.now() - startTime) / 1000;

        // Update execution with error
        db.prepare(`
          UPDATE agent_executions
          SET status = 'failed',
              error = ?,
              completed_at = datetime('now'),
              duration = ?
          WHERE id = ?
        `).run(error.message, duration, executionId);

        // Update agent status
        db.prepare(`
          UPDATE ai_agents
          SET status = 'error',
              last_run = datetime('now')
          WHERE id = ?
        `).run(id);

        throw error;
      }
    } catch (error) {
      console.error('Error executing agent:', error);
      res.status(500).json({ error: 'Failed to execute agent' });
    }
  });

  // Get agent executions
  router.get('/executions', auth.authenticateToken, (req, res) => {
    try {
      const userId = (req as any).user.userId;

      const executions = db.prepare(`
        SELECT e.*, a.name as agent_name
        FROM agent_executions e
        JOIN ai_agents a ON a.id = e.agent_id
        WHERE a.user_id = ?
        ORDER BY e.started_at DESC
        LIMIT 100
      `).all(userId);

      res.json(executions);
    } catch (error) {
      console.error('Error fetching executions:', error);
      res.status(500).json({ error: 'Failed to fetch executions' });
    }
  });

  // Get executions for a specific agent
  router.get('/:id/executions', auth.authenticateToken, (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;

      // Verify agent belongs to user
      const agent = db.prepare('SELECT * FROM ai_agents WHERE id = ? AND user_id = ?').get(id, userId);
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      const executions = db.prepare(`
        SELECT * FROM agent_executions
        WHERE agent_id = ?
        ORDER BY started_at DESC
        LIMIT 50
      `).all(id);

      res.json(executions);
    } catch (error) {
      console.error('Error fetching agent executions:', error);
      res.status(500).json({ error: 'Failed to fetch executions' });
    }
  });

  return router;
}
