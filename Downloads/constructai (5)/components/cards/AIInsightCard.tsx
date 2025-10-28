import React from 'react';
import { Card } from '../ui/Card';

interface AIInsightCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction?: () => void;
  variant?: 'info' | 'warning' | 'success' | 'danger';
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'info',
}) => {
  const variantClasses = {
    info: {
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    warning: {
      iconBg: 'bg-yellow-100',
      iconText: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    },
    success: {
      iconBg: 'bg-green-100',
      iconText: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700 text-white',
    },
    danger: {
      iconBg: 'bg-red-100',
      iconText: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700 text-white',
    },
  };

  const classes = variantClasses[variant];

  return (
    <Card padding="md">
      <div className="flex flex-col h-full">
        <div className="flex items-start gap-3 mb-3">
          <div className={`p-2 rounded-lg ${classes.iconBg} ${classes.iconText}`}>
            {icon}
          </div>
          <h4 className="text-lg font-semibold text-gray-900 flex-1">{title}</h4>
        </div>
        
        <p className="text-sm text-gray-600 mb-4 flex-1">{description}</p>
        
        <button
          type="button"
          onClick={onAction}
          className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${classes.button}`}
        >
          {actionLabel}
        </button>
      </div>
    </Card>
  );
};

