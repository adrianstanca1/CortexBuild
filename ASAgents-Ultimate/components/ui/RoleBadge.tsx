import React from 'react';
import { Role } from '../../types';

type RoleTone = 'sky' | 'emerald' | 'amber' | 'violet' | 'slate' | 'rose';

const roleToneMap: Record<Role, RoleTone> = {
  [Role.OWNER]: 'amber',
  [Role.ADMIN]: 'sky',
  [Role.PROJECT_MANAGER]: 'violet',
  [Role.FOREMAN]: 'emerald',
  [Role.OPERATIVE]: 'slate',
  [Role.CLIENT]: 'sky',
  [Role.PRINCIPAL_ADMIN]: 'rose',
};

const toneClasses: Record<RoleTone, string> = {
  sky: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-200 dark:border-sky-500/30',
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/30',
  amber: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/30',
  violet: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-200 dark:border-violet-500/30',
  slate: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-200 dark:border-slate-500/30',
  rose: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-500/30',
};

interface RoleBadgeProps {
  role: Role;
  className?: string;
}

const formatRole = (role: Role) => role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, char => char.toUpperCase());

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className = '' }) => {
  const tone = roleToneMap[role] ?? 'slate';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase ${toneClasses[tone]} ${className}`.trim()}
      aria-label={`User role ${formatRole(role)}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
      {formatRole(role)}
    </span>
  );
};
