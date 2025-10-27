// CortexBuild Platform - Advanced Filtering API Routes
// Version: 1.0.0
// Last Updated: 2025-10-26

import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import { ApiResponse, PaginatedResponse } from '../types';

export function createFiltersRouter(db: Database.Database): Router {
  const router = Router();

  // ============================================================================
  // FILTER PRESETS
  // ============================================================================

  // GET /api/filters/presets - List filter presets
  router.get('/presets', (req: Request, res: Response) => {
    try {
      const {
        entityType,
        userId,
        companyId,
        shared = 'false',
        page = '1',
        limit = '50'
      } = req.query as any;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      let query = `
        SELECT fp.*,
               u.name as created_by_name
        FROM filter_presets fp
        LEFT JOIN users u ON fp.created_by = u.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (entityType) {
        query += ' AND fp.entity_type = ?';
        params.push(entityType);
      }

      if (userId) {
        query += ' AND (fp.created_by = ? OR fp.is_shared = true)';
        params.push(userId);
      }

      if (companyId) {
        query += ' AND fp.company_id = ?';
        params.push(companyId);
      }

      if (shared === 'true') {
        query += ' AND fp.is_shared = true';
      }

      const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
      const { total } = db.prepare(countQuery).get(...params) as { total: number };

      query += ' ORDER BY fp.is_default DESC, fp.updated_at DESC LIMIT ? OFFSET ?';
      params.push(limitNum, offset);

      const presets = db.prepare(query).all(...params);

      res.json({
        success: true,
        data: presets,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/filters/presets - Create filter preset
  router.post('/presets', (req: Request, res: Response) => {
    try {
      const {
        name,
        description,
        criteria,
        entityType,
        isShared = false,
        createdBy,
        companyId
      } = req.body;

      if (!name || !criteria || !entityType || !createdBy || !companyId) {
        return res.status(400).json({
          success: false,
          error: 'Name, criteria, entityType, createdBy, and companyId are required'
        });
      }

      const result = db.prepare(`
        INSERT INTO filter_presets (
          name, description, criteria, entity_type, is_shared, created_by, company_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        name, description, JSON.stringify(criteria), entityType, isShared, createdBy, companyId
      );

      const preset = db.prepare('SELECT * FROM filter_presets WHERE id = ?').get(result.lastInsertRowid);

      res.status(201).json({
        success: true,
        data: preset,
        message: 'Filter preset created successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/filters/presets/:id - Update filter preset
  router.put('/presets/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const existing = db.prepare('SELECT * FROM filter_presets WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Filter preset not found'
        });
      }

      const fields = Object.keys(updates).filter(key => key !== 'id');
      if (fields.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }

      const setClause = fields.map(field => {
        if (field === 'criteria') {
          return `${field} = ?`;
        }
        return `${field} = ?`;
      }).join(', ');

      const values = fields.map(field => {
        if (field === 'criteria') {
          return JSON.stringify(updates[field]);
        }
        return updates[field];
      });

      db.prepare(`
        UPDATE filter_presets
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(...values, id);

      const preset = db.prepare('SELECT * FROM filter_presets WHERE id = ?').get(id);

      res.json({
        success: true,
        data: preset,
        message: 'Filter preset updated successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // DELETE /api/filters/presets/:id - Delete filter preset
  router.delete('/presets/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const preset = db.prepare('SELECT * FROM filter_presets WHERE id = ?').get(id);
      if (!preset) {
        return res.status(404).json({
          success: false,
          error: 'Filter preset not found'
        });
      }

      db.prepare('DELETE FROM filter_presets WHERE id = ?').run(id);

      res.json({
        success: true,
        message: 'Filter preset deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================================================
  // SEARCH HISTORY
  // ============================================================================

  // GET /api/filters/search-history - Get search history
  router.get('/search-history', (req: Request, res: Response) => {
    try {
      const {
        userId,
        entityType,
        limit = '20'
      } = req.query as any;

      const limitNum = parseInt(limit);

      let query = 'SELECT * FROM search_history WHERE 1=1';
      const params: any[] = [];

      if (userId) {
        query += ' AND user_id = ?';
        params.push(userId);
      }

      if (entityType) {
        query += ' AND entity_type = ?';
        params.push(entityType);
      }

      query += ' ORDER BY timestamp DESC LIMIT ?';
      params.push(limitNum);

      const history = db.prepare(query).all(...params);

      res.json({
        success: true,
        data: history
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/filters/search-history - Add search history entry
  router.post('/search-history', (req: Request, res: Response) => {
    try {
      const {
        query,
        filters,
        entityType,
        resultCount,
        userId,
        companyId
      } = req.body;

      if (!query || !entityType || !userId || !companyId) {
        return res.status(400).json({
          success: false,
          error: 'Query, entityType, userId, and companyId are required'
        });
      }

      const result = db.prepare(`
        INSERT INTO search_history (
          query, filters, entity_type, result_count, user_id, company_id
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        query,
        filters ? JSON.stringify(filters) : null,
        entityType,
        resultCount || 0,
        userId,
        companyId
      );

      const entry = db.prepare('SELECT * FROM search_history WHERE id = ?').get(result.lastInsertRowid);

      res.status(201).json({
        success: true,
        data: entry,
        message: 'Search history entry created successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // DELETE /api/filters/search-history - Clear search history
  router.delete('/search-history', (req: Request, res: Response) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId is required'
        });
      }

      db.prepare('DELETE FROM search_history WHERE user_id = ?').run(userId);

      res.json({
        success: true,
        message: 'Search history cleared successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================================================
  // AI SEARCH SUGGESTIONS
  // ============================================================================

  // GET /api/filters/search-suggestions - Get AI-powered search suggestions
  router.get('/search-suggestions', (req: Request, res: Response) => {
    try {
      const { q: query, entityType, companyId } = req.query as any;

      if (!query || !entityType || !companyId) {
        return res.status(400).json({
          success: false,
          error: 'Query, entityType, and companyId are required'
        });
      }

      // Check cache first
      const cached = db.prepare(`
        SELECT suggestions FROM ai_search_cache
        WHERE query = ? AND entity_type = ? AND company_id = ? AND expires_at > NOW()
      `).get(query, entityType, companyId);

      if (cached) {
        return res.json({
          success: true,
          data: JSON.parse(cached.suggestions)
        });
      }

      // Generate AI suggestions (simplified - in real implementation, call AI service)
      const suggestions = generateAISuggestions(query, entityType);

      // Cache the results
      db.prepare(`
        INSERT INTO ai_search_cache (query, entity_type, suggestions, company_id)
        VALUES (?, ?, ?, ?)
        ON CONFLICT (query, entity_type, company_id) DO UPDATE SET
          suggestions = EXCLUDED.suggestions,
          expires_at = NOW() + INTERVAL '24 hours'
      `).run(query, entityType, JSON.stringify(suggestions), companyId);

      res.json({
        success: true,
        data: suggestions
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================================================
  // SMART FILTERS
  // ============================================================================

  // GET /api/filters/smart-filters - Get AI-powered smart filters
  router.get('/smart-filters', (req: Request, res: Response) => {
    try {
      const { entityType, companyId } = req.query as any;

      if (!entityType || !companyId) {
        return res.status(400).json({
          success: false,
          error: 'entityType and companyId are required'
        });
      }

      // Check cache first
      const cached = db.prepare(`
        SELECT filters FROM smart_filters_cache
        WHERE entity_type = ? AND company_id = ? AND expires_at > NOW()
      `).get(entityType, companyId);

      if (cached) {
        return res.json({
          success: true,
          data: JSON.parse(cached.filters)
        });
      }

      // Generate smart filters based on entity data (simplified)
      const smartFilters = await generateSmartFilters(entityType, companyId);

      // Cache the results
      db.prepare(`
        INSERT INTO smart_filters_cache (entity_type, filters, company_id)
        VALUES (?, ?, ?)
        ON CONFLICT (entity_type, company_id) DO UPDATE SET
          filters = EXCLUDED.filters,
          expires_at = NOW() + INTERVAL '1 hour'
      `).run(entityType, JSON.stringify(smartFilters), companyId);

      res.json({
        success: true,
        data: smartFilters
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  // GET /api/filters/bulk-operations - List bulk operations
  router.get('/bulk-operations', (req: Request, res: Response) => {
    try {
      const {
        createdBy,
        status,
        entityType,
        page = '1',
        limit = '20'
      } = req.query as any;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      let query = 'SELECT * FROM bulk_operations WHERE 1=1';
      const params: any[] = [];

      if (createdBy) {
        query += ' AND created_by = ?';
        params.push(createdBy);
      }

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      if (entityType) {
        query += ' AND entity_type = ?';
        params.push(entityType);
      }

      const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
      const { total } = db.prepare(countQuery).get(...params) as { total: number };

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limitNum, offset);

      const operations = db.prepare(query).all(...params);

      res.json({
        success: true,
        data: operations,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/filters/bulk-operations - Create bulk operation
  router.post('/bulk-operations', (req: Request, res: Response) => {
    try {
      const {
        entityType,
        operation,
        selectedIds,
        changes,
        createdBy,
        companyId
      } = req.body;

      if (!entityType || !operation || !selectedIds || !createdBy || !companyId) {
        return res.status(400).json({
          success: false,
          error: 'entityType, operation, selectedIds, createdBy, and companyId are required'
        });
      }

      const result = db.prepare(`
        INSERT INTO bulk_operations (
          entity_type, operation, selected_ids, changes, created_by, company_id
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        entityType,
        operation,
        JSON.stringify(selectedIds),
        changes ? JSON.stringify(changes) : null,
        createdBy,
        companyId
      );

      const bulkOp = db.prepare('SELECT * FROM bulk_operations WHERE id = ?').get(result.lastInsertRowid);

      res.status(201).json({
        success: true,
        data: bulkOp,
        message: 'Bulk operation created successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/filters/bulk-operations/:id/execute - Execute bulk operation
  router.post('/bulk-operations/:id/execute', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const operation = db.prepare('SELECT * FROM bulk_operations WHERE id = ?').get(id);
      if (!operation) {
        return res.status(404).json({
          success: false,
          error: 'Bulk operation not found'
        });
      }

      if (operation.status !== 'pending') {
        return res.status(400).json({
          success: false,
          error: 'Bulk operation is not in pending status'
        });
      }

      // Update status to processing
      db.prepare(`
        UPDATE bulk_operations
        SET status = 'processing', progress = 0
        WHERE id = ?
      `).run(id);

      // Execute the bulk operation asynchronously
      executeBulkOperation(operation);

      res.json({
        success: true,
        message: 'Bulk operation execution started'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/filters/bulk-operations/:id/cancel - Cancel bulk operation
  router.post('/bulk-operations/:id/cancel', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const operation = db.prepare('SELECT * FROM bulk_operations WHERE id = ?').get(id);
      if (!operation) {
        return res.status(404).json({
          success: false,
          error: 'Bulk operation not found'
        });
      }

      if (operation.status === 'completed') {
        return res.status(400).json({
          success: false,
          error: 'Cannot cancel completed operation'
        });
      }

      db.prepare(`
        UPDATE bulk_operations
        SET status = 'failed', error_message = 'Operation cancelled by user', completed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(id);

      res.json({
        success: true,
        message: 'Bulk operation cancelled successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateAISuggestions(query: string, entityType: string): string[] {
  // Simplified AI suggestion generation
  // In a real implementation, this would call an AI service
  const suggestions: string[] = [];

  const commonTerms = {
    tasks: ['overdue', 'high priority', 'assigned to me', 'completed', 'in progress'],
    projects: ['active', 'on hold', 'completed', 'over budget', 'behind schedule'],
    rfis: ['open', 'closed', 'overdue', 'assigned to me'],
    documents: ['recent', 'by type', 'shared with me'],
    users: ['active', 'by role', 'recent activity']
  };

  const terms = commonTerms[entityType as keyof typeof commonTerms] || [];

  // Generate suggestions based on query
  if (query.length > 2) {
    terms.forEach(term => {
      if (term.toLowerCase().includes(query.toLowerCase()) ||
          query.toLowerCase().includes(term.toLowerCase())) {
        suggestions.push(`${query} ${term}`);
      }
    });
  }

  // Add some generic suggestions
  if (suggestions.length < 3) {
    suggestions.push(...terms.slice(0, 3));
  }

  return suggestions.slice(0, 5);
}

async function generateSmartFilters(entityType: string, companyId: string): Promise<any> {
  // Simplified smart filter generation
  // In a real implementation, this would analyze data patterns and user behavior

  const baseFilters = {
    query: '',
    status: [],
    priority: [],
    assignee: [],
    tags: [],
    dateRange: { start: '', end: '' },
    location: '',
    budgetRange: { min: 0, max: 1000000 },
    projectType: [],
    customFields: {}
  };

  // Add smart suggestions based on entity type
  switch (entityType) {
    case 'tasks':
      return {
        ...baseFilters,
        status: ['To Do', 'In Progress'], // Suggest showing open tasks
        priority: ['High'] // Suggest focusing on high priority
      };
    case 'projects':
      return {
        ...baseFilters,
        status: ['active'] // Suggest showing active projects
      };
    default:
      return baseFilters;
  }
}

function executeBulkOperation(operation: any) {
  // Execute bulk operation asynchronously
  // In a real implementation, this would be handled by a job queue/worker

  setTimeout(() => {
    try {
      const selectedIds = JSON.parse(operation.selected_ids);
      const changes = operation.changes ? JSON.parse(operation.changes) : {};

      // Simulate processing
      let processed = 0;
      const total = selectedIds.length;

      const processBatch = () => {
        const batchSize = Math.min(10, selectedIds.length - processed);
        if (batchSize <= 0) {
          // Mark as completed
          db.prepare(`
            UPDATE bulk_operations
            SET status = 'completed', progress = 100, completed_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(operation.id);
          return;
        }

        // Process batch (simplified - would actually update entities)
        processed += batchSize;
        const progress = Math.round((processed / total) * 100);

        db.prepare(`
          UPDATE bulk_operations
          SET progress = ?
          WHERE id = ?
        `).run(progress, operation.id);

        // Continue processing
        setTimeout(processBatch, 100);
      };

      processBatch();
    } catch (error: any) {
      db.prepare(`
        UPDATE bulk_operations
        SET status = 'failed', error_message = ?, completed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(error.message, operation.id);
    }
  }, 100);
}