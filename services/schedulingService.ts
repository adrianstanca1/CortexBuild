// CortexBuild Advanced Project Scheduling Service
import { Project, Task, User } from '../types';

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description: string;
  targetDate: string;
  actualDate?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  dependencies: string[]; // Task IDs that must be completed
  criticalPath: boolean;
  progress: number;
  assignedToId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSchedule {
  id: string;
  projectId: string;
  name: string;
  startDate: string;
  endDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  phases: SchedulePhase[];
  milestones: Milestone[];
  criticalPath: string[]; // Task IDs on critical path
  totalDuration: number; // in days
  bufferTime: number; // in days
  riskLevel: 'low' | 'medium' | 'high';
  lastUpdated: string;
}

export interface SchedulePhase {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  duration: number;
  tasks: string[]; // Task IDs
  dependencies: string[]; // Phase IDs
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  progress: number;
  budget: number;
  actualCost: number;
}

export interface ResourceAllocation {
  resourceId: string;
  resourceName: string;
  resourceType: 'human' | 'equipment' | 'material';
  taskId: string;
  startDate: string;
  endDate: string;
  allocation: number; // percentage 0-100
  cost: number;
  availability: number; // percentage 0-100
}

export interface ScheduleConflict {
  id: string;
  type: 'resource' | 'dependency' | 'deadline' | 'budget';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedTasks: string[];
  suggestedResolution: string;
  impact: {
    timeline: number; // days
    budget: number;
    quality: string;
  };
}

export interface ScheduleOptimization {
  originalDuration: number;
  optimizedDuration: number;
  timeSaved: number;
  costImpact: number;
  riskImpact: string;
  recommendations: {
    action: string;
    impact: string;
    effort: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}

class SchedulingService {
  private schedules: ProjectSchedule[] = [];
  private milestones: Milestone[] = [];
  private resourceAllocations: ResourceAllocation[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    const now = new Date();
    const projectStart = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Start in 1 week
    const projectEnd = new Date(projectStart.getTime() + 180 * 24 * 60 * 60 * 1000); // 6 months duration

    // Initialize mock milestones
    this.milestones = [
      {
        id: 'milestone-1',
        projectId: 'project-1',
        name: 'Foundation Complete',
        description: 'All foundation work completed and inspected',
        targetDate: new Date(projectStart.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        dependencies: ['task-foundation-1', 'task-foundation-2'],
        criticalPath: true,
        progress: 0,
        assignedToId: 'user-2',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      },
      {
        id: 'milestone-2',
        projectId: 'project-1',
        name: 'Structural Framework',
        description: 'Main structural framework erected',
        targetDate: new Date(projectStart.getTime() + 75 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        dependencies: ['milestone-1', 'task-structure-1'],
        criticalPath: true,
        progress: 0,
        assignedToId: 'user-2',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      },
      {
        id: 'milestone-3',
        projectId: 'project-1',
        name: 'Facade Installation',
        description: 'Exterior facade installation completed',
        targetDate: new Date(projectStart.getTime() + 120 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        dependencies: ['milestone-2', 'task-1'],
        criticalPath: true,
        progress: 0,
        assignedToId: 'user-2',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      }
    ];

    // Initialize mock schedule
    this.schedules = [
      {
        id: 'schedule-1',
        projectId: 'project-1',
        name: 'Canary Wharf Tower Renovation Schedule',
        startDate: projectStart.toISOString(),
        endDate: projectEnd.toISOString(),
        phases: [
          {
            id: 'phase-1',
            name: 'Pre-Construction',
            description: 'Planning, permits, and site preparation',
            startDate: projectStart.toISOString(),
            endDate: new Date(projectStart.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            duration: 14,
            tasks: ['task-planning-1', 'task-permits-1'],
            dependencies: [],
            status: 'not-started',
            progress: 0,
            budget: 50000,
            actualCost: 0
          },
          {
            id: 'phase-2',
            name: 'Foundation Work',
            description: 'Foundation excavation and construction',
            startDate: new Date(projectStart.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(projectStart.getTime() + 44 * 24 * 60 * 60 * 1000).toISOString(),
            duration: 30,
            tasks: ['task-foundation-1', 'task-foundation-2'],
            dependencies: ['phase-1'],
            status: 'not-started',
            progress: 0,
            budget: 200000,
            actualCost: 0
          },
          {
            id: 'phase-3',
            name: 'Structural Work',
            description: 'Main structural framework construction',
            startDate: new Date(projectStart.getTime() + 44 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(projectStart.getTime() + 89 * 24 * 60 * 60 * 1000).toISOString(),
            duration: 45,
            tasks: ['task-structure-1', 'task-structure-2'],
            dependencies: ['phase-2'],
            status: 'not-started',
            progress: 0,
            budget: 500000,
            actualCost: 0
          },
          {
            id: 'phase-4',
            name: 'Facade Installation',
            description: 'Exterior facade and cladding installation',
            startDate: new Date(projectStart.getTime() + 89 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(projectStart.getTime() + 134 * 24 * 60 * 60 * 1000).toISOString(),
            duration: 45,
            tasks: ['task-1', 'task-facade-2'],
            dependencies: ['phase-3'],
            status: 'not-started',
            progress: 0,
            budget: 300000,
            actualCost: 0
          }
        ],
        milestones: this.milestones.filter(m => m.projectId === 'project-1'),
        criticalPath: ['phase-1', 'phase-2', 'phase-3', 'phase-4'],
        totalDuration: 180,
        bufferTime: 14,
        riskLevel: 'medium',
        lastUpdated: now.toISOString()
      }
    ];

    // Initialize mock resource allocations
    this.resourceAllocations = [
      {
        resourceId: 'user-2',
        resourceName: 'Adrian ASC',
        resourceType: 'human',
        taskId: 'task-1',
        startDate: new Date(projectStart.getTime() + 89 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(projectStart.getTime() + 134 * 24 * 60 * 60 * 1000).toISOString(),
        allocation: 80,
        cost: 95 * 8 * 45, // hourly rate * hours per day * days
        availability: 85
      }
    ];
  }

  // Get project schedule
  async getProjectSchedule(projectId: string): Promise<ProjectSchedule | null> {
    return this.schedules.find(s => s.projectId === projectId) || null;
  }

  // Create new project schedule
  async createProjectSchedule(
    projectId: string,
    scheduleData: Omit<ProjectSchedule, 'id' | 'projectId' | 'lastUpdated'>
  ): Promise<ProjectSchedule> {
    const newSchedule: ProjectSchedule = {
      ...scheduleData,
      id: `schedule-${Date.now()}`,
      projectId,
      lastUpdated: new Date().toISOString()
    };

    this.schedules.push(newSchedule);
    return newSchedule;
  }

  // Update project schedule
  async updateProjectSchedule(
    scheduleId: string,
    updates: Partial<ProjectSchedule>
  ): Promise<ProjectSchedule | null> {
    const index = this.schedules.findIndex(s => s.id === scheduleId);
    if (index === -1) return null;

    this.schedules[index] = {
      ...this.schedules[index],
      ...updates,
      lastUpdated: new Date().toISOString()
    };

    return this.schedules[index];
  }

  // Calculate critical path
  async calculateCriticalPath(projectId: string): Promise<{
    path: string[];
    duration: number;
    tasks: Task[];
  }> {
    const schedule = await this.getProjectSchedule(projectId);
    if (!schedule) throw new Error('Schedule not found');

    // Simplified critical path calculation
    const criticalTasks = schedule.phases.filter(phase => 
      schedule.criticalPath.includes(phase.id)
    );

    const totalDuration = criticalTasks.reduce((sum, phase) => sum + phase.duration, 0);

    return {
      path: schedule.criticalPath,
      duration: totalDuration,
      tasks: [] // Would fetch actual tasks from task service
    };
  }

  // Detect schedule conflicts
  async detectScheduleConflicts(projectId: string): Promise<ScheduleConflict[]> {
    const schedule = await this.getProjectSchedule(projectId);
    if (!schedule) return [];

    const conflicts: ScheduleConflict[] = [];

    // Check for resource conflicts
    const resourceConflicts = this.detectResourceConflicts(projectId);
    conflicts.push(...resourceConflicts);

    // Check for dependency conflicts
    const dependencyConflicts = this.detectDependencyConflicts(schedule);
    conflicts.push(...dependencyConflicts);

    // Check for deadline conflicts
    const deadlineConflicts = this.detectDeadlineConflicts(schedule);
    conflicts.push(...deadlineConflicts);

    return conflicts;
  }

  // Optimize project schedule
  async optimizeSchedule(projectId: string, objectives: {
    prioritizeTime: boolean;
    prioritizeCost: boolean;
    prioritizeQuality: boolean;
    maxBudgetIncrease: number;
    maxRiskIncrease: string;
  }): Promise<ScheduleOptimization> {
    const schedule = await this.getProjectSchedule(projectId);
    if (!schedule) throw new Error('Schedule not found');

    const originalDuration = schedule.totalDuration;
    
    // Simplified optimization algorithm
    let optimizedDuration = originalDuration;
    let costImpact = 0;
    const recommendations = [];

    if (objectives.prioritizeTime) {
      // Fast-track critical path activities
      optimizedDuration = Math.max(originalDuration * 0.85, originalDuration - 30);
      costImpact += originalDuration * 0.15 * 1000; // Estimated cost increase
      
      recommendations.push({
        action: 'Fast-track critical path activities',
        impact: 'Reduce project duration by 15%',
        effort: 'High - Requires additional resources',
        priority: 'high' as const
      });
    }

    if (objectives.prioritizeCost && costImpact > objectives.maxBudgetIncrease) {
      // Adjust recommendations to stay within budget
      optimizedDuration = originalDuration * 0.95;
      costImpact = objectives.maxBudgetIncrease * 0.8;
      
      recommendations.push({
        action: 'Optimize resource allocation',
        impact: 'Reduce costs while maintaining timeline',
        effort: 'Medium - Requires schedule adjustments',
        priority: 'medium' as const
      });
    }

    return {
      originalDuration,
      optimizedDuration,
      timeSaved: originalDuration - optimizedDuration,
      costImpact,
      riskImpact: objectives.prioritizeTime ? 'Medium increase' : 'Low increase',
      recommendations
    };
  }

  // Get resource allocation for project
  async getResourceAllocation(projectId: string): Promise<ResourceAllocation[]> {
    return this.resourceAllocations.filter(ra => {
      // In a real implementation, we'd join with tasks to get project ID
      return true; // Mock: return all allocations
    });
  }

  // Update resource allocation
  async updateResourceAllocation(
    allocationId: string,
    updates: Partial<ResourceAllocation>
  ): Promise<ResourceAllocation | null> {
    const index = this.resourceAllocations.findIndex(ra => ra.resourceId === allocationId);
    if (index === -1) return null;

    this.resourceAllocations[index] = {
      ...this.resourceAllocations[index],
      ...updates
    };

    return this.resourceAllocations[index];
  }

  // Get project milestones
  async getProjectMilestones(projectId: string): Promise<Milestone[]> {
    return this.milestones.filter(m => m.projectId === projectId);
  }

  // Create milestone
  async createMilestone(milestone: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>): Promise<Milestone> {
    const now = new Date().toISOString();
    const newMilestone: Milestone = {
      ...milestone,
      id: `milestone-${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };

    this.milestones.push(newMilestone);
    return newMilestone;
  }

  // Update milestone
  async updateMilestone(id: string, updates: Partial<Milestone>): Promise<Milestone | null> {
    const index = this.milestones.findIndex(m => m.id === id);
    if (index === -1) return null;

    this.milestones[index] = {
      ...this.milestones[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.milestones[index];
  }

  // Generate Gantt chart data
  async generateGanttData(projectId: string): Promise<{
    tasks: {
      id: string;
      name: string;
      start: string;
      end: string;
      duration: number;
      progress: number;
      dependencies: string[];
      type: 'task' | 'milestone' | 'phase';
      critical: boolean;
    }[];
    timeline: {
      start: string;
      end: string;
      totalDuration: number;
    };
  }> {
    const schedule = await this.getProjectSchedule(projectId);
    if (!schedule) throw new Error('Schedule not found');

    const tasks = [
      // Add phases as tasks
      ...schedule.phases.map(phase => ({
        id: phase.id,
        name: phase.name,
        start: phase.startDate,
        end: phase.endDate,
        duration: phase.duration,
        progress: phase.progress,
        dependencies: phase.dependencies,
        type: 'phase' as const,
        critical: schedule.criticalPath.includes(phase.id)
      })),
      // Add milestones
      ...schedule.milestones.map(milestone => ({
        id: milestone.id,
        name: milestone.name,
        start: milestone.targetDate,
        end: milestone.targetDate,
        duration: 0,
        progress: milestone.progress,
        dependencies: milestone.dependencies,
        type: 'milestone' as const,
        critical: milestone.criticalPath
      }))
    ];

    return {
      tasks,
      timeline: {
        start: schedule.startDate,
        end: schedule.endDate,
        totalDuration: schedule.totalDuration
      }
    };
  }

  // Private helper methods
  private detectResourceConflicts(projectId: string): ScheduleConflict[] {
    // Simplified resource conflict detection
    return [
      {
        id: 'conflict-1',
        type: 'resource',
        severity: 'medium',
        description: 'Adrian ASC is overallocated during facade installation phase',
        affectedTasks: ['task-1', 'task-facade-2'],
        suggestedResolution: 'Hire additional skilled worker or extend timeline',
        impact: {
          timeline: 5,
          budget: 5000,
          quality: 'No impact'
        }
      }
    ];
  }

  private detectDependencyConflicts(schedule: ProjectSchedule): ScheduleConflict[] {
    // Simplified dependency conflict detection
    return [];
  }

  private detectDeadlineConflicts(schedule: ProjectSchedule): ScheduleConflict[] {
    // Check if any milestones are at risk
    const conflicts: ScheduleConflict[] = [];
    
    schedule.milestones.forEach(milestone => {
      const targetDate = new Date(milestone.targetDate);
      const now = new Date();
      const daysUntilDeadline = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDeadline < 30 && milestone.progress < 50) {
        conflicts.push({
          id: `deadline-conflict-${milestone.id}`,
          type: 'deadline',
          severity: 'high',
          description: `Milestone "${milestone.name}" is at risk of missing deadline`,
          affectedTasks: milestone.dependencies,
          suggestedResolution: 'Accelerate dependent tasks or adjust milestone date',
          impact: {
            timeline: daysUntilDeadline,
            budget: 0,
            quality: 'Potential impact if rushed'
          }
        });
      }
    });

    return conflicts;
  }
}

export const schedulingService = new SchedulingService();
export default schedulingService;
