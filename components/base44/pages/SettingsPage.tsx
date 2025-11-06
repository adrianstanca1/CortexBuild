/**
 * Settings Page - Complete implementation from Base44
 */

import React, { useState, useEffect } from 'react';
import { NotificationPreferences } from '../../settings/NotificationPreferences';
import { supabase } from '../../../lib/supabase/client';

export const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'notifications' | 'security'>('profile');
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Get current user on mount
    useEffect(() => {
        const getCurrentUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUser(user);
            }
        };
        getCurrentUser();
    }, []);

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                <p className="text-gray-600">Manage your account and preferences</p>
            </div>

            {/* Tabs */}
            <div className="mb-8">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8">
                        <button
                            type="button"
                            onClick={() => setActiveTab('profile')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Profile
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('company')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'company'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Company
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('notifications')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'notifications'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Notifications
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('security')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'security'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Security
                        </button>
                    </nav>
                </div>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                <input
                                    type="text"
                                    defaultValue="Adrian"
                                    placeholder="Enter your first name"
                                    title="First name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                <input
                                    type="text"
                                    defaultValue="Stanca"
                                    placeholder="Enter your last name"
                                    title="Last name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                defaultValue="adrian.stanca1@gmail.com"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                aria-label="Email address"
                                title="Email address"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                            <input
                                type="tel"
                                defaultValue="+44 123 456 7890"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                aria-label="Phone number"
                                title="Phone number"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Company Tab */}
            {activeTab === 'company' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Company Information</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                            <input
                                type="text"
                                defaultValue="ConstructAI"
                                placeholder="Enter your company name"
                                title="Company name"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                            <textarea
                                rows={3}
                                defaultValue="123 Construction Ave, London, UK"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                aria-label="Address"
                                title="Address"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID</label>
                                <input
                                    type="text"
                                    defaultValue="GB123456789"
                                    placeholder="Enter your tax ID"
                                    title="Tax ID"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
                                <input
                                    type="text"
                                    defaultValue="12345678"
                                    placeholder="Enter your registration number"
                                    title="Registration number"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && currentUser && (
                <NotificationPreferences userId={currentUser.id} isDarkMode={false} />
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                aria-label="Current password"
                                title="Current password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                aria-label="New password"
                                title="New password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                aria-label="Confirm new password"
                                title="Confirm new password"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="button"
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Update Password
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
