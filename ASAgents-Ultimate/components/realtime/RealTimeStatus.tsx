import React from 'react';
import { useRealTime } from '../../hooks/useRealTime';

interface RealTimeStatusProps {
  className?: string;
  showText?: boolean;
}

export const RealTimeStatus: React.FC<RealTimeStatusProps> = ({ 
  className = '', 
  showText = true 
}) => {
  const { isConnected } = useRealTime({ autoConnect: true });

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative">
        <div 
          className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        {isConnected && (
          <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75" />
        )}
      </div>
      {showText && (
        <span className={`text-sm font-medium ${
          isConnected ? 'text-green-600' : 'text-red-600'
        }`}>
          {isConnected ? 'Live' : 'Offline'}
        </span>
      )}
    </div>
  );
};

export default RealTimeStatus;
