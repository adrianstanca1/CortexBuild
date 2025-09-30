/**
 * Database Service - Connection and Query Interface
 * Provides a unified interface for database operations
 */

import { Pool, PoolConfig, QueryResult } from 'pg';

// Database configuration
const dbConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'asagents',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
let pool: Pool | null = null;

/**
 * Initialize database connection pool
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    pool = new Pool(dbConfig);
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

/**
 * Get database pool instance
 */
export const getPool = (): Pool => {
  if (!pool) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return pool;
};

/**
 * Execute a SQL query
 */
export const query = async <T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> => {
  const client = await getPool().connect();
  try {
    const result = await client.query<T>(text, params);
    return result;
  } finally {
    client.release();
  }
};

/**
 * Execute a transaction
 */
export const transaction = async <T = any>(
  callback: (client: any) => Promise<T>
): Promise<T> => {
  const client = await getPool().connect();
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
};

/**
 * Close database connection
 */
export const closeDatabase = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Database connection closed');
  }
};

// Database service interface
export const databaseService = {
  initialize: initializeDatabase,
  query,
  transaction,
  close: closeDatabase,
  getPool,
};

export default databaseService;
