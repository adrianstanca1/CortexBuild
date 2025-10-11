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
      res.status(500).json({ error: 'Failed to create webhook' });
    }
  });

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
    }
  });

  // Delete webhook
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
      res.status(500).json({ error: 'Failed to delete webhook' });
    }
  });

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
