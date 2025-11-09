import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Screen, User, Project, NotificationLink, AISuggestion, PermissionAction, PermissionSubject } from './types.ts';
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
import { usePermissions } from './hooks/usePermissions.ts';
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


type NavigationItem = {
    screen: Screen;
    params?: any;
    project?: Project;
};

const SCREEN_COMPONENTS: { [key in Screen]: React.FC<any> } = {
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
    const [projectSelectorCallback, setProjectSelectorCallback] = useState<(projectId: string) => void>(() => () => { });
    const [projectSelectorTitle, setProjectSelectorTitle] = useState('');

    const { can } = usePermissions(currentUser!);
    const { toasts, removeToast, showSuccess, showError } = useToast();

    // Note: handleOAuthCallback and handleUserSignIn removed - Supabase auth replaced with JWT authService

    useEffect(() => {
        // Check for existing session on mount
        const checkSession = async () => {
            try {
                console.log('🔍 Checking for existing session...');
                const user = await authService.getCurrentUser();

                if (user) {
                    console.log('✅ Session found:', user.name);
                    setCurrentUser(user);
                    if (navigationStack.length === 0) {
                        console.log('🔄 Navigating to dashboard from session restore...');
                        const defaultScreenForRole: Screen = user.role === 'developer'
                            ? 'developer-dashboard'
                            : user.role === 'super_admin'
                                ? 'super-admin-dashboard'
                                : 'global-dashboard';
                        navigateToModule(defaultScreenForRole, {});
                    }
                    window.dispatchEvent(new CustomEvent('userLoggedIn'));
                } else {
                    console.log('ℹ️ No active session');
                }
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
                console.log('🔄 No navigation stack - navigating to dashboard...');
                const defaultScreen: Screen = currentUser.role === 'developer'
                    ? 'developer-dashboard'
                    : currentUser.role === 'super_admin'
                        ? 'super-admin-dashboard'
                        : 'global-dashboard';
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

    const handleLoginSuccess = (user: User) => {
        console.log('✅ Login successful:', user.name);
        console.log('🔄 Setting current user...');
        setCurrentUser(user);

        window.dispatchEvent(new CustomEvent('userLoggedIn'));
        showSuccess('Welcome back!', `Hello ${user.name}`);

        console.log('✅ User set - dashboard will render automatically');
    };

    const handleLogout = async () => {
        logger.logUserAction('logout_initiated', { userId: currentUser?.id }, currentUser?.id);

        await authService.logout();

        setCurrentUser(null);
        setNavigationStack([]);
        window.dispatchEvent(new CustomEvent('userLoggedOut'));
        showSuccess('Logged out', 'You have been successfully logged out');
        logger.logUserAction('logout_successful', { userId: currentUser?.id }, currentUser?.id);
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
        console.log('🚫 No currentUser - showing AuthScreen');
        console.log('📊 Session checked:', sessionChecked);
        console.log('📊 Navigation stack:', navigationStack);
        return (
            <div className="bg-slate-100 min-h-screen flex items-center justify-center">
                <AuthScreen onLoginSuccess={handleLoginSuccess} />
            </div>
        );
    }

    console.log('✅ Current user exists - showing app:', currentUser.name);
    console.log('📊 Navigation stack length:', navigationStack.length);
    console.log('📊 Current nav item:', currentNavItem);

    // If no navigation stack, show dashboard directly
    if (!currentNavItem || navigationStack.length === 0) {
        console.log('🏠 No navigation - showing dashboard directly');
        if (currentUser.role === 'developer') {
            return (
                <div className="min-h-screen bg-gray-50">
                    <DeveloperDashboardScreen />
                </div>
            );
        }
        if (currentUser.role === 'super_admin') {
            return (
                <div className="min-h-screen bg-gray-50">
                    <SuperAdminDashboardNew
                        currentUser={currentUser}
                        selectProject={(projectId: string) => {
                            const project = allProjects.find(p => p.id === projectId);
                            if (project) selectProject(project);
                        }}
                    />
                </div>
            );
        }
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

        return (
            <div className="min-h-screen bg-gray-50">
                <UnifiedDashboardScreen {...dashboardProps} />
            </div>
        );
    }

    const { screen, params, project } = currentNavItem;
    const ScreenComponent = SCREEN_COMPONENTS[screen] || PlaceholderToolScreen;

    if (screen === 'my-apps-desktop') {
        return <Base44Clone user={currentUser} onLogout={handleLogout} />;
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
            navigateToModule('developer-dashboard');
        } else if (currentUser.role === 'super_admin') {
            navigateToModule('super-admin-dashboard');
        } else {
            goHome();
        }
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
