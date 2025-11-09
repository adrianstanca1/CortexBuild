/**
 * AI Agent Registry and Marketplace
 * Manages AI agent catalog, subscriptions, and deployment
 */

import Database from 'better-sqlite3';

export interface AIAgent {
  id: string;
  developerId: string;
  name: string;
  description: string;
  category: string;
  version: string;
  config: Record<string, unknown>;
  code: string;
  status: 'draft' | 'published' | 'archived';
  isPublic: boolean;
  price: number;
  subscriptions: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgentSubscription {
  id: string;
  agentId: string;
  userId: string;
  companyId: string;
  status: 'active' | 'paused' | 'cancelled';
  config: Record<string, unknown>;
  createdAt: string;
  expiresAt: string | null;
}

export interface AgentExecution {
  id: string;
  agentId: string;
  userId: string;
  companyId: string;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  status: 'pending' | 'running' | 'completed' | 'failed';
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
  duration: number | null;
}

/**
 * Initialize AI Agent tables
 */
export function initializeAgentTables(db: Database.Database): void {
  // Agent subscriptions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS agent_subscriptions (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      config TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      FOREIGN KEY (agent_id) REFERENCES ai_agents(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );

    CREATE INDEX IF NOT EXISTS idx_agent_subscriptions_user 
    ON agent_subscriptions(user_id, status);

    CREATE INDEX IF NOT EXISTS idx_agent_subscriptions_agent 
    ON agent_subscriptions(agent_id);
  `);

  // Agent executions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS agent_executions (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      input TEXT NOT NULL,
      output TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      error_message TEXT,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      duration INTEGER,
      FOREIGN KEY (agent_id) REFERENCES ai_agents(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );

    CREATE INDEX IF NOT EXISTS idx_agent_executions_agent 
    ON agent_executions(agent_id, status);

    CREATE INDEX IF NOT EXISTS idx_agent_executions_user 
    ON agent_executions(user_id, started_at);
  `);

  console.log('✅ AI Agent tables initialized');
}

/**
 * Get all public agents from marketplace
 */
export function getMarketplaceAgents(
  db: Database.Database,
  filters?: {
    category?: string;
    minRating?: number;
    search?: string;
  }
): AIAgent[] {
  let query = `
    SELECT 
      a.*,
      COUNT(DISTINCT s.id) as subscriptions,
      COALESCE(AVG(r.rating), 0) as rating
    FROM ai_agents a
    LEFT JOIN agent_subscriptions s ON s.agent_id = a.id AND s.status = 'active'
    LEFT JOIN agent_ratings r ON r.agent_id = a.id
    WHERE a.is_public = 1 AND a.status = 'published'
  `;

  const params: any[] = [];

  if (filters?.category) {
    query += ` AND a.category = ?`;
    params.push(filters.category);
  }

  if (filters?.search) {
    query += ` AND (a.name LIKE ? OR a.description LIKE ?)`;
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  query += ` GROUP BY a.id`;

  if (filters?.minRating) {
    query += ` HAVING rating >= ?`;
    params.push(filters.minRating);
  }

  query += ` ORDER BY subscriptions DESC, rating DESC`;

  const rows = db.prepare(query).all(...params) as Array<any>;

  return rows.map(mapAgentRow);
}

/**
 * Get agent by ID
 */
export function getAgentById(
  db: Database.Database,
  agentId: string
): AIAgent | null {
  const row = db.prepare(`
    SELECT 
      a.*,
      COUNT(DISTINCT s.id) as subscriptions,
      COALESCE(AVG(r.rating), 0) as rating
    FROM ai_agents a
    LEFT JOIN agent_subscriptions s ON s.agent_id = a.id AND s.status = 'active'
    LEFT JOIN agent_ratings r ON r.agent_id = a.id
    WHERE a.id = ?
    GROUP BY a.id
  `).get(agentId);

  return row ? mapAgentRow(row) : null;
}

/**
 * Create new AI agent
 */
export function createAgent(
  db: Database.Database,
  developerId: string,
  data: {
    name: string;
    description: string;
    category: string;
    config: Record<string, unknown>;
    code: string;
    isPublic: boolean;
    price: number;
  }
): string {
  const id = `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  db.prepare(`
    INSERT INTO ai_agents 
    (id, developer_id, name, description, category, version, config, code, status, is_public, price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)
  `).run(
    id,
    developerId,
    data.name,
    data.description,
    data.category,
    '1.0.0',
    JSON.stringify(data.config),
    data.code,
    data.isPublic ? 1 : 0,
    data.price
  );

  return id;
}

/**
 * Publish agent to marketplace
 */
export function publishAgent(
  db: Database.Database,
  agentId: string,
  developerId: string
): boolean {
  const result = db.prepare(`
    UPDATE ai_agents 
    SET status = 'published', updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND developer_id = ? AND status = 'draft'
  `).run(agentId, developerId);

  return result.changes > 0;
}

/**
 * Subscribe user to agent
 */
export function subscribeToAgent(
  db: Database.Database,
  agentId: string,
  userId: string,
  companyId: string,
  config?: Record<string, unknown>
): string {
  const id = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  db.prepare(`
    INSERT INTO agent_subscriptions (id, agent_id, user_id, company_id, config)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, agentId, userId, companyId, JSON.stringify(config || {}));

  return id;
}

/**
 * Get user's subscribed agents
 */
export function getUserSubscriptions(
  db: Database.Database,
  userId: string
): AIAgent[] {
  const rows = db.prepare(`
    SELECT a.*, s.status as subscription_status, s.created_at as subscribed_at
    FROM agent_subscriptions s
    JOIN ai_agents a ON a.id = s.agent_id
    WHERE s.user_id = ?
    ORDER BY s.created_at DESC
  `).all(userId) as Array<any>;

  return rows.map(mapAgentRow);
}

/**
 * Execute AI agent
 */
export async function executeAgent(
  db: Database.Database,
  agentId: string,
  userId: string,
  companyId: string,
  input: Record<string, unknown>
): Promise<string> {
  const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Create execution record
  db.prepare(`
    INSERT INTO agent_executions (id, agent_id, user_id, company_id, input, status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `).run(executionId, agentId, userId, companyId, JSON.stringify(input));

  // Queue execution (async processing)
  queueAgentExecution(db, executionId, agentId, input);

  return executionId;
}

/**
 * Queue agent execution for background processing
 */
async function queueAgentExecution(
  db: Database.Database,
  executionId: string,
  agentId: string,
  input: Record<string, unknown>
): Promise<void> {
  try {
    // Update status to running
    db.prepare(`
      UPDATE agent_executions 
      SET status = 'running' 
      WHERE id = ?
    `).run(executionId);

    const startTime = Date.now();

    // Get agent code and config
    const agent = db.prepare(`
      SELECT code, config FROM ai_agents WHERE id = ?
    `).get(agentId) as any;

    if (!agent) {
      throw new Error('Agent not found');
    }

    // Execute agent code (simplified - in production, use sandboxed execution)
    const result = await executeAgentCode(agent.code, input, JSON.parse(agent.config));

    const duration = Date.now() - startTime;

    // Update execution with result
    db.prepare(`
      UPDATE agent_executions 
      SET 
        status = 'completed',
        output = ?,
        completed_at = CURRENT_TIMESTAMP,
        duration = ?
      WHERE id = ?
    `).run(JSON.stringify(result), duration, executionId);

  } catch (error: any) {
    // Update execution with error
    db.prepare(`
      UPDATE agent_executions 
      SET 
        status = 'failed',
        error_message = ?,
        completed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(error.message, executionId);
  }
}

/**
 * Execute agent code (simplified - should use sandboxed environment in production)
 */
async function executeAgentCode(
  code: string,
  input: Record<string, unknown>,
  config: Record<string, unknown>
): Promise<Record<string, unknown>> {
  // In production, this should run in a secure sandbox
  // For now, return mock result
  return {
    success: true,
    message: 'Agent executed successfully',
    input,
    config,
    timestamp: new Date().toISOString()
  };
}

/**
 * Get agent execution status
 */
export function getExecution(
  db: Database.Database,
  executionId: string
): AgentExecution | null {
  const row = db.prepare(`
    SELECT * FROM agent_executions WHERE id = ?
  `).get(executionId) as any;

  if (!row) return null;

  return {
    id: row.id,
    agentId: row.agent_id,
    userId: row.user_id,
    companyId: row.company_id,
    input: JSON.parse(row.input),
    output: row.output ? JSON.parse(row.output) : null,
    status: row.status,
    errorMessage: row.error_message,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    duration: row.duration
  };
}

/**
 * Get agent execution history
 */
export function getAgentExecutions(
  db: Database.Database,
  agentId: string,
  limit: number = 50
): AgentExecution[] {
  const rows = db.prepare(`
    SELECT * FROM agent_executions 
    WHERE agent_id = ?
    ORDER BY started_at DESC
    LIMIT ?
  `).all(agentId, limit) as Array<any>;

  return rows.map(row => ({
    id: row.id,
    agentId: row.agent_id,
    userId: row.user_id,
    companyId: row.company_id,
    input: JSON.parse(row.input),
    output: row.output ? JSON.parse(row.output) : null,
    status: row.status,
    errorMessage: row.error_message,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    duration: row.duration
  }));
}

/**
 * Helper to map database row to AIAgent
 */
function mapAgentRow(row: any): AIAgent {
  return {
    id: row.id,
    developerId: row.developer_id,
    name: row.name,
    description: row.description,
    category: row.category,
    version: row.version,
    config: JSON.parse(row.config || '{}'),
    code: row.code,
    status: row.status,
    isPublic: row.is_public === 1,
    price: row.price || 0,
    subscriptions: row.subscriptions || 0,
    rating: row.rating || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
