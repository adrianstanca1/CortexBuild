import React, { useState, useEffect } from 'react';
import { Activity, Search, Filter, Calendar } from 'lucide-react';

interface ActivityLog {
  id: number;
  user_id: string;
  user_name: string;
  user_email: string;
  action: string;
  description: string;
  created_at: string;
}

export const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchActivityLogs();
  }, [page, filterAction]);

  const fetchActivityLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '20');
      if (filterAction) params.append('action', filterAction);

      const response = await fetch(`http://localhost:3001/api/admin/activity-logs?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setLogs(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeColor = (action: string) => {
    const colors: any = {
      'login': 'bg-green-100 text-green-800',
      'logout': 'bg-gray-100 text-gray-800',
      'create': 'bg-blue-100 text-blue-800',
      'update': 'bg-yellow-100 text-yellow-800',
      'delete': 'bg-red-100 text-red-800',
      'password_reset': 'bg-purple-100 text-purple-800',
      'bulk_action': 'bg-indigo-100 text-indigo-800',
      'notification_sent': 'bg-pink-100 text-pink-800'
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  const filteredLogs = logs.filter(log =>
    log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Activity Logs</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Activity className="w-4 h-4" />
          <span>{logs.length} activities</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Actions</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="password_reset">Password Reset</option>
            <option value="bulk_action">Bulk Action</option>
            <option value="notification_sent">Notification Sent</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {log.user_name || 'Unknown User'}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionBadgeColor(log.action)}`}>
                          {log.action}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{log.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>{log.user_email}</span>
                        <span>•</span>
                        <span>{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No activity logs found
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

