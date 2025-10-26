/**
 * User Roles & Permissions - Role-based access control
 * 
 * Features:
 * - User role management (Admin, Developer, User)
 * - Permission assignment
 * - Role-based UI rendering
 * - Access control lists
 */

import React, { useState, useEffect } from 'react';
import {
    Shield,
    Users,
    Key,
    Lock,
    Unlock,
    UserPlus,
    Edit,
    Trash2,
    Check,
    X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllUsers, updateUserRole, updateUserPermissions } from '../../lib/services/database-integration';

interface UserRolesPermissionsProps {
    isDarkMode?: boolean;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'developer' | 'user';
    permissions: string[];
    avatar?: string;
    status: 'active' | 'inactive';
}

interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    color: string;
}

const AVAILABLE_PERMISSIONS = [
    { id: 'apps.create', name: 'Create Apps', category: 'Apps' },
    { id: 'apps.edit', name: 'Edit Apps', category: 'Apps' },
    { id: 'apps.delete', name: 'Delete Apps', category: 'Apps' },
    { id: 'apps.publish', name: 'Publish Apps', category: 'Apps' },
    { id: 'users.view', name: 'View Users', category: 'Users' },
    { id: 'users.edit', name: 'Edit Users', category: 'Users' },
    { id: 'users.delete', name: 'Delete Users', category: 'Users' },
    { id: 'teams.create', name: 'Create Teams', category: 'Teams' },
    { id: 'teams.manage', name: 'Manage Teams', category: 'Teams' },
    { id: 'billing.view', name: 'View Billing', category: 'Billing' },
    { id: 'billing.manage', name: 'Manage Billing', category: 'Billing' },
    { id: 'analytics.view', name: 'View Analytics', category: 'Analytics' }
];

const UserRolesPermissions: React.FC<UserRolesPermissionsProps> = ({ isDarkMode = true }) => {
    const [users, setUsers] = useState<User[]>([
        {
            id: '1',
            name: 'John Doe',
            email: 'john@cortexbuild.com',
            role: 'admin',
            permissions: AVAILABLE_PERMISSIONS.map(p => p.id),
            status: 'active'
        },
        {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@cortexbuild.com',
            role: 'developer',
            permissions: ['apps.create', 'apps.edit', 'apps.publish', 'users.view', 'analytics.view'],
            status: 'active'
        },
        {
            id: '3',
            name: 'Bob Johnson',
            email: 'bob@cortexbuild.com',
            role: 'user',
            permissions: ['apps.create', 'users.view'],
            status: 'active'
        }
    ]);

    const [roles] = useState<Role[]>([
        {
            id: 'admin',
            name: 'Administrator',
            description: 'Full system access with all permissions',
            permissions: AVAILABLE_PERMISSIONS.map(p => p.id),
            color: 'from-red-600 to-pink-600'
        },
        {
            id: 'developer',
            name: 'Developer',
            description: 'Can create and manage apps',
            permissions: ['apps.create', 'apps.edit', 'apps.publish', 'users.view', 'analytics.view'],
            color: 'from-blue-600 to-cyan-600'
        },
        {
            id: 'user',
            name: 'User',
            description: 'Basic access to use apps',
            permissions: ['apps.create', 'users.view'],
            color: 'from-green-600 to-emerald-600'
        }
    ]);

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const updateUserRole = (userId: string, newRole: 'admin' | 'developer' | 'user') => {
        const role = roles.find(r => r.id === newRole);
        if (!role) return;

        setUsers(users.map(u =>
            u.id === userId
                ? { ...u, role: newRole, permissions: role.permissions }
                : u
        ));
        toast.success(`User role updated to ${role.name}`);
    };

    const togglePermission = (userId: string, permissionId: string) => {
        setUsers(users.map(u => {
            if (u.id === userId) {
                const hasPermission = u.permissions.includes(permissionId);
                return {
                    ...u,
                    permissions: hasPermission
                        ? u.permissions.filter(p => p !== permissionId)
                        : [...u.permissions, permissionId]
                };
            }
            return u;
        }));
        toast.success('Permission updated');
    };

    const deleteUser = (userId: string) => {
        setUsers(users.filter(u => u.id !== userId));
        toast.success('User deleted');
    };

    const getRoleColor = (role: string) => {
        const roleObj = roles.find(r => r.id === role);
        return roleObj?.color || 'from-gray-600 to-gray-700';
    };

    return (
        <div className={`h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-8 overflow-y-auto`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className={`text-4xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        🛡️ User Roles & Permissions
                    </h1>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Manage user access and permissions
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Roles Overview */}
                    {roles.map(role => (
                        <div
                            key={role.id}
                            className={`p-6 rounded-2xl bg-gradient-to-br ${role.color} text-white`}
                        >
                            <Shield className="h-8 w-8 mb-3" />
                            <h3 className="text-2xl font-bold mb-2">{role.name}</h3>
                            <p className="text-sm opacity-90 mb-4">{role.description}</p>
                            <div className="text-sm">
                                <span className="font-semibold">{role.permissions.length}</span> permissions
                            </div>
                        </div>
                    ))}
                </div>

                {/* Users List */}
                <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Users
                        </h2>
                        <button
                            type="button"
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-semibold"
                        >
                            <UserPlus className="h-4 w-4" />
                            Add User
                        </button>
                    </div>

                    <div className="space-y-4">
                        {users.map(user => (
                            <div
                                key={user.id}
                                className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getRoleColor(user.role)} flex items-center justify-center text-white font-bold text-lg`}>
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {user.name}
                                            </h3>
                                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={user.role}
                                            onChange={(e) => updateUserRole(user.id, e.target.value as any)}
                                            className={`px-3 py-1 rounded-lg border text-sm font-semibold ${isDarkMode ? 'bg-gray-600 text-white border-gray-500' : 'bg-white text-gray-900 border-gray-300'
                                                }`}
                                        >
                                            <option value="admin">Admin</option>
                                            <option value="developer">Developer</option>
                                            <option value="user">User</option>
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setShowEditModal(true);
                                            }}
                                            className="p-2 hover:bg-gray-600 rounded-lg"
                                        >
                                            <Edit className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => deleteUser(user.id)}
                                            className="p-2 hover:bg-red-500/20 rounded-lg"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </button>
                                    </div>
                                </div>

                                {/* Permissions */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {AVAILABLE_PERMISSIONS.slice(0, 8).map(permission => {
                                        const hasPermission = user.permissions.includes(permission.id);
                                        return (
                                            <button
                                                key={permission.id}
                                                type="button"
                                                onClick={() => togglePermission(user.id, permission.id)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${hasPermission
                                                        ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                                                        : isDarkMode ? 'bg-gray-600 text-gray-400 border border-gray-500' : 'bg-gray-200 text-gray-600 border border-gray-300'
                                                    }`}
                                            >
                                                {hasPermission ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                                {permission.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Edit Modal */}
                {showEditModal && selectedUser && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className={`w-full max-w-2xl rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <div className="p-6 border-b border-gray-700">
                                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Edit Permissions - {selectedUser.name}
                                </h3>
                            </div>
                            <div className="p-6 max-h-96 overflow-y-auto">
                                <div className="space-y-4">
                                    {Object.entries(
                                        AVAILABLE_PERMISSIONS.reduce((acc, p) => {
                                            if (!acc[p.category]) acc[p.category] = [];
                                            acc[p.category].push(p);
                                            return acc;
                                        }, {} as Record<string, typeof AVAILABLE_PERMISSIONS>)
                                    ).map(([category, permissions]) => (
                                        <div key={category}>
                                            <h4 className={`text-sm font-bold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {category}
                                            </h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {permissions.map(permission => {
                                                    const hasPermission = selectedUser.permissions.includes(permission.id);
                                                    return (
                                                        <button
                                                            key={permission.id}
                                                            type="button"
                                                            onClick={() => togglePermission(selectedUser.id, permission.id)}
                                                            className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${hasPermission
                                                                    ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                                                                    : isDarkMode ? 'bg-gray-700 text-gray-400 border border-gray-600' : 'bg-gray-100 text-gray-600 border border-gray-300'
                                                                }`}
                                                        >
                                                            {hasPermission ? <Check className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                                                            {permission.name}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserRolesPermissions;

