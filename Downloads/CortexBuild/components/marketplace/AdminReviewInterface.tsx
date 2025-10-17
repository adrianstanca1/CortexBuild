/**
 * Admin Review Interface
 * Review and approve/reject apps submitted by developers
 */

import React, { useState, useEffect } from 'react';
import {
    CheckCircle, XCircle, Clock, Eye, User, Calendar,
    MessageSquare, Send, AlertCircle, Package, Code
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PendingApp {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    version: string;
    code: string;
    developer_id: string;
    developer_name: string;
    developer_email: string;
    review_status: string;
    created_at: string;
    updated_at: string;
}

interface AdminReviewInterfaceProps {
    isDarkMode?: boolean;
    currentUser?: any;
}

const AdminReviewInterface: React.FC<AdminReviewInterfaceProps> = ({
    isDarkMode = true,
    currentUser
}) => {
    const [pendingApps, setPendingApps] = useState<PendingApp[]>([]);
    const [selectedApp, setSelectedApp] = useState<PendingApp | null>(null);
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
    const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
    const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
    const mutedClass = isDarkMode ? 'text-gray-400' : 'text-gray-600';

    useEffect(() => {
        fetchPendingApps();
    }, []);

    const fetchPendingApps = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to review apps');
                return;
            }

            const response = await fetch('http://localhost:3001/api/global-marketplace/pending-review', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.success) {
                setPendingApps(data.apps);
            } else {
                toast.error(data.error || 'Failed to load pending apps');
            }
        } catch (error) {
            console.error('Error fetching pending apps:', error);
            toast.error('Failed to load pending apps');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedApp) return;

        try {
            setSubmitting(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:3001/api/global-marketplace/approve/${selectedApp.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ feedback })
            });

            const data = await response.json();
            
            if (data.success) {
                toast.success('App approved and published!');
                setSelectedApp(null);
                setFeedback('');
                fetchPendingApps();
            } else {
                toast.error(data.error || 'Failed to approve app');
            }
        } catch (error) {
            console.error('Error approving app:', error);
            toast.error('Failed to approve app');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!selectedApp) return;
        if (!feedback.trim()) {
            toast.error('Please provide feedback for rejection');
            return;
        }

        try {
            setSubmitting(true);
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:3001/api/global-marketplace/reject/${selectedApp.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ feedback })
            });

            const data = await response.json();
            
            if (data.success) {
                toast.success('App rejected');
                setSelectedApp(null);
                setFeedback('');
                fetchPendingApps();
            } else {
                toast.error(data.error || 'Failed to reject app');
            }
        } catch (error) {
            console.error('Error rejecting app:', error);
            toast.error('Failed to reject app');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={`min-h-screen ${bgClass} p-8`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className={`text-4xl font-bold ${textClass} mb-2`}>
                        🔍 App Review Center
                    </h1>
                    <p className={mutedClass}>
                        Review and approve apps submitted by developers
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className={`${mutedClass} mt-4`}>Loading pending apps...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Pending Apps List */}
                        <div className="lg:col-span-1 space-y-4">
                            <h2 className={`text-xl font-bold ${textClass} mb-4`}>
                                Pending Review ({pendingApps.length})
                            </h2>
                            {pendingApps.length === 0 ? (
                                <div className={`${cardClass} border rounded-xl p-6 text-center`}>
                                    <CheckCircle className={`w-12 h-12 ${mutedClass} mx-auto mb-2`} />
                                    <p className={mutedClass}>No apps pending review</p>
                                </div>
                            ) : (
                                pendingApps.map(app => (
                                    <div
                                        key={app.id}
                                        onClick={() => setSelectedApp(app)}
                                        className={`${cardClass} border rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg ${
                                            selectedApp?.id === app.id ? 'ring-2 ring-blue-500' : ''
                                        }`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="text-3xl">{app.icon}</div>
                                            <div className="flex-1">
                                                <h3 className={`font-semibold ${textClass}`}>{app.name}</h3>
                                                <p className={`text-sm ${mutedClass} line-clamp-2`}>{app.description}</p>
                                                <div className="flex items-center space-x-2 mt-2">
                                                    <User className="w-3 h-3 text-blue-500" />
                                                    <span className="text-xs text-blue-500">{app.developer_name}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <Clock className="w-3 h-3 text-purple-500" />
                                                    <span className="text-xs text-purple-500">
                                                        {new Date(app.updated_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* App Details & Review */}
                        <div className="lg:col-span-2">
                            {selectedApp ? (
                                <div className={`${cardClass} border rounded-xl p-6`}>
                                    {/* App Header */}
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="text-6xl">{selectedApp.icon}</div>
                                            <div>
                                                <h2 className={`text-2xl font-bold ${textClass}`}>{selectedApp.name}</h2>
                                                <p className={`${mutedClass}`}>v{selectedApp.version}</p>
                                                <div className="flex items-center space-x-2 mt-2">
                                                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                                                        {selectedApp.category}
                                                    </span>
                                                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm flex items-center space-x-1">
                                                        <Clock className="w-3 h-3" />
                                                        <span>Pending Review</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* App Description */}
                                    <div className="mb-6">
                                        <h3 className={`text-lg font-semibold ${textClass} mb-2`}>Description</h3>
                                        <p className={mutedClass}>{selectedApp.description}</p>
                                    </div>

                                    {/* Developer Info */}
                                    <div className="mb-6">
                                        <h3 className={`text-lg font-semibold ${textClass} mb-2`}>Developer</h3>
                                        <div className="flex items-center space-x-2">
                                            <User className="w-5 h-5 text-blue-500" />
                                            <span className={textClass}>{selectedApp.developer_name}</span>
                                            <span className={mutedClass}>({selectedApp.developer_email})</span>
                                        </div>
                                    </div>

                                    {/* Code Preview */}
                                    <div className="mb-6">
                                        <h3 className={`text-lg font-semibold ${textClass} mb-2 flex items-center space-x-2`}>
                                            <Code className="w-5 h-5" />
                                            <span>Code Preview</span>
                                        </h3>
                                        <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} rounded-lg p-4 overflow-x-auto`}>
                                            <pre className={`text-sm ${textClass}`}>
                                                <code>{selectedApp.code || '// No code provided'}</code>
                                            </pre>
                                        </div>
                                    </div>

                                    {/* Feedback */}
                                    <div className="mb-6">
                                        <h3 className={`text-lg font-semibold ${textClass} mb-2`}>Review Feedback</h3>
                                        <textarea
                                            value={feedback}
                                            onChange={(e) => setFeedback(e.target.value)}
                                            placeholder="Provide feedback for the developer (optional for approval, required for rejection)..."
                                            rows={4}
                                            className={`w-full px-4 py-3 ${cardClass} border rounded-lg ${textClass} focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex space-x-4">
                                        <button
                                            onClick={handleApprove}
                                            disabled={submitting}
                                            className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            <span>{submitting ? 'Approving...' : 'Approve & Publish'}</span>
                                        </button>
                                        <button
                                            onClick={handleReject}
                                            disabled={submitting}
                                            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                                        >
                                            <XCircle className="w-5 h-5" />
                                            <span>{submitting ? 'Rejecting...' : 'Reject'}</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className={`${cardClass} border rounded-xl p-12 text-center`}>
                                    <Eye className={`w-16 h-16 ${mutedClass} mx-auto mb-4`} />
                                    <p className={`${textClass} text-xl font-semibold mb-2`}>Select an app to review</p>
                                    <p className={mutedClass}>Choose an app from the list to view details and approve/reject</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReviewInterface;

