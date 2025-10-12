// CortexBuild Main App Component
<<<<<<< Updated upstream
// Task 2.1: Error Handling & Resilience - ErrorBoundary Applied
import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { Screen, User, Project, NotificationLink, AISuggestion } from './types';
import AuthScreen from './components/screens/AuthScreen';
import AppLayout from './components/layout/AppLayout';
import Sidebar from './components/layout/Sidebar';
import AISuggestionModal from './components/modals/AISuggestionModal';
import ProjectSelectorModal from './components/modals/ProjectSelectorModal';
import FloatingMenu from './components/layout/FloatingMenu';
import ToastContainer from './components/ToastContainer';
import { usePermissions } from './hooks/usePermissions';
import * as authService from './auth/authService';
import { useToast } from './src/hooks/useToast';
import { useNavigation } from './hooks/useNavigation';
import { logger } from './utils/logger';
import { apiClient } from './lib/api/client';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineIndicator from './src/components/OfflineIndicator';
import { initWebVitals } from './src/monitoring/webVitals';
import { initPerformanceObservers } from './src/monitoring/performanceObserver';
import { initMetricsCollector } from './src/monitoring/metricsCollector';
import { initPerformanceAlerting } from './src/monitoring/alerting';
import { initializeModules, ModuleRegistry } from './src/modules';
import { useModule } from './src/modules/useModule';

// Lazily loaded screens and feature modules
const ChatbotWidget = lazy(() =>
    import('./components/chat/ChatbotWidget').then(module => ({
        default: module.ChatbotWidget
    }))
);
=======
import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { Screen, User, Project, NotificationLink, AISuggestion, PermissionAction, PermissionSubject } from './types';
import * as api from './api';
import AuthScreen from './components/screens/AuthScreen';
import AppLayout from './components/layout/AppLayout';
import Sidebar from './components/layout/Sidebar';
import { MOCK_PROJECT } from './constants';
import AISuggestionModal from './components/modals/AISuggestionModal';
import ProjectSelectorModal from './components/modals/ProjectSelectorModal';
import FloatingMenu from './components/layout/FloatingMenu';
import ErrorBoundary from './components/ErrorBoundary';
import ToastContainer from './components/ToastContainer';
import { usePermissions } from './hooks/usePermissions';
import * as authService from './auth/authService';
import { useToast } from './hooks/useToast';
import { useNavigation } from './hooks/useNavigation';
import { logger } from './utils/logger';
import { ChatbotWidget } from './components/chat/ChatbotWidget';
import { supabase } from './supabaseClient';

// Lazily loaded screens and feature modules
>>>>>>> Stashed changes
const UnifiedDashboardScreen = lazy(() => import('./components/screens/UnifiedDashboardScreen'));
const ProjectsListScreen = lazy(() => import('./components/screens/ProjectsListScreen'));
const ProjectHomeScreen = lazy(() => import('./components/screens/ProjectHomeScreen'));
const MyDayScreen = lazy(() => import('./components/screens/MyDayScreen'));
const TasksScreen = lazy(() => import('./components/screens/TasksScreen'));
const TaskDetailScreen = lazy(() => import('./components/screens/TaskDetailScreen'));
const NewTaskScreen = lazy(() => import('./components/screens/NewTaskScreen'));
const DailyLogScreen = lazy(() => import('./components/screens/DailyLogScreen'));
const PhotoGalleryScreen = lazy(() => import('./components/screens/PhotoGalleryScreen'));
const RFIsScreen = lazy(() => import('./components/screens/RFIsScreen'));
const RFIDetailScreen = lazy(() => import('./components/screens/RFIDetailScreen'));
const NewRFIScreen = lazy(() => import('./components/screens/NewRFIScreen'));
const ProductionSDKDeveloperView = lazy(() =>
    import('./components/sdk/ProductionSDKDeveloperView').then(module => ({
        default: module.ProductionSDKDeveloperView
    }))
);
const DeveloperWorkspaceScreen = lazy(() => import('./components/screens/developer/DeveloperWorkspaceScreen'));
const EnhancedDeveloperConsole = lazy(() => import('./components/screens/developer/EnhancedDeveloperConsole'));
<<<<<<< Updated upstream
const DeveloperDashboardV2 = lazy(() => import('./components/screens/developer/DeveloperDashboardV2'));
const ConstructionAutomationStudio = lazy(() => import('./components/screens/developer/ConstructionAutomationStudio'));
=======
const ModernDeveloperDashboard = lazy(() => import('./components/screens/developer/ModernDeveloperDashboard'));
const DeveloperDashboardV2 = lazy(() => import('./components/screens/developer/DeveloperDashboardV2'));
const ConstructionAutomationStudio = lazy(() => import('./components/screens/developer/ConstructionAutomationStudio'));
const CompanyAdminDashboardScreen = lazy(() => import('./components/screens/company/CompanyAdminDashboardScreen'));
const CompanyAdminDashboard = lazy(() => import('./components/screens/company/CompanyAdminDashboard'));
>>>>>>> Stashed changes
const CompanyAdminDashboardV2 = lazy(() => import('./components/screens/company/CompanyAdminDashboardV2'));
const PunchListScreen = lazy(() => import('./components/screens/PunchListScreen'));
const PunchListItemDetailScreen = lazy(() => import('./components/screens/PunchListItemDetailScreen'));
const NewPunchListItemScreen = lazy(() => import('./components/screens/NewPunchListItemScreen'));
const DrawingsScreen = lazy(() => import('./components/screens/DrawingsScreen'));
const PlansViewerScreen = lazy(() => import('./components/screens/PlansViewerScreen'));
const DayworkSheetsListScreen = lazy(() => import('./components/screens/DayworkSheetsListScreen'));
const DayworkSheetDetailScreen = lazy(() => import('./components/screens/DayworkSheetDetailScreen'));
const NewDayworkSheetScreen = lazy(() => import('./components/screens/NewDayworkSheetScreen'));
const DocumentsScreen = lazy(() => import('./components/screens/DocumentsScreen'));
const DeliveryScreen = lazy(() => import('./components/screens/DeliveryScreen'));
const DrawingComparisonScreen = lazy(() => import('./components/screens/DrawingComparisonScreen'));
const AccountingScreen = lazy(() => import('./components/screens/modules/AccountingScreen'));
const AIToolsScreen = lazy(() => import('./components/screens/modules/AIToolsScreen'));
const DocumentManagementScreen = lazy(() => import('./components/screens/modules/DocumentManagementScreen'));
const TimeTrackingScreen = lazy(() => import('./components/screens/modules/TimeTrackingScreen'));
const ProjectOperationsScreen = lazy(() => import('./components/screens/modules/ProjectOperationsScreen'));
const FinancialManagementScreen = lazy(() => import('./components/screens/modules/FinancialManagementScreen'));
const BusinessDevelopmentScreen = lazy(() => import('./components/screens/modules/BusinessDevelopmentScreen'));
const AIAgentsMarketplaceScreen = lazy(() => import('./components/screens/modules/AIAgentsMarketplaceScreen'));
const MyTasksScreen = lazy(() => import('./components/screens/MyTasksScreen'));
const PlaceholderToolScreen = lazy(() => import('./components/screens/tools/PlaceholderToolScreen'));
const GlobalMarketplace = lazy(() => import('./components/marketplace/GlobalMarketplace'));
<<<<<<< Updated upstream
=======
const MyApplicationsDesktop = lazy(() => import('./components/desktop/MyApplicationsDesktop'));
>>>>>>> Stashed changes
const AdminReviewInterface = lazy(() => import('./components/marketplace/AdminReviewInterface'));
const DeveloperSubmissionInterface = lazy(() => import('./components/marketplace/DeveloperSubmissionInterface'));
const Base44Clone = lazy(() =>
    import('./components/base44/Base44Clone').then(module => ({
        default: module.Base44Clone
    }))
);
const PlatformAdminScreen = lazy(() => import('./components/screens/admin/PlatformAdminScreen'));
const SuperAdminDashboardScreen = lazy(() => import('./components/screens/admin/SuperAdminDashboardScreen'));
const AdminControlPanel = lazy(() => import('./components/admin/AdminControlPanel'));
const SuperAdminDashboardV2 = lazy(() => import('./components/admin/SuperAdminDashboardV2'));
const AdvancedMLDashboard = lazy(() => import('./components/screens/dashboards/AdvancedMLDashboard'));
const N8nProcoreWorkflowBuilder = lazy(() => import('./components/sdk/N8nProcoreWorkflowBuilder'));
<<<<<<< Updated upstream
const ConstructionOracle = lazy(() => import('./components/ai/ConstructionOracle'));
const MyApplications = lazy(() => import('./components/applications/MyApplications'));
=======
>>>>>>> Stashed changes

const ScreenLoader: React.FC = () => (
    <div className="py-16 text-center text-slate-500">
        Loading experience...
    </div>
);

<<<<<<< Updated upstream
// Helper function to get default screen for user role
const getDefaultScreenForRole = (role: string): Screen => {
    switch (role) {
        case 'developer':
            return 'developer-console';
        case 'super_admin':
            return 'super-admin-dashboard';
        case 'company_admin':
        default:
            return 'company-admin-dashboard';
    }
};

// Initialize module system on app load
initializeModules();

// Helper function to get screen component from module registry
const getScreenComponent = (screen: Screen): React.ComponentType<any> | null => {
    const lazyComponent = ModuleRegistry.getLazyComponent(screen);
    if (lazyComponent) {
        return lazyComponent;
    }

    // Fallback to legacy components for screens not yet in module system
    const legacyComponents: Partial<Record<Screen, React.ComponentType<any>>> = {
        'task-detail': TaskDetailScreen,
        'new-task': NewTaskScreen,
        'daily-log': DailyLogScreen,
        'photos': PhotoGalleryScreen,
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
        'delivery': DeliveryScreen,
        'drawing-comparison': DrawingComparisonScreen,
    };

    return legacyComponents[screen] || PlaceholderToolScreen;
=======

type NavigationItem = {
    screen: Screen;
    params?: any;
    project?: Project;
};

const SCREEN_COMPONENTS: Record<Screen, React.ComponentType<any>> = {
    'global-dashboard': UnifiedDashboardScreen,
    'company-admin-dashboard': CompanyAdminDashboard,
    'company-admin-legacy': CompanyAdminDashboardScreen,
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
    'developer-dashboard': ModernDeveloperDashboard,
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
    // Workflow Builders
    'n8n-procore-builder': N8nProcoreWorkflowBuilder,
    // 'zapier-workflow': ZapierStyleWorkflowBuilder,
    // Admin
    'platform-admin': PlatformAdminScreen,
    'admin-control-panel': AdminControlPanel,
    // ML & Advanced Analytics
    'ml-analytics': AdvancedMLDashboard,
    // Tools
    'placeholder-tool': PlaceholderToolScreen,
>>>>>>> Stashed changes
};

const App: React.FC = () => {
    // All hooks must be called at the top, unconditionally, in the same order
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [sessionChecked, setSessionChecked] = useState(false);
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [isAISuggestionModalOpen, setIsAISuggestionModalOpen] = useState(false);
    const [isAISuggestionLoading, setIsAISuggestionLoading] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
    const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState(false);
    const [projectSelectorCallback, setProjectSelectorCallback] = useState<(projectId: string) => void>(() => () => { });
    const [projectSelectorTitle, setProjectSelectorTitle] = useState('');

    // Custom hooks after state hooks
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

    // Destructure currentNavItem for use in hooks
    const { screen, params, project } = currentNavItem || {};

    const { can } = usePermissions(currentUser);
    const { toasts, removeToast, showSuccess, showError } = useToast();

<<<<<<< Updated upstream
    // Check for existing session on mount
=======
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
            console.log('🔐 Handling user sign in for:', user.email);

            // Try to fetch from users table first (our main table)
            let profile = null;
            let fetchError = null;

            try {
                console.log('📊 Fetching user profile from users table...');
                const result = await supabase
                    .from('users')
                    .select('id, name, email, role, avatar, company_id')
                    .eq('id', user.id)
                    .single();

                profile = result.data;
                fetchError = result.error;

                if (profile) {
                    console.log('✅ Profile found in users table:', profile.name);
                } else if (fetchError) {
                    console.warn('⚠️ Error fetching from users table:', fetchError.message);
                }
            } catch (error) {
                console.warn('⚠️ Exception fetching from users table:', error);
            }

            // If not found in users table, try profiles table as fallback
            if (!profile) {
                try {
                    console.log('📊 Trying profiles table as fallback...');
                    const result = await supabase
                        .from('profiles')
                        .select('id, name, email, role, avatar, company_id')
                        .eq('id', user.id)
                        .single();

                    profile = result.data;
                    if (profile) {
                        console.log('✅ Profile found in profiles table:', profile.name);
                    }
                } catch (error) {
                    console.warn('⚠️ Profiles table also failed:', error);
                }
            }

            let finalProfile = profile;

            // If no profile exists in either table, create a profile from user metadata
            if (!profile) {
                console.warn('⚠️ No profile found in database, creating from user metadata');
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
                console.log('✅ Created profile from metadata:', finalProfile);
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

            console.log('👤 Final user profile:', userProfile);
            console.log('🎯 User role from profile:', userProfile?.role);
            console.log('🎯 Is developer?', userProfile?.role === 'developer');

            console.log('📝 Setting currentUser state:', userProfile);
            setCurrentUser(userProfile);

            if (userProfile) {
                // Navigate to dashboard after successful login
                console.log('🚀 Navigating to dashboard...');
                console.log('📍 Current navigation stack before:', navigationStack);
                const defaultScreenForRole: Screen = userProfile.role === 'developer'
                    ? 'developer-console'
                    : userProfile.role === 'super_admin'
                        ? 'super-admin-dashboard'
                        : 'company-admin-dashboard';
                navigateToModule(defaultScreenForRole, {});
                console.log('📍 Navigation stack set to', defaultScreenForRole);

                window.dispatchEvent(new CustomEvent('userLoggedIn'));
                showSuccess('Welcome back!', `Hello ${userProfile.name}`);
                logger.logUserAction('login_successful', { userId: userProfile.id, userEmail: userProfile.email }, userProfile.id);
                console.log('✅ User sign in completed successfully');
                console.log('👤 Current user should now be:', userProfile);
            }
        } catch (error) {
            console.error('❌ Error in sign in:', error);
            // Even on error, try to set a basic user profile so the app doesn't break
            const fallbackProfile: User = {
                id: user.id,
                name: user.email?.split('@')[0] || 'User',
                email: user.email || '',
                role: (user.email === 'adrian.stanca1@gmail.com' ? 'super_admin' : 'company_admin') as any,
                avatar: null,
                companyId: undefined
            };
            console.log('🔄 Using fallback profile:', fallbackProfile);
            setCurrentUser(fallbackProfile);
            const fallbackScreen: Screen = fallbackProfile.role === 'developer'
                ? 'developer-console'
                : fallbackProfile.role === 'super_admin'
                    ? 'super-admin-dashboard'
                    : 'company-admin-dashboard';
            navigateToModule(fallbackScreen, {});
        }
    };

>>>>>>> Stashed changes
    useEffect(() => {
        const checkSession = async () => {
            try {
                const user = await authService.getCurrentUser();

                if (user) {
                    setCurrentUser(user);
                    if (navigationStack.length === 0) {
<<<<<<< Updated upstream
                        const defaultScreen = getDefaultScreenForRole(user.role);
                        navigateToModule(defaultScreen, {});
=======
                        console.log('🔄 Navigating to dashboard from session restore...');
                        const defaultScreenForRole: Screen = user.role === 'developer'
                            ? 'developer-console'
                            : user.role === 'super_admin'
                                ? 'super-admin-dashboard'
                                : 'company-admin-dashboard';
                        navigateToModule(defaultScreenForRole, {});
>>>>>>> Stashed changes
                    }
                    window.dispatchEvent(new CustomEvent('userLoggedIn'));
                }
            } catch (error: unknown) {
                const err = error instanceof Error ? error : new Error('Session check failed');
                logger.logError(err, { context: 'session_check' });

                // Clear invalid session
                await authService.logout().catch(() => {
                    // Ignore logout errors during session check
                });

                // Show user-friendly message only if it's not a "no session" error
                if (error instanceof Error && !error.message.includes('No token')) {
                    showError('Session Expired', 'Please log in again');
                }
            } finally {
                setSessionChecked(true);
            }
        };

        checkSession();

        // Initialize performance monitoring
        initWebVitals();
        initPerformanceObservers();
        initMetricsCollector();
        initPerformanceAlerting();

    }, []); // Only run on mount

    // Handle URL hash for dashboard navigation
    useEffect(() => {
        if (!currentUser) return;

        const handleHashChange = () => {
            const hash = window.location.hash;
<<<<<<< Updated upstream
            if (hash === '#dashboard') {
                const targetScreen = getDefaultScreenForRole(currentUser?.role || 'project_manager');
=======
            if (hash === '#dashboard' && currentUser) {
                const targetScreen: Screen = currentUser.role === 'developer' ? 'developer-console' : currentUser.role === 'super_admin' ? 'super-admin-dashboard' : 'company-admin-dashboard';
>>>>>>> Stashed changes
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
    }, [currentUser, navigateToModule]);


    // Load projects when user logs in
    useEffect(() => {
<<<<<<< Updated upstream
        if (!currentUser) {
=======
        if (currentUser) {
            const loadProjects = async () => {
                const projects = await api.fetchAllProjects(currentUser);
                setAllProjects(projects);
            };
            loadProjects();

            // Ensure user is navigated to dashboard if no navigation exists
            if (navigationStack.length === 0) {
                console.log('🔄 No navigation stack - navigating to dashboard...');
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
>>>>>>> Stashed changes
            setAllProjects([]);
            return;
        }

        const loadProjects = async () => {
            try {
                const projects = await apiClient.fetchProjects();
                setAllProjects(projects);
            } catch (error: unknown) {
                const err = error instanceof Error ? error : new Error('Failed to load projects');
                logger.logError(err, { context: 'load_projects' });
                setAllProjects([]);
            }
        };
        loadProjects();
    }, [currentUser]);

    // Ensure navigation to dashboard when user logs in
    useEffect(() => {
        if (currentUser && navigationStack.length === 0) {
            const defaultScreen = getDefaultScreenForRole(currentUser.role || 'project_manager');
            navigateToModule(defaultScreen, {});
        }
    }, [currentUser, navigationStack.length, navigateToModule]);

    // Clear navigation when user logs out
    useEffect(() => {
        if (!currentUser && navigationStack.length > 0) {
            setNavigationStack([]);
        }
    }, [currentUser, navigationStack.length, setNavigationStack]);

    // Listen for logout trigger events
    useEffect(() => {
        const handleLogoutTrigger = () => {
            handleLogout();
        };
        window.addEventListener('userLoggedOutTrigger', handleLogoutTrigger);
        return () => window.removeEventListener('userLoggedOutTrigger', handleLogoutTrigger);

    }, []); // handleLogout is stable

    const handleLoginSuccess = (user: User) => {
        setCurrentUser(user);
        window.dispatchEvent(new CustomEvent('userLoggedIn'));
        showSuccess('Welcome back!', `Hello ${user.name}`);
    };

    const handleLogout = useCallback(async () => {
        try {
            logger.logUserAction('logout_initiated', { userId: currentUser?.id }, currentUser?.id);

            await authService.logout();

            setCurrentUser(null);
            setNavigationStack([]);
            setAllProjects([]);

            window.dispatchEvent(new CustomEvent('userLoggedOut'));
            showSuccess('Logged out', 'You have been successfully logged out');
            logger.logUserAction('logout_successful', { userId: currentUser?.id }, currentUser?.id);
        } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error('Logout failed');
            logger.logError(err, { context: 'logout' });

            // Force logout even if API call fails
            setCurrentUser(null);
            setNavigationStack([]);
            setAllProjects([]);

            showError('Logout Error', 'You have been logged out locally');
        }
    }, [currentUser, setNavigationStack, showSuccess, showError]);


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
        try {
            const suggestion = await apiClient.getAISuggestion(currentUser.id);
            setAiSuggestion(suggestion);
        } catch (error) {
            console.error('Error getting AI suggestion:', error);
        } finally {
            setIsAISuggestionLoading(false);
        }
    };

    const handleAISuggestionAction = (link: NotificationLink) => {
        if (link.projectId) {
            handleDeepLink(link.projectId, link.screen, link.params, allProjects);
        }
        setIsAISuggestionModalOpen(false);
    };

    // All hooks must be called before any conditional returns
    const getSidebarProject = useMemo(() => {
        if (project) {
            return project;
        }
        // Return a minimal project object for global view
        return {
            id: '',
            name: 'Global View',
            location: `Welcome, ${currentUser?.name || 'User'}`,
            companyId: currentUser?.companyId || '',
            status: 'active' as const,
            startDate: new Date().toISOString(),
            budget: 0,
            spent: 0,
            image: '',
            description: 'Global application view',
            contacts: [],
            snapshot: {
                openRFIs: 0,
                overdueTasks: 0,
                pendingTMTickets: 0,
                aiRiskLevel: 'low'
            }
        };
    }, [project, currentUser?.name, currentUser?.companyId]);

    const sidebarGoHome = useCallback(() => {
        const defaultScreen = getDefaultScreenForRole(currentUser?.role || 'project_manager');
        navigateToModule(defaultScreen);
    }, [currentUser?.role, navigateToModule]);

    // Handle app launch from My Applications
    const handleLaunchApp = useCallback((appCode: string) => {
        // Map app codes to screen names
        const appScreenMap: Record<string, Screen> = {
            'construction-oracle': 'construction-oracle',
            'n8n-procore-builder': 'n8n-procore-builder',
            'predictive-maintenance': 'ai-tools',
            'intelligent-router': 'ai-tools',
            'cost-optimizer': 'financial-management',
            'safety-sentinel': 'ai-tools',
            'quality-inspector': 'ai-tools',
            'timeline-magic': 'project-operations',
            'document-intelligence': 'document-management',
            'reality-simulator': 'ai-tools'
        };

        const targetScreen = appScreenMap[appCode] || 'ai-tools';
        navigateToModule(targetScreen);
    }, [navigateToModule]);

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
<<<<<<< Updated upstream
=======
        console.log('🚫 No currentUser - waiting for login from landing page');
        console.log('📊 Session checked:', sessionChecked);
        console.log('📊 Navigation stack:', navigationStack);
        // Don't render anything - let the landing page in index.html show
        // The landing page will trigger login via the Login button
>>>>>>> Stashed changes
        return (
            <div className="bg-slate-100 min-h-screen flex items-center justify-center">
                <AuthScreen onLoginSuccess={handleLoginSuccess} />
            </div>
        );
    }

    // If no navigation stack, show dashboard directly
    if (!currentNavItem || navigationStack.length === 0) {
<<<<<<< Updated upstream

        const commonProps = {
=======
        console.log('🏠 No navigation - showing dashboard directly');
        console.log('🎯 Current user role at render:', currentUser?.role);
        console.log('🎯 Is developer at render?', currentUser?.role === 'developer');
        const dashboardProps = {
>>>>>>> Stashed changes
            currentUser,
            navigateTo: navigateToModule,
            isDarkMode: true
        };

<<<<<<< Updated upstream
        // Render role-specific dashboard
        switch (currentUser?.role) {
            case 'developer':
                return (
                    <ErrorBoundary>
                        <div className="bg-slate-50">
                            <Suspense fallback={<ScreenLoader />}>
                                <DeveloperDashboardV2 {...commonProps} />
                            </Suspense>
                            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
                            <Suspense fallback={null}>
                                <ChatbotWidget />
                            </Suspense>
                            <OfflineIndicator position="bottom-right" />
                        </div>
                    </ErrorBoundary>
                );

            case 'super_admin':
                return (
                    <ErrorBoundary>
                        <div className="bg-slate-50">
                            <Suspense fallback={<ScreenLoader />}>
                                <SuperAdminDashboardV2
                                    isDarkMode={true}
                                    onNavigate={(section) => {
                                        showSuccess('Navigation', `Opening ${section}...`);
                                    }}
                                />
                            </Suspense>
                            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
                            <Suspense fallback={null}>
                                <ChatbotWidget />
                            </Suspense>
                            <OfflineIndicator position="bottom-right" />
                        </div>
                    </ErrorBoundary>
                );

            case 'company_admin':
                return (
                    <ErrorBoundary>
                        <div className="bg-slate-50">
                            <Suspense fallback={<ScreenLoader />}>
                                <CompanyAdminDashboardV2 {...commonProps} />
                            </Suspense>
                            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
                            <Suspense fallback={null}>
                                <ChatbotWidget />
                            </Suspense>
                            <OfflineIndicator position="bottom-right" />
                        </div>
                    </ErrorBoundary>
                );

            default: {
                // Fallback to unified dashboard
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
                    can,
                    goBack
                };
                return (
                    <ErrorBoundary>
                        <div className="min-h-screen bg-gray-50">
                            <Suspense fallback={<ScreenLoader />}>
                                <UnifiedDashboardScreen {...dashboardProps} />
                            </Suspense>
                            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
                            <Suspense fallback={null}>
                                <ChatbotWidget />
                            </Suspense>
                            <OfflineIndicator position="bottom-right" />
                        </div>
                    </ErrorBoundary>
                );
            }
        }
    }

    // Get screen component from module registry
    const ScreenComponent = getScreenComponent(screen || 'global-dashboard') || PlaceholderToolScreen;

    if (screen === 'my-apps-desktop') {
        return (
            <ErrorBoundary>
                <div className="bg-slate-50">
                    <Suspense fallback={<ScreenLoader />}>
                        <Base44Clone user={currentUser} onLogout={handleLogout} />
                    </Suspense>
                    <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
                    <Suspense fallback={null}>
                        <ChatbotWidget />
                    </Suspense>
                    <OfflineIndicator position="bottom-right" />
                </div>
            </ErrorBoundary>
        );
    }

=======
        if (currentUser.role === 'developer') {
            console.log('🎯 DEVELOPER ROLE DETECTED - Rendering Developer Dashboard V2');
            console.log('👤 Current user:', currentUser);
            return (
                <Suspense fallback={<ScreenLoader />}>
                    <DeveloperDashboardV2 currentUser={currentUser} navigateTo={navigateToModule} isDarkMode={true} />
                </Suspense>
            );
        }
        if (currentUser.role === 'super_admin') {
            console.log('🎯 SUPER ADMIN ROLE DETECTED - Rendering Super Admin Dashboard V2');
            return (
                <Suspense fallback={<ScreenLoader />}>
                    <SuperAdminDashboardV2
                        isDarkMode={true}
                        onNavigate={(section) => {
                            console.log('Navigating to section:', section);
                            toast.success(`Opening ${section}...`);
                        }}
                    />
                </Suspense>
            );
        }
        if (currentUser.role === 'company_admin') {
            console.log('🎯 COMPANY ADMIN ROLE DETECTED - Rendering Company Admin Dashboard V2');
            return (
                <Suspense fallback={<ScreenLoader />}>
                    <CompanyAdminDashboardV2 currentUser={currentUser} navigateTo={navigateToModule} isDarkMode={true} />
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
    console.log('📺 Rendering screen:', screen);
    console.log('📺 Current user role:', currentUser?.role);
    console.log('📺 Navigation stack:', navigationStack);
    const ScreenComponent = SCREEN_COMPONENTS[screen] || PlaceholderToolScreen;
    console.log('📺 Screen component:', ScreenComponent.name);

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

>>>>>>> Stashed changes
    return (
        <ErrorBoundary>
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
<<<<<<< Updated upstream
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
                                onLaunchApp={handleLaunchApp}
                                {...params}
                            />
                        </Suspense>
                    </div>
                </AppLayout>
=======
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
>>>>>>> Stashed changes

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

                {/* Global AI Chatbot - Available on all pages when user is logged in */}
                <Suspense fallback={null}>
                    <ChatbotWidget />
                </Suspense>

                {/* Offline Indicator - Task 2.4: API Error Recovery */}
                <OfflineIndicator position="bottom-right" />
            </div>
        </ErrorBoundary>
    );
}

export default App;
