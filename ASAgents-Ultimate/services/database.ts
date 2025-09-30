// Database Service - PostgreSQL/Supabase Integration
import { Pool, PoolClient, QueryResult } from 'pg';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import environment from '../config/environment';

export interface DatabaseConfig {
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean;
}

export interface QueryOptions {
  values?: any[];
  timeout?: number;
}

export interface TransactionCallback<T> {
  (client: PoolClient): Promise<T>;
}

class DatabaseService {
  private pool: Pool | null = null;
  private supabase: SupabaseClient | null = null;
  private useSupabase: boolean = false;

  constructor() {
    this.initialize();
  }

  // Initialize database connection
  private async initialize(): Promise<void> {
    try {
      // Check if we should use Supabase
      if (environment.supabaseUrl && environment.supabaseAnonKey) {
        this.useSupabase = true;
        this.supabase = createClient(
          environment.supabaseUrl,
          environment.supabaseAnonKey
        );
        console.log('✅ Supabase client initialized');
        return;
      }

      // Otherwise use PostgreSQL
      const config: DatabaseConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'asagents',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        ssl: process.env.DB_SSL === 'true',
      };

      this.pool = new Pool({
        ...config,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Test connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      console.log('✅ PostgreSQL connection pool initialized');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  // Execute a query
  async query<T = any>(
    text: string,
    options: QueryOptions = {}
  ): Promise<QueryResult<T>> {
    if (this.useSupabase && this.supabase) {
      throw new Error('Use Supabase client methods directly for queries');
    }

    if (!this.pool) {
      throw new Error('Database not initialized');
    }

    const start = Date.now();
    try {
      const result = await this.pool.query<T>(text, options.values);
      const duration = Date.now() - start;
      console.log('Query executed:', { text, duration, rows: result.rowCount });
      return result;
    } catch (error) {
      console.error('Query failed:', { text, error });
      throw error;
    }
  }

  // Execute a transaction
  async transaction<T>(callback: TransactionCallback<T>): Promise<T> {
    if (this.useSupabase) {
      throw new Error('Use Supabase RPC for transactions');
    }

    if (!this.pool) {
      throw new Error('Database not initialized');
    }

    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get Supabase client (if using Supabase)
  getSupabase(): SupabaseClient {
    if (!this.supabase) {
      throw new Error('Supabase not initialized');
    }
    return this.supabase;
  }

  // Check if using Supabase
  isUsingSupabase(): boolean {
    return this.useSupabase;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      if (this.useSupabase && this.supabase) {
        const { error } = await this.supabase
          .from('health_check')
          .select('*')
          .limit(1);
        return !error;
      }

      if (this.pool) {
        const result = await this.pool.query('SELECT 1');
        return result.rowCount === 1;
      }

      return false;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Close connections
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      console.log('Database pool closed');
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
export default databaseService;
