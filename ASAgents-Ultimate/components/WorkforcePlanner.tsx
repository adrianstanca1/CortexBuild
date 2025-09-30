// full contents of components/WorkforcePlanner.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Project } from '../types';
import { api } from '../services/mockApi';
import { Card } from './ui/Card';
import { Avatar } from './ui/Avatar';

interface WorkforcePlannerProps {
    user: User;
    addToast: (message: string, type: 'success' | 'error') => void;
}

interface AssignedUser extends User {
    // FIX: Changed projectId to allow string for temporary IDs.
    projectId: string | null;
}

export const WorkforcePlanner: React.FC<WorkforcePlannerProps> = ({ user, addToast }) => {
    const [users, setUsers] = useState<AssignedUser[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchData = useCallback(async () => {
        const controller = new AbortController();
        abortControllerRef.current?.abort();
        abortControllerRef.current = controller;

        try {
            if (!user.companyId) return;
            const [usersData, assignmentsData, projectsData] = await Promise.all([
                api.getUsersByCompany(user.companyId, { signal: controller.signal }),
                api.getProjectAssignmentsByCompany(user.companyId, { signal: controller.signal }),
                api.getProjectsByCompany(user.companyId, { signal: controller.signal }),
            ]);

            if (controller.signal.aborted) return;

            // FIX: Changed map value type to support string IDs.
            const userToProjectMap = new Map<string, string>();
            assignmentsData.forEach(a => userToProjectMap.set(a.userId, a.projectId));

            const assignedUsers: AssignedUser[] = usersData.map(u => ({
                ...u,
                projectId: userToProjectMap.get(u.id) || null,
            }));

            if (controller.signal.aborted) return;
            setUsers(assignedUsers);
            // FIX: Corrected state update from assignmentsData to projectsData
            if (controller.signal.aborted) return;
            setProjects(projectsData);
        } catch (error) {
            if (controller.signal.aborted) return;
            addToast("Failed to load workforce data.", "error");
        }
    }, [user.companyId, addToast]);

    useEffect(() => {
        fetchData();
        return () => {
            abortControllerRef.current?.abort();
        };
    }, [fetchData]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, userId: string) => {
        e.dataTransfer.setData("userId", userId);
    };

    // FIX: Changed projectId type to support string IDs from projects.
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, projectId: string | null) => {
        e.preventDefault();
        const userId = e.dataTransfer.getData("userId");
        setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, projectId } : u));
        // In a real app, you would call an API to save this change.
        addToast("Assignment updated (local simulation).", "success");
        e.currentTarget.classList.remove('bg-sky-100');
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.add('bg-sky-100');
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('bg-sky-100');
    };


    const unassignedUsers = users.filter(u => u.projectId === null);

    return (
        <Card>
            <h3 className="font-bold text-lg mb-4">Workforce Planner</h3>
            <div className="flex gap-6">
                <div
                    className="w-1/4 p-4 bg-slate-100 rounded-lg transition-colors"
                    onDrop={(e) => handleDrop(e, null)}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <h4 className="font-semibold mb-2">Unassigned ({unassignedUsers.length})</h4>
                    <div className="space-y-2">
                        {unassignedUsers.map(u => (
                            <div key={u.id} draggable onDragStart={(e) => handleDragStart(e, u.id)} className="p-2 bg-white rounded shadow-sm cursor-grab flex items-center gap-2">
                                <Avatar name={`${u.firstName} ${u.lastName}`} className="w-6 h-6 text-xs" />
                                <span className="text-sm">{`${u.firstName} ${u.lastName}`}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="w-3/4 grid grid-cols-2 gap-4">
                    {projects.map(p => {
                        const assigned = users.filter(u => u.projectId === p.id);
                        return (
                            <div
                                key={p.id}
                                className="p-4 bg-slate-50 rounded-lg transition-colors"
                                onDrop={(e) => handleDrop(e, p.id)}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                            >
                                <h4 className="font-semibold mb-2">{p.name} ({assigned.length})</h4>
                                <div className="space-y-2">
                                    {assigned.map(u => (
                                        <div key={u.id} draggable onDragStart={(e) => handleDragStart(e, u.id)} className="p-2 bg-white rounded shadow-sm cursor-grab flex items-center gap-2">
                                            <Avatar name={`${u.firstName} ${u.lastName}`} className="w-6 h-6 text-xs" />
                                            <span className="text-sm">{`${u.firstName} ${u.lastName}`}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
};