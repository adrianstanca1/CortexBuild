import { Router, Request, Response } from 'express';
import { authenticate as authMiddleware } from '../middleware/auth';

const router = Router();

// Mock workflow data
const mockWorkflows = [
  {
    id: 'wf-001',
    templateName: 'Project Approval Workflow',
    entityType: 'project',
    entityId: 'proj-123',
    status: 'active',
    createdAt: '2025-09-28T10:00:00Z',
    currentStep: 1,
    priority: 'high',
    requestedBy: 'John Smith'
  },
  {
    id: 'wf-002',
    templateName: 'Equipment Purchase Request',
    entityType: 'purchase',
    entityId: 'req-456',
    status: 'completed',
    createdAt: '2025-09-27T14:20:00Z',
    completedAt: '2025-09-28T09:15:00Z',
    currentStep: 3,
    priority: 'medium',
    requestedBy: 'Alice Brown'
  }
];

// Get all workflows (requires authentication)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { status, priority, entityType } = req.query;
    let filteredWorkflows = [...mockWorkflows];

    if (status) {
      filteredWorkflows = filteredWorkflows.filter(w => w.status === status);
    }
    
    if (priority) {
      filteredWorkflows = filteredWorkflows.filter(w => w.priority === priority);
    }

    if (entityType) {
      filteredWorkflows = filteredWorkflows.filter(w => w.entityType === entityType);
    }

    res.json({
      success: true,
      data: filteredWorkflows,
      meta: {
        total: filteredWorkflows.length,
        filters: { status, priority, entityType }
      }
    });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch workflows'
    });
  }
});

// Get workflow by ID (requires authentication)
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const workflow = mockWorkflows.find(w => w.id === req.params.id);
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch workflow'
    });
  }
});

// Create workflow (requires authentication)
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const newWorkflow = {
      id: `wf-${Date.now()}`,
      ...req.body,
      status: 'draft',
      createdAt: new Date().toISOString(),
      currentStep: 0
    };

    mockWorkflows.push(newWorkflow);

    res.status(201).json({
      success: true,
      data: newWorkflow
    });
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create workflow'
    });
  }
});

// Update workflow status (requires authentication)
router.patch('/:id/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const workflowIndex = mockWorkflows.findIndex(w => w.id === req.params.id);
    
    if (workflowIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    const { status, currentStep } = req.body;
    
    mockWorkflows[workflowIndex] = {
      ...mockWorkflows[workflowIndex],
      status,
      currentStep: currentStep !== undefined ? currentStep : mockWorkflows[workflowIndex].currentStep,
      completedAt: status === 'completed' ? new Date().toISOString() : undefined
    };

    res.json({
      success: true,
      data: mockWorkflows[workflowIndex]
    });
  } catch (error) {
    console.error('Error updating workflow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update workflow'
    });
  }
});

export default router;