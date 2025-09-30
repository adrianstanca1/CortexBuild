import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';

// Enable verbose mode for debugging
const sqlite = sqlite3.verbose();

export class Database {
  private db: sqlite3.Database;
  private isConnected = false;

  constructor(dbPath?: string) {
    const databasePath = dbPath || path.join(process.cwd(), 'database.sqlite');
    this.db = new sqlite.Database(databasePath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to SQLite database:', databasePath);
        this.isConnected = true;
        // Enable foreign keys
        this.db.run('PRAGMA foreign_keys = ON');
      }
    });
  }

  // Promisified methods for easier async/await usage
  run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as T);
        }
      });
    });
  }

  all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows as T[]);
        }
      });
    });
  }

  // Transaction support
  async transaction<T>(callback: (db: Database) => Promise<T>): Promise<T> {
    await this.run('BEGIN TRANSACTION');
    try {
      const result = await callback(this);
      await this.run('COMMIT');
      return result;
    } catch (error) {
      await this.run('ROLLBACK');
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: 'connected' | 'disconnected'; responseTime?: number }> {
    const startTime = Date.now();
    try {
      await this.get('SELECT 1 as test');
      const responseTime = Date.now() - startTime;
      return { status: 'connected', responseTime };
    } catch (error) {
      console.error('Database health check failed:', error);
      return { status: 'disconnected' };
    }
  }

  // Get database statistics
  async getStats(): Promise<{
    tables: number;
    totalRows: number;
    databaseSize: number;
  }> {
    try {
      // Get table count
      const tables = await this.all(`
        SELECT COUNT(*) as count 
        FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `);
      
      // Get total row count across all tables
      const tableNames = await this.all(`
        SELECT name 
        FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `);
      
      let totalRows = 0;
      for (const table of tableNames as { name: string }[]) {
        const result = await this.get(`SELECT COUNT(*) as count FROM ${table.name}`);
        totalRows += (result as { count: number }).count;
      }

      // Get database size (page_count * page_size)
      const pageCount = await this.get('PRAGMA page_count');
      const pageSize = await this.get('PRAGMA page_size');
      const databaseSize = ((pageCount as any).page_count || 0) * ((pageSize as any).page_size || 0);

      return {
        tables: (tables[0] as { count: number }).count,
        totalRows,
        databaseSize
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      return { tables: 0, totalRows: 0, databaseSize: 0 };
    }
  }

  // Close connection
  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          this.isConnected = false;
          console.log('Database connection closed');
          resolve();
        }
      });
    });
  }

  // Check if connected
  get connected(): boolean {
    return this.isConnected;
  }

  // Get raw database instance (use sparingly)
  get instance(): sqlite3.Database {
    return this.db;
  }
}

// Singleton instance
let dbInstance: Database | null = null;

export function getDatabase(): Database {
  if (!dbInstance) {
    dbInstance = new Database();
  }
  return dbInstance;
}

export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
  }
}

// Export the Database class and singleton getter
export default Database;
