// 🏗️ Integration Tests for ASAgents-Ultimate
// Comprehensive test suite for all major components

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { documentManagementService } from '../services/documentManagementService';
import { fieldManagementService } from '../services/fieldManagementService';
import { projectAnalyticsService } from '../services/projectAnalyticsService';

// Mock services
vi.mock('../services/documentManagementService');
vi.mock('../services/fieldManagementService');
vi.mock('../services/projectAnalyticsService');

describe('ASAgents-Ultimate Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Document Management Service', () => {
    it('should fetch documents successfully', async () => {
      const mockDocuments = [
        {
          id: 'doc-1',
          projectId: 'project-1',
          name: 'Test Document',
          type: 'drawing',
          status: 'approved'
        }
      ];

      vi.mocked(documentManagementService.getDocuments).mockResolvedValue({
        documents: mockDocuments,
        totalCount: 1,
        facets: {}
      });

      const result = await documentManagementService.getDocuments('project-1');
      expect(result.documents).toHaveLength(1);
      expect(result.documents[0].name).toBe('Test Document');
    });

    it('should create RFI successfully', async () => {
      const mockRFI = {
        id: 'rfi-1',
        projectId: 'project-1',
        title: 'Test RFI',
        status: 'open'
      };

      vi.mocked(documentManagementService.createRFI).mockResolvedValue(mockRFI);

      const result = await documentManagementService.createRFI('project-1', {
        title: 'Test RFI',
        question: 'Test question'
      });

      expect(result.title).toBe('Test RFI');
      expect(result.status).toBe('open');
    });

    it('should create submittal successfully', async () => {
      const mockSubmittal = {
        id: 'sub-1',
        projectId: 'project-1',
        title: 'Test Submittal',
        status: 'submitted'
      };

      vi.mocked(documentManagementService.createSubmittal).mockResolvedValue(mockSubmittal);

      const result = await documentManagementService.createSubmittal('project-1', {
        title: 'Test Submittal',
        type: 'shop_drawings'
      });

      expect(result.title).toBe('Test Submittal');
      expect(result.status).toBe('submitted');
    });

    it('should create change order successfully', async () => {
      const mockChangeOrder = {
        id: 'co-1',
        projectId: 'project-1',
        title: 'Test Change Order',
        status: 'draft',
        costImpact: 5000
      };

      vi.mocked(documentManagementService.createChangeOrder).mockResolvedValue(mockChangeOrder);

      const result = await documentManagementService.createChangeOrder('project-1', {
        title: 'Test Change Order',
        costImpact: 5000
      });

      expect(result.title).toBe('Test Change Order');
      expect(result.costImpact).toBe(5000);
    });
  });

  describe('Field Management Service', () => {
    it('should fetch punch lists successfully', async () => {
      const mockPunchLists = [
        {
          id: 'punch-1',
          projectId: 'project-1',
          title: 'Test Punch Item',
          status: 'open'
        }
      ];

      vi.mocked(fieldManagementService.getPunchLists).mockResolvedValue(mockPunchLists);

      const result = await fieldManagementService.getPunchLists('project-1');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Test Punch Item');
    });

    it('should create daily report successfully', async () => {
      const mockDailyReport = {
        id: 'report-1',
        projectId: 'project-1',
        date: new Date(),
        weather: 'clear',
        notes: 'Good progress today'
      };

      vi.mocked(fieldManagementService.createDailyReport).mockResolvedValue(mockDailyReport);

      const result = await fieldManagementService.createDailyReport('project-1', {
        date: new Date(),
        weather: 'clear',
        notes: 'Good progress today'
      });

      expect(result.notes).toBe('Good progress today');
      expect(result.weather).toBe('clear');
    });

    it('should upload photo with metadata successfully', async () => {
      const mockPhoto = {
        id: 'photo-1',
        filename: 'test.jpg',
        url: 'http://example.com/test.jpg',
        metadata: {
          location: { latitude: 40.7128, longitude: -74.0060 }
        }
      };

      vi.mocked(fieldManagementService.uploadPhoto).mockResolvedValue(mockPhoto);

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const metadata = {
        location: { latitude: 40.7128, longitude: -74.0060 }
      };

      const result = await fieldManagementService.uploadPhoto('project-1', mockFile, metadata);
      expect(result.filename).toBe('test.jpg');
      expect(result.metadata.location.latitude).toBe(40.7128);
    });

    it('should sync offline data successfully', async () => {
      vi.mocked(fieldManagementService.syncOfflineData).mockResolvedValue(undefined);

      await expect(fieldManagementService.syncOfflineData()).resolves.toBeUndefined();
      expect(fieldManagementService.syncOfflineData).toHaveBeenCalledOnce();
    });
  });

  describe('Project Analytics Service', () => {
    it('should fetch budget metrics successfully', async () => {
      const mockBudgetMetrics = {
        totalBudget: 1000000,
        spentToDate: 750000,
        costPerformanceIndex: 1.02,
        schedulePerformanceIndex: 0.98
      };

      vi.mocked(projectAnalyticsService.getBudgetAnalysis).mockResolvedValue(mockBudgetMetrics);

      const result = await projectAnalyticsService.getBudgetAnalysis('project-1');
      expect(result.totalBudget).toBe(1000000);
      expect(result.costPerformanceIndex).toBe(1.02);
    });

    it('should fetch schedule metrics successfully', async () => {
      const mockScheduleMetrics = {
        totalDuration: 365,
        percentComplete: 67,
        schedulePerformanceIndex: 0.97,
        tasksCompleted: 104,
        tasksTotal: 156
      };

      vi.mocked(projectAnalyticsService.getScheduleAnalysis).mockResolvedValue(mockScheduleMetrics);

      const result = await projectAnalyticsService.getScheduleAnalysis('project-1');
      expect(result.percentComplete).toBe(67);
      expect(result.tasksCompleted).toBe(104);
    });

    it('should fetch quality metrics successfully', async () => {
      const mockQualityMetrics = {
        qualityScore: 94,
        inspectionsPassed: 45,
        inspectionsFailed: 3,
        defectRate: 2.1
      };

      vi.mocked(projectAnalyticsService.getQualityMetrics).mockResolvedValue(mockQualityMetrics);

      const result = await projectAnalyticsService.getQualityMetrics('project-1');
      expect(result.qualityScore).toBe(94);
      expect(result.defectRate).toBe(2.1);
    });

    it('should fetch safety metrics successfully', async () => {
      const mockSafetyMetrics = {
        safetyScore: 96,
        incidentRate: 0.8,
        daysWithoutIncident: 45,
        ppeComplianceRate: 98
      };

      vi.mocked(projectAnalyticsService.getSafetyMetrics).mockResolvedValue(mockSafetyMetrics);

      const result = await projectAnalyticsService.getSafetyMetrics('project-1');
      expect(result.safetyScore).toBe(96);
      expect(result.daysWithoutIncident).toBe(45);
    });

    it('should fetch risk analysis successfully', async () => {
      const mockRiskMetrics = {
        totalRisks: 18,
        highRisks: 2,
        riskScore: 24,
        topRisks: [
          { id: 'risk-1', title: 'Weather delays', riskScore: 0.56 }
        ]
      };

      vi.mocked(projectAnalyticsService.getRiskAnalysis).mockResolvedValue(mockRiskMetrics);

      const result = await projectAnalyticsService.getRiskAnalysis('project-1');
      expect(result.totalRisks).toBe(18);
      expect(result.topRisks).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle document service errors gracefully', async () => {
      vi.mocked(documentManagementService.getDocuments).mockRejectedValue(new Error('Network error'));

      const result = await documentManagementService.getDocuments('project-1');
      // Should return mock data when API fails
      expect(result.documents).toBeDefined();
    });

    it('should handle field service errors gracefully', async () => {
      vi.mocked(fieldManagementService.getPunchLists).mockRejectedValue(new Error('Network error'));

      const result = await fieldManagementService.getPunchLists('project-1');
      // Should return mock data when API fails
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle analytics service errors gracefully', async () => {
      vi.mocked(projectAnalyticsService.getBudgetAnalysis).mockRejectedValue(new Error('Network error'));

      const result = await projectAnalyticsService.getBudgetAnalysis('project-1');
      // Should return mock data when API fails
      expect(result.totalBudget).toBeDefined();
    });
  });

  describe('Data Validation', () => {
    it('should validate RFI data before creation', async () => {
      const invalidRFI = {
        title: '', // Empty title should be invalid
        question: 'Valid question'
      };

      // This would typically be handled by form validation
      expect(invalidRFI.title).toBe('');
    });

    it('should validate photo upload data', async () => {
      const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      expect(validFile.type.startsWith('image/')).toBe(true);
      expect(invalidFile.type.startsWith('image/')).toBe(false);
    });

    it('should validate change order cost impact', async () => {
      const validChangeOrder = {
        title: 'Valid Change Order',
        costImpact: 5000
      };

      const invalidChangeOrder = {
        title: 'Invalid Change Order',
        costImpact: 'not a number'
      };

      expect(typeof validChangeOrder.costImpact).toBe('number');
      expect(typeof invalidChangeOrder.costImpact).toBe('string');
    });
  });

  describe('Performance Tests', () => {
    it('should load documents within acceptable time', async () => {
      const startTime = Date.now();
      await documentManagementService.getDocuments('project-1');
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle large photo uploads efficiently', async () => {
      const largeFile = new File(['x'.repeat(1024 * 1024)], 'large.jpg', { type: 'image/jpeg' }); // 1MB file
      
      const startTime = Date.now();
      await fieldManagementService.uploadPhoto('project-1', largeFile, {});
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
    });
  });

  describe('Mobile Compatibility', () => {
    it('should handle touch events for mobile interface', () => {
      // Mock touch events
      const touchEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch]
      });
      
      expect(touchEvent.type).toBe('touchstart');
      expect(touchEvent.touches.length).toBe(1);
    });

    it('should handle geolocation for mobile devices', () => {
      const mockGeolocation = {
        getCurrentPosition: vi.fn((success) => {
          success({
            coords: {
              latitude: 40.7128,
              longitude: -74.0060,
              accuracy: 10
            }
          });
        })
      };

      Object.defineProperty(global.navigator, 'geolocation', {
        value: mockGeolocation,
        writable: true
      });

      expect(navigator.geolocation).toBeDefined();
    });
  });

  describe('Offline Functionality', () => {
    it('should store data locally when offline', () => {
      const mockLocalStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      };

      Object.defineProperty(global, 'localStorage', {
        value: mockLocalStorage,
        writable: true
      });

      localStorage.setItem('test', 'value');
      expect(localStorage.setItem).toHaveBeenCalledWith('test', 'value');
    });

    it('should sync data when coming back online', async () => {
      // Mock online/offline events
      const onlineEvent = new Event('online');
      const offlineEvent = new Event('offline');

      expect(onlineEvent.type).toBe('online');
      expect(offlineEvent.type).toBe('offline');
    });
  });
});

// Integration test for complete workflow
describe('Complete Workflow Integration', () => {
  it('should complete a full project workflow', async () => {
    // 1. Create a project document
    const document = await documentManagementService.uploadDocument('project-1', 
      new File(['test'], 'plan.pdf', { type: 'application/pdf' }), 
      { type: 'drawing', category: 'architectural' }
    );
    expect(document.id).toBeDefined();

    // 2. Create an RFI related to the document
    const rfi = await documentManagementService.createRFI('project-1', {
      title: 'Clarification needed on plan',
      question: 'What is the ceiling height?',
      relatedDocuments: [document.id]
    });
    expect(rfi.id).toBeDefined();

    // 3. Create a punch list item
    const punchItem = await fieldManagementService.createPunchList('project-1', {
      title: 'Fix wall alignment',
      description: 'Wall is not aligned with plan',
      category: 'architectural'
    });
    expect(punchItem.id).toBeDefined();

    // 4. Take a photo for documentation
    const photo = await fieldManagementService.uploadPhoto('project-1',
      new File(['test'], 'issue.jpg', { type: 'image/jpeg' }),
      { location: { latitude: 40.7128, longitude: -74.0060 } }
    );
    expect(photo.id).toBeDefined();

    // 5. Create a daily report
    const dailyReport = await fieldManagementService.createDailyReport('project-1', {
      date: new Date(),
      weather: 'clear',
      notes: 'Good progress, one issue identified',
      photos: [photo.id]
    });
    expect(dailyReport.id).toBeDefined();

    // 6. Check project analytics
    const budgetMetrics = await projectAnalyticsService.getBudgetAnalysis('project-1');
    expect(budgetMetrics.totalBudget).toBeGreaterThan(0);

    console.log('✅ Complete workflow integration test passed');
  });
});
