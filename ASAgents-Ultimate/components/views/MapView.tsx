import React from 'react';

export interface MapViewProps {
  className?: string;
}

export const MapView: React.FC<MapViewProps> = ({ className }) => {
  return (
    <div className={className}>
      <h2>Map View</h2>
      <p>Map view implementation coming soon...</p>
    </div>
  );
};

export default MapView;
