import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Login } from './components/Login';
import { User, View, Project, Timesheet, TimesheetStatus, Permission, SafetyIncident, IncidentStatus, Role } from './types';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/Dashboard';
import { ProjectDetailView } from './components/ProjectDetailView';
import { DocumentsView } from './components/DocumentsView';
import { SafetyView } from './components/SafetyView';
import { TimesheetsView } from './components/TimesheetsView';
import { SettingsView } from './components/SettingsView';
import { TeamView } from './components/TeamView';
import { ToolsView } from './components/ToolsView';
import { FinancialsView } from './components/FinancialsView';
import { EquipmentView } from './components/EquipmentView';
import { TimeTrackingView } from './components/TimeTrackingView';
import { ProjectsView } from './components/ProjectsView';
import { ChatView } from './components/ChatView';
import { CommandPalette } from './components/CommandPalette';
import { AISearchModal } from './components/AISearchModal';
import { TemplatesView } from './components/TemplatesView';
import { AllTasksView } from './components/AllTasksView';
import { MyDayView } from './components/MyDayView';
import { useCommandPalette } from './hooks/useCommandPalette';
import { useOfflineSync } from './hooks/useOfflineSync';
import { useReminderService } from './hooks/useReminderService';
import { api } from './services/mockApi';
import { hasPermission } from './services/auth';
import { ProjectsMapView } from './components/ProjectsMapView';
import { PrincipalAdminDashboard } from './components/PrincipalAdminDashboard';

interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error';
}

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [activeView, setActiveView] = useState<View>('dashboard');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [isAiSearchOpen, setIsAiSearchOpen] = useState(false);
    const [pendingTimesheetCount, setPendingTimesheetCount] = useState(0);
    const [openIncidentCount, setOpenIncidentCount] = useState(0);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const [chatRecipient, setChatRecipient] = useState<User | null>(null);


    const { isOnline } = useOfflineSync(addToast);
    useReminderService(user);
    const { isCommandPaletteOpen, setIsCommandPaletteOpen } = useCommandPalette();

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    useEffect(() => {
        if (user?.companyId) {
            api.getCompanySettings(user.companyId)
                .then(settings => {
                    setTheme(settings.theme);
                })
                .catch(err => {
                    console.error("Failed to load user theme setting.", err);
                    addToast("Could not load theme settings.", "error");
                });
        }
    }, [user]);

    useEffect(() => {
        if (!user) return;
        const intervals: number[] = [];

        // Fetch pending timesheets for managers/admins
        if (hasPermission(user, Permission.MANAGE_TIMESHEETS)) {
            const fetchPendingCount = async () => {
                try {
                    let timesheets: Timesheet[];
                    if (user.role === Role.ADMIN) {
                        timesheets = await api.getTimesheetsByCompany(user.companyId!, user.id);
                    } else { // PM
                        timesheets = await api.getTimesheetsForManager(user.id);
                    }
                    const pendingCount = timesheets.filter(ts => ts.status === TimesheetStatus.PENDING).length;
                    setPendingTimesheetCount(pendingCount);
                } catch (error) {
                    console.error("Failed to fetch pending timesheet count", error);
                }
            };
            fetchPendingCount();
            intervals.push(window.setInterval(fetchPendingCount, 60000));
        } else {
            setPendingTimesheetCount(0);
        }

        // Fetch open safety incidents for relevant staff
        if (hasPermission(user, Permission.MANAGE_SAFETY_REPORTS)) {
            const fetchOpenIncidents = async () => {
                try {
                   const incidents = await api.getSafetyIncidentsByCompany(user.companyId!);
                   const openCount = incidents.filter(i => i.status !== IncidentStatus.RESOLVED).length;
                   setOpenIncidentCount(openCount);
                } catch (e) {
                   console.error("failed to fetch open incidents", e)
                }
           }
           fetchOpenIncidents();
           intervals.push(window.setInterval(fetchOpenIncidents, 60000));
        } else {
            setOpenIncidentCount(0);
        }
        
        // Fetch unread message count
        if (hasPermission(user, Permission.SEND_DIRECT_MESSAGE)) {
            const fetchUnreadCount = async () => {
                try {
                    const conversations = await api.getConversationsForUser(user.id);
                    let count = 0;
                    for (const convo of conversations) {
                        if (convo.lastMessage && convo.lastMessage.senderId !== user.id && !convo.lastMessage.isRead) {
                            count++;
                        }
                    }
                    setUnreadMessageCount(count);
                } catch (e) {
                    console.error("Failed to fetch unread message count", e);
                }
            };
            fetchUnreadCount();
            intervals.push(window.setInterval(fetchUnreadCount, 15000)); // Check for new messages more frequently
        } else {
            setUnreadMessageCount(0);
        }


        return () => {
            intervals.forEach(clearInterval);
        };
    }, [user]);

    function addToast(message: string, type: 'success' | 'error' = 'success') {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(currentToasts => currentToasts.filter(t => t.id !== id));
        }, 4000);
    }

    const handleLogin = (loggedInUser: User) => {
        setUser(loggedInUser);
        if (loggedInUser.role === Role.PRINCIPAL_ADMIN) {
            setActiveView('principal-dashboard');
        } else if (loggedInUser.role === Role.OPERATIVE || loggedInUser.role === Role.FOREMAN) {
            setActiveView('my-day');
        } else {
            setActiveView('dashboard');
        }
    };

    const handleLogout = () => {
        setUser(null);
    };

    const handleSelectProject = (project: Project) => {
        setSelectedProject(project);
        setActiveView('projects'); // This will trigger the detail view render
    };
    
    const handleStartChat = (recipient: User) => {
        setChatRecipient(recipient);
        setActiveView('chat');
    };

    const renderView = () => {
        if (!user) return null;
        if (selectedProject && activeView === 'projects') {
            return <ProjectDetailView project={selectedProject} user={user!} onBack={() => setSelectedProject(null)} addToast={addToast} isOnline={isOnline} onStartChat={handleStartChat} />;
        }

        switch (activeView) {
            case 'dashboard':
                return <Dashboard user={user!} addToast={addToast} activeView={activeView} setActiveView={setActiveView} onSelectProject={handleSelectProject} />;
            case 'my-day':
                return <MyDayView user={user!} addToast={addToast} setActiveView={setActiveView} />;
            case 'principal-dashboard':
                return <PrincipalAdminDashboard user={user!} addToast={addToast} />;
            case 'projects':
                return <ProjectsView user={user!} addToast={addToast} onSelectProject={handleSelectProject} />;
            case 'documents':
                return <DocumentsView user={user!} addToast={addToast} isOnline={isOnline} />;
            case 'safety':
                 return <SafetyView user={user!} addToast={addToast} />;
            case 'timesheets':
                return <TimesheetsView user={user!} addToast={addToast} />;
            case 'time':
                return <TimeTrackingView user={user!} addToast={addToast} setActiveView={setActiveView} />;
            case 'settings':
                return <SettingsView user={user!} addToast={addToast} theme={theme} setTheme={setTheme} />;
            case 'users':
                return <TeamView user={user!} addToast={addToast} onStartChat={handleStartChat} />;
            case 'chat':
                return <ChatView user={user!} addToast={addToast} initialRecipient={chatRecipient} />;
            case 'tools':
                return <ToolsView user={user!} addToast={addToast} setActiveView={setActiveView} />;
            case 'financials':
                 return <FinancialsView user={user!} addToast={addToast} />;
            case 'equipment':
                return <EquipmentView user={user!} addToast={addToast} />;
            case 'templates':
                return <TemplatesView user={user!} addToast={addToast} />;
            case 'all-tasks':
                return <AllTasksView user={user!} addToast={addToast} isOnline={isOnline} />;
            case 'map':
                return <ProjectsMapView user={user!} addToast={addToast} />;
            default:
                return <Dashboard user={user!} addToast={addToast} activeView={activeView} setActiveView={setActiveView} onSelectProject={handleSelectProject} />;
        }
    };

    if (!user) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div className={`flex h-screen bg-slate-100 font-sans ${theme}`}>
            <Sidebar 
                user={user} 
                activeView={activeView} 
                setActiveView={setActiveView} 
                onLogout={handleLogout} 
                pendingTimesheetCount={pendingTimesheetCount}
                openIncidentCount={openIncidentCount}
                unreadMessageCount={unreadMessageCount}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header user={user} onLogout={handleLogout} onSearchClick={() => setIsAiSearchOpen(true)} onCommandPaletteClick={() => setIsCommandPaletteOpen(true)} />
                 {!isOnline && (
                    <div className="bg-yellow-500 text-center text-white p-2 font-semibold flex-shrink-0">
                        You are currently offline. Changes are being saved locally.
                    </div>
                )}
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    {renderView()}
                </main>
            </div>
             {isCommandPaletteOpen && (
                <CommandPalette
                    user={user}
                    onClose={() => setIsCommandPaletteOpen(false)}
                    setActiveView={setActiveView}
                />
            )}
            {isAiSearchOpen && (
                <AISearchModal
                    user={user}
                    currentProject={selectedProject}
                    onClose={() => setIsAiSearchOpen(false)}
                    addToast={addToast}
                />
            )}
            <div className="fixed bottom-4 right-4 z-[100] space-y-2">
                {toasts.map(toast => (
                    <div key={toast.id} className={`px-4 py-2 rounded-md shadow-lg text-white animate-toast-in ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                        {toast.message}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default App;