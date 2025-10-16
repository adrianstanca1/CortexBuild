import type { User } from '@/types/auth';
import type { Project } from '@/types/project';
import type { Task } from '@/types/task';
import type { Material } from '@/types/material';
import type { TimesheetEntry } from '@/types/timesheet';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'admin@example.com',
    name: 'John Admin',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'user-2',
    email: 'sarah.johnson@example.com',
    name: 'Sarah Johnson',
    role: 'project_manager',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'user-3',
    email: 'mike.williams@example.com',
    name: 'Mike Williams',
    role: 'project_manager',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: 'user-4',
    email: 'tom.brown@example.com',
    name: 'Tom Brown',
    role: 'foreman',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tom',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'user-5',
    email: 'lisa.davis@example.com',
    name: 'Lisa Davis',
    role: 'foreman',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
  },
  {
    id: 'user-6',
    email: 'john.smith@example.com',
    name: 'John Smith',
    role: 'worker',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15'),
  },
  {
    id: 'user-7',
    email: 'client@acme.com',
    name: 'Robert Client',
    role: 'client',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=robert',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
];

// Mock Projects
export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Downtown Office Complex',
    description: 'Modern 15-story office building with underground parking',
    status: 'in_progress',
    priority: 'high',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-12-20'),
    budget: 1200000,
    spent: 816000,
    progress: 68,
    location: '123 Main St, Downtown',
    clientId: 'user-7',
    projectManagerId: 'user-2',
    foremanId: 'user-4',
    teamMembers: ['user-2', 'user-4', 'user-6'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-10-04'),
  },
  {
    id: 'proj-2',
    name: 'Residential Tower A',
    description: '25-story luxury residential tower with amenities',
    status: 'planning',
    priority: 'medium',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2025-06-30'),
    budget: 850000,
    spent: 212500,
    progress: 25,
    location: '456 Park Ave',
    clientId: 'user-7',
    projectManagerId: 'user-2',
    teamMembers: ['user-2', 'user-5'],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-10-04'),
  },
  {
    id: 'proj-3',
    name: 'Shopping Mall Renovation',
    description: 'Complete renovation of existing shopping center',
    status: 'in_progress',
    priority: 'high',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-11-30'),
    budget: 2100000,
    spent: 1722000,
    progress: 82,
    location: '789 Commerce Blvd',
    clientId: 'user-7',
    projectManagerId: 'user-3',
    foremanId: 'user-5',
    teamMembers: ['user-3', 'user-5', 'user-6'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-10-04'),
  },
  {
    id: 'proj-4',
    name: 'Highway Bridge Construction',
    description: 'New 4-lane bridge with pedestrian walkways',
    status: 'in_progress',
    priority: 'urgent',
    startDate: new Date('2024-04-01'),
    endDate: new Date('2025-03-31'),
    budget: 3500000,
    spent: 1400000,
    progress: 40,
    location: 'Highway 101, Mile Marker 45',
    clientId: 'user-7',
    projectManagerId: 'user-2',
    foremanId: 'user-4',
    teamMembers: ['user-2', 'user-4', 'user-6'],
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-10-04'),
  },
  {
    id: 'proj-5',
    name: 'School Expansion',
    description: 'Adding new classrooms and gymnasium',
    status: 'completed',
    priority: 'medium',
    startDate: new Date('2023-09-01'),
    endDate: new Date('2024-08-31'),
    budget: 950000,
    spent: 942000,
    progress: 100,
    location: '321 Education Way',
    clientId: 'user-7',
    projectManagerId: 'user-3',
    foremanId: 'user-5',
    teamMembers: ['user-3', 'user-5'],
    createdAt: new Date('2023-08-01'),
    updatedAt: new Date('2024-09-01'),
  },
];

// Mock Tasks
export const mockTasks: Task[] = [
  {
    id: 'task-1',
    projectId: 'proj-1',
    title: 'Foundation inspection',
    description: 'Complete structural inspection of foundation',
    status: 'completed',
    priority: 'high',
    assignedTo: ['user-6'],
    createdBy: 'user-4',
    dueDate: new Date('2024-10-04'),
    completedDate: new Date('2024-10-04'),
    estimatedHours: 8,
    actualHours: 7.5,
    location: 'Floor B2',
    tags: ['inspection', 'foundation'],
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-10-04'),
  },
  {
    id: 'task-2',
    projectId: 'proj-1',
    title: 'Steel frame installation',
    description: 'Install steel frame structure for floors 10-12',
    status: 'in_progress',
    priority: 'high',
    assignedTo: ['user-6'],
    createdBy: 'user-4',
    dueDate: new Date('2024-10-10'),
    startDate: new Date('2024-10-04'),
    estimatedHours: 40,
    actualHours: 16,
    location: 'Floors 10-12',
    tags: ['structural', 'steel'],
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-10-04'),
  },
  {
    id: 'task-3',
    projectId: 'proj-1',
    title: 'Electrical rough-in',
    description: 'Install electrical conduits and boxes',
    status: 'pending',
    priority: 'medium',
    assignedTo: ['user-6'],
    createdBy: 'user-4',
    dueDate: new Date('2024-10-15'),
    estimatedHours: 24,
    actualHours: 0,
    location: 'Floor 3',
    tags: ['electrical', 'rough-in'],
    createdAt: new Date('2024-10-02'),
    updatedAt: new Date('2024-10-02'),
  },
  {
    id: 'task-4',
    projectId: 'proj-3',
    title: 'HVAC system installation',
    description: 'Install main HVAC units on roof',
    status: 'in_progress',
    priority: 'high',
    assignedTo: ['user-6'],
    createdBy: 'user-5',
    dueDate: new Date('2024-10-08'),
    startDate: new Date('2024-10-01'),
    estimatedHours: 32,
    actualHours: 24,
    location: 'Roof',
    tags: ['hvac', 'mechanical'],
    createdAt: new Date('2024-09-28'),
    updatedAt: new Date('2024-10-04'),
  },
];

// Mock Materials
export const mockMaterials: Material[] = [
  {
    id: 'mat-1',
    name: 'Concrete Mix',
    description: 'High-strength concrete mix for structural elements',
    category: 'Concrete',
    unit: 'ton',
    quantity: 150,
    minQuantity: 50,
    unitPrice: 120,
    totalValue: 18000,
    supplier: 'BuildMart Supplies',
    location: 'Warehouse A',
    status: 'in_stock',
    lastRestocked: new Date('2024-09-15'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-09-15'),
  },
  {
    id: 'mat-2',
    name: 'Steel Rebar',
    description: 'Grade 60 reinforcement steel bars',
    category: 'Steel',
    unit: 'ton',
    quantity: 25,
    minQuantity: 30,
    unitPrice: 800,
    totalValue: 20000,
    supplier: 'Steel Solutions Inc',
    location: 'Yard B',
    status: 'low_stock',
    lastRestocked: new Date('2024-08-20'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-08-20'),
  },
  {
    id: 'mat-3',
    name: 'Lumber 2x4',
    description: 'Kiln-dried lumber for framing',
    category: 'Lumber',
    unit: 'piece',
    quantity: 500,
    minQuantity: 200,
    unitPrice: 8,
    totalValue: 4000,
    supplier: 'Wood Works Co',
    location: 'Warehouse B',
    status: 'in_stock',
    lastRestocked: new Date('2024-09-25'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-09-25'),
  },
  {
    id: 'mat-4',
    name: 'Drywall Panels',
    description: '4x8 ft standard drywall sheets',
    category: 'Drywall',
    unit: 'piece',
    quantity: 0,
    minQuantity: 100,
    unitPrice: 12,
    totalValue: 0,
    supplier: 'Drywall Direct',
    location: 'Warehouse C',
    status: 'out_of_stock',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-09-30'),
  },
];

// Mock Timesheet Entries
export const mockTimesheetEntries: TimesheetEntry[] = [
  {
    id: 'time-1',
    userId: 'user-6',
    projectId: 'proj-1',
    taskId: 'task-1',
    date: new Date('2024-10-04'),
    startTime: '08:00',
    endTime: '16:30',
    hours: 7.5,
    breakHours: 1,
    overtimeHours: 0,
    description: 'Foundation inspection and documentation',
    status: 'approved',
    approvedBy: 'user-4',
    approvedAt: new Date('2024-10-04'),
    createdAt: new Date('2024-10-04'),
    updatedAt: new Date('2024-10-04'),
  },
  {
    id: 'time-2',
    userId: 'user-6',
    projectId: 'proj-1',
    taskId: 'task-2',
    date: new Date('2024-10-03'),
    startTime: '08:00',
    endTime: '17:00',
    hours: 8,
    breakHours: 1,
    overtimeHours: 0,
    description: 'Steel frame installation on floor 10',
    status: 'submitted',
    createdAt: new Date('2024-10-03'),
    updatedAt: new Date('2024-10-03'),
  },
];

// Helper functions to get data
export const getProjectById = (id: string): Project | undefined => {
  return mockProjects.find(p => p.id === id);
};

export const getTasksByProjectId = (projectId: string): Task[] => {
  return mockTasks.filter(t => t.projectId === projectId);
};

export const getTasksByUserId = (userId: string): Task[] => {
  return mockTasks.filter(t => t.assignedTo.includes(userId));
};

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(u => u.id === id);
};

export const getProjectsByManagerId = (managerId: string): Project[] => {
  return mockProjects.filter(p => p.projectManagerId === managerId);
};

export const getMaterialsByStatus = (status: Material['status']): Material[] => {
  return mockMaterials.filter(m => m.status === status);
};

export const getTimesheetsByUserId = (userId: string): TimesheetEntry[] => {
  return mockTimesheetEntries.filter(t => t.userId === userId);
};
