import React, { useState, useMemo } from 'react';
import { User, Screen, PermissionAction, PermissionSubject } from '../../../types';
import { EnhancedDashboard } from '../../dashboard/EnhancedDashboard';
import CompanyAdminDashboard from '../dashboards/CompanyAdminDashboard';
import CompanyAdminDashboardNew from '../dashboards/CompanyAdminDashboardNew';

interface CompanyAdminDashboardScreenProps {
    currentUser: User;
    navigateTo: (screen: Screen, params?: any) => void;
    onDeepLink: (projectId: string, screen: Screen, params: any) => void;
    onQuickAction: (action: Screen, projectId?: string) => void;
    onSuggestAction: () => void;
    selectProject: (id: string) => void;
    can: (action: PermissionAction, subject: PermissionSubject) => boolean;
    goBack: () => void;
}

type DashboardView = 'executive' | 'operations' | 'legacy';

const viewLabels: Record<DashboardView, string> = {
    executive: 'Executive Overview',
    operations: 'Operational Control',
    legacy: 'Legacy Widgets'
};

const CompanyAdminDashboardScreen: React.FC<CompanyAdminDashboardScreenProps> = (props) => {
    const { currentUser } = props;
    const [activeView, setActiveView] = useState<DashboardView>('executive');

    const viewContent = useMemo(() => {
        switch (activeView) {
            case 'operations':
                return <CompanyAdminDashboardNew {...props} />;
            case 'legacy':
                return <CompanyAdminDashboard {...props} />;
            case 'executive':
            default:
                return <EnhancedDashboard />;
        }
    }, [activeView, props]);

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Company Admin Workspace</h1>
                    <p className="text-sm text-slate-600">
                        Welcome back, {currentUser.name.split(' ')[0] || currentUser.email}! Choose the dashboard best suited for today&apos;s priorities.
                    </p>
                </div>
                <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                    {(Object.keys(viewLabels) as DashboardView[]).map((view) => (
                        <button
                            key={view}
                            type="button"
                            onClick={() => setActiveView(view)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                activeView === view
                                    ? 'bg-blue-600 text-white shadow'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            {viewLabels[view]}
                        </button>
                    ))}
                </div>
            </header>
            <section>{viewContent}</section>
        </div>
    );
};

export default CompanyAdminDashboardScreen;
