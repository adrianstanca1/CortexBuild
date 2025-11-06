/**
 * Collaboration Service
 * Handles real-time collaboration features for developers
 */

import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

export interface CollaborationSession {
  id: string;
  workspace_id: string;
  name: string;
  description: string;
  created_by: string;
  is_active: boolean;
  participants: string[];
  settings: any;
  created_at: string;
  updated_at: string;
}

export interface CollaborationEvent {
  id: string;
  session_id: string;
  user_id: string;
  event_type: 'join' | 'leave' | 'cursor_move' | 'code_edit' | 'comment' | 'file_open' | 'file_close';
  event_data: any;
  created_at: string;
}

export interface CodeComment {
  id: string;
  session_id: string;
  file_path: string;
  line_number: number;
  column_start: number;
  column_end: number;
  content: string;
  author_id: string;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
}

export interface LiveCursor {
  id: string;
  session_id: string;
  user_id: string;
  file_path: string;
  line_number: number;
  column: number;
  color: string;
  user_name: string;
  updated_at: string;
}

export class CollaborationService {
  constructor(private db: Database.Database) {}

  /**
   * Create a new collaboration session
   */
  createSession(
    workspaceId: string,
    name: string,
    description: string,
    createdBy: string,
    settings: any = {}
  ): CollaborationSession {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO collaboration_sessions (id, workspace_id, name, description, created_by, participants, settings, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      workspaceId,
      name,
      description,
      createdBy,
      JSON.stringify([createdBy]),
      JSON.stringify(settings),
      1,
      now,
      now
    );

    return this.getSession(id)!;
  }

  /**
   * Get collaboration session
   */
  getSession(id: string): CollaborationSession | null {
    const stmt = this.db.prepare(`
      SELECT * FROM collaboration_sessions WHERE id = ?
    `);

    const session = stmt.get(id) as any;

    if (!session) return null;

    return {
      ...session,
      is_active: Boolean(session.is_active),
      participants: JSON.parse(session.participants || '[]'),
      settings: JSON.parse(session.settings || '{}')
    };
  }

  /**
   * Join collaboration session
   */
  joinSession(sessionId: string, userId: string): CollaborationSession | null {
    const session = this.getSession(sessionId);
    if (!session || !session.is_active) return null;

    const participants = new Set(session.participants);
    participants.add(userId);

    const stmt = this.db.prepare(`
      UPDATE collaboration_sessions
      SET participants = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(JSON.stringify([...participants]), new Date().toISOString(), sessionId);

    // Log join event
    this.logEvent(sessionId, userId, 'join', { message: 'User joined session' });

    return this.getSession(sessionId);
  }

  /**
   * Leave collaboration session
   */
  leaveSession(sessionId: string, userId: string): boolean {
    const session = this.getSession(sessionId);
    if (!session) return false;

    const participants = new Set(session.participants);
    participants.delete(userId);

    const stmt = this.db.prepare(`
      UPDATE collaboration_sessions
      SET participants = ?, updated_at = ?
      WHERE id = ?
    `);

    const result = stmt.run(JSON.stringify([...participants]), new Date().toISOString(), sessionId);

    // Log leave event
    this.logEvent(sessionId, userId, 'leave', { message: 'User left session' });

    return result.changes > 0;
  }

  /**
   * Log collaboration event
   */
  logEvent(
    sessionId: string,
    userId: string,
    eventType: CollaborationEvent['event_type'],
    eventData: any
  ): CollaborationEvent {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO collaboration_events (id, session_id, user_id, event_type, event_data, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, sessionId, userId, eventType, JSON.stringify(eventData), now);

    return this.getEvent(id)!;
  }

  /**
   * Get collaboration event
   */
  getEvent(id: string): CollaborationEvent | null {
    const stmt = this.db.prepare(`
      SELECT * FROM collaboration_events WHERE id = ?
    `);

    const event = stmt.get(id) as any;

    if (!event) return null;

    return {
      ...event,
      event_data: JSON.parse(event.event_data || '{}')
    };
  }

  /**
   * Get session events
   */
  getSessionEvents(sessionId: string, limit: number = 50): CollaborationEvent[] {
    const stmt = this.db.prepare(`
      SELECT * FROM collaboration_events
      WHERE session_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `);

    const events = stmt.all(sessionId, limit) as any[];

    return events.map(event => ({
      ...event,
      event_data: JSON.parse(event.event_data || '{}')
    })).reverse(); // Return in chronological order
  }

  /**
   * Add code comment
   */
  addCodeComment(
    sessionId: string,
    filePath: string,
    lineNumber: number,
    columnStart: number,
    columnEnd: number,
    content: string,
    authorId: string
  ): CodeComment {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO code_comments (id, session_id, file_path, line_number, column_start, column_end, content, author_id, is_resolved, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, sessionId, filePath, lineNumber, columnStart, columnEnd, content, authorId, 0, now, now);

    return this.getCodeComment(id)!;
  }

  /**
   * Get code comment
   */
  getCodeComment(id: string): CodeComment | null {
    const stmt = this.db.prepare(`
      SELECT * FROM code_comments WHERE id = ?
    `);

    const comment = stmt.get(id) as any;

    if (!comment) return null;

    return {
      ...comment,
      is_resolved: Boolean(comment.is_resolved)
    };
  }

  /**
   * Get file comments
   */
  getFileComments(sessionId: string, filePath: string): CodeComment[] {
    const stmt = this.db.prepare(`
      SELECT * FROM code_comments
      WHERE session_id = ? AND file_path = ?
      ORDER BY line_number, column_start
    `);

    const comments = stmt.all(sessionId, filePath) as any[];

    return comments.map(comment => ({
      ...comment,
      is_resolved: Boolean(comment.is_resolved)
    }));
  }

  /**
   * Update live cursor position
   */
  updateLiveCursor(
    sessionId: string,
    userId: string,
    filePath: string,
    lineNumber: number,
    column: number,
    color: string,
    userName: string
  ): LiveCursor {
    const id = uuidv4();
    const now = new Date().toISOString();

    // First, remove old cursor position for this user
    this.db.prepare(`
      DELETE FROM live_cursors
      WHERE session_id = ? AND user_id = ?
    `).run(sessionId, userId);

    // Insert new cursor position
    const stmt = this.db.prepare(`
      INSERT INTO live_cursors (id, session_id, user_id, file_path, line_number, column, color, user_name, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, sessionId, userId, filePath, lineNumber, column, color, userName, now);

    return this.getLiveCursor(id)!;
  }

  /**
   * Get live cursor
   */
  getLiveCursor(id: string): LiveCursor | null {
    const stmt = this.db.prepare(`
      SELECT * FROM live_cursors WHERE id = ?
    `);

    return stmt.get(id) as LiveCursor;
  }

  /**
   * Get all live cursors for a session
   */
  getLiveCursors(sessionId: string): LiveCursor[] {
    const stmt = this.db.prepare(`
      SELECT * FROM live_cursors
      WHERE session_id = ? AND updated_at > datetime('now', '-5 seconds')
    `);

    return stmt.all(sessionId) as LiveCursor[];
  }

  /**
   * Clean up old cursors (older than 5 seconds)
   */
  cleanupOldCursors(): number {
    const stmt = this.db.prepare(`
      DELETE FROM live_cursors
      WHERE updated_at < datetime('now', '-5 seconds')
    `);

    const result = stmt.run();
    return result.changes;
  }

  /**
   * Initialize collaboration tables
   */
  static initTables(db: Database.Database): void {
    // Collaboration sessions table
    db.exec(`
      CREATE TABLE IF NOT EXISTS collaboration_sessions (
        id TEXT PRIMARY KEY,
        workspace_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        created_by TEXT NOT NULL,
        participants TEXT NOT NULL,
        settings TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Collaboration events table
    db.exec(`
      CREATE TABLE IF NOT EXISTS collaboration_events (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        event_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Code comments table
    db.exec(`
      CREATE TABLE IF NOT EXISTS code_comments (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        file_path TEXT NOT NULL,
        line_number INTEGER NOT NULL,
        column_start INTEGER NOT NULL,
        column_end INTEGER NOT NULL,
        content TEXT NOT NULL,
        author_id TEXT NOT NULL,
        is_resolved INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Live cursors table
    db.exec(`
      CREATE TABLE IF NOT EXISTS live_cursors (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        file_path TEXT NOT NULL,
        line_number INTEGER NOT NULL,
        column INTEGER NOT NULL,
        color TEXT NOT NULL,
        user_name TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Collaboration tables initialized');
  }
}

export const createCollaborationService = (db: Database.Database): CollaborationService => {
  return new CollaborationService(db);
};