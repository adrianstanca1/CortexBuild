// CortexBuild Platform - Documents API Routes
// Version: 2.0.0 - Supabase Migration
// Last Updated: 2025-10-31

import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { Document, ApiResponse, PaginatedResponse } from '../types';

export function createDocumentsRouter(supabase: SupabaseClient): Router {
  const router = Router();

  // GET /api/documents - List all documents
  router.get('/', async (req: Request, res: Response) => {
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

      let query = supabase
        .from('documents')
        .select(`
          *,
          projects!documents_project_id_fkey(id, name),
          users!documents_uploaded_by_fkey(id, name)
        `, { count: 'exact' });

      // Apply filters
      if (project_id) {
        query = query.eq('project_id', project_id);
      }

      if (category) {
        query = query.eq('category', category);
      }

      if (uploaded_by) {
        query = query.eq('uploaded_by', uploaded_by);
      }

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // Add pagination and ordering
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limitNum - 1);

      const { data: documents, error, count } = await query;

      if (error) throw error;

      // Transform data
      const transformedDocuments = (documents || []).map((d: any) => {
        const projects = Array.isArray(d.projects) ? d.projects[0] : d.projects;
        const users = Array.isArray(d.users) ? d.users[0] : d.users;
        return {
          ...d,
          project_name: projects?.name || null,
          uploaded_by_name: users?.name || null
        };
      });

      res.json({
        success: true,
        data: transformedDocuments,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limitNum)
        }
      });
    } catch (error: any) {
      console.error('Get documents error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // GET /api/documents/:id - Get single document
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: document, error } = await supabase
        .from('documents')
        .select(`
          *,
          projects!documents_project_id_fkey(id, name),
          users!documents_uploaded_by_fkey(id, name, email)
        `)
        .eq('id', id)
        .single();

      if (error || !document) {
        return res.status(404).json({
          success: false,
          error: 'Document not found'
        });
      }

      // Transform data
      const projects = Array.isArray(document.projects) ? document.projects[0] : document.projects;
      const users = Array.isArray(document.users) ? document.users[0] : document.users;

      const transformedDocument = {
        ...document,
        project_name: projects?.name || null,
        uploaded_by_name: users?.name || null,
        uploaded_by_email: users?.email || null
      };

      res.json({
        success: true,
        data: transformedDocument
      });
    } catch (error: any) {
      console.error('Get document error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // POST /api/documents - Upload new document
  router.post('/', async (req: Request, res: Response) => {
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

      const { data: document, error } = await supabase
        .from('documents')
        .insert({
          project_id,
          name,
          description: description || null,
          category: category || null,
          file_path,
          file_size: file_size || null,
          file_type: file_type || null,
          uploaded_by
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      try {
        await supabase
          .from('activities')
          .insert({
            user_id: uploaded_by,
            project_id,
            entity_type: 'document',
            entity_id: document.id,
            action: 'uploaded',
            description: `Uploaded document: ${name}`
          });
      } catch (activityError) {
        console.warn('Failed to log activity:', activityError);
      }

      res.status(201).json({
        success: true,
        data: document,
        message: 'Document uploaded successfully'
      });
    } catch (error: any) {
      console.error('Upload document error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // GET /api/documents/:id/download - Download document
  router.get('/:id/download', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: document, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !document) {
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
      console.error('Download document error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // DELETE /api/documents/:id - Delete document
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const { data: document } = await supabase
        .from('documents')
        .select('id')
        .eq('id', id)
        .single();

      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Document not found'
        });
      }

      // In a real implementation, this would also delete the physical file
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete document error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}
