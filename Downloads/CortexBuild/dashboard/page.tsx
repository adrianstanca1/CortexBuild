/**
 * Dashboard Page
 * Main dashboard with Base44 integration
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Import Base44 pages dynamically
const ProjectsPage = dynamic(() => import('@/components/base44/pages/ProjectsPage'), { ssr: false });
const ClientsPage = dynamic(() => import('@/components/base44/pages/ClientsPage'), { ssr: false });
const InvoicesPage = dynamic(() => import('@/components/base44/pages/InvoicesPage'), { ssr: false });
const RFIsPage = dynamic(() => import('@/components/base44/pages/RFIsPage'), { ssr: false });
const TimeTrackingPage = dynamic(() => import('@/components/base44/pages/TimeTrackingPage'), { ssr: false });
const DocumentsPage = dynamic(() => import('@/components/base44/pages/DocumentsPage'), { ssr: false });
const SubcontractorsPage = dynamic(() => import('@/components/base44/pages/SubcontractorsPage'), { ssr: false });
const PurchaseOrdersPage = dynamic(() => import('@/components/base44/pages/PurchaseOrdersPage'), { ssr: false });
const LedgerPage = dynamic(() => import('@/components/base44/pages/LedgerPage'), { ssr: false });
const ReportsPage = dynamic(() => import('@/components/base44/pages/ReportsPage'), { ssr: false });
const SettingsPage = dynamic(() => import('@/components/base44/pages/SettingsPage'), { ssr: false });

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activePage, setActivePage] = useState('overview');

    useEffect(() => {
        // Check authentication
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
            router.push('/login');
            return;
        }

        setUser(JSON.parse(userData));
        setLoading(false);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                🏗️ ConstructAI
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                <p className="text-xs text-gray-500">{user?.company?.name || 'Company'}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white mb-8">
                    <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 👋</h2>
                    <p className="text-purple-100">
                        You're logged in as <strong>{user?.role}</strong> at <strong>{user?.company?.name}</strong>
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-3xl">📊</div>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">12</h3>
                        <p className="text-sm text-gray-600">Active Projects</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-3xl">👥</div>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Total</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">8</h3>
                        <p className="text-sm text-gray-600">Team Members</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-3xl">💰</div>
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Budget</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">£2.4M</h3>
                        <p className="text-sm text-gray-600">Total Budget</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-3xl">🤖</div>
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">AI</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">5</h3>
                        <p className="text-sm text-gray-600">AI Agents Active</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        <button className="p-4 border-2 border-purple-200 rounded-xl hover:border-purple-600 hover:bg-purple-50 transition-all text-left">
                            <div className="text-2xl mb-2">➕</div>
                            <h4 className="font-semibold text-gray-900">New Project</h4>
                            <p className="text-sm text-gray-600">Create a new construction project</p>
                        </button>

                        <button className="p-4 border-2 border-blue-200 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition-all text-left">
                            <div className="text-2xl mb-2">👥</div>
                            <h4 className="font-semibold text-gray-900">Add Client</h4>
                            <p className="text-sm text-gray-600">Register a new client</p>
                        </button>

                        <button className="p-4 border-2 border-green-200 rounded-xl hover:border-green-600 hover:bg-green-50 transition-all text-left">
                            <div className="text-2xl mb-2">📄</div>
                            <h4 className="font-semibold text-gray-900">New Invoice</h4>
                            <p className="text-sm text-gray-600">Create an invoice</p>
                        </button>
                    </div>
                </div>

                {/* Chatbot Info */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="text-4xl">🤖</div>
                        <div>
                            <h3 className="text-2xl font-bold">AI Assistant Ready!</h3>
                            <p className="text-purple-100">Your personal AI chatbot is available in the bottom-right corner</p>
                        </div>
                    </div>

                    <div className="bg-white/10 rounded-lg p-4">
                        <p className="text-sm mb-2">Try asking:</p>
                        <ul className="space-y-1 text-sm">
                            <li>💬 "Show me all active projects"</li>
                            <li>💬 "What's our financial status?"</li>
                            <li>💬 "Create a new project for ABC Construction"</li>
                            <li>💬 "What issues has the AI detected?"</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
}

