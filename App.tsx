// CortexBuild Main App Component
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
import { useToast } from './hooks/useToast';
import { useNavigation } from './hooks/useNavigation';
import { logger } from './utils/logger';
import { ChatbotWidget } from './components/chat/ChatbotWidget';
import { apiClient } from './lib/api/client';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineIndicator from './src/components/OfflineIndicator';

// Lazily loaded screens and feature modules
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
const DeveloperDashboardV2 = lazy(() => import('./components/screens/developer/DeveloperDashboardV2'));
const ConstructionAutomationStudio = lazy(() => import('./components/screens/developer/ConstructionAutomationStudio'));
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
const ConstructionOracle = lazy(() => import('./components/ai/ConstructionOracle'));
const MyApplications = lazy(() => import('./components/applications/MyApplications'));

const ScreenLoader: React.FC = () => (
    <div className="py-16 text-center text-slate-500">
        Loading experience...
    </div>
);

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

const SCREEN_COMPONENTS: Record<Screen, React.ComponentType<any>> = {
    'global-dashboard': UnifiedDashboardScreen,
    'company-admin-dashboard': CompanyAdminDashboardV2,
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
    'developer-dashboard': DeveloperDashboardV2,
    'automation-studio': ConstructionAutomationStudio,
    'developer-workspace': DeveloperWorkspaceScreen,
    'developer-console': EnhancedDeveloperConsole,
    'super-admin-dashboard': SuperAdminDashboardScreen,
    'sdk-developer': ProductionSDKDeveloperView,
    'my-apps-desktop': Base44Clone,
    // Global Marketplace
    'marketplace': GlobalMarketplace,
    'my-applications': MyApplications,
    'admin-review': AdminReviewInterface,
    'developer-submissions': DeveloperSubmissionInterface,
    // Workflow Builders
    'n8n-procore-builder': N8nProcoreWorkflowBuilder,
    'construction-oracle': ConstructionOracle,
    // 'zapier-workflow': ZapierStyleWorkflowBuilder,
    // Admin
    'platform-admin': PlatformAdminScreen,
    'admin-control-panel': AdminControlPanel,
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

    const { can } = usePermissions(currentUser);
    const { toasts, removeToast, showSuccess, showError } = useToast();

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                const user = await authService.getCurrentUser();

                if (user) {
                    setCurrentUser(user);
                    if (navigationStack.length === 0) {
                        const defaultScreen = getDefaultScreenForRole(user.role);
                        navigateToModule(defaultScreen, {});
                    }
                    window.dispatchEvent(new CustomEvent('userLoggedIn'));
                }
            } catch (error) {
                console.error('Session check error:', error);
            } finally {
                setSessionChecked(true);
            }
        };

        checkSession();

    }, []); // Only run on mount

    // Handle URL hash for dashboard navigation
    useEffect(() => {
        if (!currentUser) return;

        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash === '#dashboard') {
                const targetScreen = getDefaultScreenForRole(currentUser.role);
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


    // Load projects and ensure navigation when user logs in
    useEffect(() => {
        if (currentUser) {
            const loadProjects = async () => {
                try {
                    const projects = await apiClient.fetchProjects();
                    setAllProjects(projects);
                } catch (error) {
                    console.error('Error loading projects:', error);
                    setAllProjects([]);
                }
            };
            loadProjects();

            // Ensure user is navigated to dashboard if no navigation exists
            if (navigationStack.length === 0) {
                const defaultScreen = getDefaultScreenForRole(currentUser.role);
                navigateToModule(defaultScreen, {});
            }
        } else {
            // User logged out - clear navigation
            if (navigationStack.length > 0) {
                setNavigationStack([]);
            }
            setAllProjects([]);
        }
    }, [currentUser, navigationStack.length, navigateToModule, setNavigationStack]);

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
        return (
            <div className="bg-slate-100 min-h-screen flex items-center justify-center">
                <AuthScreen onLoginSuccess={handleLoginSuccess} />
            </div>
        );
    }

    // If no navigation stack, show dashboard directly
    if (!currentNavItem || navigationStack.length === 0) {

        const commonProps = {
            currentUser,
            navigateTo: navigateToModule,
            isDarkMode: true
        };

        // Render role-specific dashboard
        switch (currentUser.role) {
            case 'developer':
                return (
                    <Suspense fallback={<ScreenLoader />}>
                        <DeveloperDashboardV2 {...commonProps} />
                    </Suspense>
                );

            case 'super_admin':
                return (
                    <Suspense fallback={<ScreenLoader />}>
                        <SuperAdminDashboardV2
                            isDarkMode={true}
                            onNavigate={(section) => {
                                showSuccess('Navigation', `Opening ${section}...`);
                            }}
                        />
                    </Suspense>
                );

            case 'company_admin':
                return (
                    <Suspense fallback={<ScreenLoader />}>
                        <CompanyAdminDashboardV2 {...commonProps} />
                    </Suspense>
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
                    <div className="min-h-screen bg-gray-50">
                        <Suspense fallback={<ScreenLoader />}>
                            <UnifiedDashboardScreen {...dashboardProps} />
                        </Suspense>
                    </div>
                );
            }
        }
    }

    const { screen, params, project } = currentNavItem;
    const ScreenComponent = SCREEN_COMPONENTS[screen] || PlaceholderToolScreen;

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
        // Return a minimal project object for global view
        return {
            id: '',
            name: 'Global View',
            location: `Welcome, ${currentUser?.name || 'User'}`,
            companyId: currentUser?.companyId || '',
            status: 'active' as const,
            startDate: new Date().toISOString(),
            budget: 0,
            spent: 0
        };
    }, [project, currentUser?.name, currentUser?.companyId]);

    const sidebarGoHome = useCallback(() => {
        const defaultScreen = getDefaultScreenForRole(currentUser.role);
        navigateToModule(defaultScreen);
    }, [currentUser.role, navigateToModule]);

    // Handle app launch from My Applications
    const handleLaunchApp = useCallback((appCode: string) => {
        // Map app codes to screen names
        const appScreenMap: Record<string, Screen> = {
            'construction-oracle': 'construction-oracle',
            'n8n-procore-builder': 'n8n-procore-builder',
            'predictive-maintenance': 'ai-assistant',
            'intelligent-router': 'ai-assistant',
            'cost-optimizer': 'financial-forecaster',
            'safety-sentinel': 'hse-sentinel',
            'quality-inspector': 'ai-assistant',
            'timeline-magic': 'project-controls',
            'document-intelligence': 'ai-assistant',
            'reality-simulator': 'ai-assistant'
        };

        const targetScreen = appScreenMap[appCode] || 'ai-assistant';
        navigateToModule(targetScreen);
    }, [navigateToModule]);

    return (
        <ErrorBoundary componentName="App">
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
                                onLaunchApp={handleLaunchApp}
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

                {/* Global AI Chatbot - Available on all pages when user is logged in */}
                <ChatbotWidget />

                {/* Offline Indicator - Task 2.4: API Error Recovery */}
                <OfflineIndicator position="bottom-right" />
            </div>
        </ErrorBoundary>
    );
}

export default App;
