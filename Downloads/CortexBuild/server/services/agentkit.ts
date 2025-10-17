import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

export interface AgentRecord {
  id: string;
  slug: string;
  company_id: string | null;
  developer_id: string | null;
  name: string;
  description: string | null;
  icon: string | null;
  status: string;
  is_global: number;
  tags?: string | null;
  capabilities?: string | null;
  config?: string | null;
  metadata?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentExecutionRecord {
  id: string;
  agent_id: string;
  company_id: string;
  triggered_by: string | null;
  input_payload: string | null;
  output_payload: string | null;
  status: string;
  duration_ms: number | null;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

const mapAgentRow = (row: AgentRecord) => ({
  id: row.id,
  slug: row.slug,
  companyId: row.company_id ?? undefined,
  developerId: row.developer_id ?? undefined,
  name: row.name,
  description: row.description ?? '',
  icon: row.icon ?? '🤖',
  status: row.status,
  isGlobal: row.is_global === 1,
  tags: row.tags ? JSON.parse(row.tags) : [],
  capabilities: row.capabilities ? JSON.parse(row.capabilities) : {},
  config: row.config ? JSON.parse(row.config) : {},
  metadata: row.metadata ? JSON.parse(row.metadata) : {},
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapExecutionRow = (row: AgentExecutionRecord) => ({
  id: row.id,
  agentId: row.agent_id,
  companyId: row.company_id,
  triggeredBy: row.triggered_by ?? undefined,
  input: row.input_payload ? JSON.parse(row.input_payload) : undefined,
  output: row.output_payload ? JSON.parse(row.output_payload) : undefined,
  status: row.status,
  durationMs: row.duration_ms ?? undefined,
  error: row.error_message ?? undefined,
  startedAt: row.started_at,
  completedAt: row.completed_at ?? undefined
});

export const listGlobalAgents = (db: Database.Database) => {
  const rows = db.prepare(`
    SELECT * FROM ai_agents
    WHERE is_global = 1
    ORDER BY name ASC
  `).all() as AgentRecord[];
  return rows.map(mapAgentRow);
};

export const listCompanyAgents = (db: Database.Database, companyId: string) => {
  const rows = db.prepare(`
    SELECT * FROM ai_agents
    WHERE company_id = ?
    ORDER BY name ASC
  `).all(companyId) as AgentRecord[];
  return rows.map(mapAgentRow);
};

export const getAgentById = (db: Database.Database, agentId: string) => {
  const agent = db.prepare('SELECT * FROM ai_agents WHERE id = ?').get(agentId) as AgentRecord | undefined;
  return agent ? mapAgentRow(agent) : undefined;
};

export const subscribeAgent = (
  db: Database.Database,
  baseAgentId: string,
  companyId: string,
  requestedBy: string
) => {
  const baseAgent = db.prepare('SELECT * FROM ai_agents WHERE id = ?').get(baseAgentId) as AgentRecord | undefined;

  if (!baseAgent) {
    throw new Error('Agent not found');
  }

  if (!baseAgent.is_global && baseAgent.company_id && baseAgent.company_id !== companyId) {
    throw new Error('Agent belongs to another company');
  }

  const existingSubscription = db.prepare(`
    SELECT * FROM agent_subscriptions WHERE company_id = ? AND agent_id = ?
  `).get(companyId, baseAgentId);

  if (existingSubscription) {
    return mapAgentRow(baseAgent);
  }

  // Clone agent for company if needed
  let agentInstanceId = baseAgent.id;
  if (baseAgent.is_global === 1) {
    agentInstanceId = `agent-${uuidv4()}`;
    const slug = `${baseAgent.slug}-${companyId}`.toLowerCase();

    db.prepare(`
      INSERT INTO ai_agents (
        id, slug, company_id, developer_id, name, description, icon, status,
        is_global, tags, capabilities, config, metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).run(
      agentInstanceId,
      slug,
      companyId,
      baseAgent.developer_id,
      baseAgent.name,
      baseAgent.description,
      baseAgent.icon,
      'active',
      0,
      baseAgent.tags,
      baseAgent.capabilities,
      baseAgent.config,
      baseAgent.metadata
    );
  }

  const nowIso = new Date().toISOString();
  db.prepare(`
    INSERT INTO agent_subscriptions (id, company_id, agent_id, status, seats, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    `sub-${agentInstanceId}`,
    companyId,
    agentInstanceId,
    'active',
    25,
    nowIso,
    nowIso
  );

  // Record audit event in developer console for observability
  logDeveloperEvent(db, requestedBy, companyId, 'agent.subscribe', {
    agentId: agentInstanceId,
    baseAgentId
  });

  const agent = db.prepare('SELECT * FROM ai_agents WHERE id = ?').get(agentInstanceId) as AgentRecord;
  return mapAgentRow(agent);
};

export const unsubscribeAgent = (
  db: Database.Database,
  agentId: string,
  companyId: string
) => {
  const agent = db.prepare('SELECT * FROM ai_agents WHERE id = ?').get(agentId) as AgentRecord | undefined;
  if (!agent || agent.company_id !== companyId) {
    throw new Error('Agent not found for this company');
  }

  db.prepare('DELETE FROM agent_subscriptions WHERE company_id = ? AND agent_id = ?').run(companyId, agentId);
  db.prepare('DELETE FROM agent_executions WHERE agent_id = ?').run(agentId);
  db.prepare('DELETE FROM ai_agents WHERE id = ?').run(agentId);
};

const simulateAgentResponse = (agent: ReturnType<typeof mapAgentRow>, input: any) => {
  const now = new Date().toISOString();
  return {
    generatedAt: now,
    summary: `Agent ${agent.name} processed the request successfully.`,
    recommendations: [
      'Validate assumptions with project stakeholders.',
      'Schedule follow-up actions for the responsible team.'
    ],
    insights: {
      riskScore: Math.round(Math.random() * 30 + 40),
      confidence: 0.72,
      context: input || {}
    }
  };
};

export const runAgent = (
  db: Database.Database,
  agentId: string,
  companyId: string,
  triggeredBy: string,
  inputPayload: any
) => {
  const agentRow = db.prepare('SELECT * FROM ai_agents WHERE id = ?').get(agentId) as AgentRecord | undefined;
  if (!agentRow || (agentRow.company_id !== companyId && agentRow.is_global !== 1)) {
    throw new Error('Agent not accessible');
  }

  const executionId = `exec-${uuidv4()}`;
  const start = new Date();
  const startedAt = start.toISOString();

  const resultPayload = simulateAgentResponse(mapAgentRow(agentRow), inputPayload);
  const completedAt = new Date().toISOString();
  const durationMs = new Date(completedAt).getTime() - start.getTime();

  db.prepare(`
    INSERT INTO agent_executions (
      id, agent_id, company_id, triggered_by, input_payload, output_payload,
      status, duration_ms, started_at, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    executionId,
    agentId,
    companyId,
    triggeredBy,
    JSON.stringify(inputPayload ?? {}),
    JSON.stringify(resultPayload),
    'success',
    durationMs,
    startedAt,
    completedAt
  );

  logDeveloperEvent(db, triggeredBy, companyId, 'agent.execution', {
    agentId,
    executionId,
    status: 'success'
  });

  const execution = db.prepare('SELECT * FROM agent_executions WHERE id = ?').get(executionId) as AgentExecutionRecord;
  return mapExecutionRow(execution);
};

export const getAgentExecutions = (
  db: Database.Database,
  agentId: string,
  companyId: string,
  limit = 25
) => {
  const rows = db.prepare(`
    SELECT * FROM agent_executions
    WHERE agent_id = ? AND company_id = ?
    ORDER BY started_at DESC
    LIMIT ?
  `).all(agentId, companyId, limit) as AgentExecutionRecord[];

  return rows.map(mapExecutionRow);
};

export const listAgentSubscriptions = (db: Database.Database, companyId: string) => {
  return db.prepare(`
    SELECT * FROM agent_subscriptions
    WHERE company_id = ?
    ORDER BY created_at DESC
  `).all(companyId);
};

const logDeveloperEvent = (
  db: Database.Database,
  userId: string,
  companyId: string,
  eventType: string,
  payload: Record<string, unknown>
) => {
  db.prepare(`
    INSERT INTO developer_console_events (id, user_id, company_id, event_type, payload)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    `dev-${uuidv4()}`,
    userId,
    companyId,
    eventType,
    JSON.stringify(payload)
  );
};
