import React, { useState } from 'react';
import { Share2, Calendar, TrendingUp, Users, Heart, MessageCircle, Eye } from 'lucide-react';

interface SocialPost {
    id: string;
    platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin';
    content: string;
    status: 'scheduled' | 'published' | 'draft';
    scheduledDate?: string;
    engagement: {
        likes: number;
        comments: number;
        shares: number;
        views: number;
    };
}

interface SocialMediaAppProps {
    isDarkMode?: boolean;
}

const SocialMediaApp: React.FC<SocialMediaAppProps> = ({ isDarkMode = false }) => {
    const [posts] = useState<SocialPost[]>([
        {
            id: '1',
            platform: 'instagram',
            content: '🌟 New product launch! Check out our latest innovation...',
            status: 'published',
            engagement: { likes: 1250, comments: 89, shares: 234, views: 15600 }
        },
        {
            id: '2',
            platform: 'linkedin',
            content: 'Excited to announce our Q2 results! 📈',
            status: 'scheduled',
            scheduledDate: '2024-06-15 10:00',
            engagement: { likes: 0, comments: 0, shares: 0, views: 0 }
        },
        {
            id: '3',
            platform: 'twitter',
            content: 'Join us for our webinar tomorrow! 🎯',
            status: 'draft',
            engagement: { likes: 0, comments: 0, shares: 0, views: 0 }
        }
    ]);

    const getPlatformColor = (platform: SocialPost['platform']) => {
        switch (platform) {
            case 'facebook': return 'bg-blue-600';
            case 'twitter': return 'bg-sky-500';
            case 'instagram': return 'bg-gradient-to-r from-purple-600 to-pink-600';
            case 'linkedin': return 'bg-blue-700';
        }
    };

    const getPlatformIcon = (platform: SocialPost['platform']) => {
        switch (platform) {
            case 'facebook': return '📘';
            case 'twitter': return '🐦';
            case 'instagram': return '📸';
            case 'linkedin': return '💼';
        }
    };

    return (
        <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 to-pink-50'}`}>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg">
                        <Share2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Social Media Manager
                        </h1>
                        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Schedule and manage posts across all platforms
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <div className="flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-purple-600" />
                        <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Posts</p>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>156</p>
                        </div>
                    </div>
                </div>
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-green-600" />
                        <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Engagement</p>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>8.2K</p>
                        </div>
                    </div>
                </div>
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-600" />
                        <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Followers</p>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>45K</p>
                        </div>
                    </div>
                </div>
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <div className="flex items-center gap-3">
                        <Eye className="w-8 h-8 text-orange-600" />
                        <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Reach</p>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>234K</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts List */}
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Recent Posts
                    </h2>
                    <button
                        type="button"
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
                    >
                        + New Post
                    </button>
                </div>

                <div className="space-y-4">
                    {posts.map((post) => (
                        <div
                            key={post.id}
                            className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className={`p-3 ${getPlatformColor(post.platform)} rounded-lg text-2xl`}>
                                    {getPlatformIcon(post.platform)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                                        </span>
                                        <span className={`px-2 py-1 rounded text-xs ${
                                            post.status === 'published' ? 'bg-green-100 text-green-800' :
                                            post.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {post.status}
                                        </span>
                                    </div>
                                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                        {post.content}
                                    </p>
                                    {post.scheduledDate && (
                                        <p className="text-sm text-blue-600">
                                            📅 Scheduled for {post.scheduledDate}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {post.status === 'published' && (
                                <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Heart className="w-5 h-5 text-red-500" />
                                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {post.engagement.likes}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MessageCircle className="w-5 h-5 text-blue-500" />
                                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {post.engagement.comments}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Share2 className="w-5 h-5 text-green-500" />
                                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {post.engagement.shares}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-5 h-5 text-purple-500" />
                                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {post.engagement.views}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SocialMediaApp;

