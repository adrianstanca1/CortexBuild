import React, { useState, useEffect } from 'react';
import { User } from '../../../types';
import { supabase } from '../../../lib/supabase/client';
import toast from 'react-hot-toast';
import { Users, Plus, Trash2, Edit2, Mail, Shield, CheckCircle, XCircle } from 'lucide-react';

interface TeamMember {
    id: string;
    email: string;
    name: string;
    role: 'company_admin' | 'project_manager' | 'supervisor' | 'operative';
    status: 'active' | 'inactive' | 'pending';
    joinedDate: string;
    lastActive: string;
}

interface TeamManagementProps {
    currentUser: User;
}

const ROLE_COLORS: Record<string, string> = {
    company_admin: 'bg-red-100 text-red-800',
    project_manager: 'bg-blue-100 text-blue-800',
    supervisor: 'bg-yellow-100 text-yellow-800',
    operative: 'bg-green-100 text-green-800'
};

const TeamManagement: React.FC<TeamManagementProps> = ({ currentUser }) => {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [newMemberRole, setNewMemberRole] = useState<TeamMember['role']>('operative');
    const [isAdding, setIsAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadTeamMembers();
    }, [currentUser]);

    const loadTeamMembers = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('users')
                .select('id, email, name, role, status, created_at, last_sign_in_at')
                .eq('company_id', currentUser.companyId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTeamMembers(data || []);
        } catch (error) {
            console.error('Error loading team members:', error);
            toast.error('Failed to load team members');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddMember = async () => {
        if (!newMemberEmail.trim()) {
            toast.error('Please enter an email address');
            return;
        }

        try {
            setIsAdding(true);
            // Call RPC function to invite user
            const { error } = await supabase.rpc('invite_team_member', {
                company_id: currentUser.companyId,
                email: newMemberEmail,
                role: newMemberRole
            });

            if (error) throw error;
            toast.success('Team member invited successfully');
            setNewMemberEmail('');
            setShowAddForm(false);
            loadTeamMembers();
        } catch (error) {
            console.error('Error adding team member:', error);
            toast.error('Failed to invite team member');
        } finally {
            setIsAdding(false);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm('Are you sure you want to remove this team member?')) return;

        try {
            const { error } = await supabase
                .from('users')
                .update({ status: 'inactive' })
                .eq('id', memberId);

            if (error) throw error;
            toast.success('Team member removed');
            loadTeamMembers();
        } catch (error) {
            console.error('Error removing team member:', error);
            toast.error('Failed to remove team member');
        }
    };

    const handleUpdateRole = async (memberId: string, newRole: TeamMember['role']) => {
        try {
            const { error } = await supabase
                .from('users')
                .update({ role: newRole })
                .eq('id', memberId);

            if (error) throw error;
            toast.success('Role updated successfully');
            loadTeamMembers();
        } catch (error) {
            console.error('Error updating role:', error);
            toast.error('Failed to update role');
        }
    };

    const filteredMembers = teamMembers.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-12 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-blue-600" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
                        <p className="text-sm text-gray-600">{teamMembers.length} team members</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Member
                </button>
            </div>

            {/* Add Member Form */}
            {showAddForm && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Invite Team Member</h3>
                    <div className="flex gap-3">
                        <input
                            type="email"
                            placeholder="Enter email address"
                            value={newMemberEmail}
                            onChange={(e) => setNewMemberEmail(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                            value={newMemberRole}
                            onChange={(e) => setNewMemberRole(e.target.value as TeamMember['role'])}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            aria-label="Member role"
                            title="Select member role"
                        >
                            <option value="operative">Operative</option>
                            <option value="supervisor">Supervisor</option>
                            <option value="project_manager">Project Manager</option>
                            <option value="company_admin">Company Admin</option>
                        </select>
                        <button
                            type="button"
                            onClick={handleAddMember}
                            disabled={isAdding}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {isAdding ? 'Inviting...' : 'Invite'}
                        </button>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search team members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Team Members Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Role</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Joined</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.map(member => (
                            <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 text-gray-900 font-medium">{member.name}</td>
                                <td className="py-3 px-4 text-gray-600 flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    {member.email}
                                </td>
                                <td className="py-3 px-4">
                                    <select
                                        value={member.role}
                                        onChange={(e) => handleUpdateRole(member.id, e.target.value as TeamMember['role'])}
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${ROLE_COLORS[member.role]} border-0 cursor-pointer`}
                                        aria-label="Member role"
                                        title="Change member role"
                                    >
                                        <option value="operative">Operative</option>
                                        <option value="supervisor">Supervisor</option>
                                        <option value="project_manager">Project Manager</option>
                                        <option value="company_admin">Company Admin</option>
                                    </select>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                        {member.status === 'active' ? (
                                            <>
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                <span className="text-green-600 text-sm font-medium">Active</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-400 text-sm font-medium">Inactive</span>
                                            </>
                                        )}
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-gray-600 text-sm">
                                    {new Date(member.joinedDate).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveMember(member.id)}
                                        className="text-red-600 hover:text-red-700 transition-colors"
                                        aria-label="Remove member"
                                        title="Remove member"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredMembers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No team members found
                </div>
            )}
        </div>
    );
};

export default TeamManagement;

