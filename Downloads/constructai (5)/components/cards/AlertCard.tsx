import React from 'react';

interface AlertCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  variant?: 'info' | 'warning' | 'success' | 'danger';
  onClick?: () => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  icon,
  title,
  description,
  variant = 'info',
  onClick,
}) => {
  const variantClasses = {
    info: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      titleText: 'text-blue-900',
      descText: 'text-blue-700',
    },
    warning: {
      bg: 'bg-yellow-50',
      iconBg: 'bg-yellow-100',
      iconText: 'text-yellow-600',
      titleText: 'text-yellow-900',
      descText: 'text-yellow-700',
    },
    success: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconText: 'text-green-600',
      titleText: 'text-green-900',
      descText: 'text-green-700',
    },
    danger: {
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconText: 'text-red-600',
      titleText: 'text-red-900',
      descText: 'text-red-700',
    },
  };

  const classes = variantClasses[variant];

  return (
    <div
      className={`p-4 rounded-lg ${classes.bg} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${classes.iconBg} ${classes.iconText} flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${classes.titleText} mb-1`}>{title}</p>
          <p className={`text-sm ${classes.descText}`}>{description}</p>
        </div>
      </div>
    </div>
  );
};

