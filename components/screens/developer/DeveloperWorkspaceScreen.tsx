import React, { useMemo, useState } from 'react';
import { Screen, User } from '../../../types';
import { EnhancedDashboard } from '../../dashboard/EnhancedDashboard';
import DeveloperDashboardScreen from './DeveloperDashboardScreen';
import { ProductionSDKDeveloperView } from '../../sdk/ProductionSDKDeveloperView';

type DeveloperView = 'control-center' | 'sdk-studio' | 'insights';

const VIEW_LABELS: Record<DeveloperView, string> = {
    'control-center': 'Control Center',
    'sdk-studio': 'SDK Studio',
    'insights': 'AI Insights'
};

const VIEW_DESCRIPTIONS: Record<DeveloperView, string> = {
    'control-center': 'Full developer control center with sandbox, builder, and tenant tools.',
    'sdk-studio': 'Deep-dive into SDK apps, workflows, agents, and marketplace publishing.',
    'insights': 'High-level analytics with live metrics and health status for the developer tenant.'
};

interface DeveloperWorkspaceScreenProps {
    currentUser: User;
    navigateTo: (screen: Screen, params?: any) => void;
}

const DeveloperWorkspaceScreen: React.FC<DeveloperWorkspaceScreenProps> = ({ currentUser, navigateTo }) => {
    const [activeView, setActiveView] = useState<DeveloperView>('control-center');

    const viewContent = useMemo(() => {
        switch (activeView) {
            case 'sdk-studio':
                return (
                    <div className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden">
                        <ProductionSDKDeveloperView
                            user={currentUser}
                            onNavigate={() => { /* SDK view handles its own navigation internally */ }}
                            startTab="builder"
                        />
                    </div>
                );
            case 'insights':
                return (
                    <div className="space-y-4">
                        <EnhancedDashboard />
                    </div>
                );
            case 'control-center':
            default:
                return (
                    <DeveloperDashboardScreen
                        currentUser={currentUser}
                        navigateTo={navigateTo}
                    />
                );
        }
    }, [activeView, currentUser, navigateTo]);

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Developer Workspace</h1>
                    <p className="text-sm text-slate-600">
                        {VIEW_DESCRIPTIONS[activeView]}
                    </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                    {(Object.keys(VIEW_LABELS) as DeveloperView[]).map((view) => (
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
                            {VIEW_LABELS[view]}
                        </button>
                    ))}
                </div>
            </header>
            <section>{viewContent}</section>
        </div>
    );
};

export default DeveloperWorkspaceScreen;
