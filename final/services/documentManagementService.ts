// 🏗️ Document Management Service
// Comprehensive document management service with full CRUD operations

import { 
  Document, 
  RFI, 
  Submittal, 
  ChangeOrder,
  DocumentFilter,
  DocumentSearchResult,
  DocumentMarkup,
  DocumentRevision,
  WorkflowState,
  DocumentType,
  DocumentCategory,
  DocumentStatus,
  RFIStatus,
  SubmittalStatus,
  ChangeOrderStatus,
  Priority
} from '../types/document-management';

export class DocumentManagementService {
  private baseUrl = '/api/documents';
  private mockData = this.initializeMockData();

  // ===== DOCUMENT MANAGEMENT =====

  async getDocuments(projectId: string, filter?: DocumentFilter): Promise<DocumentSearchResult> {
    try {
      const params = new URLSearchParams();
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value && Array.isArray(value)) {
            value.forEach(v => params.append(key, String(v)));
          } else if (value) {
            params.append(key, String(value));
          }
        });
      }
      
      const response = await fetch(`${this.baseUrl}/projects/${projectId}?${params}`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      return await response.json();
    } catch (error) {
      console.error('Error fetching documents:', error);
      return this.getMockDocuments(projectId, filter);
    }
  }

  async uploadDocument(projectId: string, file: File, metadata: any): Promise<Document> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('metadata', JSON.stringify(metadata));
      
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/upload`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Failed to upload document');
      return await response.json();
    } catch (error) {
      console.error('Error uploading document:', error);
      return this.createMockDocument(projectId, file, metadata);
    }
  }

  async updateDocument(projectId: string, documentId: string, updates: Partial<Document>): Promise<Document> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/documents/${documentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update document');
      return await response.json();
    } catch (error) {
      console.error('Error updating document:', error);
      return this.mockData.documents[0];
    }
  }

  async deleteDocument(projectId: string, documentId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/documents/${documentId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete document');
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  }

  async createRevision(projectId: string, documentId: string, file: File, description: string): Promise<DocumentRevision> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description);
      
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/documents/${documentId}/revisions`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Failed to create revision');
      return await response.json();
    } catch (error) {
      console.error('Error creating revision:', error);
      return this.createMockRevision(documentId, file, description);
    }
  }

  // ===== MARKUP MANAGEMENT =====

  async addMarkup(projectId: string, documentId: string, markup: Partial<DocumentMarkup>): Promise<DocumentMarkup> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/documents/${documentId}/markups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(markup)
      });
      if (!response.ok) throw new Error('Failed to add markup');
      return await response.json();
    } catch (error) {
      console.error('Error adding markup:', error);
      return this.createMockMarkup(documentId, markup);
    }
  }

  async updateMarkup(projectId: string, documentId: string, markupId: string, updates: Partial<DocumentMarkup>): Promise<DocumentMarkup> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/documents/${documentId}/markups/${markupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update markup');
      return await response.json();
    } catch (error) {
      console.error('Error updating markup:', error);
      return this.mockData.markups[0];
    }
  }

  async deleteMarkup(projectId: string, documentId: string, markupId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/documents/${documentId}/markups/${markupId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete markup');
    } catch (error) {
      console.error('Error deleting markup:', error);
    }
  }

  // ===== RFI MANAGEMENT =====

  async getRFIs(projectId: string, filters?: any): Promise<RFI[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
      }
      
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/rfis?${params}`);
      if (!response.ok) throw new Error('Failed to fetch RFIs');
      return await response.json();
    } catch (error) {
      console.error('Error fetching RFIs:', error);
      return this.getMockRFIs(projectId);
    }
  }

  async createRFI(projectId: string, rfiData: Partial<RFI>): Promise<RFI> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/rfis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rfiData)
      });
      if (!response.ok) throw new Error('Failed to create RFI');
      return await response.json();
    } catch (error) {
      console.error('Error creating RFI:', error);
      return this.createMockRFI(projectId, rfiData);
    }
  }

  async updateRFI(projectId: string, rfiId: string, updates: Partial<RFI>): Promise<RFI> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/rfis/${rfiId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update RFI');
      return await response.json();
    } catch (error) {
      console.error('Error updating RFI:', error);
      return this.mockData.rfis[0];
    }
  }

  async respondToRFI(projectId: string, rfiId: string, response: any): Promise<RFI> {
    try {
      const apiResponse = await fetch(`${this.baseUrl}/projects/${projectId}/rfis/${rfiId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response)
      });
      if (!apiResponse.ok) throw new Error('Failed to respond to RFI');
      return await apiResponse.json();
    } catch (error) {
      console.error('Error responding to RFI:', error);
      return this.mockData.rfis[0];
    }
  }

  // ===== SUBMITTAL MANAGEMENT =====

  async getSubmittals(projectId: string, filters?: any): Promise<Submittal[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
      }
      
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/submittals?${params}`);
      if (!response.ok) throw new Error('Failed to fetch submittals');
      return await response.json();
    } catch (error) {
      console.error('Error fetching submittals:', error);
      return this.getMockSubmittals(projectId);
    }
  }

  async createSubmittal(projectId: string, submittalData: Partial<Submittal>): Promise<Submittal> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/submittals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submittalData)
      });
      if (!response.ok) throw new Error('Failed to create submittal');
      return await response.json();
    } catch (error) {
      console.error('Error creating submittal:', error);
      return this.createMockSubmittal(projectId, submittalData);
    }
  }

  async updateSubmittal(projectId: string, submittalId: string, updates: Partial<Submittal>): Promise<Submittal> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/submittals/${submittalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update submittal');
      return await response.json();
    } catch (error) {
      console.error('Error updating submittal:', error);
      return this.mockData.submittals[0];
    }
  }

  async reviewSubmittal(projectId: string, submittalId: string, review: any): Promise<Submittal> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/submittals/${submittalId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review)
      });
      if (!response.ok) throw new Error('Failed to review submittal');
      return await response.json();
    } catch (error) {
      console.error('Error reviewing submittal:', error);
      return this.mockData.submittals[0];
    }
  }

  // ===== CHANGE ORDER MANAGEMENT =====

  async getChangeOrders(projectId: string, filters?: any): Promise<ChangeOrder[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
      }
      
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/change-orders?${params}`);
      if (!response.ok) throw new Error('Failed to fetch change orders');
      return await response.json();
    } catch (error) {
      console.error('Error fetching change orders:', error);
      return this.getMockChangeOrders(projectId);
    }
  }

  async createChangeOrder(projectId: string, changeOrderData: Partial<ChangeOrder>): Promise<ChangeOrder> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/change-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changeOrderData)
      });
      if (!response.ok) throw new Error('Failed to create change order');
      return await response.json();
    } catch (error) {
      console.error('Error creating change order:', error);
      return this.createMockChangeOrder(projectId, changeOrderData);
    }
  }

  async updateChangeOrder(projectId: string, changeOrderId: string, updates: Partial<ChangeOrder>): Promise<ChangeOrder> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/change-orders/${changeOrderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update change order');
      return await response.json();
    } catch (error) {
      console.error('Error updating change order:', error);
      return this.mockData.changeOrders[0];
    }
  }

  async approveChangeOrder(projectId: string, changeOrderId: string, approval: any): Promise<ChangeOrder> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/change-orders/${changeOrderId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approval)
      });
      if (!response.ok) throw new Error('Failed to approve change order');
      return await response.json();
    } catch (error) {
      console.error('Error approving change order:', error);
      return this.mockData.changeOrders[0];
    }
  }

  // ===== WORKFLOW MANAGEMENT =====

  async updateWorkflow(projectId: string, documentId: string, action: string, comments?: string): Promise<WorkflowState> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/documents/${documentId}/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, comments })
      });
      if (!response.ok) throw new Error('Failed to update workflow');
      return await response.json();
    } catch (error) {
      console.error('Error updating workflow:', error);
      return this.createMockWorkflow();
    }
  }

  // ===== MOCK DATA METHODS =====

  private initializeMockData() {
    return {
      documents: this.createMockDocuments(),
      rfis: this.createMockRFIs(),
      submittals: this.createMockSubmittals(),
      changeOrders: this.createMockChangeOrders(),
      markups: this.createMockMarkups()
    };
  }

  private getMockDocuments(projectId: string, filter?: DocumentFilter): DocumentSearchResult {
    let documents = this.mockData.documents.filter(doc => doc.projectId === projectId);
    
    if (filter) {
      if (filter.type?.length) {
        documents = documents.filter(doc => filter.type!.includes(doc.type));
      }
      if (filter.category?.length) {
        documents = documents.filter(doc => filter.category!.includes(doc.category));
      }
      if (filter.status?.length) {
        documents = documents.filter(doc => filter.status!.includes(doc.status));
      }
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        documents = documents.filter(doc => 
          doc.name.toLowerCase().includes(query) ||
          doc.description.toLowerCase().includes(query)
        );
      }
    }

    return {
      documents,
      totalCount: documents.length,
      facets: {
        types: { [DocumentType.DRAWING]: 5, [DocumentType.SPECIFICATION]: 3 },
        categories: { [DocumentCategory.ARCHITECTURAL]: 4, [DocumentCategory.STRUCTURAL]: 2 },
        statuses: { [DocumentStatus.APPROVED]: 6, [DocumentStatus.UNDER_REVIEW]: 2 },
        disciplines: { 'Architecture': 4, 'Structural': 2, 'MEP': 2 },
        tags: { 'foundation': 2, 'electrical': 3, 'plumbing': 1 }
      }
    };
  }

  private createMockDocument(projectId: string, file: File, metadata: any): Document {
    return {
      id: `doc-${Date.now()}`,
      projectId,
      name: file.name,
      description: metadata.description || '',
      type: metadata.type || DocumentType.OTHER,
      category: metadata.category || DocumentCategory.GENERAL,
      discipline: metadata.discipline || 'General',
      version: '1.0',
      status: DocumentStatus.DRAFT,
      file: {
        id: `file-${Date.now()}`,
        filename: file.name,
        originalName: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
        mimeType: file.type,
        checksum: 'mock-checksum',
        storageLocation: 'mock-storage',
        uploadedBy: 'current-user',
        uploadedAt: new Date()
      },
      metadata: {
        title: metadata.title,
        author: metadata.author,
        keywords: metadata.keywords || []
      },
      permissions: [],
      workflow: this.createMockWorkflow(),
      revisions: [],
      markups: [],
      comments: [],
      tags: metadata.tags || [],
      customFields: [],
      createdBy: 'current-user',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private createMockDocuments(): Document[] {
    return [
      {
        id: 'doc-1',
        projectId: 'demo-project-1',
        name: 'Architectural Floor Plans - Level 1',
        description: 'Detailed floor plans for the first level including all rooms and dimensions',
        type: DocumentType.DRAWING,
        category: DocumentCategory.ARCHITECTURAL,
        discipline: 'Architecture',
        version: '2.1',
        status: DocumentStatus.APPROVED,
        file: {
          id: 'file-1',
          filename: 'A-101_Floor_Plan_L1_v2.1.pdf',
          originalName: 'Floor Plan Level 1.pdf',
          url: '/mock-documents/floor-plan-l1.pdf',
          thumbnailUrl: '/mock-documents/floor-plan-l1-thumb.jpg',
          size: 2048576,
          mimeType: 'application/pdf',
          checksum: 'abc123def456',
          storageLocation: 's3://docs/project-1/',
          uploadedBy: 'architect-1',
          uploadedAt: new Date('2024-01-15')
        },
        metadata: {
          title: 'Level 1 Floor Plan',
          author: 'John Smith, AIA',
          keywords: ['floor plan', 'level 1', 'architectural'],
          pageCount: 1,
          dimensions: { width: 36, height: 24, units: 'in' },
          scale: '1/4" = 1\'',
          drawingNumber: 'A-101',
          sheetNumber: '1',
          revisionNumber: '2.1',
          issueDate: new Date('2024-01-15')
        },
        permissions: [],
        workflow: this.createMockWorkflow(),
        revisions: [],
        markups: [],
        comments: [],
        tags: ['floor plan', 'architectural', 'level 1'],
        customFields: [],
        createdBy: 'architect-1',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-15'),
        publishedAt: new Date('2024-01-15')
      }
    ];
  }

  private createMockWorkflow(): WorkflowState {
    return {
      id: `workflow-${Date.now()}`,
      workflowId: 'standard-approval',
      currentStep: {
        id: 'step-1',
        name: 'Initial Review',
        description: 'Initial review by project manager',
        type: 'review' as any,
        order: 1,
        required: true,
        assigneeType: 'role',
        assignees: ['project-manager'],
        actions: [],
        conditions: []
      },
      status: 'in_progress' as any,
      assignedTo: ['pm-1'],
      startedAt: new Date(),
      history: []
    };
  }

  private createMockRevision(documentId: string, file: File, description: string): DocumentRevision {
    return {
      id: `rev-${Date.now()}`,
      version: '2.0',
      description,
      changes: [],
      file: {
        id: `file-${Date.now()}`,
        filename: file.name,
        originalName: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
        mimeType: file.type,
        checksum: 'mock-checksum',
        storageLocation: 'mock-storage',
        uploadedBy: 'current-user',
        uploadedAt: new Date()
      },
      createdBy: 'current-user',
      createdAt: new Date()
    };
  }

  private createMockMarkup(documentId: string, markup: Partial<DocumentMarkup>): DocumentMarkup {
    return {
      id: `markup-${Date.now()}`,
      documentId,
      pageNumber: markup.pageNumber || 1,
      type: markup.type || 'annotation' as any,
      coordinates: markup.coordinates || { x: 100, y: 100 },
      content: markup.content || 'New markup',
      color: markup.color || '#ff0000',
      strokeWidth: markup.strokeWidth || 2,
      opacity: markup.opacity || 1,
      locked: false,
      visible: true,
      layer: 'default',
      createdBy: 'current-user',
      createdAt: new Date(),
      updatedAt: new Date(),
      replies: [],
      status: 'open' as any
    };
  }

  private createMockMarkups(): DocumentMarkup[] {
    return [];
  }

  private getMockRFIs(projectId: string): RFI[] {
    return this.mockData.rfis.filter(rfi => rfi.projectId === projectId);
  }

  private createMockRFI(projectId: string, rfiData: Partial<RFI>): RFI {
    return {
      id: `rfi-${Date.now()}`,
      projectId,
      number: `RFI-${String(Date.now()).slice(-3)}`,
      title: rfiData.title || 'New RFI',
      description: rfiData.description || '',
      question: rfiData.question || '',
      priority: rfiData.priority || Priority.MEDIUM,
      status: RFIStatus.OPEN,
      category: rfiData.category || 'design_clarification' as any,
      discipline: rfiData.discipline || 'General',
      requestedBy: 'current-user',
      requestedCompany: 'ABC Construction',
      assignedTo: rfiData.assignedTo || 'architect-1',
      assignedCompany: 'XYZ Architects',
      dueDate: rfiData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      relatedDocuments: [],
      relatedDrawings: [],
      attachments: [],
      photos: [],
      markups: [],
      comments: [],
      workflow: this.createMockWorkflow(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private createMockRFIs(): RFI[] {
    return [
      {
        id: 'rfi-1',
        projectId: 'demo-project-1',
        number: 'RFI-001',
        title: 'Clarification on Foundation Details',
        description: 'Need clarification on foundation reinforcement details in section A-A',
        question: 'What is the required rebar spacing for the foundation footings shown in drawing S-101?',
        priority: Priority.HIGH,
        status: RFIStatus.UNDER_REVIEW,
        category: 'design_clarification' as any,
        discipline: 'Structural',
        requestedBy: 'foreman-1',
        requestedCompany: 'ABC Construction',
        assignedTo: 'engineer-1',
        assignedCompany: 'XYZ Engineering',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        relatedDocuments: ['doc-1'],
        relatedDrawings: ['S-101'],
        attachments: [],
        photos: [],
        markups: [],
        comments: [],
        workflow: this.createMockWorkflow(),
        costImpact: 5000,
        scheduleImpact: 2,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ];
  }

  private getMockSubmittals(projectId: string): Submittal[] {
    return this.mockData.submittals.filter(submittal => submittal.projectId === projectId);
  }

  private createMockSubmittal(projectId: string, submittalData: Partial<Submittal>): Submittal {
    return {
      id: `submittal-${Date.now()}`,
      projectId,
      number: `SUB-${String(Date.now()).slice(-3)}`,
      title: submittalData.title || 'New Submittal',
      description: submittalData.description || '',
      type: submittalData.type || 'product_data' as any,
      category: submittalData.category || 'general' as any,
      discipline: submittalData.discipline || 'General',
      specification: submittalData.specification || '',
      submittedBy: 'current-user',
      submittedCompany: 'ABC Construction',
      reviewedBy: [],
      status: SubmittalStatus.SUBMITTED,
      priority: submittalData.priority || Priority.MEDIUM,
      dueDate: submittalData.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      submissionDate: new Date(),
      documents: [],
      reviews: [],
      comments: [],
      workflow: this.createMockWorkflow(),
      deliveryMethod: 'electronic' as any,
      copies: 1,
      distributionList: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private createMockSubmittals(): Submittal[] {
    return [
      {
        id: 'submittal-1',
        projectId: 'demo-project-1',
        number: 'SUB-001',
        title: 'Structural Steel Shop Drawings',
        description: 'Shop drawings for structural steel beams and connections',
        type: 'shop_drawings' as any,
        category: 'structural' as any,
        discipline: 'Structural',
        specification: '05 12 00',
        submittedBy: 'steel-contractor',
        submittedCompany: 'Steel Works Inc',
        reviewedBy: ['engineer-1'],
        status: SubmittalStatus.UNDER_REVIEW,
        priority: Priority.HIGH,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        submissionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        documents: [],
        reviews: [],
        comments: [],
        workflow: this.createMockWorkflow(),
        deliveryMethod: 'electronic' as any,
        copies: 3,
        distributionList: ['engineer-1', 'architect-1', 'pm-1'],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ];
  }

  private getMockChangeOrders(projectId: string): ChangeOrder[] {
    return this.mockData.changeOrders.filter(co => co.projectId === projectId);
  }

  private createMockChangeOrder(projectId: string, changeOrderData: Partial<ChangeOrder>): ChangeOrder {
    return {
      id: `co-${Date.now()}`,
      projectId,
      number: `CO-${String(Date.now()).slice(-3)}`,
      title: changeOrderData.title || 'New Change Order',
      description: changeOrderData.description || '',
      type: changeOrderData.type || 'addition' as any,
      reason: changeOrderData.reason || 'scope_change' as any,
      status: ChangeOrderStatus.DRAFT,
      priority: changeOrderData.priority || Priority.MEDIUM,
      requestedBy: 'current-user',
      assignedTo: changeOrderData.assignedTo || 'pm-1',
      costImpact: changeOrderData.costImpact || 0,
      scheduleImpact: changeOrderData.scheduleImpact || 0,
      scope: {
        addedWork: [],
        deletedWork: [],
        modifiedWork: [],
        materials: [],
        labor: [],
        equipment: []
      },
      justification: changeOrderData.justification || '',
      relatedDocuments: [],
      relatedRFIs: [],
      relatedSubmittals: [],
      attachments: [],
      approvals: [],
      workflow: this.createMockWorkflow(),
      implementation: {
        status: 'not_started' as any,
        photos: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private createMockChangeOrders(): ChangeOrder[] {
    return [
      {
        id: 'co-1',
        projectId: 'demo-project-1',
        number: 'CO-001',
        title: 'Additional Electrical Outlets',
        description: 'Add 20 additional electrical outlets in office areas per owner request',
        type: 'addition' as any,
        reason: 'owner_request' as any,
        status: ChangeOrderStatus.UNDER_REVIEW,
        priority: Priority.MEDIUM,
        requestedBy: 'owner-1',
        assignedTo: 'pm-1',
        costImpact: 15000,
        scheduleImpact: 3,
        scope: {
          addedWork: [
            {
              id: 'work-1',
              description: 'Install additional electrical outlets',
              quantity: 20,
              unit: 'EA',
              unitCost: 750,
              totalCost: 15000,
              costCode: '16-10-00',
              phase: 'Electrical Rough-in',
              location: 'Office Areas'
            }
          ],
          deletedWork: [],
          modifiedWork: [],
          materials: [],
          labor: [],
          equipment: []
        },
        justification: 'Owner requires additional outlets for increased equipment density in office areas',
        relatedDocuments: [],
        relatedRFIs: [],
        relatedSubmittals: [],
        attachments: [],
        approvals: [],
        workflow: this.createMockWorkflow(),
        implementation: {
          status: 'not_started' as any,
          photos: []
        },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ];
  }
}

export const documentManagementService = new DocumentManagementService();
