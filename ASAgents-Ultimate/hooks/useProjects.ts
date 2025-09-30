/**
 * React Hook for Projects Management
 */

import { useState, useEffect, useCallback } from 'react';
import { projectsService } from '../services/integratedApiService';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
}

interface UseProjectsReturn {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (project: Partial<Project>) => Promise<{ success: boolean; data?: Project; error?: string }>;
  update: (id: string, updates: Partial<Project>) => Promise<{ success: boolean; error?: string }>;
  remove: (id: string) => Promise<{ success: boolean; error?: string }>;
  getById: (id: string) => Promise<Project | null>;
}

export const useProjects = (): UseProjectsReturn => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await projectsService.list();

      if (response.success && response.data) {
        setProjects(Array.isArray(response.data) ? response.data : []);
      } else {
        setError(response.error || 'Failed to load projects');
        setProjects([]);
      }
    } catch (err: any) {
      setError(err.message);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const create = useCallback(async (project: Partial<Project>) => {
    try {
      const response = await projectsService.create(project);

      if (response.success && response.data) {
        setProjects(prev => [...prev, response.data]);
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  const update = useCallback(async (id: string, updates: Partial<Project>) => {
    try {
      const response = await projectsService.update(id, updates);

      if (response.success) {
        setProjects(prev =>
          prev.map(p => (p.id === id ? { ...p, ...updates } : p))
        );
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      const response = await projectsService.delete(id);

      if (response.success) {
        setProjects(prev => prev.filter(p => p.id !== id));
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  const getById = useCallback(async (id: string) => {
    try {
      const response = await projectsService.get(id);

      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (err: any) {
      console.error('Error fetching project:', err);
      return null;
    }
  }, []);

  return {
    projects,
    isLoading,
    error,
    refresh: loadProjects,
    create,
    update,
    remove,
    getById,
  };
};
