import React from 'react';
import type { User, View } from '../../types';
import { Permission, Role } from '../../types';
import { hasPermission } from '../../services/auth';

export interface SidebarProps {
  user: User;
  activeView: View;
  setActiveView: (view: View) => void;
  onLogout: () => void;
  pendingTimesheetCount?: number;
  openIncidentCount?: number;
  unreadMessageCount?: number;
  companyName?: string;
  tenantOptions?: Array<{ id: string; name: string }>;
  activeTenantId?: string;
  onTenantChange?: (tenantId: string | null) => void;
}

interface NavItemProps {
  view: View;
  label: string;
  icon: React.ReactNode;
  activeView: View;
  setActiveView: (view: View) => void;
  badgeCount?: number;
}

const NavItem: React.FC<NavItemProps> = ({ view, label, icon, activeView, setActiveView, badgeCount }) => (
  <button
    type="button"
    onClick={() => setActiveView(view)}
    className={`w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
      activeView === view
        ? 'bg-primary text-primary-foreground font-semibold shadow'
        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
    }`}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span>{label}</span>
    </div>
    {badgeCount && badgeCount > 0 && (
      <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
        {badgeCount > 99 ? '99+' : badgeCount}
      </span>
    )}
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeView,
  setActiveView,
  onLogout,
  pendingTimesheetCount = 0,
  openIncidentCount = 0,
  unreadMessageCount = 0,
  companyName,
  tenantOptions,
  activeTenantId,
  onTenantChange,
}) => {
  if (!user) return null;

  const isPrincipal = user.role === Role.PRINCIPAL_ADMIN;

  const workspaceNav: NavItemProps[] = [];
  if (isPrincipal) {
    workspaceNav.push({
      view: 'principal-dashboard' as View,
      label: 'Platform overview',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7l9-4 9 4-9 4-9-4z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 10l-9 4-9-4" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12v7l7 3 7-3v-7" />
        </svg>
      ),
      activeView,
      setActiveView,
    });
  } else {
    workspaceNav.push({
      view: 'dashboard',
      label: 'Executive dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      activeView,
      setActiveView,
    });
  }

  workspaceNav.push({
    view: 'tools',
    label: 'AI copilots',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2" />
        <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
      </svg>
    ),
    activeView,
    setActiveView,
    badgeCount: unreadMessageCount,
  });

  if (hasPermission(user, Permission.VIEW_FINANCES) || hasPermission(user, Permission.MANAGE_FINANCES)) {
    workspaceNav.push({
      view: 'financials',
      label: 'Financial cockpit',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 3h18v2H3zM5 7h14v12H5zM9 9v8h2V9zm4 0v8h2V9z" />
        </svg>
      ),
      activeView,
      setActiveView,
    });
  }

  if (isPrincipal) {
    workspaceNav.push({
      view: 'audit-log',
      label: 'Audit log',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 7l5 5 5-5" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12l5 5 5-5" />
        </svg>
      ),
      activeView,
      setActiveView,
    });
  }

  const operationsNav: NavItemProps[] = [
    {
      view: 'timesheets',
      label: 'Timesheets',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5a2 2 0 012-2h2a2 2 0 012 2M9 13h6" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17h6" />
        </svg>
      ),
      activeView,
      setActiveView,
      badgeCount: pendingTimesheetCount,
    },
    {
      view: 'safety',
      label: 'Safety & incidents',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M5.071 19h13.858A2.071 2.071 0 0021 16.929V7.071A2.071 2.071 0 0018.929 5H5.071A2.071 2.071 0 003 7.071v9.858A2.071 2.071 0 005.071 19z" />
        </svg>
      ),
      activeView,
      setActiveView,
      badgeCount: openIncidentCount,
    },
    {
      view: 'clients',
      label: 'Clients',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" strokeWidth={1.5} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M23 20v-2a4 4 0 00-3-3.87" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 3.13A4 4 0 0119 7" />
        </svg>
      ),
      activeView,
      setActiveView,
    },
    {
      view: 'invoices',
      label: 'Billing & invoices',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h10M7 11h10M7 15h6" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5h14v14H5z" />
        </svg>
      ),
      activeView,
      setActiveView,
    },
    {
      view: 'settings',
      label: 'Settings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8a4 4 0 100 8 4 4 0 000-8z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4 12h2M18 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
          />
        </svg>
      ),
      activeView,
      setActiveView,
    },
  ];

  return (
    <aside className="flex h-full w-72 flex-col border-r border-border bg-card/80 p-4">
      <div className="mb-6 space-y-1 px-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Workspace focus</p>
        <h2 className="text-lg font-bold text-foreground">{companyName || 'AS Agents'}</h2>
        <p className="text-xs text-muted-foreground">{isPrincipal ? 'Platform owner' : Role[user.role].replace('_', ' ').toLowerCase()}</p>
        {tenantOptions && tenantOptions.length > 0 && (
          <div className="mt-3 space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tenant</label>
            <select
              value={activeTenantId ?? ''}
              onChange={event => onTenantChange?.(event.target.value || null)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {tenantOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {isPrincipal ? 'Platform control' : 'Workspace'}
          </p>
          {workspaceNav.map(item => (
            <NavItem key={item.view} {...item} />
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Operations</p>
          {operationsNav.map(item => (
            <NavItem key={item.view} {...item} />
          ))}
        </div>
      </nav>

      <div className="mt-6 space-y-3 rounded-lg border border-border bg-background/60 p-3 text-xs text-muted-foreground">
        <p>
          @{user.username || user.email.split('@')[0]} • {Role[user.role].toLowerCase().replace(/_/g, ' ')}
        </p>
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-md border border-red-200 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-500/20"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
