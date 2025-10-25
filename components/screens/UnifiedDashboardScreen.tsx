import React from 'react';
import { User, Screen, PermissionAction, PermissionSubject } from '../../types';
import SupervisorDashboard from './dashboards/SupervisorDashboard';
import OperativeDashboard from './dashboards/OperativeDashboard';
import { EnhancedDashboard } from '../../components/dashboard/EnhancedDashboard';
import DeveloperWorkspaceScreen from './developer/DeveloperWorkspaceScreen';
import CompanyAdminDashboardV2 from './company/CompanyAdminDashboardV2';
import UnifiedAdminDashboard from './admin/UnifiedAdminDashboard';


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
            return <UnifiedAdminDashboard currentUser={currentUser} />;

        case 'developer':
            return <DeveloperWorkspaceScreen currentUser={currentUser} navigateTo={props.navigateTo} />;

        case 'company_admin':
            return <CompanyAdminDashboardV2 currentUser={currentUser} navigateTo={props.navigateTo} />;
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
