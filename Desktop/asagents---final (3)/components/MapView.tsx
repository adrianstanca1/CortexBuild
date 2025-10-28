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
  type: 'project' | 'person';
  radius?: number; // Geofence radius in meters
  popupContent?: string | React.ReactNode;
  status?: 'Active' | 'On Hold' | 'Completed';
  hasOverdueTasks?: boolean;
}

interface MapViewProps {
  markers: MapMarker[];
  height?: string;
  zoom?: number;
  center?: [number, number];
}

const getProjectIcon = (status?: 'Active' | 'On Hold' | 'Completed', hasOverdueTasks?: boolean) => {
    
    const getMarkerColorClass = (status?: 'Active' | 'On Hold' | 'Completed'): string => {
        switch (status) {
            case 'Active':
                return 'marker-active'; // Green
            case 'On Hold':
                return 'marker-on-hold'; // Yellow
            case 'Completed':
                return 'marker-completed'; // Purple
            default:
                return 'marker-completed'; // Default to purple if status is unknown
        }
    };

    const getOverdueIndicator = (isOverdue?: boolean): string => {
        if (!isOverdue) {
            return '';
        }
        return '<circle class="overdue-indicator" cx="20" cy="4" r="4" fill="hsl(0 84% 60%)" stroke="white" stroke-width="1.5"/>';
    };

    const colorClass = getMarkerColorClass(status);
    const overdueIndicatorHtml = getOverdueIndicator(hasOverdueTasks);

    const iconHtml = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="${colorClass}">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5-2.5-1.12 2.5-2.5 2.5z"/>
            ${overdueIndicatorHtml}
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

const getPersonIcon = () => {
    const iconHtml = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="hsl(217, 91%, 60%)" class="custom-marker-icon">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
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

const ClusterPopupContent: React.FC<{
    cluster: any;
    supercluster: any;
    map: L.Map;
}> = ({ cluster, supercluster, map }) => {
    const [filter, setFilter] = useState<'all' | 'project' | 'person'>('all');
    
    const leaves = supercluster.getLeaves(cluster.id as number, Infinity);
    const totalCount = cluster.properties.point_count;
    
    const filteredLeaves = useMemo(() => {
        if (filter === 'all') return leaves.slice(0, 25);
        return leaves.filter((leaf: any) => leaf.properties.markerData.type === filter).slice(0, 25);
    }, [filter, leaves]);

    return (
        <div className="p-1 max-w-xs">
            <h4 className="font-bold mb-2 border-b pb-1 text-slate-800">
                {totalCount} items in this area
            </h4>
            <div className="flex gap-1 mb-2">
                {(['all', 'project', 'person'] as const).map(f => (
                    <Button
                        key={f}
                        size="sm"
                        variant={filter === f ? 'primary' : 'secondary'}
                        onClick={() => setFilter(f)}
                        className="capitalize text-xs h-7"
                    >
                        {f}
                    </Button>
                ))}
            </div>
            <ul className="list-none p-0 m-0 max-h-48 overflow-y-auto space-y-1 text-sm">
                {filteredLeaves.map((leaf: any, index: number) => {
                    const markerData = leaf.properties.markerData as MapMarker;
                    return (
                        <li key={index} className="p-1.5 rounded-md bg-slate-50">
                            {markerData.popupContent}
                        </li>
                    );
                })}
                {leaves.length > filteredLeaves.length && (
                    <li className="p-1.5 text-center text-xs text-slate-500">
                        ...and {leaves.length - filteredLeaves.length} more.
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
                    const [longitude, latitude] = cluster.geometry.coordinates;
                    map.setView([latitude, longitude], expansionZoom, { animate: true });
                }}
            >
                Zoom In
            </Button>
        </div>
    );
};


const ClusterMapItems: React.FC<{ markers: MapMarker[] }> = ({ markers }) => {
    const map = useMap();
    const [bounds, setBounds] = useState<any>(null);
    const [zoom, setZoom] = useState(12);
    const [activeCluster, setActiveCluster] = useState<any | null>(null);
    
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
                    const leaves = supercluster ? supercluster.getLeaves(cluster.id as number, Infinity) : [];
                    const projectCount = leaves.filter(leaf => leaf.properties.markerData.type === 'project').length;
                    const personCount = leaves.filter(leaf => leaf.properties.markerData.type === 'person').length;
                    
                    const iconHtml = `
                        <div class="cluster-marker-container">
                             ${projectCount > 0 ? `<div class="cluster-count"><svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5-2.5-1.12 2.5-2.5 2.5z"/></svg><span>${projectCount}</span></div>` : ''}
                             ${personCount > 0 ? `<div class="cluster-count"><svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg><span>${personCount}</span></div>` : ''}
                        </div>
                    `;
                    
                    return (
                        <Marker
                            key={`cluster-${cluster.id}`}
                            position={[latitude, longitude]}
                            icon={L.divIcon({
                                html: iconHtml,
                                className: 'bg-transparent border-none',
                                iconSize: [44, 44]
                            })}
                            eventHandlers={{
                                click: () => {
                                    setActiveCluster(cluster);
                                }
                            }}
                        />
                    );
                }

                const marker = properties.markerData as MapMarker;
                return (
                    <React.Fragment key={`marker-${marker.type}-${marker.lat}-${marker.lng}`}>
                        <Marker
                            position={[marker.lat, marker.lng]}
                            icon={marker.type === 'project' 
                                ? getProjectIcon(marker.status, marker.hasOverdueTasks)
                                : getPersonIcon()}
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
             {activeCluster && (
                <Popup 
                    position={[activeCluster.geometry.coordinates[1], activeCluster.geometry.coordinates[0]]} 
                    eventHandlers={{ remove: () => setActiveCluster(null) }}
                >
                    <ClusterPopupContent cluster={activeCluster} supercluster={supercluster} map={map} />
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

    const projectMarkers = markers.filter(m => m.type === 'project');
    
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
                <ClusterMapItems markers={markers} />
                <MapViewController center={center} zoom={zoom} bounds={!center ? bounds : undefined} />
            </MapContainer>
        </div>
    );
};