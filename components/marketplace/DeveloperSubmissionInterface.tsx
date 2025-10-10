/**
 * Developer Submission Interface
 * View and manage published apps, submit for review
 */

import React, { useState, useEffect } from 'react';
import {
    Send, Clock, CheckCircle, XCircle, Eye, TrendingUp,
    Download, Users, Building2, RefreshCw, Package
} from 'lucide-react';
import toast from 'react-hot-toast';

interface MyApp {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    version: string;
    review_status: string;
    review_feedback?: string;
    install_count: number;
    company_install_count: number;
    created_at: string;
    updated_at: string;
    published_at?: string;
}

interface DeveloperSubmissionInterfaceProps {
    isDarkMode?: boolean;
    currentUser?: any;
}

const DeveloperSubmissionInterface: React.FC<DeveloperSubmissionInterfaceProps> = ({
    isDarkMode = true,
    currentUser
}) => {
    const [myApps, setMyApps] = useState<MyApp[]>([]);
    const [selectedApp, setSelectedApp] = useState<MyApp | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
    const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
    const mutedClass = isDarkMode ? 'text-gray-400' : 'text-gray-600';

    useEffect(() => {
        fetchMyApps();
    }, []);

    const fetchMyApps = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to view your apps');
                return;
            }

            const response = await fetch('http://localhost:3001/api/global-marketplace/my-apps', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.success) {
                setMyApps(data.apps);
            } else {
                toast.error('Failed to load apps');
            }
        } catch (error) {
            console.error('Error fetching my apps:', error);
            toast.error('Failed to load apps');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitForReview = async (appId: string) => {
        try {
            setSubmitting(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:3001/api/global-marketplace/submit-for-review/${appId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.success) {
                toast.success('App submitted for review!');
                fetchMyApps();
            } else {
                toast.error(data.error || 'Failed to submit app');
            }
        } catch (error) {
            console.error('Error submitting app:', error);
            toast.error('Failed to submit app');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            draft: { color: 'bg-gray-500/20 text-gray-400', icon: Package, text: 'Draft' },
            pending_review: { color: 'bg-yellow-500/20 text-yellow-400', icon: Clock, text: 'Pending Review' },
            approved: { color: 'bg-green-500/20 text-green-400', icon: CheckCircle, text: 'Approved' },
            rejected: { color: 'bg-red-500/20 text-red-400', icon: XCircle, text: 'Rejected' }
        };

        const badge = badges[status as keyof typeof badges] || badges.draft;
        const Icon = badge.icon;

        return (
            <span className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 ${badge.color}`}>
                <Icon className="w-4 h-4" />
                <span>{badge.text}</span>
            </span>
        );
    };

    const renderAppCard = (app: MyApp) => {
        const totalInstalls = app.install_count + app.company_install_count;

        return (
            <div
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className={`${cardClass} border rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg ${
                    selectedApp?.id === app.id ? 'ring-2 ring-blue-500' : ''
                }`}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="text-4xl">{app.icon}</div>
                        <div>
                            <h3 className={`font-bold ${textClass}`}>{app.name}</h3>
                            <p className={`text-sm ${mutedClass}`}>v{app.version}</p>
                        </div>
                    </div>
                    {getStatusBadge(app.review_status)}
                </div>

                <p className={`${mutedClass} text-sm mb-4 line-clamp-2`}>{app.description}</p>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                            <Download className="w-4 h-4 text-blue-500" />
                            <span className={mutedClass}>{totalInstalls}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4 text-purple-500" />
                            <span className={mutedClass}>{app.install_count}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Building2 className="w-4 h-4 text-green-500" />
                            <span className={mutedClass}>{app.company_install_count}</span>
                        </div>
                    </div>

                    {app.review_status === 'draft' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSubmitForReview(app.id);
                            }}
                            disabled={submitting}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" />
                            <span>Submit</span>
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={`min-h-screen ${bgClass} p-8`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className={`text-4xl font-bold ${textClass} mb-2`}>
                            📦 My Published Apps
                        </h1>
                        <p className={mutedClass}>
                            Manage your apps and track their performance
                        </p>
                    </div>
                    <button
                        onClick={fetchMyApps}
                        className={`px-4 py-2 ${cardClass} border rounded-lg hover:bg-blue-600 hover:text-white transition-colors flex items-center space-x-2`}
                    >
                        <RefreshCw className="w-5 h-5" />
                        <span>Refresh</span>
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className={`${mutedClass} mt-4`}>Loading your apps...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Apps List */}
                        <div className="lg:col-span-2 space-y-4">
                            {myApps.length === 0 ? (
                                <div className={`${cardClass} border rounded-xl p-12 text-center`}>
                                    <Package className={`w-16 h-16 ${mutedClass} mx-auto mb-4`} />
                                    <p className={`${textClass} text-xl font-semibold mb-2`}>No apps yet</p>
                                    <p className={mutedClass}>Create your first app in the SDK Developer</p>
                                </div>
                            ) : (
                                myApps.map(renderAppCard)
                            )}
                        </div>

                        {/* App Details */}
                        <div className="lg:col-span-1">
                            {selectedApp ? (
                                <div className={`${cardClass} border rounded-xl p-6 sticky top-8`}>
                                    <h2 className={`text-xl font-bold ${textClass} mb-4`}>App Details</h2>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <p className={`text-sm ${mutedClass} mb-1`}>Status</p>
                                            {getStatusBadge(selectedApp.review_status)}
                                        </div>

                                        <div>
                                            <p className={`text-sm ${mutedClass} mb-1`}>Total Installs</p>
                                            <p className={`text-2xl font-bold ${textClass}`}>
                                                {selectedApp.install_count + selectedApp.company_install_count}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className={`text-sm ${mutedClass} mb-1`}>Individual</p>
                                                <div className="flex items-center space-x-2">
                                                    <Users className="w-5 h-5 text-purple-500" />
                                                    <p className={`text-xl font-bold ${textClass}`}>
                                                        {selectedApp.install_count}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className={`text-sm ${mutedClass} mb-1`}>Company</p>
                                                <div className="flex items-center space-x-2">
                                                    <Building2 className="w-5 h-5 text-green-500" />
                                                    <p className={`text-xl font-bold ${textClass}`}>
                                                        {selectedApp.company_install_count}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <p className={`text-sm ${mutedClass} mb-1`}>Category</p>
                                            <p className={textClass}>{selectedApp.category}</p>
                                        </div>

                                        <div>
                                            <p className={`text-sm ${mutedClass} mb-1`}>Created</p>
                                            <p className={textClass}>
                                                {new Date(selectedApp.created_at).toLocaleDateString()}
                                            </p>
                                        </div>

                                        {selectedApp.published_at && (
                                            <div>
                                                <p className={`text-sm ${mutedClass} mb-1`}>Published</p>
                                                <p className={textClass}>
                                                    {new Date(selectedApp.published_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}

                                        {selectedApp.review_feedback && (
                                            <div>
                                                <p className={`text-sm ${mutedClass} mb-1`}>Review Feedback</p>
                                                <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} rounded-lg p-3`}>
                                                    <p className={`text-sm ${textClass}`}>{selectedApp.review_feedback}</p>
                                                </div>
                                            </div>
                                        )}

                                        {selectedApp.review_status === 'draft' && (
                                            <button
                                                onClick={() => handleSubmitForReview(selectedApp.id)}
                                                disabled={submitting}
                                                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                                            >
                                                <Send className="w-5 h-5" />
                                                <span>{submitting ? 'Submitting...' : 'Submit for Review'}</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className={`${cardClass} border rounded-xl p-12 text-center sticky top-8`}>
                                    <Eye className={`w-12 h-12 ${mutedClass} mx-auto mb-4`} />
                                    <p className={mutedClass}>Select an app to view details</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeveloperSubmissionInterface;

