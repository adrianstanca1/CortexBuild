import { Request, Response } from 'express';
import { Database } from '../database.js';
import axios, { AxiosResponse } from 'axios';
import crypto from 'crypto';
import { QueryResult } from 'mysql2';

export interface IntegrationConfig {
  id: string;
  name: string;
  type: 'accounting' | 'crm' | 'project_management' | 'hr' | 'inventory' | 'custom';
  provider: string;
  endpoint: string;
  authType: 'api_key' | 'oauth2' | 'basic' | 'bearer';
  credentials: any;
  isActive: boolean;
  syncDirection: 'import' | 'export' | 'bidirectional';
  entityMappings: EntityMapping[];
  syncSchedule?: string;
  lastSync?: Date;
  tenantId: string;
}

export interface EntityMapping {
  localEntity: string;
  remoteEntity: string;
  fieldMappings: FieldMapping[];
  transformRules?: TransformRule[];
}

export interface FieldMapping {
  localField: string;
  remoteField: string;
  direction: 'import' | 'export' | 'bidirectional';
  required: boolean;
  defaultValue?: any;
}

export interface TransformRule {
  field: string;
  type: 'format' | 'calculate' | 'lookup' | 'conditional';
  config: any;
}

export interface SyncResult {
  id: string;
  integrationId: string;
  operation: 'import' | 'export';
  entity: string;
  recordsProcessed: number;
  recordsSuccess: number;
  recordsError: number;
  errors: SyncError[];
  startedAt: Date;
  completedAt: Date;
  tenantId: string;
}

export interface SyncError {
  recordId: string;
  error: string;
  field?: string;
}

export class IntegrationService {
  private db: Database;
  private webhookSecret: string;

  constructor(db: Database) {
    this.db = db;
    this.webhookSecret = process.env.WEBHOOK_SECRET || crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create integration configuration
   */
  async createIntegration(config: Omit<IntegrationConfig, 'id'>): Promise<string> {
    const id = crypto.randomUUID();

    // Encrypt credentials
    const encryptedCredentials = this.encryptCredentials(config.credentials);

    await this.db.executeQuery(`
      INSERT INTO integrations
      (id, name, type, provider, endpoint, auth_type, credentials, is_active,
       sync_direction, entity_mappings, sync_schedule, tenant_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      id,
      config.name,
      config.type,
      config.provider,
      config.endpoint,
      config.authType,
      encryptedCredentials,
      config.isActive,
      config.syncDirection,
      JSON.stringify(config.entityMappings),
      config.syncSchedule,
      config.tenantId
    ]);

    return id;
  }

  /**
   * Test integration connection
   */
  async testConnection(integrationId: string, tenantId: string): Promise<{ success: boolean; message: string }> {
    const integration = await this.getIntegration(integrationId, tenantId);
    if (!integration) {
      return { success: false, message: 'Integration not found' };
    }

    try {
      const headers = await this.buildHeaders(integration);
      const response = await axios.get(integration.endpoint, { 
        headers,
        timeout: 10000
      });

      return { 
        success: response.status === 200,
        message: `Connection successful (${response.status})`
      };
    } catch (error: any) {
      return { 
        success: false,
        message: `Connection failed: ${error.message}`
      };
    }
  }

  /**
   * Sync data with external system
   */
  async syncData(integrationId: string, entity: string, operation: 'import' | 'export', tenantId: string): Promise<string> {
    const syncId = crypto.randomUUID();
    const startTime = new Date();

    try {
      const integration = await this.getIntegration(integrationId, tenantId);
      if (!integration) {
        throw new Error('Integration not found');
      }

      const entityMapping = integration.entityMappings.find(m => m.localEntity === entity);
      if (!entityMapping) {
        throw new Error(`Entity mapping not found for ${entity}`);
      }

      // Create sync record
      await this.db.executeQuery(`
        INSERT INTO sync_results
        (id, integration_id, operation, entity, records_processed, records_success, 
         records_error, errors, started_at, tenant_id)
        VALUES (?, ?, ?, ?, 0, 0, 0, '[]', ?, ?)
      `, [syncId, integrationId, operation, entity, startTime, tenantId]);

      // Perform sync operation
      const result = operation === 'import' 
        ? await this.importData(integration, entityMapping, tenantId)
        : await this.exportData(integration, entityMapping, tenantId);

      // Update sync record
      await this.db.executeQuery(`
        UPDATE sync_results
        SET records_processed = ?, records_success = ?, records_error = ?,
            errors = ?, completed_at = NOW()
        WHERE id = ?
      `, [
        result.recordsProcessed,
        result.recordsSuccess,
        result.recordsError,
        JSON.stringify(result.errors),
        syncId
      ]);

      return syncId;
    } catch (error) {
      console.error('Sync error:', error);
      
      await this.db.executeQuery(`
        UPDATE sync_results
        SET records_error = 1, errors = ?, completed_at = NOW()
        WHERE id = ?
      `, [JSON.stringify([{ recordId: 'sync', error: String(error) }]), syncId]);

      throw error;
    }
  }

  /**
   * Import data from external system
   */
  private async importData(
    integration: IntegrationConfig,
    entityMapping: EntityMapping,
    tenantId: string
  ): Promise<Omit<SyncResult, 'id' | 'integrationId' | 'startedAt' | 'completedAt' | 'tenantId'>> {
    const headers = await this.buildHeaders(integration);
    const endpoint = `${integration.endpoint}/${entityMapping.remoteEntity}`;
    
    let recordsProcessed = 0;
    let recordsSuccess = 0;
    let recordsError = 0;
    const errors: SyncError[] = [];

    try {
      const response: AxiosResponse = await axios.get(endpoint, { headers });
      const remoteData = Array.isArray(response.data) ? response.data : response.data.data || [];

      for (const remoteRecord of remoteData) {
        recordsProcessed++;
        
        try {
          const localRecord = this.transformRemoteToLocal(remoteRecord, entityMapping);
          await this.saveLocalRecord(entityMapping.localEntity, localRecord, tenantId);
          recordsSuccess++;
        } catch (error) {
          recordsError++;
          errors.push({
            recordId: remoteRecord.id || `record_${recordsProcessed}`,
            error: String(error)
          });
        }
      }
    } catch (error) {
      recordsError++;
      errors.push({
        recordId: 'import',
        error: `Failed to fetch data: ${error}`
      });
    }

    return {
      operation: 'import',
      entity: entityMapping.localEntity,
      recordsProcessed,
      recordsSuccess,
      recordsError,
      errors
    };
  }

  /**
   * Export data to external system
   */
  private async exportData(
    integration: IntegrationConfig,
    entityMapping: EntityMapping,
    tenantId: string
  ): Promise<Omit<SyncResult, 'id' | 'integrationId' | 'startedAt' | 'completedAt' | 'tenantId'>> {
    const headers = await this.buildHeaders(integration);
    const endpoint = `${integration.endpoint}/${entityMapping.remoteEntity}`;
    
    let recordsProcessed = 0;
    let recordsSuccess = 0;
    let recordsError = 0;
    const errors: SyncError[] = [];

    try {
      const localData = await this.getLocalRecords(entityMapping.localEntity, tenantId);

      for (const localRecord of localData) {
        recordsProcessed++;
        
        try {
          const remoteRecord = this.transformLocalToRemote(localRecord, entityMapping);
          
          if (localRecord.external_id) {
            // Update existing record
            await axios.put(`${endpoint}/${localRecord.external_id}`, remoteRecord, { headers });
          } else {
            // Create new record
            const response = await axios.post(endpoint, remoteRecord, { headers });
            
            // Store external ID for future updates
            await this.updateExternalId(
              entityMapping.localEntity,
              localRecord.id,
              response.data.id,
              tenantId
            );
          }
          
          recordsSuccess++;
        } catch (error) {
          recordsError++;
          errors.push({
            recordId: localRecord.id,
            error: String(error)
          });
        }
      }
    } catch (error) {
      recordsError++;
      errors.push({
        recordId: 'export',
        error: `Failed to export data: ${error}`
      });
    }

    return {
      operation: 'export',
      entity: entityMapping.localEntity,
      recordsProcessed,
      recordsSuccess,
      recordsError,
      errors
    };
  }

  /**
   * Handle incoming webhooks
   */
  async handleWebhook(integrationId: string, payload: any, signature: string): Promise<void> {
    // Verify webhook signature
    if (!this.verifyWebhookSignature(payload, signature)) {
      throw new Error('Invalid webhook signature');
    }

    const integration = await this.getIntegrationByWebhook(integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }

    // Process webhook based on event type
    const eventType = payload.event_type || payload.type;
    
    switch (eventType) {
      case 'record.created':
      case 'record.updated':
        await this.processRecordWebhook(integration, payload, 'import');
        break;
      case 'record.deleted':
        await this.processDeleteWebhook(integration, payload);
        break;
      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }
  }

  /**
   * Process record webhook (create/update)
   */
  private async processRecordWebhook(
    integration: IntegrationConfig,
    payload: any,
    operation: 'import' | 'export'
  ): Promise<void> {
    const entityType = payload.entity_type || payload.object_type;
    const entityMapping = integration.entityMappings.find(m => m.remoteEntity === entityType);
    
    if (!entityMapping) {
      console.log(`No mapping found for entity type: ${entityType}`);
      return;
    }

    try {
      if (operation === 'import') {
        const localRecord = this.transformRemoteToLocal(payload.data, entityMapping);
        await this.saveLocalRecord(entityMapping.localEntity, localRecord, integration.tenantId);
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
    }
  }

  /**
   * Process delete webhook
   */
  private async processDeleteWebhook(integration: IntegrationConfig, payload: any): Promise<void> {
    const entityType = payload.entity_type || payload.object_type;
    const entityMapping = integration.entityMappings.find(m => m.remoteEntity === entityType);
    
    if (!entityMapping) {
      return;
    }

    const externalId = payload.data?.id || payload.id;
    if (externalId) {
      await this.deleteLocalRecordByExternalId(
        entityMapping.localEntity,
        externalId,
        integration.tenantId
      );
    }
  }

  /**
   * Transform remote record to local format
   */
  private transformRemoteToLocal(remoteRecord: any, entityMapping: EntityMapping): any {
    const localRecord: any = {};

    for (const fieldMapping of entityMapping.fieldMappings) {
      if (fieldMapping.direction === 'export') continue;

      let value = remoteRecord[fieldMapping.remoteField];
      
      if (value === undefined && fieldMapping.defaultValue !== undefined) {
        value = fieldMapping.defaultValue;
      }

      if (value !== undefined) {
        localRecord[fieldMapping.localField] = this.applyTransformRules(
          value,
          fieldMapping.localField,
          entityMapping.transformRules || []
        );
      }
    }

    // Store external ID for future reference
    localRecord.external_id = remoteRecord.id;
    
    return localRecord;
  }

  /**
   * Transform local record to remote format
   */
  private transformLocalToRemote(localRecord: any, entityMapping: EntityMapping): any {
    const remoteRecord: any = {};

    for (const fieldMapping of entityMapping.fieldMappings) {
      if (fieldMapping.direction === 'import') continue;

      let value = localRecord[fieldMapping.localField];
      
      if (value === undefined && fieldMapping.defaultValue !== undefined) {
        value = fieldMapping.defaultValue;
      }

      if (value !== undefined) {
        remoteRecord[fieldMapping.remoteField] = this.applyTransformRules(
          value,
          fieldMapping.remoteField,
          entityMapping.transformRules || []
        );
      }
    }
    
    return remoteRecord;
  }

  /**
   * Apply transformation rules to field values
   */
  private applyTransformRules(value: any, field: string, rules: TransformRule[]): any {
    const fieldRules = rules.filter(rule => rule.field === field);
    
    for (const rule of fieldRules) {
      switch (rule.type) {
        case 'format':
          value = this.applyFormatRule(value, rule.config);
          break;
        case 'calculate':
          value = this.applyCalculateRule(value, rule.config);
          break;
        case 'lookup':
          value = this.applyLookupRule(value, rule.config);
          break;
        case 'conditional':
          value = this.applyConditionalRule(value, rule.config);
          break;
      }
    }
    
    return value;
  }

  /**
   * Apply format transformation rule
   */
  private applyFormatRule(value: any, config: any): any {
    switch (config.type) {
      case 'date':
        return new Date(value).toISOString().split('T')[0];
      case 'currency':
        return parseFloat(value).toFixed(2);
      case 'uppercase':
        return String(value).toUpperCase();
      case 'lowercase':
        return String(value).toLowerCase();
      default:
        return value;
    }
  }

  /**
   * Apply calculation transformation rule
   */
  private applyCalculateRule(value: any, config: any): any {
    const numValue = parseFloat(value);
    
    switch (config.operation) {
      case 'multiply':
        return numValue * config.factor;
      case 'divide':
        return numValue / config.factor;
      case 'add':
        return numValue + config.value;
      case 'subtract':
        return numValue - config.value;
      default:
        return value;
    }
  }

  /**
   * Apply lookup transformation rule
   */
  private applyLookupRule(value: any, config: any): any {
    const mapping = config.mappings || {};
    return mapping[value] || config.defaultValue || value;
  }

  /**
   * Apply conditional transformation rule
   */
  private applyConditionalRule(value: any, config: any): any {
    const condition = config.condition;
    
    switch (condition.operator) {
      case 'equals':
        return value === condition.value ? config.trueValue : config.falseValue;
      case 'greater_than':
        return parseFloat(value) > parseFloat(condition.value) ? config.trueValue : config.falseValue;
      case 'less_than':
        return parseFloat(value) < parseFloat(condition.value) ? config.trueValue : config.falseValue;
      default:
        return value;
    }
  }

  /**
   * Build authentication headers
   */
  private async buildHeaders(integration: IntegrationConfig): Promise<any> {
    const credentials = this.decryptCredentials(integration.credentials);
    const headers: any = {
      'Content-Type': 'application/json'
    };

    switch (integration.authType) {
      case 'api_key':
        headers[credentials.headerName || 'X-API-Key'] = credentials.apiKey;
        break;
      case 'bearer':
        headers['Authorization'] = `Bearer ${credentials.token}`;
        break;
      case 'basic':
        const auth = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
        headers['Authorization'] = `Basic ${auth}`;
        break;
      case 'oauth2':
        // Handle OAuth2 token refresh if needed
        const token = await this.refreshOAuth2Token(integration, credentials);
        headers['Authorization'] = `Bearer ${token}`;
        break;
    }

    return headers;
  }

  /**
   * Refresh OAuth2 token
   */
  private async refreshOAuth2Token(integration: IntegrationConfig, credentials: any): Promise<string> {
    if (credentials.expiresAt && Date.now() < credentials.expiresAt) {
      return credentials.accessToken;
    }

    try {
      const response = await axios.post(credentials.tokenUrl, {
        grant_type: 'refresh_token',
        refresh_token: credentials.refreshToken,
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret
      });

      const newCredentials = {
        ...credentials,
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || credentials.refreshToken,
        expiresAt: Date.now() + (response.data.expires_in * 1000)
      };

      // Update stored credentials
      await this.updateIntegrationCredentials(integration.id, newCredentials);

      return newCredentials.accessToken;
    } catch (error) {
      console.error('OAuth2 token refresh failed:', error);
      throw new Error('Failed to refresh OAuth2 token');
    }
  }

  /**
   * Database helper methods
   */
  private async getIntegration(integrationId: string, tenantId: string): Promise<IntegrationConfig | null> {
    const result = await this.db.executeQuery(`
      SELECT * FROM integrations WHERE id = ? AND tenant_id = ?
    `, [integrationId, tenantId]) as QueryResult;

    if (result.length === 0) return null;

    const row = (result as any)[0];
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      provider: row.provider,
      endpoint: row.endpoint,
      authType: row.auth_type,
      credentials: this.decryptCredentials(row.credentials),
      isActive: row.is_active,
      syncDirection: row.sync_direction,
      entityMappings: JSON.parse(row.entity_mappings),
      syncSchedule: row.sync_schedule,
      lastSync: row.last_sync,
      tenantId: row.tenant_id
    };
  }

  private async getIntegrationByWebhook(integrationId: string): Promise<IntegrationConfig | null> {
    const result = await this.db.executeQuery(`
      SELECT * FROM integrations WHERE id = ?
    `, [integrationId]) as QueryResult;

    if (result.length === 0) return null;

    const row = (result as any)[0];
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      provider: row.provider,
      endpoint: row.endpoint,
      authType: row.auth_type,
      credentials: this.decryptCredentials(row.credentials),
      isActive: row.is_active,
      syncDirection: row.sync_direction,
      entityMappings: JSON.parse(row.entity_mappings),
      syncSchedule: row.sync_schedule,
      lastSync: row.last_sync,
      tenantId: row.tenant_id
    };
  }

  private async getLocalRecords(entity: string, tenantId: string): Promise<any[]> {
    const result = await this.db.executeQuery(`
      SELECT * FROM ${entity} WHERE tenant_id = ?
    `, [tenantId]) as QueryResult;

    return result as any[];
  }

  private async saveLocalRecord(entity: string, record: any, tenantId: string): Promise<void> {
    const fields = Object.keys(record);
    const values = Object.values(record);
    const placeholders = fields.map(() => '?').join(', ');

    // Add tenant_id
    fields.push('tenant_id');
    values.push(tenantId);

    await this.db.executeQuery(`
      INSERT INTO ${entity} (${fields.join(', ')})
      VALUES (${placeholders}, ?)
      ON DUPLICATE KEY UPDATE
      ${fields.slice(0, -1).map(field => `${field} = VALUES(${field})`).join(', ')}
    `, values);
  }

  private async updateExternalId(entity: string, localId: string, externalId: string, tenantId: string): Promise<void> {
    await this.db.executeQuery(`
      UPDATE ${entity}
      SET external_id = ?
      WHERE id = ? AND tenant_id = ?
    `, [externalId, localId, tenantId]);
  }

  private async deleteLocalRecordByExternalId(entity: string, externalId: string, tenantId: string): Promise<void> {
    await this.db.executeQuery(`
      DELETE FROM ${entity}
      WHERE external_id = ? AND tenant_id = ?
    `, [externalId, tenantId]);
  }

  private async updateIntegrationCredentials(integrationId: string, credentials: any): Promise<void> {
    const encryptedCredentials = this.encryptCredentials(credentials);
    await this.db.executeQuery(`
      UPDATE integrations
      SET credentials = ?
      WHERE id = ?
    `, [encryptedCredentials, integrationId]);
  }

  /**
   * Encryption helpers
   */
  private encryptCredentials(credentials: any): string {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(this.webhookSecret, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipherGCM(algorithm, key, iv);
    
    let encrypted = cipher.update(JSON.stringify(credentials), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return JSON.stringify({
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    });
  }

  private decryptCredentials(encryptedData: string): any {
    try {
      const data = JSON.parse(encryptedData);
      const algorithm = 'aes-256-gcm';
      const key = crypto.scryptSync(this.webhookSecret, 'salt', 32);
      const decipher = crypto.createDecipherGCM(algorithm, key, Buffer.from(data.iv, 'hex'));
      
      decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));
      
      let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to decrypt credentials:', error);
      return {};
    }
  }

  private verifyWebhookSignature(payload: any, signature: string): boolean {
    const computedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    );
  }

  /**
   * Express middleware for integration operations
   */
  middleware() {
    return {
      /**
       * Test integration connection
       */
      testConnection: async (req: Request, res: Response) => {
        try {
          const { integrationId } = req.params;
          const tenantId = (req as any).tenantId;

          const result = await this.testConnection(integrationId, tenantId);

          res.json({
            success: result.success,
            message: result.message
          });
        } catch (error) {
          console.error('Test connection error:', error);
          res.status(500).json({ error: 'Failed to test connection' });
        }
      },

      /**
       * Sync data
       */
      syncData: async (req: Request, res: Response) => {
        try {
          const { integrationId } = req.params;
          const { entity, operation } = req.body;
          const tenantId = (req as any).tenantId;

          const syncId = await this.syncData(integrationId, entity, operation, tenantId);

          res.json({
            success: true,
            syncId
          });
        } catch (error) {
          console.error('Sync data error:', error);
          res.status(500).json({ error: 'Failed to sync data' });
        }
      },

      /**
       * Handle webhook
       */
      handleWebhook: async (req: Request, res: Response) => {
        try {
          const { integrationId } = req.params;
          const signature = req.headers['x-signature'] as string;

          await this.handleWebhook(integrationId, req.body, signature);

          res.json({ success: true });
        } catch (error) {
          console.error('Webhook error:', error);
          res.status(400).json({ error: 'Webhook processing failed' });
        }
      }
    };
  }
}