
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Project, ResourceAssignment, Role } from '../types';
import { api } from '../services/mockApi';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';

interface WorkforcePlannerProps {
    user: User;
    addToast: (message: string, type: 'success' | 'error') => void;
    onBack: () => void;
}

const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

export const WorkforcePlanner: React.FC<WorkforcePlannerProps> = ({ user, addToast, onBack }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [operatives, setOperatives] = useState<User[]>([]);
    const [assignments, setAssignments] = useState<ResourceAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    const fetchData = useCallback(async () => {
        try {
            if (!user.companyId) return;
            const [projData, userData, assignData] = await Promise.all([
                api.getProjectsByCompany(user.companyId),
                api.getUsersByCompany(user.companyId),
                api.getResourceAssignments(user.companyId),
            ]);
            setProjects(projData.filter(p => p.status === 'Active'));
            setOperatives(userData.filter(u => u.role === Role.OPERATIVE || u.role === Role.FOREMAN));
            setAssignments(assignData);
        } catch (error) {
            addToast('Failed to load planner data.', 'error');
        } finally {
            setLoading(false);
        }
    }, [user.companyId, addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate]);
    const weekDays = useMemo(() => Array.from({ length: 7 }).map((_, i) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        return date;
    }), [weekStart]);

    const assignedOperativeIds = useMemo(() => {
        const ids = new Set<number>();
        const weekEnd = new Date(weekDays[6]);
        weekEnd.setHours(23, 59, 59, 999);
        assignments.forEach(a => {
            const startDate = new Date(a.startDate);
            const endDate = new Date(a.endDate);
            if (a.resourceType === 'user' && startDate <= weekEnd && endDate >= weekStart) {
                ids.add(a.resourceId);
            }
        });
        return ids;
    }, [assignments, weekDays, weekStart]);

    const unassignedOperatives = useMemo(() => {
        return operatives.filter(op => !assignedOperativeIds.has(op.id));
    }, [operatives, assignedOperativeIds]);

    const handleDragStart = (e: React.DragEvent, userToDrag: User) => {
        e.dataTransfer.setData('userId', userToDrag.id.toString());
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        (e.currentTarget as HTMLDivElement).style.backgroundColor = 'hsl(200, 100%, 90%)';
    };

    const handleDragLeave = (e: React.DragEvent) => {
        (e.currentTarget as HTMLDivElement).style.backgroundColor = '';
    };

    const handleDrop = async (e: React.DragEvent, projectId: number, date: Date) => {
        e.preventDefault();
        (e.currentTarget as HTMLDivElement).style.backgroundColor = '';
        const userId = parseInt(e.dataTransfer.getData('userId'), 10);
        if (!userId || !user.companyId) return;

        const assignmentData = {
            companyId: user.companyId,
            projectId,
            resourceId: userId,
            resourceType: 'user' as 'user',
            startDate: date,
            endDate: new Date(new Date(date).setDate(date.getDate() + 4)), // Assign for 5 days
        };
        try {
            await api.createResourceAssignment(assignmentData, user.id);
            addToast('Operative assigned successfully.', 'success');
            fetchData();
        } catch (error) {
            addToast('Failed to assign operative.', 'error');
        }
    };
    
    const handleDeleteAssignment = async (assignmentId: number) => {
        if (window.confirm('Are you sure you want to remove this assignment?')) {
            try {
                await api.deleteResourceAssignment(assignmentId, user.id);
                addToast('Assignment removed.', 'success');
                fetchData();
            } catch (error) {
                addToast('Failed to remove assignment.', 'error');
            }
        }
    };

    const changeWeek = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
            return newDate;
        });
    };
    
    if (loading) return <Card><p>Loading Workforce Planner...</p></Card>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-slate-700">Workforce Planner</h3>
                <div className="flex items-center gap-4">
                    <Button onClick={() => changeWeek('prev')} variant="secondary">&lt; Prev Week</Button>
                    <span className="font-medium text-slate-600">{weekStart.toLocaleDateString()} - {weekDays[6].toLocaleDateString()}</span>
                    <Button onClick={() => changeWeek('next')} variant="secondary">Next Week &gt;</Button>
                </div>
            </div>

            <div className="flex gap-4">
                <Card className="w-1/4 h-fit sticky top-20">
                    <h4 className="font-bold mb-2">Unassigned Operatives</h4>
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                        {unassignedOperatives.map(op => (
                            <div key={op.id} draggable onDragStart={e => handleDragStart(e, op)} className="flex items-center gap-2 p-2 bg-slate-50 rounded-md cursor-grab active:cursor-grabbing">
                                <Avatar name={op.name} className="w-8 h-8 text-xs" />
                                <span className="text-sm font-medium">{op.name}</span>
                            </div>
                        ))}
                         {unassignedOperatives.length === 0 && <p className="text-sm text-slate-500 text-center py-4">All operatives assigned.</p>}
                    </div>
                </Card>
                <Card className="w-3/4 overflow-x-auto">
                    <div className="grid grid-cols-[180px_repeat(7,1fr)] min-w-[800px]">
                        <div className="p-2 font-semibold border-b bg-slate-50 sticky left-0 z-10">Project</div>
                        {weekDays.map(day => (
                            <div key={day.toISOString()} className="p-2 font-semibold border-b text-center bg-slate-50">
                                {day.toLocaleDateString('en-US', { weekday: 'short' })}
                                <span className="block text-xs font-normal">{day.getDate()}</span>
                            </div>
                        ))}
                        {projects.map(project => (
                             <React.Fragment key={project.id}>
                                <div className="p-2 font-medium border-r bg-white sticky left-0 z-10 flex items-center">{project.name}</div>
                                <div className="col-span-7 border-b relative grid grid-cols-7 h-24">
                                {weekDays.map(day => (
                                     <div key={day.toISOString()} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={e => handleDrop(e, project.id, day)} className="border-r h-full transition-colors duration-200"></div>
                                ))}
                                {assignments
                                    .filter(a => a.projectId === project.id && a.resourceType === 'user')
                                    .map(a => {
                                        const startDate = new Date(a.startDate);
                                        const endDate = new Date(a.endDate);
                                        startDate.setHours(0,0,0,0);
                                        endDate.setHours(23,59,59,999);
                                        
                                        if (endDate < weekStart || startDate > weekDays[6]) return null;

                                        const startDayIndex = Math.max(0, (startDate.getTime() - weekStart.getTime()) / (24*60*60*1000));
                                        const endDayIndex = Math.min(6.99, (endDate.getTime() - weekStart.getTime()) / (24*60*60*1000));
                                        
                                        const left = (startDayIndex / 7) * 100;
                                        const width = ((endDayIndex - startDayIndex + 1) / 7) * 100;
                                        
                                        const operative = operatives.find(op => op.id === a.resourceId);

                                        return (
                                            <div key={a.id} className="absolute h-8 px-2 py-1 rounded bg-sky-600 text-white text-xs overflow-hidden group" style={{ left: `${left}%`, width: `${width}%`, top: `0.5rem` }}>
                                               <span className="truncate">{operative?.name || 'Unknown'}</span>
                                               <button onClick={() => handleDeleteAssignment(a.id)} className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-xs items-center justify-center hidden group-hover:flex">×</button>
                                            </div>
                                        );
                                    })}
                                </div>
                             </React.Fragment>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};
