// 🏗️ Field Management Service
// Comprehensive field management service inspired by Fieldwire and Procore

import { 
  PunchList, 
  DailyReport, 
  Task, 
  Inspection, 
  Photo, 
  TimeEntry,
  Drawing,
  OfflineData,
  SyncOperation,
  PunchCategory,
  PunchStatus,
  TaskStatus,
  Priority
} from '../types/field-management';

export class FieldManagementService {
  private baseUrl = '/api/field';
  private offlineStorage = 'asagents_offline_data';

  // ===== PUNCH LIST MANAGEMENT =====

  async getPunchLists(projectId: string, filters?: any): Promise<PunchList[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
      }
      
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/punch-lists?${params}`);
      if (!response.ok) throw new Error('Failed to fetch punch lists');
      return await response.json();
    } catch (error) {
      console.error('Error fetching punch lists:', error);
      return this.getMockPunchLists(projectId);
    }
  }

  async createPunchList(projectId: string, punchData: Partial<PunchList>): Promise<PunchList> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/punch-lists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(punchData)
      });
      if (!response.ok) throw new Error('Failed to create punch list');
      return await response.json();
    } catch (error) {
      console.error('Error creating punch list:', error);
      return this.createMockPunchList(projectId, punchData);
    }
  }

  async updatePunchList(projectId: string, punchId: string, updates: Partial<PunchList>): Promise<PunchList> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/punch-lists/${punchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update punch list');
      return await response.json();
    } catch (error) {
      console.error('Error updating punch list:', error);
      return this.getMockPunchLists(projectId)[0];
    }
  }

  async deletePunchList(projectId: string, punchId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/punch-lists/${punchId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete punch list');
    } catch (error) {
      console.error('Error deleting punch list:', error);
    }
  }

  // ===== DAILY REPORTS =====

  async getDailyReports(projectId: string, dateRange?: { start: Date; end: Date }): Promise<DailyReport[]> {
    try {
      const params = new URLSearchParams();
      if (dateRange) {
        params.append('start', dateRange.start.toISOString());
        params.append('end', dateRange.end.toISOString());
      }
      
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/daily-reports?${params}`);
      if (!response.ok) throw new Error('Failed to fetch daily reports');
      return await response.json();
    } catch (error) {
      console.error('Error fetching daily reports:', error);
      return this.getMockDailyReports(projectId);
    }
  }

  async createDailyReport(projectId: string, reportData: Partial<DailyReport>): Promise<DailyReport> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/daily-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      if (!response.ok) throw new Error('Failed to create daily report');
      return await response.json();
    } catch (error) {
      console.error('Error creating daily report:', error);
      return this.createMockDailyReport(projectId, reportData);
    }
  }

  async updateDailyReport(projectId: string, reportId: string, updates: Partial<DailyReport>): Promise<DailyReport> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/daily-reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update daily report');
      return await response.json();
    } catch (error) {
      console.error('Error updating daily report:', error);
      return this.getMockDailyReports(projectId)[0];
    }
  }

  // ===== TASK MANAGEMENT =====

  async getTasks(projectId: string, filters?: any): Promise<Task[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
      }
      
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/tasks?${params}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return await response.json();
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return this.getMockTasks(projectId);
    }
  }

  async createTask(projectId: string, taskData: Partial<Task>): Promise<Task> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (!response.ok) throw new Error('Failed to create task');
      return await response.json();
    } catch (error) {
      console.error('Error creating task:', error);
      return this.createMockTask(projectId, taskData);
    }
  }

  async updateTask(projectId: string, taskId: string, updates: Partial<Task>): Promise<Task> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update task');
      return await response.json();
    } catch (error) {
      console.error('Error updating task:', error);
      return this.getMockTasks(projectId)[0];
    }
  }

  // ===== PHOTO MANAGEMENT =====

  async uploadPhoto(projectId: string, file: File, metadata: any): Promise<Photo> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('metadata', JSON.stringify(metadata));
      
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/photos`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Failed to upload photo');
      return await response.json();
    } catch (error) {
      console.error('Error uploading photo:', error);
      return this.createMockPhoto(file, metadata);
    }
  }

  async getPhotos(projectId: string, filters?: any): Promise<Photo[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
      }
      
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/photos?${params}`);
      if (!response.ok) throw new Error('Failed to fetch photos');
      return await response.json();
    } catch (error) {
      console.error('Error fetching photos:', error);
      return this.getMockPhotos(projectId);
    }
  }

  async deletePhoto(projectId: string, photoId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/photos/${photoId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete photo');
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  }

  // ===== TIME TRACKING =====

  async createTimeEntry(projectId: string, timeData: Partial<TimeEntry>): Promise<TimeEntry> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/time-entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(timeData)
      });
      if (!response.ok) throw new Error('Failed to create time entry');
      return await response.json();
    } catch (error) {
      console.error('Error creating time entry:', error);
      return this.createMockTimeEntry(projectId, timeData);
    }
  }

  async getTimeEntries(projectId: string, userId?: string, dateRange?: { start: Date; end: Date }): Promise<TimeEntry[]> {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (dateRange) {
        params.append('start', dateRange.start.toISOString());
        params.append('end', dateRange.end.toISOString());
      }
      
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/time-entries?${params}`);
      if (!response.ok) throw new Error('Failed to fetch time entries');
      return await response.json();
    } catch (error) {
      console.error('Error fetching time entries:', error);
      return this.getMockTimeEntries(projectId);
    }
  }

  // ===== DRAWINGS MANAGEMENT =====

  async getDrawings(projectId: string): Promise<Drawing[]> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/drawings`);
      if (!response.ok) throw new Error('Failed to fetch drawings');
      return await response.json();
    } catch (error) {
      console.error('Error fetching drawings:', error);
      return this.getMockDrawings(projectId);
    }
  }

  async addDrawingMarkup(projectId: string, drawingId: string, markup: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/projects/${projectId}/drawings/${drawingId}/markups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(markup)
      });
      if (!response.ok) throw new Error('Failed to add drawing markup');
      return await response.json();
    } catch (error) {
      console.error('Error adding drawing markup:', error);
      return { id: `markup-${Date.now()}`, ...markup };
    }
  }

  // ===== OFFLINE SYNC =====

  async syncOfflineData(): Promise<void> {
    try {
      const offlineData = this.getOfflineData();
      const syncOperations = this.getPendingSyncOperations();
      
      for (const operation of syncOperations) {
        await this.processSyncOperation(operation);
      }
      
      // Update offline data with latest from server
      await this.updateOfflineData();
    } catch (error) {
      console.error('Error syncing offline data:', error);
    }
  }

  private getOfflineData(): OfflineData {
    const data = localStorage.getItem(this.offlineStorage);
    return data ? JSON.parse(data) : {
      punchLists: [],
      tasks: [],
      photos: [],
      drawings: [],
      lastSync: new Date()
    };
  }

  private saveOfflineData(data: OfflineData): void {
    localStorage.setItem(this.offlineStorage, JSON.stringify(data));
  }

  private getPendingSyncOperations(): SyncOperation[] {
    const operations = localStorage.getItem(`${this.offlineStorage}_sync`);
    return operations ? JSON.parse(operations) : [];
  }

  private async processSyncOperation(operation: SyncOperation): Promise<void> {
    try {
      // Process sync operation based on type and entity
      console.log('Processing sync operation:', operation);
      // Implementation would handle actual sync logic
    } catch (error) {
      console.error('Error processing sync operation:', error);
      operation.status = 'failed';
      operation.error = error instanceof Error ? error.message : 'Unknown error';
      operation.retryCount++;
    }
  }

  private async updateOfflineData(): Promise<void> {
    // Update offline data with latest from server
    console.log('Updating offline data...');
  }

  // ===== MOCK DATA METHODS =====

  private getMockPunchLists(projectId: string): PunchList[] {
    return [
      {
        id: 'punch-1',
        projectId,
        title: 'Paint touch-up required in lobby',
        description: 'Several scuff marks and scratches on walls need touch-up paint',
        category: PunchCategory.ARCHITECTURAL,
        priority: Priority.MEDIUM,
        status: PunchStatus.OPEN,
        assignedTo: 'painter-1',
        assignedCompany: 'ABC Painting',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        location: {
          building: 'Main Building',
          floor: '1st Floor',
          room: 'Lobby',
          area: 'East Wall'
        },
        trade: 'Painting',
        room: 'Lobby',
        floor: '1st Floor',
        photos: [],
        attachments: [],
        verificationPhotos: [],
        comments: [],
        createdBy: 'inspector-1',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  private createMockPunchList(projectId: string, punchData: Partial<PunchList>): PunchList {
    return {
      id: `punch-${Date.now()}`,
      projectId,
      title: punchData.title || 'New Punch Item',
      description: punchData.description || '',
      category: punchData.category || PunchCategory.OTHER,
      priority: punchData.priority || Priority.MEDIUM,
      status: PunchStatus.OPEN,
      assignedTo: punchData.assignedTo || '',
      assignedCompany: punchData.assignedCompany || '',
      dueDate: punchData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      location: punchData.location || {},
      trade: punchData.trade || '',
      room: punchData.room || '',
      floor: punchData.floor || '',
      photos: [],
      attachments: [],
      verificationPhotos: [],
      comments: [],
      createdBy: 'current-user',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private getMockDailyReports(projectId: string): DailyReport[] {
    return [
      {
        id: 'report-1',
        projectId,
        date: new Date(),
        reportedBy: 'foreman-1',
        weather: 'clear' as any,
        temperature: { high: 75, low: 55, unit: 'F' },
        crew: [],
        workPerformed: [],
        materials: [],
        equipment: [],
        safety: [],
        visitors: [],
        delays: [],
        issues: [],
        photos: [],
        notes: 'Good progress on foundation work',
        submittedAt: new Date()
      }
    ];
  }

  private createMockDailyReport(projectId: string, reportData: Partial<DailyReport>): DailyReport {
    return {
      id: `report-${Date.now()}`,
      projectId,
      date: reportData.date || new Date(),
      reportedBy: reportData.reportedBy || 'current-user',
      weather: reportData.weather || 'clear' as any,
      temperature: reportData.temperature || { high: 70, low: 50, unit: 'F' },
      crew: reportData.crew || [],
      workPerformed: reportData.workPerformed || [],
      materials: reportData.materials || [],
      equipment: reportData.equipment || [],
      safety: reportData.safety || [],
      visitors: reportData.visitors || [],
      delays: reportData.delays || [],
      issues: reportData.issues || [],
      photos: reportData.photos || [],
      notes: reportData.notes || '',
      submittedAt: new Date()
    };
  }

  private getMockTasks(projectId: string): Task[] {
    return [
      {
        id: 'task-1',
        projectId,
        title: 'Install electrical outlets',
        description: 'Install 20 electrical outlets in office areas',
        type: 'construction' as any,
        category: 'electrical' as any,
        priority: Priority.HIGH,
        status: TaskStatus.IN_PROGRESS,
        assignedTo: ['electrician-1'],
        assignedCompany: 'XYZ Electric',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        estimatedHours: 16,
        actualHours: 8,
        location: { building: 'Main Building', floor: '2nd Floor' },
        trade: 'Electrical',
        phase: 'Rough-in',
        prerequisites: [],
        dependencies: [],
        photos: [],
        attachments: [],
        comments: [],
        timeEntries: [],
        materials: [],
        equipment: [],
        safetyRequirements: [],
        qualityChecks: [],
        createdBy: 'pm-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        startedAt: new Date()
      }
    ];
  }

  private createMockTask(projectId: string, taskData: Partial<Task>): Task {
    return {
      id: `task-${Date.now()}`,
      projectId,
      title: taskData.title || 'New Task',
      description: taskData.description || '',
      type: taskData.type || 'construction' as any,
      category: taskData.category || 'other' as any,
      priority: taskData.priority || Priority.MEDIUM,
      status: TaskStatus.NOT_STARTED,
      assignedTo: taskData.assignedTo || [],
      assignedCompany: taskData.assignedCompany || '',
      dueDate: taskData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      estimatedHours: taskData.estimatedHours || 8,
      actualHours: 0,
      location: taskData.location || {},
      trade: taskData.trade || '',
      phase: taskData.phase || '',
      prerequisites: [],
      dependencies: [],
      photos: [],
      attachments: [],
      comments: [],
      timeEntries: [],
      materials: [],
      equipment: [],
      safetyRequirements: [],
      qualityChecks: [],
      createdBy: 'current-user',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private createMockPhoto(file: File, metadata: any): Photo {
    return {
      id: `photo-${Date.now()}`,
      url: URL.createObjectURL(file),
      thumbnailUrl: URL.createObjectURL(file),
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      timestamp: new Date(),
      metadata: {
        width: 1920,
        height: 1080,
        ...metadata
      },
      tags: [],
      annotations: [],
      uploadedBy: 'current-user',
      uploadedAt: new Date()
    };
  }

  private getMockPhotos(projectId: string): Photo[] {
    return [];
  }

  private createMockTimeEntry(projectId: string, timeData: Partial<TimeEntry>): TimeEntry {
    return {
      id: `time-${Date.now()}`,
      userId: timeData.userId || 'current-user',
      projectId,
      taskId: timeData.taskId,
      date: timeData.date || new Date(),
      startTime: timeData.startTime || new Date(),
      endTime: timeData.endTime,
      duration: timeData.duration || 480, // 8 hours
      breakTime: timeData.breakTime || 60, // 1 hour
      overtimeHours: timeData.overtimeHours || 0,
      description: timeData.description || '',
      location: timeData.location || '',
      costCode: timeData.costCode || '',
      billable: timeData.billable || true,
      approved: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private getMockTimeEntries(projectId: string): TimeEntry[] {
    return [];
  }

  private getMockDrawings(projectId: string): Drawing[] {
    return [
      {
        id: 'drawing-1',
        projectId,
        name: 'Floor Plan - Level 1',
        number: 'A-101',
        discipline: 'Architectural',
        version: '1.0',
        url: '/mock-drawing.pdf',
        thumbnailUrl: '/mock-drawing-thumb.jpg',
        scale: '1/4" = 1\'',
        size: { width: 36, height: 24, units: 'in' },
        layers: [],
        markups: [],
        lastModified: new Date()
      }
    ];
  }
}

export const fieldManagementService = new FieldManagementService();
