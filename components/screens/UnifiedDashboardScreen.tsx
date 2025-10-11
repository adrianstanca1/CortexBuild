import React from 'react';
import { User, Screen, PermissionAction, PermissionSubject } from '../../types';
import PlatformAdminScreen from './admin/PlatformAdminScreen';
import SuperAdminDashboardScreen from './admin/SuperAdminDashboardScreen';
import CompanyAdminDashboardV2 from './company/CompanyAdminDashboardV2';
import DeveloperWorkspaceScreen from './developer/DeveloperWorkspaceScreen';
import DeveloperDashboardV2 from './developer/DeveloperDashboardV2';


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

// Separate component for super_admin to handle useState properly
const SuperAdminDashboardWrapper: React.FC<UnifiedDashboardScreenProps> = (props) => {
    const [showEnhancedDashboard, setShowEnhancedDashboard] = React.useState(true);

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
};

const UnifiedDashboardScreen: React.FC<UnifiedDashboardScreenProps> = (props) => {
    const { currentUser } = props;

    // Route to the correct dashboard based on the user's role
    if (currentUser.role === 'super_admin') {
        return <SuperAdminDashboardWrapper {...props} />;
    }

    if (currentUser.role === 'developer') {
        return <DeveloperDashboardV2 currentUser={currentUser} navigateTo={props.navigateTo} isDarkMode={true} />;
    }

    // Default for all other roles
    return <CompanyAdminDashboardV2 currentUser={currentUser} navigateTo={props.navigateTo} isDarkMode={true} />;
};

export default UnifiedDashboardScreen;
