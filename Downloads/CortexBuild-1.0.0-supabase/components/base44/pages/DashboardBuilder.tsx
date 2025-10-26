import React, { useState, useEffect } from 'react';
import { Plus, Grid, Save, Eye, Edit, Trash2, Settings, BarChart3, Table, PieChart, Activity } from 'lucide-react';

interface Widget {
  id: number;
  widget_type: string;
  title: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  config: any;
  is_visible: boolean;
}

interface Dashboard {
  id: number;
  name: string;
  is_default: boolean;
  layout: string;
}

export const DashboardBuilder: React.FC = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [currentDashboard, setCurrentDashboard] = useState<Dashboard | null>(null);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<Widget | null>(null);

  useEffect(() => {
    fetchDashboards();
  }, []);

  useEffect(() => {
    if (currentDashboard) {
      fetchWidgets(currentDashboard.id);
    }
  }, [currentDashboard]);

  const fetchDashboards = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/widgets/dashboards', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setDashboards(data.data);
        if (data.data.length > 0) {
          setCurrentDashboard(data.data.find((d: Dashboard) => d.is_default) || data.data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboards:', error);
    }
  };

  const fetchWidgets = async (dashboardId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/widgets/dashboard/${dashboardId}/widgets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setWidgets(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch widgets:', error);
    }
  };

  const createDashboard = async () => {
    const name = prompt('Enter dashboard name:');
    if (!name) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/widgets/dashboards', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, layout: '[]' })
      });
      const data = await response.json();
      if (data.success) {
        fetchDashboards();
      }
    } catch (error) {
      console.error('Failed to create dashboard:', error);
    }
  };

  const addWidget = async (widgetType: string) => {
    if (!currentDashboard) return;

    const title = prompt(`Enter ${widgetType} widget title:`);
    if (!title) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/widgets/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dashboard_id: currentDashboard.id,
          widget_type: widgetType,
          title,
          config: '{}',
          position_x: 0,
          position_y: widgets.length * 2,
          width: 4,
          height: 2
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchWidgets(currentDashboard.id);
        setShowAddWidget(false);
      }
    } catch (error) {
      console.error('Failed to add widget:', error);
    }
  };

  const updateWidgetPosition = async (widgetId: number, x: number, y: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/widgets/${widgetId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ position_x: x, position_y: y })
      });
    } catch (error) {
      console.error('Failed to update widget position:', error);
    }
  };

  const deleteWidget = async (widgetId: number) => {
    if (!confirm('Delete this widget?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/widgets/${widgetId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (currentDashboard) {
        fetchWidgets(currentDashboard.id);
      }
    } catch (error) {
      console.error('Failed to delete widget:', error);
    }
  };

  const handleDragStart = (widget: Widget) => {
    setDraggedWidget(widget);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetX: number, targetY: number) => {
    e.preventDefault();
    if (draggedWidget) {
      updateWidgetPosition(draggedWidget.id, targetX, targetY);
      setDraggedWidget(null);
      if (currentDashboard) {
        fetchWidgets(currentDashboard.id);
      }
    }
  };

  const getWidgetIcon = (type: string) => {
    switch (type) {
      case 'chart': return <BarChart3 className="w-5 h-5" />;
      case 'table': return <Table className="w-5 h-5" />;
      case 'stats': return <Activity className="w-5 h-5" />;
      case 'pie': return <PieChart className="w-5 h-5" />;
      default: return <Grid className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Builder</h1>
            <p className="text-gray-600">Create and customize your perfect dashboard</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                editMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {editMode ? <><Save className="w-4 h-4 inline mr-2" />Save</> : <><Edit className="w-4 h-4 inline mr-2" />Edit</>}
            </button>
            <button
              onClick={createDashboard}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              New Dashboard
            </button>
          </div>
        </div>

        {/* Dashboard Selector */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Dashboard:</label>
            <select
              value={currentDashboard?.id || ''}
              onChange={(e) => {
                const dashboard = dashboards.find(d => d.id === parseInt(e.target.value));
                setCurrentDashboard(dashboard || null);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {dashboards.map(dashboard => (
                <option key={dashboard.id} value={dashboard.id}>
                  {dashboard.name} {dashboard.is_default ? '(Default)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Add Widget Panel */}
        {editMode && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Add Widget</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { type: 'stats', label: 'Stats Card', icon: Activity },
                { type: 'chart', label: 'Chart', icon: BarChart3 },
                { type: 'table', label: 'Data Table', icon: Table },
                { type: 'pie', label: 'Pie Chart', icon: PieChart }
              ].map(widget => (
                <button
                  key={widget.type}
                  onClick={() => addWidget(widget.type)}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <widget.icon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                  <p className="text-sm font-medium text-gray-700">{widget.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Widget Grid */}
        <div className="grid grid-cols-12 gap-4">
          {widgets.map(widget => (
            <div
              key={widget.id}
              draggable={editMode}
              onDragStart={() => handleDragStart(widget)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, widget.position_x, widget.position_y)}
              className={`bg-white rounded-lg shadow p-6 ${editMode ? 'cursor-move border-2 border-dashed border-blue-300' : ''}`}
              style={{
                gridColumn: `span ${widget.width}`,
                gridRow: `span ${widget.height}`
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {getWidgetIcon(widget.widget_type)}
                  <h3 className="font-semibold text-gray-900">{widget.title}</h3>
                </div>
                {editMode && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => deleteWidget(widget.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">Widget content will appear here</p>
                <p className="text-xs mt-1">Type: {widget.widget_type}</p>
              </div>
            </div>
          ))}
        </div>

        {widgets.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Grid className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No widgets yet</h3>
            <p className="text-gray-600 mb-4">Click "Edit" and add your first widget to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

