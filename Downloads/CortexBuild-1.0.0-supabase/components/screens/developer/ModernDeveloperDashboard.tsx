import React, { useState, useEffect } from 'react';
import {
    Code2,
    Terminal,
    GitBranch,
    Package,
    Zap,
    FileCode,
    Database,
    TestTube,
    Rocket,
    BookOpen,
    Activity,
    Clock
} from 'lucide-react';
import { User, Screen } from '../../../types';
import toast from 'react-hot-toast';

interface ModernDeveloperDashboardProps {
    currentUser: User;
    navigateTo: (screen: Screen, params?: any) => void;
    isDarkMode?: boolean;
}

interface DeveloperStats {
    projectsCount: number;
    commitsToday: number;
    testsRun: number;
    apiCalls: number;
    buildTime: string;
    lastDeploy: string;
}

const ModernDeveloperDashboard: React.FC<ModernDeveloperDashboardProps> = ({
    currentUser,
    navigateTo,
    isDarkMode = false
}) => {
    const [stats, setStats] = useState<DeveloperStats>({
        projectsCount: 3,
        commitsToday: 12,
        testsRun: 156,
        apiCalls: 2847,
        buildTime: '2.3s',
        lastDeploy: '2 hours ago'
    });

    const [activeSection, setActiveSection] = useState<'overview' | 'code' | 'tools'>('overview');

    // Development Tools - Pure Development Functions
    const developmentTools = [
        {
            id: 'automation-studio',
            title: 'Automation Studio',
            description: 'Visual runtime orchestration for Procore automations',
            icon: Activity,
            color: 'cyan',
            action: () => navigateTo('automation-studio')
        },
        {
            id: 'code-editor',
            title: 'Code Editor',
            description: 'Advanced Monaco editor with IntelliSense',
            icon: Code2,
            color: 'blue',
            action: () => navigateTo('sdk-developer', { startTab: 'builder' })
        },
        {
            id: 'terminal',
            title: 'Terminal',
            description: 'Integrated terminal for commands',
            icon: Terminal,
            color: 'green',
            action: () => toast.success('Terminal opening...')
        },
        {
            id: 'git',
            title: 'Git Integration',
            description: 'Version control and collaboration',
            icon: GitBranch,
            color: 'orange',
            action: () => navigateTo('sdk-developer', { startTab: 'git' })
        },
        {
            id: 'packages',
            title: 'Package Manager',
            description: 'Manage dependencies and libraries',
            icon: Package,
            color: 'purple',
            action: () => toast.info('Package manager coming soon')
        },
        {
            id: 'api-builder',
            title: 'API Builder',
            description: 'Build and test REST APIs',
            icon: Zap,
            color: 'yellow',
            action: () => navigateTo('sdk-developer', { startTab: 'api' })
        },
        {
            id: 'database',
            title: 'Database Tools',
            description: 'Query and manage databases',
            icon: Database,
            color: 'cyan',
            action: () => navigateTo('sdk-developer', { startTab: 'database' })
        },
        {
            id: 'testing',
            title: 'Testing Framework',
            description: 'Unit tests and coverage reports',
            icon: TestTube,
            color: 'pink',
            action: () => navigateTo('sdk-developer', { startTab: 'testing' })
        },
        {
            id: 'docs',
            title: 'Documentation',
            description: 'API docs and guides',
            icon: BookOpen,
            color: 'indigo',
            action: () => toast.info('Documentation opening...')
        }
    ];

    // Quick Actions - Development Focused
    const quickActions = [
        {
            label: 'New Project',
            icon: FileCode,
            action: () => toast.success('Creating new project...')
        },
        {
            label: 'Automation Studio',
            icon: Zap,
            action: () => navigateTo('automation-studio')
        },
        {
            label: 'Run Tests',
            icon: TestTube,
            action: () => toast.success('Running tests...')
        },
        {
            label: 'Deploy',
            icon: Rocket,
            action: () => toast.success('Deploying...')
        },
        {
            label: 'View Logs',
            icon: Activity,
            action: () => toast.info('Opening logs...')
        }
    ];

    const colorClasses = {
        blue: 'bg-blue-500 text-white',
        green: 'bg-green-500 text-white',
        orange: 'bg-orange-500 text-white',
        purple: 'bg-purple-500 text-white',
        yellow: 'bg-yellow-500 text-white',
        cyan: 'bg-cyan-500 text-white',
        pink: 'bg-pink-500 text-white',
        indigo: 'bg-indigo-500 text-white'
    };

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Developer Workspace
                            </h1>
                            <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Welcome back, {currentUser.name}
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            {quickActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={action.action}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                                        isDarkMode
                                            ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                                    } transition-colors`}
                                >
                                    <action.icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="mt-6 flex space-x-4 border-b border-gray-200">
                        {[
                            { id: 'overview', label: 'Overview' },
                            { id: 'code', label: 'Code & Build' },
                            { id: 'tools', label: 'Dev Tools' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveSection(tab.id as any)}
                                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                                    activeSection === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeSection === 'overview' && (
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <StatCard
                                title="Active Projects"
                                value={stats.projectsCount}
                                icon={FileCode}
                                color="blue"
                                isDarkMode={isDarkMode}
                            />
                            <StatCard
                                title="Commits Today"
                                value={stats.commitsToday}
                                icon={GitBranch}
                                color="green"
                                isDarkMode={isDarkMode}
                            />
                            <StatCard
                                title="Tests Run"
                                value={stats.testsRun}
                                icon={TestTube}
                                color="purple"
                                isDarkMode={isDarkMode}
                            />
                            <StatCard
                                title="API Calls"
                                value={stats.apiCalls}
                                icon={Zap}
                                color="yellow"
                                isDarkMode={isDarkMode}
                            />
                            <StatCard
                                title="Build Time"
                                value={stats.buildTime}
                                icon={Clock}
                                color="cyan"
                                isDarkMode={isDarkMode}
                            />
                            <StatCard
                                title="Last Deploy"
                                value={stats.lastDeploy}
                                icon={Rocket}
                                color="pink"
                                isDarkMode={isDarkMode}
                            />
                        </div>

                        {/* Recent Activity */}
                        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Recent Activity
                            </h2>
                            <div className="space-y-3">
                                {[
                                    { action: 'Pushed to main branch', time: '5 minutes ago', icon: GitBranch },
                                    { action: 'Tests passed successfully', time: '15 minutes ago', icon: TestTube },
                                    { action: 'Deployed to production', time: '2 hours ago', icon: Rocket },
                                    { action: 'Updated dependencies', time: '3 hours ago', icon: Package }
                                ].map((activity, index) => (
                                    <div key={index} className="flex items-center space-x-3">
                                        <activity.icon className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                        <div className="flex-1">
                                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                                {activity.action}
                                            </p>
                                            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                {activity.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {(activeSection === 'code' || activeSection === 'tools') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {developmentTools.map((tool) => (
                            <button
                                key={tool.id}
                                onClick={tool.action}
                                className={`${
                                    isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                                } rounded-lg shadow p-6 text-left transition-all hover:shadow-lg`}
                            >
                                <div className={`w-12 h-12 rounded-lg ${colorClasses[tool.color as keyof typeof colorClasses]} flex items-center justify-center mb-4`}>
                                    <tool.icon className="w-6 h-6" />
                                </div>
                                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {tool.title}
                                </h3>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {tool.description}
                                </p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    isDarkMode: boolean;
}> = ({ title, value, icon: Icon, color, isDarkMode }) => {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        cyan: 'bg-cyan-100 text-cyan-600',
        pink: 'bg-pink-100 text-pink-600'
    };

    return (
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {title}
                    </p>
                    <p className={`text-2xl font-bold mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {value}
                    </p>
                </div>
                <div className={`w-12 h-12 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
};

export default ModernDeveloperDashboard;

