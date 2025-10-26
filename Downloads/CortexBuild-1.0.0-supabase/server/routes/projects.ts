// CortexBuild Platform - Projects API Routes
// Version: 1.0.0 GOLDEN
// Last Updated: 2025-10-08

import { Router, Request, Response } from 'express';
import Database from 'better-sqlite3';
import { Project, ApiResponse, PaginatedResponse, ProjectFilters } from '../types';
import { logProjectActivity } from '../utils/activity-logger';

export function createProjectsRouter(db: Database.Database): Router {
  const router = Router();

  // GET /api/projects - List all projects with filters
  router.get('/', (req: Request, res: Response) => {
    try {
      const {
        status,
        priority,
        client_id,
        project_manager_id,
        company_id,
        search,
        page = '1',
        limit = '20'
      } = req.query as any;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      // Build query
      let query = `
        SELECT p.*, 
               c.name as client_name,
               u.name as manager_name
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        LEFT JOIN users u ON p.project_manager_id = u.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (status) {
        query += ' AND p.status = ?';
        params.push(status);
      }

      if (priority) {
        query += ' AND p.priority = ?';
        params.push(priority);
      }

      if (client_id) {
        query += ' AND p.client_id = ?';
        params.push(parseInt(client_id));
      }

      if (project_manager_id) {
        query += ' AND p.project_manager_id = ?';
        params.push(parseInt(project_manager_id));
      }

      if (company_id) {
        const companyIdNum = parseInt(company_id, 10);
        if (!Number.isNaN(companyIdNum)) {
          query += ' AND p.company_id = ?';
          params.push(companyIdNum);
        }
      }

      if (search) {
        query += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.project_number LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      // Get total count
      const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
      const { total } = db.prepare(countQuery).get(...params) as { total: number };

      // Add pagination
      query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
      params.push(limitNum, offset);

      const projects = db.prepare(query).all(...params);

      const response: PaginatedResponse<Project> = {
        success: true,
        data: projects as Project[],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      };

      res.json(response);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // GET /api/projects/:id - Get single project
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const project = db.prepare(`
        SELECT p.*, 
               c.name as client_name,
               c.email as client_email,
               c.phone as client_phone,
               u.name as manager_name,
               u.email as manager_email
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        LEFT JOIN users u ON p.project_manager_id = u.id
        WHERE p.id = ?
      `).get(id);

      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      // Get project tasks
      const tasks = db.prepare(`
        SELECT t.*, u.name as assigned_to_name
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        WHERE t.project_id = ?
        ORDER BY t.order_index, t.created_at
      `).all(id);

      // Get project milestones
      const milestones = db.prepare(`
        SELECT * FROM milestones
        WHERE project_id = ?
        ORDER BY due_date
      `).all(id);

      // Get project team
      const team = db.prepare(`
        SELECT pt.*, u.name as full_name, u.email, u.avatar as avatar_url
        FROM project_team pt
        JOIN users u ON pt.user_id = u.id
        WHERE pt.project_id = ? AND pt.left_at IS NULL
      `).all(id);

      // Get recent activities
      const activities = db.prepare(`
        SELECT a.*, u.name as user_name
        FROM activities a
        JOIN users u ON a.user_id = u.id
        WHERE a.project_id = ?
        ORDER BY a.created_at DESC
        LIMIT 20
      `).all(id);

      const response: ApiResponse = {
        success: true,
        data: {
          ...project,
          tasks,
          milestones,
          team,
          activities
        }
      };

      res.json(response);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/projects - Create new project
  router.post('/', (req: Request, res: Response) => {
    try {
      const {
        company_id,
        name,
        description,
        project_number,
        status = 'planning',
        priority = 'medium',
        start_date,
        end_date,
        budget,
        address,
        city,
        state,
        zip_code,
        client_id,
        project_manager_id
      } = req.body;

      // Validation
      if (!company_id || !name) {
        return res.status(400).json({
          success: false,
          error: 'Company ID and name are required'
        });
      }

      // Debug logging
      console.log('Creating project with:', {
        company_id, name, description, project_number, status, priority,
        start_date, end_date, budget, address, city, state, zip_code,
        client_id, project_manager_id
      });

      const result = db.prepare(`
        INSERT INTO projects (
          company_id, name, description, project_number, status, priority,
          start_date, end_date, budget, address, city, state, zip_code,
          client_id, project_manager_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        company_id, name, description, project_number, status, priority,
        start_date || null, end_date || null, budget || null, address || null, city || null, state || null, zip_code || null,
        client_id || null, project_manager_id || null
      );

      const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);

      // Log activity
      logProjectActivity(
        db,
        req.user?.id || 'user-1',
        result.lastInsertRowid,
        'created',
        `Created project: ${name}`
      );

      res.status(201).json({
        success: true,
        data: project,
        message: 'Project created successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // PUT /api/projects/:id - Update project
  router.put('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Check if project exists
      const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      // Build update query
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
        UPDATE projects 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(...values, id);

      const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);

      // Log activity
      db.prepare(`
        INSERT INTO activities (user_id, project_id, entity_type, entity_id, action, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        req.user?.id || 1,
        id,
        'project',
        id,
        'updated',
        `Updated project: ${(existing as any).name}`
      );

      res.json({
        success: true,
        data: project,
        message: 'Project updated successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // DELETE /api/projects/:id - Delete project
  router.delete('/:id', (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      db.prepare('DELETE FROM projects WHERE id = ?').run(id);

      res.json({
        success: true,
        message: 'Project deleted successfully'
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
