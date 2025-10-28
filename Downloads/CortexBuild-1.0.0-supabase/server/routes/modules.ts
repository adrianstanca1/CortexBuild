// CortexBuild Platform - Developer Platform API Routes
// Version: 1.1.0 GOLDEN
// Last Updated: 2025-10-08

import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import { Module, ModuleReview, ApiKey, ApiResponse, PaginatedResponse } from '../types';

export function createModulesRouter(db: Database.Database): Router {
  const router = Router();

  // ========== MODULES MARKETPLACE ==========

  // GET /api/modules - List all modules in marketplace
  router.get('/', (req: Request, res: Response) => {
    try {
      const {
        category,
        status = 'published',
        search,
        page = '1',
        limit = '20'
      } = req.query as any;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      let query = `
        SELECT m.*, 
               u.name as developer_name,
               AVG(mr.rating) as avg_rating,
               COUNT(DISTINCT mr.id) as review_count
        FROM modules m
        LEFT JOIN users u ON m.developer_id = u.id
        LEFT JOIN module_reviews mr ON m.id = mr.module_id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (category) {
        query += ' AND m.category = ?';
        params.push(category);
      }

      if (status) {
        query += ' AND m.status = ?';
        params.push(status);
      }

      if (search) {
        query += ' AND (m.name LIKE ? OR m.description LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      query += ' GROUP BY m.id';

      const countQuery = `SELECT COUNT(*) as total FROM (${query})`;
      const { total } = db.prepare(countQuery).get(...params) as { total: number };

      query += ' ORDER BY m.downloads DESC, m.created_at DESC LIMIT ? OFFSET ?';
      params.push(limitNum, offset);

      const modules = db.prepare(query).all(...params);

      res.json({
        success: true,
        data: modules,
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

  // GET /api/modules/:id - Get single module with reviews
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const module = db.prepare(`
        SELECT m.*, 
               u.name as developer_name,
               u.email as developer_email
        FROM modules m
        LEFT JOIN users u ON m.developer_id = u.id
        WHERE m.id = ?
      `).get(id);

      if (!module) {
        return res.status(404).json({
          success: false,
          error: 'Module not found'
        });
      }

      // Get reviews
      const reviews = db.prepare(`
        SELECT mr.*, 
               u.name as reviewer_name
        FROM module_reviews mr
        LEFT JOIN users u ON mr.user_id = u.id
        WHERE mr.module_id = ?
        ORDER BY mr.created_at DESC
        LIMIT 10
      `).all(id);

      res.json({
        success: true,
        data: {
          ...module,
          reviews
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/modules - Publish new module
  router.post('/', (req: Request, res: Response) => {
    try {
      const {
        developer_id,
        name,
        description,
        category,
        version,
        price = 0,
        repository_url,
        documentation_url
      } = req.body;

      if (!developer_id || !name || !description || !category || !version) {
        return res.status(400).json({
          success: false,
          error: 'Developer ID, name, description, category, and version are required'
        });
      }

      const result = db.prepare(`
        INSERT INTO modules (
          developer_id, name, description, category, version,
          price, repository_url, documentation_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        developer_id, name, description, category, version,
        price, repository_url, documentation_url
      );

      const module = db.prepare('SELECT * FROM modules WHERE id = ?').get(result.lastInsertRowid);

      res.status(201).json({
        success: true,
        data: module,
        message: 'Module published successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/modules/:id - Update module
  router.put('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const existing = db.prepare('SELECT * FROM modules WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Module not found'
        });
      }

      const fields = Object.keys(updates).filter(key => key !== 'id');
      if (fields.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field]);

      db.prepare(`
        UPDATE modules 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(...values, id);

      const module = db.prepare('SELECT * FROM modules WHERE id = ?').get(id);

      res.json({
        success: true,
        data: module,
        message: 'Module updated successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/modules/:id/review - Add review to module
  router.post('/:id/review', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { user_id, rating, comment } = req.body;

      if (!user_id || !rating) {
        return res.status(400).json({
          success: false,
          error: 'User ID and rating are required'
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: 'Rating must be between 1 and 5'
        });
      }

      const module = db.prepare('SELECT * FROM modules WHERE id = ?').get(id);
      if (!module) {
        return res.status(404).json({
          success: false,
          error: 'Module not found'
        });
      }

      const result = db.prepare(`
        INSERT INTO module_reviews (module_id, user_id, rating, comment)
        VALUES (?, ?, ?, ?)
      `).run(id, user_id, rating, comment);

      const review = db.prepare('SELECT * FROM module_reviews WHERE id = ?').get(result.lastInsertRowid);

      res.status(201).json({
        success: true,
        data: review,
        message: 'Review added successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ========== API KEYS MANAGEMENT ==========

  // GET /api/api-keys - List all API keys for user
  router.get('/api-keys/list', (req: Request, res: Response) => {
    try {
      const { user_id } = req.query as any;

      if (!user_id) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      const keys = db.prepare(`
        SELECT id, user_id, name, key_prefix, permissions, created_at, last_used_at, expires_at
        FROM api_keys
        WHERE user_id = ?
        ORDER BY created_at DESC
      `).all(user_id);

      res.json({
        success: true,
        data: keys
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/api-keys - Generate new API key
  router.post('/api-keys/generate', (req: Request, res: Response) => {
    try {
      const { user_id, name, permissions = 'read' } = req.body;

      if (!user_id || !name) {
        return res.status(400).json({
          success: false,
          error: 'User ID and name are required'
        });
      }

      // Generate API key (in production, use crypto.randomBytes)
      const apiKey = `cbk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      const keyPrefix = apiKey.substring(0, 12);

      const result = db.prepare(`
        INSERT INTO api_keys (user_id, name, api_key, key_prefix, permissions)
        VALUES (?, ?, ?, ?, ?)
      `).run(user_id, name, apiKey, keyPrefix, permissions);

      res.status(201).json({
        success: true,
        data: {
          id: result.lastInsertRowid,
          api_key: apiKey,
          key_prefix: keyPrefix,
          name,
          permissions
        },
        message: 'API key generated successfully. Save it securely - it will not be shown again.'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // DELETE /api/api-keys/:id - Revoke API key
  router.delete('/api-keys/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const key = db.prepare('SELECT * FROM api_keys WHERE id = ?').get(id);
      if (!key) {
        return res.status(404).json({
          success: false,
          error: 'API key not found'
        });
      }

      db.prepare('DELETE FROM api_keys WHERE id = ?').run(id);

      res.json({
        success: true,
        message: 'API key revoked successfully'
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
