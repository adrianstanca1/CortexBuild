// CortexBuild Main App Component - Performance Optimized
import React, { useState, useEffect, useCallback, Suspense, lazy, useMemo } from 'react';
import { Screen, User, Project, NotificationLink, AISuggestion } from './types';
import AuthScreen from './components/screens/AuthScreen';
import AppLayout from './components/layout/AppLayout';
import MainSidebar from './components/layout/MainSidebar';
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
import { fetchAllProjects, getAISuggestedAction } from './api';
import PerformanceMonitor from './components/performance/PerformanceMonitor';

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
const NotificationsScreen = lazy(() => import('./components/screens/NotificationsScreen'));
const ProjectPlanningScreen = lazy(() => import('./components/screens/ProjectPlanningScreen'));

// Additional core screen imports
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

// Additional project screens
const TaskDetailScreen = lazy(() => import('./components/screens/TaskDetailScreen'));
const NewTaskScreen = lazy(() => import('./components/screens/NewTaskScreen'));
const DailyLogScreen = lazy(() => import('./components/screens/DailyLogScreen'));
const PhotoGalleryScreen = lazy(() => import('./components/screens/PhotoGalleryScreen'));
const RFIDetailScreen = lazy(() => import('./components/screens/RFIDetailScreen'));
const NewRFIScreen = lazy(() => import('./components/screens/NewRFIScreen'));
const PunchListScreen = lazy(() => import('./components/screens/PunchListScreen'));
const PunchListItemDetailScreen = lazy(() => import('./components/screens/PunchListItemDetailScreen'));
const NewPunchListItemScreen = lazy(() => import('./components/screens/NewPunchListItemScreen'));
const DrawingsScreen = lazy(() => import('./components/screens/DrawingsScreen'));
const PlansViewerScreen = lazy(() => import('./components/screens/PlansViewerScreen'));
const DayworkSheetsListScreen = lazy(() => import('./components/screens/DayworkSheetsListScreen'));
const DayworkSheetDetailScreen = lazy(() => import('./components/screens/DayworkSheetDetailScreen'));
const NewDayworkSheetScreen = lazy(() => import('./components/screens/NewDayworkSheetScreen'));
const DeliveryScreen = lazy(() => import('./components/screens/DeliveryScreen'));
const DrawingComparisonScreen = lazy(() => import('./components/screens/DrawingComparisonScreen'));
const TMTicketScreen = lazy(() => import('./components/screens/TMTicketScreen'));

// Module screens
const AccountingScreen = lazy(() => import('./components/screens/modules/AccountingScreen'));
const AIToolsScreen = lazy(() => import('./components/screens/modules/AIToolsScreen'));
const DocumentManagementScreen = lazy(() => import('./components/screens/modules/DocumentManagementScreen'));
const TimeTrackingScreen = lazy(() => import('./components/screens/modules/TimeTrackingScreen'));
const ProjectOperationsScreen = lazy(() => import('./components/screens/modules/ProjectOperationsScreen'));
const FinancialManagementScreen = lazy(() => import('./components/screens/modules/FinancialManagementScreen'));
const BusinessDevelopmentScreen = lazy(() => import('./components/screens/modules/BusinessDevelopmentScreen'));
const AIAgentsMarketplaceScreen = lazy(() => import('./components/screens/modules/AIAgentsMarketplaceScreen'));

// Developer & SDK screens
const ConstructionAutomationStudio = lazy(() => import('./components/screens/developer/ConstructionAutomationStudio'));
const ProductionSDKDeveloperView = lazy(() => import('./components/sdk/ProductionSDKDeveloperView').then(module => ({
  default: module.ProductionSDKDeveloperView
})));
const DeveloperWorkspaceScreen = lazy(() => import('./components/screens/developer/DeveloperWorkspaceScreen'));
const EnhancedDeveloperConsole = lazy(() => import('./components/screens/developer/EnhancedDeveloperConsole'));

// Company Admin Legacy & Additional Dashboards
const CompanyAdminDashboardLegacy = lazy(() => import('./components/screens/company/CompanyAdminDashboard'));
const CompanyAdminDashboardNew = lazy(() => import('./components/screens/dashboards/CompanyAdminDashboardNew'));
const SupervisorDashboard = lazy(() => import('./components/screens/dashboards/SupervisorDashboard'));
const OperativeDashboard = lazy(() => import('./components/screens/dashboards/OperativeDashboard'));

// Admin Control Panel
const AdminControlPanel = lazy(() => import('./components/admin/AdminControlPanel'));

// Marketing & Landing Pages
const MainLandingPage = lazy(() => import('./components/marketing/MainLandingPage'));
const DeveloperLandingPage = lazy(() => import('./components/sdk/DeveloperLandingPage').then(module => ({ default: module.DeveloperLandingPage })));

// Marketplace & App screens
const GlobalMarketplace = lazy(() => import('./components/marketplace/GlobalMarketplace'));
const MyApplicationsDesktop = lazy(() => import('./components/desktop/MyApplicationsDesktop'));
const AdminReviewInterface = lazy(() => import('./components/marketplace/AdminReviewInterface'));
const DeveloperSubmissionInterface = lazy(() => import('./components/marketplace/DeveloperSubmissionInterface'));
const Base44Clone = lazy(() => import('./components/base44/Base44Clone').then(module => ({
  default: module.Base44Clone
})));

// ML & Advanced Analytics
const AdvancedMLDashboard = lazy(() => import('./components/screens/dashboards/AdvancedMLDashboard'));

const ScreenLoader: React.FC = React.memo(() => (
  <div className="py-16 text-center text-slate-500">
    Loading experience...
  </div>
));

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
  'task-detail': TaskDetailScreen,
  'new-task': NewTaskScreen,
  'rfis': RFIsScreen,
  'rfi-detail': RFIDetailScreen,
  'new-rfi': NewRFIScreen,
  'documents': DocumentsScreen,
  'my-day': MyDayScreen,
  'daily-log': DailyLogScreen,
  'photos': PhotoGalleryScreen,
  'punch-list': PunchListScreen,
  'punch-list-item-detail': PunchListItemDetailScreen,
  'new-punch-list-item': NewPunchListItemScreen,
  'drawings': DrawingsScreen,
  'plans': PlansViewerScreen,
  'daywork-sheets': DayworkSheetsListScreen,
  'daywork-sheet-detail': DayworkSheetDetailScreen,
  'new-daywork-sheet': NewDayworkSheetScreen,
  'delivery': DeliveryScreen,
  'drawing-comparison': DrawingComparisonScreen,
  'tm-ticket': TMTicketScreen,

  // Advanced feature screens
  'analytics': AnalyticsScreen,
  'reports': ReportsScreen,
  'team-management': TeamManagementScreen,
  'notifications': NotificationsScreen,
  'project-planning': ProjectPlanningScreen,
  'ai-insights': AIInsightsScreen,
  'quality-safety': QualitySafetyScreen,
  'business-intelligence': BusinessIntelligenceScreen,
  'system-admin': SystemAdminScreen,

  // Module screens
  'accounting': AccountingScreen,
  'ai-tools': AIToolsScreen,
  'document-management': DocumentManagementScreen,
  'time-tracking': TimeTrackingScreen,
  'project-operations': ProjectOperationsScreen,
  'financial-management': FinancialManagementScreen,
  'business-development': BusinessDevelopmentScreen,
  'ai-agents-marketplace': AIAgentsMarketplaceScreen,

  // Developer & SDK screens
  'automation-studio': ConstructionAutomationStudio,
  'sdk-developer': ProductionSDKDeveloperView,
  'developer-workspace': DeveloperWorkspaceScreen,
  'developer-console': EnhancedDeveloperConsole,

  // Company Admin Legacy & Dashboards
  'company-admin-legacy': CompanyAdminDashboardLegacy,

  // Admin Control Panel
  'admin-control-panel': AdminControlPanel,

  // Marketing & Landing Pages
  'landing': MainLandingPage,
  'developer-landing': DeveloperLandingPage,

  // Marketplace & App screens
  'marketplace': GlobalMarketplace,
  'my-applications': MyApplicationsDesktop,
  'admin-review': AdminReviewInterface,
  'developer-submissions': DeveloperSubmissionInterface,
  'my-apps-desktop': Base44Clone,

  // ML & Advanced Analytics
  'ml-analytics': AdvancedMLDashboard,
};

// CortexBuild 2.0 - Powered by Vite + React with HMR
const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [isAISuggestionModalOpen, setIsAISuggestionModalOpen] = useState(false);
  const [isAISuggestionLoading, setIsAISuggestionLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState(false);
  const [projectSelectorTitle, setProjectSelectorTitle] = useState<string>('Select a project');
  const [projectSelectorCallback, setProjectSelectorCallback] = useState<((projectId: string) => void) | null>(null);

  const { toasts, addToast, removeToast } = useToast();
  const { currentNavItem, navigateTo, navigateToModule, goBack } = useNavigation();
  const { can: hasPermission } = usePermissions(currentUser);

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
        const projects = await fetchAllProjects(currentUser);
        // Ensure we extract array from response if needed
        const projectsArray = Array.isArray(projects) ? projects :
          (projects?.data && Array.isArray(projects.data)) ? projects.data : [];
        setAllProjects(projectsArray);
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
    const suggestion = await getAISuggestedAction(currentUser);
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

  // Get current screen component with safety check - memoized for performance
  const currentScreenData = useMemo(() => {
    const { screen, params, project } = currentNavItem || {
      screen: 'global-dashboard' as Screen,
      params: {},
      project: undefined
    };
    const ScreenComponent = SCREEN_COMPONENTS[screen] || PlaceholderToolScreen;

    // Define which screens need module props
    const moduleScreens = ['accounting', 'ai-tools', 'document-management', 'time-tracking',
      'project-operations', 'financial-management', 'business-development', 'ai-agents-marketplace'];
    const isModuleScreen = moduleScreens.includes(screen);

    return { screen, params, project, ScreenComponent, isModuleScreen };
  }, [currentNavItem]);

  const { screen, params, project, ScreenComponent, isModuleScreen } = currentScreenData;

  return (
    <ErrorBoundary>
      <InfiniteLoopErrorBoundary>
        <div className="min-h-screen bg-gray-50">
          <AppLayout
            sidebar={
              <MainSidebar
                currentUser={currentUser}
                onNavigate={navigateTo}
                currentScreen={screen}
                hasPermission={hasPermission}
              />
            }
            floatingMenu={
              <FloatingMenu
                currentUser={currentUser}
                navigateToModule={navigateToModule}
                openProjectSelector={(title: string, onSelect: (projectId: string) => void) => {
                  setProjectSelectorTitle(title);
                  setProjectSelectorCallback(() => onSelect);
                  setIsProjectSelectorOpen(true);
                }}
                onDeepLink={(projectId: string | null, screen: Screen, params: any) => {
                  navigateTo(screen, params);
                }}
              />
            }
          >
            <main className="flex-1 overflow-auto">
              <Suspense fallback={<ScreenLoader />}>
                <ScreenComponent
                  {...useMemo(() => ({
                    currentUser,
                    navigateTo,
                    goBack,
                    ...(project && { project }),
                    ...(params && { params }),
                    ...(screen !== 'placeholder-tool' && { allProjects, hasPermission }),
                    ...(isModuleScreen && {
                      openProjectSelector: (title: string, onSelect: (projectId: string) => void) => {
                        setProjectSelectorTitle(title);
                        setProjectSelectorCallback(() => onSelect);
                        setIsProjectSelectorOpen(true);
                      },
                      onDeepLink: (projectId: string | null, screenName: Screen, linkParams: any) => {
                        if (projectId) {
                          const selectedProject = allProjects.find(p => p.id === projectId);
                          if (selectedProject) {
                            navigateTo(screenName, linkParams, selectedProject);
                          }
                        } else {
                          navigateTo(screenName, linkParams);
                        }
                      },
                      can: hasPermission
                    })
                  }), [currentUser, navigateTo, goBack, project, params, screen, allProjects, hasPermission, isModuleScreen])}
                />
              </Suspense>
            </main>
          </AppLayout>



          <ChatbotWidget />

          <AISuggestionModal
            isOpen={isAISuggestionModalOpen}
            isLoading={isAISuggestionLoading}
            suggestion={aiSuggestion}
            onClose={() => setIsAISuggestionModalOpen(false)}
            onAction={(link: NotificationLink) => {
              navigateTo(link.screen, link.params);
              setIsAISuggestionModalOpen(false);
            }}
            currentUser={currentUser}
          />

          {isProjectSelectorOpen && (
            <ProjectSelectorModal
              onSelectProject={(projectId: string) => {
                if (projectSelectorCallback) {
                  projectSelectorCallback(projectId);
                }
                setProjectSelectorCallback(null);
                setIsProjectSelectorOpen(false);
              }}
              onClose={() => {
                setProjectSelectorCallback(null);
                setIsProjectSelectorOpen(false);
              }}
              title={projectSelectorTitle}
              currentUser={currentUser}
            />
          )}

          <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
          <PerformanceMonitor />
        </div>
      </InfiniteLoopErrorBoundary>
    </ErrorBoundary>
  );
};

export default App;
