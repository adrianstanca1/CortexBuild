import { Router, Request, Response } from 'express';
import { authenticate as authMiddleware } from '../middleware/auth';

const router = Router();

// Mock report data
const mockReports = [
  {
    id: 'rpt-001',
    name: 'Weekly Progress Report - Week 39',
    type: 'progress',
    format: 'pdf',
    projectId: 'proj-123',
    generatedBy: 'System',
    generatedAt: '2025-09-28T07:00:00Z',
    period: {
      start: '2025-09-22T00:00:00Z',
      end: '2025-09-28T23:59:59Z'
    },
    status: 'completed',
    size: 1892345,
    url: '/api/reports/rpt-001/download',
    tags: ['weekly', 'progress', 'automated']
  },
  {
    id: 'rpt-002',
    name: 'Safety Incident Summary - September 2025',
    type: 'safety',
    format: 'pdf',
    projectId: null,
    generatedBy: 'Sarah Wilson',
    generatedAt: '2025-09-27T15:30:00Z',
    period: {
      start: '2025-09-01T00:00:00Z',
      end: '2025-09-30T23:59:59Z'
    },
    status: 'completed',
    size: 756432,
    url: '/api/reports/rpt-002/download',
    tags: ['safety', 'monthly', 'incidents']
  },
  {
    id: 'rpt-003',
    name: 'Budget Analysis Q3 2025',
    type: 'financial',
    format: 'xlsx',
    projectId: 'proj-456',
    generatedBy: 'Mike Johnson',
    generatedAt: '2025-09-25T13:45:00Z',
    period: {
      start: '2025-07-01T00:00:00Z',
      end: '2025-09-30T23:59:59Z'
    },
    status: 'draft',
    size: 2134567,
    url: '/api/reports/rpt-003/download',
    tags: ['financial', 'quarterly', 'budget']
  }
];

// Get all reports (requires authentication)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { type, format, status, projectId, period } = req.query;
    let filteredReports = [...mockReports];

    if (type) {
      filteredReports = filteredReports.filter(r => r.type === type);
    }
    
    if (format) {
      filteredReports = filteredReports.filter(r => r.format === format);
    }

    if (status) {
      filteredReports = filteredReports.filter(r => r.status === status);
    }

    if (projectId) {
      filteredReports = filteredReports.filter(r => r.projectId === projectId);
    }

    if (period) {
      const periodDays = parseInt(period as string);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - periodDays);
      
      filteredReports = filteredReports.filter(r => 
        new Date(r.generatedAt) >= cutoffDate
      );
    }

    res.json({
      success: true,
      data: filteredReports,
      meta: {
        total: filteredReports.length,
        filters: { type, format, status, projectId, period }
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports'
    });
  }
});

// Get report by ID (requires authentication)
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const report = mockReports.find(r => r.id === req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch report'
    });
  }
});

// Generate new report (requires authentication)
router.post('/generate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, type, format, projectId, period } = req.body;
    
    const newReport = {
      id: `rpt-${Date.now()}`,
      name,
      type,
      format: format || 'pdf',
      projectId: projectId || null,
      generatedBy: 'System', // In real app, would use authenticated user
      generatedAt: new Date().toISOString(),
      period: period || {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      },
      status: 'generating',
      size: 0,
      url: `/api/reports/rpt-${Date.now()}/download`,
      tags: [type, 'generated']
    };

    mockReports.push(newReport);

    // Simulate async report generation
    setTimeout(() => {
      const reportIndex = mockReports.findIndex(r => r.id === newReport.id);
      if (reportIndex !== -1) {
        mockReports[reportIndex].status = 'completed';
        mockReports[reportIndex].size = Math.floor(Math.random() * 2000000) + 100000;
      }
    }, 2000);

    res.status(201).json({
      success: true,
      data: newReport,
      message: 'Report generation initiated'
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate report'
    });
  }
});

// Download report (requires authentication)
router.get('/:id/download', authMiddleware, async (req: Request, res: Response) => {
  try {
    const report = mockReports.find(r => r.id === req.params.id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    if (report.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Report is not ready for download',
        data: { status: report.status }
      });
    }

    // In a real implementation, this would stream the actual file
    res.json({
      success: true,
      message: 'Report download initiated',
      data: {
        id: report.id,
        name: report.name,
        downloadUrl: `/downloads/reports/${report.name.replace(/\s+/g, '_')}.${report.format}`
      }
    });
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download report'
    });
  }
});

// Update report status (requires authentication)
router.patch('/:id/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const reportIndex = mockReports.findIndex(r => r.id === req.params.id);
    
    if (reportIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    const { status } = req.body;
    
    mockReports[reportIndex] = {
      ...mockReports[reportIndex],
      status
    };

    res.json({
      success: true,
      data: mockReports[reportIndex]
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update report'
    });
  }
});

// Delete report (requires authentication)
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const reportIndex = mockReports.findIndex(r => r.id === req.params.id);
    
    if (reportIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    const deletedReport = mockReports.splice(reportIndex, 1)[0];

    res.json({
      success: true,
      message: 'Report deleted successfully',
      data: deletedReport
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete report'
    });
  }
});

// Get report analytics/statistics (requires authentication)
router.get('/analytics/summary', authMiddleware, async (req: Request, res: Response) => {
  try {
    const sortedReports = [...mockReports].sort((a, b) => 
      new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );
    
    const analytics = {
      totalReports: mockReports.length,
      reportsByType: {
        progress: mockReports.filter(r => r.type === 'progress').length,
        safety: mockReports.filter(r => r.type === 'safety').length,
        financial: mockReports.filter(r => r.type === 'financial').length
      },
      reportsByStatus: {
        completed: mockReports.filter(r => r.status === 'completed').length,
        draft: mockReports.filter(r => r.status === 'draft').length,
        generating: mockReports.filter(r => r.status === 'generating').length
      },
      recentActivity: sortedReports.slice(0, 5),
      totalSize: mockReports.reduce((sum, report) => sum + report.size, 0)
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching report analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch report analytics'
    });
  }
});

export default router;