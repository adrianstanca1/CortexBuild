/**
 * SQLite Database Service
 * Implementation of IDatabaseAdapter for better-sqlite3
 * This service is designed for backend use only (Node.js environment)
 */

import Database from 'better-sqlite3';
import {
  IDatabaseAdapter,
  QueryResult,
  User,
  Company,
  Project,
  DatabaseConfig,
  ConnectionError,
  QueryError,
  ValidationError,
} from './DatabaseAdapter';

export class SQLiteService implements IDatabaseAdapter {
  private db: Database.Database | null = null;
  private config: DatabaseConfig;
  private connected: boolean = false;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      if (!this.config.sqlite) {
        throw new ValidationError('SQLite configuration is missing');
      }

      const { path } = this.config.sqlite;
      
      if (!path) {
        throw new ValidationError('SQLite database path is required');
      }

      this.db = new Database(path);
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('foreign_keys = ON');

      this.connected = true;
      console.log('✅ SQLite connected successfully:', path);
    } catch (error) {
      this.connected = false;
      throw new ConnectionError('Failed to initialize SQLite database', error);
    }
  }

  async disconnect(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.connected = false;
    console.log('🔌 SQLite disconnected');
  }

  isConnected(): boolean {
    return this.connected && this.db !== null;
  }

  private ensureConnected(): void {
    if (!this.db || !this.connected) {
      throw new ConnectionError('Database not connected. Call connect() first.');
    }
  }

  // Generic CRUD Operations
  async select<T = any>(
    table: string,
    filters?: Record<string, any>,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      orderDirection?: 'asc' | 'desc';
    }
  ): Promise<QueryResult<T[]>> {
    this.ensureConnected();
    
    try {
      let sql = `SELECT * FROM ${table}`;
      const params: any[] = [];

      // Apply filters
      if (filters && Object.keys(filters).length > 0) {
        const conditions = Object.entries(filters).map(([key, value]) => {
          params.push(value);
          return `${key} = ?`;
        });
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }

      // Apply ordering
      if (options?.orderBy) {
        sql += ` ORDER BY ${options.orderBy} ${options.orderDirection || 'ASC'}`;
      }

      // Apply limit and offset
      if (options?.limit) {
        sql += ` LIMIT ${options.limit}`;
      }
      if (options?.offset) {
        sql += ` OFFSET ${options.offset}`;
      }

      const stmt = this.db!.prepare(sql);
      const data = stmt.all(...params) as T[];

      // Get count
      let countSql = `SELECT COUNT(*) as count FROM ${table}`;
      if (filters && Object.keys(filters).length > 0) {
        const conditions = Object.entries(filters).map(([key]) => `${key} = ?`);
        countSql += ` WHERE ${conditions.join(' AND ')}`;
      }
      const countStmt = this.db!.prepare(countSql);
      const countResult = countStmt.get(...Object.values(filters || {})) as { count: number };

      return { data, error: null, count: countResult.count };
    } catch (error) {
      return { data: null, error: new QueryError('Select query failed', error) };
    }
  }

  async selectOne<T = any>(table: string, filters: Record<string, any>): Promise<QueryResult<T>> {
    this.ensureConnected();
    
    try {
      const conditions = Object.entries(filters).map(([key]) => `${key} = ?`);
      const sql = `SELECT * FROM ${table} WHERE ${conditions.join(' AND ')} LIMIT 1`;
      
      const stmt = this.db!.prepare(sql);
      const data = stmt.get(...Object.values(filters)) as T;

      return { data: data || null, error: null };
    } catch (error) {
      return { data: null, error: new QueryError('SelectOne query failed', error) };
    }
  }

  async insert<T = any>(table: string, data: Record<string, any>): Promise<QueryResult<T>> {
    this.ensureConnected();
    
    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map(() => '?').join(', ');
      
      const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
      
      const stmt = this.db!.prepare(sql);
      const result = stmt.run(...values);

      // Get the inserted row
      const selectSql = `SELECT * FROM ${table} WHERE rowid = ?`;
      const selectStmt = this.db!.prepare(selectSql);
      const insertedData = selectStmt.get(result.lastInsertRowid) as T;

      return { data: insertedData, error: null };
    } catch (error) {
      return { data: null, error: new QueryError('Insert query failed', error) };
    }
  }

  async update<T = any>(
    table: string,
    filters: Record<string, any>,
    data: Record<string, any>
  ): Promise<QueryResult<T>> {
    this.ensureConnected();
    
    try {
      const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const whereClause = Object.keys(filters).map(key => `${key} = ?`).join(' AND ');
      
      const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
      
      const stmt = this.db!.prepare(sql);
      stmt.run(...Object.values(data), ...Object.values(filters));

      // Get the updated row
      const selectResult = await this.selectOne<T>(table, filters);
      return selectResult;
    } catch (error) {
      return { data: null, error: new QueryError('Update query failed', error) };
    }
  }

  async delete(table: string, filters: Record<string, any>): Promise<QueryResult<void>> {
    this.ensureConnected();
    
    try {
      const whereClause = Object.keys(filters).map(key => `${key} = ?`).join(' AND ');
      const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
      
      const stmt = this.db!.prepare(sql);
      stmt.run(...Object.values(filters));

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: new QueryError('Delete query failed', error) };
    }
  }

  // User Operations
  async findUserByEmail(email: string): Promise<QueryResult<User>> {
    return this.selectOne<User>('users', { email });
  }

  async findUserById(id: string): Promise<QueryResult<User>> {
    return this.selectOne<User>('users', { id });
  }

  async createUser(user: Partial<User>): Promise<QueryResult<User>> {
    return this.insert<User>('users', user as Record<string, any>);
  }

  async updateUser(id: string, data: Partial<User>): Promise<QueryResult<User>> {
    return this.update<User>('users', { id }, data as Record<string, any>);
  }

  // Company Operations
  async findCompanyById(id: string): Promise<QueryResult<Company>> {
    return this.selectOne<Company>('companies', { id });
  }

  async findCompanyByName(name: string): Promise<QueryResult<Company>> {
    return this.selectOne<Company>('companies', { name });
  }

  async createCompany(company: Partial<Company>): Promise<QueryResult<Company>> {
    return this.insert<Company>('companies', company as Record<string, any>);
  }

  async updateCompany(id: string, data: Partial<Company>): Promise<QueryResult<Company>> {
    return this.update<Company>('companies', { id }, data as Record<string, any>);
  }

  async listCompanies(filters?: Record<string, any>): Promise<QueryResult<Company[]>> {
    return this.select<Company>('companies', filters);
  }

  // Project Operations
  async findProjectById(id: string | number): Promise<QueryResult<Project>> {
    return this.selectOne<Project>('projects', { id });
  }

  async listProjects(companyId: string, filters?: Record<string, any>): Promise<QueryResult<Project[]>> {
    return this.select<Project>('projects', { company_id: companyId, ...filters });
  }

  async createProject(project: Partial<Project>): Promise<QueryResult<Project>> {
    return this.insert<Project>('projects', project as Record<string, any>);
  }

  async updateProject(id: string | number, data: Partial<Project>): Promise<QueryResult<Project>> {
    return this.update<Project>('projects', { id }, data as Record<string, any>);
  }

  async deleteProject(id: string | number): Promise<QueryResult<void>> {
    return this.delete('projects', { id });
  }

  // Transaction Support
  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    this.ensureConnected();
    
    const transaction = this.db!.transaction(() => {
      return callback();
    });
    
    return transaction();
  }

  // Real-time Subscriptions (No-op for SQLite)
  subscribe(table: string, callback: (payload: any) => void): () => void {
    console.warn('Real-time subscriptions are not supported in SQLite');
    // Return a no-op unsubscribe function
    return () => {};
  }

  // Data Export/Import
  async exportData(): Promise<Record<string, any[]>> {
    this.ensureConnected();
    
    const tables = ['companies', 'users', 'projects', 'tasks', 'sdk_apps', 'user_app_installations'];
    const exportData: Record<string, any[]> = {};

    for (const table of tables) {
      const { data, error } = await this.select(table);
      if (!error && data) {
        exportData[table] = data;
      }
    }

    return exportData;
  }

  async importData(data: Record<string, any[]>): Promise<void> {
    this.ensureConnected();
    
    this.db!.transaction(() => {
      for (const [table, rows] of Object.entries(data)) {
        if (rows.length > 0) {
          for (const row of rows) {
            try {
              this.insert(table, row);
            } catch (error) {
              console.error(`Failed to import row in ${table}:`, error);
            }
          }
        }
      }
    })();
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.db) return false;
      
      const stmt = this.db.prepare('SELECT 1');
      stmt.get();
      return true;
    } catch {
      return false;
    }
  }
}


