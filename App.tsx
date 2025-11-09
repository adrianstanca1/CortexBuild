import React, { useState, useEffect, useCallback, useMemo, useRef, useReducer } from 'react';
import { Screen, User, Project, NotificationLink, AISuggestion } from './types.ts';
import * as api from './api.ts';
import AuthScreen from './components/screens/AuthScreen.tsx';
import AppLayout from './components/layout/AppLayout.tsx';
import Sidebar from './components/layout/Sidebar.tsx';
import { MOCK_PROJECT } from './constants.ts';
import AISuggestionModal from './components/modals/AISuggestionModal.tsx';
import ProjectSelectorModal from './components/modals/ProjectSelectorModal.tsx';
import FloatingMenu from './components/layout/FloatingMenu.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import ToastContainer from './components/ToastContainer.tsx';
import { can as canCheck } from './permissions.ts';
import * as authService from './auth/authService.ts';
import { useToast } from './hooks/useToast.ts';
import { useNavigation } from './hooks/useNavigation.ts';
import { logger } from './utils/logger.ts';
import { ChatbotWidget } from './components/chat/ChatbotWidget.tsx';

// Screen Components
import UnifiedDashboardScreen from './components/screens/UnifiedDashboardScreen.tsx';
import ProjectsListScreen from './components/screens/ProjectsListScreen.tsx';
import ProjectHomeScreen from './components/screens/ProjectHomeScreen.tsx';
import MyDayScreen from './components/screens/MyDayScreen.tsx';
import TasksScreen from './components/screens/TasksScreen.tsx';
import TaskDetailScreen from './components/screens/TaskDetailScreen.tsx';
import NewTaskScreen from './components/screens/NewTaskScreen.tsx';
import DailyLogScreen from './components/screens/DailyLogScreen.tsx';
import PhotoGalleryScreen from './components/screens/PhotoGalleryScreen.tsx';
import RFIsScreen from './components/screens/RFIsScreen.tsx';
import RFIDetailScreen from './components/screens/RFIDetailScreen.tsx';
import NewRFIScreen from './components/screens/NewRFIScreen.tsx';
import { ProductionSDKDeveloperView } from './components/sdk/ProductionSDKDeveloperView';
import { DeveloperDashboardScreen } from './components/screens/developer/DeveloperDashboardScreen.tsx';
import PunchListScreen from './components/screens/PunchListScreen.tsx';
import PunchListItemDetailScreen from './components/screens/PunchListItemDetailScreen.tsx';
import NewPunchListItemScreen from './components/screens/NewPunchListItemScreen.tsx';
import DrawingsScreen from './components/screens/DrawingsScreen.tsx';
import PlansViewerScreen from './components/screens/PlansViewerScreen.tsx';
import DayworkSheetsListScreen from './components/screens/DayworkSheetsListScreen.tsx';
import DayworkSheetDetailScreen from './components/screens/DayworkSheetDetailScreen.tsx';
import NewDayworkSheetScreen from './components/screens/NewDayworkSheetScreen.tsx';
import DocumentsScreen from './components/screens/DocumentsScreen.tsx';
import DeliveryScreen from './components/screens/DeliveryScreen.tsx';
import DrawingComparisonScreen from './components/screens/DrawingComparisonScreen.tsx';

// Module Screens
import AccountingScreen from './components/screens/modules/AccountingScreen.tsx';
import AIToolsScreen from './components/screens/modules/AIToolsScreen.tsx';
import DocumentManagementScreen from './components/screens/modules/DocumentManagementScreen.tsx';
import TimeTrackingScreen from './components/screens/modules/TimeTrackingScreen.tsx';
import ProjectOperationsScreen from './components/screens/modules/ProjectOperationsScreen.tsx';
import FinancialManagementScreen from './components/screens/modules/FinancialManagementScreen.tsx';
import BusinessDevelopmentScreen from './components/screens/modules/BusinessDevelopmentScreen.tsx';
import AIAgentsMarketplaceScreen from './components/screens/modules/AIAgentsMarketplaceScreen.tsx';
import MyTasksScreen from './components/screens/MyTasksScreen.tsx';
import PlaceholderToolScreen from './components/screens/tools/PlaceholderToolScreen.tsx';

import { Base44Clone } from './components/base44/Base44Clone.tsx';

// Admin Screens
import PlatformAdminScreen from './components/screens/admin/PlatformAdminScreen.tsx';
import SuperAdminDashboardScreen from './components/screens/admin/SuperAdminDashboardScreen.tsx';
import SuperAdminDashboardNew from './components/screens/dashboards/SuperAdminDashboard.tsx';
import CompanyAdminDashboardNew from './components/screens/dashboards/CompanyAdminDashboardNew.tsx';

// ML & Advanced Analytics Screens
import AdvancedMLDashboard from './components/screens/dashboards/AdvancedMLDashboard.tsx';


interface ScreenComponentProps {
    currentUser?: User;
    selectProject?: (project: Project) => void;
    navigateTo?: (screen: Screen, params?: Record<string, unknown>) => void;
    onDeepLink?: (projectId: string, screen: Screen, params: Record<string, unknown>) => void;
    onQuickAction?: (action: Screen) => void;
    onSuggestAction?: () => void;
    openProjectSelector?: (title: string, onSelect: (projectId: string) => void) => void;
    project?: Project;
    goBack?: () => void;
    can?: (action: string, subject: string) => boolean;
    [key: string]: unknown;
}

const SCREEN_COMPONENTS: Record<Screen, React.FC<ScreenComponentProps>> = {
    'global-dashboard': UnifiedDashboardScreen,
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
    'super-admin-dashboard': SuperAdminDashboardScreen,
    'super-admin-dashboard-new': SuperAdminDashboardNew,
    'company-admin-dashboard-new': CompanyAdminDashboardNew,
    'sdk-developer': ProductionSDKDeveloperView,
    'my-apps-desktop': Base44Clone,
    // Admin
    'platform-admin': PlatformAdminScreen,
    // ML & Advanced Analytics
    'ml-analytics': AdvancedMLDashboard,
    // Tools
    'placeholder-tool': PlaceholderToolScreen,
};

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [sessionChecked, setSessionChecked] = useState(false);
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
    const [projectSelectorCallback, setProjectSelectorCallback] = useState<(projectId: string) => void>(() => (_projectId: string) => { });
    const [projectSelectorTitle, setProjectSelectorTitle] = useState('');

    // Prevent infinite loop: track if we've done initial navigation
    const hasInitializedNavigation = useRef(false);

    const { toasts, removeToast, showSuccess } = useToast();

    // Create a stable 'can' function that uses a ref to access the latest currentUser
    // This prevents infinite loops by not depending on currentUser in the dependency array
    const currentUserRef = useRef(currentUser);
    currentUserRef.current = currentUser;

    const can = useCallback((action, subject) => {
        const user = currentUserRef.current;
        if (!user) return false;
        return canCheck(user.role, action, subject);
    }, []); // Empty deps - stable function that accesses latest user via ref

    // Note: handleOAuthCallback and handleUserSignIn removed - Supabase auth replaced with JWT authService

    useEffect(() => {
        // Check for existing session on mount
        const checkSession = async () => {
            try {
                logger.debug('Checking for existing session...');
                const user = await authService.getCurrentUser();

                if (user) {
                    logger.info('Session found', { userId: user.id, name: user.name });
                    setCurrentUser(user);
                    if (navigationStack.length === 0) {
                        logger.debug('Navigating to dashboard from session restore...');
                        const defaultScreenForRole: Screen = user.role === 'developer'
                            ? 'developer-dashboard'
                            : user.role === 'super_admin'
                                ? 'super-admin-dashboard'
                                : 'global-dashboard';
                        navigateToModule(defaultScreenForRole, {});
                    }
                    window.dispatchEvent(new Event('userLoggedIn'));
                } else {
                    logger.info('No active session');
                }
            } catch (error) {
                logger.error('Session check error', { error });
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
                const targetScreen: Screen = currentUser.role === 'developer' ? 'developer-dashboard' : 'global-dashboard';
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
    }, [currentUser?.id, currentUser?.role, navigateToModule]); // Use specific properties, not whole object


    useEffect(() => {
        if (currentUser) {
            const loadProjects = async () => {
                const projects = await api.fetchAllProjects(currentUser);
                setAllProjects(projects);
            };
            loadProjects();
        } else {
            // User logged out - clear navigation
            if (navigationStack.length > 0) {
                setNavigationStack([]);
            }
            setAllProjects([]);
        }
    }, [currentUser?.id]); // Only run when user ID changes, not on every render

    // Separate effect for initial navigation - runs ONCE after login
    useEffect(() => {
        if (currentUser && navigationStack.length === 0 && sessionChecked && !hasInitializedNavigation.current) {
            logger.debug('No navigation stack - navigating to dashboard...');
            hasInitializedNavigation.current = true; // Mark as initialized
            const defaultScreen: Screen = currentUser.role === 'developer'
                ? 'developer-dashboard'
                : currentUser.role === 'super_admin'
                    ? 'super-admin-dashboard'
                    : 'global-dashboard';
            navigateToModule(defaultScreen, {});
        }

        // Reset flag when user logs out
        if (!currentUser && hasInitializedNavigation.current) {
            hasInitializedNavigation.current = false;
        }
    }, [currentUser?.id, sessionChecked]); // Don't track navigationStack.length - causes infinite loop!

    useEffect(() => {
        const handleLogoutTrigger = () => {
            handleLogout();
        };
        window.addEventListener('userLoggedOutTrigger', handleLogoutTrigger);
        return () => window.removeEventListener('userLoggedOutTrigger', handleLogoutTrigger);
    }, []);

    const handleLoginSuccess = (user: User) => {
        logger.info('Login successful', { userId: user.id, name: user.name });
        setCurrentUser(user);

        window.dispatchEvent(new Event('userLoggedIn'));
        showSuccess('Welcome back!', `Hello ${user.name}`);
    };

    const handleLogout = async () => {
        logger.logUserAction('logout_initiated', { userId: currentUser?.id }, currentUser?.id);

        await authService.logout();

        setCurrentUser(null);
        setNavigationStack([]);
        window.dispatchEvent(new Event('userLoggedOut'));
        showSuccess('Logged out', 'You have been successfully logged out');
        logger.logUserAction('logout_successful', { userId: currentUser?.id }, currentUser?.id);
    };


    const openProjectSelector = useCallback((title: string, onSelect: (projectId: string) => void) => {
        setProjectSelectorTitle(title);
        setProjectSelectorCallback(() => (selectedProjectId: string) => {
            onSelect(selectedProjectId);
            setIsProjectSelectorOpen(false);
        });
        setIsProjectSelectorOpen(true);
    }, []);

    const handleDeepLinkWrapper = useCallback((projectId: string, screen: Screen, params: Record<string, unknown>) => {
        // Use function to get current allProjects without depending on it
        setAllProjects(currentProjects => {
            handleDeepLink(projectId, screen, params, currentProjects);
            return currentProjects; // Don't actually update state
        });
    }, [handleDeepLink]);

    const handleQuickAction = useCallback((action: Screen) => {
        openProjectSelector(`Select a project for the new ${action.split('-')[1]}`, (projectId) => {
            // Access current projects without dependency
            setAllProjects(currentProjects => {
                handleDeepLink(projectId, action, {}, currentProjects);
                return currentProjects;
            });
        });
    }, [openProjectSelector, handleDeepLink]);

    const handleSuggestAction = useCallback(async () => {
        if (!currentUser) return;
        setIsAISuggestionModalOpen(true);
        setIsAISuggestionLoading(true);
        setAiSuggestion(null);
        const suggestion = await api.getAISuggestedAction(currentUser);
        setAiSuggestion(suggestion);
        setIsAISuggestionLoading(false);
    }, [currentUser]);

    const handleAISuggestionAction = useCallback((link: NotificationLink) => {
        setAllProjects(currentProjects => {
            if (link.projectId) {
                handleDeepLink(link.projectId, link.screen, link.params, currentProjects);
            }
            return currentProjects;
        });
        setIsAISuggestionModalOpen(false);
    }, [handleDeepLink]);

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
        logger.debug('No currentUser - showing AuthScreen', {
            sessionChecked,
            navigationStackLength: navigationStack.length
        });
        return (
            <div className="bg-slate-100 min-h-screen flex items-center justify-center">
                <AuthScreen onLoginSuccess={handleLoginSuccess} />
            </div>
        );
    }

    logger.debug('Current user exists - showing app', {
        userName: currentUser.name,
        navigationStackLength: navigationStack.length,
        currentNavItem
    });

    // Wait for navigation to be initialized by the useEffect
    if (!currentNavItem) {
        logger.debug('Waiting for navigation initialization...');
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    const { screen, params, project } = currentNavItem;
    const ScreenComponent = SCREEN_COMPONENTS[screen] || PlaceholderToolScreen;

    if (screen === 'my-apps-desktop') {
        return <Base44Clone user={currentUser} onLogout={handleLogout} />;
    }

    return <ScreenComponent
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
    />;
}
// Before (BROKEN - infinite loop):
const permissions = useMemo(() => {
    const can = (...) => canCheck(currentUser.role, ...);
    return { can };
}, [currentUser?.role, currentUser?.id]); // ❌ Still depends on currentUser object

// After (FIXED - completely stable):
const currentUserRef = useRef(currentUser);
currentUserRef.current = currentUser; // Updates every render

const can = useCallback((...) => {
    const user = currentUserRef.current; // Access latest user
    return canCheck(user.role, ...);
}, []); // ✅ Empty deps - never recreates