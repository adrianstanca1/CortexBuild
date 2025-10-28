/**
 * Team Collaboration - Team management and collaboration
 */

import React, { useState } from 'react';
import {
    Users,
    UserPlus,
    Mail,
    Crown,
    Shield,
    Trash2,
    Copy,
    Check,
    MessageSquare,
    Calendar,
    Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TeamCollaborationProps {
    isDarkMode?: boolean;
}

interface Team {
    id: string;
    name: string;
    description: string;
    members: TeamMember[];
    createdAt: Date;
    projects: number;
}

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'member';
    avatar?: string;
    joinedAt: Date;
    status: 'active' | 'pending';
}

const TeamCollaboration: React.FC<TeamCollaborationProps> = ({ isDarkMode = true }) => {
    const [teams, setTeams] = useState<Team[]>([
        {
            id: '1',
            name: 'Construction Team Alpha',
            description: 'Main construction project team',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            projects: 12,
            members: [
                {
                    id: '1',
                    name: 'John Doe',
                    email: 'john@cortexbuild.com',
                    role: 'owner',
                    joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    status: 'active'
                },
                {
                    id: '2',
                    name: 'Jane Smith',
                    email: 'jane@cortexbuild.com',
                    role: 'admin',
                    joinedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
                    status: 'active'
                },
                {
                    id: '3',
                    name: 'Bob Johnson',
                    email: 'bob@cortexbuild.com',
                    role: 'member',
                    joinedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
                    status: 'active'
                }
            ]
        },
        {
            id: '2',
            name: 'Safety Inspectors',
            description: 'Safety and compliance team',
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            projects: 8,
            members: [
                {
                    id: '4',
                    name: 'Alice Williams',
                    email: 'alice@cortexbuild.com',
                    role: 'owner',
                    joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
                    status: 'active'
                },
                {
                    id: '5',
                    name: 'Charlie Brown',
                    email: 'charlie@cortexbuild.com',
                    role: 'member',
                    joinedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                    status: 'pending'
                }
            ]
        }
    ]);

    const [selectedTeam, setSelectedTeam] = useState<Team | null>(teams[0]);
    const [inviteEmail, setInviteEmail] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);

    const sendInvite = () => {
        if (!inviteEmail.trim() || !selectedTeam) {
            toast.error('Please enter an email address');
            return;
        }

        const newMember: TeamMember = {
            id: Date.now().toString(),
            name: inviteEmail.split('@')[0],
            email: inviteEmail,
            role: 'member',
            joinedAt: new Date(),
            status: 'pending'
        };

        setTeams(teams.map(t =>
            t.id === selectedTeam.id
                ? { ...t, members: [...t.members, newMember] }
                : t
        ));

        setInviteEmail('');
        setShowInviteModal(false);
        toast.success(`Invitation sent to ${inviteEmail}`);
    };

    const removeMember = (teamId: string, memberId: string) => {
        setTeams(teams.map(t =>
            t.id === teamId
                ? { ...t, members: t.members.filter(m => m.id !== memberId) }
                : t
        ));
        toast.success('Member removed from team');
    };

    const copyInviteLink = () => {
        const link = `https://cortexbuild.com/invite/${selectedTeam?.id}`;
        navigator.clipboard.writeText(link);
        toast.success('Invite link copied to clipboard');
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'owner': return <Crown className="h-4 w-4 text-yellow-500" />;
            case 'admin': return <Shield className="h-4 w-4 text-blue-500" />;
            default: return <Users className="h-4 w-4 text-gray-500" />;
        }
    };

    return (
        <div className={`h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-8 overflow-y-auto`}>
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className={`text-4xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        👥 Team Collaboration
                    </h1>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Manage teams and collaborate with members
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Teams List */}
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Teams
                            </h2>
                            <button
                                type="button"
                                className="p-2 bg-purple-500/20 text-purple-500 hover:bg-purple-500/30 rounded-lg"
                            >
                                <UserPlus className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {teams.map(team => (
                                <div
                                    key={team.id}
                                    onClick={() => setSelectedTeam(team)}
                                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                                        selectedTeam?.id === team.id
                                            ? 'bg-purple-500/20 border-2 border-purple-500'
                                            : isDarkMode ? 'bg-gray-700 border border-gray-600 hover:border-gray-500' : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <h3 className={`font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {team.name}
                                    </h3>
                                    <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {team.description}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs">
                                        <div className="flex items-center gap-1">
                                            <Users className={`h-3 w-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                                {team.members.length} members
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Activity className={`h-3 w-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                                {team.projects} projects
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Team Details */}
                    {selectedTeam && (
                        <div className="lg:col-span-2 space-y-6">
                            {/* Team Info */}
                            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {selectedTeam.name}
                                        </h2>
                                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {selectedTeam.description}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowInviteModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-semibold"
                                    >
                                        <Mail className="h-4 w-4" />
                                        Invite
                                    </button>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                        <Users className={`h-6 w-6 mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                                        <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {selectedTeam.members.length}
                                        </div>
                                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Members
                                        </div>
                                    </div>
                                    <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                        <Activity className={`h-6 w-6 mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                        <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {selectedTeam.projects}
                                        </div>
                                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Projects
                                        </div>
                                    </div>
                                    <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                        <Calendar className={`h-6 w-6 mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                                        <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {Math.floor((Date.now() - selectedTeam.createdAt.getTime()) / (1000 * 60 * 60 * 24))}
                                        </div>
                                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Days Active
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Members */}
                            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Team Members
                                </h3>
                                <div className="space-y-3">
                                    {selectedTeam.members.map(member => (
                                        <div
                                            key={member.id}
                                            className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                                {member.name}
                                                            </span>
                                                            {getRoleIcon(member.role)}
                                                            {member.status === 'pending' && (
                                                                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-xs font-semibold rounded">
                                                                    Pending
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                            {member.email}
                                                        </div>
                                                    </div>
                                                </div>
                                                {member.role !== 'owner' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeMember(selectedTeam.id, member.id)}
                                                        className="p-2 hover:bg-red-500/20 rounded-lg"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Invite Modal */}
                {showInviteModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className={`w-full max-w-md rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <div className="p-6 border-b border-gray-700">
                                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Invite Team Member
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        placeholder="colleague@example.com"
                                        className={`w-full px-4 py-3 rounded-xl border ${
                                            isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                                        }`}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={copyInviteLink}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold"
                                >
                                    <Copy className="h-4 w-4" />
                                    Copy Invite Link
                                </button>
                            </div>
                            <div className="p-6 border-t border-gray-700 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowInviteModal(false)}
                                    className="flex-1 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={sendInvite}
                                    className="flex-1 px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-semibold"
                                >
                                    Send Invite
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamCollaboration;

