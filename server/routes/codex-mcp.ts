/**
 * Codex MCP API Routes
 * 
 * Provides REST API endpoints for Codex MCP integration
 */

import { Router } from 'express';
import type { Database } from 'better-sqlite3';
import CodexMCPBridge from '../services/codex-mcp-bridge.js';
import { getSessionStats } from '../services/mcp.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; role: string };
    }
  }
}

export function createCodexMCPRoutes(db: Database.Database): Router {
  const router = Router();
  
  // Initialize Codex MCP Bridge
  const codexBridge = new CodexMCPBridge(db, {
    command: 'python3',
    args: ['scripts/codex-mcp-server.py'],
    timeout: 300000, // 5 minutes
    autoRestart: true
  });

  // Setup event listeners
  codexBridge.on('sessionStarted', ({ sessionId, userId }) => {
    console.log(`🤖 Codex session started: ${sessionId} for user ${userId}`);
  });

  codexBridge.on('sessionStopped', ({ sessionId }) => {
    console.log(`🛑 Codex session stopped: ${sessionId}`);
  });

  codexBridge.on('codexOutput', ({ sessionId, output, type }) => {
    console.log(`📤 Codex ${type} [${sessionId}]:`, output);
  });

  // Cleanup inactive sessions every 30 minutes
  setInterval(() => {
    codexBridge.cleanupInactiveSessions();
  }, 30 * 60 * 1000);

  /**
   * POST /api/codex-mcp/session/start
   * Start a new Codex MCP session
   */
  router.post('/session/start', async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { sessionId } = req.body;
      const newSessionId = await codexBridge.startCodexSession(userId, sessionId);

      res.json({
        success: true,
        sessionId: newSessionId,
        message: 'Codex MCP session started successfully'
      });

    } catch (error: any) {
      console.error('❌ Error starting Codex session:', error);
      res.status(500).json({
        error: 'Failed to start Codex session',
        details: error.message
      });
    }
  });

  /**
   * POST /api/codex-mcp/session/:sessionId/stop
   * Stop a Codex MCP session
   */
  router.post('/session/:sessionId/stop', async (req, res) => {
    try {
      const { sessionId } = req.params;
      await codexBridge.stopCodexSession(sessionId);

      res.json({
        success: true,
        message: 'Codex MCP session stopped successfully'
      });

    } catch (error: any) {
      console.error('❌ Error stopping Codex session:', error);
      res.status(500).json({
        error: 'Failed to stop Codex session',
        details: error.message
      });
    }
  });

  /**
   * POST /api/codex-mcp/chat
   * Send chat message to Codex
   */
  router.post('/chat', async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { sessionId, message, context } = req.body;

      if (!sessionId || !message) {
        return res.status(400).json({
          error: 'sessionId and message are required'
        });
      }

      const response = await codexBridge.sendToCodex(sessionId, message, context);

      res.json({
        success: true,
        response,
        sessionId
      });

    } catch (error: any) {
      console.error('❌ Error in Codex chat:', error);
      res.status(500).json({
        error: 'Failed to process chat message',
        details: error.message
      });
    }
  });

  /**
   * POST /api/codex-mcp/execute
   * Execute code through Codex
   */
  router.post('/execute', async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { sessionId, code, language = 'typescript' } = req.body;

      if (!sessionId || !code) {
        return res.status(400).json({
          error: 'sessionId and code are required'
        });
      }

      const response = await codexBridge.executeCode(sessionId, code, language);

      res.json({
        success: true,
        response,
        sessionId,
        language
      });

    } catch (error: any) {
      console.error('❌ Error executing code:', error);
      res.status(500).json({
        error: 'Failed to execute code',
        details: error.message
      });
    }
  });

  /**
   * POST /api/codex-mcp/suggest
   * Get code suggestions from Codex
   */
  router.post('/suggest', async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { sessionId, prompt, context } = req.body;

      if (!sessionId || !prompt) {
        return res.status(400).json({
          error: 'sessionId and prompt are required'
        });
      }

      const response = await codexBridge.getCodeSuggestions(sessionId, prompt, context);

      res.json({
        success: true,
        response,
        sessionId
      });

    } catch (error: any) {
      console.error('❌ Error getting code suggestions:', error);
      res.status(500).json({
        error: 'Failed to get code suggestions',
        details: error.message
      });
    }
  });

  /**
   * GET /api/codex-mcp/sessions
   * Get active Codex sessions
   */
  router.get('/sessions', async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const activeSessions = codexBridge.getActiveSessions();
      const userSessions = activeSessions.filter(s => s.userId === userId);

      res.json({
        success: true,
        sessions: userSessions.map(s => ({
          sessionId: s.sessionId,
          userId: s.userId,
          isActive: s.isActive,
          lastActivity: s.lastActivity
        }))
      });

    } catch (error: any) {
      console.error('❌ Error getting sessions:', error);
      res.status(500).json({
        error: 'Failed to get sessions',
        details: error.message
      });
    }
  });

  /**
   * GET /api/codex-mcp/session/:sessionId/stats
   * Get session statistics
   */
  router.get('/session/:sessionId/stats', async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { sessionId } = req.params;
      const stats = getSessionStats(db, userId);

      res.json({
        success: true,
        sessionId,
        stats
      });

    } catch (error: any) {
      console.error('❌ Error getting session stats:', error);
      res.status(500).json({
        error: 'Failed to get session stats',
        details: error.message
      });
    }
  });

  /**
   * GET /api/codex-mcp/health
   * Health check for Codex MCP service
   */
  router.get('/health', async (req, res) => {
    try {
      const activeSessions = codexBridge.getActiveSessions();
      
      res.json({
        success: true,
        status: 'healthy',
        activeSessions: activeSessions.length,
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error('❌ Health check error:', error);
      res.status(500).json({
        success: false,
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * POST /api/codex-mcp/cleanup
   * Manual cleanup of inactive sessions
   */
  router.post('/cleanup', async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { maxIdleTime = 30 * 60 * 1000 } = req.body; // Default 30 minutes

      await codexBridge.cleanupInactiveSessions(maxIdleTime);

      res.json({
        success: true,
        message: 'Cleanup completed successfully'
      });

    } catch (error: any) {
      console.error('❌ Error during cleanup:', error);
      res.status(500).json({
        error: 'Failed to cleanup sessions',
        details: error.message
      });
    }
  });

  return router;
}

export default createCodexMCPRoutes;
