// CortexBuild Time Tracking Service
import { User, Project, Task } from '../types';

export interface TimeEntry {
  id: string;
  userId: string;
  userName: string;
  projectId: string;
  projectName: string;
  taskId?: string;
  taskName?: string;
  description: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  isRunning: boolean;
  category: 'development' | 'meeting' | 'review' | 'documentation' | 'travel' | 'other';
  billable: boolean;
  hourlyRate?: number;
  tags: string[];
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSheet {
  id: string;
  userId: string;
  userName: string;
  weekStartDate: string;
  weekEndDate: string;
  entries: TimeEntry[];
  totalHours: number;
  billableHours: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  comments?: string;
}

export interface TimeReport {
  period: { start: string; end: string };
  totalHours: number;
  billableHours: number;
  totalCost: number;
  byProject: { [projectId: string]: { hours: number; cost: number; projectName: string } };
  byUser: { [userId: string]: { hours: number; cost: number; userName: string } };
  byCategory: { [category: string]: { hours: number; percentage: number } };
  productivity: {
    averageHoursPerDay: number;
    mostProductiveDay: string;
    mostProductiveHour: number;
    efficiency: number;
  };
}

class TimeTrackingService {
  private timeEntries: TimeEntry[] = [];
  private timeSheets: TimeSheet[] = [];
  private runningTimers: Map<string, TimeEntry> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    this.timeEntries = [
      {
        id: 'time-1',
        userId: 'user-3',
        userName: 'Adrian Developer',
        projectId: 'project-1',
        projectName: 'Canary Wharf Tower Renovation',
        taskId: 'task-1',
        taskName: 'Install facade panels - Floor 15-20',
        description: 'Working on facade panel installation',
        startTime: `${today}T09:00:00Z`,
        endTime: `${today}T12:30:00Z`,
        duration: 210, // 3.5 hours
        isRunning: false,
        category: 'development',
        billable: true,
        hourlyRate: 75,
        tags: ['facade', 'installation'],
        location: 'Canary Wharf Site',
        createdAt: `${today}T09:00:00Z`,
        updatedAt: `${today}T12:30:00Z`
      },
      {
        id: 'time-2',
        userId: 'user-3',
        userName: 'Adrian Developer',
        projectId: 'project-1',
        projectName: 'Canary Wharf Tower Renovation',
        description: 'Team meeting - progress review',
        startTime: `${today}T14:00:00Z`,
        endTime: `${today}T15:00:00Z`,
        duration: 60,
        isRunning: false,
        category: 'meeting',
        billable: false,
        tags: ['meeting', 'progress'],
        location: 'Site Office',
        createdAt: `${today}T14:00:00Z`,
        updatedAt: `${today}T15:00:00Z`
      },
      {
        id: 'time-3',
        userId: 'user-2',
        userName: 'Adrian ASC',
        projectId: 'project-1',
        projectName: 'Canary Wharf Tower Renovation',
        description: 'Site inspection and quality review',
        startTime: `${yesterday}T10:00:00Z`,
        endTime: `${yesterday}T16:00:00Z`,
        duration: 360, // 6 hours
        isRunning: false,
        category: 'review',
        billable: true,
        hourlyRate: 95,
        tags: ['inspection', 'quality'],
        location: 'Canary Wharf Site',
        createdAt: `${yesterday}T10:00:00Z`,
        updatedAt: `${yesterday}T16:00:00Z`
      }
    ];
  }

  // Start a new timer
  async startTimer(
    userId: string,
    projectId: string,
    description: string,
    options: {
      taskId?: string;
      category?: TimeEntry['category'];
      billable?: boolean;
      hourlyRate?: number;
      tags?: string[];
      location?: string;
    } = {}
  ): Promise<TimeEntry> {
    // Stop any existing timer for this user
    await this.stopTimer(userId);

    const now = new Date().toISOString();
    const timeEntry: TimeEntry = {
      id: `time-${Date.now()}`,
      userId,
      userName: await this.getUserName(userId),
      projectId,
      projectName: await this.getProjectName(projectId),
      taskId: options.taskId,
      taskName: options.taskId ? await this.getTaskName(options.taskId) : undefined,
      description,
      startTime: now,
      duration: 0,
      isRunning: true,
      category: options.category || 'development',
      billable: options.billable ?? true,
      hourlyRate: options.hourlyRate,
      tags: options.tags || [],
      location: options.location,
      createdAt: now,
      updatedAt: now
    };

    this.runningTimers.set(userId, timeEntry);
    return timeEntry;
  }

  // Stop the running timer for a user
  async stopTimer(userId: string): Promise<TimeEntry | null> {
    const runningTimer = this.runningTimers.get(userId);
    if (!runningTimer) return null;

    const now = new Date().toISOString();
    const startTime = new Date(runningTimer.startTime);
    const endTime = new Date(now);
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

    const completedEntry: TimeEntry = {
      ...runningTimer,
      endTime: now,
      duration,
      isRunning: false,
      updatedAt: now
    };

    this.timeEntries.push(completedEntry);
    this.runningTimers.delete(userId);

    return completedEntry;
  }

  // Get running timer for a user
  async getRunningTimer(userId: string): Promise<TimeEntry | null> {
    const timer = this.runningTimers.get(userId);
    if (!timer) return null;

    // Update duration for display
    const now = new Date();
    const startTime = new Date(timer.startTime);
    const currentDuration = Math.round((now.getTime() - startTime.getTime()) / (1000 * 60));

    return {
      ...timer,
      duration: currentDuration
    };
  }

  // Get time entries with filtering
  async getTimeEntries(filters: {
    userId?: string;
    projectId?: string;
    taskId?: string;
    startDate?: string;
    endDate?: string;
    category?: string;
    billable?: boolean;
    page?: number;
    limit?: number;
  } = {}): Promise<{ entries: TimeEntry[]; total: number; page: number; totalPages: number }> {
    let filteredEntries = [...this.timeEntries];

    // Apply filters
    if (filters.userId) {
      filteredEntries = filteredEntries.filter(entry => entry.userId === filters.userId);
    }

    if (filters.projectId) {
      filteredEntries = filteredEntries.filter(entry => entry.projectId === filters.projectId);
    }

    if (filters.taskId) {
      filteredEntries = filteredEntries.filter(entry => entry.taskId === filters.taskId);
    }

    if (filters.startDate) {
      filteredEntries = filteredEntries.filter(entry => 
        entry.startTime >= filters.startDate!
      );
    }

    if (filters.endDate) {
      filteredEntries = filteredEntries.filter(entry => 
        entry.startTime <= filters.endDate!
      );
    }

    if (filters.category) {
      filteredEntries = filteredEntries.filter(entry => entry.category === filters.category);
    }

    if (filters.billable !== undefined) {
      filteredEntries = filteredEntries.filter(entry => entry.billable === filters.billable);
    }

    // Sort by start time (newest first)
    filteredEntries.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

    return {
      entries: paginatedEntries,
      total: filteredEntries.length,
      page,
      totalPages: Math.ceil(filteredEntries.length / limit)
    };
  }

  // Create manual time entry
  async createTimeEntry(entry: Omit<TimeEntry, 'id' | 'userName' | 'projectName' | 'taskName' | 'createdAt' | 'updatedAt'>): Promise<TimeEntry> {
    const now = new Date().toISOString();
    const newEntry: TimeEntry = {
      ...entry,
      id: `time-${Date.now()}`,
      userName: await this.getUserName(entry.userId),
      projectName: await this.getProjectName(entry.projectId),
      taskName: entry.taskId ? await this.getTaskName(entry.taskId) : undefined,
      createdAt: now,
      updatedAt: now
    };

    this.timeEntries.push(newEntry);
    return newEntry;
  }

  // Update time entry
  async updateTimeEntry(id: string, updates: Partial<TimeEntry>): Promise<TimeEntry | null> {
    const index = this.timeEntries.findIndex(entry => entry.id === id);
    if (index === -1) return null;

    this.timeEntries[index] = {
      ...this.timeEntries[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.timeEntries[index];
  }

  // Delete time entry
  async deleteTimeEntry(id: string): Promise<boolean> {
    const index = this.timeEntries.findIndex(entry => entry.id === id);
    if (index === -1) return false;

    this.timeEntries.splice(index, 1);
    return true;
  }

  // Generate time report
  async generateTimeReport(
    startDate: string,
    endDate: string,
    filters: { userId?: string; projectId?: string } = {}
  ): Promise<TimeReport> {
    const entries = await this.getTimeEntries({
      ...filters,
      startDate,
      endDate,
      limit: 1000
    });

    const totalMinutes = entries.entries.reduce((sum, entry) => sum + entry.duration, 0);
    const billableMinutes = entries.entries
      .filter(entry => entry.billable)
      .reduce((sum, entry) => sum + entry.duration, 0);

    const totalHours = totalMinutes / 60;
    const billableHours = billableMinutes / 60;

    // Calculate total cost
    const totalCost = entries.entries.reduce((sum, entry) => {
      if (entry.billable && entry.hourlyRate) {
        return sum + (entry.duration / 60) * entry.hourlyRate;
      }
      return sum;
    }, 0);

    // Group by project
    const byProject: { [projectId: string]: { hours: number; cost: number; projectName: string } } = {};
    entries.entries.forEach(entry => {
      if (!byProject[entry.projectId]) {
        byProject[entry.projectId] = {
          hours: 0,
          cost: 0,
          projectName: entry.projectName
        };
      }
      byProject[entry.projectId].hours += entry.duration / 60;
      if (entry.billable && entry.hourlyRate) {
        byProject[entry.projectId].cost += (entry.duration / 60) * entry.hourlyRate;
      }
    });

    // Group by user
    const byUser: { [userId: string]: { hours: number; cost: number; userName: string } } = {};
    entries.entries.forEach(entry => {
      if (!byUser[entry.userId]) {
        byUser[entry.userId] = {
          hours: 0,
          cost: 0,
          userName: entry.userName
        };
      }
      byUser[entry.userId].hours += entry.duration / 60;
      if (entry.billable && entry.hourlyRate) {
        byUser[entry.userId].cost += (entry.duration / 60) * entry.hourlyRate;
      }
    });

    // Group by category
    const byCategory: { [category: string]: { hours: number; percentage: number } } = {};
    entries.entries.forEach(entry => {
      if (!byCategory[entry.category]) {
        byCategory[entry.category] = { hours: 0, percentage: 0 };
      }
      byCategory[entry.category].hours += entry.duration / 60;
    });

    // Calculate percentages
    Object.keys(byCategory).forEach(category => {
      byCategory[category].percentage = totalHours > 0 
        ? (byCategory[category].hours / totalHours) * 100 
        : 0;
    });

    // Calculate productivity metrics
    const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
    const averageHoursPerDay = totalHours / Math.max(1, days);

    // Find most productive day and hour (simplified)
    const mostProductiveDay = 'Monday'; // Mock data
    const mostProductiveHour = 10; // 10 AM
    const efficiency = Math.min(100, (billableHours / totalHours) * 100);

    return {
      period: { start: startDate, end: endDate },
      totalHours: Math.round(totalHours * 100) / 100,
      billableHours: Math.round(billableHours * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      byProject,
      byUser,
      byCategory,
      productivity: {
        averageHoursPerDay: Math.round(averageHoursPerDay * 100) / 100,
        mostProductiveDay,
        mostProductiveHour,
        efficiency: Math.round(efficiency * 100) / 100
      }
    };
  }

  // Helper methods
  private async getUserName(userId: string): Promise<string> {
    // In a real implementation, this would fetch from user service
    const userNames: { [key: string]: string } = {
      'user-1': 'Adrian Stanca',
      'user-2': 'Adrian ASC',
      'user-3': 'Adrian Developer'
    };
    return userNames[userId] || 'Unknown User';
  }

  private async getProjectName(projectId: string): Promise<string> {
    // In a real implementation, this would fetch from project service
    const projectNames: { [key: string]: string } = {
      'project-1': 'Canary Wharf Tower Renovation',
      'project-2': 'Manchester Shopping Center'
    };
    return projectNames[projectId] || 'Unknown Project';
  }

  private async getTaskName(taskId: string): Promise<string> {
    // In a real implementation, this would fetch from task service
    const taskNames: { [key: string]: string } = {
      'task-1': 'Install facade panels - Floor 15-20'
    };
    return taskNames[taskId] || 'Unknown Task';
  }

  // Format duration for display
  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins}m`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}m`;
    }
  }

  // Get time tracking statistics
  async getTimeStats(userId?: string, projectId?: string): Promise<{
    todayHours: number;
    weekHours: number;
    monthHours: number;
    isTimerRunning: boolean;
    averageDailyHours: number;
    totalBillableHours: number;
  }> {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay())).toISOString().split('T')[0];
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    const todayEntries = await this.getTimeEntries({
      userId,
      projectId,
      startDate: today,
      endDate: today
    });

    const weekEntries = await this.getTimeEntries({
      userId,
      projectId,
      startDate: weekStart
    });

    const monthEntries = await this.getTimeEntries({
      userId,
      projectId,
      startDate: monthStart
    });

    const todayHours = todayEntries.entries.reduce((sum, entry) => sum + entry.duration, 0) / 60;
    const weekHours = weekEntries.entries.reduce((sum, entry) => sum + entry.duration, 0) / 60;
    const monthHours = monthEntries.entries.reduce((sum, entry) => sum + entry.duration, 0) / 60;

    const isTimerRunning = userId ? this.runningTimers.has(userId) : false;
    const averageDailyHours = weekHours / 7;
    const totalBillableHours = monthEntries.entries
      .filter(entry => entry.billable)
      .reduce((sum, entry) => sum + entry.duration, 0) / 60;

    return {
      todayHours: Math.round(todayHours * 100) / 100,
      weekHours: Math.round(weekHours * 100) / 100,
      monthHours: Math.round(monthHours * 100) / 100,
      isTimerRunning,
      averageDailyHours: Math.round(averageDailyHours * 100) / 100,
      totalBillableHours: Math.round(totalBillableHours * 100) / 100
    };
  }
}

export const timeTrackingService = new TimeTrackingService();
export default timeTrackingService;
