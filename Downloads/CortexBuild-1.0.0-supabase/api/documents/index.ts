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
    file_size: 15728640, // 15 MB
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
  },
  {
    id: 'doc-2',
    company_id: 'company-1',
    project_id: 'proj-1',
    name: 'Foundation Photos - January 2025',
    description: 'Site progress photos of foundation work completion',
    file_path: '/documents/photos/foundation-jan-2025.zip',
    file_size: 52428800, // 50 MB
    file_type: 'application/zip',
    category: 'photo',
    version: 1,
    uploaded_by: 'user-3',
    is_public: 1,
    tags: ['photos', 'foundation', 'progress', 'january'],
    status: 'active',
    reviewed_by: null,
    reviewed_at: null,
    created_at: '2025-01-26T14:30:00Z',
    updated_at: '2025-01-26T14:30:00Z'
  },
  {
    id: 'doc-3',
    company_id: 'company-1',
    project_id: 'proj-1',
    name: 'General Contractor Agreement',
    description: 'Signed contract with ConstructCo for Metropolis Tower project',
    file_path: '/documents/contracts/gc-agreement-metropolis.pdf',
    file_size: 2097152, // 2 MB
    file_type: 'application/pdf',
    category: 'contract',
    version: 1,
    uploaded_by: 'user-2',
    is_public: 0,
    tags: ['contract', 'legal', 'signed'],
    status: 'archived',
    reviewed_by: 'user-1',
    reviewed_at: '2025-01-10T16:00:00Z',
    created_at: '2025-01-08T11:00:00Z',
    updated_at: '2025-01-10T16:00:00Z'
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

    // GET - Fetch documents with advanced filtering
    if (req.method === 'GET') {
      const { company_id, project_id, category, status, search, tags } = req.query;
      let filteredDocs = [...documents];

      // Company-based filtering
      if (user.role !== 'super_admin') {
        filteredDocs = filteredDocs.filter(d => d.company_id === company_id);
      }

      if (company_id && user.role === 'super_admin') {
        filteredDocs = filteredDocs.filter(d => d.company_id === company_id);
      }

      if (project_id) {
        filteredDocs = filteredDocs.filter(d => d.project_id === project_id);
      }

      if (category) {
        filteredDocs = filteredDocs.filter(d => d.category === category);
      }

      if (status) {
        filteredDocs = filteredDocs.filter(d => d.status === status);
      }

      if (tags) {
        const tagList = (tags as string).split(',');
        filteredDocs = filteredDocs.filter(d =>
          tagList.some(tag => d.tags.includes(tag.trim()))
        );
      }

      if (search) {
        const searchLower = (search as string).toLowerCase();
        filteredDocs = filteredDocs.filter(d =>
          d.name.toLowerCase().includes(searchLower) ||
          d.description.toLowerCase().includes(searchLower) ||
          d.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      // Calculate storage and statistics
      const summary = {
        total_documents: filteredDocs.length,
        total_size_bytes: filteredDocs.reduce((sum, d) => sum + d.file_size, 0),
        total_size_mb: Math.round(filteredDocs.reduce((sum, d) => sum + d.file_size, 0) / 1024 / 1024 * 10) / 10,
        by_category: {
          drawing: filteredDocs.filter(d => d.category === 'drawing').length,
          photo: filteredDocs.filter(d => d.category === 'photo').length,
          contract: filteredDocs.filter(d => d.category === 'contract').length,
          report: filteredDocs.filter(d => d.category === 'report').length,
          invoice: filteredDocs.filter(d => d.category === 'invoice').length,
          other: filteredDocs.filter(d => d.category === 'other').length
        },
        by_status: {
          active: filteredDocs.filter(d => d.status === 'active').length,
          approved: filteredDocs.filter(d => d.status === 'approved').length,
          pending: filteredDocs.filter(d => d.status === 'pending').length,
          archived: filteredDocs.filter(d => d.status === 'archived').length
        },
        recent_uploads: filteredDocs
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
          .map(d => ({ id: d.id, name: d.name, created_at: d.created_at }))
      };

      console.log(`📄 Fetched ${filteredDocs.length} documents for ${user.email}`);

      return res.status(200).json({ success: true, data: filteredDocs, summary });
    }

    // POST - Upload new document
    if (req.method === 'POST') {
      const docData = req.body;

      if (!docData.name || !docData.company_id) {
        return res.status(400).json({ success: false, error: 'Document name and company are required' });
      }

      const newDocument = {
        id: `doc-${Date.now()}`,
        company_id: docData.company_id,
        project_id: docData.project_id || null,
        name: docData.name,
        description: docData.description || '',
        file_path: docData.file_path || `/documents/${Date.now()}-${docData.name}`,
        file_size: docData.file_size || 0,
        file_type: docData.file_type || 'application/octet-stream',
        category: docData.category || 'other',
        version: 1,
        uploaded_by: user.userId,
        is_public: docData.is_public || 0,
        tags: docData.tags || [],
        status: 'active',
        reviewed_by: null,
        reviewed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      documents.push(newDocument);

      console.log(`✅ Document uploaded: ${newDocument.name} by ${user.email}`);

      // Create notification for project team
      const notification = {
        type: 'document_uploaded',
        document_id: newDocument.id,
        message: `New document uploaded: ${newDocument.name}`,
        project_id: newDocument.project_id,
        timestamp: new Date().toISOString()
      };

      return res.status(201).json({
        success: true,
        data: newDocument,
        notification,
        message: 'Document uploaded successfully'
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error: any) {
    console.error('❌ Documents API error:', error);
    if (error.message === 'No token provided') {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
