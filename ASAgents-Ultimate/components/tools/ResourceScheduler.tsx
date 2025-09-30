import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
// FIX: Corrected import paths to be relative.
import { User, Project, Equipment, ResourceAssignment } from '../../types';
import { api } from '../../services/mockApi';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';

interface ResourceSchedulerProps {
    user: User;
    addToast: (message: string, type: 'success' | 'error') => void;
}

const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(new Date(d.setDate(diff)).setHours(0, 0, 0, 0));
};

const dateToYMD = (date: Date) => date.toISOString().split('T')[0];

const AssignmentModal: React.FC<{
    assignment: ResourceAssignment | null,
    onClose: () => void,
    onSave: (data: Omit<ResourceAssignment, 'id'>) => void,
    // FIX: Changed id type from number | string to string.
    onDelete: (id: string) => void,
    projects: Project[],
    users: User[],
    equipment: Equipment[],
}> = ({ assignment, onClose, onSave, onDelete, projects, users, equipment }) => {
    const [resourceType, setResourceType] = useState<'user' | 'equipment'>(assignment?.resourceType || 'user');
    const [resourceId, setResourceId] = useState<string>(assignment?.resourceId.toString() || '');
    const [projectId, setProjectId] = useState<string>(assignment?.projectId.toString() || '');
    const [startDate, setStartDate] = useState(assignment ? dateToYMD(new Date(assignment.startDate)) : '');
    const [endDate, setEndDate] = useState(assignment ? dateToYMD(new Date(assignment.endDate)) : '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!resourceId || !projectId || !startDate || !endDate) return;
        // FIX: Corrected payload to match ResourceAssignment type (string IDs, string dates).
        onSave({
            resourceType,
            resourceId: resourceId,
            projectId: projectId,
            startDate: startDate,
            endDate: endDate,
        });
    };

    const resourceList = resourceType === 'user' ? users : equipment;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">{assignment ? 'Edit' : 'Create'} Assignment</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <select value={resourceType} onChange={e => { setResourceType(e.target.value as 'user' | 'equipment'); setResourceId(''); }} className="w-full p-2 border rounded bg-white">
                        <option value="user">User</option>
                        <option value="equipment">Equipment</option>
                    </select>
                    <select value={resourceId} onChange={e => setResourceId(e.target.value)} className="w-full p-2 border rounded bg-white" required>
                        <option value="">Select {resourceType}...</option>
                        {/* FIX: Combined firstName and lastName for User display name. */}
                        {resourceList.map(r => <option key={r.id} value={r.id}>{resourceType === 'user' ? `${(r as User).firstName} ${(r as User).lastName}` : (r as Equipment).name}</option>)}
                    </select>
                    <select value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full p-2 border rounded bg-white" required>
                        <option value="">Select project...</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border rounded" required />
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border rounded" required />
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <div>{assignment && <Button type="button" variant="danger" onClick={() => onDelete(assignment.id)}>Delete</Button>}</div>
                        <div className="flex gap-2">
                            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                            <Button type="submit">Save</Button>
                        </div>
                    </div>
                </form>
            </Card>
        </div>
    );

    export const ResourceScheduler: React.FC<ResourceSchedulerProps> = ({ user, addToast }) => {
        const [assignments, setAssignments] = useState<ResourceAssignment[]>([]);
        const [projects, setProjects] = useState<Project[]>([]);
        const [users, setUsers] = useState<User[]>([]);
        const [equipment, setEquipment] = useState<Equipment[]>([]);
        const [currentDate, setCurrentDate] = useState(new Date());
        const [loading, setLoading] = useState(true);
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [editingAssignment, setEditingAssignment] = useState<ResourceAssignment | null>(null);
        const abortControllerRef = useRef<AbortController | null>(null);

        const fetchData = useCallback(async () => {
            const controller = new AbortController();
            abortControllerRef.current?.abort();
            abortControllerRef.current = controller;

            setLoading(true);
            try {
                if (!user.companyId) return;
                const [assignData, projData, userData, equipData] = await Promise.all([
                    api.getResourceAssignments(user.companyId, { signal: controller.signal }),
                    api.getProjectsByCompany(user.companyId, { signal: controller.signal }),
                    api.getUsersByCompany(user.companyId, { signal: controller.signal }),
                    api.getEquipmentByCompany(user.companyId, { signal: controller.signal }),
                ]);
                if (controller.signal.aborted) return;
                setAssignments(assignData);
                if (controller.signal.aborted) return;
                setProjects(projData);
                if (controller.signal.aborted) return;
                setUsers(userData.filter(u => u.companyId)); // Exclude principal admin
                if (controller.signal.aborted) return;
                setEquipment(equipData);
            } catch (error) {
                if (controller.signal.aborted) return;
                addToast("Failed to load scheduler data", "error");
            } finally {
                if (controller.signal.aborted) return;
                setLoading(false);
            }
        }, [user.companyId, addToast]);

        useEffect(() => {
            fetchData();
            return () => {
                abortControllerRef.current?.abort();
            };
        }, [fetchData]);

        const openModal = (assignment: ResourceAssignment | null) => {
            setEditingAssignment(assignment);
            setIsModalOpen(true);
        };

        const handleSave = async (data: Omit<ResourceAssignment, 'id'>) => {
            try {
                if (editingAssignment) {
                    const updated = await api.updateResourceAssignment(editingAssignment.id, data, user.id);
                    setAssignments(prev => prev.map(a => a.id === updated.id ? updated : a));
                    addToast("Assignment updated.", "success");
                } else {
                    const created = await api.createResourceAssignment(data, user.id);
                    setAssignments(prev => [...prev, created]);
                    addToast("Assignment created.", "success");
                }
                setIsModalOpen(false);
            } catch (error) {
                addToast("Failed to save assignment.", "error");
            }
        };

        // FIX: Changed id type from number | string to string.
        const handleDelete = async (id: string) => {
            try {
                await api.deleteResourceAssignment(id, user.id);
                setAssignments(prev => prev.filter(a => a.id !== id));
                addToast("Assignment deleted.", "success");
                setIsModalOpen(false);
            } catch (error) {
                addToast("Failed to delete assignment.", "error");
            }
        };

        const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate]);
        const weekDays = useMemo(() => Array.from({ length: 7 }).map((_, i) => {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            return date;
        }), [weekStart]);

        const projectMap = useMemo(() => new Map(projects.map(p => [p.id.toString(), p])), [projects]);

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

        const resources: ({ type: 'user' | 'equipment' } & (User | Equipment))[] = [
            ...users.map(u => ({ ...u, type: 'user' as const })),
            ...equipment.map(e => ({ ...e, type: 'equipment' as const })),
        ];

        return (
            <Card>
                {isModalOpen && (
                    <AssignmentModal
                        assignment={editingAssignment}
                        onClose={() => setIsModalOpen(false)}
                        onSave={handleSave}
                        onDelete={handleDelete}
                        projects={projects}
                        users={users}
                        equipment={equipment}
                    />
                )}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-slate-700">Resource Scheduler</h3>
                    <div className="flex items-center gap-4">
                        <Button onClick={() => openModal(null)}>Add Assignment</Button>
                        <button onClick={() => changeWeek('prev')} className="p-2 rounded-full hover:bg-slate-100">&lt;</button>
                        <span className="font-medium">{weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <button onClick={() => changeWeek('next')} className="p-2 rounded-full hover:bg-slate-100">&gt;</button>
                    </div>
                </div>
                <div className="overflow-x-auto border rounded-lg">
                    <div className="grid grid-cols-[200px_repeat(7,1fr)] min-w-[900px]">
                        {/* Header */}
                        <div className="p-2 font-semibold border-b border-r bg-slate-50 sticky left-0 z-10">Resource</div>
                        {weekDays.map(day => (
                            <div key={day.toISOString()} className={`p-2 font-semibold border-b text-center bg-slate-50 ${dateToYMD(day) === dateToYMD(new Date()) ? 'bg-sky-100' : ''}`}>
                                {day.toLocaleDateString('en-US', { weekday: 'short' })}
                                <br />
                                <span className="text-xs font-normal">{day.getDate()}</span>
                            </div>
                        ))}

                        {/* Rows */}
                        {resources.map((resource, rowIndex) => {
                            // FIX: Combined firstName and lastName for User display name.
                            const resourceName = resource.type === 'user' ? `${(resource as User).firstName} ${(resource as User).lastName}` : (resource as Equipment).name;
                            return (
                                <React.Fragment key={`${resource.type}-${resource.id}`}>
                                    <div className={`p-2 font-medium border-b border-r break-words sticky left-0 z-10 flex items-center gap-2 ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                                        {resource.type === 'user' && <Avatar name={resourceName} className="w-6 h-6 text-xs" />}
                                        <span className="text-sm">{resourceName}</span>
                                    </div>
                                    <div className="col-span-7 border-b relative grid grid-cols-7">
                                        {[...Array(7)].map((_, dayIndex) => (
                                            <div key={dayIndex} className={`h-16 border-r ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}></div>
                                        ))}
                                        {assignments
                                            .filter(a => a.resourceId === resource.id && a.resourceType === resource.type)
                                            .map((a) => {
                                                const start = new Date(new Date(a.startDate).setHours(0, 0, 0, 0)).getTime();
                                                const end = new Date(new Date(a.endDate).setHours(0, 0, 0, 0)).getTime();
                                                const weekStartTime = weekStart.getTime();

                                                if (end < weekStartTime || start >= weekStartTime + 7 * 24 * 60 * 60 * 1000) return null;

                                                const startDayIndex = Math.max(0, (start - weekStartTime) / (24 * 60 * 60 * 1000));
                                                const endDayIndex = Math.min(6.99, (end - weekStartTime) / (24 * 60 * 60 * 1000));

                                                const left = (startDayIndex / 7) * 100;
                                                const width = ((endDayIndex - startDayIndex + 1) / 7) * 100;
                                                const project = projectMap.get(a.projectId.toString());

                                                return (
                                                    <div
                                                        key={a.id}
                                                        onClick={() => openModal(a)}
                                                        className={`absolute h-8 px-2 py-1 rounded text-white text-xs overflow-hidden cursor-pointer group flex justify-between items-center ${a.resourceType === 'user' ? 'bg-sky-600' : 'bg-green-600'}`}
                                                        style={{ left: `${left}%`, width: `calc(${width}% - 4px)`, top: '0.5rem', margin: '0 2px' }}
                                                        title={`${project?.name}\n${new Date(a.startDate).toLocaleDateString()} - ${new Date(a.endDate).toLocaleDateString()}`}
                                                    >
                                                        <span className="truncate">{project?.name || 'Unknown Project'}</span>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }}
                                                            className="opacity-0 group-hover:opacity-100 text-white/70 hover:text-white/100 ml-2"
                                                        >
                                                            &times;
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </React.Fragment>
                            )
                        })}
                    </div>
                </div>
            </Card>
        );
    };
};