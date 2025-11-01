/**
 * API Functions - Real Implementation
 * Connects to Express backend with real endpoints
 */

import { 
  projectsAPI, 
  tasksAPI, 
  rfisAPI, 
  documentsAPI, 
  punchListAPI, 
  drawingsAPI, 
  dayworkSheetsAPI, 
  deliveryAPI, 
  timeEntriesAPI, 
  usersAPI, 
  companiesAPI, 
  aiAPI, 
  dailyLogAPI, 
  analyticsAPI,
  apiClient
} from './lib/api-client';

// Projects API
export const fetchAllProjects = async (user: any) => {
  try {
    return await projectsAPI.getAll();
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

export const fetchProjects = async (user: any) => {
  try {
    return await projectsAPI.getAll();
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

export const fetchProjectById = async (projectId: string) => {
  try {
    return await projectsAPI.getById(projectId);
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
};

// Tasks API
export const fetchTasks = async (user: any) => {
  try {
    return await tasksAPI.getAll();
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

export const fetchTaskById = async (taskId: string) => {
  try {
    return await tasksAPI.getById(taskId);
  } catch (error) {
    console.error('Error fetching task:', error);
    return null;
  }
};

export const fetchTasksForUser = async (userId: string) => {
  try {
    const response = await apiClient.getClient().get(`/api/tasks?user_id=${userId}`);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

export const fetchTasksForProject = async (projectId: string) => {
  try {
    return await tasksAPI.getAll(projectId);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

export const createTask = async (taskData: any) => {
  try {
    return await tasksAPI.create(taskData);
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (taskId: string, updates: any) => {
  try {
    return await tasksAPI.update(taskId, updates);
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (taskId: string) => {
  try {
    return await tasksAPI.delete(taskId);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

export const addCommentToTask = async (taskId: string, comment: any) => {
  try {
    const response = await apiClient.getClient().post(`/api/tasks/${taskId}/comments`, comment);
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// RFIs API
export const fetchRFIs = async (user: any) => {
  try {
    return await rfisAPI.getAll();
  } catch (error) {
    console.error('Error fetching RFIs:', error);
    return [];
  }
};

export const fetchRFIById = async (rfiId: string) => {
  try {
    return await rfisAPI.getById(rfiId);
  } catch (error) {
    console.error('Error fetching RFI:', error);
    return null;
  }
};

export const fetchRFIVersions = async (rfiNumber: string) => {
  try {
    const response = await apiClient.getClient().get(`/api/rfis/${rfiNumber}/versions`);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching RFI versions:', error);
    return [];
  }
};

export const fetchRFIsForProject = async (projectId: string) => {
  try {
    const response = await apiClient.getClient().get(`/api/rfis?project_id=${projectId}`);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching RFIs:', error);
    return [];
  }
};

export const createRFI = async (rfiData: any) => {
  try {
    return await rfisAPI.create(rfiData);
  } catch (error) {
    console.error('Error creating RFI:', error);
    throw error;
  }
};

export const addCommentToRFI = async (rfiId: string, comment: any) => {
  try {
    const response = await apiClient.getClient().post(`/api/rfis/${rfiId}/comments`, comment);
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const addAnswerToRFI = async (rfiId: string, answer: any) => {
  try {
    const response = await apiClient.getClient().post(`/api/rfis/${rfiId}/answers`, answer);
    return response.data;
  } catch (error) {
    console.error('Error adding answer:', error);
    throw error;
  }
};

// Documents API
export const fetchDocuments = async (user: any) => {
  try {
    return await documentsAPI.getAll();
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
};

export const createDocument = async (docData: any) => {
  try {
    const response = await apiClient.getClient().post('/api/documents', docData);
    return response.data;
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
};

// Punch List API
export const fetchPunchListItems = async (user: any) => {
  try {
    return await punchListAPI.getAll();
  } catch (error) {
    console.error('Error fetching punch list:', error);
    return [];
  }
};

export const fetchPunchListItemsForProject = async (projectId: string) => {
  try {
    const response = await apiClient.getClient().get(`/api/punch-list?project_id=${projectId}`);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching punch list:', error);
    return [];
  }
};

export const fetchPunchListItemById = async (itemId: string) => {
  try {
    return await punchListAPI.getById(itemId);
  } catch (error) {
    console.error('Error fetching punch list item:', error);
    return null;
  }
};

export const createPunchListItem = async (itemData: any) => {
  try {
    return await punchListAPI.create(itemData);
  } catch (error) {
    console.error('Error creating punch list item:', error);
    throw error;
  }
};

export const updatePunchListItem = async (itemId: string, updates: any) => {
  try {
    return await punchListAPI.update(itemId, updates);
  } catch (error) {
    console.error('Error updating punch list item:', error);
    throw error;
  }
};

export const addCommentToPunchListItem = async (itemId: string, comment: any) => {
  try {
    const response = await apiClient.getClient().post(`/api/punch-list/${itemId}/comments`, comment);
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Daywork Sheets API
export const fetchDayworkSheets = async (user: any) => {
  try {
    return await dayworkSheetsAPI.getAll();
  } catch (error) {
    console.error('Error fetching daywork sheets:', error);
    return [];
  }
};

export const fetchDayworkSheetsForProject = async (projectId: string) => {
  try {
    const response = await apiClient.getClient().get(`/api/daywork-sheets?project_id=${projectId}`);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching daywork sheets:', error);
    return [];
  }
};

export const fetchDayworkSheetById = async (sheetId: string) => {
  try {
    const response = await apiClient.getClient().get(`/api/daywork-sheets/${sheetId}`);
    return response.data?.data || response.data || null;
  } catch (error) {
    console.error('Error fetching daywork sheet:', error);
    return null;
  }
};

export const createDayworkSheet = async (sheetData: any) => {
  try {
    return await dayworkSheetsAPI.create(sheetData);
  } catch (error) {
    console.error('Error creating daywork sheet:', error);
    throw error;
  }
};

export const updateDayworkSheetStatus = async (sheetId: string, status: string) => {
  try {
    const response = await apiClient.getClient().put(`/api/daywork-sheets/${sheetId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating status:', error);
    throw error;
  }
};

// Drawings API
export const fetchDrawings = async (projectId: string) => {
  try {
    const response = await apiClient.getClient().get(`/api/drawings?project_id=${projectId}`);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching drawings:', error);
    return [];
  }
};

export const createDrawing = async (drawingData: any) => {
  try {
    const response = await apiClient.getClient().post('/api/drawings', drawingData);
    return response.data;
  } catch (error) {
    console.error('Error creating drawing:', error);
    throw error;
  }
};

// Delivery API
export const fetchDeliveryItems = async (projectId: string) => {
  try {
    const response = await apiClient.getClient().get(`/api/delivery?project_id=${projectId}`);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching delivery items:', error);
    return [];
  }
};

// Users API
export const fetchUsers = async () => {
  try {
    return await usersAPI.getAll();
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const fetchUsersByCompany = async (companyId: string) => {
  try {
    const response = await apiClient.getClient().get(`/api/users?company_id=${companyId}`);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

// Companies API
export const getAllCompanies = async () => {
  try {
    return await companiesAPI.getAll();
  } catch (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
};

// Time Entries API
export const fetchTimeEntriesForUser = async (userId: string) => {
  try {
    const response = await apiClient.getClient().get(`/api/time-entries?user_id=${userId}`);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching time entries:', error);
    return [];
  }
};

export const startTimeEntry = async (taskId: string, userId: string) => {
  try {
    return await timeEntriesAPI.create({
      task_id: taskId,
      user_id: userId,
      start_time: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error starting time entry:', error);
    throw error;
  }
};

export const stopTimeEntry = async (timeEntryId: string) => {
  try {
    const response = await apiClient.getClient().put(`/api/time-entries/${timeEntryId}`, {
      end_time: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    console.error('Error stopping time entry:', error);
    throw error;
  }
};

// Daily Log API
export const createDailyLog = async (logData: any) => {
  try {
    return await dailyLogAPI.create(logData);
  } catch (error) {
    console.error('Error creating daily log:', error);
    throw error;
  }
};

export const fetchDailyLogForUser = async (userId: string) => {
  try {
    const response = await apiClient.getClient().get(`/api/daily-logs?user_id=${userId}`);
    return response.data?.data || response.data || { entries: [] };
  } catch (error) {
    console.error('Error fetching daily log:', error);
    return { entries: [] };
  }
};

// AI API
export const getAISuggestedAction = async (user: any) => {
  try {
    const response = await apiClient.getClient().get(`/api/ai/suggested-action?user_id=${user.id}`);
    return response.data?.data || response.data || null;
  } catch (error) {
    console.error('Error fetching AI suggestions:', error);
    return null;
  }
};

export const getAITaskSuggestions = async (taskData: any) => {
  try {
    const response = await apiClient.getClient().post('/api/ai/task-suggestions', taskData);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching AI suggestions:', error);
    return [];
  }
};

export const getAIRFISuggestions = async (rfiData: any) => {
  try {
    const response = await apiClient.getClient().post('/api/ai/rfi-suggestions', rfiData);
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching AI suggestions:', error);
    return [];
  }
};

export const getAIInsightsForMyDay = async () => {
  try {
    const response = await apiClient.getClient().get('/api/ai/insights');
    return response.data?.data || response.data || { insights: [], recommendations: [] };
  } catch (error) {
    console.error('Error fetching AI insights:', error);
    return { insights: [], recommendations: [] };
  }
};

export const getAllProjectsPredictions = async () => {
  try {
    const response = await apiClient.getClient().get('/api/ai/project-predictions');
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return [];
  }
};

// Site Instructions - Temporary mock
export const fetchSiteInstructions = async () => {
  console.log('Mock API: fetchSiteInstructions called');
  return [];
};

// Notifications - Temporary mock
export const fetchNotificationsForUser = async (userId: string) => {
  console.log('Mock API: fetchNotificationsForUser called');
  return [];
};

export const markNotificationsAsRead = async (notificationIds: string[]) => {
  console.log('Mock API: markNotificationsAsRead called');
  return { success: true };
};

// Activity - Temporary mock
export const fetchRecentActivity = async () => {
  console.log('Mock API: fetchRecentActivity called');
  return [];
};

export const checkAndCreateDueDateNotifications = async () => {
  console.log('Mock API: checkAndCreateDueDateNotifications called');
  return { success: true };
};

// Platform Admin - Temporary mock
export const getAllCompanyPlans = async () => {
  console.log('Mock API: getAllCompanyPlans called');
  return [
    { id: 'basic', name: 'Basic', price: 29, features: ['Basic features'] },
    { id: 'professional', name: 'Professional', price: 79, features: ['Advanced features'] },
    { id: 'enterprise', name: 'Enterprise', price: 299, features: ['All features'] }
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

export const toggleAIAgentStatus = async (agentId: string, isActive: boolean) => {
  console.log('Mock API: toggleAIAgentStatus called');
  return { success: true };
};

export const getPlatformAuditLogs = async (offset: number = 0, limit: number = 50) => {
  console.log('Mock API: getPlatformAuditLogs called');
  return [];
};

export const fetchCompanySubscriptions = async () => {
  console.log('Mock API: fetchCompanySubscriptions called');
  return [];
};

export const subscribeToAgent = async (agentId: string) => {
  console.log('Mock API: subscribeToAgent called');
  return { success: true };
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
  fetchDayworkSheetById,
  createDailyLog,
  fetchRFIById,
  fetchRFIVersions,
  addCommentToRFI,
  addAnswerToRFI,
  createRFI,
  fetchPunchListItemsForProject,
  updatePunchListItem,
  addCommentToPunchListItem,
  fetchDrawings,
  createDrawing,
  fetchDayworkSheetsForProject,
  fetchUsers,
  updateDayworkSheetStatus,
  fetchDeliveryItems,
  getAllProjectsPredictions,
  addCommentToTask,
  getAITaskSuggestions,
  getAIRFISuggestions
};
