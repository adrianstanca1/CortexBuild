import React from 'react';
import { User, Screen, PermissionAction, PermissionSubject } from '../../types.ts';
import PlatformAdminScreen from './admin/PlatformAdminScreen.tsx';
import CompanyAdminDashboard from './dashboards/CompanyAdminDashboard.tsx';
import CompanyAdminDashboardNew from './dashboards/CompanyAdminDashboardNew.tsx';
import SupervisorDashboard from './dashboards/SupervisorDashboard.tsx';
import OperativeDashboard from './dashboards/OperativeDashboard.tsx';
import { EnhancedDashboard } from '../../components/dashboard/EnhancedDashboard.tsx';


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
            // Super admins can toggle between enhanced dashboard and platform admin
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
                        <EnhancedDashboard />
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
                            Switch to Enhanced Dashboard
                        </button>
                    </div>
                    <PlatformAdminScreen {...props} />
                </div>
            );

        case 'company_admin':
        case 'Project Manager':
        case 'Accounting Clerk':
            // These roles get the enhanced dashboard with company-wide view
            return <EnhancedDashboard />;

        case 'Foreman':
        case 'Safety Officer':
            // These roles get a supervisor-level view focused on tasks and teams
            return <SupervisorDashboard {...props} />;

        case 'operative':
            // This role gets a view focused on their individual daily work
            return <OperativeDashboard {...props} />;

        default:
            // Fallback for any other roles, providing enhanced dashboard
            return <EnhancedDashboard />;
    }
};

export default UnifiedDashboardScreen;