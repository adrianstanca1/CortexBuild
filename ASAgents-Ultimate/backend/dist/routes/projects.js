"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const connection_1 = require("../database/connection");
const auth_1 = require("../middleware/auth");
const tenant_1 = require("../middleware/tenant");
const validation_1 = require("../middleware/validation");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, tenant_1.tenantContext, auth_1.requireCompanyAccess, (0, validation_1.validateQuery)(validation_1.schemas.projectsQuery), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const db = (0, connection_1.getDatabase)();
    const companyId = req.user.company_id;
    const query = req.query;
    let whereClause = 'WHERE p.company_id = ?';
    const params = [companyId];
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
    const sortField = query.sort || 'created_at';
    const sortOrder = query.order || 'desc';
    const orderClause = `ORDER BY p.${sortField} ${sortOrder.toUpperCase()}`;
    const countResult = await db.get(`
      SELECT COUNT(*) as count
      FROM projects p
      ${whereClause}
    `, params);
    const total = countResult?.count || 0;
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;
    const pages = Math.ceil(total / limit);
    const projects = await db.all(`
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
    const response = {
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
}));
router.get('/:id', auth_1.authenticate, tenant_1.tenantContext, auth_1.requireCompanyAccess, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const db = (0, connection_1.getDatabase)();
    const projectId = req.params.id;
    const companyId = req.user.company_id;
    const project = await db.get(`
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
        throw errorHandler_1.errors.notFound('Project');
    }
    const response = {
        success: true,
        data: project
    };
    res.json(response);
}));
router.post('/', auth_1.authenticate, tenant_1.tenantContext, auth_1.requireCompanyAccess, (0, validation_1.validate)(validation_1.schemas.createProject), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const db = (0, connection_1.getDatabase)();
    const companyId = req.user.company_id;
    const projectData = req.body;
    if (projectData.client_id) {
        const client = await db.get(`
        SELECT id FROM companies 
        WHERE id = ? AND type = 'client' AND is_active = 1
      `, [projectData.client_id]);
        if (!client) {
            throw errorHandler_1.errors.badRequest('Invalid client ID');
        }
    }
    const projectId = (0, uuid_1.v4)();
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
    const project = await db.get(`
      SELECT 
        p.*,
        u.first_name || ' ' || u.last_name as manager_name,
        c.name as client_name
      FROM projects p
      LEFT JOIN users u ON p.manager_id = u.id
      LEFT JOIN companies c ON p.client_id = c.id
      WHERE p.id = ?
    `, [projectId]);
    const response = {
        success: true,
        data: project,
        message: 'Project created successfully'
    };
    res.status(201).json(response);
}));
router.put('/:id', auth_1.authenticate, tenant_1.tenantContext, auth_1.requireCompanyAccess, (0, validation_1.validate)(validation_1.schemas.updateProject), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const db = (0, connection_1.getDatabase)();
    const projectId = req.params.id;
    const companyId = req.user.company_id;
    const updates = req.body;
    const existingProject = await db.get(`
      SELECT id FROM projects 
      WHERE id = ? AND company_id = ?
    `, [projectId, companyId]);
    if (!existingProject) {
        throw errorHandler_1.errors.notFound('Project');
    }
    if (updates.client_id) {
        const client = await db.get(`
        SELECT id FROM companies 
        WHERE id = ? AND type = 'client' AND is_active = 1
      `, [updates.client_id]);
        if (!client) {
            throw errorHandler_1.errors.badRequest('Invalid client ID');
        }
    }
    const updateFields = Object.keys(updates);
    if (updateFields.length === 0) {
        throw errorHandler_1.errors.badRequest('No fields to update');
    }
    const setClause = updateFields.map(field => `${field} = ?`).join(', ');
    const values = updateFields.map(field => updates[field]);
    values.push(projectId, companyId);
    await db.run(`
      UPDATE projects 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND company_id = ?
    `, values);
    const project = await db.get(`
      SELECT 
        p.*,
        u.first_name || ' ' || u.last_name as manager_name,
        c.name as client_name
      FROM projects p
      LEFT JOIN users u ON p.manager_id = u.id
      LEFT JOIN companies c ON p.client_id = c.id
      WHERE p.id = ?
    `, [projectId]);
    const response = {
        success: true,
        data: project,
        message: 'Project updated successfully'
    };
    res.json(response);
}));
router.delete('/:id', auth_1.authenticate, tenant_1.tenantContext, auth_1.requireCompanyAccess, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const db = (0, connection_1.getDatabase)();
    const projectId = req.params.id;
    const companyId = req.user.company_id;
    const existingProject = await db.get(`
      SELECT id FROM projects 
      WHERE id = ? AND company_id = ?
    `, [projectId, companyId]);
    if (!existingProject) {
        throw errorHandler_1.errors.notFound('Project');
    }
    const relatedData = await db.get(`
      SELECT 
        (SELECT COUNT(*) FROM tasks WHERE project_id = ?) as task_count,
        (SELECT COUNT(*) FROM invoices WHERE project_id = ?) as invoice_count,
        (SELECT COUNT(*) FROM expenses WHERE project_id = ?) as expense_count
    `, [projectId, projectId, projectId]);
    if (relatedData && (relatedData.task_count > 0 || relatedData.invoice_count > 0 || relatedData.expense_count > 0)) {
        throw errorHandler_1.errors.badRequest('Cannot delete project with related tasks, invoices, or expenses');
    }
    await db.run(`
      DELETE FROM projects 
      WHERE id = ? AND company_id = ?
    `, [projectId, companyId]);
    const response = {
        success: true,
        message: 'Project deleted successfully'
    };
    res.json(response);
}));
router.get('/:id/stats', auth_1.authenticate, tenant_1.tenantContext, auth_1.requireCompanyAccess, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const db = (0, connection_1.getDatabase)();
    const projectId = req.params.id;
    const companyId = req.user.company_id;
    const project = await db.get(`
      SELECT id FROM projects 
      WHERE id = ? AND company_id = ?
    `, [projectId, companyId]);
    if (!project) {
        throw errorHandler_1.errors.notFound('Project');
    }
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
    const response = {
        success: true,
        data: stats
    };
    res.json(response);
}));
exports.default = router;
//# sourceMappingURL=projects.js.map