import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

let documents: any[] = []; // In production, this would be from database

const verifyAuth = (req: VercelRequest) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }
  const token = authHeader.substring(7);
  return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const user = verifyAuth(req);
    const { operation, document_ids, updates, filters } = req.body;

    if (!operation) {
      return res.status(400).json({
        success: false,
        error: 'Operation is required (update, delete, approve, reject, archive, change_category, add_tags, remove_tags)'
      });
    }

    let affectedDocuments: any[] = [];
    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[]
    };

    // Get documents to operate on
    if (document_ids && Array.isArray(document_ids)) {
      affectedDocuments = documents.filter(d => document_ids.includes(d.id));
    } else if (filters) {
      affectedDocuments = documents.filter(d => {
        if (filters.company_id && d.company_id !== filters.company_id) return false;
        if (filters.project_id && d.project_id !== filters.project_id) return false;
        if (filters.category && d.category !== filters.category) return false;
        if (filters.status && d.status !== filters.status) return false;
        return true;
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Either document_ids or filters must be provided'
      });
    }

    if (affectedDocuments.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No documents found matching criteria'
      });
    }

    // Check permissions for admin operations
    const adminOperations = ['delete', 'approve', 'reject'];
    if (adminOperations.includes(operation) &&
        user.role !== 'super_admin' && user.role !== 'company_admin') {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }

    // Perform batch operation
    switch (operation) {
      case 'update':
        if (!updates) {
          return res.status(400).json({ success: false, error: 'Updates object required' });
        }

        affectedDocuments.forEach(doc => {
          const docIndex = documents.findIndex(d => d.id === doc.id);
          if (docIndex !== -1) {
            documents[docIndex] = {
              ...doc,
              ...updates,
              id: doc.id,
              company_id: doc.company_id,
              uploaded_by: doc.uploaded_by,
              created_at: doc.created_at,
              updated_at: new Date().toISOString()
            };
            results.success++;
          } else {
            results.failed++;
            results.errors.push({ document_id: doc.id, error: 'Document not found' });
          }
        });
        break;

      case 'delete':
        affectedDocuments.forEach(doc => {
          // Can't delete critical approved documents
          if (doc.status === 'approved' && doc.tags?.includes('critical')) {
            results.failed++;
            results.errors.push({ document_id: doc.id, error: 'Cannot delete critical approved documents' });
            return;
          }

          const docIndex = documents.findIndex(d => d.id === doc.id);
          if (docIndex !== -1) {
            documents.splice(docIndex, 1);
            results.success++;
          } else {
            results.failed++;
            results.errors.push({ document_id: doc.id, error: 'Document not found' });
          }
        });
        break;

      case 'approve':
        affectedDocuments.forEach(doc => {
          const docIndex = documents.findIndex(d => d.id === doc.id);
          if (docIndex !== -1) {
            documents[docIndex] = {
              ...doc,
              status: 'approved',
              reviewed_by: user.userId,
              reviewed_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            results.success++;
          } else {
            results.failed++;
            results.errors.push({ document_id: doc.id, error: 'Document not found' });
          }
        });
        break;

      case 'reject':
        if (!updates?.rejection_reason) {
          return res.status(400).json({ success: false, error: 'rejection_reason is required' });
        }

        affectedDocuments.forEach(doc => {
          const docIndex = documents.findIndex(d => d.id === doc.id);
          if (docIndex !== -1) {
            documents[docIndex] = {
              ...doc,
              status: 'rejected',
              reviewed_by: user.userId,
              reviewed_at: new Date().toISOString(),
              rejection_reason: updates.rejection_reason,
              updated_at: new Date().toISOString()
            };
            results.success++;
          } else {
            results.failed++;
            results.errors.push({ document_id: doc.id, error: 'Document not found' });
          }
        });
        break;

      case 'archive':
        affectedDocuments.forEach(doc => {
          const docIndex = documents.findIndex(d => d.id === doc.id);
          if (docIndex !== -1) {
            documents[docIndex] = {
              ...doc,
              status: 'archived',
              archived_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            results.success++;
          } else {
            results.failed++;
            results.errors.push({ document_id: doc.id, error: 'Document not found' });
          }
        });
        break;

      case 'change_category':
        if (!updates?.category) {
          return res.status(400).json({ success: false, error: 'category is required' });
        }

        affectedDocuments.forEach(doc => {
          const docIndex = documents.findIndex(d => d.id === doc.id);
          if (docIndex !== -1) {
            documents[docIndex] = {
              ...doc,
              category: updates.category,
              updated_at: new Date().toISOString()
            };
            results.success++;
          } else {
            results.failed++;
            results.errors.push({ document_id: doc.id, error: 'Document not found' });
          }
        });
        break;

      case 'add_tags':
        if (!updates?.tags || !Array.isArray(updates.tags)) {
          return res.status(400).json({ success: false, error: 'tags array is required' });
        }

        affectedDocuments.forEach(doc => {
          const docIndex = documents.findIndex(d => d.id === doc.id);
          if (docIndex !== -1) {
            const existingTags = doc.tags || [];
            const newTags = [...new Set([...existingTags, ...updates.tags])];
            documents[docIndex] = {
              ...doc,
              tags: newTags,
              updated_at: new Date().toISOString()
            };
            results.success++;
          } else {
            results.failed++;
            results.errors.push({ document_id: doc.id, error: 'Document not found' });
          }
        });
        break;

      case 'remove_tags':
        if (!updates?.tags || !Array.isArray(updates.tags)) {
          return res.status(400).json({ success: false, error: 'tags array is required' });
        }

        affectedDocuments.forEach(doc => {
          const docIndex = documents.findIndex(d => d.id === doc.id);
          if (docIndex !== -1) {
            const existingTags = doc.tags || [];
            const newTags = existingTags.filter((tag: string) => !updates.tags.includes(tag));
            documents[docIndex] = {
              ...doc,
              tags: newTags,
              updated_at: new Date().toISOString()
            };
            results.success++;
          } else {
            results.failed++;
            results.errors.push({ document_id: doc.id, error: 'Document not found' });
          }
        });
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid operation. Supported: update, delete, approve, reject, archive, change_category, add_tags, remove_tags'
        });
    }

    console.log(`✅ Batch document ${operation}: ${results.success} succeeded, ${results.failed} failed`);

    // Create activity log
    const activity = {
      type: 'batch_document_operation',
      operation,
      user_id: user.userId,
      affected_count: results.success,
      timestamp: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      message: `Batch operation completed`,
      results,
      activity,
      total_affected: affectedDocuments.length
    });

  } catch (error: any) {
    console.error('❌ Batch documents API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
