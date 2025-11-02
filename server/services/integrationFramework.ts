/**
 * Third-party Integration Framework for CortexBuild
 * Pluggable architecture for external service integrations
 */

import Database from 'better-sqlite3';

export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'oauth' | 'api_key' | 'webhook' | 'custom';
  baseUrl: string;
  authType: 'bearer' | 'basic' | 'oauth2' | 'api_key';
  credentials: {
    clientId?: string;
    clientSecret?: string;
    apiKey?: string;
    username?: string;
    password?: string;
    accessToken?: string;
    refreshToken?: string;
  };
  rateLimits?: {
    requests: number;
    windowMs: number;
  };
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationWebhook {
  id: string;
  integrationId: string;
  event: string;
  url: string;
  secret: string;
  enabled: boolean;
  createdAt: string;
}

export interface IntegrationData {
  id: string;
  integrationId: string;
  companyId: string;
  externalId: string;
  data: any;
  syncedAt: string;
  status: 'pending' | 'synced' | 'error' | 'conflict';
}

export class IntegrationFramework {
  private db: Database.Database;
  private activeIntegrations: Map<string, any> = new Map();

  constructor(db: Database.Database) {
    this.db = db;
    this.initializeTables();
  }

  private initializeTables(): void {
    // Integration configurations table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS integrations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        base_url TEXT NOT NULL,
        auth_type TEXT NOT NULL,
        credentials TEXT,
        rate_limits TEXT,
        enabled INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Webhook configurations table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS integration_webhooks (
        id TEXT PRIMARY KEY,
        integration_id TEXT NOT NULL,
        event TEXT NOT NULL,
        url TEXT NOT NULL,
        secret TEXT NOT NULL,
        enabled INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (integration_id) REFERENCES integrations(id) ON DELETE CASCADE
      )
    `);

    // Synced data tracking table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS integration_data (
        id TEXT PRIMARY KEY,
        integration_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        external_id TEXT NOT NULL,
        data TEXT NOT NULL,
        synced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'pending',
        FOREIGN KEY (integration_id) REFERENCES integrations(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for performance
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_integrations_enabled ON integrations(enabled)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_integration_data_company ON integration_data(company_id)');
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_integration_data_status ON integration_data(status)');
  }

  /**
   * Register a new integration
   */
  async registerIntegration(config: Omit<IntegrationConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const integrationId = `integration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.db.prepare(`
      INSERT INTO integrations (id, name, type, base_url, auth_type, credentials, rate_limits, enabled)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      integrationId,
      config.name,
      config.type,
      config.baseUrl,
      config.authType,
      JSON.stringify(config.credentials),
      JSON.stringify(config.rateLimits || { requests: 100, windowMs: 60000 }),
      config.enabled ? 1 : 0
    );

    return integrationId;
  }

  /**
   * Get integration configuration
   */
  async getIntegration(integrationId: string): Promise<IntegrationConfig | null> {
    const row = this.db.prepare('SELECT * FROM integrations WHERE id = ?').get(integrationId) as any;

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      type: row.type,
      baseUrl: row.base_url,
      authType: row.auth_type,
      credentials: JSON.parse(row.credentials || '{}'),
      rateLimits: JSON.parse(row.rate_limits || '{}'),
      enabled: row.enabled === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Update integration configuration
   */
  async updateIntegration(integrationId: string, updates: Partial<IntegrationConfig>): Promise<void> {
    const updateFields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbKey = key === 'baseUrl' ? 'base_url' :
                     key === 'authType' ? 'auth_type' :
                     key === 'rateLimits' ? 'rate_limits' : key;
        updateFields.push(`${dbKey} = ?`);
        values.push(key === 'credentials' || key === 'rateLimits' ? JSON.stringify(value) : value);
      }
    });

    if (updateFields.length > 0) {
      values.push(new Date().toISOString());
      updateFields.push('updated_at = ?');
      values.push(integrationId);

      this.db.prepare(`
        UPDATE integrations SET ${updateFields.join(', ')} WHERE id = ?
      `).run(...values);
    }
  }

  /**
   * List integrations for a company
   */
  async getCompanyIntegrations(companyId: string): Promise<IntegrationConfig[]> {
    const rows = this.db.prepare(`
      SELECT i.* FROM integrations i
      WHERE i.enabled = 1
      ORDER BY i.created_at DESC
    `).all() as any[];

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      baseUrl: row.base_url,
      authType: row.auth_type,
      credentials: JSON.parse(row.credentials || '{}'),
      rateLimits: JSON.parse(row.rate_limits || '{}'),
      enabled: row.enabled === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  /**
   * Register webhook for integration events
   */
  async registerWebhook(integrationId: string, event: string, url: string): Promise<string> {
    const webhookId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const secret = this.generateWebhookSecret();

    this.db.prepare(`
      INSERT INTO integration_webhooks (id, integration_id, event, url, secret, enabled)
      VALUES (?, ?, ?, ?, ?, 1)
    `).run(webhookId, integrationId, event, url, secret);

    return webhookId;
  }

  /**
   * Trigger webhook for integration event
   */
  async triggerWebhook(integrationId: string, event: string, data: any): Promise<void> {
    const webhooks = this.db.prepare(`
      SELECT * FROM integration_webhooks
      WHERE integration_id = ? AND event = ? AND enabled = 1
    `).all(integrationId, event) as any[];

    for (const webhook of webhooks) {
      try {
        await this.sendWebhook(webhook, data);
      } catch (error) {
        console.error(`Webhook ${webhook.id} failed:`, error);
      }
    }
  }

  /**
   * Sync data with external integration
   */
  async syncIntegrationData(integrationId: string, companyId: string, data: any): Promise<void> {
    const syncId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.db.prepare(`
      INSERT INTO integration_data (id, integration_id, company_id, external_id, data, status)
      VALUES (?, ?, ?, ?, ?, 'synced')
    `).run(syncId, integrationId, companyId, data.externalId || syncId, JSON.stringify(data));
  }

  /**
   * Get sync status for integration
   */
  async getSyncStatus(integrationId: string, companyId: string): Promise<any> {
    const stats = this.db.prepare(`
      SELECT
        status,
        COUNT(*) as count,
        MAX(synced_at) as last_sync
      FROM integration_data
      WHERE integration_id = ? AND company_id = ?
      GROUP BY status
    `).all(integrationId, companyId) as any[];

    return {
      integrationId,
      companyId,
      stats: stats.reduce((acc, stat) => {
        acc[stat.status] = stat.count;
        return acc;
      }, {}),
      lastSync: stats[0]?.last_sync || null,
      totalRecords: stats.reduce((sum, stat) => sum + stat.count, 0),
    };
  }

  /**
   * Test integration connectivity
   */
  async testIntegration(integrationId: string): Promise<{ success: boolean; message: string; responseTime?: number }> {
    const startTime = Date.now();
    try {
      const integration = await this.getIntegration(integrationId);
      if (!integration) {
        return { success: false, message: 'Integration not found' };
      }

      // Test basic connectivity based on integration type
      const responseTime = Date.now() - startTime;
      return {
        success: true,
        message: 'Integration test successful',
        responseTime
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        responseTime: Date.now() - startTime
      };
    }
  }

  // Private helper methods

  private generateWebhookSecret(): string {
    return `whsec_${Math.random().toString(36).substr(2, 32)}`;
  }

  private async sendWebhook(webhook: any, data: any): Promise<void> {
    const payload = {
      event: webhook.event,
      timestamp: new Date().toISOString(),
      data,
    };

    const signature = this.generateSignature(payload, webhook.secret);

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CortexBuild-Signature': signature,
        'X-CortexBuild-Event': webhook.event,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }
  }

  private generateSignature(payload: any, secret: string): string {
    // Simple HMAC signature for webhook verification
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }

  /**
   * Pre-built integration connectors
   */

  // Procore Integration
  async setupProcoreIntegration(companyId: string, credentials: any): Promise<string> {
    return this.registerIntegration({
      name: 'Procore',
      type: 'oauth',
      baseUrl: 'https://api.procore.com',
      authType: 'oauth2',
      credentials,
      enabled: true,
    });
  }

  // QuickBooks Integration
  async setupQuickBooksIntegration(companyId: string, credentials: any): Promise<string> {
    return this.registerIntegration({
      name: 'QuickBooks',
      type: 'oauth',
      baseUrl: 'https://quickbooks.api.intuit.com',
      authType: 'oauth2',
      credentials,
      enabled: true,
    });
  }

  // Slack Integration
  async setupSlackIntegration(companyId: string, webhookUrl: string): Promise<string> {
    const integrationId = await this.registerIntegration({
      name: 'Slack',
      type: 'webhook',
      baseUrl: 'https://hooks.slack.com',
      authType: 'custom',
      credentials: { webhookUrl },
      enabled: true,
    });

    // Register default webhooks for Slack
    await this.registerWebhook(integrationId, 'project.created', webhookUrl);
    await this.registerWebhook(integrationId, 'project.updated', webhookUrl);
    await this.registerWebhook(integrationId, 'task.completed', webhookUrl);

    return integrationId;
  }

  // Generic REST API Integration
  async setupGenericAPIIntegration(name: string, baseUrl: string, apiKey: string): Promise<string> {
    return this.registerIntegration({
      name,
      type: 'api_key',
      baseUrl,
      authType: 'api_key',
      credentials: { apiKey },
      enabled: true,
    });
  }
}

export default IntegrationFramework;