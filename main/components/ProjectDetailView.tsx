import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Project, Todo, Document, SafetyIncident, Permission, TodoStatus, ProjectAssignment } from '../types';
import { api } from '../services/mockApi';
import { hasPermission } from '../services/auth';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { KanbanBoard } from './KanbanBoard';
import { DocumentStatusBadge } from './ui/StatusBadge';
import { MapView, MapMarker } from './MapView';

interface ProjectDetailViewProps {
  project: Project;
  user: User;
  onBack: () => void;
  addToast: (message: string, type: 'success' | 'error') => void;
  isOnline: boolean;
  onStartChat: (user: User) => void;
}

type Tab = 'overview' | 'tasks' | 'documents' | 'team' | 'safety';

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project, user, onBack, addToast, isOnline, onStartChat }) => {
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [todos, setTodos] = useState<Todo[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [team, setTeam] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [todosData, documentsData, allAssignments, allUsers] = await Promise.all([
                api.getTodosByProjectIds([project.id]),
                api.getDocumentsByProjectIds([project.id]),
                api.getProjectAssignmentsByCompany(user.companyId!),
                api.getUsersByCompany(user.companyId!)
            ]);
            setTodos(todosData);
            setDocuments(documentsData);

            const projectAssignments = allAssignments.filter(a => a.projectId === project.id);
            const teamMembers = allUsers.filter(u => projectAssignments.some(pa => pa.userId === u.id));
            setTeam(teamMembers);

        } catch (error) {
            addToast("Failed to load project details.", "error");
        } finally {
            setLoading(false);
        }
    }, [project.id, user.companyId, addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const overdueTaskCount = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0); // To compare dates only, tasks due today are not overdue yet.
        return todos.filter(
            todo => todo.dueDate && new Date(todo.dueDate) < now && todo.status !== TodoStatus.DONE
        ).length;
    }, [todos]);
    
    const handleUpdateTask = async (taskId: number | string, updates: Partial<Todo>) => {
        try {
            const updatedTask = await api.updateTodo(taskId, updates, user.id);
            setTodos(currentTodos => currentTodos.map(t => t.id === taskId ? updatedTask : t));
            addToast("Task updated successfully", "success");
        } catch (error) {
            addToast("Failed to update task", "error");
        }
    };
    
    const mapMarkers: MapMarker[] = useMemo(() => [
        { lat: project.location.lat, lng: project.location.lng, radius: project.geofenceRadius, popupContent: project.name }
    ], [project]);


    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={onBack}>&larr; All Projects</Button>
                <h2 className="text-3xl font-bold text-slate-800">{project.name}</h2>
                {overdueTaskCount > 0 && (
                    <div className="flex items-center gap-1.5 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>{overdueTaskCount} Overdue Task{overdueTaskCount > 1 ? 's' : ''}</span>
                    </div>
                )}
            </div>
            
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6">
                    {(['overview', 'tasks', 'documents', 'team'] as Tab[]).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`capitalize whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === tab ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {loading ? <Card><p>Loading project data...</p></Card> : (
                <>
                    {activeTab === 'overview' && (
                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2">
                               <h3 className="font-semibold text-lg mb-2">Project Details</h3>
                               <p>{project.projectType} - {project.workClassification}</p>
                               <MapView markers={mapMarkers} height="h-80" />
                            </Card>
                             <div className="space-y-6">
                                <Card>
                                     <h3 className="font-semibold text-lg mb-2">Financials</h3>
                                     <p>Budget: £{project.budget.toLocaleString()}</p>
                                     <p>Actual Cost: £{project.actualCost.toLocaleString()}</p>
                                 </Card>
                                 <Card>
                                     <h3 className="font-semibold text-lg mb-4">Key Metrics</h3>
                                     <div className="space-y-4">
                                        <div className="flex items-center text-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                            <span className="text-slate-600">Team Members</span>
                                            <span className="ml-auto font-semibold text-slate-800 bg-slate-100 rounded-full px-2.5 py-0.5">{team.length}</span>
                                        </div>
                                        <div className="flex items-center text-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                            <span className="text-slate-600">Open Tasks</span>
                                            <span className="ml-auto font-semibold text-slate-800 bg-slate-100 rounded-full px-2.5 py-0.5">{todos.filter(t => t.status !== TodoStatus.DONE).length}</span>
                                        </div>
                                        <div className="flex items-center text-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <span className="text-slate-600">Overdue Tasks</span>
                                            <span className={`ml-auto font-bold text-lg ${overdueTaskCount > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                                                {overdueTaskCount}
                                            </span>
                                        </div>
                                    </div>
                                 </Card>
                             </div>
                        </div>
                    )}
                    {activeTab === 'tasks' && <KanbanBoard todos={todos} onUpdateTodo={handleUpdateTask} personnel={team} user={user} />}
                    {activeTab === 'documents' && <Card>
                        <h3 className="font-semibold text-lg mb-4">Project Documents</h3>
                        {documents.map(doc => (
                            <div key={doc.id} className="p-2 border-b flex justify-between items-center">
                                <span>{doc.name}</span>
                                <DocumentStatusBadge status={doc.status} />
                            </div>
                        ))}
                        {documents.length === 0 && <p>No documents for this project.</p>}
                    </Card>}
                    {activeTab === 'team' && <Card>
                        <h3 className="font-semibold text-lg mb-4">Project Team</h3>
                        {team.map(member => (
                            <div key={member.id} className="p-2 border-b flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{member.name}</p>
                                    <p className="text-sm text-slate-500">{member.role}</p>
                                </div>
                                <Button size="sm" variant="secondary" onClick={() => onStartChat(member)}>Message</Button>
                            </div>
                        ))}
                    </Card>}
                </>
            )}
        </div>
    );
};