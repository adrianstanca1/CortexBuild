// CortexBuild Main App Component - Performance Optimized
import React, { useState, useEffect, useCallback, Suspense, lazy, useMemo } from 'react';
import { Screen, User, Project, NotificationLink, AISuggestion } from './types';
import AuthScreen from './components/screens/AuthScreen';
import AppLayout from './components/layout/AppLayout';
import Sidebar from './components/layout/Sidebar';
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
import { supabase } from './supabaseClient';
import LandingRouter from './components/landing/LandingRouter';
import * as api from './api';
import { MOCK_PROJECT } from './constants';

// Core screen imports - only the essential ones
const UnifiedDashboardScreen = lazy(() => import('./components/screens/UnifiedDashboardScreen'));
const DeveloperDashboardScreen = lazy(() => import('./components/screens/developer/DeveloperDashboardScreen'));
const CompanyAdminDashboardV2 = lazy(() => import('./components/screens/company/CompanyAdminDashboardV2'));
const SuperAdminDashboard = lazy(() => import('./components/screens/dashboards/SuperAdminDashboard'));
const PlaceholderToolScreen = lazy(() => import('./components/screens/tools/PlaceholderToolScreen'));

// Advanced feature screens
const AnalyticsScreen = lazy(() => import('./components/screens/AnalyticsScreen'));
const ReportsScreen = lazy(() => import('./components/screens/ReportsScreen'));
const TeamManagementScreen = lazy(() => import('./components/screens/TeamManagementScreen'));
const NotificationsScreen = lazy(() => import('./components/screens/NotificationsScreen'));
const ProjectPlanningScreen = lazy(() => import('./components/screens/ProjectPlanningScreen'));

// Additional core screen imports
const ProjectsListScreen = lazy(() => import('./components/screens/ProjectsListScreen'));
const ProjectsManagement = lazy(() => import('./components/construction/ProjectsManagement'));
const TasksManagement = lazy(() => import('./components/construction/TasksManagement'));
const DailyLogsManagement = lazy(() => import('./components/construction/DailyLogsManagement'));
const RFIManagement = lazy(() => import('./components/construction/RFIManagement'));
const DocumentsManagement = lazy(() => import('./components/construction/DocumentsManagement'));
const BillingPaymentsManagement = lazy(() => import('./components/admin/BillingPaymentsManagement'));
const AnalyticsReports = lazy(() => import('./components/admin/AnalyticsReports'));
const MarketplaceManagement = lazy(() => import('./components/marketplace/MarketplaceManagement'));
const AppDiscovery = lazy(() => import('./components/marketplace/AppDiscovery'));
const TeamManagement = lazy(() => import('./components/company/TeamManagement'));
const ProjectDashboard = lazy(() => import('./components/company/ProjectDashboard'));
const NotificationsCenter = lazy(() => import('./components/realtime/NotificationsCenter'));
const ProjectHomeScreen = lazy(() => import('./components/screens/ProjectHomeScreen'));
const TasksScreen = lazy(() => import('./components/screens/TasksScreen'));
const MyTasksScreen = lazy(() => import('./components/screens/MyTasksScreen'));
const RFIsScreen = lazy(() => import('./components/screens/RFIsScreen'));
const DocumentsScreen = lazy(() => import('./components/screens/DocumentsScreen'));
const MyDayScreen = lazy(() => import('./components/screens/MyDayScreen'));

// Advanced AI & Quality screens
const AIInsightsScreen = lazy(() => import('./components/screens/AIInsightsScreen'));
const QualitySafetyScreen = lazy(() => import('./components/screens/QualitySafetyScreen'));
const ProjectHealthDashboard = lazy(() => import('./components/screens/ProjectHealthDashboard'));

// Business Intelligence & Automation screens
const BusinessIntelligenceScreen = lazy(() => import('./components/screens/BusinessIntelligenceScreen'));

// Advanced Enterprise screens
const SystemAdminScreen = lazy(() => import('./components/screens/SystemAdminScreen'));
const UnifiedAdminDashboard = lazy(() => import('./components/screens/admin/UnifiedAdminDashboard'));

// Additional project screens
const TaskDetailScreen = lazy(() => import('./components/screens/TaskDetailScreen'));
const NewTaskScreen = lazy(() => import('./components/screens/NewTaskScreen'));
const DailyLogScreen = lazy(() => import('./components/screens/DailyLogScreen'));
const PhotoGalleryScreen = lazy(() => import('./components/screens/PhotoGalleryScreen'));
const RFIDetailScreen = lazy(() => import('./components/screens/RFIDetailScreen'));
const NewRFIScreen = lazy(() => import('./components/screens/NewRFIScreen'));
const ProductionSDKDeveloperView = lazy(() =>
  import('./components/sdk/ProductionSDKDeveloperView').then(module => ({
    default: module.ProductionSDKDeveloperView
  }))
);
const DeveloperWorkspaceScreen = lazy(() => import('./components/screens/developer/DeveloperWorkspaceScreen'));
const EnhancedDeveloperConsole = lazy(() => import('./components/screens/developer/EnhancedDeveloperConsole'));
const DeveloperDashboardV2 = lazy(() => import('./components/screens/developer/DeveloperDashboardV2'));
const ConstructionAutomationStudio = lazy(() => import('./components/screens/developer/ConstructionAutomationStudio'));
// Removed CompanyAdminDashboardScreen - has missing dependencies
// CompanyAdminDashboard doesn't exist, using CompanyAdminDashboardV2 instead
// CompanyAdminDashboardV2 already declared above
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
// ConstructionAutomationStudio already declared above
// ProductionSDKDeveloperView already declared above
// DeveloperWorkspaceScreen already declared above

// Company Admin Legacy & Additional Dashboards
// const CompanyAdminDashboardLegacy = lazy(() => import('./components/screens/company/CompanyAdminDashboard'));

// Marketing & Landing Pages
const MainLandingPage = lazy(() => import('./components/marketing/MainLandingPage'));
// DeveloperLandingPage removed - file doesn't exist
// const DeveloperLandingPage = lazy(() => import('./components/sdk/DeveloperLandingPage').then(module => ({ default: module.DeveloperLandingPage })));

// Marketplace & App screens
const GlobalMarketplace = lazy(() => import('./components/marketplace/GlobalMarketplace'));
const MyApplicationsDesktop = lazy(() => import('./components/desktop/MyApplicationsDesktop'));
const AdminReviewInterface = lazy(() => import('./components/marketplace/AdminReviewInterface'));
const DeveloperSubmissionInterface = lazy(() => import('./components/marketplace/DeveloperSubmissionInterface'));
const Base44Clone = lazy(() =>
  import('./components/base44/Base44Clone').then(module => ({
    default: module.Base44Clone
  }))
);
const PlatformAdminScreen = lazy(() => import('./components/screens/admin/PlatformAdminScreen'));
const SuperAdminDashboardScreen = lazy(() => import('./components/screens/admin/SuperAdminDashboardScreen'));
const SuperAdminDashboardV2 = lazy(() => import('./components/admin/SuperAdminDashboardV2'));
const AdvancedMLDashboard = lazy(() => import('./components/screens/dashboards/AdvancedMLDashboard'));
const AdminControlPanel = lazy(() => import('./components/admin/AdminControlPanel'));

const ScreenLoader: React.FC = () => (
  <div className="py-16 text-center text-slate-500">
    Loading experience...
  </div>
);

// Comprehensive screen components mapping
type NavigationItem = {
  screen: Screen;
  params?: any;
  project?: Project;
};

const SCREEN_COMPONENTS: Record<Screen, React.ComponentType<any>> = {
  'global-dashboard': UnifiedDashboardScreen,
  'company-admin-dashboard': CompanyAdminDashboardV2,
  'company-admin-legacy': CompanyAdminDashboardV2, // Use same as main company admin
  'projects': ProjectsListScreen,
  'project-home': ProjectHomeScreen,
  'my-day': MyDayScreen,
  'tasks': TasksScreen,
  'my-tasks': MyTasksScreen,
  'task-detail': TaskDetailScreen,
  'new-task': NewTaskScreen,
  'daily-log': DailyLogScreen,
  'photos': PhotoGalleryScreen,
  'rfis': RFIsScreen,
  'rfi-detail': RFIDetailScreen,
  'new-rfi': NewRFIScreen,
  'punch-list': PunchListScreen,
  'punch-list-item-detail': PunchListItemDetailScreen,
  'new-punch-list-item': NewPunchListItemScreen,
  'drawings': DrawingsScreen,
  'plans': PlansViewerScreen,
  'daywork-sheets': DayworkSheetsListScreen,
  'daywork-sheet-detail': DayworkSheetDetailScreen,
  'new-daywork-sheet': NewDayworkSheetScreen,
  'documents': DocumentsScreen,
  'delivery': DeliveryScreen,
  'drawing-comparison': DrawingComparisonScreen,
  // Modules
  'accounting': AccountingScreen,
  'ai-tools': AIToolsScreen,
  'document-management': DocumentManagementScreen,
  'time-tracking': TimeTrackingScreen,
  'project-operations': ProjectOperationsScreen,
  'financial-management': FinancialManagementScreen,
  'business-development': BusinessDevelopmentScreen,
  'ai-agents-marketplace': AIAgentsMarketplaceScreen,
  'developer-dashboard': DeveloperDashboardScreen,
  'automation-studio': ConstructionAutomationStudio,
  'developer-workspace': DeveloperWorkspaceScreen,
  'developer-console': EnhancedDeveloperConsole,
  'super-admin-dashboard': SuperAdminDashboardScreen,
  'sdk-developer': ProductionSDKDeveloperView,
  'my-apps-desktop': Base44Clone,
  // Global Marketplace
  'marketplace': GlobalMarketplace,
  'my-applications': MyApplicationsDesktop,
  'admin-review': AdminReviewInterface,
  'developer-submissions': DeveloperSubmissionInterface,
  // Zapier-Style Workflow Builder (now integrated in SDK Developer)
  // 'zapier-workflow': ZapierStyleWorkflowBuilder,
  // Admin
  'platform-admin': PlatformAdminScreen,
  'admin-control-panel': AdminControlPanel,
  // ML & Advanced Analytics
  'ml-analytics': AdvancedMLDashboard,
  // Tools
  'placeholder-tool': PlaceholderToolScreen,
};

// CortexBuild 2.0 - Powered by Vite + React with HMR
const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [showLoginScreen, setShowLoginScreen] = useState(false);
  const [allProjects, setAllProjects] = useState<Project[]>([]);

  const {
    navigationStack,
    currentNavItem,
    navigateTo,
    navigateToModule,
    goBack,
    goHome,
    selectProject,
    handleDeepLink,
    setNavigationStack
  } = useNavigation();


  const [isAISuggestionModalOpen, setIsAISuggestionModalOpen] = useState(false);
  const [isAISuggestionLoading, setIsAISuggestionLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);

  const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState(false);
  const [projectSelectorCallback, setProjectSelectorCallback] = useState<(projectId: string) => void>(() => () => { });
  const [projectSelectorTitle, setProjectSelectorTitle] = useState('');

  const { can } = usePermissions(currentUser!);
  const { toasts, removeToast, showSuccess, showError } = useToast();

  const handleOAuthCallback = async (hash: string) => {
    try {
      logger.info('Processing OAuth callback', { hashLength: hash.length });

      // Extract tokens from URL hash - handle format like #dashboard#access_token=...
      const hashParts = hash.split('#');
      let tokenPart = '';
      for (const part of hashParts) {
        if (part.includes('access_token')) {
          tokenPart = part;
          break;
        }
      }

      if (tokenPart) {
        const params = new URLSearchParams(tokenPart);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        if (error) {
          logger.error('OAuth error in callback', { error, errorDescription });
          showError('Authentication Failed', errorDescription || 'OAuth authentication failed');
          return;
        }

        if (accessToken && refreshToken) {
          logger.info('Setting OAuth session');
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) {
            logger.error('Error setting OAuth session', sessionError);
            showError('Authentication Failed', 'Failed to establish session');
          } else {
            logger.info('OAuth session set successfully');
          }
        } else {
          logger.warn('OAuth callback missing tokens', { hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken });
        }
      } else {
        logger.warn('No token part found in OAuth callback hash');
      }
    } catch (error) {
      logger.error('Unexpected error in OAuth callback', error);
      showError('Authentication Error', 'An unexpected error occurred during authentication');
    } finally {
      // Clean up OAuth tokens from URL
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleUserSignIn = async (user: any) => {
    try {
      console.log('?? Handling user sign in for:', user.email);

      // Try to fetch from users table first (our main table)
      let profile = null;
      let fetchError = null;

      try {
        console.log('?? Fetching user profile from users table...');
        const result = await supabase
          .from('users')
          .select('id, name, email, role, avatar, company_id')
          .eq('id', user.id)
          .single();

        profile = result.data;
        fetchError = result.error;

        if (profile) {
          console.log('? Profile found in users table:', profile.name);
        } else if (fetchError) {
          console.warn('?? Error fetching from users table:', fetchError.message);
        }
      } catch (error) {
        console.warn('?? Exception fetching from users table:', error);
      }

      // If not found in users table, try profiles table as fallback
      if (!profile) {
        try {
          console.log('?? Trying profiles table as fallback...');
          const result = await supabase
            .from('profiles')
            .select('id, name, email, role, avatar, company_id')
            .eq('id', user.id)
            .single();

          profile = result.data;
          if (profile) {
            console.log('? Profile found in profiles table:', profile.name);
          }
        } catch (error) {
          console.warn('?? Profiles table also failed:', error);
        }
      }

      let finalProfile = profile;

      // If no profile exists in either table, create a profile from user metadata
      if (!profile) {
        console.warn('?? No profile found in database, creating from user metadata');
        finalProfile = {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0] || 'User',
          role: user.email === 'adrian.stanca1@gmail.com' ? 'super_admin' : 'company_admin',
          avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          company_id: undefined
        };
        console.log('? Created profile from metadata:', finalProfile);
      }

      // Convert snake_case to camelCase
      const userProfile = finalProfile ? {
        id: finalProfile.id,
        name: finalProfile.name,
        email: finalProfile.email,
        role: finalProfile.role,
        avatar: finalProfile.avatar,
        companyId: finalProfile.company_id
      } : null;

      console.log('?? Final user profile:', userProfile);
      console.log('?? User role from profile:', userProfile?.role);
      console.log('?? Is developer?', userProfile?.role === 'developer');

      console.log('?? Setting currentUser state:', userProfile);
      setCurrentUser(userProfile);

      if (userProfile) {
        // Navigate to dashboard after successful login
        console.log('?? Navigating to dashboard...');
        console.log('?? Current navigation stack before:', navigationStack);
        const defaultScreenForRole: Screen = userProfile.role === 'developer'
          ? 'developer-console'
          : userProfile.role === 'super_admin'
            ? 'super-admin-dashboard'
            : 'company-admin-dashboard';
        navigateToModule(defaultScreenForRole, {});
        console.log('?? Navigation stack set to', defaultScreenForRole);

        window.dispatchEvent(new CustomEvent('userLoggedIn'));
        showSuccess('Welcome back!', `Hello ${userProfile.name}`);
        logger.logUserAction('login_successful', { userId: userProfile.id, userEmail: userProfile.email }, userProfile.id);
        console.log('? User sign in completed successfully');
        console.log('?? Current user should now be:', userProfile);
      }
    } catch (error) {
      console.error('? Error in sign in:', error);
      // Even on error, try to set a basic user profile so the app doesn't break
      const fallbackProfile: User = {
        id: user.id,
        name: user.email?.split('@')[0] || 'User',
        email: user.email || '',
        role: (user.email === 'adrian.stanca1@gmail.com' ? 'super_admin' : 'company_admin') as any,
        avatar: null,
        companyId: undefined
      };
      console.log('?? Using fallback profile:', fallbackProfile);
      setCurrentUser(fallbackProfile);
      const fallbackScreen: Screen = fallbackProfile.role === 'developer'
        ? 'developer-console'
        : fallbackProfile.role === 'super_admin'
          ? 'super-admin-dashboard'
          : 'company-admin-dashboard';
      navigateToModule(fallbackScreen, {});
    }
  };

  useEffect(() => {
    // NO AUTO SESSION CHECK - User must explicitly login
    // Marketing site stays visible until user clicks Login button
    const checkSession = async () => {
      try {
        console.log('?? Session check disabled - marketing site stays visible');
        console.log('?? User must click Login button to authenticate');
        // Don't check for existing session - always show marketing site first
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setSessionChecked(true);
      }
    };

    checkSession();
  }, []);

  // Handle URL hash for OAuth redirects
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#dashboard' && currentUser) {
        const targetScreen: Screen = currentUser.role === 'developer' ? 'developer-console' : currentUser.role === 'super_admin' ? 'super-admin-dashboard' : 'company-admin-dashboard';
        navigateToModule(targetScreen, {});
        // Clean up the hash
        window.history.replaceState(null, '', window.location.pathname);
      }
    };

    // Check on mount
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [currentUser]);


  useEffect(() => {
    if (currentUser) {
      const loadProjects = async () => {
        const projects = await api.fetchAllProjects(currentUser);
        setAllProjects(projects);
      };
      loadProjects();

      // Ensure user is navigated to dashboard if no navigation exists
      if (navigationStack.length === 0) {
        console.log('?? No navigation stack - navigating to dashboard...');
        const defaultScreen: Screen = currentUser.role === 'developer'
          ? 'developer-console'
          : currentUser.role === 'super_admin'
            ? 'super-admin-dashboard'
            : 'company-admin-dashboard';
        navigateToModule(defaultScreen, {});
      }
    } else {
      // User logged out - clear navigation
      if (navigationStack.length > 0) {
        setNavigationStack([]);
      }
      setAllProjects([]);
    }
  }, [currentUser]);

  useEffect(() => {
    const handleLogoutTrigger = () => {
      handleLogout();
    };
    window.addEventListener('userLoggedOutTrigger', handleLogoutTrigger);
    return () => window.removeEventListener('userLoggedOutTrigger', handleLogoutTrigger);
  }, []);

  // Listen for login button click from marketing site
  useEffect(() => {
    const handleShowLogin = () => {
      console.log('?? Login button clicked - showing login screen');
      setShowLoginScreen(true);
    };
    window.addEventListener('showLoginScreen', handleShowLogin);
    return () => window.removeEventListener('showLoginScreen', handleShowLogin);
  }, []);

  const handleLoginSuccess = (user: User) => {
    console.log('? Login successful:', user.name);
    console.log('?? Setting current user...');
    setCurrentUser(user);

    window.dispatchEvent(new CustomEvent('userLoggedIn'));
    showSuccess('Welcome back!', `Hello ${user.name}`);

    console.log('? User set - dashboard will render automatically');
  };

  const handleLogout = async () => {
    logger.logUserAction('logout_initiated', { userId: currentUser?.id }, currentUser?.id);

    await authService.logout();

    setCurrentUser(null);
    setNavigationStack([]);

    // Clear all cache and storage
    localStorage.clear();
    sessionStorage.clear();

    logger.logUserAction('logout_successful', { userId: currentUser?.id }, currentUser?.id);

    // Force full page reload to reset everything and show marketing site
    window.location.href = '/';
  };


  const openProjectSelector = useCallback((title: string, onSelect: (projectId: string) => void) => {
    setProjectSelectorTitle(title);
    setProjectSelectorCallback(() => (projectId: string) => {
      onSelect(projectId);
      setIsProjectSelectorOpen(false);
    });
    setIsProjectSelectorOpen(true);
  }, []);

  const handleDeepLinkWrapper = useCallback((projectId: string, screen: Screen, params: any) => {
    handleDeepLink(projectId, screen, params, allProjects);
  }, [handleDeepLink, allProjects]);

  const handleQuickAction = (action: Screen) => {
    openProjectSelector(`Select a project for the new ${action.split('-')[1]}`, (projectId) => {
      handleDeepLink(projectId, action, {}, allProjects);
    });
  };

  const handleSuggestAction = async () => {
    if (!currentUser) return;
    setIsAISuggestionModalOpen(true);
    setIsAISuggestionLoading(true);
    setAiSuggestion(null);
    const suggestion = await api.getAISuggestedAction(currentUser);
    setAiSuggestion(suggestion);
    setIsAISuggestionLoading(false);
  };

  const handleAISuggestionAction = (link: NotificationLink) => {
    if (link.projectId) {
      handleDeepLink(link.projectId, link.screen, link.params, allProjects);
    }
    setIsAISuggestionModalOpen(false);
  };

  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-xl shadow-2xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading session...</p>
          <p className="text-gray-500 text-sm mt-2">This should only take a moment</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    console.log('?? No currentUser - checking if login screen should show');
    console.log('?? Show login screen:', showLoginScreen);

    // If login button was clicked, show login screen
    if (showLoginScreen) {
      console.log('?? Showing login screen');
      return (
        <div className="bg-slate-100 min-h-screen flex items-center justify-center">
          <AuthScreen onLoginSuccess={handleLoginSuccess} />
        </div>
      );
    }

    // Otherwise, show marketing landing pages
    console.log('?? Marketing site visible - waiting for login click');
    return <LandingRouter onLoginSuccess={handleLoginSuccess} />;
  }

  console.log('? Current user exists - showing app:', currentUser.name);
  console.log('?? Navigation stack length:', navigationStack.length);
  console.log('?? Current nav item:', currentNavItem);

  // If no navigation stack, show dashboard directly
  if (!currentNavItem || navigationStack.length === 0) {
    console.log('?? No navigation - showing dashboard directly');
    console.log('?? Current user role at render:', currentUser?.role);
    console.log('?? Is developer at render?', currentUser?.role === 'developer');
    const dashboardProps = {
      currentUser,
      navigateTo,
      onDeepLink: handleDeepLinkWrapper,
      onQuickAction: handleQuickAction,
      onSuggestAction: handleSuggestAction,
      selectProject: (id: string) => {
        const project = allProjects.find(p => p.id === id);
        if (project) selectProject(project);
      },
      can: () => true, // Simple permission check - allow all for now
      goBack
    };

    if (currentUser.role === 'developer') {
      console.log('?? DEVELOPER ROLE DETECTED - Rendering Developer Dashboard V2');
      console.log('?? Current user:', currentUser);
      return (
        <Suspense fallback={<ScreenLoader />}>
          <DeveloperDashboardV2 currentUser={currentUser} navigateTo={navigateToModule} isDarkMode={true} />
        </Suspense>
      );
    }
    if (currentUser.role === 'super_admin') {
      console.log('?? SUPER ADMIN ROLE DETECTED - Rendering Super Admin Dashboard V2');
      return (
        <Suspense fallback={<ScreenLoader />}>
          <SuperAdminDashboardV2
            isDarkMode={true}
            onNavigate={(section) => {
              console.log('Navigating to section:', section);
              // Map section IDs to actual screens
              const sectionScreenMap: Record<string, string> = {
                'user-management': 'platform-admin',
                'company-management': 'platform-admin',
                'billing-payments': 'platform-admin',
                'marketplace': 'marketplace',
                'analytics-reports': 'platform-admin',
                'system-settings': 'platform-admin',
                'security-audit': 'platform-admin',
                'database-management': 'platform-admin',
                'activity-monitoring': 'platform-admin',
                'content-management': 'platform-admin',
                'notifications': 'platform-admin',
                'permissions': 'platform-admin',
                'integrations': 'platform-admin'
              };
              const targetScreen = sectionScreenMap[section] || 'platform-admin';
              navigateToModule(targetScreen as any, { section });
            }}
          />
        </Suspense>
      );
    }
    if (currentUser.role === 'company_admin') {
      console.log('?? COMPANY ADMIN ROLE DETECTED - Rendering Company Admin Dashboard V2');
      return (
        <Suspense fallback={<ScreenLoader />}>
          <CompanyAdminDashboardV2
            currentUser={currentUser}
            navigateTo={(screen: string, params?: any) => {
              console.log('Company Admin navigating to:', screen, params);
              // Map section IDs to actual screens
              const sectionScreenMap: Record<string, string> = {
                'projects': 'projects',
                'teams': 'platform-admin',
                'documents': 'documents',
                'marketplace': 'marketplace',
                'analytics': 'platform-admin',
                'billing': 'platform-admin',
                'clients': 'platform-admin',
                'settings': 'platform-admin',
                'daily-logs': 'daily-log',
                'safety-reports': 'platform-admin',
                'quality-control': 'platform-admin',
                'time-tracking': 'platform-admin',
                'equipment': 'platform-admin',
                'procurement': 'platform-admin',
                'inspections': 'platform-admin',
                'workforce': 'platform-admin'
              };
              const targetScreen = sectionScreenMap[screen] || screen;
              navigateToModule(targetScreen as any, params);
            }}
            isDarkMode={true}
          />
        </Suspense>
      );
    }
    return (
      <div className="min-h-screen bg-gray-50">
        <Suspense fallback={<ScreenLoader />}>
          <UnifiedDashboardScreen {...dashboardProps} />
        </Suspense>
      </div>
    );
  }

  const { screen, params, project } = currentNavItem;
  console.log('?? Rendering screen:', screen);
  console.log('?? Current user role:', currentUser?.role);
  console.log('?? Navigation stack:', navigationStack);
  const ScreenComponent = SCREEN_COMPONENTS[screen] || PlaceholderToolScreen;
  console.log('?? Screen component:', ScreenComponent.name);

  if (screen === 'my-apps-desktop') {
    return (
      <Suspense fallback={<ScreenLoader />}>
        <Base44Clone user={currentUser} onLogout={handleLogout} />
      </Suspense>
    );
  }

  const getSidebarProject = useMemo(() => {
    if (project) {
      return project;
    }
    return {
      ...MOCK_PROJECT,
      id: '',
      name: 'Global View',
      location: `Welcome, ${currentUser?.name || 'User'}`,
    };
  }, [project, currentUser?.name]);

  const sidebarGoHome = useCallback(() => {
    if (currentUser.role === 'developer') {
      navigateToModule('developer-console');
      return;
    }
    if (currentUser.role === 'super_admin') {
      navigateToModule('super-admin-dashboard');
      return;
    }
    if (currentUser.role === 'company_admin') {
      navigateToModule('company-admin-dashboard');
      return;
    }
    goHome();
  }, [currentUser.role, navigateToModule, goHome]);

  return (
    <div className="bg-slate-50">
      <AppLayout
        sidebar={
          <Sidebar
            project={getSidebarProject}
            navigateTo={navigateTo}
            navigateToModule={navigateToModule}
            goHome={sidebarGoHome}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        }
        floatingMenu={<FloatingMenu
          currentUser={currentUser}
          navigateToModule={navigateToModule}
          openProjectSelector={openProjectSelector}
          onDeepLink={handleDeepLinkWrapper}
        />}
      >
        <div className="p-8">
          <Suspense fallback={<ScreenLoader />}>
            <ScreenComponent
              currentUser={currentUser}
              selectProject={selectProject}
              navigateTo={navigateTo}
              onDeepLink={handleDeepLink}
              onQuickAction={handleQuickAction}
              onSuggestAction={handleSuggestAction}
              openProjectSelector={openProjectSelector}
              project={project}
              goBack={goBack}
              can={can}
              {...params}
            />
          </Suspense>
        </div>
      </AppLayout>

      <AISuggestionModal
        isOpen={isAISuggestionModalOpen}
        isLoading={isAISuggestionLoading}
        suggestion={aiSuggestion}
        onClose={() => setIsAISuggestionModalOpen(false)}
        onAction={handleAISuggestionAction}
        currentUser={currentUser}
      />
      {isProjectSelectorOpen && (
        <ProjectSelectorModal
          title={projectSelectorTitle}
          onClose={() => setIsProjectSelectorOpen(false)}
          onSelectProject={projectSelectorCallback}
          currentUser={currentUser}
        />
      )}

      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      {/* Global AI Chatbot - Available on all pages */}
      {currentUser && <ChatbotWidget />}
    </div>
  );
}

export default App;
