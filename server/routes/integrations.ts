<<<<<<< HEAD
import { Router } from 'express';
import { Database } from 'better-sqlite3';
import * as auth from '../auth';
import crypto from 'crypto';

export function createIntegrationsRouter(db: Database) {
  const router = Router();

  // Get all integrations for the current user
  router.get('/integrations', auth.authenticateToken, (req, res) => {
    try {
      const userId = (req as any).user.userId;

      const integrations = db.prepare(`
        SELECT * FROM sdk_integrations
        WHERE user_id = ?
        ORDER BY connected_at DESC
      `).all(userId);

      const integrationsFormatted = integrations.map((i: any) => ({
        ...i,
        config: i.config ? JSON.parse(i.config) : {}
      }));

      res.json(integrationsFormatted);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      res.status(500).json({ error: 'Failed to fetch integrations' });
    }
  });

  // Connect an integration
  router.post('/integrations', auth.authenticateToken, (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const { integrationId, config } = req.body;

      if (!integrationId) {
        return res.status(400).json({ error: 'Integration ID is required' });
      }

      // Encrypt sensitive config data (API keys, secrets)
      const encryptedConfig = JSON.stringify(config);

      const result = db.prepare(`
        INSERT INTO sdk_integrations (user_id, name, category, description, status, config, connected_at)
        VALUES (?, ?, ?, ?, 'connected', ?, datetime('now'))
      `).run(
        userId,
        integrationId,
        'other', // You can map integrationId to category
        `${integrationId} integration`,
        encryptedConfig
      );

      const integration = db.prepare('SELECT * FROM sdk_integrations WHERE id = ?').get(result.lastInsertRowid);

      res.status(201).json({
        ...integration,
        config: JSON.parse(integration.config)
      });
    } catch (error) {
      console.error('Error connecting integration:', error);
      res.status(500).json({ error: 'Failed to connect integration' });
    }
  });

  // Disconnect an integration
  router.delete('/integrations/:id', auth.authenticateToken, (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;

      const result = db.prepare(`
        DELETE FROM sdk_integrations
        WHERE id = ? AND user_id = ?
      `).run(id, userId);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Integration not found' });
      }

      res.json({ message: 'Integration disconnected successfully' });
    } catch (error) {
      console.error('Error disconnecting integration:', error);
      res.status(500).json({ error: 'Failed to disconnect integration' });
    }
  });

  // Get all webhooks for the current user
  router.get('/webhooks', auth.authenticateToken, (req, res) => {
    try {
      const userId = (req as any).user.userId;

      const webhooks = db.prepare(`
        SELECT * FROM sdk_webhooks
        WHERE user_id = ?
        ORDER BY created_at DESC
      `).all(userId);

      const webhooksFormatted = webhooks.map((w: any) => ({
        ...w,
        events: w.events ? JSON.parse(w.events) : []
      }));

      res.json(webhooksFormatted);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      res.status(500).json({ error: 'Failed to fetch webhooks' });
    }
  });

  // Create a webhook
  router.post('/webhooks', auth.authenticateToken, (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const { name, url, events, secret } = req.body;

      if (!name || !url || !events || events.length === 0) {
        return res.status(400).json({ error: 'Name, URL, and events are required' });
      }

      const result = db.prepare(`
        INSERT INTO sdk_webhooks (user_id, name, url, events, secret, active, created_at)
        VALUES (?, ?, ?, ?, ?, 1, datetime('now'))
      `).run(userId, name, url, JSON.stringify(events), secret || null);

      const webhook = db.prepare('SELECT * FROM sdk_webhooks WHERE id = ?').get(result.lastInsertRowid);

      res.status(201).json({
        ...webhook,
        events: JSON.parse(webhook.events)
      });
    } catch (error) {
      console.error('Error creating webhook:', error);
=======
// CortexBuild Integrations Routes
// API endpoints for managing third-party integrations

import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import { authenticateToken } from '../auth';
import * as integrations from '../services/integrations';
import * as webhooks from '../services/webhooks';

export const createIntegrationsRouter = (db: Database.Database) => {
  const router = Router();

  // All routes require authentication
  router.use(authenticateToken);

  // ===== INTEGRATIONS =====

  // Get all integrations for current user
  router.get('/list', (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const userIntegrations = integrations.getUserIntegrations(db, user.id);

      // Don't expose credentials
      const sanitized = userIntegrations.map(int => ({
        ...int,
        credentials: undefined,
        hasCredentials: !!int.credentials
      }));

      res.json({
        success: true,
        integrations: sanitized
      });
    } catch (error: any) {
      console.error('Get integrations error:', error);
      res.status(500).json({ error: 'Failed to get integrations' });
    }
  });

  // Get integration by ID
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const integration = integrations.getIntegration(db, parseInt(req.params.id));

      if (!integration || integration.user_id !== user.id) {
        return res.status(404).json({ error: 'Integration not found' });
      }

      // Don't expose credentials
      res.json({
        success: true,
        integration: {
          ...integration,
          credentials: undefined,
          hasCredentials: !!integration.credentials
        }
      });
    } catch (error: any) {
      console.error('Get integration error:', error);
      res.status(500).json({ error: 'Failed to get integration' });
    }
  });

  // Create new integration
  router.post('/', (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { provider, name, credentials, config } = req.body;

      if (!provider || !name || !credentials) {
        return res.status(400).json({ error: 'Provider, name, and credentials are required' });
      }

      const integration = integrations.createIntegration(
        db,
        user.id,
        user.company_id,
        provider,
        name,
        credentials,
        config
      );

      res.json({
        success: true,
        integration: {
          ...integration,
          credentials: undefined
        }
      });
    } catch (error: any) {
      console.error('Create integration error:', error);
      res.status(500).json({ error: 'Failed to create integration' });
    }
  });

  // Update integration status
  router.patch('/:id/status', (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { is_active } = req.body;
      const integration = integrations.getIntegration(db, parseInt(req.params.id));

      if (!integration || integration.user_id !== user.id) {
        return res.status(404).json({ error: 'Integration not found' });
      }

      integrations.updateIntegrationStatus(db, integration.id, is_active);

      res.json({ success: true });
    } catch (error: any) {
      console.error('Update integration status error:', error);
      res.status(500).json({ error: 'Failed to update integration status' });
    }
  });

  // Delete integration
  router.delete('/:id', (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const integration = integrations.getIntegration(db, parseInt(req.params.id));

      if (!integration || integration.user_id !== user.id) {
        return res.status(404).json({ error: 'Integration not found' });
      }

      integrations.deleteIntegration(db, integration.id);

      res.json({ success: true });
    } catch (error: any) {
      console.error('Delete integration error:', error);
      res.status(500).json({ error: 'Failed to delete integration' });
    }
  });

  // Sync integration data
  router.post('/:id/sync', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const integration = integrations.getIntegration(db, parseInt(req.params.id));

      if (!integration || integration.user_id !== user.id) {
        return res.status(404).json({ error: 'Integration not found' });
      }

      const instance = integrations.getIntegrationInstance(db, integration.id);

      // Trigger sync based on provider
      if (integration.provider === integrations.INTEGRATION_PROVIDERS.QUICKBOOKS) {
        await instance.syncInvoices();
        await instance.syncClients();
      } else if (integration.provider === integrations.INTEGRATION_PROVIDERS.GOOGLE_DRIVE) {
        await instance.syncDocuments();
      }

      res.json({ success: true, message: 'Sync started' });
    } catch (error: any) {
      console.error('Sync integration error:', error);
      res.status(500).json({ error: 'Failed to sync integration' });
    }
  });

  // ===== WEBHOOKS =====

  // Get all webhooks for current user
  router.get('/webhooks/list', (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const userWebhooks = webhooks.getUserWebhooks(db, user.id);

      res.json({
        success: true,
        webhooks: userWebhooks
      });
    } catch (error: any) {
      console.error('Get webhooks error:', error);
      res.status(500).json({ error: 'Failed to get webhooks' });
    }
  });

  // Get webhook by ID
  router.get('/webhooks/:id', (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const webhook = webhooks.getWebhook(db, parseInt(req.params.id));

      if (!webhook || webhook.user_id !== user.id) {
        return res.status(404).json({ error: 'Webhook not found' });
      }

      res.json({
        success: true,
        webhook
      });
    } catch (error: any) {
      console.error('Get webhook error:', error);
      res.status(500).json({ error: 'Failed to get webhook' });
    }
  });

  // Create new webhook
  router.post('/webhooks', (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { name, url, events } = req.body;

      if (!name || !url || !events || !Array.isArray(events)) {
        return res.status(400).json({ error: 'Name, URL, and events array are required' });
      }

      const webhook = webhooks.createWebhook(
        db,
        user.id,
        user.company_id,
        name,
        url,
        events
      );

      res.json({
        success: true,
        webhook
      });
    } catch (error: any) {
      console.error('Create webhook error:', error);
>>>>>>> origin/main
      res.status(500).json({ error: 'Failed to create webhook' });
    }
  });

<<<<<<< HEAD
  // Toggle webhook active status
  router.patch('/webhooks/:id/toggle', auth.authenticateToken, (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;
      const { active } = req.body;

      const result = db.prepare(`
        UPDATE sdk_webhooks
        SET active = ?
        WHERE id = ? AND user_id = ?
      `).run(active ? 1 : 0, id, userId);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Webhook not found' });
      }

      res.json({ message: 'Webhook status updated successfully' });
    } catch (error) {
      console.error('Error toggling webhook:', error);
      res.status(500).json({ error: 'Failed to toggle webhook' });
=======
  // Update webhook
  router.patch('/webhooks/:id', (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const webhook = webhooks.getWebhook(db, parseInt(req.params.id));

      if (!webhook || webhook.user_id !== user.id) {
        return res.status(404).json({ error: 'Webhook not found' });
      }

      webhooks.updateWebhook(db, webhook.id, req.body);

      res.json({ success: true });
    } catch (error: any) {
      console.error('Update webhook error:', error);
      res.status(500).json({ error: 'Failed to update webhook' });
>>>>>>> origin/main
    }
  });

  // Delete webhook
<<<<<<< HEAD
  router.delete('/webhooks/:id', auth.authenticateToken, (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;

      const result = db.prepare(`
        DELETE FROM sdk_webhooks
        WHERE id = ? AND user_id = ?
      `).run(id, userId);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Webhook not found' });
      }

      res.json({ message: 'Webhook deleted successfully' });
    } catch (error) {
      console.error('Error deleting webhook:', error);
=======
  router.delete('/webhooks/:id', (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const webhook = webhooks.getWebhook(db, parseInt(req.params.id));

      if (!webhook || webhook.user_id !== user.id) {
        return res.status(404).json({ error: 'Webhook not found' });
      }

      webhooks.deleteWebhook(db, webhook.id);

      res.json({ success: true });
    } catch (error: any) {
      console.error('Delete webhook error:', error);
>>>>>>> origin/main
      res.status(500).json({ error: 'Failed to delete webhook' });
    }
  });

<<<<<<< HEAD
  // Get all API keys for the current user
  router.get('/api-keys', auth.authenticateToken, (req, res) => {
    try {
      const userId = (req as any).user.userId;

      const apiKeys = db.prepare(`
        SELECT id, prefix, created_at, last_used, request_count
        FROM sdk_api_keys
        WHERE user_id = ?
        ORDER BY created_at DESC
      `).all(userId);

      res.json(apiKeys.map((k: any) => ({
        ...k,
        createdAt: k.created_at,
        lastUsed: k.last_used,
        requestCount: k.request_count
      })));
    } catch (error) {
      console.error('Error fetching API keys:', error);
      res.status(500).json({ error: 'Failed to fetch API keys' });
    }
  });

  // Generate a new API key
  router.post('/api-keys', auth.authenticateToken, (req, res) => {
    try {
      const userId = (req as any).user.userId;

      // Generate a secure random API key
      const apiKey = `sk_${crypto.randomBytes(32).toString('hex')}`;
      const prefix = apiKey.substring(0, 12); // Store prefix for display

      // Hash the API key for storage (never store plain text)
      const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');

      const result = db.prepare(`
        INSERT INTO sdk_api_keys (user_id, key_hash, prefix, created_at, request_count)
        VALUES (?, ?, ?, datetime('now'), 0)
      `).run(userId, hashedKey, prefix);

      res.status(201).json({
        id: result.lastInsertRowid,
        key: apiKey, // Only shown once!
        prefix,
        createdAt: new Date().toISOString(),
        requestCount: 0
      });
    } catch (error) {
      console.error('Error generating API key:', error);
      res.status(500).json({ error: 'Failed to generate API key' });
    }
  });

  // Revoke an API key
  router.delete('/api-keys/:id', auth.authenticateToken, (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;

      const result = db.prepare(`
        DELETE FROM sdk_api_keys
        WHERE id = ? AND user_id = ?
      `).run(id, userId);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'API key not found' });
      }

      res.json({ message: 'API key revoked successfully' });
    } catch (error) {
      console.error('Error revoking API key:', error);
      res.status(500).json({ error: 'Failed to revoke API key' });
    }
  });

  return router;
}
=======
  // Test webhook
  router.post('/webhooks/:id/test', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const webhook = webhooks.getWebhook(db, parseInt(req.params.id));

      if (!webhook || webhook.user_id !== user.id) {
        return res.status(404).json({ error: 'Webhook not found' });
      }

      const success = await webhooks.testWebhook(db, webhook.id);

      res.json({
        success: true,
        delivered: success
      });
    } catch (error: any) {
      console.error('Test webhook error:', error);
      res.status(500).json({ error: 'Failed to test webhook' });
    }
  });

  // Get webhook logs
  router.get('/webhooks/:id/logs', (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const webhook = webhooks.getWebhook(db, parseInt(req.params.id));

      if (!webhook || webhook.user_id !== user.id) {
        return res.status(404).json({ error: 'Webhook not found' });
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const logs = webhooks.getWebhookLogs(db, webhook.id, limit);

      res.json({
        success: true,
        logs
      });
    } catch (error: any) {
      console.error('Get webhook logs error:', error);
      res.status(500).json({ error: 'Failed to get webhook logs' });
    }
  });

  // Get available webhook events
  router.get('/webhooks/events/available', (req: Request, res: Response) => {
    res.json({
      success: true,
      events: Object.values(webhooks.WEBHOOK_EVENTS)
    });
  });

  // Get available integration providers
  router.get('/providers/available', (req: Request, res: Response) => {
    res.json({
      success: true,
      providers: Object.entries(integrations.INTEGRATION_PROVIDERS).map(([key, value]) => ({
        id: value,
        name: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
        requiresOAuth: ['quickbooks', 'slack', 'google_drive', 'dropbox'].includes(value)
      }))
    });
  });

  return router;
};
>>>>>>> origin/main
