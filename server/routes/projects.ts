// CortexBuild Platform - Projects API Routes
// Version: 2.0.0 - Supabase Migration
// Last Updated: 2025-10-31

import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { Project, ApiResponse, PaginatedResponse, ProjectFilters } from '../types';
import { logProjectActivity } from '../utils/activity-logger';
import { asyncHandler, ValidationError, NotFoundError, DatabaseError } from '../middleware/errorHandler';
import {
  validateBody,
  validateQuery,
  validateParams,
  createProjectSchema,
  updateProjectSchema,
  projectFiltersSchema,
  idParamSchema
} from '../utils/validation';

export function createProjectsRouter(supabase: SupabaseClient): Router {
  const router = Router();

  // GET /api/projects - List all projects with filters
  router.get('/', validateQuery(projectFiltersSchema), asyncHandler(async (req: Request, res: Response) => {
    const {
      status,
      priority,
      client_id,
      project_manager_id,
      company_id,
      search,
      page = 1,
      limit = 20
    } = req.query as any;

    const pageNum = page;
    const limitNum = limit;

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
      const clientIdNum = parseInt(client_id);
      if (isNaN(clientIdNum)) {
        throw new ValidationError('Invalid client ID');
      }
      query += ' AND p.client_id = ?';
      params.push(clientIdNum);
    }

    if (project_manager_id) {
      const managerIdNum = parseInt(project_manager_id);
      if (isNaN(managerIdNum)) {
        throw new ValidationError('Invalid project manager ID');
      }
      query += ' AND p.project_manager_id = ?';
      params.push(managerIdNum);
    }

    if (company_id) {
      const companyIdNum = parseInt(company_id, 10);
      if (isNaN(companyIdNum)) {
        throw new ValidationError('Invalid company ID');
      }
      query += ' AND p.company_id = ?';
      params.push(companyIdNum);
    }

    if (search) {
      if (typeof search !== 'string' || search.length < 2) {
        throw new ValidationError('Search term must be at least 2 characters');
      }
      query += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.project_number LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Get total count
    const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const countResult = db.prepare(countQuery).get(...params) as { total: number };

    if (!countResult) {
      throw new DatabaseError('Failed to get project count');
    }

    const { total } = countResult;

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
  }));

  // GET /api/projects/:id - Get single project
  router.get('/:id', validateParams(idParamSchema), asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const projectId = parseInt(id);

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
    `).get(projectId);

    if (!project) {
      throw new NotFoundError('Project');
    }

    // Get project tasks
    const tasks = db.prepare(`
      SELECT t.*, u.name as assigned_to_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.project_id = ?
      ORDER BY t.order_index, t.created_at
    `).all(projectId);

    // Get project milestones
    const milestones = db.prepare(`
      SELECT * FROM milestones
      WHERE project_id = ?
      ORDER BY due_date
    `).all(projectId);

    // Get project team
    const team = db.prepare(`
      SELECT pt.*, u.name as full_name, u.email, u.avatar as avatar_url
      FROM project_team pt
      JOIN users u ON pt.user_id = u.id
      WHERE pt.project_id = ? AND pt.left_at IS NULL
    `).all(projectId);

    // Get recent activities
    const activities = db.prepare(`
      SELECT a.*, u.name as user_name
      FROM activities a
      JOIN users u ON a.user_id = u.id
      WHERE a.project_id = ?
      ORDER BY a.created_at DESC
      LIMIT 20
    `).all(projectId);

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
  }));

  // POST /api/projects - Create new project
  router.post('/', validateBody(createProjectSchema), asyncHandler(async (req: Request, res: Response) => {
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

    try {
      const result = db.prepare(`
        INSERT INTO projects (
          company_id, name, description, project_number, status, priority,
          start_date, end_date, budget, address, city, state, zip_code,
          client_id, project_manager_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        company_id, name.trim(), description?.trim() || null, project_number?.trim() || null, status, priority,
        start_date || null, end_date || null, budget || null, address?.trim() || null,
        city?.trim() || null, state?.trim() || null, zip_code?.trim() || null,
        client_id || null, project_manager_id || null
      );

      if (error) throw error;

      if (!project) {
        throw new DatabaseError('Failed to retrieve created project');
      }

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
      // Handle database constraint violations
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new ValidationError('A project with this number already exists');
      }
      if (error.code === 'SQLITE_CONSTRAINT_FOREIGN') {
        throw new ValidationError('Invalid reference to company, client, or project manager');
      }
      throw new DatabaseError('Failed to create project');
    }
  }));

  // PUT /api/projects/:id - Update project
  router.put('/:id', validateParams(idParamSchema), validateBody(updateProjectSchema), asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    const projectId = parseInt(id);

    // Check if project exists
    const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    if (!existing) {
      throw new NotFoundError('Project');
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => {
      const value = updates[field];
      return typeof value === 'string' ? value.trim() : value;
    });

    try {
      db.prepare(`
        UPDATE projects
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(...values, projectId);

      const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);

      if (!project) {
        throw new DatabaseError('Failed to retrieve updated project');
      }

      // Log activity
      db.prepare(`
        INSERT INTO activities (user_id, project_id, entity_type, entity_id, action, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        req.user?.id || 1,
        projectId,
        'project',
        projectId,
        'updated',
        `Updated project: ${(existing as any).name}`
      );

      res.json({
        success: true,
        data: project,
        message: 'Project updated successfully'
      });
    } catch (error: any) {
      // Handle database constraint violations
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new ValidationError('A project with this number already exists');
      }
      if (error.code === 'SQLITE_CONSTRAINT_FOREIGN') {
        throw new ValidationError('Invalid reference to client or project manager');
      }
      throw new DatabaseError('Failed to update project');
    }
  }));

  // DELETE /api/projects/:id - Delete project
  router.delete('/:id', validateParams(idParamSchema), asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const projectId = parseInt(id);

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    if (!project) {
      throw new NotFoundError('Project');
    }

    try {
      db.prepare('DELETE FROM projects WHERE id = ?').run(projectId);

      res.json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error: any) {
      // Handle foreign key constraint violations
      if (error.code === 'SQLITE_CONSTRAINT_FOREIGN') {
        throw new ValidationError('Cannot delete project with existing dependencies (tasks, activities, etc.)');
      }
      throw new DatabaseError('Failed to delete project');
    }
  }));

  return router;
}
