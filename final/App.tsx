import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Card } from './components/ui/Card';
import { Sidebar as SidebarLite } from './components/layout/SidebarLite';
import { ToolsView } from './components/ToolsView';
import type { View } from './types';

const AppInner: React.FC = () => {
  const { user, logout } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [activeView, setActiveView] = useState<View>('tools');
  const addToast = (message: string, type: 'success' | 'error') => {
    if (type === 'error') console.error(message);
    else console.log(message);
  };


<<<<<<< HEAD
  // Not authenticated: render login/registration flows
  if (!user) {
    if (mode === 'register') {
=======
  const toastStyle = isNotification ? typeClasses.notification : typeClasses[toast.type];
  const title = isNotification ? "New Notification" : (toast.type === 'success' ? "Success" : "Error");

  return (
    <div className={`${baseClasses} ${toastStyle}`}>
      <span className="text-xl mt-0.5">{getIcon()}</span>
      <div className="flex-grow">
        <p className="font-bold">{title}</p>
        <p>{toast.message}</p>
      </div>
      <button onClick={() => onDismiss(toast.id)} className="p-1 -m-1 rounded-full hover:bg-black/10 flex-shrink-0">&times;</button>
    </div>
  );
};


function App() {
  const { isAuthenticated, user, loading, logout } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot-password' | 'reset-password'>('login');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [initialChatRecipient, setInitialChatRecipient] = useState<User | null>(null);

  // States for sidebar badge counts
  const [pendingTimesheetCount, setPendingTimesheetCount] = useState(0);
  const [openIncidentCount, setOpenIncidentCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const previousNotificationsRef = useRef<Notification[]>([]);

  const changeView = useCallback(
    (view: View) => {
      if (view !== 'project-detail') {
        setSelectedProject(null);
      }
      setActiveView(view);
    },
    [setSelectedProject, setActiveView]
  );

  const addToast = useCallback((message: string, type: 'success' | 'error' = 'success', notification?: Notification) => {
    setToasts(currentToasts => [...currentToasts, { id: Date.now(), message, type, notification }]);
  }, []);

  const dismissToast = (id: number) => {
    setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
  };

  // Check for password reset token in URL on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
        setResetToken(token);
        setAuthView('reset-password');
    }
  }, []);

  const { isOnline } = useOfflineSync(addToast);
  const { isCommandPaletteOpen, setIsCommandPaletteOpen } = useCommandPalette();
  useReminderService(user);
  
  useEffect(() => {
    if (!user?.companyId) {
      setCompanySettings(null);
      return;
    }

    let isActive = true;
    api
      .getCompanySettings(user.companyId)
      .then(settings => {
        if (isActive) {
          setCompanySettings(settings);
        }
      })
      .catch(error => {
        if (!isActive) {
          return;
        }
        console.error('Failed to load company settings', error);
        addToast('We could not load your company preferences. Some pages may use defaults.', 'error');
      });

    return () => {
      isActive = false;
    };
  }, [user, addToast]);

  useEffect(() => {
    if(companySettings) {
      document.documentElement.classList.toggle('dark', companySettings.theme === 'dark');
    }
  }, [companySettings]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setActiveView(getDefaultViewForUser(user));
    }
  }, [isAuthenticated, user]);


  const handleCompanySettingsUpdate = useCallback(
    async (updates: Partial<CompanySettings>) => {
      if (!user?.companyId) {
        throw new Error('You must belong to a company to update settings.');
      }

      const updated = await api.updateCompanySettings(user.companyId, updates, user.id);
      setCompanySettings(updated);
      return updated;
    },
    [user]
  );


  const updateBadgeCounts = useCallback(async (user: User) => {
    if (!user.companyId) return;
    try {
      const [timesheets, incidents, conversations, fetchedNotifications] = await Promise.all([
        api.getTimesheetsByCompany(user.companyId, user.id),
        api.getSafetyIncidentsByCompany(user.companyId),
        api.getConversationsForUser(user.id),
        api.getNotificationsForUser(user.id),
      ]);
      setPendingTimesheetCount(timesheets.filter(t => t.status === TimesheetStatus.PENDING).length);
      setOpenIncidentCount(incidents.filter(i => i.status !== IncidentStatus.RESOLVED).length);
      setUnreadMessageCount(conversations.filter(c => c.lastMessage && !c.lastMessage.isRead && c.lastMessage.senderId !== user.id).length);
      
      const unreadNotifications = fetchedNotifications.filter(n => !n.isRead);
      setUnreadNotificationCount(unreadNotifications.length);

      const previousUnreadIds = new Set(previousNotificationsRef.current.filter(n => !n.isRead).map(n => n.id));
      const newUnreadNotifications = unreadNotifications.filter(n => !previousUnreadIds.has(n.id));

      if (newUnreadNotifications.length > 0) {
        newUnreadNotifications.forEach(n => {
            addToast(n.message, 'success', n);
        });
      }
      
      previousNotificationsRef.current = fetchedNotifications;
      setNotifications(fetchedNotifications);

    } catch (error) {
      console.error("Could not update notification counts.", error);
    }
  }, [addToast]);
  
  useEffect(() => {
    if (user) {
      api.getNotificationsForUser(user.id).then(initialNotifications => {
        previousNotificationsRef.current = initialNotifications;
        setNotifications(initialNotifications);
        updateBadgeCounts(user);
      });
    }

    const interval = setInterval(() => {
        if (user) {
            updateBadgeCounts(user);
        }
    }, 5000);
    return () => clearInterval(interval);
  }, [user, updateBadgeCounts]);

  const handleLogout = () => {
    logout();
    setAuthView('login');
    changeView('dashboard');
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setActiveView('project-detail');
  };
  
  const handleStartChat = (recipient: User) => {
      setInitialChatRecipient(recipient);
      setActiveView('chat');
  };

  const handleNotificationClick = useCallback(async (notification: Notification) => {
    if (!user) return;

    const wasUnread = !(notification.isRead ?? notification.read);

    try {
      if (wasUnread) {
        await api.markNotificationAsRead(notification.id);
      }

      setNotifications(prev => prev.map(n => (
        n.id === notification.id ? { ...n, isRead: true, read: true } : n
      )));

      previousNotificationsRef.current = previousNotificationsRef.current.map(n => (
        n.id === notification.id ? { ...n, isRead: true, read: true } : n
      ));

      if (wasUnread) {
        setUnreadNotificationCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to update notification state', error);
      addToast('Unable to update that notification right now.', 'error');
      return;
    }

    const metadata = (notification.metadata ?? {}) as { view?: View; projectId?: string };

    if (metadata.projectId) {
      try {
        const project = await api.getProjectById(metadata.projectId);
        if (project) {
          setSelectedProject(project);
          changeView('project-detail');
          return;
        }
        addToast('The project linked to this notification is no longer available.', 'error');
        changeView('projects');
        return;
      } catch (error) {
        console.error('Failed to load project from notification', error);
        addToast('We could not open the related project.', 'error');
        changeView('projects');
        return;
      }
    } else if (metadata.view && metadata.view !== activeView) {
      changeView(metadata.view);
      return;
    } else if (notification.type === NotificationType.NEW_MESSAGE) {
      changeView('chat');
      return;
    }

    if (wasUnread) {
      addToast('Notification marked as read.', 'success');
    }
  }, [user, addToast, changeView, activeView]);

  const renderView = () => {
    if (!user) return null;
    if (activeView === 'project-detail' && selectedProject) {
>>>>>>> origin/codex/create-autonomous-deployment-plan-srvw3l
      return (
        <div className="min-h-screen grid place-items-center p-6">
          <div className="w-full max-w-lg">
            <Card className="p-6">
              <h2 className="text-lg font-semibold">Registration temporarily unavailable</h2>
              <p className="text-sm text-muted-foreground mt-1">Please contact support or use an existing account.</p>
              <div className="mt-4">
                <button type="button" className="text-primary hover:underline" onClick={() => setMode('login')}>Back to login</button>
              </div>
            </Card>
          </div>
        </div>
      );
    }
<<<<<<< HEAD
=======

    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard
            user={user}
            addToast={addToast}
            activeView={activeView}
            setActiveView={changeView}
            onSelectProject={handleSelectProject}
          />
        );
      case 'my-day': return <MyDayView user={user} addToast={addToast} />;
      case 'foreman-dashboard': return <ForemanDashboard user={user} addToast={addToast} />;
      case 'principal-dashboard': return <PrincipalAdminDashboard user={user} addToast={addToast} />;
      case 'projects': return <ProjectsView user={user} addToast={addToast} onSelectProject={handleSelectProject} />;
      case 'all-tasks': return <AllTasksView user={user} addToast={addToast} isOnline={isOnline} />;
      case 'map': return <ProjectsMapView user={user} addToast={addToast} />;
      case 'time':
        return <TimeTrackingView user={user} addToast={addToast} setActiveView={changeView} />;
      case 'timesheets': return <TimesheetsView user={user} addToast={addToast} />;
      case 'documents': return <DocumentsView user={user} addToast={addToast} isOnline={isOnline} settings={companySettings} />;
      case 'safety':
        return <SafetyView user={user} addToast={addToast} setActiveView={changeView} />;
      case 'financials': return <FinancialsView user={user} addToast={addToast} />;
      case 'users': return <TeamView user={user} addToast={addToast} onStartChat={handleStartChat} />;
      case 'equipment': return <EquipmentView user={user} addToast={addToast} />;
      case 'templates': return <TemplatesView user={user} addToast={addToast} />;
      case 'tools':
        return <ToolsView user={user} addToast={addToast} setActiveView={changeView} />;
      case 'audit-log': return <AuditLogView user={user} addToast={addToast} />;
      case 'settings':
        return (
          <SettingsView
            user={user}
            addToast={addToast}
            settings={companySettings}
            onSettingsUpdate={handleCompanySettingsUpdate}
          />
        );
      case 'chat': return <ChatView user={user} addToast={addToast} initialRecipient={initialChatRecipient}/>;
      case 'clients': return <ClientsView user={user} addToast={addToast} />;
      case 'invoices': return <InvoicesView user={user} addToast={addToast} />;
      default:
        return (
          <Dashboard
            user={user}
            addToast={addToast}
            activeView={activeView}
            setActiveView={changeView}
            onSelectProject={handleSelectProject}
          />
        );
    }
  };

  if (loading) {
>>>>>>> origin/codex/create-autonomous-deployment-plan-srvw3l
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="w-full max-w-md">
          <Card className="mb-6">
            <div className="p-4">
              <h1 className="text-xl font-bold">AS Agents CMS</h1>
              <p className="text-sm text-muted-foreground mt-1">Sign in to continue</p>
            </div>
          </Card>
          <Login
            onSwitchToRegister={() => setMode('register')}
            onSwitchToForgotPassword={() => setMode('forgot')}
          />
        </div>
      </div>
    );
  }

  // Authenticated: render app shell with sidebar and main content
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 text-primary" aria-hidden>
            <path fill="currentColor" d="M12 2l9.196 5.31a1 1 0 01.5.866v10.648a1 1 0 01-.5.866L12 24l-9.196-4.31a1 1 0 01-.5-.866V8.176a1 1 0 01.5-.866L12 2z" opacity={0.12} />
            <path fill="currentColor" d="M12 4.5l-6.5 3.752v7.496L12 19.5l6.5-3.752V8.252L12 4.5zm0 1.732l5 2.886v5.764l-5 2.886-5-2.886V9.118l5-2.886z" />
          </svg>
          <h1 className="text-lg font-semibold">AS Agents</h1>
        </div>
        <button type="button" onClick={logout} className="text-sm text-red-600 hover:underline">Logout</button>
      </div>

      <div className="flex flex-1 min-h-0">
        <SidebarLite
          user={user}
          activeView={activeView}
          setActiveView={setActiveView}
          onLogout={logout}
          pendingTimesheetCount={0}
          openIncidentCount={0}
          unreadMessageCount={0}
          companyName={undefined}
        />
        <main className="flex-1 p-4 overflow-auto">
          {activeView === 'tools' ? (
            <ToolsView user={user} addToast={addToast} setActiveView={setActiveView} />
          ) : (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground">Coming soon</h2>
              <p className="text-sm text-muted-foreground mt-1">The "{activeView}" view will be restored next.</p>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppInner />
  </AuthProvider>
);

export default App;

