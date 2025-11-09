/**
 * AI Agent API Routes
 * Endpoints for agent marketplace, subscriptions, and execution
 */

import { Router } from 'express';
import { authenticateToken } from '../auth.js';
import { db } from '../database.js';
import {
  initializeAgentTables,
  getMarketplaceAgents,
  getAgentById,
  createAgent,
  publishAgent,
  subscribeToAgent,
  getUserSubscriptions,
  executeAgent,
  getExecution,
  getAgentExecutions
} from '../services/agent-registry.js';
import {
  validateRequired,
  validateLength,
  validateEnum,
  combineValidations
} from '../utils/validation.js';

const router = Router();

// Initialize tables on import
initializeAgentTables(db);

/**
 * GET /api/agents
 * Get all agents (root endpoint - alias for marketplace)
 */
router.get('/', authenticateToken, (req, res) => {
  try {
    const { category, minRating, search } = req.query;

    const agents = getMarketplaceAgents(db, {
      category: category as string,
      minRating: minRating ? Number.parseFloat(minRating as string) : undefined,
      search: search as string
    });

    res.json({
      success: true,
      agents,
      count: agents.length,
      message: 'Use /api/agents/marketplace for marketplace-specific features'
    });
  } catch (error: any) {
    console.error('Get agents error:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

/**
 * GET /api/agents/marketplace
 * Get all public agents from marketplace
 */
router.get('/marketplace', authenticateToken, (req, res) => {
  try {
    const { category, minRating, search } = req.query;

    const agents = getMarketplaceAgents(db, {
      category: category as string,
      minRating: minRating ? Number.parseFloat(minRating as string) : undefined,
      search: search as string
    });

    res.json({
      success: true,
      agents,
      count: agents.length
    });
  } catch (error: any) {
    console.error('Get marketplace agents error:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

/**
 * GET /api/agents/:id
 * Get agent details by ID
 */
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;

    const agent = getAgentById(db, id);

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json({
      success: true,
      agent
    });
  } catch (error: any) {
    console.error('Get agent error:', error);
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
});

/**
 * POST /api/agents
 * Create new AI agent (developer only)
 */
router.post('/', authenticateToken, (req, res) => {
  try {
    const { userId, role } = req.user;

    // Check if user is developer
    if (!['developer', 'super_admin'].includes(role)) {
      return res.status(403).json({ error: 'Developer access required' });
    }

    const { name, description, category, config, code, isPublic, price } = req.body;

    // Validate input
    const validation = combineValidations(
      validateRequired(name, 'Name'),
      validateLength(name, 3, 100, 'Name'),
      validateRequired(description, 'Description'),
      validateLength(description, 10, 500, 'Description'),
      validateRequired(category, 'Category'),
      validateEnum(category, [
        'automation',
        'analytics',
        'safety',
        'financial',
        'communication',
        'integration'
      ], 'Category'),
      validateRequired(code, 'Code')
    );

    if (!validation.isValid) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.errors 
      });
    }

    const agentId = createAgent(db, userId, {
      name,
      description,
      category,
      config: config || {},
      code,
      isPublic: isPublic || false,
      price: price || 0
    });

    res.status(201).json({
      success: true,
      agentId,
      message: 'Agent created successfully'
    });
  } catch (error: any) {
    console.error('Create agent error:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

/**
 * POST /api/agents/:id/publish
 * Publish agent to marketplace (developer only)
 */
router.post('/:id/publish', authenticateToken, (req, res) => {
  try {
    const { userId, role } = req.user;
    const { id } = req.params;

    // Check if user is developer
    if (!['developer', 'super_admin'].includes(role)) {
      return res.status(403).json({ error: 'Developer access required' });
    }

    const success = publishAgent(db, id, userId);

    if (!success) {
      return res.status(404).json({ 
        error: 'Agent not found or already published' 
      });
    }

    res.json({
      success: true,
      message: 'Agent published to marketplace'
    });
  } catch (error: any) {
    console.error('Publish agent error:', error);
    res.status(500).json({ error: 'Failed to publish agent' });
  }
});

/**
 * POST /api/agents/:id/subscribe
 * Subscribe to an agent
 */
router.post('/:id/subscribe', authenticateToken, (req, res) => {
  try {
    const { userId, companyId } = req.user;
    const { id } = req.params;
    const { config } = req.body;

    // Check if agent exists and is public
    const agent = getAgentById(db, id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    if (!agent.isPublic) {
      return res.status(403).json({ error: 'Agent is not public' });
    }

    const subscriptionId = subscribeToAgent(db, id, userId, companyId, config);

    res.status(201).json({
      success: true,
      subscriptionId,
      message: 'Subscribed to agent successfully'
    });
  } catch (error: any) {
    console.error('Subscribe to agent error:', error);
    res.status(500).json({ error: 'Failed to subscribe to agent' });
  }
});

/**
 * GET /api/agents/subscriptions/my
 * Get user's subscribed agents
 */
router.get('/subscriptions/my', authenticateToken, (req, res) => {
  try {
    const { userId } = req.user;

    const agents = getUserSubscriptions(db, userId);

    res.json({
      success: true,
      agents,
      count: agents.length
    });
  } catch (error: any) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

/**
 * POST /api/agents/:id/execute
 * Execute an AI agent
 */
router.post('/:id/execute', authenticateToken, async (req, res) => {
  try {
    const { userId, companyId } = req.user;
    const { id } = req.params;
    const { input } = req.body;

    if (!input || typeof input !== 'object') {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    // Check if user is subscribed to agent
    const subscription = db.prepare(`
      SELECT id FROM agent_subscriptions 
      WHERE agent_id = ? AND user_id = ? AND status = 'active'
    `).get(id, userId);

    if (!subscription) {
      return res.status(403).json({ 
        error: 'You must subscribe to this agent to execute it' 
      });
    }

    const executionId = await executeAgent(db, id, userId, companyId, input);

    res.status(202).json({
      success: true,
      executionId,
      message: 'Agent execution started',
      statusUrl: `/api/agents/executions/${executionId}`
    });
  } catch (error: any) {
    console.error('Execute agent error:', error);
    res.status(500).json({ error: 'Failed to execute agent' });
  }
});

/**
 * GET /api/agents/executions/:executionId
 * Get agent execution status and result
 */
router.get('/executions/:executionId', authenticateToken, (req, res) => {
  try {
    const { executionId } = req.params;
    const { userId } = req.user;

    const execution = getExecution(db, executionId);

    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    // Check if user owns this execution
    if (execution.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      execution
    });
  } catch (error: any) {
    console.error('Get execution error:', error);
    res.status(500).json({ error: 'Failed to fetch execution' });
  }
});

/**
 * GET /api/agents/:id/executions
 * Get agent execution history
 */
router.get('/:id/executions', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const limit = Number.parseInt(req.query.limit as string) || 50;

    // Verify user has access to this agent
    const subscription = db.prepare(`
      SELECT id FROM agent_subscriptions 
      WHERE agent_id = ? AND user_id = ?
    `).get(id, userId);

    if (!subscription) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const executions = getAgentExecutions(db, id, limit);

    // Filter to only user's executions
    const userExecutions = executions.filter(e => e.userId === userId);

    res.json({
      success: true,
      executions: userExecutions,
      count: userExecutions.length
    });
  } catch (error: any) {
    console.error('Get executions error:', error);
    res.status(500).json({ error: 'Failed to fetch executions' });
  }
});

export default router;
