/**
 * MCP (Model Context Protocol) Service
 * 
 * Provides enhanced AI context management for better multi-turn conversations,
 * context persistence, and intelligent context retrieval.
 */

import type { Database } from 'better-sqlite3';

// MCP Context Types
export interface MCPContext {
  id: string;
  user_id: string;
  session_id: string;
  context_type: 'developer' | 'project' | 'code' | 'conversation';
  context_data: any;
  metadata: {
    created_at: string;
    updated_at: string;
    expires_at?: string;
    tags?: string[];
    relevance_score?: number;
  };
}

export interface MCPMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: string;
  context_refs?: string[];
}

export interface MCPSession {
  session_id: string;
  user_id: string;
  messages: MCPMessage[];
  active_contexts: string[];
  created_at: string;
  last_activity: string;
}

/**
 * Initialize MCP tables in database
 */
export function initializeMCPTables(db: Database.Database): void {
  // MCP Sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS mcp_sessions (
      session_id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      context_type TEXT DEFAULT 'conversation',
      active_contexts TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // MCP Contexts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS mcp_contexts (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      context_type TEXT NOT NULL,
      context_data TEXT NOT NULL,
      metadata TEXT DEFAULT '{}',
      relevance_score REAL DEFAULT 1.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      FOREIGN KEY (session_id) REFERENCES mcp_sessions(session_id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // MCP Messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS mcp_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      context_refs TEXT DEFAULT '[]',
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES mcp_sessions(session_id) ON DELETE CASCADE
    );
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_mcp_sessions_user ON mcp_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_mcp_contexts_session ON mcp_contexts(session_id);
    CREATE INDEX IF NOT EXISTS idx_mcp_contexts_user ON mcp_contexts(user_id);
    CREATE INDEX IF NOT EXISTS idx_mcp_messages_session ON mcp_messages(session_id);
  `);

  console.log('✅ MCP tables initialized');
}

/**
 * Create a new MCP session
 */
export function createMCPSession(
  db: Database.Database,
  userId: string,
  contextType: string = 'conversation'
): string {
  const sessionId = `mcp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

  db.prepare(`
    INSERT INTO mcp_sessions (session_id, user_id, context_type, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(sessionId, userId, contextType, expiresAt);

  return sessionId;
}

/**
 * Get or create MCP session
 */
export function getOrCreateSession(
  db: Database.Database,
  userId: string,
  sessionId?: string
): string {
  if (sessionId) {
    const session = db.prepare(`
      SELECT session_id FROM mcp_sessions 
      WHERE session_id = ? AND user_id = ? AND datetime(expires_at) > datetime('now')
    `).get(sessionId, userId) as any;

    if (session) {
      // Update last activity
      db.prepare(`
        UPDATE mcp_sessions SET last_activity = CURRENT_TIMESTAMP WHERE session_id = ?
      `).run(sessionId);
      return sessionId;
    }
  }

  // Create new session
  return createMCPSession(db, userId);
}

/**
 * Add context to MCP session
 */
export function addContext(
  db: Database.Database,
  sessionId: string,
  userId: string,
  contextType: string,
  contextData: any,
  metadata: any = {}
): string {
  const contextId = `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  db.prepare(`
    INSERT INTO mcp_contexts (id, session_id, user_id, context_type, context_data, metadata, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    contextId,
    sessionId,
    userId,
    contextType,
    JSON.stringify(contextData),
    JSON.stringify(metadata),
    expiresAt
  );

  // Update session's active contexts
  const session = db.prepare(`
    SELECT active_contexts FROM mcp_sessions WHERE session_id = ?
  `).get(sessionId) as any;

  if (session) {
    const activeContexts = JSON.parse(session.active_contexts || '[]');
    activeContexts.push(contextId);

    db.prepare(`
      UPDATE mcp_sessions SET active_contexts = ? WHERE session_id = ?
    `).run(JSON.stringify(activeContexts), sessionId);
  }

  return contextId;
}

/**
 * Add message to MCP session
 */
export function addMessage(
  db: Database.Database,
  sessionId: string,
  role: 'system' | 'user' | 'assistant',
  content: string,
  contextRefs: string[] = []
): void {
  db.prepare(`
    INSERT INTO mcp_messages (session_id, role, content, context_refs)
    VALUES (?, ?, ?, ?)
  `).run(sessionId, role, content, JSON.stringify(contextRefs));

  // Update session last activity
  db.prepare(`
    UPDATE mcp_sessions SET last_activity = CURRENT_TIMESTAMP WHERE session_id = ?
  `).run(sessionId);
}

/**
 * Get session messages with context
 */
export function getSessionMessages(
  db: Database.Database,
  sessionId: string,
  limit: number = 50
): MCPMessage[] {
  const messages = db.prepare(`
    SELECT role, content, context_refs, timestamp
    FROM mcp_messages
    WHERE session_id = ?
    ORDER BY timestamp DESC
    LIMIT ?
  `).all(sessionId, limit) as any[];

  return messages.reverse().map(msg => ({
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp,
    context_refs: JSON.parse(msg.context_refs || '[]')
  }));
}

/**
 * Get relevant contexts for a session
 */
export function getRelevantContexts(
  db: Database.Database,
  sessionId: string,
  contextType?: string
): MCPContext[] {
  let query = `
    SELECT id, user_id, session_id, context_type, context_data, metadata, relevance_score
    FROM mcp_contexts
    WHERE session_id = ? AND datetime(expires_at) > datetime('now')
  `;
  const params: any[] = [sessionId];

  if (contextType) {
    query += ` AND context_type = ?`;
    params.push(contextType);
  }

  query += ` ORDER BY relevance_score DESC, created_at DESC`;

  const contexts = db.prepare(query).all(...params) as any[];

  return contexts.map(ctx => ({
    id: ctx.id,
    user_id: ctx.user_id,
    session_id: ctx.session_id,
    context_type: ctx.context_type,
    context_data: JSON.parse(ctx.context_data),
    metadata: JSON.parse(ctx.metadata || '{}')
  }));
}

/**
 * Build enhanced prompt with MCP context
 */
export function buildEnhancedPrompt(
  db: Database.Database,
  sessionId: string,
  userMessage: string,
  systemPrompt?: string
): { messages: any[], contexts: MCPContext[] } {
  // Get session messages
  const messages = getSessionMessages(db, sessionId, 10);

  // Get relevant contexts
  const contexts = getRelevantContexts(db, sessionId);

  // Build context summary
  const contextSummary = contexts.map(ctx => {
    return `[${ctx.context_type}]: ${JSON.stringify(ctx.context_data)}`;
  }).join('\n');

  // Build enhanced messages array
  const enhancedMessages: any[] = [];

  // Add system prompt with context
  if (systemPrompt || contextSummary) {
    enhancedMessages.push({
      role: 'system',
      content: `${systemPrompt || ''}\n\nRelevant Context:\n${contextSummary}`
    });
  }

  // Add conversation history
  messages.forEach(msg => {
    enhancedMessages.push({
      role: msg.role,
      content: msg.content
    });
  });

  // Add current user message
  enhancedMessages.push({
    role: 'user',
    content: userMessage
  });

  return { messages: enhancedMessages, contexts };
}

/**
 * Clean up expired sessions and contexts
 */
export function cleanupExpiredSessions(db: Database.Database): void {
  // Delete expired contexts
  db.prepare(`
    DELETE FROM mcp_contexts WHERE datetime(expires_at) <= datetime('now')
  `).run();

  // Delete expired sessions
  db.prepare(`
    DELETE FROM mcp_sessions WHERE datetime(expires_at) <= datetime('now')
  `).run();

  console.log('✅ MCP cleanup completed');
}

/**
 * Get session statistics
 */
export function getSessionStats(
  db: Database.Database,
  userId: string
): any {
  const stats = db.prepare(`
    SELECT 
      COUNT(DISTINCT session_id) as total_sessions,
      COUNT(*) as total_messages,
      MAX(last_activity) as last_activity
    FROM mcp_sessions s
    LEFT JOIN mcp_messages m ON s.session_id = m.session_id
    WHERE s.user_id = ?
  `).get(userId);

  const contextStats = db.prepare(`
    SELECT 
      context_type,
      COUNT(*) as count
    FROM mcp_contexts
    WHERE user_id = ? AND datetime(expires_at) > datetime('now')
    GROUP BY context_type
  `).all(userId);

  return {
    ...stats,
    contexts_by_type: contextStats
  };
}

