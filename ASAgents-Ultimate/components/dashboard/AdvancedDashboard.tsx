import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, View, Project, Todo, Expense, SafetyIncident } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useRealTime, useRealTimeDashboard } from '../../hooks/useRealTime';
import { DashboardWidget } from './widgets/DashboardWidget';
import { MetricsGrid } from './widgets/MetricsGrid';
import { ChartWidget } from './widgets/ChartWidget';
import { ActivityFeed } from './widgets/ActivityFeed';
import { QuickActions } from './widgets/QuickActions';
import { PerformanceIndicators } from './widgets/PerformanceIndicators';
import { RealTimeStatus } from '../realtime/RealTimeStatus';

interface AdvancedDashboardProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  activeView: View;
  setActiveView: (view: View) => void;
  onSelectProject?: (project: Project) => void;
}

interface DashboardConfig {
  layout: 'grid' | 'masonry' | 'flex';
  theme: 'light' | 'dark' | 'auto';
  refreshInterval: number;
  widgets: WidgetConfig[];
  customizations: {
    showWelcome: boolean;
    showQuickActions: boolean;
    showActivityFeed: boolean;
    compactMode: boolean;
  };
}

interface WidgetConfig {
  id: string;
  type: 'metrics' | 'chart' | 'list' | 'activity' | 'custom';
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  position: { row: number; col: number; span?: number };
  config: any;
  visible: boolean;
  refreshInterval?: number;
}

interface DashboardMetrics {
  projects: {
    total: number;
    active: number;
    completed: number;
    overdue: number;
    budget: {
      total: number;
      spent: number;
      remaining: number;
    };
  };
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
    completionRate: number;
  };
  team: {
    total: number;
    active: number;
    utilization: number;
    productivity: number;
  };
  financial: {
    revenue: number;
    expenses: number;
    profit: number;
    burnRate: number;
  };
  performance: {
    systemHealth: number;
    responseTime: number;
    uptime: number;
    errorRate: number;
  };
}

const defaultDashboardConfig: DashboardConfig = {
  layout: 'grid',
  theme: 'auto',
  refreshInterval: 30000,
  customizations: {
    showWelcome: true,
    showQuickActions: true,
    showActivityFeed: true,
    compactMode: false,
  },
  widgets: [
    {
      id: 'welcome',
      type: 'custom',
      title: 'Welcome',
      size: 'full',
      position: { row: 0, col: 0, span: 4 },
      config: {},
      visible: true,
    },
    {
      id: 'metrics-overview',
      type: 'metrics',
      title: 'Key Metrics',
      size: 'large',
      position: { row: 1, col: 0, span: 4 },
      config: {},
      visible: true,
    },
    {
      id: 'project-chart',
      type: 'chart',
      title: 'Project Progress',
      size: 'medium',
      position: { row: 2, col: 0, span: 2 },
      config: { chartType: 'bar' },
      visible: true,
    },
    {
      id: 'activity-feed',
      type: 'activity',
      title: 'Recent Activity',
      size: 'medium',
      position: { row: 2, col: 2, span: 2 },
      config: { limit: 10 },
      visible: true,
    },
    {
      id: 'performance',
      type: 'metrics',
      title: 'Performance Indicators',
      size: 'large',
      position: { row: 3, col: 0, span: 4 },
      config: {},
      visible: true,
    },
  ],
};

export const AdvancedDashboard: React.FC<AdvancedDashboardProps> = ({
  user,
  addToast,
  activeView,
  setActiveView,
  onSelectProject,
}) => {
  const [config, setConfig] = useState<DashboardConfig>(defaultDashboardConfig);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Real-time dashboard data
  const { dashboardData, loading: realtimeLoading, refreshDashboard } = useRealTimeDashboard();
  const { isConnected } = useRealTime({ autoConnect: true });

  // Load dashboard configuration
  const loadDashboardConfig = useCallback(async () => {
    try {
      const savedConfig = localStorage.getItem(`dashboard-config-${user.id}`);
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error('Failed to load dashboard config:', error);
    }
  }, [user.id]);

  // Save dashboard configuration
  const saveDashboardConfig = useCallback((newConfig: DashboardConfig) => {
    try {
      localStorage.setItem(`dashboard-config-${user.id}`, JSON.stringify(newConfig));
      setConfig(newConfig);
    } catch (error) {
      console.error('Failed to save dashboard config:', error);
      addToast('Failed to save dashboard configuration', 'error');
    }
  }, [user.id, addToast]);

  // Load dashboard metrics
  const loadMetrics = useCallback(async () => {
    try {
      setLoading(true);
      
      // Simulate API call - replace with actual API
      const mockMetrics: DashboardMetrics = {
        projects: {
          total: 12,
          active: 8,
          completed: 4,
          overdue: 2,
          budget: {
            total: 500000,
            spent: 320000,
            remaining: 180000,
          },
        },
        tasks: {
          total: 156,
          completed: 89,
          inProgress: 45,
          overdue: 22,
          completionRate: 57.1,
        },
        team: {
          total: 24,
          active: 18,
          utilization: 78.5,
          productivity: 92.3,
        },
        financial: {
          revenue: 750000,
          expenses: 520000,
          profit: 230000,
          burnRate: 45000,
        },
        performance: {
          systemHealth: 98.5,
          responseTime: 245,
          uptime: 99.9,
          errorRate: 0.1,
        },
      };

      setMetrics(mockMetrics);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load metrics:', error);
      addToast('Failed to load dashboard metrics', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Initialize dashboard
  useEffect(() => {
    loadDashboardConfig();
    loadMetrics();
  }, [loadDashboardConfig, loadMetrics]);

  // Auto-refresh dashboard
  useEffect(() => {
    if (config.refreshInterval > 0) {
      const interval = setInterval(() => {
        loadMetrics();
        refreshDashboard();
      }, config.refreshInterval);

      return () => clearInterval(interval);
    }
  }, [config.refreshInterval, loadMetrics, refreshDashboard]);

  // Handle widget configuration changes
  const updateWidgetConfig = useCallback((widgetId: string, updates: Partial<WidgetConfig>) => {
    const newConfig = {
      ...config,
      widgets: config.widgets.map(widget =>
        widget.id === widgetId ? { ...widget, ...updates } : widget
      ),
    };
    saveDashboardConfig(newConfig);
  }, [config, saveDashboardConfig]);

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    setEditMode(!editMode);
  }, [editMode]);

  // Render widget based on type
  const renderWidget = useCallback((widget: WidgetConfig) => {
    if (!widget.visible) return null;

    const commonProps = {
      title: widget.title,
      size: widget.size,
      editMode,
      onConfigChange: (updates: any) => updateWidgetConfig(widget.id, { config: { ...widget.config, ...updates } }),
      onToggleVisibility: () => updateWidgetConfig(widget.id, { visible: !widget.visible }),
    };

    switch (widget.type) {
      case 'metrics':
        return (
          <MetricsGrid
            key={widget.id}
            {...commonProps}
            metrics={metrics}
            config={widget.config}
          />
        );
      case 'chart':
        return (
          <ChartWidget
            key={widget.id}
            {...commonProps}
            data={metrics}
            chartType={widget.config.chartType}
            config={widget.config}
          />
        );
      case 'activity':
        return (
          <ActivityFeed
            key={widget.id}
            {...commonProps}
            limit={widget.config.limit}
            config={widget.config}
          />
        );
      case 'custom':
        if (widget.id === 'welcome') {
          return (
            <Card key={widget.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Welcome back, {user.firstName}!
                  </h1>
                  <p className="text-muted-foreground">
                    Here's your comprehensive dashboard overview
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <RealTimeStatus />
                  <Button
                    variant={editMode ? 'primary' : 'outline'}
                    onClick={toggleEditMode}
                  >
                    {editMode ? 'Save Layout' : 'Customize'}
                  </Button>
                </div>
              </div>
              {config.customizations.showQuickActions && (
                <QuickActions
                  user={user}
                  onNavigate={setActiveView}
                  onSelectProject={onSelectProject}
                />
              )}
            </Card>
          );
        }
        break;
      default:
        return null;
    }
  }, [metrics, editMode, updateWidgetConfig, user, setActiveView, onSelectProject, config.customizations.showQuickActions, toggleEditMode]);

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Advanced Dashboard</h2>
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadMetrics();
              refreshDashboard();
            }}
            disabled={loading || realtimeLoading}
          >
            {loading || realtimeLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className={`grid gap-6 ${config.layout === 'grid' ? 'grid-cols-1 lg:grid-cols-4' : ''}`}>
        {config.widgets
          .filter(widget => widget.visible)
          .sort((a, b) => a.position.row - b.position.row || a.position.col - b.position.col)
          .map(renderWidget)}
      </div>

      {/* Performance Indicators */}
      {metrics && (
        <PerformanceIndicators
          metrics={metrics.performance}
          isConnected={isConnected}
          lastUpdate={lastUpdate}
        />
      )}
    </div>
  );
};
