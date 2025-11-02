// CortexBuild Demo API File
// This is a placeholder file for the developer console demo

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'planning' | 'completed';
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assigned_to?: string;
  due_date?: string;
  created_at: string;
}

// Demo API functions for the developer console
export const api = {
  // Projects
  async getProjects(): Promise<ApiResponse<Project[]>> {
    return {
      success: true,
      data: [
        {
          id: '1',
          name: 'Office Renovation',
          description: 'Complete office space renovation project',
          status: 'active',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Warehouse Construction',
          description: 'New warehouse facility construction',
          status: 'planning',
          created_at: new Date().toISOString()
        }
      ]
    };
  },

  async getProject(id: string): Promise<ApiResponse<Project>> {
    return {
      success: true,
      data: {
        id,
        name: 'Demo Project',
        description: 'This is a demo project for the developer console',
        status: 'active',
        created_at: new Date().toISOString()
      }
    };
  },

  // Tasks
  async getTasks(projectId?: string): Promise<ApiResponse<Task[]>> {
    return {
      success: true,
      data: [
        {
          id: '1',
          project_id: projectId || '1',
          title: 'Site Survey',
          description: 'Conduct initial site survey and assessment',
          status: 'completed',
          priority: 'high',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          project_id: projectId || '1',
          title: 'Design Phase',
          description: 'Create architectural designs and blueprints',
          status: 'in_progress',
          priority: 'high',
          created_at: new Date().toISOString()
        }
      ]
    };
  },

  async createTask(task: Omit<Task, 'id' | 'created_at'>): Promise<ApiResponse<Task>> {
    return {
      success: true,
      data: {
        ...task,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      }
    };
  }
};

// Utility functions
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString();
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
    case 'in_progress':
      return 'text-blue-600';
    case 'completed':
      return 'text-green-600';
    case 'planning':
    case 'pending':
      return 'text-yellow-600';
    default:
      return 'text-gray-600';
  }
};

// Export default for ES6 imports
export default api;

console.log('CortexBuild Demo API loaded successfully');
