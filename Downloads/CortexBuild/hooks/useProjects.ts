/**
 * React Query Hooks for Projects
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { toast } from 'react-hot-toast';

export function useProjects(params?: { status?: string; priority?: string; search?: string }) {
    return useQuery({
        queryKey: ['projects', params],
        queryFn: () => apiClient.getProjects(params),
        staleTime: 30000, // 30 seconds
    });
}

export function useProject(id: string) {
    return useQuery({
        queryKey: ['projects', id],
        queryFn: () => apiClient.getProject(id),
        enabled: !!id,
    });
}

export function useCreateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => apiClient.createProject(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Project created successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create project');
        },
    });
}

export function useUpdateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            apiClient.updateProject(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['projects', variables.id] });
            toast.success('Project updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update project');
        },
    });
}

export function useDeleteProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => apiClient.deleteProject(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Project deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete project');
        },
    });
}

