/**
 * Enhanced React Hooks for ASAgents Ultimate
 * Custom hooks for data fetching, real-time updates, and state management
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient, handleApiError, ProjectFilters, InvoiceFilters, TeamFilters, Project, Invoice, TeamMember } from '../services/enhancedApiService';

// Query Keys
export const queryKeys = {
  health: ['health'],
  projects: {
    all: ['projects'],
    list: (filters: ProjectFilters) => ['projects', 'list', filters],
    detail: (id: string) => ['projects', 'detail', id],
    analytics: (id: string) => ['projects', 'analytics', id],
  },
  invoices: {
    all: ['invoices'],
    list: (filters: InvoiceFilters) => ['invoices', 'list', filters],
    detail: (id: string) => ['invoices', 'detail', id],
  },
  team: {
    all: ['team'],
    list: (filters: TeamFilters) => ['team', 'list', filters],
    detail: (id: string) => ['team', 'detail', id],
    performance: (id: string) => ['team', 'performance', id],
    workload: (id: string) => ['team', 'workload', id],
  },
  analytics: {
    dashboard: ['analytics', 'dashboard'],
    projects: (timeframe: string) => ['analytics', 'projects', timeframe],
    financial: (timeframe: string) => ['analytics', 'financial', timeframe],
    team: (timeframe: string) => ['analytics', 'team', timeframe],
  },
  notifications: {
    all: ['notifications'],
    unreadCount: ['notifications', 'unread-count'],
  },
  documents: {
    all: ['documents'],
    list: (projectId?: string) => ['documents', 'list', projectId],
  },
  ai: {
    insights: (projectId: string) => ['ai', 'insights', projectId],
    recommendations: (type: string) => ['ai', 'recommendations', type],
    riskAnalysis: (projectId: string) => ['ai', 'risk-analysis', projectId],
  },
};

// Health Check Hook
export const useHealthCheck = (options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => apiClient.healthCheck(),
    refetchInterval: 30000, // Check every 30 seconds
    ...options,
  });
};

// Projects Hooks
export const useProjects = (filters: ProjectFilters = {}, options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.projects.list(filters),
    queryFn: () => apiClient.projects.list(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useProject = (id: string, options?: UseQueryOptions<Project>) => {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => apiClient.projects.get(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useProjectAnalytics = (id: string, options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.projects.analytics(id),
    queryFn: () => apiClient.projects.getAnalytics(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

export const useCreateProject = (options?: UseMutationOptions<Project, Error, Partial<Project>>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (project: Partial<Project>) => apiClient.projects.create(project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
    onError: (error) => {
      console.error('Create project error:', handleApiError(error as any));
    },
    ...options,
  });
};

export const useUpdateProject = (options?: UseMutationOptions<Project, Error, { id: string; updates: Partial<Project> }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }) => apiClient.projects.update(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.setQueryData(queryKeys.projects.detail(variables.id), data);
    },
    onError: (error) => {
      console.error('Update project error:', handleApiError(error as any));
    },
    ...options,
  });
};

export const useDeleteProject = (options?: UseMutationOptions<void, Error, string>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.projects.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      queryClient.removeQueries({ queryKey: queryKeys.projects.detail(id) });
    },
    onError: (error) => {
      console.error('Delete project error:', handleApiError(error as any));
    },
    ...options,
  });
};

// Invoices Hooks
export const useInvoices = (filters: InvoiceFilters = {}, options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.invoices.list(filters),
    queryFn: () => apiClient.invoices.list(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useInvoice = (id: string, options?: UseQueryOptions<Invoice>) => {
  return useQuery({
    queryKey: queryKeys.invoices.detail(id),
    queryFn: () => apiClient.invoices.get(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateInvoice = (options?: UseMutationOptions<Invoice, Error, Partial<Invoice>>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (invoice: Partial<Invoice>) => apiClient.invoices.create(invoice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
    },
    onError: (error) => {
      console.error('Create invoice error:', handleApiError(error as any));
    },
    ...options,
  });
};

export const useMarkInvoiceAsPaid = (options?: UseMutationOptions<any, Error, { id: string; paymentData: any }>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, paymentData }) => apiClient.invoices.markAsPaid(id, paymentData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(variables.id) });
    },
    onError: (error) => {
      console.error('Mark invoice as paid error:', handleApiError(error as any));
    },
    ...options,
  });
};

// Team Hooks
export const useTeamMembers = (filters: TeamFilters = {}, options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.team.list(filters),
    queryFn: () => apiClient.team.list(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

export const useTeamMember = (id: string, options?: UseQueryOptions<TeamMember>) => {
  return useQuery({
    queryKey: queryKeys.team.detail(id),
    queryFn: () => apiClient.team.get(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

export const useTeamMemberPerformance = (id: string, options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.team.performance(id),
    queryFn: () => apiClient.team.getPerformance(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
};

export const useCreateTeamMember = (options?: UseMutationOptions<TeamMember, Error, Partial<TeamMember>>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (member: Partial<TeamMember>) => apiClient.team.create(member),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.team.all });
    },
    onError: (error) => {
      console.error('Create team member error:', handleApiError(error as any));
    },
    ...options,
  });
};

// Analytics Hooks
export const useDashboardAnalytics = (options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.analytics.dashboard,
    queryFn: () => apiClient.analytics.getDashboard(),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    ...options,
  });
};

export const useProjectMetrics = (timeframe: string = '30d', options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.analytics.projects(timeframe),
    queryFn: () => apiClient.analytics.getProjectMetrics(timeframe),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

export const useFinancialMetrics = (timeframe: string = '30d', options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.analytics.financial(timeframe),
    queryFn: () => apiClient.analytics.getFinancialMetrics(timeframe),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

// Notifications Hooks
export const useNotifications = (filters: { read?: boolean; type?: string } = {}, options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: [...queryKeys.notifications.all, filters],
    queryFn: () => apiClient.notifications.list(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
    ...options,
  });
};

export const useUnreadNotificationsCount = (options?: UseQueryOptions<number>) => {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: () => apiClient.notifications.getUnreadCount(),
    staleTime: 1 * 60 * 1000,
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
    ...options,
  });
};

export const useMarkNotificationAsRead = (options?: UseMutationOptions<any, Error, string>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.notifications.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount });
    },
    ...options,
  });
};

// AI Insights Hooks
export const useProjectInsights = (projectId: string, options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.ai.insights(projectId),
    queryFn: () => apiClient.ai.getProjectInsights(projectId),
    enabled: !!projectId,
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
};

export const useAIRecommendations = (type: string = 'general', options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.ai.recommendations(type),
    queryFn: () => apiClient.ai.getRecommendations(type),
    staleTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
};

// Real-time Updates Hook
export const useRealTimeUpdates = (callback: (data: any) => void) => {
  const callbackRef = useRef(callback);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const unsubscribe = apiClient.realTime.subscribe((data) => {
      callbackRef.current(data);
    });

    setIsConnected(true);

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, []);

  return { isConnected };
};

// Search Hook with Debouncing
export const useDebounceSearch = (searchTerm: string, delay: number = 300) => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay]);

  return debouncedSearchTerm;
};

// Pagination Hook
export const usePagination = (initialPage: number = 1, initialLimit: number = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const nextPage = useCallback(() => setPage(prev => prev + 1), []);
  const prevPage = useCallback(() => setPage(prev => Math.max(1, prev - 1)), []);
  const goToPage = useCallback((newPage: number) => setPage(Math.max(1, newPage)), []);
  const resetPage = useCallback(() => setPage(1), []);

  return {
    page,
    limit,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    goToPage,
    resetPage,
  };
};

// Local Storage Hook
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
};

// Upload Hook
export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File, projectId: string, metadata?: any) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await apiClient.documents.upload(file, projectId, metadata);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      throw err;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  }, []);

  return {
    uploadFile,
    isUploading,
    uploadProgress,
    error,
  };
};

// Export all hooks as default object
export default {
  useHealthCheck,
  useProjects,
  useProject,
  useProjectAnalytics,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useInvoices,
  useInvoice,
  useCreateInvoice,
  useMarkInvoiceAsPaid,
  useTeamMembers,
  useTeamMember,
  useTeamMemberPerformance,
  useCreateTeamMember,
  useDashboardAnalytics,
  useProjectMetrics,
  useFinancialMetrics,
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationAsRead,
  useProjectInsights,
  useAIRecommendations,
  useRealTimeUpdates,
  useDebounceSearch,
  usePagination,
  useLocalStorage,
  useFileUpload,
};