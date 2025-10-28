

import React, { useState, useEffect, useMemo } from 'react';
// FIX: Corrected import paths to be relative.
import { User, Project, Equipment, ResourceAssignment } from '../types';
import { api } from '../services/mockApi';
import { Card } from './ui/Card';

interface ResourceSchedulerProps {
  user: User;
}

const getWeekStart = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
};

export const ResourceScheduler: React.FC<ResourceSchedulerProps> = ({ user }) => {
    const [assignments, setAssignments] = useState<ResourceAssignment[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if(!user.companyId) return;
                const [assignData, projData, userData, equipData] = await Promise.all([
                    api.getResourceAssignments(user.companyId),
                    api.getProjectsByCompany(user.companyId),
                    api.getUsersByCompany(user.companyId),
                    api.getEquipmentByCompany(user.companyId),
                ]);
                setAssignments(assignData);
                setProjects(projData);
                setUsers(userData);
                setEquipment(equipData);
            } catch (error) {
                console.error("Failed to load scheduler data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user.companyId]);

    const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate]);
    const weekDays = useMemo(() => Array.from({ length: 7 }).map((_, i) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        return date;
    }), [weekStart]);

    const getResourceName = (type: 'user' | 'equipment', id: number) => {
        if (type === 'user') {
            return users.find(u => u.id === id)?.name || `User #${id}`;
        }
        return equipment.find(e => e.id === id)?.name || `Equipment #${id}`;
    };
    
    const changeWeek = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
            return newDate;
        });
    };
    
    if (loading) {
        return <Card><p>Loading scheduler data...</p></Card>
    }

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-700">Resource Scheduler</h3>
                <div className="flex items-center gap-4">
                    <button onClick={() => changeWeek('prev')} className="p-2 rounded-full hover:bg-slate-100">&lt;</button>
                    <span className="font-medium">{weekStart.toLocaleDateString()} - {weekDays[6].toLocaleDateString()}</span>
                    <button onClick={() => changeWeek('next')} className="p-2 rounded-full hover:bg-slate-100">&gt;</button>
                </div>
            </div>
            <div className="overflow-x-auto border rounded-lg">
                <div className="grid grid-cols-[200px_repeat(7,1fr)] min-w-[900px]">
                    {/* Header */}
                    <div className="p-2 font-semibold border-b border-r bg-slate-50 sticky top-0">Project</div>
                    {weekDays.map(day => (
                        <div key={day.toISOString()} className="p-2 font-semibold border-b text-center bg-slate-50 sticky top-0">
                            {day.toLocaleDateString('en-US', { weekday: 'short' })}
                            <br/>
                            <span className="text-xs font-normal">{day.getDate()}</span>
                        </div>
                    ))}
                    
                    {/* Rows */}
                    {projects.map(project => (
                        <React.Fragment key={project.id}>
                            <div className="p-2 font-medium border-b border-r break-words">{project.name}</div>
                            <div className="col-span-7 border-b relative grid grid-cols-7">
                                {assignments
                                .filter(a => a.projectId === project.id)
                                .map((a, index) => {
                                    // Basic layout logic, can be improved
                                    const start = new Date(a.startDate).getTime();
                                    const end = new Date(a.endDate).getTime();
                                    const weekStartTime = weekDays[0].setHours(0,0,0,0);
                                    const weekEndTime = weekDays[6].setHours(23,59,59,999);
                                    
                                    if (end < weekStartTime || start > weekEndTime) return null;

                                    const startDayIndex = Math.max(0, (start - weekStartTime) / (24*60*60*1000));
                                    const endDayIndex = Math.min(6.99, (end - weekStartTime) / (24*60*60*1000));
                                    
                                    const left = (startDayIndex / 7) * 100;
                                    const width = ((endDayIndex - startDayIndex + 1) / 7) * 100;

                                    return (
                                        <div 
                                            key={a.id}
                                            className={`absolute h-8 px-2 py-1 rounded text-white text-xs overflow-hidden ${a.resourceType === 'user' ? 'bg-sky-600' : 'bg-green-600'}`}
                                            style={{ left: `${left}%`, width: `${width}%`, top: `${index * 2.25}rem` }}
                                            title={`${getResourceName(a.resourceType, a.resourceId)} (${new Date(a.startDate).toLocaleDateString()} - ${new Date(a.endDate).toLocaleDateString()})`}
                                        >
                                           {getResourceName(a.resourceType, a.resourceId)}
                                        </div>
                                    );
                                })}
                                <div className="h-24"></div> {/* Min height for the row */}
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </Card>
    );
};