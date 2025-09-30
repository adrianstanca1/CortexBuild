// full contents of components/TeamView.tsx

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { User, Role, Permission, AvailabilityStatus, Project, ProjectAssignment } from '../types';
import { api } from '../services/mockApi';
import { hasPermission } from '../services/auth';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import { Tag } from './ui/Tag';

interface TeamViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  onStartChat: (recipient: User) => void;
}

const availabilityTagColor: Record<AvailabilityStatus, 'green' | 'blue' | 'gray'> = {
    [AvailabilityStatus.AVAILABLE]: 'green',
    [AvailabilityStatus.ON_PROJECT]: 'blue',
    [AvailabilityStatus.ON_LEAVE]: 'gray',
};

const UserModal: React.FC<{
    loggedInUser: User;
    member: User | null; // null for 'add' mode
    projects: Project[];
    allAssignments: ProjectAssignment[];
    onClose: () => void;
    onSuccess: () => void;
    addToast: (m: string, t: 'success' | 'error') => void;
    onStartChat: (recipient: User) => void;
}> = ({ loggedInUser, member, projects, allAssignments, onClose, onSuccess, addToast, onStartChat }) => {
    const [formData, setFormData] = useState<Partial<User>>({});
    const [assignedProjectIds, setAssignedProjectIds] = useState<Set<string | number>>(new Set());
    const [performance, setPerformance] = useState<{ totalHours: number; tasksCompleted: number } | null>(null);
    const [activeTab, setActiveTab] = useState<'details' | 'performance' | 'assignments'>('details');
    const [newSkill, setNewSkill] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [projectSearch, setProjectSearch] = useState('');

    const isAddMode = !member;
    const canManage = hasPermission(loggedInUser, Permission.MANAGE_TEAM);

    useEffect(() => {
        const initialFormData = isAddMode ? { role: Role.OPERATIVE, availability: AvailabilityStatus.AVAILABLE, skills: [] } : { ...member };
        setFormData(initialFormData);

        if (member) {
            const memberAssignments = allAssignments.filter(a => a.userId === member.id).map(a => a.projectId);
            setAssignedProjectIds(new Set(memberAssignments));
            
            api.getUserPerformanceMetrics(member.id).then(setPerformance);
        } else {
            setAssignedProjectIds(new Set());
            setPerformance(null);
        }
    }, [member, allAssignments, isAddMode]);

    const handleInputChange = (field: keyof User, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSkillAdd = () => {
        if (newSkill && !formData.skills?.includes(newSkill)) {
            handleInputChange('skills', [...(formData.skills || []), newSkill]);
            setNewSkill('');
        }
    };
    
    const handleSkillRemove = (skill: string) => {
        handleInputChange('skills', formData.skills?.filter(s => s !== skill));
    };
    
    const handleProjectToggle = (projectId: string | number) => {
        setAssignedProjectIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(projectId)) newSet.delete(projectId);
            else newSet.add(projectId);
            return newSet;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (isAddMode) {
                await api.createUser(formData as Omit<User, 'id'|'companyId'>, loggedInUser.id);
                addToast("Team member added.", "success");
            } else if (member) {
                await api.updateUser(member.id, formData, Array.from(assignedProjectIds), loggedInUser.id);
                addToast("Profile updated.", "success");
            }
            onSuccess();
            onClose();
        } catch (error) {
            addToast(error instanceof Error ? error.message : "Failed to save changes.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const renderDetailsTab = () => (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderFormField('First Name', 'text', 'firstName')}
                {renderFormField('Last Name', 'text', 'lastName')}
                {renderFormField('Email', 'email', 'email', isAddMode)}
                {renderFormField('Phone', 'tel', 'phone')}
                {renderSelectField('Role', 'role', Object.values(Role).filter(r => r !== Role.PRINCIPAL_ADMIN))}
                {renderSelectField('Availability', 'availability', Object.values(AvailabilityStatus))}
            </div>
            <div className="mt-4">
                <label className="block text-sm font-medium text-muted-foreground">Skills</label>
                <div className="flex flex-wrap gap-2 mt-1">
                    {formData.skills?.map(skill => <Tag key={skill} label={skill} onDoubleClick={canManage ? () => handleSkillRemove(skill) : undefined} />)}
                </div>
                {canManage && (
                    <div className="flex gap-2 mt-2">
                        <input value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="Add a skill" className="flex-grow p-1 border rounded bg-background"/>
                        <Button type="button" size="sm" variant="secondary" onClick={handleSkillAdd}>Add</Button>
                    </div>
                )}
            </div>
        </>
    );
    
    const renderFormField = (label: string, type: string, field: keyof User, forceEditable = true) => (
        <div>
            <label className="block text-sm font-medium text-muted-foreground">{label}</label>
            {canManage && forceEditable ? (
                <input type={type} value={String(formData[field] || '')} onChange={e => handleInputChange(field, e.target.value)} className="w-full p-2 border rounded bg-background"/>
            ) : (
                <p className="p-2 text-foreground">{String(formData[field] || 'N/A')}</p>
            )}
        </div>
    );
    
    const renderSelectField = (label: string, field: keyof User, options: string[]) => (
         <div>
            <label className="block text-sm font-medium text-muted-foreground">{label}</label>
            {canManage ? (
                <select value={String(formData[field] || '')} onChange={e => handleInputChange(field, e.target.value)} className="w-full p-2 border rounded bg-background">
                    {options.map(opt => <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>)}
                </select>
            ) : (
                <p className="p-2 text-foreground">{String(formData[field] || 'N/A').replace(/_/g, ' ')}</p>
            )}
        </div>
    );
    
    const renderPerformanceTab = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <Card className="text-center"><p className="text-sm">Total Hours Logged</p><p className="text-3xl font-bold">{performance?.totalHours || 0}</p></Card>
                <Card className="text-center"><p className="text-sm">Tasks Completed</p><p className="text-3xl font-bold">{performance?.tasksCompleted || 0}</p></Card>
            </div>
        </div>
    );

    const renderAssignmentsTab = () => {
        const assignedProjects = projects.filter(p => assignedProjectIds.has(p.id));

        const filteredProjectsForEditing = projects.filter(p =>
            p.name.toLowerCase().includes(projectSearch.toLowerCase())
        );

        return (
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-muted-foreground mb-2">Currently Assigned Projects</h4>
                    {assignedProjects.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {assignedProjects.map(p => <Tag key={p.id} label={p.name} color="blue" />)}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Not assigned to any projects.</p>
                    )}
                </div>
                
                {canManage && (
                    <div className="pt-4 border-t">
                        <h4 className="font-semibold text-muted-foreground mb-2">Edit Assignments</h4>
                        <input
                            type="text"
                            placeholder="Search projects to assign..."
                            value={projectSearch}
                            onChange={e => setProjectSearch(e.target.value)}
                            className="w-full p-2 border rounded bg-background mb-2"
                        />
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {filteredProjectsForEditing.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-2 rounded hover:bg-accent">
                                    <label htmlFor={`proj-${p.id}`} className="font-medium cursor-pointer flex-grow">{p.name}</label>
                                    <input
                                        type="checkbox"
                                        id={`proj-${p.id}`}
                                        checked={assignedProjectIds.has(p.id)}
                                        onChange={() => handleProjectToggle(p.id)}
                                        className="h-4 w-4 text-primary focus:ring-ring border-border rounded"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };


    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="w-full max-w-4xl" onClick={e=>e.stopPropagation()}>
                <Card>
                    <div className="flex gap-6">
                        <div className="w-1/3 text-center">
                            <Avatar name={`${formData.firstName || ''} ${formData.lastName || ''}`.trim() || '?'} imageUrl={formData.avatar} className="w-32 h-32 mx-auto mb-4 text-4xl"/>
                            {canManage && <Button type="button" variant="secondary" size="sm">Upload Photo</Button>}
                            <h3 className="font-bold text-2xl mt-4">{`${formData.firstName || ''} ${formData.lastName || ''}`.trim()}</h3>
                            <p className="text-muted-foreground">{formData.email}</p>
                            {!isAddMode && loggedInUser.id !== member!.id && hasPermission(loggedInUser, Permission.SEND_DIRECT_MESSAGE) && (
                                <Button size="sm" className="mt-4 w-full" onClick={() => onStartChat(member!)}>Message</Button>
                            )}
                        </div>
                        <div className="w-2/3">
                             <div className="border-b">
                                <nav className="-mb-px flex space-x-4">
                                    <button type="button" onClick={() => setActiveTab('details')} className={`py-2 px-1 border-b-2 text-sm ${activeTab==='details' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Details</button>
                                    {!isAddMode && <button type="button" onClick={() => setActiveTab('performance')} className={`py-2 px-1 border-b-2 text-sm ${activeTab==='performance' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Performance</button>}
                                    {!isAddMode && <button type="button" onClick={() => setActiveTab('assignments')} className={`py-2 px-1 border-b-2 text-sm ${activeTab==='assignments' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>Assignments</button>}
                                </nav>
                            </div>
                            <div className="pt-4">
                                {activeTab === 'details' && renderDetailsTab()}
                                {activeTab === 'performance' && renderPerformanceTab()}
                                {activeTab === 'assignments' && renderAssignmentsTab()}
                            </div>
                        </div>
                    </div>
                     <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        {canManage && <Button type="submit" isLoading={isSaving}>{isAddMode ? 'Add Member' : 'Save Changes'}</Button>}
                    </div>
                </Card>
            </form>
        </div>
    )

// --- Main Team View Component ---
export const TeamView: React.FC<TeamViewProps> = ({ user, addToast, onStartChat }) => {
    const [team, setTeam] = useState<User[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [assignments, setAssignments] = useState<ProjectAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalState, setModalState] = useState<{ mode: 'add' } | { mode: 'edit', member: User } | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchData = useCallback(async () => {
        const controller = new AbortController();
        abortControllerRef.current?.abort();
        abortControllerRef.current = controller;

        setLoading(true);
        try {
            if (!user.companyId) return;
            const [usersData, projectsData, assignmentsData] = await Promise.all([
                api.getUsersByCompany(user.companyId, { signal: controller.signal }),
                api.getProjectsByCompany(user.companyId, { signal: controller.signal }),
                api.getProjectAssignmentsByCompany(user.companyId, { signal: controller.signal }),
            ]);
            if (controller.signal.aborted) return;
            setTeam(usersData);
            if (controller.signal.aborted) return;
            setProjects(projectsData);
            if (controller.signal.aborted) return;
            setAssignments(assignmentsData);
        } catch (error) {
            if (controller.signal.aborted) return;
            addToast("Failed to load team data.", "error");
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

    const canManageTeam = hasPermission(user, Permission.MANAGE_TEAM);

    if (loading) return <Card><p>Loading team members...</p></Card>;

    return (
        <div className="space-y-6">
            {modalState && (
                <UserModal
                    loggedInUser={user}
                    member={modalState.mode === 'edit' ? modalState.member : null}
                    projects={projects}
                    allAssignments={assignments}
                    onClose={() => setModalState(null)}
                    onSuccess={fetchData}
                    addToast={addToast}
                    onStartChat={onStartChat}
                />
            )}

            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-foreground">Team Members</h2>
                {canManageTeam && <Button onClick={() => setModalState({ mode: 'add' })}>Add Member</Button>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {team.filter(member => member.role !== Role.PRINCIPAL_ADMIN).map(member => {
                    const memberName = `${member.firstName} ${member.lastName}`;
                    return (
                        <Card key={member.id} onClick={() => setModalState({ mode: 'edit', member })} className="text-center animate-card-enter cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-transform">
                            <Avatar name={memberName} imageUrl={member.avatar} className="w-24 h-24 mx-auto mb-4" />
                            <h3 className="font-bold text-lg">{memberName}</h3>
                            <p className="text-sm text-muted-foreground">{member.role.replace(/_/g, ' ')}</p>
                            <div className="mt-2">
                                 <Tag label={(member.availability || 'Unknown').replace(/_/g, ' ')} color={availabilityTagColor[member.availability || AvailabilityStatus.AVAILABLE]}/>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};