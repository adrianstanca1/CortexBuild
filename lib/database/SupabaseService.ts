/**
 * Supabase Database Service
 * Implementation of IDatabaseAdapter for Supabase PostgreSQL
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
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

export class SupabaseService implements IDatabaseAdapter {
  private client: SupabaseClient | null = null;
  private config: DatabaseConfig;
  private connected: boolean = false;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      if (!this.config.supabase) {
        throw new ValidationError('Supabase configuration is missing');
      }

      const { url, anonKey } = this.config.supabase;
      
      if (!url || !anonKey) {
        throw new ValidationError('Supabase URL and anon key are required');
      }

      this.client = createClient(url, anonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
        },
      });

      // Test connection
      const { error } = await this.client.from('companies').select('count').limit(1);
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is ok
        throw new ConnectionError('Failed to connect to Supabase', error);
      }

      this.connected = true;
      console.log('✅ Supabase connected successfully');
    } catch (error) {
      this.connected = false;
      throw new ConnectionError('Failed to initialize Supabase client', error);
    }
  }

  async disconnect(): Promise<void> {
    this.client = null;
    this.connected = false;
    console.log('🔌 Supabase disconnected');
  }

  isConnected(): boolean {
    return this.connected && this.client !== null;
  }

  private ensureConnected(): void {
    if (!this.client || !this.connected) {
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
      let query = this.client!.from(table).select('*', { count: 'exact' });

      // Apply filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Apply options
      if (options?.orderBy) {
        query = query.order(options.orderBy, { ascending: options.orderDirection !== 'desc' });
      }
      
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        return { data: null, error: new QueryError(error.message, error), count: 0 };
      }

      return { data: data as T[], error: null, count: count || 0 };
    } catch (error) {
      return { data: null, error: new QueryError('Select query failed', error) };
    }
  }

  async selectOne<T = any>(table: string, filters: Record<string, any>): Promise<QueryResult<T>> {
    this.ensureConnected();
    
    try {
      let query = this.client!.from(table).select('*');

      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query.single();

      if (error) {
        return { data: null, error: new QueryError(error.message, error) };
      }

      return { data: data as T, error: null };
    } catch (error) {
      return { data: null, error: new QueryError('SelectOne query failed', error) };
    }
  }

  async insert<T = any>(table: string, data: Record<string, any>): Promise<QueryResult<T>> {
    this.ensureConnected();
    
    try {
      const { data: result, error } = await this.client!
        .from(table)
        .insert(data)
        .select()
        .single();

      if (error) {
        return { data: null, error: new QueryError(error.message, error) };
      }

      return { data: result as T, error: null };
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
      let query = this.client!.from(table).update(data);

      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data: result, error } = await query.select().single();

      if (error) {
        return { data: null, error: new QueryError(error.message, error) };
      }

      return { data: result as T, error: null };
    } catch (error) {
      return { data: null, error: new QueryError('Update query failed', error) };
    }
  }

  async delete(table: string, filters: Record<string, any>): Promise<QueryResult<void>> {
    this.ensureConnected();
    
    try {
      let query = this.client!.from(table).delete();

      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { error } = await query;

      if (error) {
        return { data: null, error: new QueryError(error.message, error) };
      }

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
    return this.insert<User>('users', user);
  }

  async updateUser(id: string, data: Partial<User>): Promise<QueryResult<User>> {
    return this.update<User>('users', { id }, data);
  }

  // Company Operations
  async findCompanyById(id: string): Promise<QueryResult<Company>> {
    return this.selectOne<Company>('companies', { id });
  }

  async findCompanyByName(name: string): Promise<QueryResult<Company>> {
    return this.selectOne<Company>('companies', { name });
  }

  async createCompany(company: Partial<Company>): Promise<QueryResult<Company>> {
    return this.insert<Company>('companies', company);
  }

  async updateCompany(id: string, data: Partial<Company>): Promise<QueryResult<Company>> {
    return this.update<Company>('companies', { id }, data);
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
    return this.insert<Project>('projects', project);
  }

  async updateProject(id: string | number, data: Partial<Project>): Promise<QueryResult<Project>> {
    return this.update<Project>('projects', { id }, data);
  }

  async deleteProject(id: string | number): Promise<QueryResult<void>> {
    return this.delete('projects', { id });
  }

  // Transaction Support
  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    // Supabase doesn't have explicit transaction support in the client library
    // Transactions are handled at the database level via RPC functions
    // For now, we just execute the callback
    return callback();
  }

  // Real-time Subscriptions
  subscribe(table: string, callback: (payload: any) => void): () => void {
    this.ensureConnected();
    
    const channel = this.client!
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
        },
        (payload) => callback(payload)
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      channel.unsubscribe();
    };
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
    
    for (const [table, rows] of Object.entries(data)) {
      if (rows.length > 0) {
        const { error } = await this.client!.from(table).insert(rows);
        if (error) {
          console.error(`Failed to import ${table}:`, error);
        }
      }
    }
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.client) return false;
      
      const { error } = await this.client.from('companies').select('count').limit(1);
      return !error || error.code === 'PGRST116'; // PGRST116 is ok (no rows)
    } catch {
      return false;
    }
  }
}


