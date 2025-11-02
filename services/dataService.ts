// CortexBuild Data Service - Comprehensive data management
import { Project, Task, RFI, User, Company, DailyLog, Photo, Document, TimeEntry } from '../types';

// Mock data store for development
class DataStore {
  private projects: Project[] = [];
  private tasks: Task[] = [];
  private rfis: RFI[] = [];
  private users: User[] = [];
  private companies: Company[] = [];
  private dailyLogs: DailyLog[] = [];
  private photos: Photo[] = [];
  private documents: Document[] = [];
  private timeEntries: TimeEntry[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize with sample data
    this.companies = [
      {
        id: 'company-1',
        name: 'CortexBuild Inc.',
        logo: '/logos/cortexbuild.png',
        address: '123 Tech Street, San Francisco, CA',
        phone: '+1 (555) 123-4567',
        email: 'contact@cortexbuild.com',
        website: 'https://cortexbuild.com',
        industry: 'Construction Technology',
        size: 'Enterprise',
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'company-2',
        name: 'ASC Cladding Ltd',
        logo: '/logos/asc.png',
        address: '456 Construction Ave, London, UK',
        phone: '+44 20 1234 5678',
        email: 'info@ascladdingltd.co.uk',
        website: 'https://ascladdingltd.co.uk',
        industry: 'Construction',
        size: 'Medium',
        createdAt: '2024-01-15T00:00:00Z'
      }
    ];

    this.users = [
      {
        id: 'user-1',
        email: 'adrian.stanca1@gmail.com',
        name: 'Adrian Stanca',
        role: 'super_admin',
        avatar: '/avatars/adrian-admin.jpg',
        companyId: 'company-1',
        permissions: ['*'],
        createdAt: '2024-01-01T00:00:00Z',
        lastLogin: new Date().toISOString()
      },
      {
        id: 'user-2',
        email: 'adrian@ascladdingltd.co.uk',
        name: 'Adrian ASC',
        role: 'company_admin',
        avatar: '/avatars/adrian-company.jpg',
        companyId: 'company-2',
        permissions: ['company:*', 'project:*', 'user:manage'],
        createdAt: '2024-01-15T00:00:00Z',
        lastLogin: new Date().toISOString()
      },
      {
        id: 'user-3',
        email: 'adrian.stanca1@icloud.com',
        name: 'Adrian Developer',
        role: 'developer',
        avatar: '/avatars/adrian-dev.jpg',
        companyId: 'company-2',
        permissions: ['project:read', 'task:*', 'rfi:read'],
        createdAt: '2024-01-20T00:00:00Z',
        lastLogin: new Date().toISOString()
      }
    ];

    this.projects = [
      {
        id: 'project-1',
        companyId: 'company-2',
        name: 'Canary Wharf Tower Renovation',
        location: 'London, UK',
        image: '/projects/canary-wharf.jpg',
        description: 'Complete renovation of 40-story office tower including facade upgrade and interior modernization.',
        contacts: [
          { role: 'Project Manager', name: 'Sarah Johnson' },
          { role: 'Site Foreman', name: 'Mike Thompson' },
          { role: 'Safety Officer', name: 'Emma Wilson' }
        ],
        snapshot: {
          openRFIs: 12,
          overdueTasks: 3,
          pendingTMTickets: 5,
          aiRiskLevel: 'Medium'
        },
        status: 'In Progress',
        startDate: '2024-02-01',
        endDate: '2024-12-31',
        budget: 15000000,
        spent: 8500000,
        projectManagerId: 'user-2',
        createdAt: '2024-01-25T00:00:00Z',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'project-2',
        companyId: 'company-2',
        name: 'Manchester Shopping Center',
        location: 'Manchester, UK',
        image: '/projects/manchester-center.jpg',
        description: 'New construction of 3-story shopping center with underground parking.',
        contacts: [
          { role: 'Project Manager', name: 'David Brown' },
          { role: 'Site Foreman', name: 'Lisa Garcia' }
        ],
        snapshot: {
          openRFIs: 8,
          overdueTasks: 1,
          pendingTMTickets: 2,
          aiRiskLevel: 'Low'
        },
        status: 'Planning',
        startDate: '2024-06-01',
        endDate: '2025-03-31',
        budget: 8500000,
        spent: 1200000,
        projectManagerId: 'user-2',
        createdAt: '2024-02-10T00:00:00Z',
        updatedAt: new Date().toISOString()
      }
    ];

    this.tasks = [
      {
        id: 'task-1',
        projectId: 'project-1',
        title: 'Install facade panels - Floor 15-20',
        description: 'Complete installation of aluminum composite panels on floors 15-20 of the east facade.',
        status: 'In Progress',
        priority: 'High',
        assignedTo: 'Mike Thompson',
        assignedToId: 'user-foreman-1',
        dueDate: '2024-11-15',
        createdBy: 'Sarah Johnson',
        createdById: 'user-2',
        createdAt: '2024-10-01T00:00:00Z',
        updatedAt: new Date().toISOString(),
        tags: ['facade', 'installation', 'critical-path'],
        progress: 65,
        estimatedHours: 120,
        actualHours: 78,
        location: 'East Facade, Floors 15-20',
        comments: [
          {
            id: 'comment-1',
            author: 'Mike Thompson',
            timestamp: '2024-10-14T10:30:00Z',
            text: 'Weather conditions are good. Making excellent progress on floor 17.',
            attachments: []
          }
        ],
        history: [
          {
            timestamp: '2024-10-01T09:00:00Z',
            author: 'Sarah Johnson',
            change: 'Task created and assigned to Mike Thompson'
          },
          {
            timestamp: '2024-10-05T14:20:00Z',
            author: 'Mike Thompson',
            change: 'Started work on floor 15'
          }
        ]
      }
    ];

    this.rfis = [
      {
        id: 'rfi-1',
        projectId: 'project-1',
        title: 'Clarification on Window Frame Specifications',
        description: 'Need clarification on the thermal break specifications for window frames on floors 25-30.',
        status: 'Open',
        priority: 'Medium',
        submittedBy: 'Mike Thompson',
        submittedById: 'user-foreman-1',
        submittedDate: '2024-10-10',
        dueDate: '2024-10-20',
        category: 'Technical',
        location: 'Floors 25-30, North Facade',
        attachments: [
          {
            id: 'att-1',
            name: 'window-frame-detail.pdf',
            url: '/attachments/window-frame-detail.pdf',
            type: 'application/pdf',
            size: 2048576
          }
        ],
        responses: [],
        createdAt: '2024-10-10T00:00:00Z',
        updatedAt: '2024-10-10T00:00:00Z'
      }
    ];
  }

  // Project methods
  async getProjects(companyId?: string): Promise<Project[]> {
    if (companyId) {
      return this.projects.filter(p => p.companyId === companyId);
    }
    return this.projects;
  }

  async getProject(id: string): Promise<Project | null> {
    return this.projects.find(p => p.id === id) || null;
  }

  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const newProject: Project = {
      ...project,
      id: `project-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.projects.push(newProject);
    return newProject;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    this.projects[index] = {
      ...this.projects[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.projects[index];
  }

  // Task methods
  async getTasks(projectId?: string): Promise<Task[]> {
    if (projectId) {
      return this.tasks.filter(t => t.projectId === projectId);
    }
    return this.tasks;
  }

  async getTask(id: string): Promise<Task | null> {
    return this.tasks.find(t => t.id === id) || null;
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      history: [{
        timestamp: new Date().toISOString(),
        author: task.createdBy,
        change: 'Task created'
      }]
    };
    this.tasks.push(newTask);
    return newTask;
  }

  // RFI methods
  async getRFIs(projectId?: string): Promise<RFI[]> {
    if (projectId) {
      return this.rfis.filter(r => r.projectId === projectId);
    }
    return this.rfis;
  }

  async getRFI(id: string): Promise<RFI | null> {
    return this.rfis.find(r => r.id === id) || null;
  }

  // User methods
  async getUsers(companyId?: string): Promise<User[]> {
    if (companyId) {
      return this.users.filter(u => u.companyId === companyId);
    }
    return this.users;
  }

  async getUser(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  // Company methods
  async getCompanies(): Promise<Company[]> {
    return this.companies;
  }

  async getCompany(id: string): Promise<Company | null> {
    return this.companies.find(c => c.id === id) || null;
  }
}

// Export singleton instance
export const dataService = new DataStore();
export default dataService;
