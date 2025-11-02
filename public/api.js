// CortexBuild Demo API File
// This is a placeholder file for the developer console demo

// API Response interface (converted to JSDoc for JavaScript)
/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {*} data
 * @property {string} [message]
 */

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {'active'|'planning'|'completed'} status
 * @property {string} created_at
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} project_id
 * @property {string} title
 * @property {string} description
 * @property {'pending'|'in_progress'|'completed'} status
 * @property {'low'|'medium'|'high'} priority
 * @property {string} [assigned_to]
 * @property {string} [due_date]
 * @property {string} created_at
 */

// Demo API functions for the developer console
export const api = {
  // Projects
  async getProjects() {
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

  async getProject(id) {
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
  async getTasks(projectId) {
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

  async createTask(task) {
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
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

export const getStatusColor = (status) => {
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
