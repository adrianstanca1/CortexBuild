import React from 'react';
import type { User, View } from '../../types';

export interface SidebarProps {
  user: User;
  activeView: View;
  setActiveView: (view: View) => void;
  onLogout: () => void;
  pendingTimesheetCount?: number;
  openIncidentCount?: number;
  unreadMessageCount?: number;
  companyName?: string;
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
    onClick={() => setActiveView(view)}
    className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
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

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeView,
  setActiveView,
  onLogout,
  pendingTimesheetCount = 0,
  openIncidentCount = 0,
  unreadMessageCount = 0,
  companyName,
}) => {
  if (!user) return null;

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col flex-shrink-0 h-full p-4">
      <div className="flex items-center gap-2 mb-6 px-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-8 h-8 text-primary">
          <path fill="currentColor" d="M12 2L2 22h20L12 2z" />
        </svg>
        <div>
          <h1 className="text-xl font-bold text-foreground">AS Agents</h1>
          {companyName && <p className="text-xs text-muted-foreground">{companyName}</p>}
        </div>
      </div>

      <nav className="flex flex-col gap-2">
        <NavItem
          view="dashboard"
          label="Dashboard"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
          activeView={activeView}
          setActiveView={setActiveView}
        />
        <NavItem
          view="tools"
          label="Tools"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          activeView={activeView}
          setActiveView={setActiveView}
          badgeCount={unreadMessageCount}
        />
        <NavItem
          view="timesheets"
          label="Timesheets"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
          activeView={activeView}
          setActiveView={setActiveView}
          badgeCount={pendingTimesheetCount}
        />
        <NavItem
          view="safety"
          label="Safety"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
          activeView={activeView}
          setActiveView={setActiveView}
          badgeCount={openIncidentCount}
        />
        <div className="mt-4 border-t border-border pt-4">
          <NavItem
            view="settings"
            label="Settings"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            activeView={activeView}
            setActiveView={setActiveView}
          />
        </div>
      </nav>

      <div className="mt-6">
        <button
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200/70 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-500/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7l-5 5 5 5M4 12h11" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

