export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string[]; // User IDs
  createdBy: string; // User ID
  dueDate: Date;
  startDate?: Date;
  completedDate?: Date;
  estimatedHours: number;
  actualHours: number;
  location?: string;
  dependencies?: string[]; // Task IDs
  attachments?: string[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
