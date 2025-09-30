import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { User, TenantSummary, SystemHealth, PlatformMetricsResponse, CompanyAccessSummary } from '../../types';
import { api } from '../../services/mockApi';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { InviteCompanyModal } from '../modals/InviteCompanyModal';
import { useAuth } from '../../contexts/AuthContext';

interface PrincipalAdminDashboardProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  selectedTenantName?: string | null;
}

// Helper functions for improved status display
const getStatusStyles = (status?: string): string => {
  switch (status?.toLowerCase()) {
    case 'suspended':
    case 'inactive':
      return 'bg-red-100 text-red-700';
    case 'pending':
    case 'trial':
      return 'bg-yellow-100 text-yellow-700';
    case 'active':
    case 'verified':
      return 'bg-emerald-100 text-emerald-700';
    case 'premium':
    case 'enterprise':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-emerald-100 text-emerald-700';
  }
};

const getStatusDisplay = (status?: string): string => {
  if (!status) return 'Active';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const KpiCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({
  title,
  value,
  icon,
}) => (
  <Card className="flex items-center gap-4">
    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
      {icon}
    </div>
    <div>
      <h3 className="text-sm font-semibold text-slate-600">{title}</h3>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </div>
  </Card>
);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: value >= 1_000_000 ? 0 : 1,
  }).format(value || 0);

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(value || 0);

const SystemHealthIndicator: React.FC<{ health: SystemHealth }> = ({ health }) => {
  const statusStyles = {
    OK: {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
      text: 'text-green-700',
      bg: 'bg-green-50',
    },
    DEGRADED: {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
      text: 'text-yellow-700',
      bg: 'bg-yellow-50',
    },
    DOWN: {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      ),
      text: 'text-red-700',
      bg: 'bg-red-50',
    },
  } as const;

  const style = statusStyles[health.status];

  return (
    <div className={`flex items-center gap-4 rounded-lg p-4 ${style.bg}`}>
      {style.icon}
      <div>
        <p className={`font-semibold ${style.text}`}>System {health.status}</p>
        <p className={`text-sm ${style.text}`}>{health.message}</p>
      </div>
    </div>
  );
};

export const PrincipalAdminDashboard: React.FC<PrincipalAdminDashboardProps> = ({ user, addToast, selectedTenantName }) => {
  const [tenantDirectory, setTenantDirectory] = useState<TenantSummary[]>([]);
  const [directorySource, setDirectorySource] = useState<'backend' | 'mock'>('mock');
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetricsResponse | null>(null);
  const [directoryGeneratedAt, setDirectoryGeneratedAt] = useState<string | null>(null);
  const [metricsGeneratedAt, setMetricsGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [systemHealth] = useState<SystemHealth>({ status: 'OK', message: 'All systems are operational.' });
  const abortControllerRef = useRef<AbortController | null>(null);
  const { availableCompanies, activeCompanyId, company: activeCompany, switchCompany, refreshTenants } = useAuth();
  const [switchingTenantId, setSwitchingTenantId] = useState<string | null>(null);
  const [refreshingTenants, setRefreshingTenants] = useState(false);

  const fetchData = useCallback(async () => {
    const controller = new AbortController();
    abortControllerRef.current?.abort();
    abortControllerRef.current = controller;

    setLoading(true);
    try {
      const [directoryResponse, metricsResponse] = await Promise.all([
        api.getTenantDirectory({ signal: controller.signal }),
        api.getPlatformMetrics({ signal: controller.signal }),
      ]);

      if (controller.signal.aborted) return;

      setTenantDirectory(directoryResponse.tenants);
      setDirectorySource(directoryResponse.source);
      setDirectoryGeneratedAt(directoryResponse.generatedAt);
      setPlatformMetrics(metricsResponse);
      setMetricsGeneratedAt(metricsResponse.generatedAt);
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error('Failed to load platform data:', error);
      addToast('Failed to load platform data.', 'error');
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [addToast]);

  useEffect(() => {
    fetchData();
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchData]);

  const handleInvite = async (companyName: string, adminEmail: string) => {
    addToast(`Invitation sent to ${adminEmail} for ${companyName}.`, 'success');
    await fetchData();
  };

  const metrics = platformMetrics?.metrics ?? [];
  const platformOwner = platformMetrics?.platformOwner ?? null;
  const metricsSource = platformMetrics?.source ?? directorySource;
  const directoryGeneratedLabel = directoryGeneratedAt
    ? formatDistanceToNow(new Date(directoryGeneratedAt), { addSuffix: true })
    : null;
  const metricsGeneratedLabel = metricsGeneratedAt
    ? formatDistanceToNow(new Date(metricsGeneratedAt), { addSuffix: true })
    : null;

  const totalTenants = tenantDirectory.length;
  const totalUsers = tenantDirectory.reduce((acc, tenant) => acc + tenant.totalUsers, 0);
  const activeProjects = tenantDirectory.reduce((acc, tenant) => acc + tenant.activeProjects, 0);
  const overdueInvoices = tenantDirectory.reduce((acc, tenant) => acc + tenant.overdueInvoices, 0);
  const totalRevenue = tenantDirectory.reduce((acc, tenant) => acc + tenant.totalRevenue, 0);
  const outstandingBalance = tenantDirectory.reduce((acc, tenant) => acc + tenant.outstandingBalance, 0);
  const collectedRevenue = tenantDirectory.reduce((acc, tenant) => acc + tenant.collectedRevenue, 0);

  const activeAccessSummary = useMemo(
    () => availableCompanies.find((summary) => summary.id === activeCompanyId) ?? null,
    [availableCompanies, activeCompanyId],
  );

  const membershipBreakdown = useMemo(
    () =>
      availableCompanies.reduce(
        (totals, summary) => {
          totals[summary.membershipType] = (totals[summary.membershipType] ?? 0) + 1;
          return totals;
        },
        { primary: 0, delegated: 0, platform: 0 } as Record<CompanyAccessSummary['membershipType'], number>,
      ),
    [availableCompanies],
  );

  const membershipLabel = (summary: CompanyAccessSummary) => {
    switch (summary.membershipType) {
      case 'platform':
        return 'Platform Control';
      case 'delegated':
        return 'Delegated Access';
      default:
        return 'Primary Workspace';
    }
  };

  const membershipBadgeClass = (summary: CompanyAccessSummary) => {
    switch (summary.membershipType) {
      case 'platform':
        return 'bg-indigo-100 text-indigo-700';
      case 'delegated':
        return 'bg-sky-100 text-sky-700';
      default:
        return 'bg-emerald-100 text-emerald-700';
    }
  };

  const statusBadgeClass = (summary: CompanyAccessSummary) =>
    summary.status?.toLowerCase().includes('suspend')
      ? 'bg-red-100 text-red-700'
      : 'bg-slate-200 text-slate-700';

  const handleCompanySwitch = async (summary: CompanyAccessSummary) => {
    if (summary.id === activeCompanyId) {
      return;
    }

    setSwitchingTenantId(summary.id);
    try {
      await switchCompany(summary.id);
      addToast(`Switched to ${summary.name}.`, 'success');
    } catch (error) {
      console.error('Failed to switch tenant', error);
      addToast('Unable to switch to the selected company.', 'error');
    } finally {
      setSwitchingTenantId(null);
    }
  };

  const handleRefreshTenants = async () => {
    setRefreshingTenants(true);
    try {
      await refreshTenants();
      addToast('Tenant directory refreshed.', 'success');
    } catch (error) {
      console.error('Failed to refresh tenant directory', error);
      addToast('Could not refresh tenant list.', 'error');
    } finally {
      setRefreshingTenants(false);
    }
  };

  const dataSourceChipClass =
    directorySource === 'backend'
      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
      : 'bg-slate-100 text-slate-600 border border-slate-200';

  const metricsSourceChipClass =
    metricsSource === 'backend'
      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
      : 'bg-amber-100 text-amber-700 border border-amber-200';

  if (loading) {
    return (
      <Card>
        <p>Loading Platform Dashboard...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {isInviteModalOpen && (
        <InviteCompanyModal onClose={() => setIsInviteModalOpen(false)} onInvite={handleInvite} />
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Platform Administration</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${dataSourceChipClass}`}
            >
              <span className="h-2 w-2 rounded-full bg-current" />
              {directorySource === 'backend' ? 'Live tenant data' : 'Local sandbox dataset'}
            </span>
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${metricsSourceChipClass}`}
            >
              <span className="h-2 w-2 rounded-full bg-current" />
              {metricsSource === 'backend' ? 'Live telemetry' : 'Simulated telemetry'}
            </span>
          </div>
          {directoryGeneratedLabel && (
            <p className="mt-2 text-xs text-muted-foreground">Last synced {directoryGeneratedLabel}</p>
          )}
          <p className="text-sm text-slate-600">
            Manage tenant accounts, monitor platform health, and keep an eye on adoption across the ecosystem.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            Refresh data
          </Button>
          <Button onClick={() => setIsInviteModalOpen(true)}>Invite New Company</Button>
        </div>
      </div>

      {selectedTenantName && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
          Spotlight tenant: <span className="font-semibold text-slate-900">{selectedTenantName}</span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total Companies"
          value={totalTenants}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 7l9-4 9 4-9 4-9-4z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 10l-9 4-9-4" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12v7l7 3 7-3v-7" />
            </svg>
          }
        />
        <KpiCard
          title="Users Across Tenants"
          value={formatNumber(totalUsers)}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
              />
              <circle cx="9" cy="7" r="4" strokeWidth={1.5} />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M23 20v-2a4 4 0 00-3-3.87"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 3.13A4 4 0 0119 7"
              />
            </svg>
          }
        />
        <KpiCard
          title="Live Invoice Volume"
          value={formatCurrency(totalRevenue)}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8c1.104 0 2-.672 2-1.5S13.104 5 12 5s-2 .672-2 1.5S10.896 8 12 8z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5 10h14M5 14h14M5 18h14"
              />
            </svg>
          }
        />
        <KpiCard
          title="Outstanding Balance"
          value={formatCurrency(outstandingBalance)}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Tenant roster</h3>
              <p className="text-sm text-slate-600">Live overview of each organisation and its commercial footprint.</p>
            </div>
            <div className="text-xs text-muted-foreground sm:text-right">
              <p>Source: {directorySource === 'backend' ? 'Live database' : 'Local mock data'}</p>
              {directoryGeneratedLabel && <p>Updated {directoryGeneratedLabel}</p>}
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Company</th>
                  <th className="px-4 py-3 text-left font-semibold">Industry</th>
                  <th className="px-4 py-3 text-left font-semibold">Plan</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Users</th>
                  <th className="px-4 py-3 text-right font-semibold">Active Projects</th>
                  <th className="px-4 py-3 text-right font-semibold">Revenue</th>
                  <th className="px-4 py-3 text-right font-semibold">Outstanding</th>
                  <th className="px-4 py-3 text-right font-semibold">Overdue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {tenantDirectory.map((tenant) => (
      <tr key={tenant.id} className="hover:bg-muted/50">
        <td className="px-4 py-3">
          <div className="font-semibold text-slate-900">{tenant.name}</div>
          <p className="text-xs text-slate-500">{tenant.subscriptionPlan}</p>
        </td>
        <td className="px-4 py-3 capitalize text-slate-700">
          {tenant.industry || '—'}
        </td>
        <td className="px-4 py-3 text-slate-700">{tenant.subscriptionPlan || 'FREE'}</td>
        <td className="px-4 py-3">
          <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${tenant.status?.toLowerCase().includes('suspend')
            ? 'bg-red-100 text-red-700'
            : 'bg-emerald-100 text-emerald-700'
          }`}
                      >
        {tenant.status || 'Active'}
      </span>
                    </td>
      <td className="px-4 py-3 text-right text-slate-700">{formatNumber(tenant.totalUsers)}</td>
      <td className="px-4 py-3 text-right text-slate-700">{formatNumber(tenant.activeProjects)}</td>
      <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(tenant.totalRevenue)}</td>
      <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(tenant.outstandingBalance)}</td>
      <td className="px-4 py-3 text-right text-slate-700">{formatNumber(tenant.overdueInvoices)}</td>
                  </tr >
                ))}
              </tbody >
            </table >
          </div >
{
  tenantDirectory.length === 0 && (
    <div className="py-8 text-center text-sm text-muted-foreground">
      No tenant companies found. Invite your first partner to get started.
    </div>
  )
}
        </Card >

  <div className="space-y-6">
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Tenant access control</h3>
          <p className="text-sm text-slate-600">
            Review which workspaces are available to this administrator and jump into any tenant in one click.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefreshTenants}
          isLoading={refreshingTenants}
          className="whitespace-nowrap"
        >
          Refresh access
        </Button>
      </div>

      <div className="mt-4 rounded-lg border border-dashed border-border p-4 text-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Active workspace</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-semibold text-slate-900">
              {activeAccessSummary?.name ?? activeCompany?.name ?? 'Unknown tenant'}
            </p>
            {activeAccessSummary && (
              <span
                className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${membershipBadgeClass(
                  activeAccessSummary,
                )}`}
              >
                {membershipLabel(activeAccessSummary)}
              </span>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
            <span>{user.email}</span>
            <span>{user.role.replace(/_/g, ' ')}</span>
          </div>
        </div>
      </div>

      {availableCompanies.length > 0 ? (
        <>
          <ul className="mt-4 space-y-2">
            {availableCompanies.map((summary) => (
              <li
                key={summary.id}
                className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">{summary.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${membershipBadgeClass(
                        summary,
                      )}`}
                    >
                      {membershipLabel(summary)}
                    </span>
                    <span>{summary.subscriptionPlan}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${statusBadgeClass(
                      summary,
                    )}`}
                  >
                    {summary.status}
                  </span>
                  <Button
                    variant={summary.id === activeCompanyId ? 'secondary' : 'primary'}
                    size="sm"
                    disabled={summary.id === activeCompanyId}
                    onClick={() => handleCompanySwitch(summary)}
                    isLoading={switchingTenantId === summary.id}
                  >
                    {summary.id === activeCompanyId ? 'Active' : 'Switch'}
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-3">
            <div className="rounded-lg border border-border/60 bg-card px-3 py-2 text-center">
              <p className="text-2xl font-semibold text-slate-900">{membershipBreakdown.platform}</p>
              <p>Platform</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-card px-3 py-2 text-center">
              <p className="text-2xl font-semibold text-slate-900">{membershipBreakdown.primary}</p>
              <p>Primary</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-card px-3 py-2 text-center">
              <p className="text-2xl font-semibold text-slate-900">{membershipBreakdown.delegated}</p>
              <p>Delegated</p>
            </div>
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Access to additional tenants will appear here once invitations have been accepted.
        </p>
      )}
    </Card>

    <Card>
      <h3 className="text-lg font-semibold text-slate-900">Platform health</h3>
      <p className="text-sm text-slate-600">
        Automated checks running every 5 minutes to spot emerging issues across the stack.
      </p>
      <div className="mt-4">
        <SystemHealthIndicator health={systemHealth} />
      </div>
    </Card>

    <Card>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Usage metrics</h3>
          <p className="text-sm text-slate-600">Key activity signals from the last 24 hours.</p>
        </div>
        <span className="rounded-full bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
          {metricsGeneratedLabel ? `Updated ${metricsGeneratedLabel}` : '—'}
        </span>
      </div>
      <ul className="mt-4 space-y-3 text-sm">
        {metrics.map((metric) => (
          <li key={metric.name} className="flex items-center justify-between border-b border-dashed border-border pb-2">
            <span className="font-medium text-slate-700">{metric.name}</span>
            <span className="text-slate-900">{`${metric.value} ${metric.unit}`}</span>
          </li>
        ))}
        {metrics.length === 0 && <li className="text-sm text-muted-foreground">No usage data available.</li>}
      </ul>
    </Card>

    <Card>
      <h3 className="text-lg font-semibold text-slate-900">Revenue pulse</h3>
      <p className="text-sm text-slate-600">Cash position across the tenant network.</p>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-slate-600">Collected year-to-date</dt>
          <dd className="font-semibold text-slate-900">{formatCurrency(collectedRevenue)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-slate-600">Outstanding receivables</dt>
          <dd className="font-semibold text-amber-600">{formatCurrency(outstandingBalance)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-slate-600">Invoices overdue</dt>
          <dd className="font-semibold text-red-600">{formatNumber(overdueInvoices)}</dd>
        </div>
      </dl>
    </Card>

    {platformOwner && (
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Platform owner</h3>
        <p className="text-sm text-slate-600">
          Superuser account with governance controls across every tenant.
        </p>
        <div className="mt-4 space-y-2 rounded-lg border border-dashed border-border p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Username</span>
            <span className="font-semibold text-slate-900">{platformOwner.username}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Email</span>
            <span className="font-semibold text-slate-900">{platformOwner.email}</span>
          </div>
          {platformOwner.name && (
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Name</span>
              <span className="font-semibold text-slate-900">{platformOwner.name}</span>
            </div>
          )}
        </div>
      </Card>
    )}
  </div>
      </div >
    </div >
  );
};
