/**
 * Advanced Operations Routes
 * Handles advanced search, bulk operations, and data export
 */

import express from 'express';
import Database from 'better-sqlite3';
import { verifyToken } from '../auth';
import * as advOps from '../services/advanced-operations';

export function createAdvancedRouter(db: Database.Database) {
  const router = express.Router();

  /**
   * POST /api/advanced/search
   * Advanced search across multiple tables
   */
  router.post('/search', verifyToken, async (req, res) => {
    try {
      const params = req.body as advOps.SearchParams;

      if (!params.query) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }

      const result = advOps.advancedSearch(db, params);
      res.json(result);
    } catch (error: any) {
      console.error('Advanced search error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/advanced/full-text-search
   * Full-text search with relevance scoring
   */
  router.post('/full-text-search', verifyToken, async (req, res) => {
    try {
      const { query, tables } = req.body;

      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }

      const result = advOps.fullTextSearch(db, query, tables);
      res.json(result);
    } catch (error: any) {
      console.error('Full-text search error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/advanced/bulk-operation
   * Perform bulk operations (create, update, delete)
   */
  router.post('/bulk-operation', verifyToken, async (req, res) => {
    try {
      const operation = req.body as advOps.BulkOperation;

      if (!operation.action || !operation.table || !operation.data) {
        return res.status(400).json({
          success: false,
          error: 'Action, table, and data are required'
        });
      }

      // Check if user has permission (admin only for now)
      const user = (req as any).user;
      if (user.role !== 'super_admin' && user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions for bulk operations'
        });
      }

      const result = advOps.bulkOperation(db, operation);
      res.json(result);
    } catch (error: any) {
      console.error('Bulk operation error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/advanced/batch-update
   * Batch update multiple records
   */
  router.post('/batch-update', verifyToken, async (req, res) => {
    try {
      const { table, updates } = req.body;

      if (!table || !updates || !Array.isArray(updates)) {
        return res.status(400).json({
          success: false,
          error: 'Table and updates array are required'
        });
      }

      // Check permissions
      const user = (req as any).user;
      if (user.role !== 'super_admin' && user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions for batch updates'
        });
      }

      const result = advOps.batchUpdate(db, table, updates);
      res.json(result);
    } catch (error: any) {
      console.error('Batch update error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/advanced/export
   * Export data to CSV or JSON
   */
  router.post('/export', verifyToken, async (req, res) => {
    try {
      const options = req.body as advOps.ExportOptions;

      if (!options.table || !options.format) {
        return res.status(400).json({
          success: false,
          error: 'Table and format are required'
        });
      }

      let result;
      switch (options.format) {
        case 'csv':
          result = advOps.exportToCSV(db, options);
          break;
        case 'json':
          result = advOps.exportToJSON(db, options);
          break;
        case 'pdf':
          return res.status(501).json({
            success: false,
            error: 'PDF export not yet implemented'
          });
        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid export format. Supported: csv, json'
          });
      }

      if (result.success) {
        // Set appropriate headers for download
        const contentType = options.format === 'csv'
          ? 'text/csv'
          : 'application/json';

        res.setHeader('Content-Type', contentType);
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${result.filename}"`
        );
        res.send(result.data);
      } else {
        res.status(500).json(result);
      }
    } catch (error: any) {
      console.error('Export error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/advanced/table-stats/:table
   * Get statistics for a table
   */
  router.get('/table-stats/:table', verifyToken, async (req, res) => {
    try {
      const { table } = req.params;
      const result = advOps.getTableStats(db, table);
      res.json(result);
    } catch (error: any) {
      console.error('Table stats error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/advanced/available-tables
   * Get list of available tables for operations
   */
  router.get('/available-tables', verifyToken, async (req, res) => {
    try {
      const stmt = db.prepare(`
        SELECT name FROM sqlite_master
        WHERE type='table'
        AND name NOT LIKE 'sqlite_%'
        ORDER BY name
      `);
      const tables = stmt.all();

      res.json({
        success: true,
        tables: tables.map((t: any) => t.name)
      });
    } catch (error: any) {
      console.error('Get tables error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}
