// FIX: Implemented useGeolocation hook to resolve module not found errors.
import { useState, useCallback, useRef } from 'react';

interface Geofence {
  id: number | string;
  lat: number;
  lng: number;
  radius: number; // in meters
}

interface GeolocationData {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamp: number;
}

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // in metres
};

export const useGeolocation = ({ geofences = [] }: { geofences?: Geofence[] }) => {
  const [data, setData] = useState<GeolocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [insideGeofenceIds, setInsideGeofenceIds] = useState<Set<number|string>>(new Set());
  const watchId = useRef<number | null>(null);

  const watchLocation = useCallback(() => {
    if (navigator.geolocation) {
      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const newData = { coords: { latitude, longitude, accuracy }, timestamp: position.timestamp };
          setData(newData);
          
          const insideIds = new Set<string|number>();
          geofences.forEach(fence => {
            const distance = calculateDistance(latitude, longitude, fence.lat, fence.lng);
            if (distance < fence.radius) {
              insideIds.add(fence.id);
            }
          });
          setInsideGeofenceIds(insideIds);

          setError(null);
        },
        (err) => {
          setError(err.message);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, [geofences]);

  const stopWatching = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  }, []);

  return { data, error, watchLocation, stopWatching, insideGeofenceIds };
};
