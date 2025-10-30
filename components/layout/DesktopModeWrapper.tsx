/**
 * Desktop Mode Wrapper
 * Provides a unified interface to toggle between standard dashboard and Base44Clone desktop environment
 */

import React, { useState } from 'react';
import { User } from '../../types';
import { ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';
import { featureFlags } from '../../lib/config/database';

interface DesktopModeWrapperProps {
  user: User;
  desktopComponent: React.ReactNode;
  standardComponent: React.ReactNode;
  initialMode?: 'desktop' | 'standard';
  onModeChange?: (mode: 'desktop' | 'standard') => void;
}

export const DesktopModeWrapper: React.FC<DesktopModeWrapperProps> = ({
  user,
  desktopComponent,
  standardComponent,
  initialMode = 'standard',
  onModeChange,
}) => {
  const [mode, setMode] = useState<'desktop' | 'standard'>(() => {
    // Check localStorage for user preference
    const stored = localStorage.getItem(`cortexbuild_view_mode_${user.id}`);
    return (stored as 'desktop' | 'standard') || initialMode;
  });

  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleMode = () => {
    const newMode = mode === 'desktop' ? 'standard' : 'desktop';
    setMode(newMode);
    localStorage.setItem(`cortexbuild_view_mode_${user.id}`, newMode);
    onModeChange?.(newMode);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Don't show desktop mode if feature flag is disabled
  if (!featureFlags.desktopMode) {
    return <>{standardComponent}</>;
  }

  return (
    <div className="relative h-full">
      {/* Mode Toggle Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {mode === 'desktop' && (
              <button
                onClick={toggleMode}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${mode === 'desktop' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
              <span className="text-sm text-gray-600">
                {mode === 'desktop' ? 'Desktop Environment' : 'Dashboard View'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => {
                  setMode('standard');
                  localStorage.setItem(`cortexbuild_view_mode_${user.id}`, 'standard');
                  onModeChange?.('standard');
                }}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-md transition-colors
                  ${mode === 'standard'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  setMode('desktop');
                  localStorage.setItem(`cortexbuild_view_mode_${user.id}`, 'desktop');
                  onModeChange?.('desktop');
                }}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-md transition-colors
                  ${mode === 'desktop'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                Desktop
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-64px)] overflow-hidden">
        {mode === 'desktop' ? desktopComponent : standardComponent}
      </div>
    </div>
  );
};

