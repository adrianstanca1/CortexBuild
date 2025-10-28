import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L, { LatLngBoundsExpression } from 'leaflet';
import useSupercluster from 'use-supercluster';
import { Button } from './ui/Button';

// Fix for default Leaflet icon path issues with bundlers
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface MapMarker {
  lat: number;
  lng: number;
  radius?: number; // Geofence radius in meters
  popupContent?: string | React.ReactNode;
  status?: 'Active' | 'On Hold' | 'Completed';
  isUserLocation?: boolean;
}

interface MapViewProps {
  markers: MapMarker[];
  height?: string;
  zoom?: number;
  center?: [number, number];
}

const getProjectIcon = (status?: 'Active' | 'On Hold' | 'Completed') => {
    let colorClass = 'marker-completed'; // Default color
    if (status === 'Active') colorClass = 'marker-active';
    if (status === 'On Hold') colorClass = 'marker-on-hold';
    
    const iconHtml = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="${colorClass}">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
    `;
    
    return L.divIcon({
        html: iconHtml,
        className: 'custom-marker-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });
};

const getUserLocationIcon = () => {
    const iconHtml = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="hsl(217, 91%, 60%)" stroke="white" stroke-width="2"/>
        </svg>
    `;
    return L.divIcon({
        html: iconHtml,
        className: 'custom-marker-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
};


const ClusterMapItems: React.FC<{ markers: MapMarker[] }> = ({ markers }) => {
    const map = useMap();
    const [bounds, setBounds] = useState<any>(null);
    const [zoom, setZoom] = useState(12);
    const [clusterPopup, setClusterPopup] = useState<{ lat: number; lng: number; content: React.ReactNode } | null>(null);

    useEffect(() => {
        const updateMapState = () => {
            const b = map.getBounds();
            setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
            setZoom(map.getZoom());
        };

        map.on('moveend', updateMapState);
        updateMapState(); // Set initial state

        return () => {
            map.off('moveend', updateMapState);
        };
    }, [map]);

    const points = useMemo(() => markers.map(marker => ({
        type: "Feature" as const,
        properties: { cluster: false, markerData: marker },
        geometry: { type: "Point" as const, coordinates: [marker.lng, marker.lat] }
    })), [markers]);

    const { clusters, supercluster } = useSupercluster({
        points,
        bounds,
        zoom,
        options: { radius: 75, maxZoom: 20 }
    });

    return (
        <>
            {clusters.map(cluster => {
                const [longitude, latitude] = cluster.geometry.coordinates;
                const properties = cluster.properties;

                if ('point_count' in properties) {
                    const pointCount = properties.point_count;
                    return (
                        <Marker
                            key={`cluster-${cluster.id}`}
                            position={[latitude, longitude]}
                            icon={L.divIcon({
                                html: `<div class="cluster-marker">${pointCount}</div>`,
                                className: 'bg-transparent border-none',
                                iconSize: [40, 40]
                            })}
                            // FIX: Replaced 'eventHandlers' with 'onClick' to fix type error.
                            // The 'eventHandlers' prop is not recognized by this version's types.
                            onClick={() => {
                                    if (!supercluster) return;

                                    const leaves = supercluster.getLeaves(cluster.id as number, 25);
                                    const totalLeaves = properties.point_count;
                                    
                                    const content = (
                                        <div className="p-1 max-w-xs">
                                            <h4 className="font-bold mb-2 border-b pb-1 text-slate-800 dark:text-slate-200">
                                                {totalLeaves} items in this area
                                            </h4>
                                            <ul className="list-none p-0 m-0 max-h-48 overflow-y-auto space-y-1 text-sm">
                                                {leaves.map((leaf, index) => {
                                                    const markerData = leaf.properties.markerData as MapMarker;
                                                    return (
                                                        <li key={index} className="p-1.5 rounded-md bg-slate-50 dark:bg-slate-700/50">
                                                            {markerData.popupContent}
                                                        </li>
                                                    );
                                                })}
                                                {totalLeaves > leaves.length && (
                                                    <li className="p-1.5 text-center text-xs text-slate-500">
                                                        ...and {totalLeaves - leaves.length} more.
                                                    </li>
                                                )}
                                            </ul>
                                            <Button 
                                                size="sm" 
                                                variant="secondary" 
                                                className="w-full mt-2"
                                                onClick={() => {
                                                    const expansionZoom = Math.min(
                                                        supercluster.getClusterExpansionZoom(cluster.id as number),
                                                        20
                                                    );
                                                    map.setView([latitude, longitude], expansionZoom, { animate: true });
                                                    setClusterPopup(null);
                                                }}
                                            >
                                                Zoom In
                                            </Button>
                                        </div>
                                    );
                                    setClusterPopup({ lat: latitude, lng: longitude, content });
                                }}
                        />
                    );
                }

                const marker = properties.markerData as MapMarker;
                return (
                    <React.Fragment key={`marker-${marker.lat}-${marker.lng}`}>
                        <Marker
                            position={[marker.lat, marker.lng]}
                            icon={getProjectIcon(marker.status)}
                        >
                            {marker.popupContent && <Popup>{marker.popupContent}</Popup>}
                        </Marker>
                        {marker.radius && (
                            <Circle
                                center={[marker.lat, marker.lng]}
                                pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
                                radius={marker.radius}
                            />
                        )}
                    </React.Fragment>
                );
            })}
             {clusterPopup && (
                <Popup 
                    position={[clusterPopup.lat, clusterPopup.lng]} 
                    // FIX: Replaced invalid 'onClose' prop with 'eventHandlers' using the 'remove' event,
                    // which is the correct API for handling popup close events in this react-leaflet version.
                    eventHandlers={{ remove: () => setClusterPopup(null) }}
                >
                    {clusterPopup.content}
                </Popup>
            )}
        </>
    );
};

const MapViewController: React.FC<{ center?: [number, number]; zoom?: number, bounds?: LatLngBoundsExpression }> = ({ center, zoom, bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom, { animate: true });
    } else if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], animate: true });
    }
  }, [center, zoom, bounds, map]);
  return null;
};

export const MapView: React.FC<MapViewProps> = ({ markers, height = 'h-48', zoom, center }) => {
    if (markers.length === 0 && !center) {
        return <div className={`w-full bg-gray-200 flex items-center justify-center text-gray-500 ${height}`}>No location data</div>;
    }

    const userLocationMarker = markers.find(m => m.isUserLocation);
    const projectMarkers = markers.filter(m => !m.isUserLocation);
    
    const bounds: LatLngBoundsExpression | undefined = projectMarkers.length > 1 
        ? projectMarkers.map(m => [m.lat, m.lng] as [number, number])
        : undefined;

    const initialCenter: [number, number] = projectMarkers.length > 0 
        ? [projectMarkers[0].lat, projectMarkers[0].lng] 
        : center || [51.505, -0.09]; // Default to London if no markers or center is provided

    return (
        <div className={`${height} w-full rounded-md overflow-hidden my-2`}>
             <MapContainer 
                center={initialCenter} 
                zoom={13} 
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
             >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ClusterMapItems markers={projectMarkers} />
                {userLocationMarker && (
                    <Marker
                        position={[userLocationMarker.lat, userLocationMarker.lng]}
                        icon={getUserLocationIcon()}
                        zIndexOffset={1000} // Ensure it's on top of other markers
                    >
                        {userLocationMarker.popupContent && <Popup>{userLocationMarker.popupContent}</Popup>}
                    </Marker>
                )}
                <MapViewController center={center} zoom={zoom} bounds={!center ? bounds : undefined} />
            </MapContainer>
        </div>
    );
};