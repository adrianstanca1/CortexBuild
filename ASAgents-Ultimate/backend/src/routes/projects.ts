import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/connection';
import { authenticate, requireCompanyAccess } from '../middleware/auth';
import { tenantContext } from '../middleware/tenant';
import { validate, validateQuery, schemas } from '../middleware/validation';
import { asyncHandler, errors } from '../middleware/errorHandler';
import { Project, ProjectsQuery, CreateProjectRequest, UpdateProjectRequest, ApiResponse } from '../types';

const router = Router();

// Get all projects for user's company
router.get('/',
  authenticate,
  tenantContext,
  requireCompanyAccess,
  validateQuery(schemas.projectsQuery),
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    const companyId = req.user!.company_id!;
    const query = req.query as ProjectsQuery;
    
    // Build WHERE clause
    let whereClause = 'WHERE p.company_id = ?';
    const params: any[] = [companyId];
    
    if (query.status) {
      whereClause += ' AND p.status = ?';
      params.push(query.status);
    }
    
    if (query.priority) {
      whereClause += ' AND p.priority = ?';
      params.push(query.priority);
    }
    
    if (query.client_id) {
      whereClause += ' AND p.client_id = ?';
      params.push(query.client_id);
    }
    
    if (query.search) {
      whereClause += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.address LIKE ?)';
      const searchTerm = `%${query.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Build ORDER BY clause
    const sortField = query.sort || 'created_at';
    const sortOrder = query.order || 'desc';
    const orderClause = `ORDER BY p.${sortField} ${sortOrder.toUpperCase()}`;
    
    // Get total count
    const countResult = await db.get<{ count: number }>(`
      SELECT COUNT(*) as count
      FROM projects p
      ${whereClause}
    `, params);
    
    const total = countResult?.count || 0;
    
    // Calculate pagination
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;
    const pages = Math.ceil(total / limit);
    
    // Get projects with related data
    const projects = await db.all<Project & { 
      manager_name?: string; 
      client_name?: string; 
    }>(`
      SELECT 
        p.*,
        u.first_name || ' ' || u.last_name as manager_name,
        c.name as client_name
      FROM projects p
      LEFT JOIN users u ON p.manager_id = u.id
      LEFT JOIN companies c ON p.client_id = c.id
      ${whereClause}
      ${orderClause}
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);
    
    const response: ApiResponse = {
      success: true,
      data: projects,
      meta: {
        total,
        page,
        limit,
        pages
      }
    };
    
    res.json(response);
  })
);

// Get single project
router.get('/:id',
  authenticate,
  tenantContext,
  requireCompanyAccess,
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    const projectId = req.params.id;
    const companyId = req.user!.company_id!;
    
    const project = await db.get<Project & { 
      manager_name?: string; 
      client_name?: string;
      task_count?: number;
      completed_tasks?: number;
    }>(`
      SELECT 
        p.*,
        u.first_name || ' ' || u.last_name as manager_name,
        c.name as client_name,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'completed') as completed_tasks
      FROM projects p
      LEFT JOIN users u ON p.manager_id = u.id
      LEFT JOIN companies c ON p.client_id = c.id
      WHERE p.id = ? AND p.company_id = ?
    `, [projectId, companyId]);
    
    if (!project) {
      throw errors.notFound('Project');
    }
    
    const response: ApiResponse = {
      success: true,
      data: project
    };
    
    res.json(response);
  })
);

// Create new project
router.post('/',
  authenticate,
  tenantContext,
  requireCompanyAccess,
  validate(schemas.createProject),
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    const companyId = req.user!.company_id!;
    const projectData: CreateProjectRequest = req.body;
    
    // Validate client exists if provided
    if (projectData.client_id) {
      const client = await db.get(`
        SELECT id FROM companies 
        WHERE id = ? AND type = 'client' AND is_active = 1
      `, [projectData.client_id]);
      
      if (!client) {
        throw errors.badRequest('Invalid client ID');
      }
    }
    
    const projectId = uuidv4();
    
    await db.run(`
      INSERT INTO projects (
        id, name, description, company_id, start_date, end_date, budget, client_id, address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      projectId,
      projectData.name,
      projectData.description || null,
      companyId,
      projectData.start_date || null,
      projectData.end_date || null,
      projectData.budget || null,
      projectData.client_id || null,
      projectData.address || null
    ]);
    
    // Get the created project with related data
    const project = await db.get<Project & { 
      manager_name?: string; 
      client_name?: string; 
    }>(`
      SELECT 
        p.*,
        u.first_name || ' ' || u.last_name as manager_name,
        c.name as client_name
      FROM projects p
      LEFT JOIN users u ON p.manager_id = u.id
      LEFT JOIN companies c ON p.client_id = c.id
      WHERE p.id = ?
    `, [projectId]);
    
    const response: ApiResponse = {
      success: true,
      data: project,
      message: 'Project created successfully'
    };
    
    res.status(201).json(response);
  })
);

// Update project
router.put('/:id',
  authenticate,
  tenantContext,
  requireCompanyAccess,
  validate(schemas.updateProject),
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    const projectId = req.params.id;
    const companyId = req.user!.company_id!;
    const updates: UpdateProjectRequest = req.body;
    
    // Check if project exists and belongs to user's company
    const existingProject = await db.get(`
      SELECT id FROM projects 
      WHERE id = ? AND company_id = ?
    `, [projectId, companyId]);
    
    if (!existingProject) {
      throw errors.notFound('Project');
    }
    
    // Validate client exists if provided
    if (updates.client_id) {
      const client = await db.get(`
        SELECT id FROM companies 
        WHERE id = ? AND type = 'client' AND is_active = 1
      `, [updates.client_id]);
      
      if (!client) {
        throw errors.badRequest('Invalid client ID');
      }
    }
    
    const updateFields = Object.keys(updates);
    if (updateFields.length === 0) {
      throw errors.badRequest('No fields to update');
    }
    
    // Build dynamic update query
    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field => updates[field as keyof UpdateProjectRequest]);
    values.push(projectId, companyId);
    
    await db.run(`
      UPDATE projects 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND company_id = ?
    `, values);
    
    // Get updated project with related data
    const project = await db.get<Project & { 
      manager_name?: string; 
      client_name?: string; 
    }>(`
      SELECT 
        p.*,
        u.first_name || ' ' || u.last_name as manager_name,
        c.name as client_name
      FROM projects p
      LEFT JOIN users u ON p.manager_id = u.id
      LEFT JOIN companies c ON p.client_id = c.id
      WHERE p.id = ?
    `, [projectId]);
    
    const response: ApiResponse = {
      success: true,
      data: project,
      message: 'Project updated successfully'
    };
    
    res.json(response);
  })
);

// Delete project
router.delete('/:id',
  authenticate,
  tenantContext,
  requireCompanyAccess,
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    const projectId = req.params.id;
    const companyId = req.user!.company_id!;
    
    // Check if project exists and belongs to user's company
    const existingProject = await db.get(`
      SELECT id FROM projects 
      WHERE id = ? AND company_id = ?
    `, [projectId, companyId]);
    
    if (!existingProject) {
      throw errors.notFound('Project');
    }
    
    // Check if project has related data
    const relatedData = await db.get<{ 
      task_count: number; 
      invoice_count: number; 
      expense_count: number; 
    }>(`
      SELECT 
        (SELECT COUNT(*) FROM tasks WHERE project_id = ?) as task_count,
        (SELECT COUNT(*) FROM invoices WHERE project_id = ?) as invoice_count,
        (SELECT COUNT(*) FROM expenses WHERE project_id = ?) as expense_count
    `, [projectId, projectId, projectId]);
    
    if (relatedData && (relatedData.task_count > 0 || relatedData.invoice_count > 0 || relatedData.expense_count > 0)) {
      throw errors.badRequest('Cannot delete project with related tasks, invoices, or expenses');
    }
    
    await db.run(`
      DELETE FROM projects 
      WHERE id = ? AND company_id = ?
    `, [projectId, companyId]);
    
    const response: ApiResponse = {
      success: true,
      message: 'Project deleted successfully'
    };
    
    res.json(response);
  })
);

// Get project statistics
router.get('/:id/stats',
  authenticate,
  tenantContext,
  requireCompanyAccess,
  asyncHandler(async (req, res) => {
    const db = getDatabase();
    const projectId = req.params.id;
    const companyId = req.user!.company_id!;
    
    // Verify project exists and belongs to user's company
    const project = await db.get(`
      SELECT id FROM projects 
      WHERE id = ? AND company_id = ?
    `, [projectId, companyId]);
    
    if (!project) {
      throw errors.notFound('Project');
    }
    
    // Get comprehensive project statistics
    const stats = await db.get(`
      SELECT 
        (SELECT COUNT(*) FROM tasks WHERE project_id = ?) as total_tasks,
        (SELECT COUNT(*) FROM tasks WHERE project_id = ? AND status = 'completed') as completed_tasks,
        (SELECT COUNT(*) FROM tasks WHERE project_id = ? AND status = 'in_progress') as active_tasks,
        (SELECT COUNT(*) FROM tasks WHERE project_id = ? AND status = 'blocked') as blocked_tasks,
        (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE project_id = ?) as total_expenses,
        (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE project_id = ? AND is_billable = 1) as billable_expenses,
        (SELECT COUNT(*) FROM invoices WHERE project_id = ?) as total_invoices,
        (SELECT COALESCE(SUM(total_amount), 0) FROM invoices WHERE project_id = ?) as total_invoiced,
        (SELECT COALESCE(SUM(paid_amount), 0) FROM invoices WHERE project_id = ?) as total_paid
    `, [projectId, projectId, projectId, projectId, projectId, projectId, projectId, projectId, projectId]);
    
    const response: ApiResponse = {
      success: true,
      data: stats
    };
    
    res.json(response);
  })
);

export default router;
