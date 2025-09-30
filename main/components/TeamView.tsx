
import React, { useState, useEffect, useMemo, useCallback } from 'react';
// FIX: Corrected import paths to be relative.
import { User, Role, Permission, Project, Timesheet, AuditLog, TimesheetStatus, ProjectAssignment, Todo, TodoStatus, UserStatus } from '../types';
import { api } from '../services/mockApi';
import { hasPermission } from '../services/auth';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { UserStatusBadge, TimesheetStatusBadge } from './ui/StatusBadge';
import { Tag } from './ui/Tag';
import { MapView, MapMarker } from './MapView';
import { Avatar } from './ui/Avatar';

interface TeamViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  onStartChat: (user: User) => void;
}

const formatDistanceToNow = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

const UserProfileModal: React.FC<{
    selectedUser: User;
    currentUser: User;
    onClose: () => void;
    addToast: (message: string, type: 'success' | 'error') => void;
    onStartChat: (user: User) => void;
}> = ({ selectedUser, currentUser, onClose, addToast, onStartChat }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
    const [activity, setActivity] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [projData, tsData, activityData] = await Promise.all([
                    api.getProjectsByUser(selectedUser.id),
                    api.getTimesheetsByUser(selectedUser.id),
                    api.getAuditLogsByActorId(selectedUser.id),
                ]);
                setProjects(projData);
                setTimesheets(tsData.slice(0, 5)); // Get last 5
                setActivity(activityData.slice(0, 7)); // Get last 7 activities
            } catch (error) {
                addToast("Failed to load user profile data.", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedUser, addToast]);
    
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="w-full max-w-3xl h-auto max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                 <div className="flex-shrink-0 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <Avatar name={selectedUser.name} className="w-20 h-20 text-3xl" />
                        <div>
                            <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
                            <p className="text-slate-500">{selectedUser.role}</p>
                            <div className="flex items-center gap-4 text-sm mt-1">
                                <a href={`mailto:${selectedUser.email}`} className="text-sky-600 hover:underline">{selectedUser.email}</a>
                                {selectedUser.phone && <span>{selectedUser.phone}</span>}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => onStartChat(selectedUser)} disabled={selectedUser.id === currentUser.id}>Message</Button>
                         {hasPermission(currentUser, Permission.MANAGE_TEAM) && <Button>Edit Roles</Button>}
                    </div>
                 </div>
                 <div className="flex-grow overflow-y-auto mt-6 pt-6 border-t space-y-6 pr-2">
                    {loading ? <p>Loading profile...</p> : (
                        <>
                            <section>
                                <h3 className="font-semibold mb-2">Assigned Projects</h3>
                                <div className="space-y-2">
                                    {projects.map(p => (
                                        <div key={p.id} className="p-3 bg-slate-50 rounded-md text-sm">{p.name}</div>
                                    ))}
                                    {projects.length === 0 && <p className="text-sm text-slate-500">Not assigned to any projects.</p>}
                                </div>
                            </section>
                             <section>
                                <h3 className="font-semibold mb-2">Recent Activity</h3>
                                <div className="space-y-3">
                                    {activity.map(log => (
                                        <div key={log.id} className="text-sm text-slate-600">
                                            <span>{log.action.replace(/_/g, ' ')}</span>
                                            {log.target?.name && <span className="font-medium text-slate-800"> "{log.target.name}"</span>}
                                            <span className="text-xs text-slate-400 ml-2">{formatDistanceToNow(log.timestamp)}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                             <section>
                                <h3 className="font-semibold mb-2">Recent Timesheets</h3>
                                <div className="border rounded-lg overflow-hidden">
                                     <table className="min-w-full text-sm">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="p-2 text-left font-medium">Date</th>
                                                <th className="p-2 text-left font-medium">Hours</th>
                                                <th className="p-2 text-left font-medium">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {timesheets.map(ts => {
                                                const hours = ts.clockOut ? ((new Date(ts.clockOut).getTime() - new Date(ts.clockIn).getTime()) / 3600000).toFixed(2) : 'Ongoing';
                                                return (
                                                    <tr key={ts.id} className="border-t">
                                                        <td className="p-2">{new Date(ts.clockIn).toLocaleDateString()}</td>
                                                        <td className="p-2">{hours}</td>
                                                        <td className="p-2"><TimesheetStatusBadge status={ts.status} /></td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </>
                    )}
                 </div>
            </Card>
        </div>
    );
};

export const TeamView: React.FC<TeamViewProps> = ({ user, addToast, onStartChat }) => {
    const [team, setTeam] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [assignments, setAssignments] = useState<ProjectAssignment[]>([]);
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isMapVisible, setIsMapVisible] = useState(false);

    const canManageTeam = hasPermission(user, Permission.MANAGE_TEAM);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (!user.companyId) return;
            const [users, projectsData, assignmentsData] = await Promise.all([
                api.getUsersByCompany(user.companyId),
                api.getProjectsByCompany(user.companyId),
                api.getProjectAssignmentsByCompany(user.companyId)
            ]);
            
            const projectIds = projectsData.map(p => p.id);
            const todosData = projectIds.length > 0 ? await api.getTodosByProjectIds(projectIds) : [];
            
            setTeam(users);
            setProjects(projectsData);
            setAssignments(assignmentsData);
            setTodos(todosData);
        } catch (error) {
            addToast("Failed to load team data.", "error");
        } finally {
            setLoading(false);
        }
    }, [user.companyId, addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const userProjectsMap = useMemo(() => {
        const map = new Map<number, Project[]>();
        const projectMap = new Map(projects.map(p => [p.id, p]));

        team.forEach(member => {
            const memberAssignments = assignments
                .filter(a => a.userId === member.id)
                .map(a => projectMap.get(a.projectId))
                .filter((p): p is Project => p !== undefined);
            map.set(member.id, memberAssignments);
        });
        return map;
    }, [team, projects, assignments]);

    const userTaskCountMap = useMemo(() => {
        const map = new Map<number, number>();
        team.forEach(member => {
            const count = todos.filter(
                todo => todo.assigneeId === member.id && todo.status !== TodoStatus.DONE
            ).length;
            map.set(member.id, count);
        });
        return map;
    }, [team, todos]);

    const mapMarkers = useMemo<MapMarker[]>(() => {
        if (!isMapVisible) return [];

        const projectMap = new Map(projects.map(p => [p.id, p]));

        return team
            .filter(member => member.status === UserStatus.ON_SITE)
            .map((member): MapMarker | null => {
                const assignment = assignments.find(a => a.userId === member.id);
                if (!assignment) return null;
                
                const project = projectMap.get(assignment.projectId);
                if (!project || !project.location) return null;

                return {
                    lat: project.location.lat,
                    lng: project.location.lng,
                    popupContent: (
                        <div>
                            <h4 className="font-bold">{member.name}</h4>
                            <p>{member.role}</p>
                        </div>
                    ),
                    status: project.status,
                };
            })
            .filter((marker): marker is MapMarker => marker !== null);
    }, [isMapVisible, team, projects, assignments]);


    const filteredTeam = useMemo(() => {
        return team.filter(member => {
            const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || member.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === 'all' || member.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [team, searchTerm, roleFilter]);

    const getProjectStatusColor = (status: Project['status']): 'green' | 'yellow' | 'gray' => {
        switch (status) {
            case 'Active': return 'green';
            case 'On Hold': return 'yellow';
            case 'Completed': return 'gray';
            default: return 'gray';
        }
    };

    if (loading) {
        return <Card><p>Loading team members...</p></Card>;
    }

    return (
        <div className="space-y-6">
            {selectedUser && <UserProfileModal selectedUser={selectedUser} currentUser={user} onClose={() => setSelectedUser(null)} addToast={addToast} onStartChat={onStartChat} />}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h2 className="text-3xl font-bold text-slate-800">Team Management</h2>
                 <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={() => setIsMapVisible(prev => !prev)}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {isMapVisible ? 'Hide Map' : 'Show on Map'}
                    </Button>
                    {canManageTeam && <Button>Add Member</Button>}
                </div>
            </div>

            <Card>
                 <div className="flex flex-col md:flex-row gap-4 mb-4 pb-4 border-b">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full md:w-1/3 p-2 border rounded-md"
                    />
                    <select
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                        className="w-full md:w-auto p-2 border bg-white rounded-md"
                    >
                        <option value="all">All Roles</option>
                        {Object.values(Role).filter(r => r !== Role.PRINCIPAL_ADMIN).map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                </div>

                {isMapVisible && <MapView markers={mapMarkers} height="h-96" />}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
                    {filteredTeam.map(member => {
                        const memberProjects = userProjectsMap.get(member.id) || [];
                        const taskCount = userTaskCountMap.get(member.id) || 0;
                        return (
                             <Card key={member.id} onClick={() => setSelectedUser(member)} className="cursor-pointer hover:shadow-lg hover:border-sky-500/50 transition-all flex flex-col p-4 animate-card-enter">
                                <div className="flex items-start gap-4">
                                    <Avatar name={member.name} className="w-12 h-12 text-lg flex-shrink-0" />
                                    <div className="flex-grow">
                                        <p className="font-bold text-slate-800">{member.name}</p>
                                        <p className="text-sm text-slate-500">{member.role}</p>
                                    </div>
                                    {member.status && <UserStatusBadge status={member.status} />}
                                </div>
                                
                                <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-3 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 font-medium">Open Tasks</span>
                                        <Tag label={String(taskCount)} color="gray" />
                                    </div>
                                    <div>
                                        <span className="text-slate-500 font-medium mb-2 block">Projects</span>
                                        <div className="flex flex-wrap gap-1">
                                             {memberProjects.length > 0 ? (
                                                <>
                                                    {memberProjects.slice(0, 2).map(p => {
                                                        const statusColor = getProjectStatusColor(p.status);
                                                        return <Tag 
                                                            key={p.id} 
                                                            label={p.name} 
                                                            color="blue" 
                                                            className="text-xs" 
                                                            title={`${p.name} (${p.status})`} 
                                                            statusIndicator={statusColor}
                                                        />
                                                    })}
                                                    {memberProjects.length > 2 && <Tag label={`+${memberProjects.length - 2} more`} color="gray" className="text-xs"/>}
                                                </>
                                            ) : (
                                                <p className="text-slate-400 text-xs italic">No projects assigned</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
};
