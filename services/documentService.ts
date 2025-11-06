// CortexBuild Document Management Service
import { Document, User, Project } from '../types';

export interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  allowedTypes: string[];
  maxSize: number; // in MB
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: string;
  url: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  changes: string;
}

export interface DocumentPermission {
  userId: string;
  permission: 'view' | 'edit' | 'admin';
  grantedBy: string;
  grantedAt: string;
}

export interface DocumentMetadata {
  tags: string[];
  customFields: { [key: string]: any };
  expiryDate?: string;
  reviewDate?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
}

export interface ExtendedDocument extends Document {
  category: DocumentCategory;
  versions: DocumentVersion[];
  permissions: DocumentPermission[];
  metadata: DocumentMetadata;
  downloadCount: number;
  lastAccessed?: string;
  isArchived: boolean;
}

class DocumentService {
  private documents: ExtendedDocument[] = [];
  private categories: DocumentCategory[] = [];

  constructor() {
    this.initializeCategories();
    this.initializeMockDocuments();
  }

  private initializeCategories() {
    this.categories = [
      {
        id: 'drawings',
        name: 'Drawings & Plans',
        description: 'Architectural drawings, blueprints, and technical plans',
        icon: 'blueprint',
        color: 'blue',
        allowedTypes: ['pdf', 'dwg', 'dxf', 'jpg', 'png'],
        maxSize: 50
      },
      {
        id: 'specifications',
        name: 'Specifications',
        description: 'Technical specifications and requirements',
        icon: 'document',
        color: 'green',
        allowedTypes: ['pdf', 'doc', 'docx', 'txt'],
        maxSize: 25
      },
      {
        id: 'contracts',
        name: 'Contracts & Legal',
        description: 'Contracts, agreements, and legal documents',
        icon: 'contract',
        color: 'red',
        allowedTypes: ['pdf', 'doc', 'docx'],
        maxSize: 10
      },
      {
        id: 'reports',
        name: 'Reports',
        description: 'Progress reports, inspection reports, and analysis',
        icon: 'report',
        color: 'purple',
        allowedTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
        maxSize: 20
      },
      {
        id: 'photos',
        name: 'Photos & Media',
        description: 'Site photos, videos, and multimedia content',
        icon: 'camera',
        color: 'yellow',
        allowedTypes: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov'],
        maxSize: 100
      },
      {
        id: 'certificates',
        name: 'Certificates & Compliance',
        description: 'Safety certificates, compliance documents, and permits',
        icon: 'certificate',
        color: 'indigo',
        allowedTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
        maxSize: 15
      }
    ];
  }

  private initializeMockDocuments() {
    this.documents = [
      {
        id: 'doc-1',
        name: 'Canary Wharf Tower - Floor Plans Level 15-20.pdf',
        type: 'application/pdf',
        size: 15728640, // 15MB
        url: '/documents/canary-wharf-floor-plans.pdf',
        projectId: 'project-1',
        uploadedBy: 'Sarah Johnson',
        uploadedAt: '2024-10-01T09:00:00Z',
        category: this.categories[0], // Drawings & Plans
        versions: [
          {
            id: 'ver-1',
            documentId: 'doc-1',
            version: '1.0',
            url: '/documents/canary-wharf-floor-plans-v1.pdf',
            size: 15728640,
            uploadedBy: 'Sarah Johnson',
            uploadedAt: '2024-10-01T09:00:00Z',
            changes: 'Initial version'
          }
        ],
        permissions: [
          {
            userId: 'user-1',
            permission: 'admin',
            grantedBy: 'system',
            grantedAt: '2024-10-01T09:00:00Z'
          }
        ],
        metadata: {
          tags: ['floor-plans', 'level-15-20', 'architectural'],
          customFields: {
            drawingNumber: 'CWT-FP-15-20',
            scale: '1:100',
            discipline: 'Architecture'
          },
          reviewDate: '2024-11-01',
          approvalStatus: 'approved',
          approvedBy: 'Mike Thompson',
          approvedAt: '2024-10-02T14:30:00Z'
        },
        downloadCount: 23,
        lastAccessed: '2024-10-15T16:45:00Z',
        isArchived: false
      },
      {
        id: 'doc-2',
        name: 'Safety Inspection Report - October 2024.pdf',
        type: 'application/pdf',
        size: 2048576, // 2MB
        url: '/documents/safety-inspection-oct-2024.pdf',
        projectId: 'project-1',
        uploadedBy: 'Emma Wilson',
        uploadedAt: '2024-10-10T11:30:00Z',
        category: this.categories[3], // Reports
        versions: [
          {
            id: 'ver-2',
            documentId: 'doc-2',
            version: '1.0',
            url: '/documents/safety-inspection-oct-2024.pdf',
            size: 2048576,
            uploadedBy: 'Emma Wilson',
            uploadedAt: '2024-10-10T11:30:00Z',
            changes: 'Initial safety inspection report'
          }
        ],
        permissions: [
          {
            userId: 'user-2',
            permission: 'admin',
            grantedBy: 'system',
            grantedAt: '2024-10-10T11:30:00Z'
          }
        ],
        metadata: {
          tags: ['safety', 'inspection', 'monthly-report'],
          customFields: {
            inspectionDate: '2024-10-09',
            inspector: 'Emma Wilson',
            status: 'Passed with minor recommendations'
          },
          approvalStatus: 'approved',
          approvedBy: 'Sarah Johnson',
          approvedAt: '2024-10-10T15:00:00Z'
        },
        downloadCount: 8,
        lastAccessed: '2024-10-14T09:20:00Z',
        isArchived: false
      }
    ];
  }

  // Get documents with filtering and pagination
  async getDocuments(filters: {
    projectId?: string;
    categoryId?: string;
    search?: string;
    tags?: string[];
    uploadedBy?: string;
    dateRange?: { start: string; end: string };
    approvalStatus?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ documents: ExtendedDocument[]; total: number; page: number; totalPages: number }> {
    let filteredDocs = [...this.documents];

    // Apply filters
    if (filters.projectId) {
      filteredDocs = filteredDocs.filter(doc => doc.projectId === filters.projectId);
    }

    if (filters.categoryId) {
      filteredDocs = filteredDocs.filter(doc => doc.category.id === filters.categoryId);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredDocs = filteredDocs.filter(doc =>
        doc.name.toLowerCase().includes(searchLower) ||
        doc.metadata.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      filteredDocs = filteredDocs.filter(doc =>
        filters.tags!.some(tag => doc.metadata.tags.includes(tag))
      );
    }

    if (filters.uploadedBy) {
      filteredDocs = filteredDocs.filter(doc => doc.uploadedBy === filters.uploadedBy);
    }

    if (filters.dateRange) {
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);
      filteredDocs = filteredDocs.filter(doc => {
        const uploadDate = new Date(doc.uploadedAt);
        return uploadDate >= start && uploadDate <= end;
      });
    }

    if (filters.approvalStatus) {
      filteredDocs = filteredDocs.filter(doc => doc.metadata.approvalStatus === filters.approvalStatus);
    }

    // Sort by upload date (newest first)
    filteredDocs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDocs = filteredDocs.slice(startIndex, endIndex);

    return {
      documents: paginatedDocs,
      total: filteredDocs.length,
      page,
      totalPages: Math.ceil(filteredDocs.length / limit)
    };
  }

  // Get document by ID
  async getDocument(id: string): Promise<ExtendedDocument | null> {
    const document = this.documents.find(doc => doc.id === id);
    if (document) {
      // Update last accessed
      document.lastAccessed = new Date().toISOString();
    }
    return document || null;
  }

  // Upload new document
  async uploadDocument(
    file: File,
    projectId: string,
    categoryId: string,
    metadata: Partial<DocumentMetadata>,
    uploadedBy: string
  ): Promise<ExtendedDocument> {
    const category = this.categories.find(cat => cat.id === categoryId);
    if (!category) {
      throw new Error('Invalid category');
    }

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !category.allowedTypes.includes(fileExtension)) {
      throw new Error(`File type .${fileExtension} not allowed for category ${category.name}`);
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > category.maxSize) {
      throw new Error(`File size ${fileSizeMB.toFixed(1)}MB exceeds limit of ${category.maxSize}MB`);
    }

    const documentId = `doc-${Date.now()}`;
    const versionId = `ver-${Date.now()}`;
    const now = new Date().toISOString();

    // In a real implementation, this would upload to cloud storage
    const mockUrl = `/documents/${documentId}/${file.name}`;

    const newDocument: ExtendedDocument = {
      id: documentId,
      name: file.name,
      type: file.type,
      size: file.size,
      url: mockUrl,
      projectId,
      uploadedBy,
      uploadedAt: now,
      category,
      versions: [
        {
          id: versionId,
          documentId,
          version: '1.0',
          url: mockUrl,
          size: file.size,
          uploadedBy,
          uploadedAt: now,
          changes: 'Initial upload'
        }
      ],
      permissions: [
        {
          userId: uploadedBy,
          permission: 'admin',
          grantedBy: 'system',
          grantedAt: now
        }
      ],
      metadata: {
        tags: metadata.tags || [],
        customFields: metadata.customFields || {},
        expiryDate: metadata.expiryDate,
        reviewDate: metadata.reviewDate,
        approvalStatus: metadata.approvalStatus || 'pending'
      },
      downloadCount: 0,
      isArchived: false
    };

    this.documents.push(newDocument);
    return newDocument;
  }

  // Update document metadata
  async updateDocument(id: string, updates: Partial<ExtendedDocument>): Promise<ExtendedDocument | null> {
    const index = this.documents.findIndex(doc => doc.id === id);
    if (index === -1) return null;

    this.documents[index] = {
      ...this.documents[index],
      ...updates
    };

    return this.documents[index];
  }

  // Add new version of document
  async addVersion(
    documentId: string,
    file: File,
    changes: string,
    uploadedBy: string
  ): Promise<DocumentVersion> {
    const document = this.documents.find(doc => doc.id === documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    const versionNumber = (document.versions.length + 1).toFixed(1);
    const versionId = `ver-${Date.now()}`;
    const now = new Date().toISOString();
    const mockUrl = `/documents/${documentId}/v${versionNumber}/${file.name}`;

    const newVersion: DocumentVersion = {
      id: versionId,
      documentId,
      version: versionNumber,
      url: mockUrl,
      size: file.size,
      uploadedBy,
      uploadedAt: now,
      changes
    };

    document.versions.push(newVersion);
    
    // Update main document properties
    document.url = mockUrl;
    document.size = file.size;
    document.uploadedAt = now;

    return newVersion;
  }

  // Delete document
  async deleteDocument(id: string): Promise<boolean> {
    const index = this.documents.findIndex(doc => doc.id === id);
    if (index === -1) return false;

    this.documents.splice(index, 1);
    return true;
  }

  // Archive/unarchive document
  async archiveDocument(id: string, archive: boolean = true): Promise<boolean> {
    const document = this.documents.find(doc => doc.id === id);
    if (!document) return false;

    document.isArchived = archive;
    return true;
  }

  // Get document categories
  async getCategories(): Promise<DocumentCategory[]> {
    return this.categories;
  }

  // Get document statistics
  async getDocumentStats(projectId?: string): Promise<{
    totalDocuments: number;
    totalSize: number;
    byCategory: { [categoryId: string]: number };
    byStatus: { [status: string]: number };
    recentUploads: number;
    pendingApprovals: number;
  }> {
    let docs = this.documents;
    if (projectId) {
      docs = docs.filter(doc => doc.projectId === projectId);
    }

    const totalSize = docs.reduce((sum, doc) => sum + doc.size, 0);
    
    const byCategory: { [categoryId: string]: number } = {};
    const byStatus: { [status: string]: number } = {};
    
    docs.forEach(doc => {
      byCategory[doc.category.id] = (byCategory[doc.category.id] || 0) + 1;
      byStatus[doc.metadata.approvalStatus] = (byStatus[doc.metadata.approvalStatus] || 0) + 1;
    });

    // Recent uploads (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentUploads = docs.filter(doc => new Date(doc.uploadedAt) >= weekAgo).length;

    const pendingApprovals = docs.filter(doc => doc.metadata.approvalStatus === 'pending').length;

    return {
      totalDocuments: docs.length,
      totalSize,
      byCategory,
      byStatus,
      recentUploads,
      pendingApprovals
    };
  }

  // Search documents with advanced filters
  async searchDocuments(query: string, filters: any = {}): Promise<ExtendedDocument[]> {
    const searchResults = await this.getDocuments({ search: query, ...filters });
    return searchResults.documents;
  }

  // Get document access history
  async getAccessHistory(documentId: string): Promise<{
    userId: string;
    userName: string;
    action: 'view' | 'download' | 'edit';
    timestamp: string;
    ipAddress?: string;
  }[]> {
    // Mock access history
    return [
      {
        userId: 'user-1',
        userName: 'Sarah Johnson',
        action: 'view',
        timestamp: '2024-10-15T16:45:00Z',
        ipAddress: '192.168.1.100'
      },
      {
        userId: 'user-2',
        userName: 'Mike Thompson',
        action: 'download',
        timestamp: '2024-10-14T09:20:00Z',
        ipAddress: '192.168.1.101'
      }
    ];
  }
}

export const documentService = new DocumentService();
export default documentService;
