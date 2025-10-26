import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cortexbuild-secret-2025';

let documents = [
  {
    id: 'doc-1',
    company_id: 'company-1',
    project_id: 'proj-1',
    name: 'Structural Drawings Package A',
    description: 'Complete structural steel framing drawings for levels 1-10',
    file_path: '/documents/structural/package-a.pdf',
    file_size: 15728640,
    file_type: 'application/pdf',
    category: 'drawing',
    version: 3,
    uploaded_by: 'user-2',
    is_public: 0,
    tags: ['structural', 'drawings', 'steel', 'critical'],
    status: 'approved',
    reviewed_by: 'user-2',
    reviewed_at: '2025-01-25T10:00:00Z',
    created_at: '2025-01-20T09:00:00Z',
    updated_at: '2025-01-25T10:00:00Z'
  }
];

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const user = verifyAuth(req);
    const { id } = req.query;

    // GET - Fetch single document
    if (req.method === 'GET') {
      const doc = documents.find(d => d.id === id);

      if (!doc) {
        return res.status(404).json({ success: false, error: 'Document not found' });
      }

      // Check permissions
      if (user.role !== 'super_admin' && doc.company_id !== req.query.company_id) {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      // Check if document is private
      if (!doc.is_public && user.role !== 'super_admin' && user.role !== 'company_admin') {
        return res.status(403).json({ success: false, error: 'Document is private' });
      }

      console.log(`✅ Fetched document ${doc.name}`);

      // Create view activity log
      const activity = {
        type: 'document_viewed',
        document_id: doc.id,
        user_id: user.userId,
        timestamp: new Date().toISOString()
      };

      return res.status(200).json({ success: true, data: doc, activity });
    }

    // PUT/PATCH - Update document metadata
    if (req.method === 'PUT' || req.method === 'PATCH') {
      const docIndex = documents.findIndex(d => d.id === id);

      if (docIndex === -1) {
        return res.status(404).json({ success: false, error: 'Document not found' });
      }

      const doc = documents[docIndex];

      // Check permissions
      if (user.role !== 'super_admin' && user.role !== 'company_admin') {
        // Regular users can only update documents they uploaded
        if (user.userId !== doc.uploaded_by) {
          return res.status(403).json({ success: false, error: 'Insufficient permissions' });
        }
      }

      if (user.role !== 'super_admin' && doc.company_id !== req.query.company_id) {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      const updates = req.body;

      // Check if this is a version update (new file upload)
      const isNewVersion = updates.file_path && updates.file_path !== doc.file_path;

      if (isNewVersion) {
        updates.version = doc.version + 1;
        updates.status = 'pending'; // New versions need re-approval
        updates.reviewed_by = null;
        updates.reviewed_at = null;
      }

      // Check if this is a review/approval
      const isReview = updates.status && ['approved', 'rejected'].includes(updates.status);

      if (isReview && (user.role === 'super_admin' || user.role === 'company_admin')) {
        updates.reviewed_by = user.userId;
        updates.reviewed_at = new Date().toISOString();
      }

      // Update document
      documents[docIndex] = {
        ...doc,
        ...updates,
        id: doc.id,
        company_id: doc.company_id,
        uploaded_by: doc.uploaded_by,
        created_at: doc.created_at,
        updated_at: new Date().toISOString()
      };

      console.log(`✅ Updated document ${documents[docIndex].name}${isNewVersion ? ` (v${documents[docIndex].version})` : ''}`);

      // Create activity log
      const activity = {
        type: isNewVersion ? 'document_version_created' : isReview ? 'document_reviewed' : 'document_updated',
        document_id: doc.id,
        user_id: user.userId,
        changes: updates,
        version: documents[docIndex].version,
        timestamp: new Date().toISOString()
      };

      // Create notification for new version or review
      const notification = (isNewVersion || isReview) ? {
        type: isNewVersion ? 'document_new_version' : `document_${updates.status}`,
        document_id: doc.id,
        document_name: doc.name,
        message: isNewVersion
          ? `New version (v${documents[docIndex].version}) of ${doc.name} uploaded`
          : `Document ${doc.name} has been ${updates.status}`,
        project_id: doc.project_id,
        timestamp: new Date().toISOString()
      } : null;

      return res.status(200).json({
        success: true,
        data: documents[docIndex],
        activity,
        notification,
        message: 'Document updated successfully'
      });
    }

    // DELETE - Delete document
    if (req.method === 'DELETE') {
      const docIndex = documents.findIndex(d => d.id === id);

      if (docIndex === -1) {
        return res.status(404).json({ success: false, error: 'Document not found' });
      }

      const doc = documents[docIndex];

      // Check permissions - only admins or the uploader can delete
      if (user.role !== 'super_admin' && user.role !== 'company_admin') {
        if (user.userId !== doc.uploaded_by) {
          return res.status(403).json({ success: false, error: 'Insufficient permissions' });
        }
      }

      if (user.role !== 'super_admin' && doc.company_id !== req.query.company_id) {
        return res.status(403).json({ success: false, error: 'Insufficient permissions' });
      }

      // Can't delete approved critical documents
      if (doc.status === 'approved' && doc.tags.includes('critical')) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete critical approved documents',
          details: 'Please archive instead or contact an administrator'
        });
      }

      documents.splice(docIndex, 1);

      console.log(`✅ Deleted document ${doc.name}`);

      // Create activity log
      const activity = {
        type: 'document_deleted',
        document_id: doc.id,
        document_name: doc.name,
        user_id: user.userId,
        timestamp: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        activity,
        message: 'Document deleted successfully'
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error: any) {
    console.error('❌ Document API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
