import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Todo, Project, Permission, TodoStatus, User as Personnel } from '../types';
import { api } from '../services/apiService';
import { hasPermission } from '../services/auth';
import { Card } from './ui/Card';
import { KanbanBoard } from './KanbanBoard';
import { TaskDetailModal } from './TaskDetailModal';

interface AllTasksViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  isOnline: boolean;
}

export const AllTasksView: React.FC<AllTasksViewProps> = ({ user, addToast, isOnline }) => {
    const [allTodos, setAllTodos] = useState<Todo[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
    const [projectFilter, setProjectFilter] = useState<string>('all');
    
    const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p.name])), [projects]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (!user.companyId) return;

            const userProjects = hasPermission(user, Permission.VIEW_ALL_PROJECTS)
                ? await api.getProjectsByCompany(user.companyId)
                : await api.getProjectsByUser(user.id);
            setProjects(userProjects);
            
            const companyPersonnel = await api.getUsersByCompany(user.companyId);
            setPersonnel(companyPersonnel);

            if (userProjects.length > 0) {
                const projectIds = userProjects.map((p: any) => p.id);
                const todos = await api.getTodosByProjectIds(projectIds);
                setAllTodos(todos);
            }

        } catch (error) {
            addToast("Failed to load task data.", "error");
        } finally {
            setLoading(false);
        }
    }, [user, addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUpdateTask = async (taskId: number | string, updates: Partial<Todo>) => {
        try {
            const updatedTask = await api.updateTodo(taskId, updates, user.id);
            const newTodos = allTodos.map(t => t.id === taskId ? updatedTask : t);
            setAllTodos(newTodos);

            if(selectedTodo && selectedTodo.id === taskId) {
                setSelectedTodo(updatedTask);
            }
            addToast("Task updated successfully", "success");
        } catch (error) {
            addToast("Failed to update task", "error");
        }
    };
    
    const filteredTodos = useMemo(() => {
        if (projectFilter === 'all') {
            return allTodos;
        }
        return allTodos.filter(todo => todo.projectId.toString() === projectFilter);
    }, [allTodos, projectFilter]);

    if (loading) {
        return <Card><p>Loading all tasks...</p></Card>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h2 className="text-3xl font-bold text-slate-800">All Tasks</h2>
                <div className="flex items-center gap-4">
                     <select 
                        value={projectFilter} 
                        onChange={e => setProjectFilter(e.target.value)} 
                        className="p-2 border rounded-md bg-white shadow-sm"
                     >
                        <option value="all">All Projects</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            </div>
            
            {selectedTodo && (
                <TaskDetailModal 
                    todo={selectedTodo} 
                    onClose={() => setSelectedTodo(null)} 
                    onUpdate={handleUpdateTask} 
                    personnel={personnel}
                    allTodos={allTodos}
                    user={user}
                    addToast={addToast}
                />
            )}

            <KanbanBoard 
                todos={filteredTodos} 
                allTodos={allTodos} 
                onUpdateTodo={handleUpdateTask} 
                personnel={personnel} 
                user={user}
                onTaskClick={(task) => setSelectedTodo(task)}
            />
        </div>
    );
};
