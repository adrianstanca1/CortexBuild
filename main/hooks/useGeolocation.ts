import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

interface GeolocationState {
  loading: boolean;
  error: GeolocationPositionError | Error | null;
  data: GeolocationPosition | null;
}

export interface Geofence {
    id: number;
    name: string;
    lat: number;
    lng: number;
    radius: number;
}

export type GeofenceEvent = 'enter' | 'exit';

// Haversine formula to calculate distance between two points on Earth
const haversineDistance = (coords1: { lat: number; lng: number }, coords2: { lat: number; lng: number }): number => {
    const R = 6371e3; // metres
    const φ1 = coords1.lat * Math.PI / 180;
    const φ2 = coords2.lat * Math.PI / 180;
    const Δφ = (coords2.lat - coords1.lat) * Math.PI / 180;
    const Δλ = (coords2.lng - coords1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
};

export interface UseGeolocationOptions {
    enableHighAccuracy?: boolean;
    geofences?: Geofence[];
    onGeofenceEvent?: (event: GeofenceEvent, geofence: Geofence) => void;
}

export const useGeolocation = (options: UseGeolocationOptions = {}) => {
    const {
        enableHighAccuracy = false,
        geofences = [],
        onGeofenceEvent,
    } = options;

    const [state, setState] = useState<GeolocationState>({
        loading: false,
        error: null,
        data: null,
    });

    const watchId = useRef<number | null>(null);
    const insideGeofencesRef = useRef<Set<number>>(new Set());

    const processGeofences = useCallback((position: GeolocationPosition) => {
        if (!geofences.length || !onGeofenceEvent) return;
        
        const userCoords = { lat: position.coords.latitude, lng: position.coords.longitude };
        const currentlyInside = new Set<number>();

        geofences.forEach(fence => {
            const distance = haversineDistance(userCoords, { lat: fence.lat, lng: fence.lng });
            if (distance <= fence.radius) {
                currentlyInside.add(fence.id);
            }
        });

        const previouslyInside = insideGeofencesRef.current;

        // Check for entries
        currentlyInside.forEach(id => {
            if (!previouslyInside.has(id)) {
                const fence = geofences.find(f => f.id === id);
                if (fence) onGeofenceEvent('enter', fence);
            }
        });

        // Check for exits
        previouslyInside.forEach(id => {
            if (!currentlyInside.has(id)) {
                const fence = geofences.find(f => f.id === id);
                if (fence) onGeofenceEvent('exit', fence);
            }
        });

        insideGeofencesRef.current = currentlyInside;
    }, [geofences, onGeofenceEvent]);
    
    const geolocationOptions = useMemo(() => ({
        enableHighAccuracy,
        timeout: 20000,
        maximumAge: 0,
    }), [enableHighAccuracy]);

    const getLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setState(prevState => ({ ...prevState, error: new Error("Geolocation is not supported by your browser.") }));
            return;
        }

        setState({ loading: true, error: null, data: null });
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setState({
                    loading: false,
                    error: null,
                    data: position,
                });
            },
            (error) => {
                setState({
                    loading: false,
                    error,
                    data: null,
                });
            },
            geolocationOptions
        );
    }, [geolocationOptions]);

    const watchLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setState(prevState => ({ ...prevState, error: new Error("Geolocation is not supported by your browser.") }));
            return;
        }

        setState(prevState => ({ ...prevState, loading: true }));

        watchId.current = navigator.geolocation.watchPosition(
            (position) => {
                setState({
                    loading: false,
                    error: null,
                    data: position,
                });
                processGeofences(position);
            },
            (error) => {
                setState({
                    loading: false,
                    error,
                    data: null,
                });
            },
            geolocationOptions
        );
    }, [processGeofences, geolocationOptions]);

    const stopWatching = useCallback(() => {
        if (watchId.current !== null) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
            setState(prevState => ({...prevState, loading: false}));
        }
    }, []);

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            stopWatching();
        }
    }, [stopWatching]);

    return { ...state, getLocation, watchLocation, stopWatching, insideGeofenceIds: insideGeofencesRef.current };
};