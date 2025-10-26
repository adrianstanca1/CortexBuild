/**
 * Developer Dashboard V2.0 - Revolutionary Design
 * Modern development environment with advanced tools
 */

import React, { useState, useEffect } from 'react';
import {
    Code2, Terminal, GitBranch, Package, Zap, FileCode,
    Database, TestTube, Rocket, BookOpen, Activity, Clock,
    ArrowUpRight, ArrowDownRight, Sparkles, Target, Award,
    ChevronRight, Cpu, LayoutDashboard, Wrench
} from 'lucide-react';
import { User, Screen } from '../../../types';
import toast from 'react-hot-toast';

interface DeveloperDashboardV2Props {
    currentUser: User;
    navigateTo: (screen: Screen, params?: any) => void;
    isDarkMode?: boolean;
}

const DeveloperDashboardV2: React.FC<DeveloperDashboardV2Props> = ({
    currentUser,
    navigateTo,
    isDarkMode = true
}) => {
    const [stats, setStats] = useState({
        projectsCount: 8,
        commitsToday: 24,
        testsRun: 342,
        apiCalls: 5847,
        buildTime: '1.8s',
        lastDeploy: '1 hour ago',
        codeQuality: 96.5
    });

    const [activeTab, setActiveTab] = useState<'overview' | 'code' | 'tools'>('overview');
    const [isAnimating, setIsAnimating] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsAnimating(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    // Quick Stats
    const quickStats = [
        {
            title: 'Active Projects',
            value: stats.projectsCount.toString(),
            change: '+2 this week',
            trend: 'up',
            icon: Rocket,
            color: 'blue',
            bgGradient: 'from-blue-500 to-blue-600'
        },
        {
            title: 'Commits Today',
            value: stats.commitsToday.toString(),
            change: '+8 from yesterday',
            trend: 'up',
            icon: GitBranch,
            color: 'green',
            bgGradient: 'from-green-500 to-green-600'
        },
        {
            title: 'Tests Passed',
            value: stats.testsRun.toString(),
            change: '100% pass rate',
            trend: 'up',
            icon: TestTube,
            color: 'purple',
            bgGradient: 'from-purple-500 to-purple-600'
        },
        {
            title: 'Code Quality',
            value: `${stats.codeQuality}%`,
            change: '+1.2%',
            trend: 'up',
            icon: Award,
            color: 'cyan',
            bgGradient: 'from-cyan-500 to-cyan-600'
        }
    ];

    // Development Tools
    const developmentTools = [
        { id: 'code-editor', title: 'Code Editor', icon: Code2, color: 'blue', description: 'Monaco editor with IntelliSense', action: () => navigateTo('sdk-developer', { startTab: 'builder' }) },
        { id: 'terminal', title: 'Terminal', icon: Terminal, color: 'green', description: 'Integrated terminal', action: () => toast.info('Terminal opening...') },
        { id: 'git', title: 'Git Integration', icon: GitBranch, color: 'orange', description: 'Version control', action: () => toast.info('Git tools opening...') },
        { id: 'package-manager', title: 'Package Manager', icon: Package, color: 'purple', description: 'Dependency management', action: () => toast.info('Package manager opening...') },
        { id: 'marketplace', title: 'App Marketplace', icon: Package, color: 'purple', description: 'Browse & publish apps', action: () => navigateTo('marketplace') },
        { id: 'api-builder', title: 'API Builder', icon: Zap, color: 'yellow', description: 'REST API testing', action: () => toast.info('API builder opening...') },
        { id: 'database-tools', title: 'Database Tools', icon: Database, color: 'cyan', description: 'Query & manage data', action: () => toast.info('Database tools opening...') },
        { id: 'testing', title: 'Testing Framework', icon: TestTube, color: 'pink', description: 'Unit & integration tests', action: () => toast.info('Testing framework opening...') },
        { id: 'docs', title: 'Documentation', icon: BookOpen, color: 'indigo', description: 'API documentation', action: () => toast.info('Documentation opening...') }
    ];

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; text: string; border: string; hover: string }> = {
            blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', hover: 'hover:bg-blue-500/20' },
            purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', hover: 'hover:bg-purple-500/20' },
            green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', hover: 'hover:bg-green-500/20' },
            orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', hover: 'hover:bg-orange-500/20' },
            red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', hover: 'hover:bg-red-500/20' },
            cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', hover: 'hover:bg-cyan-500/20' },
            pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20', hover: 'hover:bg-pink-500/20' },
            yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', hover: 'hover:bg-yellow-500/20' },
            indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', hover: 'hover:bg-indigo-500/20' }
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <Code2 className="w-8 h-8 text-white" />
                                <h1 className="text-3xl font-bold text-white">Developer Dashboard</h1>
                            </div>
                            <p className="text-green-100">Complete development environment & tools</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={() => toast.success('Refreshing stats...')}
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all backdrop-blur-sm"
                            >
                                <Activity className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => toast.info('Deploying...')}
                                className="px-6 py-2 bg-white text-green-600 hover:bg-green-50 rounded-lg transition-all font-medium flex items-center space-x-2"
                            >
                                <Rocket className="w-5 h-5" />
                                <span>Deploy</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {quickStats.map((stat, index) => {
                        const Icon = stat.icon;
                        const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;

                        return (
                            <div
                                key={stat.title}
                                className={`relative overflow-hidden rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.bgGradient} opacity-10 rounded-full -mr-16 -mt-16`} />

                                <div className="relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgGradient}`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                            <TrendIcon className="w-4 h-4" />
                                            <span className="text-xs font-medium">{stat.change}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{stat.title}</p>
                                        <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Navigation Tabs */}
                <div className="flex space-x-2 mb-8 p-1 bg-gray-800 rounded-xl">
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                        { id: 'code', label: 'Code & Build', icon: Code2 },
                        { id: 'tools', label: 'Dev Tools', icon: Wrench }
                    ].map((tab) => {
                        const TabIcon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${activeTab === tab.id
                                        ? 'bg-green-600 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                    }`}
                            >
                                <TabIcon className="w-5 h-5" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Development Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {developmentTools.map((tool, index) => {
                        const Icon = tool.icon;
                        const colors = getColorClasses(tool.color);

                        return (
                            <button
                                key={tool.id}
                                type="button"
                                onClick={tool.action}
                                className={`group relative overflow-hidden rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl ${colors.hover} ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
                                style={{ transitionDelay: `${(index + 4) * 50}ms` }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${colors.bg} border ${colors.border}`}>
                                        <Icon className={`w-6 h-6 ${colors.text}`} />
                                    </div>
                                </div>

                                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {tool.title}
                                </h3>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                                    {tool.description}
                                </p>

                                <div className="flex items-center justify-between">
                                    <span className={`text-sm font-medium ${colors.text}`}>Launch</span>
                                    <ChevronRight className={`w-5 h-5 ${colors.text} transform group-hover:translate-x-1 transition-transform`} />
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Recent Activity */}
                <div className={`mt-8 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6`}>
                    <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Recent Activity
                    </h2>
                    <div className="space-y-3">
                        {[
                            { action: 'Deployed to production', time: '1 hour ago', icon: Rocket, color: 'green' },
                            { action: 'Pushed 5 commits', time: '2 hours ago', icon: GitBranch, color: 'blue' },
                            { action: 'Tests passed (342/342)', time: '3 hours ago', icon: TestTube, color: 'purple' },
                            { action: 'API endpoint created', time: '5 hours ago', icon: Zap, color: 'yellow' }
                        ].map((activity, idx) => {
                            const ActivityIcon = activity.icon;
                            const colors = getColorClasses(activity.color);
                            return (
                                <div key={idx} className={`flex items-center space-x-4 p-3 rounded-lg ${colors.bg} ${colors.hover} transition-colors`}>
                                    <div className={`p-2 rounded-lg ${colors.bg} border ${colors.border}`}>
                                        <ActivityIcon className={`w-5 h-5 ${colors.text}`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{activity.action}</p>
                                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{activity.time}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeveloperDashboardV2;

