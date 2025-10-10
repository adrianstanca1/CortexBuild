/**
 * App Sharing & Reviews - Share apps and manage reviews/ratings
 */

import React, { useState } from 'react';
import {
    Share2,
    Lock,
    Globe,
    Users,
    Star,
    MessageSquare,
    ThumbsUp,
    Flag,
    Copy,
    Check
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AppSharingReviewsProps {
    isDarkMode?: boolean;
}

interface SharedApp {
    id: string;
    name: string;
    description: string;
    visibility: 'public' | 'private' | 'team';
    shareLink: string;
    downloads: number;
    rating: number;
    reviews: Review[];
}

interface Review {
    id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    date: Date;
    helpful: number;
}

const AppSharingReviews: React.FC<AppSharingReviewsProps> = ({ isDarkMode = true }) => {
    const [apps, setApps] = useState<SharedApp[]>([
        {
            id: '1',
            name: 'Daily Site Inspector',
            description: 'Photo documentation and site inspection tool',
            visibility: 'public',
            shareLink: 'https://cortexbuild.com/apps/daily-site-inspector',
            downloads: 856,
            rating: 4.9,
            reviews: [
                {
                    id: '1',
                    userId: '1',
                    userName: 'John Doe',
                    rating: 5,
                    comment: 'Excellent app! Makes site inspections so much easier.',
                    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                    helpful: 12
                },
                {
                    id: '2',
                    userId: '2',
                    userName: 'Jane Smith',
                    rating: 4,
                    comment: 'Great features, but could use better photo organization.',
                    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                    helpful: 8
                }
            ]
        },
        {
            id: '2',
            name: 'Smart Procurement Assistant',
            description: 'Material inventory and vendor management',
            visibility: 'team',
            shareLink: 'https://cortexbuild.com/apps/smart-procurement',
            downloads: 645,
            rating: 4.7,
            reviews: [
                {
                    id: '3',
                    userId: '3',
                    userName: 'Bob Johnson',
                    rating: 5,
                    comment: 'Saves us hours every week on procurement tasks!',
                    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                    helpful: 15
                }
            ]
        }
    ]);

    const [selectedApp, setSelectedApp] = useState<SharedApp | null>(apps[0]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [copiedLink, setCopiedLink] = useState(false);

    const changeVisibility = (appId: string, visibility: 'public' | 'private' | 'team') => {
        setApps(apps.map(app =>
            app.id === appId ? { ...app, visibility } : app
        ));
        toast.success(`App visibility changed to ${visibility}`);
    };

    const copyShareLink = (link: string) => {
        navigator.clipboard.writeText(link);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
        toast.success('Share link copied to clipboard');
    };

    const submitReview = () => {
        if (!selectedApp || !newReview.comment.trim()) {
            toast.error('Please enter a review comment');
            return;
        }

        const review: Review = {
            id: Date.now().toString(),
            userId: 'current-user',
            userName: 'Current User',
            rating: newReview.rating,
            comment: newReview.comment,
            date: new Date(),
            helpful: 0
        };

        setApps(apps.map(app =>
            app.id === selectedApp.id
                ? {
                    ...app,
                    reviews: [review, ...app.reviews],
                    rating: ((app.rating * app.reviews.length) + newReview.rating) / (app.reviews.length + 1)
                }
                : app
        ));

        setNewReview({ rating: 5, comment: '' });
        toast.success('Review submitted successfully!');
    };

    const markHelpful = (appId: string, reviewId: string) => {
        setApps(apps.map(app =>
            app.id === appId
                ? {
                    ...app,
                    reviews: app.reviews.map(r =>
                        r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r
                    )
                }
                : app
        ));
        toast.success('Marked as helpful');
    };

    const getVisibilityIcon = (visibility: string) => {
        switch (visibility) {
            case 'public': return <Globe className="h-4 w-4" />;
            case 'private': return <Lock className="h-4 w-4" />;
            case 'team': return <Users className="h-4 w-4" />;
            default: return <Globe className="h-4 w-4" />;
        }
    };

    const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                    <Star
                        key={star}
                        className={`${size === 'sm' ? 'h-4 w-4' : 'h-6 w-6'} ${
                            star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'
                        }`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className={`h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-8 overflow-y-auto`}>
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className={`text-4xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        🔗 App Sharing & Reviews
                    </h1>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Share apps and manage reviews
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Apps List */}
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Your Apps
                        </h2>
                        <div className="space-y-3">
                            {apps.map(app => (
                                <div
                                    key={app.id}
                                    onClick={() => setSelectedApp(app)}
                                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                                        selectedApp?.id === app.id
                                            ? 'bg-purple-500/20 border-2 border-purple-500'
                                            : isDarkMode ? 'bg-gray-700 border border-gray-600 hover:border-gray-500' : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {app.name}
                                        </h3>
                                        <div className={`px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-semibold ${
                                            app.visibility === 'public' ? 'bg-green-500/20 text-green-500' :
                                            app.visibility === 'team' ? 'bg-blue-500/20 text-blue-500' :
                                            'bg-gray-500/20 text-gray-500'
                                        }`}>
                                            {getVisibilityIcon(app.visibility)}
                                            {app.visibility}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        {renderStars(app.rating)}
                                        <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {app.rating.toFixed(1)}
                                        </span>
                                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            ({app.reviews.length} reviews)
                                        </span>
                                    </div>
                                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {app.downloads} downloads
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* App Details & Reviews */}
                    {selectedApp && (
                        <div className="lg:col-span-2 space-y-6">
                            {/* Sharing Settings */}
                            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Sharing Settings
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            Visibility
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {(['public', 'team', 'private'] as const).map(vis => (
                                                <button
                                                    key={vis}
                                                    type="button"
                                                    onClick={() => changeVisibility(selectedApp.id, vis)}
                                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                                                        selectedApp.visibility === vis
                                                            ? 'bg-purple-500/20 text-purple-500 border-2 border-purple-500'
                                                            : isDarkMode ? 'bg-gray-700 text-gray-400 border border-gray-600' : 'bg-gray-100 text-gray-600 border border-gray-300'
                                                    }`}
                                                >
                                                    {getVisibilityIcon(vis)}
                                                    {vis.charAt(0).toUpperCase() + vis.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            Share Link
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={selectedApp.shareLink}
                                                readOnly
                                                className={`flex-1 px-4 py-3 rounded-xl border ${
                                                    isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-900 border-gray-300'
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => copyShareLink(selectedApp.shareLink)}
                                                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold flex items-center gap-2"
                                            >
                                                {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                {copiedLink ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Reviews */}
                            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Reviews ({selectedApp.reviews.length})
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        {renderStars(selectedApp.rating, 'lg')}
                                        <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {selectedApp.rating.toFixed(1)}
                                        </span>
                                    </div>
                                </div>

                                {/* Write Review */}
                                <div className={`p-4 rounded-xl mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Write a Review
                                    </h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className={`block text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Rating
                                            </label>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setNewReview({ ...newReview, rating: star })}
                                                    >
                                                        <Star
                                                            className={`h-8 w-8 cursor-pointer transition-all ${
                                                                star <= newReview.rating
                                                                    ? 'text-yellow-500 fill-yellow-500'
                                                                    : 'text-gray-400 hover:text-yellow-400'
                                                            }`}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <textarea
                                            value={newReview.comment}
                                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                            placeholder="Share your experience..."
                                            rows={3}
                                            className={`w-full px-4 py-3 rounded-xl border resize-none ${
                                                isDarkMode ? 'bg-gray-600 text-white border-gray-500' : 'bg-white text-gray-900 border-gray-300'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={submitReview}
                                            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold"
                                        >
                                            Submit Review
                                        </button>
                                    </div>
                                </div>

                                {/* Reviews List */}
                                <div className="space-y-4">
                                    {selectedApp.reviews.map(review => (
                                        <div
                                            key={review.id}
                                            className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                        {review.userName}
                                                    </div>
                                                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        {review.date.toLocaleDateString()}
                                                    </div>
                                                </div>
                                                {renderStars(review.rating)}
                                            </div>
                                            <p className={`mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {review.comment}
                                            </p>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => markHelpful(selectedApp.id, review.id)}
                                                    className={`flex items-center gap-1 text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                                                >
                                                    <ThumbsUp className="h-4 w-4" />
                                                    Helpful ({review.helpful})
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`flex items-center gap-1 text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                                                >
                                                    <Flag className="h-4 w-4" />
                                                    Report
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppSharingReviews;

