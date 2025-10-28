import React from 'react';

type StatusType = 
  | 'in_progress' 
  | 'planning' 
  | 'completed' 
  | 'on_hold' 
  | 'cancelled'
  | 'approved'
  | 'pending'
  | 'active'
  | 'inactive';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  label,
  size = 'md' 
}) => {
  const statusConfig = {
    in_progress: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      label: 'In Progress',
    },
    planning: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      label: 'Planning',
    },
    completed: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      label: 'Completed',
    },
    on_hold: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      label: 'On Hold',
    },
    cancelled: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      label: 'Cancelled',
    },
    approved: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      label: 'Approved',
    },
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      label: 'Pending',
    },
    active: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      label: 'Active',
    },
    inactive: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      label: 'Inactive',
    },
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const config = statusConfig[status];
  const displayLabel = label || config.label;

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.bg} ${config.text} ${sizeClasses[size]}`}
    >
      {displayLabel}
    </span>
  );
};

