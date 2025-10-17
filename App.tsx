// CortexBuild Main App Component - Clean Version
import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { Screen, User, Project, NotificationLink, AISuggestion, PermissionAction, PermissionSubject } from './types';
import AuthScreen from './components/screens/AuthScreen';
import AppLayout from './components/layout/AppLayout';
import MainSidebar from './components/layout/MainSidebar';
import { MOCK_PROJECT } from './constants';
import AISuggestionModal from './components/modals/AISuggestionModal';
import ProjectSelectorModal from './components/modals/ProjectSelectorModal';
import FloatingMenu from './components/layout/FloatingMenu';
import ErrorBoundary from './components/ErrorBoundary';
import ToastContainer from './components/ToastContainer';
import { InfiniteLoopErrorBoundary } from './utils/reactDebugger';
import { usePermissions } from './hooks/usePermissions';
import * as authService from './auth/authService';
import { useToast } from './hooks/useToast';
import { useNavigation } from './hooks/useNavigation';
import { logger } from './utils/logger';
import { ChatbotWidget } from './components/chat/ChatbotWidget';
import { supabase } from './lib/supabase/client';

// Inline API functions to avoid import issues
const api = {
  fetchAllProjects: async (user: any) => {
    console.log('Mock fetchAllProjects called for user:', user?.email);
    return [];
  },
  getAISuggestedAction: async (user: any) => {
    console.log('Mock getAISuggestedAction called for user:', user?.email);
    return null;
  }
};

// Core screen imports - only the essential ones
const UnifiedDashboardScreen = lazy(() => import('./components/screens/UnifiedDashboardScreen'));
const DeveloperDashboardV2 = lazy(() => import('./components/screens/developer/DeveloperDashboardV2'));
const CompanyAdminDashboardV2 = lazy(() => import('./components/screens/company/CompanyAdminDashboardV2'));
const SuperAdminDashboardV2 = lazy(() => import('./components/screens/admin/SuperAdminDashboardScreen'));
const PlatformAdminScreen = lazy(() => import('./components/screens/admin/PlatformAdminScreen'));
const PlaceholderToolScreen = lazy(() => import('./components/screens/tools/PlaceholderToolScreen'));

// Advanced feature screens
const AnalyticsScreen = lazy(() => import('./components/screens/AnalyticsScreen'));
const ReportsScreen = lazy(() => import('./components/screens/ReportsScreen'));
const TeamManagementScreen = lazy(() => import('./components/screens/TeamManagementScreen'));
const TimeTrackingScreen = lazy(() => import('./components/screens/TimeTrackingScreen'));
const NotificationsScreen = lazy(() => import('./components/screens/NotificationsScreen'));
const ProjectPlanningScreen = lazy(() => import('./components/screens/ProjectPlanningScreen'));

// Missing core screen imports
const ProjectsListScreen = lazy(() => import('./components/screens/ProjectsListScreen'));
const ProjectHomeScreen = lazy(() => import('./components/screens/ProjectHomeScreen'));
const TasksScreen = lazy(() => import('./components/screens/TasksScreen'));
const MyTasksScreen = lazy(() => import('./components/screens/MyTasksScreen'));
const RFIsScreen = lazy(() => import('./components/screens/RFIsScreen'));
const DocumentsScreen = lazy(() => import('./components/screens/DocumentsScreen'));
const MyDayScreen = lazy(() => import('./components/screens/MyDayScreen'));

// Core feature screens
const ProjectsListScreen = lazy(() => import('./components/screens/ProjectsListScreen'));
const ProjectHomeScreen = lazy(() => import('./components/screens/ProjectHomeScreen'));
const TasksScreen = lazy(() => import('./components/screens/TasksScreen'));
const MyTasksScreen = lazy(() => import('./components/screens/MyTasksScreen'));
const RFIsScreen = lazy(() => import('./components/screens/RFIsScreen'));
const DocumentsScreen = lazy(() => import('./components/screens/DocumentsScreen'));
const MyDayScreen = lazy(() => import('./components/screens/MyDayScreen'));

// Advanced AI & Quality screens
const AIInsightsScreen = lazy(() => import('./components/screens/AIInsightsScreen'));
const QualitySafetyScreen = lazy(() => import('./components/screens/QualitySafetyScreen'));

// Business Intelligence & Automation screens
const BusinessIntelligenceScreen = lazy(() => import('./components/screens/BusinessIntelligenceScreen'));

// Advanced Enterprise screens
const SystemAdminScreen = lazy(() => import('./components/screens/SystemAdminScreen'));

const ScreenLoader: React.FC = () => (
  <div className="py-16 text-center text-slate-500">
    Loading experience...
  </div>
);

type NavigationItem = {
  screen: Screen;
  params?: any;
  project?: Project;
};

// Comprehensive screen components mapping
const SCREEN_COMPONENTS: Record<string, React.ComponentType<any>> = {
  'global-dashboard': UnifiedDashboardScreen,
  'company-admin-dashboard': CompanyAdminDashboardV2,
  'developer-dashboard': DeveloperDashboardV2,
  'super-admin-dashboard': SuperAdminDashboardV2,
  'platform-admin': PlatformAdminScreen,
  'placeholder-tool': PlaceholderToolScreen,

  // Core feature screens
  'projects': ProjectsListScreen,
  'project-home': ProjectHomeScreen,
  'tasks': TasksScreen,
  'my-tasks': MyTasksScreen,
  'rfis': RFIsScreen,
  'documents': DocumentsScreen,
  'my-day': MyDayScreen,

  // Advanced feature screens
  'analytics': AnalyticsScreen,
  'reports': ReportsScreen,
  'team-management': TeamManagementScreen,
  'time-tracking': TimeTrackingScreen,
  'notifications': NotificationsScreen,
  'project-planning': ProjectPlanningScreen,
  'ai-insights': AIInsightsScreen,
  'quality-safety': QualitySafetyScreen,
  'business-intelligence': BusinessIntelligenceScreen,
  'system-admin': SystemAdminScreen,
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isAISuggestionModalOpen, setIsAISuggestionModalOpen] = useState(false);
  const [isAISuggestionLoading, setIsAISuggestionLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState(false);

  const { toasts, addToast, removeToast } = useToast();
  const { navigationStack, currentNavItem, navigateTo, goBack, canGoBack } = useNavigation();
  const { hasPermission } = usePermissions(currentUser);

  // Check for existing session on app load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          logger.info('Session restored', { userId: user.id, role: user.role });
        }
      } catch (error) {
        logger.error('Session check failed', error);
      } finally {
        setSessionChecked(true);
      }
    };

    checkSession();
  }, []);

  // Load projects when user changes
  useEffect(() => {
    if (currentUser) {
      const loadProjects = async () => {
        const projects = await api.fetchAllProjects(currentUser);
        setAllProjects(projects);
      };
      loadProjects();
    }
  }, [currentUser]);

  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      const user = await authService.login(email, password);
      setCurrentUser(user);
      addToast({ type: 'success', title: 'Welcome back!' });
      logger.info('User logged in', { userId: user.id, role: user.role });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      addToast({ type: 'error', title: message });
      logger.error('Login failed', error);
      throw error;
    }
  }, [addToast]);

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
      setCurrentUser(null);
      setAllProjects([]);
      addToast({ type: 'success', title: 'Logged out successfully' });
      logger.info('User logged out');
    } catch (error) {
      logger.error('Logout failed', error);
    }
  }, [addToast]);

  const handleSuggestAction = async () => {
    if (!currentUser) return;
    setIsAISuggestionModalOpen(true);
    setIsAISuggestionLoading(true);
    setAiSuggestion(null);
    const suggestion = await api.getAISuggestedAction(currentUser);
    setAiSuggestion(suggestion);
    setIsAISuggestionLoading(false);
  };

  // Show loading screen while checking session
  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading CortexBuild...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!currentUser) {
    return (
      <ErrorBoundary>
        <AuthScreen onLoginSuccess={setCurrentUser} />
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      </ErrorBoundary>
    );
  }

  // Get current screen component with safety check
  const { screen, params, project } = currentNavItem || {
    screen: 'global-dashboard' as Screen,
    params: {},
    project: undefined
  };
  const ScreenComponent = SCREEN_COMPONENTS[screen] || PlaceholderToolScreen;

  return (
    <ErrorBoundary>
      <InfiniteLoopErrorBoundary>
        <div className="min-h-screen bg-gray-50">
        <AppLayout
          onLogout={handleLogout}
          canGoBack={canGoBack}
          onGoBack={goBack}
        >
          <div className="flex h-full">
            <MainSidebar
              currentUser={currentUser}
              onNavigate={navigateTo}
              currentScreen={screen}
              hasPermission={hasPermission}
            />
            <main className="flex-1 overflow-auto">
              <Suspense fallback={<ScreenLoader />}>
                <ScreenComponent
                  currentUser={currentUser}
                  navigateTo={navigateTo}
                  goBack={goBack}
                  project={project}
                  params={params}
                  allProjects={allProjects}
                  hasPermission={hasPermission}
                />
              </Suspense>
            </main>
          </div>
        </AppLayout>

        <FloatingMenu
          currentUser={currentUser}
          navigateToModule={navigateTo}
          openProjectSelector={(title: string, onSelect: (projectId: string) => void) => {
            setIsProjectSelectorOpen(true);
          }}
          onDeepLink={(projectId: string | null, screen: Screen, params: any) => {
            navigateTo(screen, params);
          }}
        />

        <ChatbotWidget currentUser={currentUser} />

        <AISuggestionModal
          isOpen={isAISuggestionModalOpen}
          isLoading={isAISuggestionLoading}
          suggestion={aiSuggestion}
          onClose={() => setIsAISuggestionModalOpen(false)}
          onAction={(link: NotificationLink) => {
            navigateTo(link.screen as Screen, link.params);
            setIsAISuggestionModalOpen(false);
          }}
          currentUser={currentUser}
        />

        {isProjectSelectorOpen && (
          <ProjectSelectorModal
            onSelectProject={(projectId: string) => {
              const selectedProject = allProjects.find(p => p.id === projectId);
              if (selectedProject) {
                navigateTo('project-home', { projectId }, selectedProject);
              }
              setIsProjectSelectorOpen(false);
            }}
            onClose={() => setIsProjectSelectorOpen(false)}
            title="Select Project"
            currentUser={currentUser}
          />
        )}

        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        </div>
      </InfiniteLoopErrorBoundary>
    </ErrorBoundary>
  );
};

export default App;
