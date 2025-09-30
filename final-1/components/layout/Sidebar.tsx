import React from 'react';
import { User, View, Role, Permission } from '../../types';
import { hasPermission } from '../../services/auth';

interface SidebarProps {
  user: User | null;
  activeView: View;
  setActiveView: (view: View) => void;
  onLogout: () => void;
  pendingTimesheetCount: number;
  openIncidentCount: number;
  unreadMessageCount: number;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  view: View;
  activeView: View;
  setActiveView: (view: View) => void;
  badgeCount?: number;
}

interface NavSectionProps {
  title: string;
  children: React.ReactNode;
}

const NavSection: React.FC<NavSectionProps> = ({ title, children }) => (
  <div className="space-y-1">
    <h2 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h2>
    {children}
  </div>
);

const NavItem: React.FC<NavItemProps> = ({ icon, label, view, activeView, setActiveView, badgeCount }) => (
  <button
    onClick={() => setActiveView(view)}
    className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-md text-sm transition-colors ${
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
      <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
        {badgeCount > 99 ? '99+' : badgeCount}
      </span>
    )}
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ user, activeView, setActiveView, onLogout, pendingTimesheetCount, openIncidentCount, unreadMessageCount }) => {
  if (!user) return null;

  const dashboardView: View = user.role === Role.OPERATIVE ? 'my-day' : user.role === Role.FOREMAN ? 'foreman-dashboard' : 'dashboard';
  const dashboardLabel = user.role === Role.OPERATIVE ? 'My Day' : 'Dashboard';

  const renderNavItems = () => {
    if (user.role === Role.PRINCIPAL_ADMIN) {
      return (
        <NavItem
          view="principal-dashboard"
          label="Platform Dashboard"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          activeView={activeView}
          setActiveView={setActiveView}
        />
      );
    }

    const hasProjectsAccess = hasPermission(user, Permission.VIEW_ALL_PROJECTS) || hasPermission(user, Permission.VIEW_ASSIGNED_PROJECTS);
    const canViewAllTasks = hasPermission(user, Permission.VIEW_ALL_TASKS);
    const canUseChat = hasPermission(user, Permission.SEND_DIRECT_MESSAGE);
    const canSubmitTime = hasPermission(user, Permission.SUBMIT_TIMESHEET);
    const canManageTimesheets = hasPermission(user, Permission.VIEW_ALL_TIMESHEETS);
    const canViewDocuments = hasPermission(user, Permission.VIEW_DOCUMENTS);
    const canViewSafety = hasPermission(user, Permission.VIEW_SAFETY_REPORTS);
    const canAccessFinancials = hasPermission(user, Permission.VIEW_FINANCES) || hasPermission(user, Permission.MANAGE_FINANCES);
    const canAccessClients = hasPermission(user, Permission.MANAGE_FINANCES) || hasPermission(user, Permission.VIEW_ALL_PROJECTS);
    const canAccessInvoices = canAccessFinancials;
    const canManageTeam = hasPermission(user, Permission.VIEW_TEAM);
    const canManageEquipment = hasPermission(user, Permission.MANAGE_EQUIPMENT);
    const canAccessTools = hasPermission(user, Permission.ACCESS_ALL_TOOLS);
    const canAccessTemplates = hasPermission(user, Permission.MANAGE_PROJECT_TEMPLATES);
    const canAccessAuditLog = hasPermission(user, Permission.VIEW_AUDIT_LOG);

    const menuItems: React.ReactNode[] = [
      <NavItem
        key="dashboard"
        view={dashboardView}
        label={dashboardLabel}
        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
        activeView={activeView}
        setActiveView={setActiveView}
      />,
    ];

    if (canViewAllTasks) {
      menuItems.push(
        <NavItem
          key="all-tasks"
          view="all-tasks"
          label="All Tasks"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
          activeView={activeView}
          setActiveView={setActiveView}
        />,
      );
    }

    if (hasProjectsAccess) {
      menuItems.push(
        <NavItem
          key="projects"
          view="projects"
          label="Projects"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
          activeView={activeView}
          setActiveView={setActiveView}
        />,
      );
      menuItems.push(
        <NavItem
          key="map"
          view="map"
          label="Map View"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m0 13V7m0 0L9 4" /></svg>}
          activeView={activeView}
          setActiveView={setActiveView}
        />,
      );
    }

    if (canUseChat) {
      menuItems.push(
        <NavItem
          key="chat"
          view="chat"
          label="Chat"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
          badgeCount={unreadMessageCount}
          activeView={activeView}
          setActiveView={setActiveView}
        />,
      );
    }

    const operationsItems: React.ReactNode[] = [];
    if (canSubmitTime) {
      operationsItems.push(
        <NavItem
          key="time"
          view="time"
          label="Time Clock"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          activeView={activeView}
          setActiveView={setActiveView}
        />,
      );
    }
    if (canManageTimesheets) {
      operationsItems.push(
        <NavItem
          key="timesheets"
          view="timesheets"
          label="Timesheets"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
          badgeCount={pendingTimesheetCount}
          activeView={activeView}
          setActiveView={setActiveView}
        />,
      );
    }
    if (canViewDocuments) {
      operationsItems.push(
        <NavItem
          key="documents"
          view="documents"
          label="Documents"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          activeView={activeView}
          setActiveView={setActiveView}
        />,
      );
    }
    if (canViewSafety) {
      operationsItems.push(
        <NavItem
          key="safety"
          view="safety"
          label="Safety"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
          badgeCount={openIncidentCount}
          activeView={activeView}
          setActiveView={setActiveView}
        />,
      );
    }
    if (canAccessFinancials) {
      operationsItems.push(
        <NavItem
          key="financials"
          view="financials"
          label="Financials"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
          activeView={activeView}
          setActiveView={setActiveView}
        />,
      );
    }
    if (canAccessClients) {
      operationsItems.push(
        <NavItem
          key="clients"
          view="clients"
          label="Clients"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8a4 4 0 100-8 4 4 0 000 8zm0 0h8m-8 0H3m8-4V4a1 1 0 011-1h5m0 0l3 3m-3-3v3" /></svg>}
          activeView={activeView}
          setActiveView={setActiveView}
        />,
      );
    }
    if (canAccessInvoices) {
      operationsItems.push(
        <NavItem
          key="invoices"
          view="invoices"
          label="Invoices"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l2 2 4-4m4 5a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V17z" /></svg>}
          activeView={activeView}
          setActiveView={setActiveView}
        />,
      );
    }
    if (canManageTeam) {
      operationsItems.push(
        <NavItem
          key="users"
          view="users"
          label="Team"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
          activeView={activeView}
          setActiveView={setActiveView}
        />,
      );
    }
    if (canManageEquipment) {
      operationsItems.push(
        <NavItem
          key="equipment"
          view="equipment"
          label="Equipment"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>}
          activeView={activeView}
          setActiveView={setActiveView}
        />,
      );
    }

    const toolsItems: React.ReactNode[] = [];
    if (canAccessTools) {
      toolsItems.push(
        <NavItem
          key="tools"
          view="tools"
          label="Tools"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          activeView={activeView}
          setActiveView={setActiveView}
        />,
      );
    }
    if (canAccessTemplates) {
      toolsItems.push(
        <NavItem
          key="templates"
          view="templates"
          label="Templates"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>}
          activeView={activeView}
          setActiveView={setActiveView}
        />,
      );
    }
    if (canAccessAuditLog) {
      toolsItems.push(
        <NavItem
          key="audit-log"
          view="audit-log"
          label="Audit Log"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          activeView={activeView}
          setActiveView={setActiveView}
        />,
      );
    }

    return (
      <>
        {menuItems.length > 0 && (
          <NavSection title="Menu">
            {menuItems}
          </NavSection>
        )}
        {operationsItems.length > 0 && (
          <NavSection title="Operations">
            {operationsItems}
          </NavSection>
        )}
        {toolsItems.length > 0 && (
          <NavSection title="Tools & Admin">
            {toolsItems}
          </NavSection>
        )}
      </>
    );
  };

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col flex-shrink-0 h-full p-4">
      <div className="flex items-center gap-2 mb-6 px-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-8 h-8 text-primary">
          <path fill="currentColor" d="M12 2L2 22h20L12 2z" />
        </svg>
        <h1 className="text-xl font-bold text-foreground">AS Agents</h1>
      </div>
      {/* All navigation items are conditionally rendered based on user permissions */}
      <nav className="flex flex-col flex-grow space-y-4">
        {renderNavItems()}
      </nav>
      <div className="mt-auto">
        <NavItem
          view="settings"
          label="Settings"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          activeView={activeView}
          setActiveView={setActiveView}
        />
      </div>
    </aside>
  );
};
