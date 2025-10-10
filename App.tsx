// CortexBuild Main App Component
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

// Screen Components
import UnifiedDashboardScreen from './components/screens/UnifiedDashboardScreen';
import ProjectsListScreen from './components/screens/ProjectsListScreen';
import ProjectHomeScreen from './components/screens/ProjectHomeScreen';
import MyDayScreen from './components/screens/MyDayScreen';
import TasksScreen from './components/screens/TasksScreen';
import TaskDetailScreen from './components/screens/TaskDetailScreen';
import NewTaskScreen from './components/screens/NewTaskScreen';
import DailyLogScreen from './components/screens/DailyLogScreen';
import PhotoGalleryScreen from './components/screens/PhotoGalleryScreen';
import RFIsScreen from './components/screens/RFIsScreen';
import RFIDetailScreen from './components/screens/RFIDetailScreen';
import NewRFIScreen from './components/screens/NewRFIScreen';
import { ProductionSDKDeveloperView } from './components/sdk/ProductionSDKDeveloperView';
import DeveloperWorkspaceScreen from './components/screens/developer/DeveloperWorkspaceScreen';
import EnhancedDeveloperConsole from './components/screens/developer/EnhancedDeveloperConsole';
import ModernDeveloperDashboard from './components/screens/developer/ModernDeveloperDashboard';
import CompanyAdminDashboardScreen from './components/screens/company/CompanyAdminDashboardScreen';
import CompanyAdminDashboard from './components/screens/company/CompanyAdminDashboard';
import PunchListScreen from './components/screens/PunchListScreen';
import PunchListItemDetailScreen from './components/screens/PunchListItemDetailScreen';
import NewPunchListItemScreen from './components/screens/NewPunchListItemScreen';
import DrawingsScreen from './components/screens/DrawingsScreen';
import PlansViewerScreen from './components/screens/PlansViewerScreen';
import DayworkSheetsListScreen from './components/screens/DayworkSheetsListScreen';
import DayworkSheetDetailScreen from './components/screens/DayworkSheetDetailScreen';
import NewDayworkSheetScreen from './components/screens/NewDayworkSheetScreen';
import DocumentsScreen from './components/screens/DocumentsScreen';
import DeliveryScreen from './components/screens/DeliveryScreen';
import DrawingComparisonScreen from './components/screens/DrawingComparisonScreen';

// Module Screens
import AccountingScreen from './components/screens/modules/AccountingScreen';
import AIToolsScreen from './components/screens/modules/AIToolsScreen';
import DocumentManagementScreen from './components/screens/modules/DocumentManagementScreen';
import TimeTrackingScreen from './components/screens/modules/TimeTrackingScreen';
import ProjectOperationsScreen from './components/screens/modules/ProjectOperationsScreen';
import FinancialManagementScreen from './components/screens/modules/FinancialManagementScreen';
import BusinessDevelopmentScreen from './components/screens/modules/BusinessDevelopmentScreen';
import AIAgentsMarketplaceScreen from './components/screens/modules/AIAgentsMarketplaceScreen';
import MyTasksScreen from './components/screens/MyTasksScreen';
import PlaceholderToolScreen from './components/screens/tools/PlaceholderToolScreen';

import { Base44Clone } from './components/base44/Base44Clone';

// Admin Screens
import PlatformAdminScreen from './components/screens/admin/PlatformAdminScreen';
import SuperAdminDashboardScreen from './components/screens/admin/SuperAdminDashboardScreen';
import AdminControlPanel from './components/admin/AdminControlPanel';

// ML & Advanced Analytics Screens
import AdvancedMLDashboard from './components/screens/dashboards/AdvancedMLDashboard';


type NavigationItem = {
    screen: Screen;
    params?: any;
    project?: Project;
};

const SCREEN_COMPONENTS: { [key in Screen]: React.FC<any> } = {
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
    'developer-workspace': DeveloperWorkspaceScreen,
    'developer-console': EnhancedDeveloperConsole,
    'super-admin-dashboard': SuperAdminDashboardScreen,
    'sdk-developer': ProductionSDKDeveloperView,
    'my-apps-desktop': Base44Clone,
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
                        ? 'developer-dashboard'
                        : 'global-dashboard';
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
                    ? 'developer-dashboard'
                    : 'global-dashboard';
            navigateToModule(fallbackScreen, {});
        }
    };

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
                            ? 'developer-console'
                            : user.role === 'super_admin'
                                ? 'developer-dashboard'
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
                const targetScreen: Screen = currentUser.role === 'developer' ? 'developer-console' : currentUser.role === 'super_admin' ? 'developer-dashboard' : 'global-dashboard';
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
                    ? 'developer-console'
                    : currentUser.role === 'super_admin'
                        ? 'developer-dashboard'
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
        console.log('🚫 No currentUser - waiting for login from landing page');
        console.log('📊 Session checked:', sessionChecked);
        console.log('📊 Navigation stack:', navigationStack);
        // Don't render anything - let the landing page in index.html show
        // The landing page will trigger login via the Login button
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
        console.log('🎯 Current user role at render:', currentUser?.role);
        console.log('🎯 Is developer at render?', currentUser?.role === 'developer');
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
            console.log('🎯 DEVELOPER ROLE DETECTED - Rendering Enhanced Developer Console Pro');
            console.log('👤 Current user:', currentUser);
            return <EnhancedDeveloperConsole onLogout={handleLogout} />;
        }
        if (currentUser.role === 'super_admin') {
            return <AdminControlPanel isDarkMode={true} onLogout={handleLogout} />;
        }
        if (currentUser.role === 'company_admin') {
            return <CompanyAdminDashboard currentUser={currentUser} navigateTo={navigateToModule} isDarkMode={true} />;
        }
        return (
            <div className="min-h-screen bg-gray-50">
                <UnifiedDashboardScreen {...dashboardProps} />
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
            navigateToModule('developer-console');
            return;
        }
        if (currentUser.role === 'super_admin') {
            navigateToModule('developer-dashboard');
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
