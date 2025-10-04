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
import { api, hasSession } from './services/apiService';
import { hasPermission } from './services/auth';
import { ProjectsMapView } from './components/ProjectsMapView';
import { PrincipalAdminDashboard } from './components/PrincipalAdminDashboard';
import { socketService } from './services/socketService';

interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error';
}

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [appLoading, setAppLoading] = useState(true);
    const [activeView, setActiveView] = useState<View>('dashboard');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [isAiSearchOpen, setIsAiSearchOpen] = useState(false);
    const [pendingTimesheetCount, setPendingTimesheetCount] = useState(0);
    const [openIncidentCount, setOpenIncidentCount] = useState(0);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const [chatRecipient, setChatRecipient] = useState<User | null>(null);

    const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(currentToasts => currentToasts.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const { isOnline } = useOfflineSync(addToast);
    useReminderService(user);
    const { isCommandPaletteOpen, setIsCommandPaletteOpen } = useCommandPalette();
    
    const handleLogin = (loggedInUser: User, token: string) => {
        setUser(loggedInUser);
        socketService.connect(token);
        if (loggedInUser.role === Role.PRINCIPAL_ADMIN) {
            setActiveView('principal-dashboard');
        } else if (loggedInUser.role === Role.OPERATIVE || loggedInUser.role === Role.FOREMAN) {
            setActiveView('my-day');
        } else {
            setActiveView('map');
        }
    };

    useEffect(() => {
        const checkSession = async () => {
            if (hasSession()) {
                try {
                    const { user: profile, token } = await api.getProfile();
                    if(profile && token) {
                        handleLogin(profile, token);
                    } else {
                         api.logout();
                    }
                } catch (error) {
                    api.logout();
                }
            }
            setAppLoading(false);
        };
        checkSession();
    }, []);
    
    useEffect(() => {
        if(user) {
            socketService.on<{ message: string; type: 'success' | 'error' }>('notification', (data) => {
                addToast(data.message, data.type);
            });
        }
        return () => {
            socketService.off('notification');
        }
    }, [user, addToast]);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    const handleLogout = () => {
        socketService.disconnect();
        api.logout();
        setUser(null);
        setActiveView('dashboard');
    };

    const handleSelectProject = (project: Project) => {
        setSelectedProject(project);
        setActiveView('projects');
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
            case 'dashboard': return <Dashboard user={user!} addToast={addToast} activeView={activeView} setActiveView={setActiveView} onSelectProject={handleSelectProject} />;
            case 'my-day': return <MyDayView user={user!} addToast={addToast} setActiveView={setActiveView} />;
            case 'principal-dashboard': return <PrincipalAdminDashboard user={user!} addToast={addToast} />;
            case 'projects': return <ProjectsView user={user!} addToast={addToast} onSelectProject={handleSelectProject} />;
            case 'documents': return <DocumentsView user={user!} addToast={addToast} isOnline={isOnline} />;
            case 'safety': return <SafetyView user={user!} addToast={addToast} />;
            case 'timesheets': return <TimesheetsView user={user!} addToast={addToast} />;
            case 'time': return <TimeTrackingView user={user!} addToast={addToast} setActiveView={setActiveView} />;
            case 'settings': return <SettingsView user={user!} addToast={addToast} theme={theme} setTheme={setTheme} />;
            case 'users': return <TeamView user={user!} addToast={addToast} onStartChat={handleStartChat} />;
            case 'chat': return <ChatView user={user!} addToast={addToast} initialRecipient={chatRecipient} />;
            case 'tools': return <ToolsView user={user!} addToast={addToast} setActiveView={setActiveView} />;
            case 'financials': return <FinancialsView user={user!} addToast={addToast} />;
            case 'equipment': return <EquipmentView user={user!} addToast={addToast} />;
            case 'templates': return <TemplatesView user={user!} addToast={addToast} />;
            case 'all-tasks': return <AllTasksView user={user!} addToast={addToast} isOnline={isOnline} />;
            case 'map': return <ProjectsMapView user={user!} addToast={addToast} />;
            default: return <Dashboard user={user!} addToast={addToast} activeView={activeView} setActiveView={setActiveView} onSelectProject={handleSelectProject} />;
        }
    };

    if (appLoading) {
        return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div className={`flex h-screen bg-background font-sans`}>
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