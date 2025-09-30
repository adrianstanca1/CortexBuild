import { 
  User, 
  Company, 
  LoginCredentials, 
  RegisterCredentials, 
  SocialProvider, 
  SocialAuthRequest, 
  AuthSuccessPayload,
  CompanyAccessSummary,
  SwitchCompanyResponse,
  TenantDirectoryContext,
  Permission,
  Role 
} from '../types';

// Simple storage for tracking registered emails
const registeredEmails = new Set<string>();

// Simple delay function for simulating API calls
const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

// Helper type for backward compatibility - allows string IDs or options object
type MaybeOptions = string | { signal?: AbortSignal } | undefined;

// Mock data for testing
const mockCompany: Company = {
  id: '1',
  name: 'Demo Construction Co',
  type: 'GENERAL_CONTRACTOR',
  address: {
    street: '123 Main St',
    city: 'Demo City',
    state: 'Demo State',
    zipCode: '12345',
    country: 'United States'
  },
  phone: '555-0123',
  email: 'info@democonstruction.com',
  website: 'https://democonstruction.com',
  licenseNumber: 'LIC123456',
  insuranceInfo: {
    provider: 'Demo Insurance',
    policyNumber: 'POL123456',
    expiryDate: '2025-12-31'
  },
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  settings: {
    timeZone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    theme: 'light',
    accessibility: { highContrast: false },
    features: {
      projectManagement: true,
      reporting: true,
      timeTracking: true,
      financials: true,
      documents: true,
      safety: true,
      equipment: true
    },
    workingHours: {
      start: '08:00',
      end: '17:00',
      workDays: [1, 2, 3, 4, 5]
    }
  },
  plan: 'FREE',
  status: 'Active',
  storageUsageGB: 0
};

const createMockUser = (email: string, firstName = 'Demo', lastName = 'User'): User => ({
  id: Date.now().toString(),
  firstName,
  lastName,
  email,
  role: Role.OWNER,
  permissions: [Permission.VIEW_DASHBOARD, Permission.EDIT_PROJECTS],
  companyId: mockCompany.id,
  isActive: true,
  isEmailVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  preferences: {
    theme: 'light',
    language: 'en',
    notifications: {},
    dashboard: {}
  }
});

// Auth API functions
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthSuccessPayload> => {
    await delay();
    
    // Simple validation
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    // For demo purposes, accept any email/password combo
    const user = createMockUser(credentials.email);
    
    return {
      success: true,
      user,
      company: mockCompany,
      availableCompanies: [{ id: mockCompany.id, name: mockCompany.name, role: Role.OWNER }],
      activeCompanyId: mockCompany.id,
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token',
      mfaRequired: false
    };
  },

  register: async (credentials: Partial<RegisterCredentials>): Promise<AuthSuccessPayload> => {
    await delay();
    
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    if (registeredEmails.has(credentials.email)) {
      throw new Error('Email already exists');
    }

    registeredEmails.add(credentials.email);
    
    const user = createMockUser(
      credentials.email,
      credentials.firstName,
      credentials.lastName
    );
    
    return {
      success: true,
      user,
      company: mockCompany,
      availableCompanies: [{ id: mockCompany.id, name: mockCompany.name, status: 'Active', role: Role.OWNER }],
      activeCompanyId: mockCompany.id,
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token'
    };
  },

  socialLogin: async (provider: SocialProvider, profile: SocialAuthRequest): Promise<AuthSuccessPayload> => {
    await delay();
    
    if (!profile.email) {
      throw new Error('Email is required for social login');
    }

    const user = createMockUser(
      profile.email,
      profile.firstName,
      profile.lastName
    );
    
    return {
      success: true,
      user,
      company: mockCompany,
      availableCompanies: [{ id: mockCompany.id, name: mockCompany.name, status: 'Active', role: Role.OWNER }],
      activeCompanyId: mockCompany.id,
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token'
    };
  },

  verifyMfaAndFinalize: async (userId: string, code: string): Promise<AuthSuccessPayload> => {
    await delay();
    
    if (code !== '123456') {
      throw new Error('Invalid MFA code');
    }

    const user = createMockUser('demo@example.com');
    
    return {
      success: true,
      user,
      company: mockCompany,
      availableCompanies: [{ id: mockCompany.id, name: mockCompany.name, role: Role.OWNER }],
      activeCompanyId: mockCompany.id,
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token',
      mfaRequired: false
    };
  },

  updateUserProfile: async (userId: string, updates: Partial<User>): Promise<User> => {
    await delay();
    
    const user = createMockUser('demo@example.com');
    return { ...user, ...updates };
  },

  requestPasswordReset: async (email: string): Promise<void> => {
    await delay();
    // Mock password reset request
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await delay();
    // Mock password reset
  },

  refreshToken: async (refreshToken: string): Promise<{ token: string; refreshToken?: string }> => {
    await delay();
    
    return {
      token: 'new-mock-jwt-token',
      refreshToken: 'new-mock-refresh-token'
    };
  },

  getCurrentUser: async (): Promise<User> => {
    await delay();
    
    return createMockUser('demo@example.com');
  },

  listTenants: async (): Promise<TenantDirectoryContext> => {
    await delay();
    
    return {
      companies: [{ id: mockCompany.id, name: mockCompany.name, role: Role.OWNER }],
      activeCompanyId: mockCompany.id,
      activeCompany: mockCompany
    };
  },

  switchCompany: async (companyId: string): Promise<SwitchCompanyResponse> => {
    await delay();
    
    const user = createMockUser('demo@example.com');
    
    return {
      user,
      company: mockCompany,
      availableCompanies: [{ id: mockCompany.id, name: mockCompany.name, role: Role.OWNER }],
      activeCompanyId: companyId
    };
  }
};

// Simple API object for compatibility
export const api = {
  // Project Templates
  getProjectTemplates: async (companyId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return [];
  },

  createProjectTemplate: async (template: any, userId: string) => {
    await delay();
    return { id: Date.now().toString(), ...template };
  },

  // Projects
  getProjects: async (options?: any) => {
    await delay();
    return [];
  },

  getProjectsByCompany: async (companyId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return [];
  },

  getProjectsByUser: async (userId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return [];
  },

  getProjectsByManager: async (managerId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return [];
  },

  createProject: async (project: any, userId?: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return { id: Date.now().toString(), ...project };
  },

  updateProject: async (projectId: string, updates: any, options?: { signal?: AbortSignal }) => {
    await delay();
    return { id: projectId, ...updates };
  },

  // Users
  getUsers: async (options?: { signal?: AbortSignal }) => {
    await delay();
    return [];
  },

  getUsersByCompany: async (companyId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return [];
  },

  createUser: async (user: any, options?: { signal?: AbortSignal }) => {
    await delay();
    return { id: Date.now().toString(), ...user };
  },

  updateUser: async (userId: string, updates: any, options?: { signal?: AbortSignal }) => {
    await delay();
    return { id: userId, ...updates };
  },

  getUserPerformanceMetrics: async (userId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return {};
  },

  // Companies
  getCompanies: async () => {
    await delay();
    return [mockCompany];
  },

  createCompany: async (company: any) => {
    await delay();
    return { id: Date.now().toString(), ...company };
  },

  getCompanySettings: async (companyId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return mockCompany.settings;
  },

  updateCompanySettings: async (companyId: string, settings: any) => {
    await delay();
    return { ...mockCompany.settings, ...settings };
  },

  getCompanyDashboardSummary: async (companyId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return {
      totalProjects: 0,
      activeProjects: 0,
      totalRevenue: 0,
      totalExpenses: 0
    };
  },

  getDashboardSnapshot: async (companyId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return {};
  },

  // Financials
  getFinancialKPIsForCompany: async (companyId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return {};
  },

  getMonthlyFinancials: async (companyId: string, months: number) => {
    await delay();
    return [];
  },

  getCostBreakdown: async (companyId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return [];
  },

  getFinancialForecasts: async (companyId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return [];
  },

  createFinancialForecast: async (forecast: any) => {
    await delay();
    return { id: Date.now().toString(), ...forecast };
  },

  getOperationalInsights: async (companyId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return {};
  },

  // Invoices
  getInvoicesByCompany: async (companyId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return [];
  },

  createInvoice: async (invoice: any, companyIdOrOptions?: string | { signal?: AbortSignal }, options?: { signal?: AbortSignal }) => {
    await delay();
    return { id: Date.now().toString(), ...invoice };
  },

  updateInvoice: async (invoiceId: string, updates: any, companyIdOrOptions?: string | { signal?: AbortSignal }, options?: { signal?: AbortSignal }) => {
    await delay();
    return { id: invoiceId, ...updates };
  },

  recordPaymentForInvoice: async (invoiceId: string, payment: any, optionsOrUserId?: MaybeOptions, options?: { signal?: AbortSignal }) => {
    await delay();
    return { id: Date.now().toString(), ...payment };
  },

  // Expenses
  getExpenses: async (options?: any) => {
    await delay();
    return [];
  },

  getExpensesByCompany: async (companyId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return [];
  },

  createExpense: async (expense: any, companyId?: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return { id: Date.now().toString(), ...expense };
  },

  updateExpense: async (expenseId: string, updates: any, userId?: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return { id: expenseId, ...updates };
  },

  submitExpense: async (expense: any, userId?: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return { id: Date.now().toString(), ...expense };
  },

  // Clients
  getClientsByCompany: async (companyId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return [];
  },

  createClient: async (client: any, userId?: string) => {
    await delay();
    return { id: Date.now().toString(), ...client };
  },

  getClientInsights: async (clientId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return {};
  },

  updateClient: async (clientId: string, updates: any, userId?: string) => {
    await delay();
    return { id: clientId, ...updates };
  },

  // Todos
  getTodos: async (options?: any) => {
    await delay();
    return [];
  },

  getTodosByProjectIds: async (projectIds: string[], options?: { signal?: AbortSignal }) => {
    await delay();
    return [];
  },

  createTodo: async (todo: any, projectId?: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return { id: Date.now().toString(), ...todo };
  },

  updateTodo: async (todoId: string, updates: any, options?: { signal?: AbortSignal }) => {
    await delay();
    return { id: todoId, ...updates };
  },

  // Timesheets
  getTimesheetsByCompany: async (companyId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return [];
  },

  getTimesheetsByUser: async (userId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return [];
  },

  submitTimesheet: async (timesheet: any, options?: { signal?: AbortSignal }) => {
    await delay();
    return { id: Date.now().toString(), ...timesheet };
  },

  updateTimesheetEntry: async (entryId: string, updates: any) => {
    await delay();
    return { id: entryId, ...updates };
  },

  updateTimesheetStatus: async (timesheetId: string, status: string) => {
    await delay();
    return { id: timesheetId, status };
  },

  clockIn: async (userId: string, projectId: string) => {
    await delay();
    return { id: Date.now().toString(), userId, projectId, clockInTime: new Date().toISOString() };
  },

  clockOut: async (entryId: string) => {
    await delay();
    return { id: entryId, clockOutTime: new Date().toISOString() };
  },

  // Equipment
  getEquipmentByCompany: async (companyId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return [];
  },

  createEquipment: async (equipment: any, options?: { signal?: AbortSignal }) => {
    await delay();
    return { id: Date.now().toString(), ...equipment };
  },

  updateEquipment: async (equipmentId: string, updates: any, options?: { signal?: AbortSignal }) => {
    await delay();
    return { id: equipmentId, ...updates };
  },

  getEquipmentHistory: async (equipmentId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return [];
  },

  // Safety
  getSafetyIncidentsByCompany: async (companyId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return [];
  },

  createSafetyIncident: async (incident: any, options?: { signal?: AbortSignal }) => {
    await delay();
    return { id: Date.now().toString(), ...incident };
  },

  updateSafetyIncidentStatus: async (incidentId: string, status: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return { id: incidentId, status };
  },

  // Documents
  getDocumentsByCompany: async (companyId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return [];
  },

  getDocumentsByProject: async (projectId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return [];
  },

  // Audit Logs
  getAuditLogsByCompany: async (companyId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return [];
  },

  // Conversations
  getConversationsForUser: async (userId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return [];
  },

  getMessagesForConversation: async (conversationId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return [];
  },

  sendMessage: async (conversationId: string, message: any, options?: { signal?: AbortSignal }) => {
    await delay();
    return { id: Date.now().toString(), ...message };
  },

  // Project Messages
  getProjectMessages: async (projectId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return [];
  },

  sendProjectMessage: async (projectId: string, message: any) => {
    await delay();
    return { id: Date.now().toString(), ...message };
  },

  // Site Updates
  getSiteUpdatesByProject: async (projectId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return [];
  },

  createSiteUpdate: async (update: any) => {
    await delay();
    return { id: Date.now().toString(), ...update };
  },

  // Resource Assignments
  getResourceAssignments: async (projectId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return [];
  },

  getProjectAssignmentsByCompany: async (companyId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return [];
  },

  createResourceAssignment: async (assignment: any) => {
    await delay();
    return { id: Date.now().toString(), ...assignment };
  },

  updateResourceAssignment: async (assignmentId: string, updates: any) => {
    await delay();
    return { id: assignmentId, ...updates };
  },

  deleteResourceAssignment: async (assignmentId: string) => {
    await delay();
    return { success: true };
  },

  // Whiteboard
  getWhiteboardNotesByProject: async (projectId: string, options?: { signal?: AbortSignal }) => {
    await delay();
    return [];
  },

  createWhiteboardNote: async (note: any) => {
    await delay();
    return { id: Date.now().toString(), ...note };
  },

  updateWhiteboardNote: async (noteId: string, updates: any) => {
    await delay();
    return { id: noteId, ...updates };
  },

  deleteWhiteboardNote: async (noteId: string) => {
    await delay();
    return { success: true };
  },

  // Weather
  getWeatherForLocation: async (lat: number, lng: number) => {
    await delay();
    return {
      temperature: 72,
      condition: 'Sunny',
      humidity: 45,
      windSpeed: 5
    };
  },

  // Admin/Platform Functions
  getTenantDirectory: async (options?: { signal?: AbortSignal }) => {
    await delay();
    return [];
  },

  getPlatformMetrics: async (options?: { signal?: AbortSignal }) => {
    await delay();
    return {
      totalCompanies: 0,
      totalUsers: 0,
      totalProjects: 0,
      activeUsers: 0
    };
  },

  // AI Tools
  generateBidPackage: async (projectId: string, options: any) => {
    await delay();
    return { id: Date.now().toString(), projectId, ...options };
  },

  prioritizeTasks: async (tasks: any[]) => {
    await delay();
    return tasks;
  }
};

// Export individual functions for convenience
export const {
  getProjectTemplates,
  createProjectTemplate,
  getProjects,
  getProjectsByCompany,
  getProjectsByUser,
  getProjectsByManager,
  createProject,
  updateProject,
  getUsers,
  getUsersByCompany,
  createUser,
  updateUser,
  getUserPerformanceMetrics,
  getCompanies,
  createCompany,
  getCompanySettings,
  updateCompanySettings,
  getCompanyDashboardSummary,
  getDashboardSnapshot,
  getFinancialKPIsForCompany,
  getMonthlyFinancials,
  getCostBreakdown,
  getFinancialForecasts,
  createFinancialForecast,
  getOperationalInsights,
  getInvoicesByCompany,
  createInvoice,
  updateInvoice,
  recordPaymentForInvoice,
  getExpenses,
  getExpensesByCompany,
  createExpense,
  updateExpense,
  submitExpense,
  getClientsByCompany,
  createClient,
  getClientInsights,
  updateClient,
  getTodos,
  getTodosByProjectIds,
  createTodo,
  updateTodo,
  getTimesheetsByCompany,
  getTimesheetsByUser,
  submitTimesheet,
  updateTimesheetEntry,
  updateTimesheetStatus,
  clockIn,
  clockOut,
  getEquipmentByCompany,
  createEquipment,
  updateEquipment,
  getEquipmentHistory,
  getSafetyIncidentsByCompany,
  createSafetyIncident,
  updateSafetyIncidentStatus,
  getDocumentsByCompany,
  getDocumentsByProject,
  getAuditLogsByCompany,
  getConversationsForUser,
  getMessagesForConversation,
  sendMessage,
  getProjectMessages,
  sendProjectMessage,
  getSiteUpdatesByProject,
  createSiteUpdate,
  getResourceAssignments,
  getProjectAssignmentsByCompany,
  createResourceAssignment,
  updateResourceAssignment,
  deleteResourceAssignment,
  getWhiteboardNotesByProject,
  createWhiteboardNote,
  updateWhiteboardNote,
  deleteWhiteboardNote,
  getWeatherForLocation,
  getTenantDirectory,
  getPlatformMetrics,
  generateBidPackage,
  prioritizeTasks,
} = api;

// Reset function for tests
export const resetMockApi = () => {
  registeredEmails.clear();
};

export default api;