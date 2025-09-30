import { Router, Request, Response } from 'express';
import { authenticate as authMiddleware } from '../middleware/auth';

const router = Router();

// Mock document data
const mockDocuments = [
  {
    id: 'doc-001',
    name: 'Project Blueprint v2.1.pdf',
    type: 'blueprint',
    size: 2048576,
    mimeType: 'application/pdf',
    url: '/api/documents/doc-001/download',
    uploadedBy: 'John Smith',
    uploadedAt: '2025-09-28T08:30:00Z',
    projectId: 'proj-123',
    version: '2.1',
    status: 'approved',
    tags: ['blueprint', 'construction', 'current']
  },
  {
    id: 'doc-002',
    name: 'Safety_Protocols_2025.docx',
    type: 'safety',
    size: 1524000,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    url: '/api/documents/doc-002/download',
    uploadedBy: 'Sarah Wilson',
    uploadedAt: '2025-09-27T16:45:00Z',
    projectId: null,
    version: '1.0',
    status: 'active',
    tags: ['safety', 'protocols', 'company-wide']
  },
  {
    id: 'doc-003',
    name: 'Equipment_Rental_Agreement.pdf',
    type: 'contract',
    size: 987654,
    mimeType: 'application/pdf',
    url: '/api/documents/doc-003/download',
    uploadedBy: 'Mike Johnson',
    uploadedAt: '2025-09-26T11:20:00Z',
    projectId: 'proj-456',
    version: '1.0',
    status: 'pending_approval',
    tags: ['contract', 'equipment', 'legal']
  }
];

// Get all documents (requires authentication)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { type, status, projectId, search } = req.query;
    let filteredDocuments = [...mockDocuments];

    if (type) {
      filteredDocuments = filteredDocuments.filter(d => d.type === type);
    }
    
    if (status) {
      filteredDocuments = filteredDocuments.filter(d => d.status === status);
    }

    if (projectId) {
      filteredDocuments = filteredDocuments.filter(d => d.projectId === projectId);
    }

    if (search) {
      const searchLower = (search as string).toLowerCase();
      filteredDocuments = filteredDocuments.filter(d => 
        d.name.toLowerCase().includes(searchLower) ||
        d.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    res.json({
      success: true,
      data: filteredDocuments,
      meta: {
        total: filteredDocuments.length,
        filters: { type, status, projectId, search }
      }
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch documents'
    });
  }
});

// Get document by ID (requires authentication)
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const document = mockDocuments.find(d => d.id === req.params.id);
    
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
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch document'
    });
  }
});

// Upload document (requires authentication)
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const newDocument = {
      id: `doc-${Date.now()}`,
      ...req.body,
      url: `/api/documents/doc-${Date.now()}/download`,
      uploadedAt: new Date().toISOString(),
      version: '1.0',
      status: 'pending_approval'
    };

    mockDocuments.push(newDocument);

    res.status(201).json({
      success: true,
      data: newDocument
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload document'
    });
  }
});

// Update document status (requires authentication)
router.patch('/:id/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const documentIndex = mockDocuments.findIndex(d => d.id === req.params.id);
    
    if (documentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    const { status } = req.body;
    
    mockDocuments[documentIndex] = {
      ...mockDocuments[documentIndex],
      status
    };

    res.json({
      success: true,
      data: mockDocuments[documentIndex]
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update document'
    });
  }
});

// Download document (requires authentication)
router.get('/:id/download', authMiddleware, async (req: Request, res: Response) => {
  try {
    const document = mockDocuments.find(d => d.id === req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // In a real implementation, this would stream the actual file
    res.json({
      success: true,
      message: 'Document download initiated',
      data: {
        id: document.id,
        name: document.name,
        downloadUrl: `/downloads/${document.name}`
      }
    });
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download document'
    });
  }
});

// Delete document (requires authentication)
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const documentIndex = mockDocuments.findIndex(d => d.id === req.params.id);
    
    if (documentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    const deletedDocument = mockDocuments.splice(documentIndex, 1)[0];

    res.json({
      success: true,
      message: 'Document deleted successfully',
      data: deletedDocument
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete document'
    });
  }
});

export default router;