/**
 * Advanced Operations Service
 * Provides advanced search, bulk operations, and data export functionality
 */

import Database from 'better-sqlite3';
import { Parser } from 'json2csv';

export interface SearchParams {
  query: string;
  tables?: string[];
  fields?: string[];
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
}

export interface BulkOperation {
  action: 'create' | 'update' | 'delete';
  table: string;
  data: Record<string, any>[];
  conditions?: Record<string, any>;
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  table: string;
  fields?: string[];
  filters?: Record<string, any>;
  filename?: string;
}

/**
 * Advanced Search
 * Searches across multiple tables with full-text search capabilities
 */
export function advancedSearch(db: Database.Database, params: SearchParams) {
  const {
    query,
    tables = ['projects', 'tasks', 'clients', 'rfis', 'invoices'],
    fields = ['name', 'title', 'description', 'notes'],
    filters = {},
    sortBy = 'created_at',
    sortOrder = 'DESC',
    limit = 50,
    offset = 0
  } = params;

  const results: any[] = [];
  const searchTerm = `%${query}%`;

  try {
    // Search in each table
    for (const table of tables) {
      // Build WHERE clause for search
      const searchConditions = fields
        .map(field => `${field} LIKE ?`)
        .join(' OR ');

      // Build WHERE clause for filters
      const filterConditions = Object.keys(filters)
        .map(key => `${key} = ?`)
        .join(' AND ');

      const whereClause = [
        searchConditions ? `(${searchConditions})` : null,
        filterConditions ? `(${filterConditions})` : null
      ]
        .filter(Boolean)
        .join(' AND ');

      const sql = `
        SELECT *, '${table}' as source_table
        FROM ${table}
        WHERE ${whereClause || '1=1'}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
      `;

      // Prepare parameters
      const searchParams = fields.map(() => searchTerm);
      const filterParams = Object.values(filters);
      const allParams = [...searchParams, ...filterParams, limit, offset];

      const stmt = db.prepare(sql);
      const tableResults = stmt.all(...allParams);

      results.push(...tableResults);
    }

    return {
      success: true,
      results,
      total: results.length,
      query,
      tables,
      limit,
      offset
    };
  } catch (error: any) {
    console.error('Advanced search error:', error);
    return {
      success: false,
      error: error.message,
      results: [],
      total: 0
    };
  }
}

/**
 * Bulk Operations
 * Performs batch operations on multiple records
 */
export function bulkOperation(db: Database.Database, operation: BulkOperation) {
  const { action, table, data, conditions = {} } = operation;

  try {
    // Start transaction
    const transaction = db.transaction(() => {
      const results = [];

      switch (action) {
        case 'create':
          // Bulk insert
          for (const record of data) {
            const fields = Object.keys(record);
            const placeholders = fields.map(() => '?').join(', ');
            const sql = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`;
            const stmt = db.prepare(sql);
            const result = stmt.run(...Object.values(record));
            results.push({ id: result.lastInsertRowid, ...record });
          }
          break;

        case 'update':
          // Bulk update
          for (const record of data) {
            const updates = Object.keys(record)
              .filter(key => key !== 'id')
              .map(key => `${key} = ?`)
              .join(', ');

            const whereClause = conditions
              ? Object.keys(conditions).map(key => `${key} = ?`).join(' AND ')
              : 'id = ?';

            const sql = `UPDATE ${table} SET ${updates} WHERE ${whereClause}`;

            const values = [
              ...Object.values(record).filter((_, i) => Object.keys(record)[i] !== 'id'),
              ...(conditions ? Object.values(conditions) : [record.id])
            ];

            const stmt = db.prepare(sql);
            const result = stmt.run(...values);
            results.push({ changes: result.changes, ...record });
          }
          break;

        case 'delete':
          // Bulk delete
          const ids = data.map(r => r.id);
          const placeholders = ids.map(() => '?').join(', ');
          const sql = `DELETE FROM ${table} WHERE id IN (${placeholders})`;
          const stmt = db.prepare(sql);
          const result = stmt.run(...ids);
          results.push({ deleted: result.changes, ids });
          break;

        default:
          throw new Error(`Unknown action: ${action}`);
      }

      return results;
    });

    const results = transaction();

    return {
      success: true,
      action,
      table,
      results,
      count: results.length
    };
  } catch (error: any) {
    console.error('Bulk operation error:', error);
    return {
      success: false,
      error: error.message,
      action,
      table,
      results: [],
      count: 0
    };
  }
}

/**
 * Export Data to CSV
 */
export function exportToCSV(db: Database.Database, options: ExportOptions) {
  const {
    table,
    fields = ['*'],
    filters = {},
    filename = `${table}-export.csv`
  } = options;

  try {
    // Build query
    const whereClause = Object.keys(filters)
      .map(key => `${key} = ?`)
      .join(' AND ');

    const sql = `
      SELECT ${fields.join(', ')}
      FROM ${table}
      ${whereClause ? `WHERE ${whereClause}` : ''}
    `;

    const stmt = db.prepare(sql);
    const data = stmt.all(...Object.values(filters));

    if (data.length === 0) {
      return {
        success: false,
        error: 'No data to export',
        filename
      };
    }

    // Convert to CSV
    const parser = new Parser({ fields: fields.filter(f => f !== '*') });
    const csv = parser.parse(data);

    return {
      success: true,
      data: csv,
      filename,
      format: 'csv',
      rows: data.length
    };
  } catch (error: any) {
    console.error('CSV export error:', error);
    return {
      success: false,
      error: error.message,
      filename
    };
  }
}

/**
 * Export Data to JSON
 */
export function exportToJSON(db: Database.Database, options: ExportOptions) {
  const {
    table,
    fields = ['*'],
    filters = {},
    filename = `${table}-export.json`
  } = options;

  try {
    // Build query
    const whereClause = Object.keys(filters)
      .map(key => `${key} = ?`)
      .join(' AND ');

    const sql = `
      SELECT ${fields.join(', ')}
      FROM ${table}
      ${whereClause ? `WHERE ${whereClause}` : ''}
    `;

    const stmt = db.prepare(sql);
    const data = stmt.all(...Object.values(filters));

    return {
      success: true,
      data: JSON.stringify(data, null, 2),
      filename,
      format: 'json',
      rows: data.length
    };
  } catch (error: any) {
    console.error('JSON export error:', error);
    return {
      success: false,
      error: error.message,
      filename
    };
  }
}

/**
 * Get Table Statistics
 */
export function getTableStats(db: Database.Database, table: string) {
  try {
    // Get row count
    const countStmt = db.prepare(`SELECT COUNT(*) as count FROM ${table}`);
    const { count } = countStmt.get() as { count: number };

    // Get column info
    const columnsStmt = db.prepare(`PRAGMA table_info(${table})`);
    const columns = columnsStmt.all();

    // Get recent records
    const recentStmt = db.prepare(`
      SELECT * FROM ${table}
      ORDER BY created_at DESC
      LIMIT 5
    `);
    const recent = recentStmt.all();

    return {
      success: true,
      table,
      count,
      columns,
      recent
    };
  } catch (error: any) {
    console.error('Table stats error:', error);
    return {
      success: false,
      error: error.message,
      table
    };
  }
}

/**
 * Batch Update with Transaction
 */
export function batchUpdate(
  db: Database.Database,
  table: string,
  updates: Array<{ id: number | string; data: Record<string, any> }>
) {
  try {
    const transaction = db.transaction(() => {
      const results = [];

      for (const { id, data } of updates) {
        const fields = Object.keys(data);
        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const sql = `UPDATE ${table} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

        const stmt = db.prepare(sql);
        const result = stmt.run(...Object.values(data), id);

        results.push({
          id,
          changes: result.changes,
          success: result.changes > 0
        });
      }

      return results;
    });

    const results = transaction();
    const successful = results.filter(r => r.success).length;

    return {
      success: true,
      total: updates.length,
      successful,
      failed: updates.length - successful,
      results
    };
  } catch (error: any) {
    console.error('Batch update error:', error);
    return {
      success: false,
      error: error.message,
      total: updates.length,
      successful: 0,
      failed: updates.length
    };
  }
}

/**
 * Full-text Search with Relevance Scoring
 */
export function fullTextSearch(
  db: Database.Database,
  query: string,
  tables: string[] = ['projects', 'tasks', 'clients']
) {
  try {
    const results: any[] = [];

    for (const table of tables) {
      // Get all text columns
      const columnsStmt = db.prepare(`PRAGMA table_info(${table})`);
      const columns = columnsStmt.all() as any[];
      const textColumns = columns
        .filter(c => c.type === 'TEXT' || c.type === 'VARCHAR')
        .map(c => c.name);

      if (textColumns.length === 0) continue;

      // Build search query with relevance scoring
      const searchConditions = textColumns.map(col => `${col} LIKE ?`).join(' OR ');
      const searchParams = textColumns.map(() => `%${query}%`);

      // Calculate relevance score (number of matching columns)
      const relevanceCalc = textColumns
        .map(col => `CASE WHEN ${col} LIKE ? THEN 1 ELSE 0 END`)
        .join(' + ');

      const sql = `
        SELECT *,
               '${table}' as source_table,
               (${relevanceCalc}) as relevance_score
        FROM ${table}
        WHERE ${searchConditions}
        ORDER BY relevance_score DESC
        LIMIT 20
      `;

      const allParams = [...searchParams, ...searchParams];
      const stmt = db.prepare(sql);
      const tableResults = stmt.all(...allParams);

      results.push(...tableResults);
    }

    // Sort all results by relevance
    results.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));

    return {
      success: true,
      query,
      results: results.slice(0, 50),
      total: results.length
    };
  } catch (error: any) {
    console.error('Full-text search error:', error);
    return {
      success: false,
      error: error.message,
      results: []
    };
  }
}
