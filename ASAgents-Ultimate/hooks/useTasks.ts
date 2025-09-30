/**
 * React Hook for Tasks Management
 */

import { useState, useEffect, useCallback } from 'react';
import { tasksService } from '../services/integratedApiService';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  assignedTo?: string;
  dueDate?: string;
}

interface UseTasksReturn {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (task: Partial<Task>) => Promise<{ success: boolean; data?: Task; error?: string }>;
  update: (id: string, updates: Partial<Task>) => Promise<{ success: boolean; error?: string }>;
  remove: (id: string) => Promise<{ success: boolean; error?: string }>;
  complete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export const useTasks = (filters?: any): UseTasksReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await tasksService.list(filters);

      if (response.success && response.data) {
        setTasks(Array.isArray(response.data) ? response.data : []);
      } else {
        setError(response.error || 'Failed to load tasks');
        setTasks([]);
      }
    } catch (err: any) {
      setError(err.message);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const create = useCallback(async (task: Partial<Task>) => {
    try {
      const response = await tasksService.create(task);

      if (response.success && response.data) {
        setTasks(prev => [...prev, response.data]);
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  const update = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      const response = await tasksService.update(id, updates);

      if (response.success) {
        setTasks(prev =>
          prev.map(t => (t.id === id ? { ...t, ...updates } : t))
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
      const response = await tasksService.remove(id);

      if (response.success) {
        setTasks(prev => prev.filter(t => t.id !== id));
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  const complete = useCallback(async (id: string) => {
    try {
      const response = await tasksService.complete(id);

      if (response.success) {
        setTasks(prev =>
          prev.map(t => (t.id === id ? { ...t, status: 'completed' } : t))
        );
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  return {
    tasks,
    isLoading,
    error,
    refresh: loadTasks,
    create,
    update,
    remove,
    complete,
  };
};
