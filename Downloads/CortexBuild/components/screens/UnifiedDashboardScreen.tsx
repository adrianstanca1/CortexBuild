import React from 'react';
import { User, Screen, PermissionAction, PermissionSubject } from '../../types';
import PlatformAdminScreen from './admin/PlatformAdminScreen';
import SuperAdminDashboardScreen from './admin/SuperAdminDashboardScreen';
import CompanyAdminDashboard from './dashboards/CompanyAdminDashboard';
import CompanyAdminDashboardNew from './dashboards/CompanyAdminDashboardNew';
import SupervisorDashboard from './dashboards/SupervisorDashboard';
import OperativeDashboard from './dashboards/OperativeDashboard';
import { EnhancedDashboard } from '../../components/dashboard/EnhancedDashboard';
import DeveloperWorkspaceScreen from './developer/DeveloperWorkspaceScreen';
import CompanyAdminDashboardScreen from './company/CompanyAdminDashboardScreen';


interface UnifiedDashboardScreenProps {
    currentUser: User;
    navigateTo: (screen: Screen, params?: any) => void;
    onDeepLink: (projectId: string, screen: Screen, params: any) => void;
    onQuickAction: (action: Screen, projectId?: string) => void;
    onSuggestAction: () => void;
    selectProject: (id: string) => void;
    can: (action: PermissionAction, subject: PermissionSubject) => boolean;
    goBack: () => void;
}

const UnifiedDashboardScreen: React.FC<UnifiedDashboardScreenProps> = (props) => {
    const { currentUser } = props;
    const [showEnhancedDashboard, setShowEnhancedDashboard] = React.useState(true);

    // Route to the correct dashboard based on the user's role
    switch (currentUser.role) {
        case 'super_admin':
            if (showEnhancedDashboard) {
                return (
                    <div>
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
                );
            }
            return (
                <div>
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
            );

        case 'developer':
            return <DeveloperWorkspaceScreen currentUser={currentUser} navigateTo={props.navigateTo} />;

        case 'company_admin':
            return <CompanyAdminDashboardScreen {...props} />;
        case 'Project Manager':
        case 'Accounting Clerk':
            return <EnhancedDashboard />;

        case 'Foreman':
        case 'Safety Officer':
            return <SupervisorDashboard {...props} />;

        case 'operative':
            return <OperativeDashboard {...props} />;

        default:
            return <EnhancedDashboard />;
    }
};

export default UnifiedDashboardScreen;
