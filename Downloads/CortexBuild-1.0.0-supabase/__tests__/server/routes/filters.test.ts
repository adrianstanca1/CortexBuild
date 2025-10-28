import request from 'supertest';
import express from 'express';
import { createFiltersRouter } from '../../../server/routes/filters';
import Database from 'better-sqlite3';

// Mock database
const mockDb = {
  prepare: jest.fn(),
  close: jest.fn(),
};

// Mock database methods
const mockStatement = {
  get: jest.fn(),
  all: jest.fn(),
  run: jest.fn(),
};

const mockTransaction = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();

  // Reset mock implementations
  mockDb.prepare.mockReturnValue(mockStatement);
  mockStatement.get.mockReturnValue(null);
  mockStatement.all.mockReturnValue([]);
  mockStatement.run.mockReturnValue({ lastInsertRowid: 1, changes: 1 });

  // Mock transaction
  mockDb.transaction = mockTransaction;
  mockTransaction.mockImplementation((callback) => callback(mockDb));
});

describe('/api/filters', () => {
  let app: express.Application;
  let agent: request.SuperTest<request.Test>;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/filters', createFiltersRouter(mockDb as any));
    agent = request(app);
  });

  describe('GET /api/filters/presets', () => {
    it('should return filter presets successfully', async () => {
      const mockPresets = [
        {
          id: '1',
          name: 'High Priority',
          description: 'Shows high priority items',
          criteria: JSON.stringify({ priority: ['High'] }),
          entity_type: 'tasks',
          is_shared: false,
          is_default: false,
          created_by: 'user1',
          company_id: 'company1',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          created_by_name: 'Test User'
        }
      ];

      mockStatement.all.mockReturnValue(mockPresets);

      const response = await agent
        .get('/api/filters/presets?entityType=tasks&userId=user1&companyId=company1')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: mockPresets,
        pagination: expect.any(Object)
      });

      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('SELECT fp.*, u.name as created_by_name FROM filter_presets fp')
      );
    });

    it('should handle pagination correctly', async () => {
      mockStatement.all.mockReturnValue([]);
      const mockCountStatement = { get: jest.fn().mockReturnValue({ total: 50 }) };
      mockDb.prepare
        .mockReturnValueOnce(mockCountStatement)
        .mockReturnValueOnce(mockStatement);

      const response = await agent
        .get('/api/filters/presets?page=2&limit=10')
        .expect(200);

      expect(response.body.pagination).toMatchObject({
        page: 2,
        limit: 10,
        total: 50,
        totalPages: 5
      });
    });

    it('should filter by entity type', async () => {
      mockStatement.all.mockReturnValue([]);

      await agent
        .get('/api/filters/presets?entityType=projects')
        .expect(200);

      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('AND fp.entity_type = ?')
      );
    });

    it('should filter by shared presets only', async () => {
      mockStatement.all.mockReturnValue([]);

      await agent
        .get('/api/filters/presets?shared=true')
        .expect(200);

      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('AND fp.is_shared = true')
      );
    });

    it('should handle database errors', async () => {
      mockDb.prepare.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const response = await agent
        .get('/api/filters/presets')
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Database connection failed'
      });
    });
  });

  describe('POST /api/filters/presets', () => {
    it('should create a new filter preset successfully', async () => {
      const newPreset = {
        id: '1',
        name: 'My Custom Filter',
        description: 'Custom filter description',
        criteria: JSON.stringify({ status: ['To Do'] }),
        entity_type: 'tasks',
        is_shared: false,
        created_by: 'user1',
        company_id: 'company1',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      };

      mockStatement.get.mockReturnValue(newPreset);

      const response = await agent
        .post('/api/filters/presets')
        .send({
          name: 'My Custom Filter',
          description: 'Custom filter description',
          criteria: { status: ['To Do'] },
          entityType: 'tasks',
          isShared: false,
          createdBy: 'user1',
          companyId: 'company1'
        })
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: newPreset,
        message: 'Filter preset created successfully'
      });

      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO filter_presets')
      );
    });

    it('should return 400 for missing required fields', async () => {
      const response = await agent
        .post('/api/filters/presets')
        .send({
          name: 'Test Preset'
          // Missing required fields
        })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Name, criteria, entityType, createdBy, and companyId are required'
      });
    });

    it('should handle database errors during creation', async () => {
      mockDb.prepare.mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await agent
        .post('/api/filters/presets')
        .send({
          name: 'Test Preset',
          criteria: { status: ['To Do'] },
          entityType: 'tasks',
          createdBy: 'user1',
          companyId: 'company1'
        })
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Database error'
      });
    });
  });

  describe('PUT /api/filters/presets/:id', () => {
    it('should update filter preset successfully', async () => {
      const existingPreset = {
        id: '1',
        name: 'Original Name',
        description: 'Original description',
        criteria: JSON.stringify({ status: ['To Do'] }),
        entity_type: 'tasks',
        is_shared: false,
        created_by: 'user1',
        company_id: 'company1',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      };

      const updatedPreset = {
        ...existingPreset,
        name: 'Updated Name',
        description: 'Updated description',
        updated_at: '2025-01-02T00:00:00Z'
      };

      mockStatement.get
        .mockReturnValueOnce(existingPreset)
        .mockReturnValueOnce(updatedPreset);

      const response = await agent
        .put('/api/filters/presets/1')
        .send({
          name: 'Updated Name',
          description: 'Updated description'
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: updatedPreset,
        message: 'Filter preset updated successfully'
      });
    });

    it('should return 404 for non-existent preset', async () => {
      mockStatement.get.mockReturnValue(null);

      const response = await agent
        .put('/api/filters/presets/999')
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Filter preset not found'
      });
    });

    it('should return 400 for no fields to update', async () => {
      const existingPreset = {
        id: '1',
        name: 'Test Preset',
        criteria: JSON.stringify({}),
        entity_type: 'tasks',
        is_shared: false,
        created_by: 'user1',
        company_id: 'company1',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      };

      mockStatement.get.mockReturnValue(existingPreset);

      const response = await agent
        .put('/api/filters/presets/1')
        .send({ id: '1' }) // Only ID, no actual updates
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'No fields to update'
      });
    });
  });

  describe('DELETE /api/filters/presets/:id', () => {
    it('should delete filter preset successfully', async () => {
      const existingPreset = {
        id: '1',
        name: 'Test Preset',
        criteria: JSON.stringify({}),
        entity_type: 'tasks',
        is_shared: false,
        created_by: 'user1',
        company_id: 'company1',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      };

      mockStatement.get.mockReturnValue(existingPreset);

      const response = await agent
        .delete('/api/filters/presets/1')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Filter preset deleted successfully'
      });

      expect(mockDb.prepare).toHaveBeenCalledWith(
        'DELETE FROM filter_presets WHERE id = ?'
      );
    });

    it('should return 404 for non-existent preset', async () => {
      mockStatement.get.mockReturnValue(null);

      const response = await agent
        .delete('/api/filters/presets/999')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Filter preset not found'
      });
    });
  });

  describe('GET /api/filters/search-history', () => {
    it('should return search history successfully', async () => {
      const mockHistory = [
        {
          id: '1',
          query: 'urgent tasks',
          filters: JSON.stringify({ priority: ['High'] }),
          entity_type: 'tasks',
          result_count: 5,
          user_id: 'user1',
          company_id: 'company1',
          timestamp: '2025-01-01T00:00:00Z'
        }
      ];

      mockStatement.all.mockReturnValue(mockHistory);

      const response = await agent
        .get('/api/filters/search-history?userId=user1&entityType=tasks&limit=20')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: mockHistory
      });
    });

    it('should limit results correctly', async () => {
      mockStatement.all.mockReturnValue([]);

      await agent
        .get('/api/filters/search-history?limit=10')
        .expect(200);

      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY timestamp DESC LIMIT ?')
      );
    });
  });

  describe('POST /api/filters/search-history', () => {
    it('should create search history entry successfully', async () => {
      const newEntry = {
        id: '1',
        query: 'urgent tasks',
        filters: JSON.stringify({ priority: ['High'] }),
        entity_type: 'tasks',
        result_count: 5,
        user_id: 'user1',
        company_id: 'company1',
        timestamp: '2025-01-01T00:00:00Z'
      };

      mockStatement.get.mockReturnValue(newEntry);

      const response = await agent
        .post('/api/filters/search-history')
        .send({
          query: 'urgent tasks',
          filters: { priority: ['High'] },
          entityType: 'tasks',
          resultCount: 5,
          userId: 'user1',
          companyId: 'company1'
        })
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: newEntry,
        message: 'Search history entry created successfully'
      });
    });

    it('should return 400 for missing required fields', async () => {
      const response = await agent
        .post('/api/filters/search-history')
        .send({
          query: 'urgent tasks'
          // Missing required fields
        })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Query, entityType, userId, and companyId are required'
      });
    });
  });

  describe('DELETE /api/filters/search-history', () => {
    it('should clear search history successfully', async () => {
      const response = await agent
        .delete('/api/filters/search-history')
        .send({ userId: 'user1' })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Search history cleared successfully'
      });

      expect(mockDb.prepare).toHaveBeenCalledWith(
        'DELETE FROM search_history WHERE user_id = ?'
      );
    });

    it('should return 400 for missing userId', async () => {
      const response = await agent
        .delete('/api/filters/search-history')
        .send({})
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'userId is required'
      });
    });
  });

  describe('GET /api/filters/search-suggestions', () => {
    it('should return AI search suggestions successfully', async () => {
      const mockSuggestions = ['urgent tasks', 'overdue items', 'high priority'];

      // Mock cache miss - no cached result
      mockStatement.get.mockReturnValue(null);

      // Mock the generateAISuggestions function
      const originalModule = await import('../../../server/routes/filters');
      const mockGenerateAISuggestions = jest.fn().mockReturnValue(mockSuggestions);
      jest.spyOn(originalModule, 'generateAISuggestions').mockImplementation(mockGenerateAISuggestions);

      const response = await agent
        .get('/api/filters/search-suggestions?q=urgent&entityType=tasks&companyId=company1')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: mockSuggestions
      });

      expect(mockGenerateAISuggestions).toHaveBeenCalledWith('urgent', 'tasks');
    });

    it('should return cached suggestions if available', async () => {
      const cachedSuggestions = {
        query: 'urgent',
        entity_type: 'tasks',
        suggestions: JSON.stringify(['cached suggestions']),
        company_id: 'company1',
        expires_at: '2025-12-31T23:59:59Z'
      };

      mockStatement.get.mockReturnValue(cachedSuggestions);

      const response = await agent
        .get('/api/filters/search-suggestions?q=urgent&entityType=tasks&companyId=company1')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: ['cached suggestions']
      });
    });

    it('should return 400 for missing required parameters', async () => {
      const response = await agent
        .get('/api/filters/search-suggestions?q=urgent')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Query, entityType, and companyId are required'
      });
    });
  });

  describe('GET /api/filters/smart-filters', () => {
    it('should return smart filters successfully', async () => {
      const mockSmartFilters = {
        status: ['To Do'],
        priority: ['High']
      };

      // Mock cache miss
      mockStatement.get.mockReturnValue(null);

      // Mock the generateSmartFilters function
      const originalModule = await import('../../../server/routes/filters');
      const mockGenerateSmartFilters = jest.fn().mockResolvedValue(mockSmartFilters);
      jest.spyOn(originalModule, 'generateSmartFilters').mockImplementation(mockGenerateSmartFilters);

      const response = await agent
        .get('/api/filters/smart-filters?entityType=tasks&companyId=company1')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: mockSmartFilters
      });
    });

    it('should return cached smart filters if available', async () => {
      const cachedFilters = {
        entity_type: 'tasks',
        filters: JSON.stringify({ status: ['cached filters'] }),
        company_id: 'company1',
        expires_at: '2025-12-31T23:59:59Z'
      };

      mockStatement.get.mockReturnValue(cachedFilters);

      const response = await agent
        .get('/api/filters/smart-filters?entityType=tasks&companyId=company1')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: { status: ['cached filters'] }
      });
    });

    it('should return 400 for missing required parameters', async () => {
      const response = await agent
        .get('/api/filters/smart-filters?entityType=tasks')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'entityType and companyId are required'
      });
    });
  });

  describe('GET /api/filters/bulk-operations', () => {
    it('should return bulk operations successfully', async () => {
      const mockOperations = [
        {
          id: '1',
          entity_type: 'tasks',
          operation: 'update',
          selected_ids: JSON.stringify(['1', '2', '3']),
          changes: JSON.stringify({ status: 'In Progress' }),
          status: 'completed',
          progress: 100,
          created_by: 'user1',
          company_id: 'company1',
          created_at: '2025-01-01T00:00:00Z',
          completed_at: '2025-01-01T00:01:00Z'
        }
      ];

      mockStatement.all.mockReturnValue(mockOperations);

      const response = await agent
        .get('/api/filters/bulk-operations?createdBy=user1&status=completed&page=1&limit=20')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: mockOperations,
        pagination: expect.any(Object)
      });
    });

    it('should handle pagination correctly', async () => {
      mockStatement.all.mockReturnValue([]);
      const mockCountStatement = { get: jest.fn().mockReturnValue({ total: 100 }) };
      mockDb.prepare
        .mockReturnValueOnce(mockCountStatement)
        .mockReturnValueOnce(mockStatement);

      const response = await agent
        .get('/api/filters/bulk-operations?page=3&limit=25')
        .expect(200);

      expect(response.body.pagination).toMatchObject({
        page: 3,
        limit: 25,
        total: 100,
        totalPages: 4
      });
    });
  });

  describe('POST /api/filters/bulk-operations', () => {
    it('should create bulk operation successfully', async () => {
      const newOperation = {
        id: '1',
        entity_type: 'tasks',
        operation: 'update',
        selected_ids: JSON.stringify(['1', '2', '3']),
        changes: JSON.stringify({ status: 'In Progress' }),
        status: 'pending',
        progress: 0,
        created_by: 'user1',
        company_id: 'company1',
        created_at: '2025-01-01T00:00:00Z'
      };

      mockStatement.get.mockReturnValue(newOperation);

      const response = await agent
        .post('/api/filters/bulk-operations')
        .send({
          entityType: 'tasks',
          operation: 'update',
          selectedIds: ['1', '2', '3'],
          changes: { status: 'In Progress' },
          createdBy: 'user1',
          companyId: 'company1'
        })
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: newOperation,
        message: 'Bulk operation created successfully'
      });
    });

    it('should return 400 for missing required fields', async () => {
      const response = await agent
        .post('/api/filters/bulk-operations')
        .send({
          entityType: 'tasks'
          // Missing required fields
        })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'entityType, operation, selectedIds, createdBy, and companyId are required'
      });
    });
  });

  describe('POST /api/filters/bulk-operations/:id/execute', () => {
    it('should start bulk operation execution successfully', async () => {
      const pendingOperation = {
        id: '1',
        entity_type: 'tasks',
        operation: 'update',
        selected_ids: JSON.stringify(['1', '2', '3']),
        changes: JSON.stringify({ status: 'In Progress' }),
        status: 'pending',
        progress: 0,
        created_by: 'user1',
        company_id: 'company1',
        created_at: '2025-01-01T00:00:00Z'
      };

      mockStatement.get.mockReturnValue(pendingOperation);

      const response = await agent
        .post('/api/filters/bulk-operations/1/execute')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Bulk operation execution started'
      });

      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE bulk_operations SET status = \'processing\'')
      );
    });

    it('should return 404 for non-existent operation', async () => {
      mockStatement.get.mockReturnValue(null);

      const response = await agent
        .post('/api/filters/bulk-operations/999/execute')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Bulk operation not found'
      });
    });

    it('should return 400 for non-pending operation', async () => {
      const completedOperation = {
        id: '1',
        status: 'completed',
        progress: 100
      };

      mockStatement.get.mockReturnValue(completedOperation);

      const response = await agent
        .post('/api/filters/bulk-operations/1/execute')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Bulk operation is not in pending status'
      });
    });
  });

  describe('POST /api/filters/bulk-operations/:id/cancel', () => {
    it('should cancel bulk operation successfully', async () => {
      const processingOperation = {
        id: '1',
        entity_type: 'tasks',
        operation: 'update',
        selected_ids: JSON.stringify(['1', '2', '3']),
        changes: JSON.stringify({ status: 'In Progress' }),
        status: 'processing',
        progress: 50,
        created_by: 'user1',
        company_id: 'company1',
        created_at: '2025-01-01T00:00:00Z'
      };

      mockStatement.get.mockReturnValue(processingOperation);

      const response = await agent
        .post('/api/filters/bulk-operations/1/cancel')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Bulk operation cancelled successfully'
      });

      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE bulk_operations SET status = \'failed\'')
      );
    });

    it('should return 404 for non-existent operation', async () => {
      mockStatement.get.mockReturnValue(null);

      const response = await agent
        .post('/api/filters/bulk-operations/999/cancel')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Bulk operation not found'
      });
    });

    it('should return 400 for completed operation', async () => {
      const completedOperation = {
        id: '1',
        status: 'completed',
        progress: 100
      };

      mockStatement.get.mockReturnValue(completedOperation);

      const response = await agent
        .post('/api/filters/bulk-operations/1/cancel')
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Cannot cancel completed operation'
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      mockDb.prepare.mockImplementation(() => {
        throw new Error('Connection lost');
      });

      const response = await agent
        .get('/api/filters/presets')
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Connection lost'
      });
    });

    it('should handle malformed JSON in database gracefully', async () => {
      mockStatement.get.mockImplementation(() => {
        throw new Error('Invalid JSON');
      });

      const response = await agent
        .get('/api/filters/presets')
        .expect(500);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Invalid JSON'
      });
    });
  });

  describe('Input Validation', () => {
    it('should handle invalid pagination parameters', async () => {
      mockStatement.all.mockReturnValue([]);

      const response = await agent
        .get('/api/filters/presets?page=invalid&limit=invalid')
        .expect(200);

      // Should default to page 1 and limit 50
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(50);
    });

    it('should handle negative pagination values', async () => {
      mockStatement.all.mockReturnValue([]);

      const response = await agent
        .get('/api/filters/presets?page=-1&limit=-5')
        .expect(200);

      // Should handle negative values gracefully
      expect(response.body.pagination.page).toBe(-1);
      expect(response.body.pagination.limit).toBe(-5);
    });

    it('should handle extremely large pagination values', async () => {
      mockStatement.all.mockReturnValue([]);

      const response = await agent
        .get('/api/filters/presets?page=999999&limit=999999')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: [],
        pagination: expect.any(Object)
      });
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Preset ${i + 1}`,
        criteria: JSON.stringify({}),
        entity_type: 'tasks',
        is_shared: false,
        created_by: 'user1',
        company_id: 'company1',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      }));

      mockStatement.all.mockReturnValue(largeDataset);

      const startTime = Date.now();

      const response = await agent
        .get('/api/filters/presets?limit=1000')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body.data).toHaveLength(1000);
      expect(responseTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe('Security', () => {
    it('should prevent SQL injection in preset names', async () => {
      const maliciousInput = "'; DROP TABLE filter_presets; --";

      const response = await agent
        .post('/api/filters/presets')
        .send({
          name: maliciousInput,
          criteria: { status: ['To Do'] },
          entityType: 'tasks',
          createdBy: 'user1',
          companyId: 'company1'
        })
        .expect(201); // Should still work but safely

      expect(response.body.success).toBe(true);
    });

    it('should handle special characters in search queries', async () => {
      const specialQuery = 'test@#$%^&*()_+{}|:"<>?[]\\;\',./';

      const response = await agent
        .get(`/api/filters/search-suggestions?q=${encodeURIComponent(specialQuery)}&entityType=tasks&companyId=company1`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});