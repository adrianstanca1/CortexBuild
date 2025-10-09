import React from 'react';
import { User, Screen, PermissionAction, PermissionSubject } from '../../types.ts';
import PlatformAdminScreen from './admin/PlatformAdminScreen.tsx';
import SuperAdminDashboardScreen from './admin/SuperAdminDashboardScreen.tsx';
import CompanyAdminDashboard from './dashboards/CompanyAdminDashboard.tsx';
import CompanyAdminDashboardNew from './dashboards/CompanyAdminDashboardNew.tsx';
import SupervisorDashboard from './dashboards/SupervisorDashboard.tsx';
import OperativeDashboard from './dashboards/OperativeDashboard.tsx';
import { EnhancedDashboard } from '../../components/dashboard/EnhancedDashboard.tsx';
import DeveloperDashboardScreen from './developer/DeveloperDashboardScreen.tsx';


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
            return <DeveloperDashboardScreen currentUser={currentUser} navigateTo={props.navigateTo} />;

        case 'company_admin':
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
