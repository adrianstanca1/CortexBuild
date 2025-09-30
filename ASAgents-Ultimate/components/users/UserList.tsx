import React, { useState } from 'react';
import { User } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Users, 
  Edit, 
  Trash2, 
  Shield, 
  Clock,
  Mail,
  Phone,
  MapPin,
  MoreVertical,
  UserCheck,
  UserX
} from 'lucide-react';
import { format } from 'date-fns';

interface UserListProps {
  users: User[];
  currentUser: User;
  onUserSelect: (user: User) => void;
  onUserUpdate: (user: User) => void;
  onUserDelete: (userId: string) => void;
  addToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  currentUser,
  onUserSelect,
  onUserUpdate,
  onUserDelete,
  addToast,
}) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'user':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const handleToggleUserStatus = (user: User) => {
    const updatedUser = { ...user, isActive: !user.isActive };
    onUserUpdate(updatedUser);
    addToast(
      `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
      'success'
    );
  };

  const handleBulkAction = (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedUsers.length === 0) {
      addToast('Please select users first', 'warning');
      return;
    }

    switch (action) {
      case 'activate':
        selectedUsers.forEach(userId => {
          const user = users.find(u => u.id === userId);
          if (user && !user.isActive) {
            onUserUpdate({ ...user, isActive: true });
          }
        });
        addToast(`${selectedUsers.length} users activated`, 'success');
        break;
      case 'deactivate':
        selectedUsers.forEach(userId => {
          const user = users.find(u => u.id === userId);
          if (user && user.isActive) {
            onUserUpdate({ ...user, isActive: false });
          }
        });
        addToast(`${selectedUsers.length} users deactivated`, 'success');
        break;
      case 'delete':
        selectedUsers.forEach(userId => {
          onUserDelete(userId);
        });
        addToast(`${selectedUsers.length} users deleted`, 'success');
        break;
    }
    setSelectedUsers([]);
  };

  const canManageUser = (user: User) => {
    // Owners can manage everyone
    if (currentUser.role === 'owner') return true;
    // Admins can manage everyone except owners
    if (currentUser.role === 'admin' && user.role !== 'owner') return true;
    // Managers can manage users
    if (currentUser.role === 'manager' && user.role === 'user') return true;
    // Users can't manage anyone
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-blue-900">
                {selectedUsers.length} user(s) selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('activate')}
                className="text-green-600 border-green-300 hover:bg-green-50"
              >
                <UserCheck size={14} className="mr-1" />
                Activate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('deactivate')}
                className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
              >
                <UserX size={14} className="mr-1" />
                Deactivate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 size={14} className="mr-1" />
                Delete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUsers([])}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Users List */}
      <Card className="p-6">
        <div className="space-y-4">
          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No users found</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding your first user to the system
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map(user => (
                <div key={user.id} className="border border-border rounded-lg p-4 hover:bg-accent transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Checkbox for bulk selection */}
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(prev => [...prev, user.id]);
                          } else {
                            setSelectedUsers(prev => prev.filter(id => id !== user.id));
                          }
                        }}
                        className="rounded border-border"
                      />
                      
                      {/* User Avatar */}
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-medium text-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-medium text-foreground">{user.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.isActive)}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail size={14} />
                            <span>{user.email}</span>
                          </div>
                          {user.lastLogin && (
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              <span>Last login: {format(user.lastLogin, 'MMM dd, yyyy')}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Shield size={14} />
                            <span>{user.permissions?.length || 0} permissions</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUserSelect(user)}
                      >
                        View Details
                      </Button>
                      
                      {canManageUser(user) && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleUserStatus(user)}
                            className={user.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}
                          >
                            {user.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onUserSelect(user)}
                          >
                            <Edit size={14} />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onUserDelete(user.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Additional User Info */}
                  <div className="mt-3 pl-16">
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span>Created: {format(user.createdAt, 'MMM dd, yyyy')}</span>
                      {user.phone && (
                        <div className="flex items-center gap-1">
                          <Phone size={14} />
                          <span>{user.phone}</span>
                        </div>
                      )}
                      {user.location && (
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          <span>{user.location}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Permissions Preview */}
                    {user.permissions && user.permissions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {user.permissions.slice(0, 3).map(permission => (
                          <span
                            key={permission}
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                          >
                            {permission}
                          </span>
                        ))}
                        {user.permissions.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{user.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
