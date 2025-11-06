/**
 * Critical Path Method (CPM) Algorithm
 * Calculates early start/finish, late start/finish, and identifies critical path
 */

export interface TaskNode {
  id: string;
  name: string;
  duration: number;
  predecessors: string[];
  successors: string[];
  earlyStart: number;
  earlyFinish: number;
  lateStart: number;
  lateFinish: number;
  totalFloat: number;
  isCritical: boolean;
}

/**
 * Calculate critical path for a set of tasks with dependencies
 */
export function calculateCriticalPath(
  tasks: Array<{
    id: string;
    name: string;
    duration: number;
    dependencies?: string[];
  }>
): TaskNode[] {
  const taskMap = new Map<string, TaskNode>();
  const taskIds = new Set<string>();

  // Initialize task map and identify all task IDs
  tasks.forEach(task => {
    taskIds.add(task.id);
    taskMap.set(task.id, {
      id: task.id,
      name: task.name,
      duration: task.duration,
      predecessors: task.dependencies || [],
      successors: [],
      earlyStart: 0,
      earlyFinish: 0,
      lateStart: 0,
      lateFinish: 0,
      totalFloat: 0,
      isCritical: false
    });
  });

  // Build predecessors and successors relationships
  taskMap.forEach(task => {
    task.predecessors.forEach(predecessorId => {
      const predecessor = taskMap.get(predecessorId);
      if (predecessor) {
        predecessor.successors.push(task.id);
      }
    });
  });

  // FORWARD PASS: Calculate Early Start and Early Finish
  const completedForward = new Set<string>();
  
  const calculateEarlyDates = (taskId: string): void => {
    if (completedForward.has(taskId)) return;
    
    const task = taskMap.get(taskId);
    if (!task) return;

    // If task has no predecessors, it starts at day 0
    if (task.predecessors.length === 0) {
      task.earlyStart = 0;
      task.earlyFinish = task.duration;
    } else {
      // Early Start = maximum Early Finish of all predecessors
      let maxEarlyFinish = 0;
      task.predecessors.forEach(predId => {
        calculateEarlyDates(predId);
        const predecessor = taskMap.get(predId);
        if (predecessor && predecessor.earlyFinish > maxEarlyFinish) {
          maxEarlyFinish = predecessor.earlyFinish;
        }
      });
      task.earlyStart = maxEarlyFinish;
      task.earlyFinish = task.earlyStart + task.duration;
    }

    completedForward.add(taskId);
  };

  // Calculate early dates for all tasks
  taskMap.forEach((_, taskId) => calculateEarlyDates(taskId));

  // Find project completion time (maximum early finish)
  const projectCompletion = Math.max(
    ...Array.from(taskMap.values()).map(t => t.earlyFinish)
  );

  // BACKWARD PASS: Calculate Late Start and Late Finish
  const completedBackward = new Set<string>();
  
  const calculateLateDates = (taskId: string): void => {
    if (completedBackward.has(taskId)) return;
    
    const task = taskMap.get(taskId);
    if (!task) return;

    // If task has no successors, it finishes at project completion
    if (task.successors.length === 0) {
      task.lateFinish = projectCompletion;
      task.lateStart = task.lateFinish - task.duration;
    } else {
      // Late Finish = minimum Late Start of all successors
      let minLateStart = Infinity;
      task.successors.forEach(succId => {
        calculateLateDates(succId);
        const successor = taskMap.get(succId);
        if (successor && successor.lateStart < minLateStart) {
          minLateStart = successor.lateStart;
        }
      });
      task.lateFinish = minLateStart;
      task.lateStart = task.lateFinish - task.duration;
    }

    completedBackward.add(taskId);
  };

  // Calculate late dates for all tasks
  taskMap.forEach((_, taskId) => calculateLateDates(taskId));

  // Calculate Total Float and identify critical path
  taskMap.forEach(task => {
    task.totalFloat = task.lateStart - task.earlyStart;
    task.isCritical = task.totalFloat === 0 || task.totalFloat < 0.001; // Account for floating point errors
  });

  return Array.from(taskMap.values());
}

/**
 * Calculate schedule compression options
 */
export function calculateCompressionOptions(
  criticalPathTasks: TaskNode[]
): Array<{
  taskId: string;
  taskName: string;
  currentDuration: number;
  reducedDuration: number;
  timeSaved: number;
  costImpact: number;
}> {
  // Simplified compression calculation
  // In production, implement proper cost-time tradeoff analysis
  return criticalPathTasks
    .filter(task => task.duration > 1)
    .map(task => ({
      taskId: task.id,
      taskName: task.name,
      currentDuration: task.duration,
      reducedDuration: Math.max(1, task.duration - 1),
      timeSaved: 1,
      costImpact: 0 // Would be calculated based on overtime/premium rates
    }));
}

/**
 * Identify tasks that can be fast-tracked (parallel execution)
 */
export function identifyFastTrackOpportunities(
  tasks: TaskNode[]
): Array<{
  task1: TaskNode;
  task2: TaskNode;
  timeSaved: number;
  riskLevel: 'low' | 'medium' | 'high';
}> {
  const opportunities: Array<{
    task1: TaskNode;
    task2: TaskNode;
    timeSaved: number;
    riskLevel: 'low' | 'medium' | 'high';
  }> = [];

  // Find tasks with finish-to-start dependencies that could be overlapped
  tasks.forEach(task1 => {
    task1.successors.forEach(succId => {
      const task2 = tasks.find(t => t.id === succId);
      if (task2 && task2.predecessors.includes(task1.id)) {
        // Currently a finish-to-start dependency
        const potentialTimeSaved = Math.min(task1.duration, task2.duration);
        
        opportunities.push({
          task1,
          task2,
          timeSaved: potentialTimeSaved,
          riskLevel: task1.isCritical && task2.isCritical ? 'high' : 'medium'
        });
      }
    });
  });

  return opportunities.sort((a, b) => b.timeSaved - a.timeSaved);
}

