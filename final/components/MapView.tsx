import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import useSupercluster from 'use-supercluster';

export interface MapMarkerData {
  id: string | number;
  lat: number;
  lng: number;
  radius?: number;
  isUserLocation?: boolean;
  popupContent?: React.ReactNode;
  status?: 'Planning' | 'Active' | 'Completed' | 'On Hold';
}

interface MapViewProps {
  markers: MapMarkerData[];
  height?: string;
  className?: string;
}

// Custom SVG Icon for project markers
const createProjectIcon = (status: MapMarkerData['status']) => {
  let className = '';
  switch (status) {
    case 'Active': className = 'marker-active'; break;
    case 'On Hold': className = 'marker-on-hold'; break;
    case 'Completed': className = 'marker-completed'; break;
    default: className = 'marker-planning'; break;
  }
  return L.divIcon({
    html: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="${className}"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
    className: 'custom-marker-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const userLocationIcon = L.divIcon({
    html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>`,
    className: '',
    iconSize: [16, 16],
});

const RecenterAutomatically: React.FC<{center: [number, number]}> = ({center}) => {
    const map = useMap();
     React.useEffect(() => {
        if(center[0] !== 0 && center[1] !== 0) {
           map.setView(center);
        }
    }, [center, map]);
   return null;

export const MapView: React.FC<MapViewProps> = ({ markers, height = '100%', className }) => {
    const mapRef = React.useRef<L.Map>(null);
    const [bounds, setBounds] = React.useState<any>(null);
    const [zoom, setZoom] = React.useState(13);

    const projectMarkers = markers.filter(m => !m.isUserLocation);
    const userLocation = markers.find(m => m.isUserLocation);

    const points = projectMarkers.map(marker => ({
        type: "Feature",
        properties: { cluster: false, ...marker },
        geometry: { type: "Point", coordinates: [marker.lng, marker.lat] }
    }));

    const { clusters, supercluster } = useSupercluster({
        points,
        bounds,
        zoom,
        options: { radius: 75, maxZoom: 17 }
    });

    const updateMapState = () => {
        if (mapRef.current) {
            const map = mapRef.current;
            setBounds(map.getBounds().toBBoxString().split(',').map(Number));
            setZoom(map.getZoom());
        }
    };
    
    const center: [number, number] = React.useMemo(() => {
        if (projectMarkers.length > 0) {
            return [projectMarkers[0].lat, projectMarkers[0].lng];
        }
        return [51.505, -0.09]; // Default center
    }, [projectMarkers]);


    return (
        <div style={{ height }} className={className}>
            <MapContainer ref={mapRef} center={center} zoom={zoom} scrollWheelZoom={true} onMoveEnd={updateMapState} onZoomEnd={updateMapState} onMount={updateMapState}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {clusters.map(cluster => {
                    const [longitude, latitude] = cluster.geometry.coordinates;
                    const { cluster: isCluster, point_count: pointCount } = cluster.properties;

                    if (isCluster) {
                        return (
                            <Marker
                                key={`cluster-${cluster.id}`}
                                position={[latitude, longitude]}
                                icon={L.divIcon({
                                    html: `<div class="cluster-marker">${pointCount}</div>`,
                                    className: 'custom-cluster-icon',
                                    iconSize: [40, 40],
                                })}
                                eventHandlers={{
                                    click: () => {
                                        if (supercluster && mapRef.current) {
                                            const expansionZoom = Math.min(
                                                supercluster.getClusterExpansionZoom(cluster.id),
                                                20
                                            );
                                            mapRef.current.setView([latitude, longitude], expansionZoom, {
                                                animate: true,
                                            });
                                        }
                                    },
                                }}
                            />
                        );
                    }
                    
                    const markerProps = cluster.properties as MapMarkerData;
                    
                    return (
                        <Marker key={`marker-${markerProps.id}`} position={[latitude, longitude]} icon={createProjectIcon(markerProps.status)}>
                           {markerProps.popupContent && <Popup>{markerProps.popupContent}</Popup>}
                           {markerProps.radius && <Circle center={[latitude, longitude]} radius={markerProps.radius} pathOptions={{ color: 'hsla(217, 91%, 60%, 0.5)', fillColor: 'hsla(217, 91%, 60%, 0.1)', weight: 2 }}/>}
                        </Marker>
                    );
                })}

                {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
                        <Popup>Your current location</Popup>
                    </Marker>
                )}
                <RecenterAutomatically center={center}/>
            </MapContainer>
        </div>
    );
};
