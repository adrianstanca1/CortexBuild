// CortexBuild Integrations Routes
// Version: 2.0.0 - Supabase Migration
// API endpoints for managing third-party integrations
// Last Updated: 2025-10-31

import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { authenticateToken } from '../auth-supabase';
import crypto from 'crypto';
import axios from 'axios';

// Supported integration providers
export const INTEGRATION_PROVIDERS = {
  QUICKBOOKS: 'quickbooks',
  SLACK: 'slack',
  GOOGLE_DRIVE: 'google_drive',
  DROPBOX: 'dropbox',
  XERO: 'xero',
  STRIPE: 'stripe',
  MAILCHIMP: 'mailchimp',
  ZAPIER: 'zapier',
  GITHUB: 'github',
  JIRA: 'jira'
};

// Webhook events
export const WEBHOOK_EVENTS = {
  PROJECT_CREATED: 'project.created',
  PROJECT_UPDATED: 'project.updated',
  PROJECT_DELETED: 'project.deleted',
  PROJECT_STATUS_CHANGED: 'project.status_changed',
  TASK_CREATED: 'task.created',
  TASK_UPDATED: 'task.updated',
  TASK_DELETED: 'task.deleted',
  TASK_COMPLETED: 'task.completed',
  RFI_CREATED: 'rfi.created',
  RFI_ANSWERED: 'rfi.answered',
  RFI_CLOSED: 'rfi.closed',
  INVOICE_CREATED: 'invoice.created',
  INVOICE_SENT: 'invoice.sent',
  INVOICE_PAID: 'invoice.paid',
  INVOICE_OVERDUE: 'invoice.overdue',
  CLIENT_CREATED: 'client.created',
  CLIENT_UPDATED: 'client.updated',
  DOCUMENT_UPLOADED: 'document.uploaded',
  DOCUMENT_SHARED: 'document.shared',
  TIME_ENTRY_CREATED: 'time_entry.created',
  TIME_ENTRY_APPROVED: 'time_entry.approved',
  PO_CREATED: 'purchase_order.created',
  PO_APPROVED: 'purchase_order.approved',
  PO_RECEIVED: 'purchase_order.received'
};

// Encryption key for credentials (should be in env)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'cortexbuild-encryption-key-2025-change-this';

/**
 * Encrypt sensitive data
 */
function encryptData(data: string): string {
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

/**
 * Decrypt sensitive data
 */
function decryptData(encrypted: string): string {
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export const createIntegrationsRouter = (supabase: SupabaseClient) => {
  const router = Router();

  // All routes require authentication
  router.use(authenticateToken);

  // ===== INTEGRATIONS =====

  // GET /api/integrations/list - Get all integrations for current user
  router.get('/list', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      const { data: userIntegrations, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Don't expose credentials
      const sanitized = (userIntegrations || []).map((int: any) => ({
        ...int,
        credentials: undefined,
        hasCredentials: !!int.credentials,
        is_active: int.is_active === true || int.is_active === 1,
        events: int.events ? (typeof int.events === 'string' ? JSON.parse(int.events) : int.events) : []
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

  // GET /api/integrations/:id - Get integration by ID
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const { data: integration, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('id', parseInt(id))
        .eq('user_id', user.id)
        .single();

      if (error || !integration) {
        return res.status(404).json({ error: 'Integration not found' });
      }

      // Don't expose credentials
      res.json({
        success: true,
        integration: {
          ...integration,
          credentials: undefined,
          hasCredentials: !!integration.credentials,
          is_active: integration.is_active === true || integration.is_active === 1,
          events: integration.events ? (typeof integration.events === 'string' ? JSON.parse(integration.events) : integration.events) : []
        }
      });
    } catch (error: any) {
      console.error('Get integration error:', error);
      res.status(500).json({ error: 'Failed to get integration' });
    }
  });

  // POST /api/integrations - Create new integration
  router.post('/', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { provider, name, credentials, config } = req.body;

      if (!provider || !name || !credentials) {
        return res.status(400).json({ error: 'Provider, name, and credentials are required' });
      }

      const encryptedCreds = encryptData(JSON.stringify(credentials));
      const configStr = config ? JSON.stringify(config) : null;

      const { data: integration, error } = await supabase
        .from('integrations')
        .insert({
          user_id: user.id,
          company_id: user.company_id || user.companyId || null,
          provider,
          name,
          credentials: encryptedCreds,
          config: configStr,
          is_active: true,
          sync_status: 'idle'
        })
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        integration: {
          ...integration,
          credentials: undefined,
          hasCredentials: true,
          is_active: true
        }
      });
    } catch (error: any) {
      console.error('Create integration error:', error);
      res.status(500).json({ error: 'Failed to create integration' });
    }
  });

  // PATCH /api/integrations/:id/status - Update integration status
  router.patch('/:id/status', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const { is_active } = req.body;

      const { data: integration } = await supabase
        .from('integrations')
        .select('id')
        .eq('id', parseInt(id))
        .eq('user_id', user.id)
        .single();

      if (!integration) {
        return res.status(404).json({ error: 'Integration not found' });
      }

      const { error } = await supabase
        .from('integrations')
        .update({ is_active: is_active === true || is_active === 1 })
        .eq('id', parseInt(id));

      if (error) throw error;

      res.json({ success: true });
    } catch (error: any) {
      console.error('Update integration status error:', error);
      res.status(500).json({ error: 'Failed to update integration status' });
    }
  });

  // DELETE /api/integrations/:id - Delete integration
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const { data: integration } = await supabase
        .from('integrations')
        .select('id')
        .eq('id', parseInt(id))
        .eq('user_id', user.id)
        .single();

      if (!integration) {
        return res.status(404).json({ error: 'Integration not found' });
      }

      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('id', parseInt(id));

      if (error) throw error;

      res.json({ success: true });
    } catch (error: any) {
      console.error('Delete integration error:', error);
      res.status(500).json({ error: 'Failed to delete integration' });
    }
  });

  // POST /api/integrations/:id/sync - Sync integration data
  router.post('/:id/sync', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const { data: integration } = await supabase
        .from('integrations')
        .select('*')
        .eq('id', parseInt(id))
        .eq('user_id', user.id)
        .single();

      if (!integration) {
        return res.status(404).json({ error: 'Integration not found' });
      }

      // Update sync status to syncing
      await supabase
        .from('integrations')
        .update({
          sync_status: 'syncing',
          last_sync_at: new Date().toISOString()
        })
        .eq('id', parseInt(id));

      // In a real implementation, this would sync based on provider
      // For now, simulate sync
      setTimeout(async () => {
        await supabase
          .from('integrations')
          .update({
            sync_status: 'success',
            last_sync_at: new Date().toISOString()
          })
          .eq('id', parseInt(id));
      }, 1000);

      res.json({ success: true, message: 'Sync started' });
    } catch (error: any) {
      console.error('Sync integration error:', error);
      res.status(500).json({ error: 'Failed to sync integration' });
    }
  });

  // ===== WEBHOOKS =====

  // GET /api/integrations/webhooks/list - Get all webhooks for current user
  router.get('/webhooks/list', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      const { data: userWebhooks, error } = await supabase
        .from('webhooks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformed = (userWebhooks || []).map((w: any) => ({
        ...w,
        events: w.events ? (typeof w.events === 'string' ? JSON.parse(w.events) : w.events) : [],
        is_active: w.is_active === true || w.is_active === 1
      }));

      res.json({
        success: true,
        webhooks: transformed
      });
    } catch (error: any) {
      console.error('Get webhooks error:', error);
      res.status(500).json({ error: 'Failed to get webhooks' });
    }
  });

  // GET /api/integrations/webhooks/:id - Get webhook by ID
  router.get('/webhooks/:id', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const { data: webhook, error } = await supabase
        .from('webhooks')
        .select('*')
        .eq('id', parseInt(id))
        .eq('user_id', user.id)
        .single();

      if (error || !webhook) {
        return res.status(404).json({ error: 'Webhook not found' });
      }

      res.json({
        success: true,
        webhook: {
          ...webhook,
          events: webhook.events ? (typeof webhook.events === 'string' ? JSON.parse(webhook.events) : webhook.events) : [],
          is_active: webhook.is_active === true || webhook.is_active === 1
        }
      });
    } catch (error: any) {
      console.error('Get webhook error:', error);
      res.status(500).json({ error: 'Failed to get webhook' });
    }
  });

  // POST /api/integrations/webhooks - Create new webhook
  router.post('/webhooks', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { name, url, events } = req.body;

      if (!name || !url || !events || !Array.isArray(events)) {
        return res.status(400).json({ error: 'Name, URL, and events array are required' });
      }

      // Generate webhook secret
      const secret = crypto.randomBytes(32).toString('hex');

      const { data: webhook, error } = await supabase
        .from('webhooks')
        .insert({
          user_id: user.id,
          company_id: user.company_id || user.companyId || null,
          name,
          url,
          events: JSON.stringify(events),
          secret,
          is_active: true,
          success_count: 0,
          failure_count: 0
        })
        .select()
        .single();

      if (error) throw error;

      res.json({
        success: true,
        webhook: {
          ...webhook,
          events: Array.isArray(webhook.events) ? webhook.events : JSON.parse(webhook.events),
          is_active: true
        }
      });
    } catch (error: any) {
      console.error('Create webhook error:', error);
      res.status(500).json({ error: 'Failed to create webhook' });
    }
  });

  // PATCH /api/integrations/webhooks/:id - Update webhook
  router.patch('/webhooks/:id', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const { data: webhook } = await supabase
        .from('webhooks')
        .select('id')
        .eq('id', parseInt(id))
        .eq('user_id', user.id)
        .single();

      if (!webhook) {
        return res.status(404).json({ error: 'Webhook not found' });
      }

      const updates: any = {};
      if (req.body.name !== undefined) updates.name = req.body.name;
      if (req.body.url !== undefined) updates.url = req.body.url;
      if (req.body.events !== undefined) {
        updates.events = Array.isArray(req.body.events) 
          ? JSON.stringify(req.body.events) 
          : req.body.events;
      }
      if (req.body.is_active !== undefined) {
        updates.is_active = req.body.is_active === true || req.body.is_active === 1;
      }

      const { error } = await supabase
        .from('webhooks')
        .update(updates)
        .eq('id', parseInt(id));

      if (error) throw error;

      res.json({ success: true });
    } catch (error: any) {
      console.error('Update webhook error:', error);
      res.status(500).json({ error: 'Failed to update webhook' });
    }
  });

  // DELETE /api/integrations/webhooks/:id - Delete webhook
  router.delete('/webhooks/:id', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const { data: webhook } = await supabase
        .from('webhooks')
        .select('id')
        .eq('id', parseInt(id))
        .eq('user_id', user.id)
        .single();

      if (!webhook) {
        return res.status(404).json({ error: 'Webhook not found' });
      }

      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', parseInt(id));

      if (error) throw error;

      res.json({ success: true });
    } catch (error: any) {
      console.error('Delete webhook error:', error);
      res.status(500).json({ error: 'Failed to delete webhook' });
    }
  });

  // POST /api/integrations/webhooks/:id/test - Test webhook
  router.post('/webhooks/:id/test', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const { data: webhook } = await supabase
        .from('webhooks')
        .select('*')
        .eq('id', parseInt(id))
        .eq('user_id', user.id)
        .single();

      if (!webhook) {
        return res.status(404).json({ error: 'Webhook not found' });
      }

      // Test webhook delivery
      const testPayload = {
        event: 'webhook.test',
        timestamp: new Date().toISOString(),
        data: { test: true }
      };

      const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(JSON.stringify(testPayload))
        .digest('hex');

      try {
        await axios.post(webhook.url, testPayload, {
          headers: {
            'X-Webhook-Signature': signature,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        });

        // Update success count
        await supabase
          .from('webhooks')
          .update({
            success_count: (webhook.success_count || 0) + 1,
            last_triggered_at: new Date().toISOString()
          })
          .eq('id', parseInt(id));

        res.json({ success: true, delivered: true });
      } catch (error: any) {
        // Update failure count
        await supabase
          .from('webhooks')
          .update({
            failure_count: (webhook.failure_count || 0) + 1,
            last_triggered_at: new Date().toISOString()
          })
          .eq('id', parseInt(id));

        res.json({ success: true, delivered: false, error: error.message });
      }
    } catch (error: any) {
      console.error('Test webhook error:', error);
      res.status(500).json({ error: 'Failed to test webhook' });
    }
  });

  // GET /api/integrations/webhooks/:id/logs - Get webhook logs
  router.get('/webhooks/:id/logs', async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;

      const { data: webhook } = await supabase
        .from('webhooks')
        .select('id')
        .eq('id', parseInt(id))
        .eq('user_id', user.id)
        .single();

      if (!webhook) {
        return res.status(404).json({ error: 'Webhook not found' });
      }

      const { data: logs, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .eq('webhook_id', parseInt(id))
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      res.json({
        success: true,
        logs: logs || []
      });
    } catch (error: any) {
      console.error('Get webhook logs error:', error);
      res.status(500).json({ error: 'Failed to get webhook logs' });
    }
  });

  // GET /api/integrations/webhooks/events/available - Get available webhook events
  router.get('/webhooks/events/available', (_req: Request, res: Response) => {
    res.json({
      success: true,
      events: Object.values(WEBHOOK_EVENTS)
    });
  });

  // GET /api/integrations/providers/available - Get available integration providers
  router.get('/providers/available', (_req: Request, res: Response) => {
    res.json({
      success: true,
      providers: Object.entries(INTEGRATION_PROVIDERS).map(([key, value]) => ({
        id: value,
        name: key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase()),
        requiresOAuth: ['quickbooks', 'slack', 'google_drive', 'dropbox'].includes(value)
      }))
    });
  });

  return router;
};
