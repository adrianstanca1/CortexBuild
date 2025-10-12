import React, { useState } from 'react';
import { Mail, Send, Users, TrendingUp, Calendar, Edit, Trash2, Eye } from 'lucide-react';

interface Campaign {
    id: string;
    name: string;
    subject: string;
    status: 'draft' | 'scheduled' | 'sent';
    recipients: number;
    openRate: number;
    clickRate: number;
    scheduledDate?: string;
}

interface EmailCampaignsAppProps {
    isDarkMode?: boolean;
}

const EmailCampaignsApp: React.FC<EmailCampaignsAppProps> = ({ isDarkMode = false }) => {
    const [campaigns] = useState<Campaign[]>([
        {
            id: '1',
            name: 'Summer Sale 2024',
            subject: '🌞 50% OFF Summer Collection - Limited Time!',
            status: 'sent',
            recipients: 12500,
            openRate: 42.5,
            clickRate: 8.3
        },
        {
            id: '2',
            name: 'New Product Launch',
            subject: '🚀 Introducing Our Revolutionary New Product',
            status: 'scheduled',
            recipients: 15000,
            openRate: 0,
            clickRate: 0,
            scheduledDate: '2024-06-15'
        },
        {
            id: '3',
            name: 'Customer Appreciation',
            subject: '💝 Thank You for Being Amazing!',
            status: 'draft',
            recipients: 8500,
            openRate: 0,
            clickRate: 0
        }
    ]);

    const getStatusColor = (status: Campaign['status']) => {
        switch (status) {
            case 'sent':
                return 'bg-green-100 text-green-800';
            case 'scheduled':
                return 'bg-blue-100 text-blue-800';
            case 'draft':
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-cyan-50'}`}>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-4 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl shadow-lg">
                        <Mail className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Email Campaigns
                        </h1>
                        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Create and manage email marketing campaigns
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <div className="flex items-center gap-3">
                        <Send className="w-8 h-8 text-blue-600" />
                        <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Sent</p>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>24</p>
                        </div>
                    </div>
                </div>
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-green-600" />
                        <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Subscribers</p>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>12.5K</p>
                        </div>
                    </div>
                </div>
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <div className="flex items-center gap-3">
                        <Eye className="w-8 h-8 text-purple-600" />
                        <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Open Rate</p>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>42%</p>
                        </div>
                    </div>
                </div>
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-orange-600" />
                        <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Click Rate</p>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>8.3%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Campaigns List */}
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Recent Campaigns
                    </h2>
                    <button
                        type="button"
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
                    >
                        + New Campaign
                    </button>
                </div>

                <div className="space-y-4">
                    {campaigns.map((campaign) => (
                        <div
                            key={campaign.id}
                            className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} hover:shadow-md transition-all`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {campaign.name}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(campaign.status)}`}>
                                            {campaign.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                                        {campaign.subject}
                                    </p>
                                    {campaign.scheduledDate && (
                                        <div className="flex items-center gap-2 text-sm text-blue-600">
                                            <Calendar className="w-4 h-4" />
                                            Scheduled for {campaign.scheduledDate}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-colors`}
                                        title="Edit"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                        type="button"
                                        className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-colors`}
                                        title="Delete"
                                    >
                                        <Trash2 className="w-5 h-5 text-red-600" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                                <div>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Recipients</p>
                                    <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {campaign.recipients.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Open Rate</p>
                                    <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {campaign.openRate}%
                                    </p>
                                </div>
                                <div>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Click Rate</p>
                                    <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {campaign.clickRate}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EmailCampaignsApp;

