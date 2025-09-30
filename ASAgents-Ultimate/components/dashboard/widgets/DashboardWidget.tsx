import React, { useState } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { MoreHorizontal, Settings, Eye, EyeOff, Maximize2, Minimize2 } from 'lucide-react';

interface DashboardWidgetProps {
  title: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'full';
  editMode?: boolean;
  loading?: boolean;
  error?: string;
  onConfigChange?: (config: any) => void;
  onToggleVisibility?: () => void;
  onResize?: (size: string) => void;
  className?: string;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  children,
  size = 'medium',
  editMode = false,
  loading = false,
  error,
  onConfigChange,
  onToggleVisibility,
  onResize,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-2',
    large: 'col-span-3',
    full: 'col-span-4',
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (onResize) {
      onResize(isExpanded ? size : 'full');
    }
  };

  return (
    <Card className={`relative ${sizeClasses[size]} ${className} ${editMode ? 'ring-2 ring-primary/20' : ''}`}>
      {/* Widget Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        
        <div className="flex items-center gap-2">
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          )}
          
          {editMode && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreHorizontal size={16} />
              </Button>
              
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-background border border-border rounded-md shadow-lg z-10 min-w-[150px]">
                  <div className="py-1">
                    <button
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent"
                      onClick={() => {
                        onConfigChange?.({});
                        setShowMenu(false);
                      }}
                    >
                      <Settings size={14} />
                      Configure
                    </button>
                    
                    <button
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent"
                      onClick={handleToggleExpand}
                    >
                      {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                      {isExpanded ? 'Minimize' : 'Expand'}
                    </button>
                    
                    <button
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent"
                      onClick={() => {
                        onToggleVisibility?.();
                        setShowMenu(false);
                      }}
                    >
                      <EyeOff size={14} />
                      Hide Widget
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Widget Content */}
      <div className="p-4">
        {error ? (
          <div className="text-center py-8">
            <div className="text-red-500 mb-2">⚠️ Error</div>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          children
        )}
      </div>
    </Card>
  );
};
