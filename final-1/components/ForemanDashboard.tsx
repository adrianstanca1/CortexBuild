import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { User, Project, Todo, Equipment, Permission, Role, TodoStatus, IncidentSeverity, SiteUpdate, ProjectMessage, Weather, SafetyIncident, Timesheet, TodoPriority } from '../types';
import { api } from '../services/mockApi';
import { Card } from './ui/Card';
import { Avatar } from './ui/Avatar';
import { PriorityDisplay } from './ui/PriorityDisplay';
import { EquipmentStatusBadge } from './ui/StatusBadge';
import { Button } from './ui/Button';
import { useGeolocation } from '../hooks/useGeolocation';
import { ErrorBoundary } from './ErrorBoundary';

interface ForemanDashboardProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
}

const DashboardSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="h-6 bg-muted rounded w-1/2"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
                <div className="h-32 bg-muted rounded-lg"></div>
                <div className="h-80 bg-muted rounded-lg"></div>
            </div>
            <div className="space-y-6">
                <div className="h-64 bg-muted rounded-lg"></div>
                <div className="h-48 bg-muted rounded-lg"></div>
            </div>
            <div className="space-y-6">
                <div className="h-80 bg-muted rounded-lg"></div>
                <div className="h-40 bg-muted rounded-lg"></div>
            </div>
        </div>
    </div>
);

// --- MODALS ---
const ReportIncidentModal: React.FC<{ project: Project, user: User, onClose: () => void, addToast: (m:string,t:'success'|'error')=>void, onSuccess: () => void }> = ({ project, user, onClose, addToast, onSuccess }) => {
    const [description, setDescription] = useState('');
    const [severity, setSeverity] = useState<IncidentSeverity>(IncidentSeverity.LOW);
    const [photo, setPhoto] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.createSafetyIncident({ 
                projectId: project.id, 
                description, 
                severity, 
                imageUrl: photo ? `https://picsum.photos/seed/${project.id}-${Date.now()}/400/200` : undefined,
            }, user.id);
            addToast("Safety incident reported.", "success");
            onSuccess();
            onClose();
        } catch (error) {
            addToast("Failed to report incident.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
         <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="w-full max-w-lg" onClick={e=>e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">Report Field Issue at {project.name}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={4} className="w-full p-2 border rounded" placeholder="Describe the issue..." required />
                    <select value={severity} onChange={e=>setSeverity(e.target.value as IncidentSeverity)} className="w-full p-2 border rounded bg-white">
                        {Object.values(IncidentSeverity).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div>
                        <label className="block text-sm font-medium">Attach Photo (optional)</label>
                        <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="danger" isLoading={isSaving}>Submit Report</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};


// --- DASHBOARD WIDGETS ---

const TimeClockCard: React.FC<{ user: User; project: Project; addToast: (m:string,t:'success'|'error')=>void; onUpdate: ()=>void; activeTimesheet: Timesheet | undefined }> = ({ user, project, addToast, onUpdate, activeTimesheet }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data: geoData, insideGeofenceIds } = useGeolocation({ geofences: [{ id: project.id, lat: project.location.lat, lng: project.location.lng, radius: project.geofenceRadius || 200 }]});
    const isInsideGeofence = insideGeofenceIds.has(project.id);

    const handleClockIn = async () => {
        if (project.geofenceRadius && !isInsideGeofence) {
            if (!window.confirm("Warning: You appear to be outside the project's geofence. Clock in anyway?")) return;
        }
        setIsSubmitting(true);
        try {
            await api.clockIn(project.id, user.id);
            addToast(`Clocked into ${project.name}`, 'success');
            onUpdate();
        } catch(e) { addToast(e instanceof Error ? e.message : "Clock-in failed", "error"); } 
        finally { setIsSubmitting(false); }
    };
    
    const handleClockOut = async () => {
        setIsSubmitting(true);
        try {
            await api.clockOut(user.id);
            addToast('Clocked out successfully', 'success');
            onUpdate();
        } catch(e) { addToast(e instanceof Error ? e.message : "Clock-out failed", "error"); } 
        finally { setIsSubmitting(false); }
    };

    return (
        <Card>
            <h3 className="font-semibold mb-2">Time Clock</h3>
            <div className={`p-2 rounded-md text-sm text-center mb-2 ${isInsideGeofence ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {isInsideGeofence ? '✅ Within project geofence' : '⚠️ Outside project geofence'}
            </div>
            {activeTimesheet ? (
                <Button variant="danger" className="w-full" onClick={handleClockOut} isLoading={isSubmitting}>Clock Out</Button>
            ) : (
                <Button className="w-full" onClick={handleClockIn} isLoading={isSubmitting}>Clock In</Button>
            )}
        </Card>
    );
};

const WeatherCard: React.FC<{ weather: Weather | null }> = ({ weather }) => (
    <Card>
        <h3 className="font-semibold mb-2">Site Weather</h3>
        {weather ? (
            <div className="flex items-center gap-4">
                <div className="text-5xl">{weather.icon}</div>
                <div>
                    <p className="text-3xl font-bold">{weather.temperature}°C</p>
                    <p className="text-muted-foreground">{weather.condition}</p>
                    <p className="text-sm text-muted-foreground">Wind: {weather.windSpeed} km/h</p>
                </div>
            </div>
        ) : <p className="text-muted-foreground">Loading weather...</p>}
    </Card>
);

const DailyAssignmentsCard: React.FC<{ tasks: Todo[]; onTaskReorder: (tasks: Todo[])=>void; }> = ({ tasks, onTaskReorder }) => {
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const handleDragSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        const newTasks = [...tasks];
        const dragItemContent = newTasks.splice(dragItem.current, 1)[0];
        newTasks.splice(dragOverItem.current, 0, dragItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        onTaskReorder(newTasks);
    };

    return (
        <Card className="h-full">
            <h2 className="font-semibold text-lg mb-2">My Daily Assignments</h2>
            {tasks.length > 0 ? (
                <div className="space-y-2">
                    {tasks.map((task, index) => (
                        <div key={task.id} draggable onDragStart={() => dragItem.current = index} onDragEnter={() => dragOverItem.current = index} onDragEnd={handleDragSort} onDragOver={e=>e.preventDefault()} className="p-3 bg-background rounded-md border flex justify-between items-center cursor-grab active:cursor-grabbing">
                            <span className="font-medium text-sm">{task.text}</span>
                            <PriorityDisplay priority={task.priority} />
                        </div>
                    ))}
                </div>
            ) : <p className="text-muted-foreground">No active tasks assigned.</p>}
        </Card>
    );
};

const SiteUpdatesCard: React.FC<{ project: Project; user: User; addToast: (m:string,t:'success'|'error')=>void; onUpdate: ()=>void; siteUpdates: SiteUpdate[]; userMap: Map<string, User> }> = ({ project, user, addToast, onUpdate, siteUpdates, userMap }) => {
    const [text, setText] = useState('');
    const [photo, setPhoto] = useState<File|null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        setIsSubmitting(true);
        try {
            await api.createSiteUpdate({
                projectId: project.id,
                text,
                imageUrl: photo ? `https://picsum.photos/seed/${project.id}-${Date.now()}/400/200` : undefined,
            }, user.id);
            addToast("Site update posted.", "success");
            onUpdate();
            setText(''); setPhoto(null);
        } catch(err) { addToast("Failed to post update.", "error"); }
        finally { setIsSubmitting(false); }
    }

    return (
        <Card className="h-full flex flex-col">
            <h2 className="font-semibold text-lg mb-2">Job Site Updates</h2>
            <div className="flex-grow space-y-3 overflow-y-auto mb-4 pr-2">
                {siteUpdates.map(update => {
                    const author = userMap.get(update.userId);
                    const authorName = author ? `${author.firstName} ${author.lastName}` : 'Unknown User';
                    return (
                    <div key={update.id} className="p-2 bg-background rounded">
                        <p className="text-sm">{update.text}</p>
                        {update.imageUrl && <img src={update.imageUrl} className="mt-2 rounded-md" alt="Site update"/>}
                        <p className="text-xs text-muted-foreground mt-1">{authorName} - {new Date(update.timestamp).toLocaleTimeString()}</p>
                    </div>
                )})}
            </div>
            <form onSubmit={handleSubmit} className="mt-auto space-y-2 pt-2 border-t">
                 <textarea value={text} onChange={e=>setText(e.target.value)} rows={2} placeholder="Post an update..." className="w-full p-2 border rounded-md"/>
                 <div className="flex justify-between items-center">
                    <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} className="text-xs"/>
                    <Button size="sm" type="submit" isLoading={isSubmitting}>Post</Button>
                 </div>
            </form>
        </Card>
    );
};

const TeamChatCard: React.FC<{ project: Project; user: User; onUpdate: ()=>void; messages: ProjectMessage[]; userMap: Map<string, User> }> = ({ project, user, onUpdate, messages, userMap }) => {
    const [content, setContent] = useState('');
    const [isSending, setIsSending] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!content.trim()) return;
        setIsSending(true);
        try {
            await api.sendProjectMessage({ projectId: project.id, content }, user.id);
            onUpdate();
            setContent('');
        } catch(err) { console.error(err); }
        finally { setIsSending(false); }
    }

    return (
        <Card className="h-full flex flex-col">
            <h2 className="font-semibold text-lg mb-2">Team Broadcast</h2>
            <div className="flex-grow space-y-3 overflow-y-auto mb-2 pr-2">
                {messages.map(msg => {
                    const sender = userMap.get(msg.senderId);
                    const senderName = sender ? `${sender.firstName} ${sender.lastName}` : '?';
                    return (
                    <div key={msg.id} className={`flex items-start gap-2 ${msg.senderId === user.id ? 'flex-row-reverse' : ''}`}>
                        <Avatar name={senderName} className="w-6 h-6 text-xs flex-shrink-0" />
                        <div className={`p-2 rounded-lg max-w-xs text-sm ${msg.senderId === user.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                            {msg.content}
                        </div>
                    </div>
                )})}
                <div ref={chatEndRef}></div>
            </div>
            <div className="mt-auto pt-2 border-t flex gap-2">
                <input value={content} onChange={e=>setContent(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Message the team..." className="w-full p-2 border rounded-md"/>
                <Button onClick={handleSend} isLoading={isSending}>Send</Button>
            </div>
        </Card>
    );
};


export const ForemanDashboard: React.FC<ForemanDashboardProps> = ({ user, addToast }) => {
    const [loading, setLoading] = useState(true);
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const [myTasks, setMyTasks] = useState<Todo[]>([]);
    const [crew, setCrew] = useState<User[]>([]);
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [siteUpdates, setSiteUpdates] = useState<SiteUpdate[]>([]);
    const [projectMessages, setProjectMessages] = useState<ProjectMessage[]>([]);
    const [weather, setWeather] = useState<Weather | null>(null);
    const [activeTimesheet, setActiveTimesheet] = useState<Timesheet | undefined>(undefined);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);

    const userMap = useMemo(() => new Map(allUsers.map(u => [u.id, u])), [allUsers]);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchData = useCallback(async () => {
        const controller = new AbortController();
        abortControllerRef.current?.abort();
        abortControllerRef.current = controller;

        setLoading(true);
        try {
            if (!user.companyId) return;
            const [userProjects, allCompanyUsers, tsData] = await Promise.all([
                api.getProjectsByUser(user.id, { signal: controller.signal }),
                api.getUsersByCompany(user.companyId, { signal: controller.signal }),
                api.getTimesheetsByUser(user.id, { signal: controller.signal }),
            ]);

            if (controller.signal.aborted) return;
            setAllUsers(allCompanyUsers);
            if (controller.signal.aborted) return;
            setActiveTimesheet(tsData.find(ts => ts.clockOut === null));
            const activeProject = userProjects.find(p => p.status === 'ACTIVE');
            if (controller.signal.aborted) return;
            setCurrentProject(activeProject || null);

            if (activeProject) {
                const [allProjectTasks, allCompanyEquipment, allAssignments, updates, messages, weatherData] = await Promise.all([
                    api.getTodosByProjectIds([activeProject.id], { signal: controller.signal }),
                    api.getEquipmentByCompany(user.companyId, { signal: controller.signal }),
                    api.getResourceAssignments(user.companyId, { signal: controller.signal }),
                    api.getSiteUpdatesByProject(activeProject.id, { signal: controller.signal }),
                    api.getProjectMessages(activeProject.id, { signal: controller.signal }),
                    api.getWeatherForLocation(activeProject.location.lat, activeProject.location.lng, { signal: controller.signal })
                ]);

                if (controller.signal.aborted) return;
                setMyTasks(allProjectTasks.filter(t => t.assigneeId === user.id && t.status !== TodoStatus.DONE).sort((a,b) => (b.priority === TodoPriority.HIGH ? 1 : -1) - (a.priority === TodoPriority.HIGH ? 1 : -1)));

                const crewIds = new Set(allAssignments.filter(a => a.projectId === activeProject.id && a.resourceType === 'user').map(a => a.resourceId));
                if (controller.signal.aborted) return;
                setCrew(allCompanyUsers.filter(u => crewIds.has(u.id) && u.id !== user.id));

                const currentProjectEquipmentIds = new Set(allAssignments.filter(a => a.projectId === activeProject.id && a.resourceType === 'equipment').map(a=>a.resourceId));
                if (controller.signal.aborted) return;
                setEquipment(allCompanyEquipment.filter(e => currentProjectEquipmentIds.has(e.id)));

                if (controller.signal.aborted) return;
                setSiteUpdates(updates);
                if (controller.signal.aborted) return;
                setProjectMessages(messages);
                if (controller.signal.aborted) return;
                setWeather(weatherData);
            }
        } catch (error) {
            if (controller.signal.aborted) return;
            addToast("Failed to load foreman dashboard data.", "error");
        } finally {
            if (controller.signal.aborted) return;
            setLoading(false);
        }
    }, [user, addToast]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Auto-refresh every 30s
        return () => {
            clearInterval(interval);
            abortControllerRef.current?.abort();
        };
    }, [fetchData]);

    if (loading) {
        return <DashboardSkeleton />;
    }

    if (!currentProject) {
        return <Card>You are not currently assigned to an active project.</Card>
    }

    return (
       <ErrorBoundary>
            {isIncidentModalOpen && <ReportIncidentModal project={currentProject} user={user} onClose={() => setIsIncidentModalOpen(false)} addToast={addToast} onSuccess={fetchData} />}
            <div className="space-y-6">
                 <div>
                    <h1 className="text-3xl font-bold text-foreground">Foreman Dashboard</h1>
                    <p className="text-muted-foreground">Live overview for <strong>{currentProject.name}</strong></p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Column 1 */}
                    <div className="space-y-6">
                         <div className="grid grid-cols-2 gap-6">
                            <TimeClockCard user={user} project={currentProject} addToast={addToast} onUpdate={fetchData} activeTimesheet={activeTimesheet} />
                            <WeatherCard weather={weather} />
                         </div>
                         <DailyAssignmentsCard tasks={myTasks} onTaskReorder={setMyTasks} />
                    </div>
                     {/* Column 2 */}
                    <div className="space-y-6">
                        <SiteUpdatesCard project={currentProject} user={user} addToast={addToast} onUpdate={fetchData} siteUpdates={siteUpdates} userMap={userMap} />
                        <Card>
                            <h2 className="font-semibold text-lg mb-2">Field Issue Reporting</h2>
                            <p className="text-sm text-muted-foreground mb-4">Log any safety concerns, hazards, or quality issues observed on site.</p>
                            <Button variant="danger" className="w-full" onClick={() => setIsIncidentModalOpen(true)}>Report a New Issue</Button>
                        </Card>
                    </div>
                     {/* Column 3 */}
                    <div className="space-y-6">
                         <TeamChatCard project={currentProject} user={user} onUpdate={fetchData} messages={projectMessages} userMap={userMap} />
                         <Card>
                             <h2 className="font-semibold text-lg mb-2">Crew Status</h2>
                             <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                                {crew.map(member => {
                                    const memberName = `${member.firstName} ${member.lastName}`;
                                    return (
                                        <div key={member.id} className="flex items-center gap-4">
                                            <Avatar name={memberName} imageUrl={member.avatar}/>
                                            <p className="font-semibold">{memberName}</p>
                                        </div>
                                    );
                                })}
                            </div>
                         </Card>
                         <Card>
                            <h2 className="font-semibold text-lg mb-2">On-site Equipment</h2>
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                {equipment.map(item => (
                                    <div key={item.id} className="flex justify-between">
                                        <span>{item.name}</span>
                                        <EquipmentStatusBadge status={item.status} />
                                    </div>
                                ))}
                            </div>
                         </Card>
                    </div>
                </div>
            </div>
       </ErrorBoundary>
    );
};