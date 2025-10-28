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
      res.status(500).json({ error: 'Failed to create webhook' });
    }
  });

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
    }
  });

  // Delete webhook
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
      res.status(500).json({ error: 'Failed to delete webhook' });
    }
  });

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
