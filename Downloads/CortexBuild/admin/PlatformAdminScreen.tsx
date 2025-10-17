import React, { useState } from 'react';
import { User, Screen } from '../../../types';
import PlatformAdminDashboard from '../dashboards/PlatformAdminDashboard';
import CompaniesManagement from './CompaniesManagement';
import InvitationsManagement from './InvitationsManagement';
import PlansManagement from './PlansManagement';
import AIAgentsManagement from './AIAgentsManagement';
import AuditLogManagement from './AuditLogManagement';

interface PlatformAdminScreenProps {
    currentUser: User;
    navigateTo: (screen: Screen, params?: any) => void;
    goBack: () => void;
}

const PlatformAdminScreen: React.FC<PlatformAdminScreenProps> = ({
    currentUser,
    navigateTo,
    goBack
}) => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'companies' | 'invitations' | 'plans' | 'agents' | 'audit'>('dashboard');

    // Check if user is super admin
    if (currentUser.role !== 'super_admin') {
        return (
            <div className="max-w-4xl mx-auto text-center py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-8">
                    <div className="text-red-600 text-6xl mb-4">🚫</div>
                    <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
                    <p className="text-red-700 mb-4">
                        You need super administrator privileges to access the Platform Administration panel.
                    </p>
                    <button
                        type="button"
                        onClick={goBack}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }



    const tabs = [
        { id: 'dashboard', name: 'Dashboard', icon: '📊' },
        { id: 'companies', name: 'Companies', icon: '🏢' },
        { id: 'invitations', name: 'Invitations', icon: '📧' },
        { id: 'plans', name: 'Plans', icon: '💳' },
        { id: 'agents', name: 'AI Agents', icon: '🤖' },
        { id: 'audit', name: 'Audit Log', icon: '📜' }
    ] as const;



    const renderTabContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <PlatformAdminDashboard currentUser={currentUser} navigateTo={navigateTo} />;
            case 'companies':
                return <CompaniesManagement currentUser={currentUser} />;
            case 'invitations':
                return <InvitationsManagement currentUser={currentUser} />;
            case 'plans':
                return <PlansManagement currentUser={currentUser} />;
            case 'agents':
                return <AIAgentsManagement currentUser={currentUser} />;
            case 'audit':
                return <AuditLogManagement currentUser={currentUser} />;
            default:
                return <PlatformAdminDashboard currentUser={currentUser} navigateTo={navigateTo} />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Platform Administration</h1>
                        <p className="text-gray-600 mt-2">
                            Central control panel for ConstructAI multi-tenant platform
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={goBack}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                    >
                        ← Back to Dashboard
                    </button>
                </div>

                {/* Super Admin Badge */}
                <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2">
                    <span className="text-lg">👑</span>
                    <span className="font-semibold">Super Administrator</span>
                    <span className="text-sm opacity-90">({currentUser.email})</span>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mb-8">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-gray-50 rounded-lg p-6">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default PlatformAdminScreen;
