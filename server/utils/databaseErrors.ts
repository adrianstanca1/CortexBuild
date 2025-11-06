import Database from 'better-sqlite3';
import { logger } from './logger';

/**
 * Database Error Types
 * Maps SQLite error codes to user-friendly messages
 */
export enum DatabaseErrorCode {
  CONSTRAINT_VIOLATION = 'SQLITE_CONSTRAINT',
  FOREIGN_KEY_VIOLATION = 'SQLITE_CONSTRAINT_FOREIGNKEY',
  UNIQUE_VIOLATION = 'SQLITE_CONSTRAINT_UNIQUE',
  NOT_NULL_VIOLATION = 'SQLITE_CONSTRAINT_NOTNULL',
  PRIMARY_KEY_VIOLATION = 'SQLITE_CONSTRAINT_PRIMARYKEY',
  BUSY = 'SQLITE_BUSY',
  LOCKED = 'SQLITE_LOCKED',
  READONLY = 'SQLITE_READONLY',
  IOERR = 'SQLITE_IOERR',
  CORRUPT = 'SQLITE_CORRUPT',
  FULL = 'SQLITE_FULL',
  CANTOPEN = 'SQLITE_CANTOPEN',
  PROTOCOL = 'SQLITE_PROTOCOL',
  SCHEMA = 'SQLITE_SCHEMA',
  TOOBIG = 'SQLITE_TOOBIG',
  MISMATCH = 'SQLITE_MISMATCH',
}

/**
 * Custom Database Error Class
 */
export class DatabaseError extends Error {
  public readonly code: string;
  public readonly errno?: number;
  public readonly query?: string;
  public readonly timestamp: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string = 'UNKNOWN',
    errno?: number,
    query?: string
  ) {
    super(message);
    this.code = code;
    this.errno = errno;
    this.query = query;
    this.timestamp = new Date().toISOString();
    this.isOperational = true;
    this.name = 'DatabaseError';

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Parse SQLite Error and Return User-Friendly Message
 */
export const parseDatabaseError = (err: any): DatabaseError => {
  const code = err.code || 'UNKNOWN';
  const errno = err.errno;
  const query = err.sql || undefined;

  // Constraint violations
  if (code.includes('CONSTRAINT')) {
    if (code.includes('UNIQUE')) {
      return new DatabaseError(
        'A record with this value already exists',
        DatabaseErrorCode.UNIQUE_VIOLATION,
        errno,
        query
      );
    }
    if (code.includes('FOREIGNKEY')) {
      return new DatabaseError(
        'Cannot complete operation: referenced record does not exist',
        DatabaseErrorCode.FOREIGN_KEY_VIOLATION,
        errno,
        query
      );
    }
    if (code.includes('NOTNULL')) {
      return new DatabaseError(
        'Required field is missing',
        DatabaseErrorCode.NOT_NULL_VIOLATION,
        errno,
        query
      );
    }
    if (code.includes('PRIMARYKEY')) {
      return new DatabaseError(
        'A record with this ID already exists',
        DatabaseErrorCode.PRIMARY_KEY_VIOLATION,
        errno,
        query
      );
    }
    return new DatabaseError(
      'Data validation failed',
      DatabaseErrorCode.CONSTRAINT_VIOLATION,
      errno,
      query
    );
  }

  // Database locked/busy errors
  if (code === 'SQLITE_BUSY' || code === 'SQLITE_LOCKED') {
    return new DatabaseError(
      'Database is temporarily busy. Please try again.',
      code,
      errno,
      query
    );
  }

  // Read-only errors
  if (code === 'SQLITE_READONLY') {
    return new DatabaseError(
      'Database is in read-only mode',
      DatabaseErrorCode.READONLY,
      errno,
      query
    );
  }

  // I/O errors
  if (code === 'SQLITE_IOERR') {
    return new DatabaseError(
      'Database I/O error occurred',
      DatabaseErrorCode.IOERR,
      errno,
      query
    );
  }

  // Corruption errors
  if (code === 'SQLITE_CORRUPT') {
    return new DatabaseError(
      'Database corruption detected. Please contact support.',
      DatabaseErrorCode.CORRUPT,
      errno,
      query
    );
  }

  // Disk full errors
  if (code === 'SQLITE_FULL') {
    return new DatabaseError(
      'Storage is full. Cannot save data.',
      DatabaseErrorCode.FULL,
      errno,
      query
    );
  }

  // Cannot open database
  if (code === 'SQLITE_CANTOPEN') {
    return new DatabaseError(
      'Cannot open database file',
      DatabaseErrorCode.CANTOPEN,
      errno,
      query
    );
  }

  // Schema errors
  if (code === 'SQLITE_SCHEMA') {
    return new DatabaseError(
      'Database schema has changed. Please refresh.',
      DatabaseErrorCode.SCHEMA,
      errno,
      query
    );
  }

  // Data too big
  if (code === 'SQLITE_TOOBIG') {
    return new DatabaseError(
      'Data is too large to process',
      DatabaseErrorCode.TOOBIG,
      errno,
      query
    );
  }

  // Type mismatch
  if (code === 'SQLITE_MISMATCH') {
    return new DatabaseError(
      'Data type mismatch',
      DatabaseErrorCode.MISMATCH,
      errno,
      query
    );
  }

  // Generic database error
  return new DatabaseError(
    err.message || 'Database operation failed',
    code,
    errno,
    query
  );
};

/**
 * Safe Database Query Wrapper
 * Automatically handles errors and retries
 */
export const safeQuery = async <T>(
  operation: () => T,
  maxRetries: number = 3,
  retryDelay: number = 100
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return operation();
    } catch (err: any) {
      lastError = err;

      // Log attempt
      logger.warn(`Database operation failed (attempt ${attempt}/${maxRetries})`, {
        code: err.code,
        message: err.message,
      });

      // If it's a busy/locked error, retry
      if (
        (err.code === 'SQLITE_BUSY' || err.code === 'SQLITE_LOCKED') &&
        attempt < maxRetries
      ) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        continue;
      }

      // For other errors, throw immediately
      throw parseDatabaseError(err);
    }
  }

  // Max retries reached
  throw parseDatabaseError(lastError);
};

/**
 * Transaction Wrapper with Automatic Rollback
 * Ensures transactions are properly rolled back on error
 */
export const safeTransaction = <T>(
  db: Database.Database,
  operation: () => T
): T => {
  const transaction = db.transaction(operation);

  try {
    return transaction();
  } catch (err: any) {
    logger.error('Transaction failed and rolled back', {
      code: err.code,
      message: err.message,
    });
    throw parseDatabaseError(err);
  }
};

/**
 * Database Health Check
 * Verifies database is accessible and functional
 */
export const checkDatabaseHealth = (db: Database.Database): boolean => {
  try {
    // Simple query to verify database is working
    const result = db.prepare('SELECT 1 as health').get();
    return result && (result as any).health === 1;
  } catch (err: any) {
    logger.error('Database health check failed', {
      code: err.code,
      message: err.message,
    });
    return false;
  }
};

/**
 * Database Backup Helper
 * Creates a backup of the database file
 */
export const createBackup = async (
  db: Database.Database,
  backupPath: string
): Promise<void> => {
  try {
    await db.backup(backupPath);
    logger.info(`Database backup created: ${backupPath}`);
  } catch (err: any) {
    logger.error('Database backup failed', {
      code: err.code,
      message: err.message,
      path: backupPath,
    });
    throw parseDatabaseError(err);
  }
};

/**
 * Connection Pool Recovery
 * Attempts to recover from connection issues
 */
export const recoverConnection = (
  dbPath: string,
  options: Database.Options = {}
): Database.Database | null => {
  try {
    logger.info('Attempting database connection recovery...');
    
    const db = new Database(dbPath, {
      ...options,
      timeout: 5000, // 5 second timeout
    });

    // Verify connection works
    if (checkDatabaseHealth(db)) {
      logger.info('✅ Database connection recovered successfully');
      return db;
    } else {
      logger.error('❌ Database health check failed after recovery attempt');
      return null;
    }
  } catch (err: any) {
    logger.error('Database connection recovery failed', {
      code: err.code,
      message: err.message,
      path: dbPath,
    });
    return null;
  }
};

/**
 * Graceful Database Shutdown
 * Ensures WAL checkpoint and proper cleanup
 */
export const shutdownDatabase = (db: Database.Database): void => {
  try {
    logger.info('Shutting down database gracefully...');

    // Checkpoint WAL to main database
    db.pragma('wal_checkpoint(TRUNCATE)');
    logger.info('✅ WAL checkpoint complete');

    // Close database connection
    db.close();
    logger.info('✅ Database connection closed');
  } catch (err: any) {
    logger.error('Error during database shutdown', {
      code: err.code,
      message: err.message,
    });
    // Force close even if checkpoint fails
    try {
      db.close();
    } catch (closeErr) {
      logger.error('Failed to close database', closeErr);
    }
  }
};

/**
 * Usage Examples:
 * 
 * 1. Safe query with retry:
 *    const users = await safeQuery(() => 
 *      db.prepare('SELECT * FROM users WHERE company_id = ?').all(companyId)
 *    );
 * 
 * 2. Safe transaction:
 *    const result = safeTransaction(db, () => {
 *      db.prepare('INSERT INTO projects ...').run(data);
 *      db.prepare('INSERT INTO tasks ...').run(taskData);
 *      return { success: true };
 *    });
 * 
 * 3. Error handling in routes:
 *    try {
 *      const project = db.getProject(id);
 *    } catch (err) {
 *      const dbError = parseDatabaseError(err);
 *      throw new AppError(dbError.message, 500);
 *    }
 */
