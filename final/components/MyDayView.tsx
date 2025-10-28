import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { User, Project, Todo, TodoStatus, Timesheet } from '../types';
import { api } from '../services/mockApi';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { KanbanBoard } from './KanbanBoard';

interface MyDayViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
}

export const MyDayView: React.FC<MyDayViewProps> = ({ user, addToast }) => {
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<Project[]>([]);
    const [todos, setTodos] = useState<Todo[]>([]);
    const [allTodos, setAllTodos] = useState<Todo[]>([]);
    const [personnel, setPersonnel] = useState<User[]>([]);
    const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
    const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string | number>>(new Set());
    const [isPrioritizing, setIsPrioritizing] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchData = useCallback(async () => {
        const controller = new AbortController();
        abortControllerRef.current?.abort();
        abortControllerRef.current = controller;

        setLoading(true);
        try {
            if (!user.companyId) return;

            const [userProjects, tsData, companyUsers] = await Promise.all([
                api.getProjectsByUser(user.id, { signal: controller.signal }),
                api.getTimesheetsByUser(user.id, { signal: controller.signal }),
                api.getUsersByCompany(user.companyId, { signal: controller.signal })
            ]);

            if (controller.signal.aborted) return;
            setProjects(userProjects);
            if (controller.signal.aborted) return;
            setTimesheets(tsData);
            if (controller.signal.aborted) return;
            setPersonnel(companyUsers);

            if (userProjects.length > 0) {
                const projectIds = userProjects.map(p => p.id);
                const projectTasks = await api.getTodosByProjectIds(projectIds, { signal: controller.signal });
                if (controller.signal.aborted) return;
                const myTasks = projectTasks.filter(t => t.assigneeId === user.id);
                setTodos(myTasks);
                if (controller.signal.aborted) return;
                setAllTodos(projectTasks); // For dependency checks
            }
        } catch (error) {
            if (controller.signal.aborted) return;
            addToast("Failed to load daily data.", "error");
        } finally {
            if (controller.signal.aborted) return;
            setLoading(false);
        }
    }, [user, addToast]);

    useEffect(() => {
        fetchData();
        return () => {
            abortControllerRef.current?.abort();
        };
    }, [fetchData]);
    
    const handleTaskStatusChange = async (taskId: string | number, newStatus: TodoStatus) => {
        try {
            // FIX: Ensure taskId is a string for the API call.
            const updatedTodo = await api.updateTodo(String(taskId), { status: newStatus }, user.id);
            setTodos(prev => prev.map(t => t.id === taskId ? updatedTodo : t));
            setAllTodos(prev => prev.map(t => t.id === taskId ? updatedTodo : t)); // Also update the global list for dependencies
            addToast(`Task moved to ${newStatus}.`, 'success');
        } catch (error) {
            addToast("Failed to update task status.", 'error');
        }
    };
    
    const handleTaskSelectionChange = (taskId: string | number) => {
        setSelectedTaskIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    };
    
    const handleAIPrioritization = async () => {
        setIsPrioritizing(true);
        try {
            const openTasks = todos.filter(t => t.status !== TodoStatus.DONE);
            const { prioritizedTaskIds } = await api.prioritizeTasks(openTasks, projects, user.id);
            setTodos(prev => {
                const taskMap = new Map(prev.map(t => [t.id, t]));
                // FIX: Ensure ID is a string when accessing the map.
                const prioritized = prioritizedTaskIds.map(id => taskMap.get(String(id))).filter((t): t is Todo => !!t);
                const remaining = prev.filter(t => !prioritizedTaskIds.includes(t.id));
                return [...prioritized, ...remaining];
            });
            addToast("Tasks prioritized by AI.", "success");
        } catch (error) {
            addToast("AI prioritization failed.", "error");
        } finally {
            setIsPrioritizing(false);
        }
    };

    // FIX: Use uppercase 'ACTIVE' for ProjectStatus enum comparison.
    const activeProject = useMemo(() => projects.find(p => p.status === 'ACTIVE'), [projects]);
    const activeTimesheet = useMemo(() => timesheets.find(ts => ts.clockOut === null), [timesheets]);

    if(loading) return <Card>Loading your day...</Card>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">My Day</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <h2 className="font-semibold text-lg mb-2">Time Clock</h2>
                    {activeTimesheet ? (
                        <div>
                            <p className="text-center text-lg">Clocked in at <strong>{projects.find(p => p.id === activeTimesheet.projectId)?.name}</strong></p>
                            <Button variant="danger" className="w-full mt-4">Clock Out</Button>
                        </div>
                    ) : (
                         <div>
                            <p className="text-center text-lg">You are currently clocked out.</p>
                             <Button variant="primary" className="w-full mt-4">Clock In</Button>
                        </div>
                    )}
                </Card>
                 <Card className="lg:col-span-2">
                    <h2 className="font-semibold text-lg mb-2">Quick Info</h2>
                    <p><strong>Active Project:</strong> {activeProject?.name || 'None'}</p>
                    <p><strong>Pending Tasks:</strong> {todos.filter(t => t.status !== TodoStatus.DONE).length}</p>
                </Card>
            </div>
            
            <div>
                <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-bold text-foreground">My Tasks</h2>
                     <Button onClick={handleAIPrioritization} isLoading={isPrioritizing}>
                        ✨ Prioritize with AI
                    </Button>
                </div>
                <KanbanBoard 
                    todos={todos}
                    allTodos={allTodos}
                    user={user}
                    personnel={personnel}
                    onTaskStatusChange={handleTaskStatusChange}
                    onTaskSelectionChange={handleTaskSelectionChange}
                    selectedTaskIds={selectedTaskIds}
                />
            </div>
        </div>
    );
};