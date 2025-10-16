// API Module Barrel Export
// This file provides a clean interface to the API functions

import { User, Project, AISuggestion } from '../types';

// Try to import from the main api.ts file, with fallbacks
let mainApi: any = null;

try {
  // Dynamically import the main API to avoid circular dependencies
  import('../api').then(api => {
    mainApi = api;
    console.log('✅ Main API module loaded successfully');
  }).catch(err => {
    console.warn('⚠️ Could not load main API module:', err.message);
  });
} catch (err) {
  console.warn('⚠️ Error importing main API module:', err);
}

// API functions with fallbacks
export const fetchAllProjects = async (user: User): Promise<Project[]> => {
  if (mainApi?.fetchAllProjects) {
    return await mainApi.fetchAllProjects(user);
  }
  console.log('Using mock fetchAllProjects for user:', user.email);
  return [];
};

export const getAISuggestedAction = async (user: User): Promise<AISuggestion | null> => {
  if (mainApi?.getAISuggestedAction) {
    return await mainApi.getAISuggestedAction(user);
  }
  console.log('Using mock getAISuggestedAction for user:', user.email);
  return null;
};

// Export other commonly used functions
export * from '../auth/authService';
