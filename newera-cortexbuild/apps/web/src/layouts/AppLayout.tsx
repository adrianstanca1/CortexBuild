import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/projects', label: 'Projects' },
  { to: '/rfis', label: 'RFIs' },
  { to: '/finance', label: 'Finance' },
  { to: '/automation', label: 'Automation Studio' }
];

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  return (
    <div className="layout">
      <aside>
        <Link to="/dashboard" className="logo">
          NewEra<span>OS</span>
        </Link>
        <nav>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="account">
          <p>{user?.fullName}</p>
          <button onClick={logout}>Sign out</button>
        </div>
      </aside>
      <main>{children}</main>
    </div>
  );
};
