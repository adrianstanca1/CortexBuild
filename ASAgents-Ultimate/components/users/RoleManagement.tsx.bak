import React, { useState } from 'react';
import { User, Role } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Shield, 
  Users, 
  Edit, 
  Plus,
  Trash2,
  Check,
  X
} from 'lucide-react';

interface RoleManagementProps {
  users: User[];
  currentUser: User;
  onUserUpdate: (user: User) => void;
  addToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

interface RoleDefinition {
  id: Role;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  color: string;
}

export const RoleManagement: React.FC<RoleManagementProps> = ({
  users,
  currentUser,
  onUserUpdate,
  addToast,
}) => {
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const roleDefinitions: RoleDefinition[] = [
    {
      id: 'owner',
      name: 'Owner',
      description: 'Full system access with all administrative privileges',
      permissions: ['read', 'write', 'delete', 'admin', 'manage_users', 'manage_projects', 'manage_finances', 'manage_settings'],
      userCount: users.filter(u => u.role === 'owner').length,
      color: 'purple',
    },
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Administrative access with user and system management capabilities',
      permissions: ['read', 'write', 'delete', 'admin', 'manage_users', 'manage_projects', 'manage_finances'],
      userCount: users.filter(u => u.role === 'admin').length,
      color: 'red',
    },
    {
      id: 'manager',
      name: 'Manager',
      description: 'Project management access with team oversight capabilities',
      permissions: ['read', 'write', 'manage_projects'],
      userCount: users.filter(u => u.role === 'manager').length,
      color: 'blue',
    },
    {
      id: 'user',
      name: 'User',
      description: 'Basic access for viewing and limited editing capabilities',
      permissions: ['read'],
      userCount: users.filter(u => u.role === 'user').length,
      color: 'green',
    },
  ];

  const getRoleColor = (color: string) => {
    const colors = {
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
    };
    return colors[color as keyof typeof colors] || colors.green;
  };

  const canManageRoles = () => {
    return currentUser.role === 'owner' || currentUser.role === 'admin';
  };

  const handleRoleChange = (userId: string, newRole: Role) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    // Check if current user can assign this role
    if (currentUser.role === 'admin' && newRole === 'owner') {
      addToast('Only owners can assign owner role', 'error');
      return;
    }

    const updatedUser = { ...user, role: newRole };
    onUserUpdate(updatedUser);
    addToast(`User role updated to ${newRole}`, 'success');
  };

  const getUsersByRole = (role: Role) => {
    return users.filter(u => u.role === role);
  };

  return (
    <div className="space-y-6">
      {/* Role Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roleDefinitions.map(role => (
          <Card key={role.id} className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg bg-${role.color}-100`}>
                <Shield className={`text-${role.color}-600`} size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{role.name}</h3>
                <p className="text-sm text-muted-foreground">{role.userCount} users</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
            <div className="text-xs text-muted-foreground">
              {role.permissions.length} permissions
            </div>
          </Card>
        ))}
      </div>

      {/* Role Details */}
      <div className="space-y-6">
        {roleDefinitions.map(role => (
          <Card key={role.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${role.color}-100`}>
                  <Shield className={`text-${role.color}-600`} size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{role.name}</h3>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </div>
              </div>
              
              {canManageRoles() && (
                <Button variant="outline" size="sm">
                  <Edit size={14} className="mr-2" />
                  Edit Role
                </Button>
              )}
            </div>

            {/* Permissions */}
            <div className="mb-6">
              <h4 className="font-medium text-foreground mb-3">Permissions</h4>
              <div className="flex flex-wrap gap-2">
                {role.permissions.map(permission => (
                  <span
                    key={permission}
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    {permission.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Users with this role */}
            <div>
              <h4 className="font-medium text-foreground mb-3">
                Users with {role.name} role ({role.userCount})
              </h4>
              
              {role.userCount === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No users with this role
                </div>
              ) : (
                <div className="space-y-2">
                  {getUsersByRole(role.id).map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-medium text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-red-100 text-red-800 border-red-200'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      {canManageRoles() && user.id !== currentUser.id && (
                        <div className="flex items-center gap-2">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                            className="border border-border rounded px-2 py-1 text-sm"
                          >
                            <option value="user">User</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                            {currentUser.role === 'owner' && (
                              <option value="owner">Owner</option>
                            )}
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Role Assignment Matrix */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Permission Matrix</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3">Permission</th>
                {roleDefinitions.map(role => (
                  <th key={role.id} className="text-center py-2 px-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(role.color)}`}>
                      {role.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {['read', 'write', 'delete', 'admin', 'manage_users', 'manage_projects', 'manage_finances', 'manage_settings'].map(permission => (
                <tr key={permission} className="border-b border-border">
                  <td className="py-2 px-3 font-medium">
                    {permission.replace('_', ' ').charAt(0).toUpperCase() + permission.replace('_', ' ').slice(1)}
                  </td>
                  {roleDefinitions.map(role => (
                    <td key={role.id} className="text-center py-2 px-3">
                      {role.permissions.includes(permission) ? (
                        <Check className="text-green-600 mx-auto" size={16} />
                      ) : (
                        <X className="text-red-600 mx-auto" size={16} />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
