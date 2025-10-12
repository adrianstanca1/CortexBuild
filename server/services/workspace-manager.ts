/**
 * Workspace Manager Service
 * Handles developer workspaces, collaboration, and project management
 */

import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

export interface Workspace {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  is_public: boolean;
  settings: any;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: string[];
  joined_at: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template_data: any;
  created_by: string;
  is_public: boolean;
  created_at: string;
}

export class WorkspaceManager {
  constructor(private db: Database.Database) {}

  /**
   * Create a new workspace
   */
  createWorkspace(
    name: string,
    description: string,
    ownerId: string,
    isPublic: boolean = false,
    settings: any = {}
  ): Workspace {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO workspaces (id, name, description, owner_id, is_public, settings, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, name, description, ownerId, isPublic ? 1 : 0, JSON.stringify(settings), now, now);

    return this.getWorkspace(id)!;
  }

  /**
   * Get workspace by ID
   */
  getWorkspace(id: string): Workspace | null {
    const stmt = this.db.prepare(`
      SELECT * FROM workspaces WHERE id = ?
    `);

    const workspace = stmt.get(id) as any;

    if (!workspace) return null;

    return {
      ...workspace,
      is_public: Boolean(workspace.is_public),
      settings: JSON.parse(workspace.settings || '{}')
    };
  }

  /**
   * Update workspace
   */
  updateWorkspace(id: string, updates: Partial<Workspace>): Workspace | null {
    const workspace = this.getWorkspace(id);
    if (!workspace) return null;

    const stmt = this.db.prepare(`
      UPDATE workspaces
      SET name = ?, description = ?, is_public = ?, settings = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      updates.name || workspace.name,
      updates.description || workspace.description,
      updates.is_public !== undefined ? (updates.is_public ? 1 : 0) : workspace.is_public,
      JSON.stringify(updates.settings || workspace.settings),
      new Date().toISOString(),
      id
    );

    return this.getWorkspace(id);
  }

  /**
   * Delete workspace
   */
  deleteWorkspace(id: string): boolean {
    const stmt = this.db.prepare(`DELETE FROM workspaces WHERE id = ?`);
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Add member to workspace
   */
  addWorkspaceMember(
    workspaceId: string,
    userId: string,
    role: WorkspaceMember['role'] = 'member',
    permissions: string[] = []
  ): WorkspaceMember {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO workspace_members (id, workspace_id, user_id, role, permissions, joined_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, workspaceId, userId, role, JSON.stringify(permissions), now);

    return this.getWorkspaceMember(id)!;
  }

  /**
   * Get workspace member
   */
  getWorkspaceMember(id: string): WorkspaceMember | null {
    const stmt = this.db.prepare(`
      SELECT * FROM workspace_members WHERE id = ?
    `);

    const member = stmt.get(id) as any;

    if (!member) return null;

    return {
      ...member,
      permissions: JSON.parse(member.permissions || '[]')
    };
  }

  /**
   * Get workspace members
   */
  getWorkspaceMembers(workspaceId: string): WorkspaceMember[] {
    const stmt = this.db.prepare(`
      SELECT * FROM workspace_members WHERE workspace_id = ? ORDER BY joined_at
    `);

    const members = stmt.all(workspaceId) as any[];

    return members.map(member => ({
      ...member,
      permissions: JSON.parse(member.permissions || '[]')
    }));
  }

  /**
   * Update member role
   */
  updateMemberRole(memberId: string, role: WorkspaceMember['role']): WorkspaceMember | null {
    const stmt = this.db.prepare(`
      UPDATE workspace_members SET role = ? WHERE id = ?
    `);

    stmt.run(role, memberId);

    return this.getWorkspaceMember(memberId);
  }

  /**
   * Remove member from workspace
   */
  removeWorkspaceMember(memberId: string): boolean {
    const stmt = this.db.prepare(`DELETE FROM workspace_members WHERE id = ?`);
    const result = stmt.run(memberId);
    return result.changes > 0;
  }

  /**
   * Create project template
   */
  createProjectTemplate(
    name: string,
    description: string,
    category: string,
    templateData: any,
    createdBy: string,
    isPublic: boolean = false
  ): ProjectTemplate {
    const id = uuidv4();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO project_templates (id, name, description, category, template_data, created_by, is_public, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, name, description, category, JSON.stringify(templateData), createdBy, isPublic ? 1 : 0, now);

    return this.getProjectTemplate(id)!;
  }

  /**
   * Get project template
   */
  getProjectTemplate(id: string): ProjectTemplate | null {
    const stmt = this.db.prepare(`
      SELECT * FROM project_templates WHERE id = ?
    `);

    const template = stmt.get(id) as any;

    if (!template) return null;

    return {
      ...template,
      is_public: Boolean(template.is_public),
      template_data: JSON.parse(template.template_data || '{}')
    };
  }

  /**
   * Get project templates by category
   */
  getProjectTemplates(category?: string): ProjectTemplate[] {
    let query = `SELECT * FROM project_templates WHERE is_public = 1`;
    const params: any[] = [];

    if (category) {
      query += ` AND category = ?`;
      params.push(category);
    }

    query += ` ORDER BY created_at DESC`;

    const stmt = this.db.prepare(query);
    const templates = stmt.all(...params) as any[];

    return templates.map(template => ({
      ...template,
      is_public: Boolean(template.is_public),
      template_data: JSON.parse(template.template_data || '{}')
    }));
  }

  /**
   * Initialize workspace tables
   */
  static initTables(db: Database.Database): void {
    // Workspaces table
    db.exec(`
      CREATE TABLE IF NOT EXISTS workspaces (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        owner_id TEXT NOT NULL,
        is_public INTEGER DEFAULT 0,
        settings TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id)
      )
    `);

    // Workspace members table
    db.exec(`
      CREATE TABLE IF NOT EXISTS workspace_members (
        id TEXT PRIMARY KEY,
        workspace_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT DEFAULT 'member',
        permissions TEXT,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(workspace_id, user_id)
      )
    `);

    // Project templates table
    db.exec(`
      CREATE TABLE IF NOT EXISTS project_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        template_data TEXT NOT NULL,
        created_by TEXT NOT NULL,
        is_public INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    // Workspace projects table
    db.exec(`
      CREATE TABLE IF NOT EXISTS workspace_projects (
        id TEXT PRIMARY KEY,
        workspace_id TEXT NOT NULL,
        project_id TEXT NOT NULL,
        added_by TEXT NOT NULL,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (added_by) REFERENCES users(id)
      )
    `);

    console.log('✅ Workspace tables initialized');
  }
}

export const createWorkspaceManager = (db: Database.Database): WorkspaceManager => {
  return new WorkspaceManager(db);
};