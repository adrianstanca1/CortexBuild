// Simple API stub to prevent import errors
// All API functions are now handled in App.tsx

// Mock API functions for components that still import this file
export const fetchAllProjects = async (user: any) => {
  console.log('Mock API: fetchAllProjects called');
  return [];
};

export const getAISuggestedAction = async (user: any) => {
  console.log('Mock API: getAISuggestedAction called');
  return null;
};

export const fetchTasks = async (user: any) => {
  console.log('Mock API: fetchTasks called');
  return [];
};

export const fetchDocuments = async (user: any) => {
  console.log('Mock API: fetchDocuments called');
  return [];
};

export const fetchPunchListItems = async (user: any) => {
  console.log('Mock API: fetchPunchListItems called');
  return [];
};

export const fetchDayworkSheets = async (user: any) => {
  console.log('Mock API: fetchDayworkSheets called');
  return [];
};

export const createTask = async (taskData: any) => {
  console.log('Mock API: createTask called');
  return { id: 'mock-task-id', ...taskData };
};

export const updateTask = async (taskId: string, updates: any) => {
  console.log('Mock API: updateTask called');
  return { id: taskId, ...updates };
};

export const deleteTask = async (taskId: string) => {
  console.log('Mock API: deleteTask called');
  return true;
};

export const createDocument = async (docData: any) => {
  console.log('Mock API: createDocument called');
  return { id: 'mock-doc-id', ...docData };
};

export const createPunchListItem = async (itemData: any) => {
  console.log('Mock API: createPunchListItem called');
  return { id: 'mock-punch-id', ...itemData };
};

export const createDayworkSheet = async (sheetData: any) => {
  console.log('Mock API: createDayworkSheet called');
  return { id: 'mock-sheet-id', ...sheetData };
};

// Add more mock functions as needed
export const fetchRFIs = async (user: any) => {
  console.log('Mock API: fetchRFIs called');
  return [];
};

export const fetchProjects = async (user: any) => {
  console.log('Mock API: fetchProjects called');
  return [];
};

export const fetchProjectById = async (projectId: string) => {
  console.log('Mock API: fetchProjectById called');
  return null;
};

export const fetchTaskById = async (taskId: string) => {
  console.log('Mock API: fetchTaskById called');
  return null;
};

export const fetchPunchListItemById = async (itemId: string) => {
  console.log('Mock API: fetchPunchListItemById called');
  return null;
};

export const fetchDayworkSheetById = async (sheetId: string) => {
  console.log('Mock API: fetchDayworkSheetById called');
  return null;
};

// Additional API functions for missing exports
export const getAllCompanies = async () => {
  console.log('Mock API: getAllCompanies called');
  return [
    { id: 'company-1', name: 'ABC Construction', plan: 'enterprise', users: 45, status: 'active' },
    { id: 'company-2', name: 'XYZ Builders', plan: 'professional', users: 23, status: 'active' }
  ];
};

export const getAllCompanyPlans = async () => {
  console.log('Mock API: getAllCompanyPlans called');
  return [
    { id: 'basic', name: 'Basic', price: 29, features: ['Basic features'] },
    { id: 'professional', name: 'Professional', price: 79, features: ['Advanced features'] }
  ];
};

export const updateCompanyPlan = async (companyId: string, planId: string) => {
  console.log('Mock API: updateCompanyPlan called');
  return { success: true };
};

export const getPlatformInvitations = async () => {
  console.log('Mock API: getPlatformInvitations called');
  return [];
};

export const sendPlatformInvitation = async (email: string, role: string) => {
  console.log('Mock API: sendPlatformInvitation called');
  return { success: true };
};

export const createCompanyPlan = async (planData: any) => {
  console.log('Mock API: createCompanyPlan called');
  return { success: true };
};

export const updateCompanyPlanDetails = async (planId: string, planData: any) => {
  console.log('Mock API: updateCompanyPlanDetails called');
  return { success: true };
};

export const toggleCompanyPlanStatus = async (planId: string) => {
  console.log('Mock API: toggleCompanyPlanStatus called');
  return { success: true };
};

export const fetchAvailableAIAgents = async () => {
  console.log('Mock API: fetchAvailableAIAgents called');
  return [];
};

export const createAIAgent = async (agentData: any) => {
  console.log('Mock API: createAIAgent called');
  return { success: true };
};

export const updateAIAgent = async (agentId: string, agentData: any) => {
  console.log('Mock API: updateAIAgent called');
  return { success: true };
};

export const toggleAIAgentStatus = async (agentId: string) => {
  console.log('Mock API: toggleAIAgentStatus called');
  return { success: true };
};

export const getPlatformAuditLogs = async () => {
  console.log('Mock API: getPlatformAuditLogs called');
  return [];
};

export const fetchNotificationsForUser = async (userId: string) => {
  console.log('Mock API: fetchNotificationsForUser called');
  return [];
};

export const markNotificationsAsRead = async (notificationIds: string[]) => {
  console.log('Mock API: markNotificationsAsRead called');
  return { success: true };
};

export const fetchTasksForUser = async (userId: string) => {
  console.log('Mock API: fetchTasksForUser called');
  return [];
};

export const fetchRecentActivity = async () => {
  console.log('Mock API: fetchRecentActivity called');
  return [];
};

export const checkAndCreateDueDateNotifications = async () => {
  console.log('Mock API: checkAndCreateDueDateNotifications called');
  return { success: true };
};

export const fetchSiteInstructions = async () => {
  console.log('Mock API: fetchSiteInstructions called');
  return [];
};

export const fetchDailyLogForUser = async (userId: string) => {
  console.log('Mock API: fetchDailyLogForUser called');
  return { entries: [] };
};

export const getAIInsightsForMyDay = async () => {
  console.log('Mock API: getAIInsightsForMyDay called');
  return { insights: [], recommendations: [] };
};

export const fetchCompanySubscriptions = async () => {
  console.log('Mock API: fetchCompanySubscriptions called');
  return [];
};

export const subscribeToAgent = async (agentId: string) => {
  console.log('Mock API: subscribeToAgent called');
  return { success: true };
};

export const fetchTimeEntriesForUser = async (userId: string) => {
  console.log('Mock API: fetchTimeEntriesForUser called');
  return [];
};

export const startTimeEntry = async (taskId: string, userId: string) => {
  console.log('Mock API: startTimeEntry called');
  return { success: true };
};

export const stopTimeEntry = async (timeEntryId: string) => {
  console.log('Mock API: stopTimeEntry called');
  return { success: true };
};

export const fetchTasksForProject = async (projectId: string) => {
  console.log('Mock API: fetchTasksForProject called');
  return [];
};

export const fetchUsersByCompany = async (companyId: string) => {
  console.log('Mock API: fetchUsersByCompany called');
  return [];
};

export const fetchRFIsForProject = async (projectId: string) => {
  console.log('Mock API: fetchRFIsForProject called');
  return [];
};

// Export a default object as well for compatibility
export default {
  fetchAllProjects,
  getAISuggestedAction,
  fetchTasks,
  fetchDocuments,
  fetchPunchListItems,
  fetchDayworkSheets,
  createTask,
  updateTask,
  deleteTask,
  createDocument,
  createPunchListItem,
  createDayworkSheet,
  fetchRFIs,
  fetchProjects,
  fetchProjectById,
  fetchTaskById,
  fetchPunchListItemById,
  fetchDayworkSheetById
};
