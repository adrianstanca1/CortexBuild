import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { User, AuditLog } from '../types';
import { api } from '../services/mockApi';
import { Card } from './ui/Card';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';

interface AuditLogViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
}

const formatDistanceToNow = (date: Date): string => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const intervals = [
    { label: 'y', seconds: 60 * 60 * 24 * 365 },
    { label: 'mo', seconds: 60 * 60 * 24 * 30 },
    { label: 'd', seconds: 60 * 60 * 24 },
    { label: 'h', seconds: 60 * 60 },
    { label: 'm', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count}${interval.label} ago`;
    }
  }

  return `${seconds}s ago`;
const downloadCsv = (data: Record<string, unknown>[], filename: string) => {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(','),
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
export const AuditLogView: React.FC<AuditLogViewProps> = ({ user, addToast }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<Map<string, User>>(new Map());
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    user: 'all',
    action: 'all',
    startDate: '',
    endDate: '',
  });
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    const controller = new AbortController();
    abortControllerRef.current?.abort();
    abortControllerRef.current = controller;

    setLoading(true);
    try {
      if (!user.companyId) return;
      const [logsData, usersData] = await Promise.all([
        api.getAuditLogsByCompany(user.companyId, { signal: controller.signal }),
        api.getUsersByCompany(user.companyId, { signal: controller.signal }),
      ]);
      if (controller.signal.aborted) return;
      setLogs(logsData);
      if (controller.signal.aborted) return;
      setUsers(new Map(usersData.map((entry) => [entry.id, entry])));
    } catch (error) {
      if (controller.signal.aborted) return;
      addToast('Failed to load audit logs.', 'error');
    } finally {
      if (controller.signal.aborted) return;
      setLoading(false);
    }
  }, [user.companyId, addToast]);

  useEffect(() => {
    fetchData();
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchData]);

  const uniqueActionTypes = useMemo(() => [...new Set(logs.map((log) => log.action))], [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const actorMatch = filters.user === 'all' || log.actorId === filters.user;
      const actionMatch = filters.action === 'all' || log.action === filters.action;
      const timestamp = new Date(log.timestamp);
      const startMatch = !filters.startDate || timestamp >= new Date(filters.startDate);
      const endMatch =
        !filters.endDate || timestamp <= new Date(new Date(filters.endDate).setHours(23, 59, 59, 999));
      return actorMatch && actionMatch && startMatch && endMatch;
    });
  }, [logs, filters]);

  const handleExport = () => {
    if (filteredLogs.length === 0) {
      addToast('No logs to export.', 'error');
      return;
    }

    const dataToExport = filteredLogs.map((log) => {
      const actor = users.get(log.actorId);
      return {
        timestamp: new Date(log.timestamp).toISOString(),
        actorId: log.actorId,
        actorName: actor ? `${actor.firstName} ${actor.lastName}` : 'Unknown',
        action: log.action,
        targetType: log.target?.type ?? '',
        targetId: log.target?.id ?? '',
        targetName: log.target?.name ?? '',
      };
    });

    const filename = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCsv(dataToExport, filename);
    addToast('Audit log exported successfully.', 'success');
  };

  const resetFilters = () => {
    setFilters({ user: 'all', action: 'all', startDate: '', endDate: '' });
  };

  if (loading) {
    return (
      <Card>
        <p>Loading audit logs...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Audit log</h2>
          <p className="text-sm text-slate-600">
            Review every critical action across the platform with actor attribution and context.
          </p>
        </div>
        <Button onClick={handleExport} variant="secondary" disabled={filteredLogs.length === 0}>
          <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 10l5 5 5-5m-5 5V4" />
          </svg>
          Export CSV
        </Button>
      </div>

      <Card>
        <div className="grid grid-cols-1 gap-3 pb-4 md:grid-cols-2 lg:grid-cols-4 lg:items-end">
          <label className="text-sm">
            <span className="text-xs font-medium text-muted-foreground">User</span>
            <select
              value={filters.user}
              onChange={(event) => setFilters((current) => ({ ...current, user: event.target.value }))}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">All users</option>
              {Array.from(users.values()).map((actor) => (
                <option key={actor.id} value={actor.id}>
                  {actor.firstName} {actor.lastName}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="text-xs font-medium text-muted-foreground">Action</span>
            <select
              value={filters.action}
              onChange={(event) => setFilters((current) => ({ ...current, action: event.target.value }))}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">All actions</option>
              {uniqueActionTypes.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="text-xs font-medium text-muted-foreground">Start date</span>
            <input
              type="date"
              value={filters.startDate}
              onChange={(event) => setFilters((current) => ({ ...current, startDate: event.target.value }))}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>

          <label className="text-sm">
            <span className="text-xs font-medium text-muted-foreground">End date</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(event) => setFilters((current) => ({ ...current, endDate: event.target.value }))}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>

          <div className="md:col-span-2 lg:col-span-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              disabled={
                filters.user === 'all' &&
                filters.action === 'all' &&
                filters.startDate === '' &&
                filters.endDate === ''
              }
            >
              Reset filters
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          {filteredLogs.length > 0 ? (
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Actor</th>
                  <th className="px-4 py-3 text-left font-semibold">Action</th>
                  <th className="px-4 py-3 text-left font-semibold">Target</th>
                  <th className="px-4 py-3 text-left font-semibold">Timestamp</th>
                  <th className="px-4 py-3 text-left font-semibold">Age</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {filteredLogs.map((log) => {
                  const actor = users.get(log.actorId);
                  const eventDate = new Date(log.timestamp);
                  return (
                    <tr key={log.id} className="hover:bg-muted/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={actor ? `${actor.firstName} ${actor.lastName}` : 'Unknown user'}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium text-slate-900">
                              {actor ? `${actor.firstName} ${actor.lastName}` : 'Unknown user'}
                            </p>
                            <p className="text-xs text-muted-foreground">ID: {log.actorId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{log.action}</p>
                        {log.metadata && (
                          <p className="text-xs text-muted-foreground">{JSON.stringify(log.metadata)}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{log.target?.name ?? '—'}</p>
                        <p className="text-xs text-muted-foreground">{log.target?.type ?? 'No target'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">
                          {eventDate.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                        <p className="text-xs text-muted-foreground">UTC: {eventDate.toISOString()}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{formatDistanceToNow(eventDate)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-sm text-muted-foreground">
              <p>No audit activity matches your filters.</p>
              <Button variant="secondary" size="sm" onClick={resetFilters}>
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
