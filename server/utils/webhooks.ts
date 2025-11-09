/**
 * Webhook Management Utilities
 * Handles webhook registration, delivery, and retry logic
 */

import crypto from 'crypto';
import axios from 'axios';
import Database from 'better-sqlite3';

export interface Webhook {
  id: string;
  userId: string;
  companyId: string | null;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookDeliveryLog {
  id: string;
  webhookId: string;
  eventType: string;
  payload: string;
  responseStatus: number | null;
  errorMessage: string | null;
  createdAt: string;
}

/**
 * Generate HMAC signature for webhook payload
 */
export function generateWebhookSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateWebhookSignature(payload, secret);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

/**
 * Dispatch webhook to registered URL
 */
export async function dispatchWebhook(
  db: Database.Database,
  webhook: Webhook,
  eventType: string,
  data: Record<string, unknown>
): Promise<{ success: boolean; status?: number; error?: string }> {
  const payload = JSON.stringify({
    event: eventType,
    timestamp: Date.now(),
    data,
    webhookId: webhook.id
  });

  const signature = generateWebhookSignature(payload, webhook.secret);

  try {
    const response = await axios.post(webhook.url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-CortexBuild-Event': eventType,
        'X-CortexBuild-Signature': signature,
        'X-CortexBuild-Timestamp': Date.now().toString(),
        'X-CortexBuild-Webhook-Id': webhook.id
      },
      timeout: 10000 // 10 second timeout
    });

    // Log successful delivery
    logWebhookDelivery(db, webhook.id, eventType, payload, response.status, null);

    return { success: true, status: response.status };
  } catch (error: any) {
    const status = error.response?.status || 0;
    const errorMessage = error.message || 'Unknown error';

    // Log failed delivery
    logWebhookDelivery(db, webhook.id, eventType, payload, status, errorMessage);

    // Auto-disable after 10 consecutive failures
    const failures = getConsecutiveFailures(db, webhook.id);
    if (failures >= 10) {
      disableWebhook(db, webhook.id);
    }

    return { success: false, status, error: errorMessage };
  }
}

/**
 * Log webhook delivery attempt
 */
function logWebhookDelivery(
  db: Database.Database,
  webhookId: string,
  eventType: string,
  payload: string,
  responseStatus: number | null,
  errorMessage: string | null
): void {
  const id = `whdl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  db.prepare(`
    INSERT INTO webhook_delivery_logs 
    (id, webhook_id, event_type, payload, response_status, error_message)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, webhookId, eventType, payload, responseStatus, errorMessage);
}

/**
 * Get consecutive failure count for webhook
 */
function getConsecutiveFailures(db: Database.Database, webhookId: string): number {
  const logs = db.prepare(`
    SELECT response_status 
    FROM webhook_delivery_logs 
    WHERE webhook_id = ? 
    ORDER BY created_at DESC 
    LIMIT 10
  `).all(webhookId) as Array<{ response_status: number | null }>;

  let failures = 0;
  for (const log of logs) {
    if (!log.response_status || log.response_status >= 400) {
      failures++;
    } else {
      break; // Stop counting at first success
    }
  }

  return failures;
}

/**
 * Disable webhook after too many failures
 */
function disableWebhook(db: Database.Database, webhookId: string): void {
  db.prepare(`
    UPDATE webhooks 
    SET is_active = 0, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `).run(webhookId);
  
  console.warn(`⚠️ Webhook ${webhookId} disabled after 10 consecutive failures`);
}

/**
 * Broadcast event to all registered webhooks
 */
export async function broadcastWebhookEvent(
  db: Database.Database,
  eventType: string,
  data: Record<string, unknown>,
  companyId?: string
): Promise<void> {
  let query = `
    SELECT * FROM webhooks 
    WHERE is_active = 1 
    AND events LIKE ?
  `;
  const params: any[] = [`%${eventType}%`];

  if (companyId) {
    query += ` AND company_id = ?`;
    params.push(companyId);
  }

  const webhooks = db.prepare(query).all(...params) as Array<any>;

  for (const webhookRow of webhooks) {
    const webhook: Webhook = {
      id: webhookRow.id,
      userId: webhookRow.user_id,
      companyId: webhookRow.company_id,
      url: webhookRow.url,
      events: JSON.parse(webhookRow.events),
      secret: webhookRow.secret,
      isActive: webhookRow.is_active === 1,
      createdAt: webhookRow.created_at,
      updatedAt: webhookRow.updated_at
    };

    // Dispatch webhook asynchronously (don't await)
    dispatchWebhook(db, webhook, eventType, data).catch(err => {
      console.error(`Failed to dispatch webhook ${webhook.id}:`, err);
    });
  }
}

/**
 * Register a new webhook
 */
export function registerWebhook(
  db: Database.Database,
  userId: string,
  companyId: string | null,
  url: string,
  events: string[]
): string {
  const id = `wh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const secret = crypto.randomBytes(32).toString('hex');

  db.prepare(`
    INSERT INTO webhooks (id, user_id, company_id, url, events, secret)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, userId, companyId, url, JSON.stringify(events), secret);

  return id;
}

/**
 * Get all webhooks for a user
 */
export function getUserWebhooks(
  db: Database.Database,
  userId: string
): Webhook[] {
  const rows = db.prepare(`
    SELECT * FROM webhooks 
    WHERE user_id = ? 
    ORDER BY created_at DESC
  `).all(userId) as Array<any>;

  return rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    companyId: row.company_id,
    url: row.url,
    events: JSON.parse(row.events),
    secret: row.secret,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}
