/**
 * Database Abstraction Layer
 * Provides seamless switching between SQLite (local/dev) and Supabase (cloud/production)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Database from 'better-sqlite3';

// Database provider interface
export interface DatabaseProvider {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  queryOne<T = any>(sql: string, params?: any[]): Promise<T | undefined>;
  execute(sql: string, params?: any[]): Promise<{ changes: number; lastInsertRowid?: number }>;
  transaction<T>(callback: (tx: DatabaseProvider) => Promise<T>): Promise<T>;
  subscribe?(table: string, callback: (data: any) => void): () => void;
  close?(): void;
}

// SQLite implementation
export class SQLiteProvider implements DatabaseProvider {
  private db: Database.Database;

  constructor(dbPath: string = './cortexbuild.db') {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      const stmt = this.db.prepare(sql);
      const results = stmt.all(...params) as T[];
      return results;
    } catch (error) {
      console.error('SQLite query error:', error);
      throw error;
    }
  }

  async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    try {
      const stmt = this.db.prepare(sql);
      const result = stmt.get(...params) as T | undefined;
      return result;
    } catch (error) {
      console.error('SQLite queryOne error:', error);
      throw error;
    }
  }

  async execute(sql: string, params: any[] = []): Promise<{ changes: number; lastInsertRowid?: number }> {
    try {
      const stmt = this.db.prepare(sql);
      const result = stmt.run(...params);
      return {
        changes: result.changes,
        lastInsertRowid: Number(result.lastInsertRowid)
      };
    } catch (error) {
      console.error('SQLite execute error:', error);
      throw error;
    }
  }

  async transaction<T>(callback: (tx: DatabaseProvider) => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.db.transaction(async () => {
        try {
          const result = await callback(this);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      })();
    });
  }

  close() {
    this.db.close();
  }

  // Direct access to underlying database for complex operations
  getDb(): Database.Database {
    return this.db;
  }
}

// Supabase implementation
export class SupabaseProvider implements DatabaseProvider {
  private client: SupabaseClient;

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    const url = supabaseUrl || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const key = supabaseKey || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error('Supabase URL and key are required');
    }

    this.client = createClient(url, key);
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      // Execute raw SQL via Supabase RPC function
      const { data, error } = await this.client.rpc('execute_sql', {
        query: sql,
        parameters: params
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
  }

  async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    const results = await this.query<T>(sql, params);
    return results[0];
  }

  async execute(sql: string, params: any[] = []): Promise<{ changes: number; lastInsertRowid?: number }> {
    try {
      const { data, error } = await this.client.rpc('execute_sql', {
        query: sql,
        parameters: params
      });

      if (error) throw error;

      return {
        changes: data?.changes || 0,
        lastInsertRowid: data?.lastInsertRowid
      };
    } catch (error) {
      console.error('Supabase execute error:', error);
      throw error;
    }
  }

  async transaction<T>(callback: (tx: DatabaseProvider) => Promise<T>): Promise<T> {
    // Supabase handles transactions automatically for most operations
    // For complex transactions, we'd need to implement custom logic
    return await callback(this);
  }

  subscribe(table: string, callback: (data: any) => void): () => void {
    const subscription = this.client
      .channel(`${table}_changes`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => callback(payload)
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
    };
  }

  // Direct access to Supabase client for complex operations
  getClient(): SupabaseClient {
    return this.client;
  }
}

// Unified database interface with automatic provider selection
export class UnifiedDatabase implements DatabaseProvider {
  private provider: DatabaseProvider;
  private providerType: 'sqlite' | 'supabase';

  constructor(options?: {
    provider?: 'sqlite' | 'supabase';
    sqlitePath?: string;
    supabaseUrl?: string;
    supabaseKey?: string;
  }) {
    // Auto-detect provider based on environment
    const preferredProvider = options?.provider ||
      (process.env.DATABASE_PROVIDER as 'sqlite' | 'supabase') ||
      'sqlite';

    this.providerType = preferredProvider;

    if (preferredProvider === 'supabase') {
      try {
        this.provider = new SupabaseProvider(options?.supabaseUrl, options?.supabaseKey);
        console.log('✅ Using Supabase database provider');
      } catch (error) {
        console.warn('⚠️ Supabase provider failed, falling back to SQLite:', error);
        this.provider = new SQLiteProvider(options?.sqlitePath);
        this.providerType = 'sqlite';
      }
    } else {
      this.provider = new SQLiteProvider(options?.sqlitePath);
      console.log('✅ Using SQLite database provider');
    }
  }

  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    return this.provider.query<T>(sql, params);
  }

  async queryOne<T = any>(sql: string, params?: any[]): Promise<T | undefined> {
    return this.provider.queryOne<T>(sql, params);
  }

  async execute(sql: string, params?: any[]): Promise<{ changes: number; lastInsertRowid?: number }> {
    return this.provider.execute(sql, params);
  }

  async transaction<T>(callback: (tx: DatabaseProvider) => Promise<T>): Promise<T> {
    return this.provider.transaction(callback);
  }

  subscribe(table: string, callback: (data: any) => void): () => void {
    if (this.provider.subscribe) {
      return this.provider.subscribe(table, callback);
    }
    // Return no-op unsubscribe for providers that don't support subscriptions
    return () => {};
  }

  getProviderType(): 'sqlite' | 'supabase' {
    return this.providerType;
  }

  getProvider(): DatabaseProvider {
    return this.provider;
  }

  close() {
    if (this.provider.close) {
      this.provider.close();
    }
  }
}

// Singleton instance
let dbInstance: UnifiedDatabase | null = null;

export function getDatabase(options?: {
  provider?: 'sqlite' | 'supabase';
  sqlitePath?: string;
  supabaseUrl?: string;
  supabaseKey?: string;
  forceNew?: boolean;
}): UnifiedDatabase {
  if (!dbInstance || options?.forceNew) {
    dbInstance = new UnifiedDatabase(options);
  }
  return dbInstance;
}

// Helper functions for common database operations
export const dbHelpers = {
  /**
   * Build WHERE clause from filters
   */
  buildWhereClause(filters: Record<string, any>): { clause: string; params: any[] } {
    const conditions: string[] = [];
    const params: any[] = [];

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        conditions.push(`${key} = ?`);
        params.push(value);
      }
    }

    const clause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { clause, params };
  },

  /**
   * Build pagination clause
   */
  buildPaginationClause(page?: number, limit?: number): { clause: string; params: any[] } {
    if (!page || !limit) {
      return { clause: '', params: [] };
    }

    const offset = (page - 1) * limit;
    return {
      clause: 'LIMIT ? OFFSET ?',
      params: [limit, offset]
    };
  },

  /**
   * Convert snake_case to camelCase
   */
  snakeToCamel(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => dbHelpers.snakeToCamel(item));
    }

    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = dbHelpers.snakeToCamel(obj[key]);
      return acc;
    }, {} as any);
  },

  /**
   * Convert camelCase to snake_case
   */
  camelToSnake(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => dbHelpers.camelToSnake(item));
    }

    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      acc[snakeKey] = dbHelpers.camelToSnake(obj[key]);
      return acc;
    }, {} as any);
  }
};

export default getDatabase;
