// @ts-nocheck
import React, { useState } from 'react';
import { User } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  ArrowLeft,
  Edit,
  Shield,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  Settings,
  Key,
  UserCheck,
  UserX
} from 'lucide-react';
import { format } from 'date-fns';

interface UserDetailsProps {
  user: User;
  currentUser: User;
  onUserUpdate: (user: User) => void;
  onBack: () => void;
  addToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const UserDetails: React.FC<UserDetailsProps> = ({
  user,
  currentUser,
  onUserUpdate,
  onBack,
  addToast,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'permissions' | 'activity' | 'settings'>('overview');

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

  const canManageUser = () => {
    if (currentUser.role === 'owner') return true;
    if (currentUser.role === 'admin' && user.role !== 'owner') return true;
    if (currentUser.role === 'manager' && user.role === 'user') return true;
    return false;
  };

  const handleToggleStatus = () => {
    const updatedUser = { ...user, isActive: !user.isActive };
    onUserUpdate(updatedUser);
    addToast(
      `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
      'success'
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <UserCheck size={16} /> },
    { id: 'permissions', label: 'Permissions', icon: <Shield size={16} /> },
    { id: 'activity', label: 'Activity', icon: <Activity size={16} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
  ];

  const mockActivityData = [
    {
      id: '1',
      action: 'Logged in',
      timestamp: new Date('2024-03-15T10:30:00Z'),
      details: 'Successful login from Chrome browser',
      ip: '192.168.1.100',
    },
    {
      id: '2',
      action: 'Updated project',
      timestamp: new Date('2024-03-15T09:15:00Z'),
      details: 'Modified project "Office Building Construction"',
      ip: '192.168.1.100',
    },
    {
      id: '3',
      action: 'Created expense',
      timestamp: new Date('2024-03-14T16:45:00Z'),
      details: 'Added expense for construction materials',
      ip: '192.168.1.100',
    },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* User Profile */}
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-primary font-bold text-2xl">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(user.role)}`}>
                {user.role}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                user.isActive 
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : 'bg-red-100 text-red-800 border-red-200'
              }`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={16} />
                  <span>{user.phone}</span>
                </div>
              )}
              {user.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>{user.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>Joined {format(user.createdAt, 'MMM dd, yyyy')}</span>
              </div>
              {user.lastLogin && (
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>Last login {format(user.lastLogin, 'MMM dd, yyyy HH:mm')}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Shield size={16} />
                <span>{user.permissions?.length || 0} permissions</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="text-blue-600" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">24</div>
              <div className="text-sm text-muted-foreground">Actions This Week</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="text-green-600" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">42h</div>
              <div className="text-sm text-muted-foreground">Time Logged</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Shield className="text-yellow-600" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">3</div>
              <div className="text-sm text-muted-foreground">Projects Assigned</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderPermissions = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">User Permissions</h3>
      
      <div className="space-y-4">
        {user.permissions && user.permissions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.permissions.map(permission => (
              <div key={permission} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <Shield className="text-primary" size={16} />
                <div>
                  <div className="font-medium text-foreground">
                    {permission.charAt(0).toUpperCase() + permission.slice(1).replace('_', ' ')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Permission to {permission.replace('_', ' ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No permissions assigned
          </div>
        )}
      </div>
    </Card>
  );

  const renderActivity = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      
      <div className="space-y-4">
        {mockActivityData.map(activity => (
          <div key={activity.id} className="flex items-start gap-4 p-4 border border-border rounded-lg">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="text-blue-600" size={16} />
            </div>
            <div className="flex-1">
              <div className="font-medium text-foreground">{activity.action}</div>
              <div className="text-sm text-muted-foreground">{activity.details}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {format(activity.timestamp, 'MMM dd, yyyy HH:mm')} • IP: {activity.ip}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <div className="font-medium text-foreground">Account Status</div>
              <div className="text-sm text-muted-foreground">
                User account is currently {user.isActive ? 'active' : 'inactive'}
              </div>
            </div>
            {canManageUser() && (
              <Button
                variant="outline"
                onClick={handleToggleStatus}
                className={user.isActive ? 'text-red-600 border-red-300' : 'text-green-600 border-green-300'}
              >
                {user.isActive ? <UserX size={16} className="mr-2" /> : <UserCheck size={16} className="mr-2" />}
                {user.isActive ? 'Deactivate' : 'Activate'}
              </Button>
            )}
          </div>
          
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <div className="font-medium text-foreground">Password</div>
              <div className="text-sm text-muted-foreground">
                Last changed {user.lastPasswordChange ? format(user.lastPasswordChange, 'MMM dd, yyyy') : 'Never'}
              </div>
            </div>
            {canManageUser() && (
              <Button variant="outline">
                <Key size={16} className="mr-2" />
                Reset Password
              </Button>
            )}
          </div>
          
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <div className="font-medium text-foreground">Two-Factor Authentication</div>
              <div className="text-sm text-muted-foreground">
                {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>
            {canManageUser() && (
              <Button variant="outline">
                <Shield size={16} className="mr-2" />
                {user.twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'permissions':
        return renderPermissions();
      case 'activity':
        return renderActivity();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Users
          </Button>
          <h1 className="text-2xl font-bold text-foreground">User Details</h1>
        </div>
        
        {canManageUser() && (
          <Button>
            <Edit size={16} className="mr-2" />
            Edit User
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};
