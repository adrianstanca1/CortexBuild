// CortexBuild Webhooks Service
// Real-time event notifications to external systems

import Database from 'better-sqlite3';
import axios from 'axios';
import crypto from 'crypto';

export interface Webhook {
  id: number;
  user_id: string;
  company_id: string;
  name: string;
  url: string;
  events: string;
  secret: string;
  is_active: boolean;
  last_triggered_at?: string;
  success_count: number;
  failure_count: number;
  created_at: string;
  updated_at: string;
}

// Available webhook events
export const WEBHOOK_EVENTS = {
  // Project events
  PROJECT_CREATED: 'project.created',
  PROJECT_UPDATED: 'project.updated',
  PROJECT_DELETED: 'project.deleted',
  PROJECT_STATUS_CHANGED: 'project.status_changed',

  // Task events
  TASK_CREATED: 'task.created',
  TASK_UPDATED: 'task.updated',
  TASK_DELETED: 'task.deleted',
  TASK_COMPLETED: 'task.completed',

  // RFI events
  RFI_CREATED: 'rfi.created',
  RFI_ANSWERED: 'rfi.answered',
  RFI_CLOSED: 'rfi.closed',

  // Invoice events
  INVOICE_CREATED: 'invoice.created',
  INVOICE_SENT: 'invoice.sent',
  INVOICE_PAID: 'invoice.paid',
  INVOICE_OVERDUE: 'invoice.overdue',

  // Client events
  CLIENT_CREATED: 'client.created',
  CLIENT_UPDATED: 'client.updated',

  // Document events
  DOCUMENT_UPLOADED: 'document.uploaded',
  DOCUMENT_SHARED: 'document.shared',

  // Time tracking events
  TIME_ENTRY_CREATED: 'time_entry.created',
  TIME_ENTRY_APPROVED: 'time_entry.approved',

  // Purchase order events
  PO_CREATED: 'purchase_order.created',
  PO_APPROVED: 'purchase_order.approved',
  PO_RECEIVED: 'purchase_order.received'
};

/**
 * Create a new webhook
 */
export function createWebhook(
  db: Database.Database,
  userId: string,
  companyId: string,
  name: string,
  url: string,
  events: string[]
): Webhook {
  // Generate webhook secret
  const secret = crypto.randomBytes(32).toString('hex');

  const result = db.prepare(`
    INSERT INTO webhooks (user_id, company_id, name, url, events, secret, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `).run(userId, companyId, name, url, JSON.stringify(events), secret);

  return getWebhook(db, Number(result.lastInsertRowid));
}

/**
 * Get webhook by ID
 */
export function getWebhook(db: Database.Database, webhookId: number): Webhook {
  return db.prepare('SELECT * FROM webhooks WHERE id = ?').get(webhookId) as Webhook;
}

/**
 * Get all webhooks for a user
 */
export function getUserWebhooks(db: Database.Database, userId: string): Webhook[] {
  return db.prepare('SELECT * FROM webhooks WHERE user_id = ? ORDER BY created_at DESC').all(userId) as Webhook[];
}

/**
 * Get all webhooks for a company
 */
export function getCompanyWebhooks(db: Database.Database, companyId: string): Webhook[] {
  return db.prepare('SELECT * FROM webhooks WHERE company_id = ? ORDER BY created_at DESC').all(companyId) as Webhook[];
}

/**
 * Update webhook
 */
export function updateWebhook(
  db: Database.Database,
  webhookId: number,
  updates: Partial<Webhook>
): void {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.url !== undefined) {
    fields.push('url = ?');
    values.push(updates.url);
  }
  if (updates.events !== undefined) {
    fields.push('events = ?');
    values.push(updates.events);
  }
  if (updates.is_active !== undefined) {
    fields.push('is_active = ?');
    values.push(updates.is_active ? 1 : 0);
  }

  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(webhookId);

  db.prepare(`UPDATE webhooks SET ${fields.join(', ')} WHERE id = ?`).run(...values);
}

/**
 * Delete webhook
 */
export function deleteWebhook(db: Database.Database, webhookId: number): void {
  db.prepare('DELETE FROM webhooks WHERE id = ?').run(webhookId);
}

/**
 * Generate webhook signature
 */
function generateSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * Trigger webhook
 */
export async function triggerWebhook(
  db: Database.Database,
  webhookId: number,
  eventType: string,
  payload: any
): Promise<boolean> {
  const webhook = getWebhook(db, webhookId);

  if (!webhook.is_active) {
    console.log(`Webhook ${webhookId} is not active, skipping`);
    return false;
  }

  // Check if webhook listens to this event
  const events = JSON.parse(webhook.events);
  if (!events.includes(eventType) && !events.includes('*')) {
    console.log(`Webhook ${webhookId} does not listen to ${eventType}, skipping`);
    return false;
  }

  const payloadStr = JSON.stringify(payload);
  const signature = generateSignature(payloadStr, webhook.secret);
  const timestamp = Date.now();

  try {
    const response = await axios.post(webhook.url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-CortexBuild-Event': eventType,
        'X-CortexBuild-Signature': signature,
        'X-CortexBuild-Timestamp': timestamp.toString(),
        'X-CortexBuild-Webhook-Id': webhookId.toString()
      },
      timeout: 10000 // 10 second timeout
    });

    // Log successful delivery
    logWebhookDelivery(db, webhookId, eventType, payloadStr, response.status, JSON.stringify(response.data));

    // Update webhook stats
    db.prepare(`
      UPDATE webhooks
      SET success_count = success_count + 1,
          last_triggered_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(webhookId);

    return true;
  } catch (error: any) {
    const errorMessage = error.message || 'Unknown error';
    const responseStatus = error.response?.status || 0;
    const responseBody = error.response?.data ? JSON.stringify(error.response.data) : null;

    // Log failed delivery
    logWebhookDelivery(db, webhookId, eventType, payloadStr, responseStatus, responseBody, errorMessage);

    // Update webhook stats
    db.prepare(`
      UPDATE webhooks
      SET failure_count = failure_count + 1,
          last_triggered_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(webhookId);

    // Disable webhook after 10 consecutive failures
    const webhook = getWebhook(db, webhookId);
    if (webhook.failure_count >= 10) {
      db.prepare('UPDATE webhooks SET is_active = 0 WHERE id = ?').run(webhookId);
      console.log(`Webhook ${webhookId} disabled after 10 consecutive failures`);
    }

    return false;
  }
}

/**
 * Log webhook delivery
 */
function logWebhookDelivery(
  db: Database.Database,
  webhookId: number,
  eventType: string,
  payload: string,
  responseStatus: number,
  responseBody: string | null,
  errorMessage?: string
): void {
  db.prepare(`
    INSERT INTO webhook_logs (webhook_id, event_type, payload, response_status, response_body, error_message)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(webhookId, eventType, payload, responseStatus, responseBody, errorMessage || null);
}

/**
 * Get webhook logs
 */
export function getWebhookLogs(
  db: Database.Database,
  webhookId: number,
  limit: number = 50
): any[] {
  return db.prepare(`
    SELECT * FROM webhook_logs
    WHERE webhook_id = ?
    ORDER BY delivered_at DESC
    LIMIT ?
  `).all(webhookId, limit);
}

/**
 * Trigger webhooks for an event
 */
export async function triggerWebhooksForEvent(
  db: Database.Database,
  companyId: string,
  eventType: string,
  payload: any
): Promise<void> {
  const webhooks = db.prepare(`
    SELECT * FROM webhooks
    WHERE company_id = ? AND is_active = 1
  `).all(companyId) as Webhook[];

  // Trigger all webhooks in parallel
  const promises = webhooks.map(webhook =>
    triggerWebhook(db, webhook.id, eventType, payload)
  );

  await Promise.allSettled(promises);
}

/**
 * Test webhook
 */
export async function testWebhook(
  db: Database.Database,
  webhookId: number
): Promise<boolean> {
  const testPayload = {
    event: 'webhook.test',
    timestamp: Date.now(),
    message: 'This is a test webhook delivery from CortexBuild'
  };

  return await triggerWebhook(db, webhookId, 'webhook.test', testPayload);
}

/**
 * Retry failed webhook delivery
 */
export async function retryWebhookDelivery(
  db: Database.Database,
  logId: number
): Promise<boolean> {
  const log = db.prepare('SELECT * FROM webhook_logs WHERE id = ?').get(logId) as any;

  if (!log) {
    throw new Error('Webhook log not found');
  }

  const payload = JSON.parse(log.payload);
  return await triggerWebhook(db, log.webhook_id, log.event_type, payload);
}

/**
 * Verify webhook signature (for incoming webhooks from third parties)
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
