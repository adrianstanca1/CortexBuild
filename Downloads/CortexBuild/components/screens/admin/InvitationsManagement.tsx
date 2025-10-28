import React, { useState, useEffect } from 'react';
import { User } from '../../../types';
import * as api from '../../../api';

interface InvitationsManagementProps {
    currentUser: User;
}

const InvitationsManagement: React.FC<InvitationsManagementProps> = ({ currentUser }) => {
    const [invitations, setInvitations] = useState<api.PlatformInvitation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSendForm, setShowSendForm] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        companyName: '',
        invitationType: 'company_admin' as 'company_admin' | 'super_admin' | 'platform_partner'
    });

    useEffect(() => {
        loadInvitations();
    }, []);

    const loadInvitations = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const invitationsData = await api.getPlatformInvitations(currentUser);
            setInvitations(invitationsData);
        } catch (err: any) {
            console.error('Error loading invitations:', err);
            setError(err.message || 'Failed to load invitations');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendInvitation = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await api.sendPlatformInvitation(currentUser, formData.email, formData.companyName, formData.invitationType);
            setFormData({ email: '', companyName: '', invitationType: 'company_admin' });
            setShowSendForm(false);
            loadInvitations();
        } catch (err: any) {
            setError(err.message || 'Failed to send invitation');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'accepted': return 'bg-green-100 text-green-800';
            case 'declined': return 'bg-red-100 text-red-800';
            case 'expired': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'super_admin': return 'bg-red-100 text-red-800';
            case 'company_admin': return 'bg-blue-100 text-blue-800';
            case 'platform_partner': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Platform Invitations</h3>
                <button
                    onClick={() => setShowSendForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Send Invitation
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-red-800">{error}</div>
                </div>
            )}

            {/* Send Invitation Form */}
            {showSendForm && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Send New Invitation</h4>
                    <form onSubmit={handleSendInvitation} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter email address"
                                title="Email Address"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Company Name
                            </label>
                            <input
                                type="text"
                                value={formData.companyName}
                                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter company name"
                                title="Company Name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Invitation Type
                            </label>
                            <select
                                value={formData.invitationType}
                                onChange={(e) => setFormData({...formData, invitationType: e.target.value as any})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                title="Invitation Type"
                            >
                                <option value="company_admin">Company Admin</option>
                                <option value="super_admin">Super Admin</option>
                                <option value="platform_partner">Platform Partner</option>
                            </select>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setShowSendForm(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Send Invitation
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Invitations Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Company
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sent
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Expires
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {invitations.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                    No invitations sent yet. Click "Send Invitation" to get started.
                                </td>
                            </tr>
                        ) : (
                            invitations.map((invitation) => (
                                <tr key={invitation.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {invitation.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {invitation.companyName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(invitation.invitationType)}`}>
                                            {invitation.invitationType.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invitation.status)}`}>
                                            {invitation.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(invitation.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(invitation.expiresAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InvitationsManagement;