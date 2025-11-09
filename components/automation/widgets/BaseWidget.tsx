import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';

export interface WidgetAction {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
}

export interface BaseWidgetProps {
    id: string;
    title: string;
    icon: React.ReactNode;
    collapsible?: boolean;
    expandable?: boolean;
    defaultCollapsed?: boolean;
    actions?: WidgetAction[];
    children: React.ReactNode;
    className?: string;
}

export const BaseWidget: React.FC<BaseWidgetProps> = ({
    id,
    title,
    icon,
    collapsible = true,
    expandable = false,
    defaultCollapsed = false,
    actions = [],
    children,
    className = ''
}) => {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            className={`widget-card bg-white border border-slate-200 rounded-xl shadow-sm transition-all duration-300 ${collapsed ? 'collapsed' : ''
                } ${expanded ? 'expanded col-span-full' : ''} ${className}`}
            data-widget-id={id}
        >
            <div className="widget-header flex items-center justify-between p-5 border-b border-slate-100">
                <div className="widget-title flex items-center gap-3">
                    <div className="widget-icon text-emerald-600">
                        {icon}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                </div>

                <div className="widget-actions flex items-center gap-2">
                    {actions.map((action, index) => (
                        <button
                            key={`${action.label}-${index}`}
                            onClick={action.onClick}
                            disabled={action.disabled}
                            className={`
                inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${action.variant === 'primary'
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                    : action.variant === 'danger'
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
                        >
                            {action.icon}
                            <span>{action.label}</span>
                        </button>
                    ))}

                    {expandable && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                            title={expanded ? 'Minimize' : 'Expand'}
                        >
                            {expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </button>
                    )}

                    {collapsible && (
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                            title={collapsed ? 'Expand' : 'Collapse'}
                        >
                            {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                        </button>
                    )}
                </div>
            </div>

            {!collapsed && (
                <div className="widget-content p-5">
                    {children}
                </div>
            )}
        </div>
    );
};
