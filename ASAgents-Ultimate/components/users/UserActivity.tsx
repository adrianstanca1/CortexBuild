import React, { useState } from 'react';
import { User } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Activity, 
  Filter, 
  Search, 
  Download,
  Clock,
  User as UserIcon,
  Globe,
  Smartphone,
  Monitor,
  Calendar
} from 'lucide-react';
import { format, subDays } from 'date-fns';

interface UserActivityProps {
  users: User[];
  currentUser: User;
  addToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  location?: string;
  success: boolean;
}

interface ActivityFilters {
  userId: string;
  action: string;
  dateRange: string;
  search: string;
}

export const UserActivity: React.FC<UserActivityProps> = ({
  users,
  currentUser,
  addToast,
}) => {
  const [filters, setFilters] = useState<ActivityFilters>({
    userId: 'all',
    action: 'all',
    dateRange: '7d',
    search: '',
  });

  // Mock activity data
  const mockActivityLogs: ActivityLog[] = [
    {
      id: '1',
      userId: '1',
      userName: 'Admin User',
      action: 'login',
      details: 'Successful login',
      timestamp: new Date('2024-03-15T10:30:00Z'),
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome 122.0.0.0',
      location: 'New York, NY',
      success: true,
    },
    {
      id: '2',
      userId: '2',
      userName: 'Project Manager',
      action: 'project_update',
      details: 'Updated project "Office Building Construction"',
      timestamp: new Date('2024-03-15T09:15:00Z'),
      ipAddress: '192.168.1.101',
      userAgent: 'Firefox 124.0',
      location: 'Los Angeles, CA',
      success: true,
    },
    {
      id: '3',
      userId: '3',
      userName: 'Field Worker',
      action: 'expense_create',
      details: 'Created expense for construction materials',
      timestamp: new Date('2024-03-14T16:45:00Z'),
      ipAddress: '192.168.1.102',
      userAgent: 'Safari 17.3',
      location: 'Chicago, IL',
      success: true,
    },
    {
      id: '4',
      userId: '1',
      userName: 'Admin User',
      action: 'user_create',
      details: 'Created new user account for John Doe',
      timestamp: new Date('2024-03-14T14:20:00Z'),
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome 122.0.0.0',
      location: 'New York, NY',
      success: true,
    },
    {
      id: '5',
      userId: '4',
      userName: 'External Contractor',
      action: 'login_failed',
      details: 'Failed login attempt - invalid password',
      timestamp: new Date('2024-03-13T11:30:00Z'),
      ipAddress: '203.0.113.1',
      userAgent: 'Chrome 121.0.0.0',
      location: 'Unknown',
      success: false,
    },
  ];

  // Filter activity logs
  const filteredLogs = mockActivityLogs.filter(log => {
    if (filters.userId !== 'all' && log.userId !== filters.userId) return false;
    if (filters.action !== 'all' && log.action !== filters.action) return false;
    if (filters.search && !log.details.toLowerCase().includes(filters.search.toLowerCase()) &&
        !log.userName.toLowerCase().includes(filters.search.toLowerCase())) return false;
    
    // Date range filter
    const logDate = log.timestamp;
    const now = new Date();
    switch (filters.dateRange) {
      case '1d':
        return logDate >= subDays(now, 1);
      case '7d':
        return logDate >= subDays(now, 7);
      case '30d':
        return logDate >= subDays(now, 30);
      default:
        return true;
    }
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
        return <UserIcon className="text-green-600" size={16} />;
      case 'login_failed':
        return <UserIcon className="text-red-600" size={16} />;
      case 'project_update':
        return <Activity className="text-blue-600" size={16} />;
      case 'expense_create':
        return <Activity className="text-yellow-600" size={16} />;
      case 'user_create':
        return <UserIcon className="text-purple-600" size={16} />;
      default:
        return <Activity className="text-gray-600" size={16} />;
    }
  };

  const getActionColor = (action: string, success: boolean) => {
    if (!success) return 'bg-red-50 border-red-200';
    
    switch (action) {
      case 'login':
        return 'bg-green-50 border-green-200';
      case 'project_update':
        return 'bg-blue-50 border-blue-200';
      case 'expense_create':
        return 'bg-yellow-50 border-yellow-200';
      case 'user_create':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return <Smartphone size={14} />;
    }
    return <Monitor size={14} />;
  };

  const actionTypes = Array.from(new Set(mockActivityLogs.map(log => log.action)));

  const exportActivity = () => {
    addToast('Activity log exported successfully', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="text-blue-600" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{filteredLogs.length}</div>
              <div className="text-sm text-muted-foreground">Total Activities</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserIcon className="text-green-600" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {filteredLogs.filter(log => log.action === 'login' && log.success).length}
              </div>
              <div className="text-sm text-muted-foreground">Successful Logins</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <UserIcon className="text-red-600" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {filteredLogs.filter(log => !log.success).length}
              </div>
              <div className="text-sm text-muted-foreground">Failed Attempts</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Globe className="text-yellow-600" size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {new Set(filteredLogs.map(log => log.ipAddress)).size}
              </div>
              <div className="text-sm text-muted-foreground">Unique IPs</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-muted-foreground" />
            <select
              value={filters.userId}
              onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
              className="border border-border rounded px-3 py-1 text-sm"
            >
              <option value="all">All Users</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={filters.action}
              onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
              className="border border-border rounded px-3 py-1 text-sm"
            >
              <option value="all">All Actions</option>
              {actionTypes.map(action => (
                <option key={action} value={action}>
                  {action.replace('_', ' ').charAt(0).toUpperCase() + action.replace('_', ' ').slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-muted-foreground" />
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="border border-border rounded px-3 py-1 text-sm"
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Search size={16} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Search activity..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="border border-border rounded px-3 py-1 text-sm w-64"
            />
          </div>
          
          <Button variant="outline" size="sm" onClick={exportActivity}>
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </Card>

      {/* Activity Log */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Activity Log</h3>
        
        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Activity size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No activity found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters to see more activity
              </p>
            </div>
          ) : (
            filteredLogs.map(log => (
              <div key={log.id} className={`border rounded-lg p-4 ${getActionColor(log.action, log.success)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-white rounded-lg border">
                      {getActionIcon(log.action)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium text-foreground">{log.userName}</h4>
                        <span className="text-sm text-muted-foreground">
                          {log.action.replace('_', ' ').charAt(0).toUpperCase() + log.action.replace('_', ' ').slice(1)}
                        </span>
                        {!log.success && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            Failed
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">{log.details}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{format(log.timestamp, 'MMM dd, yyyy HH:mm:ss')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe size={12} />
                          <span>{log.ipAddress}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getDeviceIcon(log.userAgent)}
                          <span>{log.userAgent}</span>
                        </div>
                        {log.location && (
                          <span>{log.location}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
