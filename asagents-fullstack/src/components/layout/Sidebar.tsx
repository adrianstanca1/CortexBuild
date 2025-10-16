'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User } from '@/types';
import { cn, getInitials } from '@/lib/utils';
import {
  HomeIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  UsersIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  BanknotesIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  FolderIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  user: User;
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, href: '/dashboard' },
  { id: 'clients', label: 'Clients', icon: BuildingOfficeIcon, href: '/dashboard/clients' },
  { id: 'projects', label: 'Projects', icon: ClipboardDocumentListIcon, href: '/dashboard/projects' },
  { id: 'tasks', label: 'Tasks', icon: CheckCircleIcon, href: '/dashboard/tasks' },
  { id: 'team', label: 'Team', icon: UsersIcon, href: '/dashboard/team' },
  { id: 'financials', label: 'Financials', icon: CurrencyDollarIcon, href: '/dashboard/financials' },
  { id: 'invoices', label: 'Invoices', icon: DocumentTextIcon, href: '/dashboard/invoices' },
  { id: 'expenses', label: 'Expenses', icon: BanknotesIcon, href: '/dashboard/expenses' },
  { id: 'equipment', label: 'Equipment', icon: WrenchScrewdriverIcon, href: '/dashboard/equipment' },
  { id: 'safety', label: 'Safety', icon: ShieldCheckIcon, href: '/dashboard/safety' },
  { id: 'documents', label: 'Documents', icon: FolderIcon, href: '/dashboard/documents' },
  { id: 'reports', label: 'Reports', icon: ChartBarIcon, href: '/dashboard/reports' },
  { id: 'chat', label: 'AI Chat', icon: ChatBubbleLeftRightIcon, href: '/dashboard/chat' },
  { id: 'settings', label: 'Settings', icon: CogIcon, href: '/dashboard/settings' },
];

export default function Sidebar({ user, isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        'bg-slate-800 text-white flex flex-col transition-all duration-300 ease-in-out',
        isOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo and Company */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="relative w-8 h-8 flex-shrink-0">
            <Image
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/1320206f2_logo.png"
              alt="ASAgents"
              fill
              className="object-contain rounded"
            />
          </div>
          {isOpen && (
            <div className="min-w-0">
              <h1 className="text-lg font-bold truncate">ASAgents</h1>
              <p className="text-xs text-slate-400 truncate">{user.company}</p>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      {isOpen && (
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-white">
                {getInitials(user.name)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-slate-400 capitalize truncate">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group',
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  )}
                  title={!isOpen ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {isOpen && (
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        {isOpen && (
          <div className="text-xs text-slate-400 text-center">
            <p className="font-medium">ASAgents v2.0</p>
            <p>Construction Management</p>
          </div>
        )}
      </div>
    </div>
  );
}
