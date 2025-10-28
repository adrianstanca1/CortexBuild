// CortexBuild Integrations Service
// Handles third-party integrations: QuickBooks, Slack, Google Drive, etc.

import Database from 'better-sqlite3';
import axios from 'axios';
import crypto from 'crypto';

export interface Integration {
  id: number;
  user_id: string;
  company_id: string;
  provider: string;
  name: string;
  credentials: string;
  config?: string;
  is_active: boolean;
  last_sync_at?: string;
  sync_status: string;
  created_at: string;
  updated_at: string;
}

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

// Encryption key for credentials (should be in env)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'cortexbuild-encryption-key-2025-change-this';

/**
 * Encrypt sensitive data
 */
export function encryptData(data: string): string {
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

/**
 * Decrypt sensitive data
 */
export function decryptData(encrypted: string): string {
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Create a new integration
 */
export function createIntegration(
  db: Database.Database,
  userId: string,
  companyId: string,
  provider: string,
  name: string,
  credentials: any,
  config?: any
): Integration {
  const encryptedCreds = encryptData(JSON.stringify(credentials));
  const configStr = config ? JSON.stringify(config) : null;

  const result = db.prepare(`
    INSERT INTO integrations (user_id, company_id, provider, name, credentials, config, is_active, sync_status)
    VALUES (?, ?, ?, ?, ?, ?, 1, 'idle')
  `).run(userId, companyId, provider, name, encryptedCreds, configStr);

  return getIntegration(db, Number(result.lastInsertRowid));
}

/**
 * Get integration by ID
 */
export function getIntegration(db: Database.Database, integrationId: number): Integration {
  return db.prepare('SELECT * FROM integrations WHERE id = ?').get(integrationId) as Integration;
}

/**
 * Get all integrations for a user
 */
export function getUserIntegrations(db: Database.Database, userId: string): Integration[] {
  return db.prepare('SELECT * FROM integrations WHERE user_id = ? ORDER BY created_at DESC').all(userId) as Integration[];
}

/**
 * Get all integrations for a company
 */
export function getCompanyIntegrations(db: Database.Database, companyId: string): Integration[] {
  return db.prepare('SELECT * FROM integrations WHERE company_id = ? ORDER BY created_at DESC').all(companyId) as Integration[];
}

/**
 * Update integration status
 */
export function updateIntegrationStatus(
  db: Database.Database,
  integrationId: number,
  isActive: boolean
): void {
  db.prepare('UPDATE integrations SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(isActive ? 1 : 0, integrationId);
}

/**
 * Update sync status
 */
export function updateSyncStatus(
  db: Database.Database,
  integrationId: number,
  status: string
): void {
  db.prepare('UPDATE integrations SET sync_status = ?, last_sync_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(status, integrationId);
}

/**
 * Delete integration
 */
export function deleteIntegration(db: Database.Database, integrationId: number): void {
  db.prepare('DELETE FROM integrations WHERE id = ?').run(integrationId);
}

/**
 * Store OAuth tokens
 */
export function storeOAuthTokens(
  db: Database.Database,
  integrationId: number,
  accessToken: string,
  refreshToken?: string,
  expiresIn?: number,
  scope?: string
): void {
  const encryptedAccess = encryptData(accessToken);
  const encryptedRefresh = refreshToken ? encryptData(refreshToken) : null;
  const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null;

  // Delete existing tokens
  db.prepare('DELETE FROM oauth_tokens WHERE integration_id = ?').run(integrationId);

  // Insert new tokens
  db.prepare(`
    INSERT INTO oauth_tokens (integration_id, access_token, refresh_token, expires_at, scope)
    VALUES (?, ?, ?, ?, ?)
  `).run(integrationId, encryptedAccess, encryptedRefresh, expiresAt, scope);
}

/**
 * Get OAuth tokens
 */
export function getOAuthTokens(db: Database.Database, integrationId: number): any {
  const tokens = db.prepare('SELECT * FROM oauth_tokens WHERE integration_id = ?').get(integrationId) as any;

  if (!tokens) return null;

  return {
    accessToken: decryptData(tokens.access_token),
    refreshToken: tokens.refresh_token ? decryptData(tokens.refresh_token) : null,
    expiresAt: tokens.expires_at,
    scope: tokens.scope
  };
}

/**
 * QuickBooks Integration
 */
export class QuickBooksIntegration {
  private db: Database.Database;
  private integrationId: number;
  private credentials: any;

  constructor(db: Database.Database, integrationId: number) {
    this.db = db;
    this.integrationId = integrationId;
    const integration = getIntegration(db, integrationId);
    this.credentials = JSON.parse(decryptData(integration.credentials));
  }

  async syncInvoices(): Promise<void> {
    updateSyncStatus(this.db, this.integrationId, 'syncing');
    try {
      // Implementation for QuickBooks invoice sync
      const tokens = getOAuthTokens(this.db, this.integrationId);

      // Make API call to QuickBooks
      // const response = await axios.get('quickbooks-api-url', {
      //   headers: { Authorization: `Bearer ${tokens.accessToken}` }
      // });

      updateSyncStatus(this.db, this.integrationId, 'success');
    } catch (error) {
      console.error('QuickBooks sync error:', error);
      updateSyncStatus(this.db, this.integrationId, 'error');
      throw error;
    }
  }

  async createInvoice(invoiceData: any): Promise<void> {
    const tokens = getOAuthTokens(this.db, this.integrationId);
    // Implementation for creating invoice in QuickBooks
  }

  async syncClients(): Promise<void> {
    const tokens = getOAuthTokens(this.db, this.integrationId);
    // Implementation for syncing clients from QuickBooks
  }
}

/**
 * Slack Integration
 */
export class SlackIntegration {
  private db: Database.Database;
  private integrationId: number;
  private credentials: any;

  constructor(db: Database.Database, integrationId: number) {
    this.db = db;
    this.integrationId = integrationId;
    const integration = getIntegration(db, integrationId);
    this.credentials = JSON.parse(decryptData(integration.credentials));
  }

  async sendMessage(channel: string, message: string): Promise<void> {
    const tokens = getOAuthTokens(this.db, this.integrationId);

    try {
      await axios.post('https://slack.com/api/chat.postMessage', {
        channel,
        text: message
      }, {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Slack message error:', error);
      throw error;
    }
  }

  async notifyProjectUpdate(projectName: string, status: string): Promise<void> {
    const message = `🏗️ Project Update: *${projectName}* status changed to *${status}*`;
    await this.sendMessage(this.credentials.defaultChannel || '#general', message);
  }

  async notifyRFI(rfiNumber: string, subject: string): Promise<void> {
    const message = `📋 New RFI: *${rfiNumber}* - ${subject}`;
    await this.sendMessage(this.credentials.defaultChannel || '#rfis', message);
  }
}

/**
 * Google Drive Integration
 */
export class GoogleDriveIntegration {
  private db: Database.Database;
  private integrationId: number;
  private credentials: any;

  constructor(db: Database.Database, integrationId: number) {
    this.db = db;
    this.integrationId = integrationId;
    const integration = getIntegration(db, integrationId);
    this.credentials = JSON.parse(decryptData(integration.credentials));
  }

  async uploadDocument(fileName: string, fileData: Buffer, folderId?: string): Promise<string> {
    const tokens = getOAuthTokens(this.db, this.integrationId);
    let fileId = 'file-id';

    try {
      // Implementation for Google Drive upload would go here using the tokens and provided data.
      // For now we return a placeholder ID to keep downstream flows working in demos.
      fileId = 'file-id';
    } catch (error) {
      console.error('Google Drive upload error:', error);
      throw error;
    }

    return fileId;
  }

  async syncDocuments(): Promise<void> {
    updateSyncStatus(this.db, this.integrationId, 'syncing');
    try {
      const tokens = getOAuthTokens(this.db, this.integrationId);
      // Implementation for syncing documents from Google Drive
      updateSyncStatus(this.db, this.integrationId, 'success');
    } catch (error) {
      console.error('Google Drive sync error:', error);
      updateSyncStatus(this.db, this.integrationId, 'error');
      throw error;
    }
  }
}

/**
 * Get integration instance by type
 */
export function getIntegrationInstance(db: Database.Database, integrationId: number): any {
  const integration = getIntegration(db, integrationId);

  switch (integration.provider) {
    case INTEGRATION_PROVIDERS.QUICKBOOKS:
      return new QuickBooksIntegration(db, integrationId);
    case INTEGRATION_PROVIDERS.SLACK:
      return new SlackIntegration(db, integrationId);
    case INTEGRATION_PROVIDERS.GOOGLE_DRIVE:
      return new GoogleDriveIntegration(db, integrationId);
    default:
      throw new Error(`Unsupported integration provider: ${integration.provider}`);
  }
}
