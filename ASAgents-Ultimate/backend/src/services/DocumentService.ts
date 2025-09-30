/**
 * Document Management Service
 * Handles document storage, versioning, workflows, and permissions
 */

import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface Document {
  id: string;
  tenantId: string;
  projectId?: string;
  companyId: string;
  name: string;
  type: 'contract' | 'permit' | 'drawing' | 'photo' | 'report' | 'specification' | 'other';
  categoryId?: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  version: number;
  parentDocumentId?: string;
  workflowStatus: 'draft' | 'review' | 'approved' | 'rejected' | 'archived';
  workflowStep: number;
  approvalRequired: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  expiresAt?: Date;
  tags: string[];
  metadata: Record<string, any>;
  checksum: string;
  accessLevel: 'private' | 'team' | 'project' | 'company' | 'public';
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentCategory {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  parentId?: string;
  workflowTemplateId?: string;
  retentionPolicy: {
    retentionPeriod?: number; // days
    autoArchive: boolean;
    autoDelete: boolean;
  };
  accessLevel: 'private' | 'team' | 'project' | 'company';
  createdAt: Date;
}

export interface WorkflowTemplate {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  autoAssignRules: Record<string, any>;
  notificationSettings: {
    onSubmit: boolean;
    onApprove: boolean;
    onReject: boolean;
    reminderDays: number[];
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowStep {
  stepNumber: number;
  name: string;
  description?: string;
  assignToRole?: string;
  assignToUser?: string;
  requiredFields: string[];
  approvalRequired: boolean;
  parallelApproval: boolean;
  dueInDays: number;
}

export interface DocumentWorkflow {
  id: string;
  documentId: string;
  workflowTemplateId: string;
  currentStep: number;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
  assignedTo?: string;
  dueDate?: Date;
  completedAt?: Date;
  notes?: string;
  history: WorkflowHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowHistory {
  step: number;
  action: 'submit' | 'approve' | 'reject' | 'reassign';
  userId: string;
  timestamp: Date;
  notes?: string;
}

export class DocumentService {
  private readonly db: any;
  private readonly uploadPath: string;
  private readonly maxFileSize: number;
  private readonly allowedMimeTypes: Set<string>;

  constructor(database: any, uploadPath: string = './uploads') {
    this.db = database;
    this.uploadPath = uploadPath;
    this.maxFileSize = 100 * 1024 * 1024; // 100MB
    this.allowedMimeTypes = new Set([
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
      'image/tiff',
      'application/dwg', // CAD files
      'application/dxf'
    ]);
  }

  /**
   * Upload and create document
   */
  async uploadDocument(
    file: any,
    metadata: Partial<Document>,
    uploadedBy: string
  ): Promise<Document> {
    // Validate file
    this.validateFile(file);

    // Generate unique filename
    const filename = this.generateUniqueFilename(file.originalname);
    const filePath = path.join(this.uploadPath, filename);

    // Calculate checksum
    const checksum = await this.calculateChecksum(file.buffer);

    // Check for duplicates
    await this.checkForDuplicates(checksum, metadata.tenantId!);

    // Ensure upload directory exists
    await this.ensureUploadDirectory();

    // Save file
    await fs.writeFile(filePath, file.buffer);

    // Create document record
    const document: Document = {
      id: this.generateId('doc'),
      tenantId: metadata.tenantId!,
      projectId: metadata.projectId,
      companyId: metadata.companyId!,
      name: file.originalname,
      type: metadata.type || 'other',
      categoryId: metadata.categoryId,
      fileUrl: `/uploads/${filename}`,
      fileSize: file.size,
      mimeType: file.mimetype,
      version: 1,
      parentDocumentId: metadata.parentDocumentId,
      workflowStatus: 'draft',
      workflowStep: 0,
      approvalRequired: metadata.approvalRequired || false,
      expiresAt: metadata.expiresAt,
      tags: metadata.tags || [],
      metadata: metadata.metadata || {},
      checksum,
      accessLevel: metadata.accessLevel || 'private',
      uploadedBy,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert into database
    await this.db.run(`
      INSERT INTO documents (
        id, tenant_id, project_id, company_id, name, type, category_id,
        file_url, file_size, mime_type, version, parent_document_id,
        workflow_status, workflow_step, approval_required, expires_at,
        tags, metadata, checksum, access_level, uploaded_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      document.id, document.tenantId, document.projectId, document.companyId,
      document.name, document.type, document.categoryId, document.fileUrl,
      document.fileSize, document.mimeType, document.version, document.parentDocumentId,
      document.workflowStatus, document.workflowStep, document.approvalRequired ? 1 : 0,
      document.expiresAt?.toISOString(), JSON.stringify(document.tags),
      JSON.stringify(document.metadata), document.checksum, document.accessLevel,
      document.uploadedBy, document.createdAt.toISOString(), document.updatedAt.toISOString()
    ]);

    // Start workflow if category has one
    if (document.categoryId) {
      await this.startWorkflowIfRequired(document.id, document.categoryId);
    }

    return document;
  }

  /**
   * Create new document version
   */
  async createVersion(parentDocumentId: string, file: any, uploadedBy: string, notes?: string): Promise<Document> {
    // Get parent document
    const parent = await this.getDocument(parentDocumentId);
    if (!parent) {
      throw new Error('Parent document not found');
    }

    // Upload new version
    const newVersion = await this.uploadDocument(file, {
      ...parent,
      parentDocumentId,
      version: parent.version + 1
    }, uploadedBy);

    // Update parent document to mark as superseded
    await this.db.run(`
      UPDATE documents 
      SET workflow_status = 'archived', updated_at = ?
      WHERE id = ?
    `, [new Date().toISOString(), parentDocumentId]);

    // Log version creation
    await this.logDocumentAction(parentDocumentId, 'version_created', uploadedBy, notes);

    return newVersion;
  }

  /**
   * Get document by ID
   */
  async getDocument(documentId: string): Promise<Document | null> {
    const row = await this.db.get(`
      SELECT * FROM documents WHERE id = ?
    `, [documentId]);

    if (!row) return null;

    return this.mapDocumentFromDb(row);
  }

  /**
   * Search documents with filters
   */
  async searchDocuments(filters: {
    tenantId: string;
    projectId?: string;
    type?: string;
    categoryId?: string;
    workflowStatus?: string;
    uploadedBy?: string;
    searchTerm?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  }): Promise<{ documents: Document[]; total: number }> {
    let whereClause = 'WHERE tenant_id = ?';
    const params: any[] = [filters.tenantId];

    if (filters.projectId) {
      whereClause += ' AND project_id = ?';
      params.push(filters.projectId);
    }

    if (filters.type) {
      whereClause += ' AND type = ?';
      params.push(filters.type);
    }

    if (filters.categoryId) {
      whereClause += ' AND category_id = ?';
      params.push(filters.categoryId);
    }

    if (filters.workflowStatus) {
      whereClause += ' AND workflow_status = ?';
      params.push(filters.workflowStatus);
    }

    if (filters.uploadedBy) {
      whereClause += ' AND uploaded_by = ?';
      params.push(filters.uploadedBy);
    }

    if (filters.searchTerm) {
      whereClause += ' AND (name LIKE ? OR metadata LIKE ?)';
      const searchPattern = `%${filters.searchTerm}%`;
      params.push(searchPattern, searchPattern);
    }

    if (filters.tags && filters.tags.length > 0) {
      const tagConditions = filters.tags.map(() => 'tags LIKE ?').join(' AND ');
      whereClause += ` AND (${tagConditions})`;
      filters.tags.forEach(tag => params.push(`%"${tag}"%`));
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM documents ${whereClause}`;
    const countResult = await this.db.get(countQuery, params);

    // Get documents
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    
    const documentsQuery = `
      SELECT * FROM documents ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const rows = await this.db.all(documentsQuery, [...params, limit, offset]);

    const documents = rows.map((row: any) => this.mapDocumentFromDb(row));

    return {
      documents,
      total: countResult.total
    };
  }

  /**
   * Update document workflow status
   */
  async updateWorkflowStatus(
    documentId: string,
    action: 'submit' | 'approve' | 'reject',
    userId: string,
    notes?: string
  ): Promise<void> {
    const document = await this.getDocument(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    const workflow = await this.getDocumentWorkflow(documentId);
    if (!workflow) {
      throw new Error('Document workflow not found');
    }

    let newStatus = workflow.status;
    let newStep = workflow.currentStep;

    switch (action) {
      case 'submit':
        if (workflow.status === 'pending') {
          newStatus = 'in_progress';
          newStep = 1;
        }
        break;

      case 'approve': {
        // Check if there are more steps
        const template = await this.getWorkflowTemplate(workflow.workflowTemplateId);
        if (template && newStep < template.steps.length) {
          newStep += 1;
        } else {
          newStatus = 'completed';
          await this.db.run(`
            UPDATE documents 
            SET workflow_status = 'approved', approved_by = ?, approved_at = ?
            WHERE id = ?
          `, [userId, new Date().toISOString(), documentId]);
        }
        break;
      }

      case 'reject':
        newStatus = 'rejected';
        await this.db.run(`
          UPDATE documents 
          SET workflow_status = 'rejected'
          WHERE id = ?
        `, [documentId]);
        break;
    }

    // Update workflow
    await this.db.run(`
      UPDATE document_workflows 
      SET current_step = ?, status = ?, updated_at = ?
      WHERE document_id = ?
    `, [newStep, newStatus, new Date().toISOString(), documentId]);

    // Log workflow action
    await this.logWorkflowAction(workflow.id, newStep, action, userId, notes);

    // Send notifications
    await this.sendWorkflowNotifications(documentId, action, userId);
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId: string, deletedBy: string): Promise<void> {
    const document = await this.getDocument(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Delete file from filesystem
    const fullPath = path.join(process.cwd(), document.fileUrl);
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      console.warn('Failed to delete file:', error);
    }

    // Delete from database
    await this.db.run('DELETE FROM documents WHERE id = ?', [documentId]);

    // Log deletion
    await this.logDocumentAction(documentId, 'deleted', deletedBy);
  }

  /**
   * Create document category
   */
  async createCategory(categoryData: Omit<DocumentCategory, 'id' | 'createdAt'>): Promise<DocumentCategory> {
    const category: DocumentCategory = {
      id: this.generateId('cat'),
      ...categoryData,
      createdAt: new Date()
    };

    await this.db.run(`
      INSERT INTO document_categories (
        id, tenant_id, name, description, parent_id, workflow_template_id,
        retention_policy, access_level, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      category.id, category.tenantId, category.name, category.description,
      category.parentId, category.workflowTemplateId,
      JSON.stringify(category.retentionPolicy), category.accessLevel,
      category.createdAt.toISOString()
    ]);

    return category;
  }

  // Private helper methods

  private validateFile(file: any): void {
    if (!file) {
      throw new Error('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new Error(`File size exceeds limit of ${this.maxFileSize} bytes`);
    }

    if (!this.allowedMimeTypes.has(file.mimetype)) {
      throw new Error(`File type ${file.mimetype} not allowed`);
    }
  }

  private async calculateChecksum(buffer: Buffer): Promise<string> {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  private async checkForDuplicates(checksum: string, tenantId: string): Promise<void> {
    const existing = await this.db.get(`
      SELECT id FROM documents WHERE checksum = ? AND tenant_id = ?
    `, [checksum, tenantId]);

    if (existing) {
      throw new Error('Duplicate file detected');
    }
  }

  private generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(originalName);
    return `${timestamp}_${random}${ext}`;
  }

  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadPath);
    } catch {
      await fs.mkdir(this.uploadPath, { recursive: true });
    }
  }

  private mapDocumentFromDb(row: any): Document {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      projectId: row.project_id,
      companyId: row.company_id,
      name: row.name,
      type: row.type,
      categoryId: row.category_id,
      fileUrl: row.file_url,
      fileSize: row.file_size,
      mimeType: row.mime_type,
      version: row.version,
      parentDocumentId: row.parent_document_id,
      workflowStatus: row.workflow_status,
      workflowStep: row.workflow_step,
      approvalRequired: Boolean(row.approval_required),
      approvedBy: row.approved_by,
      approvedAt: row.approved_at ? new Date(row.approved_at) : undefined,
      expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
      tags: JSON.parse(row.tags || '[]'),
      metadata: JSON.parse(row.metadata || '{}'),
      checksum: row.checksum,
      accessLevel: row.access_level,
      uploadedBy: row.uploaded_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
  }

  private async startWorkflowIfRequired(documentId: string, categoryId: string): Promise<void> {
    // Implementation for starting workflows
    // This would check if the category has a workflow template and start it
  }

  private async getDocumentWorkflow(documentId: string): Promise<DocumentWorkflow | null> {
    // Implementation to get document workflow
    return null; // Placeholder
  }

  private async getWorkflowTemplate(templateId: string): Promise<WorkflowTemplate | null> {
    // Implementation to get workflow template
    return null; // Placeholder
  }

  private async logDocumentAction(documentId: string, action: string, userId: string, notes?: string): Promise<void> {
    // Implementation for logging document actions
  }

  private async logWorkflowAction(workflowId: string, step: number, action: string, userId: string, notes?: string): Promise<void> {
    // Implementation for logging workflow actions
  }

  private async sendWorkflowNotifications(documentId: string, action: string, userId: string): Promise<void> {
    // Implementation for sending workflow notifications
  }
}