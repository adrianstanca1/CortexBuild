/**
 * SIMPLE APP - No complex navigation, just Login or Dashboard
 */

import React, { useState, useEffect } from 'react';
import * as authService from './auth/authService';
import { User } from './types';
import { Base44Clone } from './components/base44/Base44Clone';
import { SuperAdminDashboard } from './components/base44/pages/SuperAdminDashboard';
import { CompanyAdminDashboard } from './components/base44/pages/CompanyAdminDashboard';
import EnhancedDeveloperConsole from './components/screens/developer/EnhancedDeveloperConsole';

// Simple Login Component
const SimpleLogin: React.FC<{ onLoginSuccess: (user: User) => void }> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('adrian.stanca1@gmail.com');
    const [password, setPassword] = useState('password123');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            console.log('🔐 Attempting login...');
            const user = await authService.login(email, password);
            console.log('✅ Login successful:', user);
            onLoginSuccess(user);
        } catch (err: any) {
            console.error('❌ Login error:', err);
            setError(err.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">ConstructAI</h1>
                    <p className="text-gray-600">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// Simple Dashboard Component with Navigation
const SimpleDashboard: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = React.useState<'dashboard' | 'projects' | 'tasks' | 'team' | 'settings'>('dashboard');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">ConstructAI</h1>
                            <p className="text-sm text-gray-600">Welcome back, {user.name}</p>
                        </div>
                        <button
                            onClick={onLogout}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 text-white mb-8">
                    <h2 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h2>
                    <p className="text-blue-100 text-lg">{user.email}</p>
                    <p className="text-blue-200 mt-2">Role: {user.role}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Projects</p>
                                <p className="text-3xl font-bold text-gray-900">12</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Active Tasks</p>
                                <p className="text-3xl font-bold text-gray-900">47</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Team Members</p>
                                <p className="text-3xl font-bold text-gray-900">8</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
                                <p className="text-3xl font-bold text-gray-900">87%</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">New project created</p>
                                <p className="text-sm text-gray-600">Downtown Office Building - Phase 2</p>
                                <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Task completed</p>
                                <p className="text-sm text-gray-600">Foundation inspection approved</p>
                                <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Team member added</p>
                                <p className="text-sm text-gray-600">John Smith joined as Project Manager</p>
                                <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

// Main App Component
export const SimpleApp: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                console.log('🔍 Checking for existing session...');
                const user = await authService.getCurrentUser();
                if (user) {
                    console.log('✅ Session found:', user.name);
                    setCurrentUser(user);
                } else {
                    console.log('ℹ️ No active session');
                }
            } catch (error) {
                console.error('Session check error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkSession();
    }, []);

    const handleLoginSuccess = (user: User) => {
        console.log('✅ Login successful, setting user:', user.name);
        setCurrentUser(user);
    };

    const handleLogout = async () => {
        try {
            console.log('👋 Logging out...');

            // Call logout service FIRST (clears localStorage, sessionStorage, cookies, dispatches event)
            await authService.logout();

            console.log('✅ Logout successful - All session data cleared');

            // Clear user state
            setCurrentUser(null);

            // Small delay to ensure all cleanup is done
            setTimeout(() => {
                // Force page reload to ensure clean state
                window.location.reload();
            }, 100);
        } catch (error) {
            console.error('Logout error:', error);
            // Even if logout fails, clear everything and reload
            localStorage.clear();
            sessionStorage.clear();
            setCurrentUser(null);
            setTimeout(() => {
                window.location.reload();
            }, 100);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="bg-white p-8 rounded-xl shadow-2xl text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-700 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    // Role-based routing: show appropriate dashboard based on user role
    if (currentUser) {
        console.log('✅ Rendering dashboard for:', currentUser.name, 'Role:', currentUser.role);

        // Developer gets the Enhanced Developer Console
        if (currentUser.role === 'developer') {
            console.log('🎯 DEVELOPER ROLE DETECTED - Rendering Enhanced Developer Console Pro');
            return <EnhancedDeveloperConsole onLogout={handleLogout} />;
        }

        // Super Admin gets the Super Admin Dashboard
        if (currentUser.role === 'super_admin') {
            return (
                <div className="min-h-screen bg-gray-50">
                    <header className="bg-white shadow-sm border-b border-gray-200">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">CortexBuild - Super Admin</h1>
                                    <p className="text-sm text-gray-600">Welcome back, {currentUser.name}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </header>
                    <SuperAdminDashboard />
                </div>
            );
        }

        // All other users (admin, owner, manager, user) get the Base44 clone dashboard
        return <Base44Clone user={currentUser} onLogout={handleLogout} />;
    }

    console.log('🔐 No user, rendering login');
    return <SimpleLogin onLoginSuccess={handleLoginSuccess} />;
};

