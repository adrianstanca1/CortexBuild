// CortexBuild Platform - Documents API Routes
// Version: 1.1.0 GOLDEN
// Last Updated: 2025-10-08

import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import { Document, ApiResponse, PaginatedResponse } from '../types';

export function createDocumentsRouter(db: Database.Database): Router {
  const router = Router();

  // GET /api/documents - List all documents
  router.get('/', (req: Request, res: Response) => {
    try {
      const {
        project_id,
        category,
        uploaded_by,
        search,
        page = '1',
        limit = '50'
      } = req.query as any;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      let query = `
        SELECT d.*, 
               p.name as project_name,
               u.name as uploaded_by_name
        FROM documents d
        LEFT JOIN projects p ON d.project_id = p.id
        LEFT JOIN users u ON d.uploaded_by = u.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (project_id) {
        query += ' AND d.project_id = ?';
        params.push(parseInt(project_id));
      }

      if (category) {
        query += ' AND d.category = ?';
        params.push(category);
      }

      if (uploaded_by) {
        query += ' AND d.uploaded_by = ?';
        params.push(parseInt(uploaded_by));
      }

      if (search) {
        query += ' AND (d.name LIKE ? OR d.description LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
      const { total } = db.prepare(countQuery).get(...params) as { total: number };

      query += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
      params.push(limitNum, offset);

      const documents = db.prepare(query).all(...params);

      res.json({
        success: true,
        data: documents,
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

  // GET /api/documents/:id - Get single document
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const document = db.prepare(`
        SELECT d.*, 
               p.name as project_name,
               u.name as uploaded_by_name,
               u.email as uploaded_by_email
        FROM documents d
        LEFT JOIN projects p ON d.project_id = p.id
        LEFT JOIN users u ON d.uploaded_by = u.id
        WHERE d.id = ?
      `).get(id);

      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Document not found'
        });
      }

      res.json({
        success: true,
        data: document
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/documents - Upload new document
  router.post('/', (req: Request, res: Response) => {
    try {
      const {
        project_id,
        name,
        description,
        category,
        file_path,
        file_size,
        file_type,
        uploaded_by
      } = req.body;

      if (!project_id || !name || !file_path || !uploaded_by) {
        return res.status(400).json({
          success: false,
          error: 'Project ID, name, file path, and uploaded_by are required'
        });
      }

      const result = db.prepare(`
        INSERT INTO documents (
          project_id, name, description, category, file_path,
          file_size, file_type, uploaded_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        project_id, name, description, category, file_path,
        file_size, file_type, uploaded_by
      );

      const document = db.prepare('SELECT * FROM documents WHERE id = ?').get(result.lastInsertRowid);

      // Log activity
      db.prepare(`
        INSERT INTO activities (user_id, project_id, entity_type, entity_id, action, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        uploaded_by,
        project_id,
        'document',
        result.lastInsertRowid,
        'uploaded',
        `Uploaded document: ${name}`
      );

      res.status(201).json({
        success: true,
        data: document,
        message: 'Document uploaded successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // GET /api/documents/:id/download - Download document
  router.get('/:id/download', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const document = db.prepare('SELECT * FROM documents WHERE id = ?').get(id) as any;

      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Document not found'
        });
      }

      // In a real implementation, this would serve the actual file
      // For now, return the file path and metadata
      res.json({
        success: true,
        data: {
          id: document.id,
          name: document.name,
          file_path: document.file_path,
          file_type: document.file_type,
          file_size: document.file_size,
          download_url: `/files/${document.file_path}`
        },
        message: 'Document ready for download'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // DELETE /api/documents/:id - Delete document
  router.delete('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const document = db.prepare('SELECT * FROM documents WHERE id = ?').get(id);
      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Document not found'
        });
      }

      // In a real implementation, this would also delete the physical file
      db.prepare('DELETE FROM documents WHERE id = ?').run(id);

      res.json({
        success: true,
        message: 'Document deleted successfully'
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

