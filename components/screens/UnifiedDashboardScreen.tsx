import React from 'react';
import { User, Screen, PermissionAction, PermissionSubject } from '../../types.ts';
import PlatformAdminScreen from './admin/PlatformAdminScreen.tsx';
import SuperAdminDashboardScreen from './admin/SuperAdminDashboardScreen.tsx';
import SupervisorDashboard from './dashboards/SupervisorDashboard.tsx';
import OperativeDashboard from './dashboards/OperativeDashboard.tsx';
import { EnhancedDashboard } from '../../components/dashboard/EnhancedDashboard.tsx';
import DeveloperDashboard from './dashboards/DeveloperDashboard.tsx';
import ProjectManagerDashboard from './dashboards/ProjectManagerDashboard.tsx';
import { LogOut } from 'lucide-react';


interface UnifiedDashboardScreenProps {
    currentUser: User;
    navigateTo: (screen: Screen, params?: any) => void;
    onDeepLink: (projectId: string, screen: Screen, params: any) => void;
    onQuickAction: (action: Screen, projectId?: string) => void;
    onSuggestAction: () => void;
    selectProject: (id: string) => void;
    can: (action: PermissionAction, subject: PermissionSubject) => boolean;
    goBack: () => void;
    onLogout?: () => void;
}

const UnifiedDashboardScreen: React.FC<UnifiedDashboardScreenProps> = (props) => {
    const { currentUser, onLogout } = props;
    const [showEnhancedDashboard, setShowEnhancedDashboard] = React.useState(true);

    // Common header component with logout button
    const DashboardHeader = () => (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">CB</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">CortexBuild</h1>
                            <p className="text-xs text-gray-500 capitalize">{currentUser.role.replace('_', ' ')}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                            <p className="text-xs text-gray-500">{currentUser.email}</p>
                        </div>
                        {onLogout && (
                            <button
                                type="button"
                                onClick={onLogout}
                                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
                                title="Logout"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    // Route to the correct dashboard based on the user's role
    switch (currentUser.role) {
        case 'super_admin':
            if (showEnhancedDashboard) {
                return (
                    <div className="min-h-screen bg-gray-50">
                        <DashboardHeader />
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                            <div className="mb-4 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowEnhancedDashboard(false)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Switch to Platform Admin
                                </button>
                            </div>
                            <SuperAdminDashboardScreen />
                        </div>
                    </div>
                );
            }
            return (
                <div className="min-h-screen bg-gray-50">
                    <DashboardHeader />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="mb-4 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowEnhancedDashboard(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Back to Super Admin Dashboard
                            </button>
                        </div>
                        <PlatformAdminScreen {...props} />
                    </div>
                </div>
            );

        case 'developer':
            // Note: Developers are caught in App.tsx and redirected to DeveloperPlatform
            // This fallback should never be reached, but keeping for safety
            return (
                <div className="min-h-screen bg-gray-50">
                    <DashboardHeader />
                    <DeveloperDashboard currentUser={currentUser} navigateTo={props.navigateTo} />
                </div>
            );

        case 'company_admin':
        case 'Accounting Clerk':
            return (
                <div className="min-h-screen bg-gray-50">
                    <DashboardHeader />
                    <EnhancedDashboard />
                </div>
            );

        case 'Project Manager':
            return (
                <div className="min-h-screen bg-gray-50">
                    <DashboardHeader />
                    <ProjectManagerDashboard currentUser={currentUser} navigateTo={props.navigateTo} />
                </div>
            );

        case 'Foreman':
        case 'Safety Officer':
            return (
                <div className="min-h-screen bg-gray-50">
                    <DashboardHeader />
                    <SupervisorDashboard {...props} />
                </div>
            );

        case 'operative':
            return (
                <div className="min-h-screen bg-gray-50">
                    <DashboardHeader />
                    <OperativeDashboard {...props} />
                </div>
            );

        default:
            return (
                <div className="min-h-screen bg-gray-50">
                    <DashboardHeader />
                    <EnhancedDashboard />
                </div>
            );
    }
};

export default UnifiedDashboardScreen;
