export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';

export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: Date;
  endDate: Date;
  budget: number;
  spent: number;
  progress: number;
  location: string;
  clientId: string;
  projectManagerId: string;
  foremanId?: string;
  teamMembers: string[]; // User IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectPhase {
  id: string;
  projectId: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
  startDate: Date;
  endDate: Date;
  order: number;
}

export interface ProjectUpdate {
  id: string;
  projectId: string;
  title: string;
  description: string;
  createdBy: string; // User ID
  createdAt: Date;
  attachments?: string[];
}
