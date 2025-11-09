import React, { useState } from 'react';
import { BaseWidget, WidgetAction } from './BaseWidget';
import {
  Smartphone,
  Plus,
  Eye,
  Download,
  Share2,
  Grid,
  List,
  FileText,
  BarChart,
  Map,
  Camera,
  Image as ImageIcon,
  Square,
  Type,
  CheckSquare,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

interface MobileApp {
  id: string;
  name: string;
  description: string;
  screens: number;
  status: 'draft' | 'published' | 'testing';
  lastModified: Date;
  icon: string;
}

interface ComponentType {
  id: string;
  icon: React.ReactNode;
  label: string;
  category: 'layout' | 'input' | 'display' | 'media';
}

export const MobileAppBuilderWidget: React.FC = () => {
  const [apps, setApps] = useState<MobileApp[]>([
    {
      id: 'app-1',
      name: 'Field Inspector',
      description: 'Site inspection and safety checklist app',
      screens: 5,
      status: 'published',
      lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      icon: '🔍'
    },
    {
      id: 'app-2',
      name: 'Time Tracker',
      description: 'Employee time and attendance tracking',
      screens: 3,
      status: 'published',
      lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      icon: '⏱️'
    },
    {
      id: 'app-3',
      name: 'Equipment Log',
      description: 'Track equipment usage and maintenance',
      screens: 2,
      status: 'draft',
      lastModified: new Date(Date.now() - 1 * 60 * 60 * 1000),
      icon: '🚜'
    }
  ]);

  const [showBuilder, setShowBuilder] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedApp, setSelectedApp] = useState<MobileApp | null>(null);

  // Component palette
  const components: ComponentType[] = [
    // Layout
    { id: 'container', icon: <Square size={16} />, label: 'Container', category: 'layout' },
    { id: 'list', icon: <List size={16} />, label: 'List', category: 'layout' },
    { id: 'grid', icon: <Grid size={16} />, label: 'Grid', category: 'layout' },
    
    // Input
    { id: 'text-input', icon: <Type size={16} />, label: 'Text Input', category: 'input' },
    { id: 'checkbox', icon: <CheckSquare size={16} />, label: 'Checkbox', category: 'input' },
    { id: 'date-picker', icon: <Calendar size={16} />, label: 'Date Picker', category: 'input' },
    
    // Display
    { id: 'text', icon: <FileText size={16} />, label: 'Text', category: 'display' },
    { id: 'card', icon: <Square size={16} />, label: 'Card', category: 'display' },
    { id: 'chart', icon: <BarChart size={16} />, label: 'Chart', category: 'display' },
    
    // Media
    { id: 'image', icon: <ImageIcon size={16} />, label: 'Image', category: 'media' },
    { id: 'camera', icon: <Camera size={16} />, label: 'Camera', category: 'media' },
    { id: 'map', icon: <Map size={16} />, label: 'Map', category: 'media' }
  ];

  const handleCreateApp = () => {
    setShowBuilder(true);
    toast.success('Opening app builder...');
  };

  const handlePreviewApp = (app: MobileApp) => {
    setSelectedApp(app);
    setShowPreview(true);
  };

  const handlePublishApp = (app: MobileApp) => {
    setApps(prev => prev.map(a => 
      a.id === app.id ? { ...a, status: 'published' as const } : a
    ));
    toast.success(`${app.name} published as PWA!`);
  };

  const handleDownloadQR = (app: MobileApp) => {
    toast.success(`QR code for ${app.name} generated!`);
  };

  const actions: WidgetAction[] = [
    {
      icon: <Plus size={16} />,
      label: 'New App',
      onClick: handleCreateApp,
      variant: 'primary'
    }
  ];

  const getStatusBadge = (status: MobileApp['status']) => {
    const styles = {
      published: 'bg-green-100 text-green-700',
      testing: 'bg-yellow-100 text-yellow-700',
      draft: 'bg-slate-100 text-slate-600'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <>
      <BaseWidget
        id="mobile-app-builder"
        title="Mobile App Builder"
        icon={<Smartphone size={20} />}
        collapsible={true}
        expandable={true}
        defaultCollapsed={false}
        actions={actions}
        className="mobile-app-builder-widget"
      >
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Smartphone className="text-blue-600" size={18} />
                <span className="text-sm font-medium text-slate-600">Total Apps</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{apps.length}</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckSquare className="text-green-600" size={18} />
                <span className="text-sm font-medium text-slate-600">Published</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {apps.filter(a => a.status === 'published').length}
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Grid className="text-purple-600" size={18} />
                <span className="text-sm font-medium text-slate-600">Total Screens</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {apps.reduce((sum, a) => sum + a.screens, 0)}
              </div>
            </div>
          </div>

          {/* Apps List */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700">Your Mobile Apps</h4>
            
            {apps.map(app => (
              <div
                key={app.id}
                className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{app.icon}</div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold text-slate-900">{app.name}</h5>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{app.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>{app.screens} screens</span>
                      <span>•</span>
                      <span>Modified {formatDate(app.lastModified)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handlePreviewApp(app)}
                    className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye size={14} />
                    Preview
                  </button>
                  
                  {app.status === 'draft' && (
                    <button
                      onClick={() => handlePublishApp(app)}
                      className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Share2 size={14} />
                      Publish
                    </button>
                  )}
                  
                  {app.status === 'published' && (
                    <button
                      onClick={() => handleDownloadQR(app)}
                      className="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download size={14} />
                      QR Code
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Start */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone className="text-blue-600" size={18} />
              <h4 className="text-sm font-semibold text-slate-900">App Templates</h4>
            </div>
            <p className="text-sm text-slate-600 mb-3">
              Start with ready-made templates for common use cases
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button className="px-3 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-blue-50 transition-colors text-left">
                📋 Daily Report Form
              </button>
              <button className="px-3 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-blue-50 transition-colors text-left">
                ✅ Safety Checklist
              </button>
              <button className="px-3 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-blue-50 transition-colors text-left">
                📸 Photo Documentation
              </button>
              <button className="px-3 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 hover:bg-blue-50 transition-colors text-left">
                📍 Location Tracker
              </button>
            </div>
          </div>
        </div>
      </BaseWidget>

      {/* App Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[80vh] flex">
            {/* Component Palette */}
            <div className="w-64 border-r border-slate-200 overflow-y-auto p-4 bg-slate-50">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Components</h4>
              
              {['layout', 'input', 'display', 'media'].map(category => {
                const categoryComponents = components.filter(c => c.category === category);
                return (
                  <div key={category} className="mb-4">
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-2">
                      {category}
                    </div>
                    <div className="space-y-1">
                      {categoryComponents.map(comp => (
                        <button
                          key={comp.id}
                          className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        >
                          {comp.icon}
                          <span>{comp.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Canvas + Preview */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Mobile App Builder</h3>
                  <p className="text-sm text-slate-600">Drag components to build your app</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors">
                    Save Draft
                  </button>
                  <button 
                    onClick={() => setShowBuilder(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>

              {/* Phone Preview */}
              <div className="flex-1 flex items-center justify-center bg-slate-100 p-8">
                <div className="relative">
                  {/* Phone Frame */}
                  <div className="w-80 h-[600px] bg-slate-900 rounded-[3rem] shadow-2xl p-3">
                    <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                      {/* Status Bar */}
                      <div className="h-12 bg-slate-100 flex items-center justify-between px-6 text-xs font-medium text-slate-600">
                        <span>9:41</span>
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-3 border border-slate-400 rounded-sm" />
                          <div className="w-4 h-3 bg-slate-400 rounded-sm" />
                          <div className="w-4 h-3 bg-slate-400 rounded-sm" />
                        </div>
                      </div>

                      {/* App Content */}
                      <div className="p-4 h-[calc(100%-3rem)] overflow-y-auto">
                        <div className="text-center py-12">
                          <Smartphone className="mx-auto mb-4 text-slate-300" size={48} />
                          <p className="text-slate-500 text-sm">
                            Drag components here
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 relative">
            <button
              onClick={() => {
                setShowPreview(false);
                setSelectedApp(null);
              }}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="Close Preview"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="text-4xl mb-2">{selectedApp.icon}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">{selectedApp.name}</h3>
              <p className="text-sm text-slate-600">{selectedApp.description}</p>
            </div>

            {/* Phone Preview */}
            <div className="w-80 h-[600px] bg-slate-900 rounded-[3rem] shadow-2xl p-3 mx-auto">
              <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                <div className="h-12 bg-emerald-600 flex items-center justify-center text-white font-semibold">
                  {selectedApp.name}
                </div>
                <div className="p-4">
                  <div className="text-center py-12 text-slate-500">
                    App content preview
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                Open in Browser
              </button>
              <button 
                onClick={() => handleDownloadQR(selectedApp)}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Get QR Code
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
