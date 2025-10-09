// CortexBuild SDK Developer Environment API Routes
// Handles AI app generation, templates, agents, and workflows

import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import crypto from 'crypto';
import * as aiService from '../services/ai';
import * as deploymentService from '../services/deployment';

export function createSDKRouter(db: Database.Database): Router {
  const router = Router();

  // Middleware to get current user
  const getCurrentUser = (req: any, res: Response, next: any) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const session = db.prepare('SELECT user_id FROM sessions WHERE token = ?').get(token) as any;
    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.user_id) as any;
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  };

  // Check if user has SDK access
  const checkSDKAccess = (req: any, res: Response, next: any) => {
    const user = req.user;
    
    // Super admin always has access
    if (user.role === 'super_admin') {
      req.sdkDeveloper = {
        id: `sdk-${user.id}`,
        user_id: user.id,
        subscription_tier: 'enterprise',
        api_requests_used: 0,
        api_requests_limit: -1, // Unlimited
        is_active: 1
      };
      return next();
    }

    // Check if user is an SDK developer
    const sdkDev = db.prepare('SELECT * FROM sdk_developers WHERE user_id = ? AND is_active = 1').get(user.id) as any;
    if (!sdkDev) {
      return res.status(403).json({ error: 'SDK Developer access required' });
    }

    req.sdkDeveloper = sdkDev;
    next();
  };

  // GET /api/sdk/developer/status - Get SDK developer status
  router.get('/developer/status', getCurrentUser, (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      // Super admin always has access
      if (user.role === 'super_admin') {
        return res.json({
          success: true,
          data: {
            id: `sdk-${user.id}`,
            user_id: user.id,
            subscription_tier: 'enterprise',
            api_requests_used: 0,
            api_requests_limit: -1,
            is_active: true
          }
        });
      }

      // Check SDK developer status
      const sdkDev = db.prepare('SELECT * FROM sdk_developers WHERE user_id = ?').get(user.id);
      
      if (!sdkDev) {
        return res.json({
          success: true,
          data: null
        });
      }

      res.json({ success: true, data: sdkDev });
    } catch (error: any) {
      console.error('Get SDK status error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/sdk/ai/generate-app - Generate app with AI (REAL AI)
  router.post('/ai/generate-app', getCurrentUser, checkSDKAccess, async (req: Request, res: Response) => {
    try {
      const { prompt, subscriptionTier } = req.body;
      const user = (req as any).user;
      const sdkDev = (req as any).sdkDeveloper;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      // Check API limits (except for super admin)
      if (user.role !== 'super_admin') {
        if (sdkDev.api_requests_limit > 0 && sdkDev.api_requests_used >= sdkDev.api_requests_limit) {
          return res.status(429).json({ error: 'API request limit exceeded. Please upgrade your plan.' });
        }
      }

      // Generate code with real AI
      const { code, explanation } = await aiService.generateCode(prompt, user.id, user.company_id, db);

      res.json({
        success: true,
        code,
        explanation,
        message: 'App generated successfully with AI'
      });
    } catch (error: any) {
      console.error('Generate app error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/sdk/templates - Get all templates
  router.get('/templates', getCurrentUser, (req: Request, res: Response) => {
    try {
      const { category, search, ai_enhanced } = req.query;

      let query = 'SELECT * FROM sdk_templates WHERE is_active = 1';
      const params: any[] = [];

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      if (search) {
        query += ' AND (name LIKE ? OR description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      if (ai_enhanced !== undefined) {
        query += ' AND ai_enhanced = ?';
        params.push(ai_enhanced === 'true' ? 1 : 0);
      }

      query += ' ORDER BY install_count DESC, rating DESC';

      const templates = db.prepare(query).all(...params);

      res.json({ success: true, data: templates });
    } catch (error: any) {
      console.error('Get templates error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/sdk/templates/:id - Get template details
  router.get('/templates/:id', getCurrentUser, (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const template = db.prepare('SELECT * FROM sdk_templates WHERE id = ?').get(id);

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.json({ success: true, data: template });
    } catch (error: any) {
      console.error('Get template error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/sdk/apps - Create new app
  router.post('/apps', getCurrentUser, checkSDKAccess, (req: Request, res: Response) => {
    try {
      const { name, description, category, code_files, database_schema, api_routes } = req.body;
      const user = (req as any).user;
      const sdkDev = (req as any).sdkDeveloper;

      if (!name) {
        return res.status(400).json({ error: 'App name is required' });
      }

      const appId = `app-${crypto.randomBytes(8).toString('hex')}`;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      db.prepare(`
        INSERT INTO sdk_apps (id, developer_id, company_id, name, slug, description, category, code_files, database_schema, api_routes, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        appId,
        sdkDev.id,
        user.company_id,
        name,
        slug,
        description || '',
        category || 'custom',
        code_files || '{}',
        database_schema || '{}',
        api_routes || '{}',
        'draft'
      );

      const app = db.prepare('SELECT * FROM sdk_apps WHERE id = ?').get(appId);

      res.json({ success: true, data: app });
    } catch (error: any) {
      console.error('Create app error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/sdk/apps - Get user's apps
  router.get('/apps', getCurrentUser, checkSDKAccess, (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const sdkDev = (req as any).sdkDeveloper;

      const apps = db.prepare(`
        SELECT * FROM sdk_apps
        WHERE developer_id = ?
        ORDER BY created_at DESC
      `).all(sdkDev.id);

      res.json({ success: true, data: apps });
    } catch (error: any) {
      console.error('Get apps error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/sdk/usage - Get API usage statistics
  router.get('/usage', getCurrentUser, checkSDKAccess, (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      const usage = db.prepare(`
        SELECT
          COUNT(*) as total_requests,
          SUM(total_tokens) as total_tokens,
          SUM(estimated_cost) as total_cost,
          provider,
          model
        FROM ai_requests
        WHERE user_id = ?
        GROUP BY provider, model
      `).all(user.id);

      const recentRequests = db.prepare(`
        SELECT * FROM ai_requests
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 50
      `).all(user.id);

      res.json({
        success: true,
        data: {
          usage,
          recentRequests
        }
      });
    } catch (error: any) {
      console.error('Get usage error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/sdk/ai/chat - Developer chatbot with MCP
  router.post('/ai/chat', getCurrentUser, checkSDKAccess, async (req: Request, res: Response) => {
    try {
      const { message, conversationHistory, sessionId } = req.body;
      const user = (req as any).user;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const result = await aiService.developerChat(
        message,
        conversationHistory || [],
        user.id,
        user.company_id,
        db,
        sessionId
      );

      res.json({
        success: true,
        response: result.response,
        sessionId: result.sessionId
      });
    } catch (error: any) {
      console.error('Developer chat error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/sdk/ai/analyze-code - Analyze code for issues
  router.post('/ai/analyze-code', getCurrentUser, checkSDKAccess, async (req: Request, res: Response) => {
    try {
      const { code } = req.body;
      const user = (req as any).user;

      if (!code) {
        return res.status(400).json({ error: 'Code is required' });
      }

      const analysis = await aiService.analyzeCode(code, user.id, user.company_id, db);

      res.json({ success: true, data: analysis });
    } catch (error: any) {
      console.error('Code analysis error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/sdk/ai/generate-tests - Generate test cases
  router.post('/ai/generate-tests', getCurrentUser, checkSDKAccess, async (req: Request, res: Response) => {
    try {
      const { code } = req.body;
      const user = (req as any).user;

      if (!code) {
        return res.status(400).json({ error: 'Code is required' });
      }

      const tests = await aiService.generateTests(code, user.id, user.company_id, db);

      res.json({ success: true, tests });
    } catch (error: any) {
      console.error('Test generation error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/sdk/ai/chat-history - Get chat history
  router.get('/ai/chat-history', getCurrentUser, checkSDKAccess, (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { limit = 50 } = req.query;

      const history = db.prepare(`
        SELECT * FROM ai_chat_history
        WHERE user_id = ? AND context_type = 'developer'
        ORDER BY created_at DESC
        LIMIT ?
      `).all(user.id, limit);

      res.json({ success: true, data: history });
    } catch (error: any) {
      console.error('Get chat history error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/sdk/mcp/add-context - Add context to MCP session
  router.post('/mcp/add-context', getCurrentUser, checkSDKAccess, async (req: Request, res: Response) => {
    try {
      const { sessionId, contextType, contextData, metadata } = req.body;
      const user = (req as any).user;

      if (!sessionId || !contextType || !contextData) {
        return res.status(400).json({ error: 'Session ID, context type, and context data are required' });
      }

      const contextId = aiService.addCodeContext(
        db,
        user.id,
        sessionId,
        contextData.code || JSON.stringify(contextData),
        contextData.language || 'typescript',
        metadata || {}
      );

      res.json({ success: true, contextId });
    } catch (error: any) {
      console.error('Add context error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/sdk/mcp/stats - Get MCP statistics
  router.get('/mcp/stats', getCurrentUser, checkSDKAccess, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const stats = aiService.getMCPStats(db, user.id);

      res.json({ success: true, data: stats });
    } catch (error: any) {
      console.error('Get MCP stats error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/sdk/deploy - Deploy an app
  router.post('/deploy', getCurrentUser, checkSDKAccess, async (req: Request, res: Response) => {
    try {
      const { appId, version, environment, buildCommand, startCommand, envVars } = req.body;
      const user = (req as any).user;

      if (!appId || !version || !environment) {
        return res.status(400).json({ error: 'appId, version, and environment are required' });
      }

      const result = await deploymentService.createDeployment(db, {
        appId,
        version,
        environment,
        buildCommand,
        startCommand,
        envVars
      }, user.id);

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Deploy error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/sdk/deployments/:appId - List deployments for an app
  router.get('/deployments/:appId', getCurrentUser, checkSDKAccess, (req: Request, res: Response) => {
    try {
      const { appId } = req.params;
      const deployments = deploymentService.listDeployments(db, appId);

      res.json({ success: true, data: deployments });
    } catch (error: any) {
      console.error('List deployments error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/sdk/deployment/:deploymentId - Get deployment status
  router.get('/deployment/:deploymentId', getCurrentUser, checkSDKAccess, (req: Request, res: Response) => {
    try {
      const { deploymentId } = req.params;
      const deployment = deploymentService.getDeployment(db, deploymentId);

      if (!deployment) {
        return res.status(404).json({ error: 'Deployment not found' });
      }

      res.json({ success: true, data: deployment });
    } catch (error: any) {
      console.error('Get deployment error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/sdk/rollback - Rollback to a previous deployment
  router.post('/rollback', getCurrentUser, checkSDKAccess, async (req: Request, res: Response) => {
    try {
      const { appId, targetDeploymentId } = req.body;
      const user = (req as any).user;

      if (!appId || !targetDeploymentId) {
        return res.status(400).json({ error: 'appId and targetDeploymentId are required' });
      }

      const result = await deploymentService.rollbackDeployment(db, appId, targetDeploymentId, user.id);

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('Rollback error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/sdk/version - Create a new version
  router.post('/version', getCurrentUser, checkSDKAccess, (req: Request, res: Response) => {
    try {
      const { appId, version, codeFiles, message } = req.body;
      const user = (req as any).user;

      if (!appId || !version || !codeFiles) {
        return res.status(400).json({ error: 'appId, version, and codeFiles are required' });
      }

      const versionId = deploymentService.createVersion(db, appId, version, codeFiles, user.id, message);

      res.json({ success: true, data: { versionId } });
    } catch (error: any) {
      console.error('Create version error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/sdk/versions/:appId - Get version history
  router.get('/versions/:appId', getCurrentUser, checkSDKAccess, (req: Request, res: Response) => {
    try {
      const { appId } = req.params;
      const versions = deploymentService.getVersionHistory(db, appId);

      res.json({ success: true, data: versions });
    } catch (error: any) {
      console.error('Get versions error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

