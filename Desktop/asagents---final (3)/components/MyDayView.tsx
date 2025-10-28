import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Project, Todo, Timesheet, View, TodoStatus, ProjectAssignment } from '../types';
import { api } from '../services/apiService';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useGeolocation } from '../hooks/useGeolocation';
import { PriorityDisplay } from './ui/PriorityDisplay';
import { Tag } from './ui/Tag';

interface MyDayViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  setActiveView: (view: View) => void;
}

export const MyDayView: React.FC<MyDayViewProps> = ({ user, addToast, setActiveView }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [todos, setTodos] = useState<Todo[]>([]);
    const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
    const [assignments, setAssignments] = useState<ProjectAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [aiPrioritizedTasks, setAiPrioritizedTasks] = useState<Todo[]>([]);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const { getLocation } = useGeolocation();
    const activeTimesheet = useMemo(() => timesheets.find(ts => ts.clockOut === null), [timesheets]);
    const currentProject = useMemo(() => {
        if (!activeTimesheet) return null;
        return projects.find(p => p.id === activeTimesheet.projectId);
    }, [activeTimesheet, projects]);
    
    const currentProjectTeamCount = useMemo(() => {
        if (!currentProject) return 0;
        return assignments.filter(a => a.projectId === currentProject.id).length;
    }, [currentProject, assignments]);


    const fetchData = useCallback(async () => {
        setLoading(true);
        setIsAiLoading(true);
        try {
             if (!user.companyId) {
                setLoading(false);
                setIsAiLoading(false);
                return;
            }
            const [projData, tsData, assignData] = await Promise.all([
                api.getProjectsByUser(user.id),
                api.getTimesheetsByUser(user.id),
                api.getProjectAssignmentsByCompany(user.companyId),
            ]);
            setProjects(projData);
            setTimesheets(tsData.sort((a,b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime()));
            setAssignments(assignData);

            const projectIds = projData.map(p => p.id);
            if (projectIds.length > 0) {
                const todosData = await api.getTodosByProjectIds(projectIds);
                const allUserTodos = todosData.filter(t => t.assigneeId === user.id && t.status !== TodoStatus.DONE);
                setTodos(allUserTodos);

                if (allUserTodos.length > 0) {
                    try {
                        const result = await api.prioritizeTasks(allUserTodos, projData, user.id);
                        const prioritizedMap = new Map(allUserTodos.map(t => [t.id, t]));
                        const sortedTasks = result.prioritizedTaskIds
                            .map(id => prioritizedMap.get(id))
                            .filter((t): t is Todo => t !== undefined);
                        setAiPrioritizedTasks(sortedTasks);
                    } catch (aiError) {
                        addToast("AI prioritization failed. Showing standard task list.", "error");
                        setAiPrioritizedTasks(allUserTodos.slice(0,3));
                    }
                } else {
                    setAiPrioritizedTasks([]);
                }
            }
        } catch (error) {
            addToast("Failed to load your data for the day.", "error");
        } finally {
            setLoading(false);
            setIsAiLoading(false);
        }
    }, [user.id, user.companyId, addToast]);

    useEffect(() => {
        fetchData();
        getLocation();
    }, [fetchData, getLocation]);
    
    const sortedTodos = useMemo(() => {
        return [...todos].sort((a, b) => {
            const dueDateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
            const dueDateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
            return dueDateA - dueDateB;
        });
    }, [todos]);


    if (loading) {
        return <Card>Loading your day...</Card>;
    }
    
    return (
        <div className="space-y-6">
             <h1 className="text-3xl font-bold text-slate-800">My Day</h1>
             
             <Card>
                 <div className="flex items-center gap-3 mb-4">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h2 className="text-xl font-semibold">AI Task Priorities</h2>
                 </div>
                 {isAiLoading ? (
                    <div className="text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
                        <p className="mt-2 text-slate-600">AI is analyzing your tasks...</p>
                    </div>
                 ) : aiPrioritizedTasks.length > 0 ? (
                    <div className="space-y-3">
                         {aiPrioritizedTasks.slice(0, 3).map((todo, index) => (
                             <div key={todo.id} className="p-3 border rounded-lg flex justify-between items-center bg-white shadow-sm animate-card-enter">
                                 <div className="flex items-center gap-4">
                                     <span className="font-bold text-lg text-sky-600">{index + 1}</span>
                                     <div>
                                         <p className="font-medium text-slate-800">{todo.text}</p>
                                         <p className="text-xs text-slate-500">{projects.find(p => p.id === todo.projectId)?.name}</p>
                                     </div>
                                 </div>
                                 <PriorityDisplay priority={todo.priority} />
                             </div>
                         ))}
                     </div>
                 ) : (
                     <p className="text-slate-500 text-center py-4">No tasks to prioritize.</p>
                 )}
             </Card>

             {currentProject ? (
                <Card className="animate-card-enter">
                    <div className="flex items-start gap-4">
                        <img src={currentProject.imageUrl} alt={currentProject.name} className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
                        <div className="flex-grow">
                            <p className="text-xs font-semibold uppercase text-slate-500">Current Project</p>
                            <h2 className="text-xl font-bold text-slate-800 leading-tight">{currentProject.name}</h2>
                            <p className="text-sm text-slate-600 mb-2">{currentProject.location.address}</p>
                            <div className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded-full w-fit font-medium">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                </svg>
                                <span>{currentProjectTeamCount} team members on site</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setActiveView('projects')}
                            className="p-2 rounded-full hover:bg-slate-100 transition-colors flex-shrink-0"
                            aria-label="View project details"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                            Clocked in since: <span className="font-semibold text-slate-700">{new Date(activeTimesheet!.clockIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </p>
                        <Button variant="danger" size="md" onClick={() => setActiveView('time')}>Clock Out</Button>
                    </div>
                </Card>
            ) : (
                <Card>
                    <h2 className="text-xl font-semibold mb-2">Time Clock</h2>
                    <p className="text-center text-slate-600">You are currently clocked out.</p>
                    <Button className="w-full mt-4" onClick={() => setActiveView('time')}>Go to Time Clock</Button>
                </Card>
            )}

             <Card>
                 <h2 className="text-xl font-semibold mb-4">All My Open Tasks ({todos.length})</h2>
                 <div className="space-y-3">
                     {sortedTodos.map(todo => (
                         <div key={todo.id} className="p-3 border rounded-lg flex justify-between items-center bg-white">
                             <div>
                                 <p className="font-medium text-slate-800">{todo.text}</p>
                                 <p className="text-xs text-slate-500">{projects.find(p => p.id === todo.projectId)?.name}</p>
                             </div>
                             <PriorityDisplay priority={todo.priority} />
                         </div>
                     ))}
                     {todos.length === 0 && <p className="text-slate-500 text-center py-4">You have no open tasks. Great job!</p>}
                 </div>
             </Card>
        </div>
    );
};