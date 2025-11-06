import React, { useState } from 'react';
import {
    TrendingUp,
    Mail,
    Share2,
    Target,
    BarChart3,
    Users,
    MessageSquare,
    Calendar,
    DollarSign,
    Globe,
    Search,
    Megaphone,
    FileText,
    Video,
    Zap
} from 'lucide-react';

interface MarketingApp {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    gradient: string;
    stats?: {
        label: string;
        value: string;
    }[];
}

interface MarketingDashboardProps {
    isDarkMode?: boolean;
}

const MarketingDashboard: React.FC<MarketingDashboardProps> = ({ isDarkMode = false }) => {
    const [selectedApp, setSelectedApp] = useState<string | null>(null);

    const marketingApps: MarketingApp[] = [
        {
            id: 'email-campaigns',
            name: 'Email Campaigns',
            description: 'Create and manage email marketing campaigns with automation',
            icon: <Mail className="w-6 h-6" />,
            color: 'blue',
            gradient: 'from-blue-600 to-cyan-600',
            stats: [
                { label: 'Campaigns', value: '24' },
                { label: 'Open Rate', value: '42%' },
                { label: 'Subscribers', value: '12.5K' }
            ]
        },
        {
            id: 'social-media',
            name: 'Social Media Manager',
            description: 'Schedule and manage posts across all social platforms',
            icon: <Share2 className="w-6 h-6" />,
            color: 'purple',
            gradient: 'from-purple-600 to-pink-600',
            stats: [
                { label: 'Posts', value: '156' },
                { label: 'Engagement', value: '8.2K' },
                { label: 'Followers', value: '45K' }
            ]
        },
        {
            id: 'seo-optimizer',
            name: 'SEO Optimizer',
            description: 'Optimize content for search engines and track rankings',
            icon: <Search className="w-6 h-6" />,
            color: 'green',
            gradient: 'from-green-600 to-emerald-600',
            stats: [
                { label: 'Keywords', value: '89' },
                { label: 'Avg Position', value: '#12' },
                { label: 'Traffic', value: '+34%' }
            ]
        },
        {
            id: 'content-calendar',
            name: 'Content Calendar',
            description: 'Plan and schedule content across all marketing channels',
            icon: <Calendar className="w-6 h-6" />,
            color: 'orange',
            gradient: 'from-orange-600 to-red-600',
            stats: [
                { label: 'Scheduled', value: '47' },
                { label: 'Published', value: '128' },
                { label: 'Drafts', value: '23' }
            ]
        },
        {
            id: 'analytics',
            name: 'Marketing Analytics',
            description: 'Track and analyze marketing performance metrics',
            icon: <BarChart3 className="w-6 h-6" />,
            color: 'indigo',
            gradient: 'from-indigo-600 to-blue-600',
            stats: [
                { label: 'ROI', value: '245%' },
                { label: 'Conversions', value: '1.2K' },
                { label: 'Revenue', value: '$89K' }
            ]
        },
        {
            id: 'lead-generation',
            name: 'Lead Generation',
            description: 'Capture and nurture leads with smart forms and landing pages',
            icon: <Target className="w-6 h-6" />,
            color: 'teal',
            gradient: 'from-teal-600 to-cyan-600',
            stats: [
                { label: 'Leads', value: '892' },
                { label: 'Qualified', value: '234' },
                { label: 'Conversion', value: '26%' }
            ]
        },
        {
            id: 'crm-integration',
            name: 'CRM Integration',
            description: 'Sync marketing data with your CRM system',
            icon: <Users className="w-6 h-6" />,
            color: 'rose',
            gradient: 'from-rose-600 to-pink-600',
            stats: [
                { label: 'Contacts', value: '5.6K' },
                { label: 'Synced', value: '100%' },
                { label: 'Active', value: '3.2K' }
            ]
        },
        {
            id: 'chatbot',
            name: 'Marketing Chatbot',
            description: 'Engage visitors with AI-powered chatbot conversations',
            icon: <MessageSquare className="w-6 h-6" />,
            color: 'violet',
            gradient: 'from-violet-600 to-purple-600',
            stats: [
                { label: 'Conversations', value: '1.8K' },
                { label: 'Response Rate', value: '94%' },
                { label: 'Satisfaction', value: '4.8/5' }
            ]
        },
        {
            id: 'ad-manager',
            name: 'Ad Campaign Manager',
            description: 'Create and optimize paid advertising campaigns',
            icon: <Megaphone className="w-6 h-6" />,
            color: 'amber',
            gradient: 'from-amber-600 to-orange-600',
            stats: [
                { label: 'Campaigns', value: '12' },
                { label: 'Spend', value: '$24K' },
                { label: 'ROAS', value: '3.2x' }
            ]
        },
        {
            id: 'landing-pages',
            name: 'Landing Page Builder',
            description: 'Build high-converting landing pages without code',
            icon: <Globe className="w-6 h-6" />,
            color: 'sky',
            gradient: 'from-sky-600 to-blue-600',
            stats: [
                { label: 'Pages', value: '34' },
                { label: 'Visitors', value: '45K' },
                { label: 'Conv Rate', value: '12%' }
            ]
        },
        {
            id: 'email-automation',
            name: 'Email Automation',
            description: 'Set up automated email sequences and workflows',
            icon: <Zap className="w-6 h-6" />,
            color: 'yellow',
            gradient: 'from-yellow-600 to-amber-600',
            stats: [
                { label: 'Workflows', value: '18' },
                { label: 'Emails Sent', value: '89K' },
                { label: 'Automation Rate', value: '76%' }
            ]
        },
        {
            id: 'influencer',
            name: 'Influencer Marketing',
            description: 'Find and collaborate with influencers for campaigns',
            icon: <TrendingUp className="w-6 h-6" />,
            color: 'fuchsia',
            gradient: 'from-fuchsia-600 to-pink-600',
            stats: [
                { label: 'Influencers', value: '45' },
                { label: 'Campaigns', value: '8' },
                { label: 'Reach', value: '2.1M' }
            ]
        },
        {
            id: 'video-marketing',
            name: 'Video Marketing',
            description: 'Create, edit, and distribute video content',
            icon: <Video className="w-6 h-6" />,
            color: 'red',
            gradient: 'from-red-600 to-rose-600',
            stats: [
                { label: 'Videos', value: '67' },
                { label: 'Views', value: '234K' },
                { label: 'Engagement', value: '18%' }
            ]
        },
        {
            id: 'content-library',
            name: 'Content Library',
            description: 'Organize and manage all marketing content assets',
            icon: <FileText className="w-6 h-6" />,
            color: 'slate',
            gradient: 'from-slate-600 to-gray-600',
            stats: [
                { label: 'Assets', value: '1.2K' },
                { label: 'Categories', value: '24' },
                { label: 'Downloads', value: '5.6K' }
            ]
        },
        {
            id: 'budget-tracker',
            name: 'Marketing Budget',
            description: 'Track and optimize marketing spend across channels',
            icon: <DollarSign className="w-6 h-6" />,
            color: 'emerald',
            gradient: 'from-emerald-600 to-green-600',
            stats: [
                { label: 'Budget', value: '$150K' },
                { label: 'Spent', value: '$89K' },
                { label: 'ROI', value: '245%' }
            ]
        }
    ];

    return (
        <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
            {/* Header */}
            <div className="mb-8">
                <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    📣 Marketing Dashboard
                </h1>
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Complete marketing suite with 15 powerful applications
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl">
                            <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Apps</p>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>15</p>
                        </div>
                    </div>
                </div>
                <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Campaigns</p>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>42</p>
                        </div>
                    </div>
                </div>
                <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Reach</p>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>2.5M</p>
                        </div>
                    </div>
                </div>
                <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Marketing ROI</p>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>245%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Marketing Apps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {marketingApps.map((app, index) => (
                    <div
                        key={app.id}
                        className={`p-6 rounded-2xl ${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:shadow-xl'} shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105`}
                        onClick={() => setSelectedApp(app.id)}
                        style={{
                            animation: `fadeIn 0.5s ease-in-out ${index * 0.05}s forwards`,
                            opacity: 0
                        }}
                    >
                        {/* App Header */}
                        <div className="flex items-start gap-4 mb-4">
                            <div className={`p-4 bg-gradient-to-br ${app.gradient} rounded-xl shadow-lg`}>
                                {app.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {app.name}
                                </h3>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {app.description}
                                </p>
                            </div>
                        </div>

                        {/* App Stats */}
                        {app.stats && (
                            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                {app.stats.map((stat) => (
                                    <div key={stat.label} className="text-center">
                                        <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {stat.value}
                                        </p>
                                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {stat.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default MarketingDashboard;

