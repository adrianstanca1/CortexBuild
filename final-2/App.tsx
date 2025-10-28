import React, { useEffect, useMemo, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { UserRegistration } from './components/UserRegistration';
import { Card } from './components/ui/Card';
import { Sidebar as SidebarLite } from './components/layout/SidebarLite';
import { ToolsView } from './components/ToolsView';
import { FinancialsViewLite } from './components/FinancialsViewLite';
import { Dashboard } from './components/Dashboard';
import { PrincipalAdminDashboard } from './components/PrincipalAdminDashboard';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import type { View } from './types';
import { Role, type Company } from './types';
import { api } from './services/mockApi';

const AppInner: React.FC = () => {
  const { user, company, logout } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [tenantOptions, setTenantOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [activeTenantId, setActiveTenantId] = useState<string | null>(null);
  const [tenantsLoading, setTenantsLoading] = useState(false);

  const addToast = (message: string, type: 'success' | 'error') => {
    if (type === 'error') console.error(message);
    else console.log(message);
  };

  useEffect(() => {
    if (!user) {
      setTenantOptions([]);
      setActiveTenantId(null);
      return;
    }

    if (user.role === Role.PRINCIPAL_ADMIN && activeView === 'dashboard') {
      setActiveView('principal-dashboard');
    }

    if (user.role !== Role.PRINCIPAL_ADMIN && activeView === 'principal-dashboard') {
      setActiveView('dashboard');
    }
  }, [user, activeView]);

  useEffect(() => {
    if (!user) return;

    if (user.role === Role.PRINCIPAL_ADMIN) {
      let isMounted = true;
      const controller = new AbortController();
      setTenantsLoading(true);
      api
        .getCompanies({ signal: controller.signal })
        .then(companies => {
          if (!isMounted) return;
          const options = (companies as Company[])
            .filter(entry => entry.id)
            .map(entry => ({ id: entry.id!, name: entry.name || 'Unnamed company' }));
          setTenantOptions(options);
          setActiveTenantId(prev => {
            if (prev && options.some(option => option.id === prev)) {
              return prev;
            }
            const defaultTenant = options.find(option => option.id !== '0') ?? options[0];
            return defaultTenant ? defaultTenant.id : null;
          });
        })
        .catch(error => {
          if (!isMounted) return;
          console.error('[App] Failed to load tenant catalogue', error);
        })
        .finally(() => {
          if (!isMounted) return;
          setTenantsLoading(false);
        });
      return () => {
        isMounted = false;
        controller.abort();
      };
    }

    const option = user.companyId
      ? [{ id: user.companyId, name: company?.name || 'Workspace' }]
      : [];
    setTenantOptions(option);
    setActiveTenantId(user.companyId ?? null);
    setTenantsLoading(false);
  }, [user, company]);

  const selectedTenantName = useMemo(() => {
    if (!activeTenantId) return company?.name || 'Workspace';
    const match = tenantOptions.find(option => option.id === activeTenantId);
    return match?.name || company?.name || 'Workspace';
  }, [activeTenantId, tenantOptions, company]);

  if (!user) {
    if (mode === 'register') {
      return <UserRegistration onSwitchToLogin={() => setMode('login')} />;
    }

    if (mode === 'forgot') {
      return (
        <div className="min-h-screen grid place-items-center bg-background p-6">
          <Card className="w-full max-w-md space-y-4 p-6 text-center">
            <h2 className="text-lg font-semibold text-foreground">Password assistance</h2>
            <p className="text-sm text-muted-foreground">
              Reach out to platform support to reset credentials while we finalise the automated flow.
            </p>
            <ButtonRow>
              <button
                type="button"
                className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
                onClick={() => setMode('login')}
              >
                Back to login
              </button>
            </ButtonRow>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen grid place-items-center bg-background p-6">
        <div className="w-full max-w-md">
          <Card className="mb-6">
            <div className="p-4">
              <h1 className="text-xl font-bold">AS Agents CMS</h1>
              <p className="text-sm text-muted-foreground mt-1">Sign in to continue</p>
            </div>
          </Card>
          <Login
            onSwitchToRegister={() => setMode('register')}
            onSwitchToForgotPassword={() => setMode('forgot')}
          />
        </div>
      </div>
    );
  }

  const selectedTenantLabel = user.role === Role.PRINCIPAL_ADMIN ? selectedTenantName : company?.name;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex flex-col gap-2 border-b border-border bg-card/60 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 text-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-8 w-8 text-primary" aria-hidden>
            <path fill="currentColor" d="M12 2l9.196 5.31a1 1 0 01.5.866v10.648a1 1 0 01-.5.866L12 24l-9.196-4.31a1 1 0 01-.5-.866V8.176a1 1 0 01.5-.866L12 2z" opacity={0.12} />
            <path fill="currentColor" d="M12 4.5l-6.5 3.752v7.496L12 19.5l6.5-3.752V8.252L12 4.5zm0 1.732l5 2.886v5.764l-5 2.886-5-2.886V9.118l5-2.886z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">AS Agents Platform</p>
            <h1 className="text-lg font-bold text-foreground">
              {user.role === Role.PRINCIPAL_ADMIN ? 'Control Tower' : selectedTenantLabel || 'Workspace'}
            </h1>
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 text-sm text-foreground sm:flex-row sm:items-center sm:gap-4">
          {user.role === Role.PRINCIPAL_ADMIN && (
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-semibold uppercase tracking-wide">Tenant</span>
              <select
                value={activeTenantId ?? ''}
                onChange={event => setActiveTenantId(event.target.value || null)}
                className="rounded-md border border-border bg-background px-3 py-1 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {tenantOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              {tenantsLoading && <span className="text-[10px] text-muted-foreground">Refreshing…</span>}
            </label>
          )}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                @{user.username || user.email.split('@')[0]}
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-border px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-500/10"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <SidebarLite
          user={user}
          activeView={activeView}
          setActiveView={setActiveView}
          onLogout={logout}
          pendingTimesheetCount={0}
          openIncidentCount={0}
          unreadMessageCount={0}
          companyName={selectedTenantLabel}
          tenantOptions={user.role === Role.PRINCIPAL_ADMIN ? tenantOptions : undefined}
          activeTenantId={activeTenantId ?? undefined}
          onTenantChange={value => setActiveTenantId(value)}
        />
        <main className="flex-1 p-4 overflow-auto">
          <ErrorBoundary>
            {activeView === 'principal-dashboard' && user.role === Role.PRINCIPAL_ADMIN && (
              <PrincipalAdminDashboard user={user} addToast={addToast} selectedTenantName={selectedTenantName} />
            )}
            {activeView === 'dashboard' && user.role !== Role.PRINCIPAL_ADMIN && (
              <Dashboard
                user={user}
                addToast={addToast}
                activeView={activeView}
                setActiveView={setActiveView}
                onSelectProject={() => setActiveView('projects')}
              />
            )}
            {activeView === 'tools' && (
              <ToolsView user={user} addToast={addToast} setActiveView={setActiveView} />
            )}
            {activeView === 'financials' && (
              <FinancialsViewLite user={user} addToast={addToast} />
            )}
            {activeView !== 'tools' && activeView !== 'financials' && activeView !== 'dashboard' && activeView !== 'principal-dashboard' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-foreground">Coming soon</h2>
                <p className="text-sm text-muted-foreground mt-1">The "{activeView}" view will be restored next.</p>
              </Card>
            )}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

const ButtonRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center justify-center gap-2">{children}</div>
);

const App: React.FC = () => (
  <AuthProvider>
    <AppInner />
  </AuthProvider>
);

export default App;
