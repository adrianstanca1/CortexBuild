/**
 * Geolocation Service - Real GPS location tracking
 */

import toast from 'react-hot-toast';

export interface Coordinates {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number;
    altitudeAccuracy?: number;
    heading?: number;
    speed?: number;
}

export interface LocationData {
    coordinates: Coordinates;
    timestamp: number;
    address?: string;
}

/**
 * Get current GPS location
 */
export async function getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const coordinates: Coordinates = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    altitude: position.coords.altitude || undefined,
                    altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
                    heading: position.coords.heading || undefined,
                    speed: position.coords.speed || undefined
                };
                
                // Try to get address from coordinates
                let address: string | undefined;
                try {
                    address = await reverseGeocode(coordinates.latitude, coordinates.longitude);
                } catch (error) {
                    console.warn('Failed to get address:', error);
                }
                
                resolve({
                    coordinates,
                    timestamp: position.timestamp,
                    address
                });
            },
            (error) => {
                let errorMessage = 'Failed to get location';
                
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location permission denied';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information unavailable';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out';
                        break;
                }
                
                reject(new Error(errorMessage));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}

/**
 * Watch location changes (real-time tracking)
 */
export function watchLocation(
    onLocationUpdate: (location: LocationData) => void,
    onError?: (error: Error) => void
): number {
    if (!navigator.geolocation) {
        const error = new Error('Geolocation is not supported');
        if (onError) onError(error);
        return -1;
    }
    
    return navigator.geolocation.watchPosition(
        async (position) => {
            const coordinates: Coordinates = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude || undefined,
                altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
                heading: position.coords.heading || undefined,
                speed: position.coords.speed || undefined
            };
            
            let address: string | undefined;
            try {
                address = await reverseGeocode(coordinates.latitude, coordinates.longitude);
            } catch (error) {
                console.warn('Failed to get address:', error);
            }
            
            onLocationUpdate({
                coordinates,
                timestamp: position.timestamp,
                address
            });
        },
        (error) => {
            if (onError) {
                onError(new Error(`Location error: ${error.message}`));
            }
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

/**
 * Stop watching location
 */
export function stopWatchingLocation(watchId: number): void {
    if (navigator.geolocation && watchId !== -1) {
        navigator.geolocation.clearWatch(watchId);
    }
}

/**
 * Reverse geocode - Convert coordinates to address
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 */
export async function reverseGeocode(
    latitude: number,
    longitude: number
): Promise<string> {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'CortexBuild/1.0'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error('Geocoding failed');
        }
        
        const data = await response.json();
        
        if (data.display_name) {
            return data.display_name;
        }
        
        // Fallback to formatted address
        const address = data.address;
        if (address) {
            const parts = [
                address.road,
                address.suburb || address.neighbourhood,
                address.city || address.town || address.village,
                address.state,
                address.country
            ].filter(Boolean);
            
            return parts.join(', ');
        }
        
        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
}

/**
 * Forward geocode - Convert address to coordinates
 */
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
            {
                headers: {
                    'User-Agent': 'CortexBuild/1.0'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error('Geocoding failed');
        }
        
        const data = await response.json();
        
        if (data.length > 0) {
            return {
                latitude: parseFloat(data[0].lat),
                longitude: parseFloat(data[0].lon),
                accuracy: 100 // Estimated accuracy for geocoded addresses
            };
        }
        
        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

/**
 * Calculate distance between two coordinates (in meters)
 * Uses Haversine formula
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    
    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
}

/**
 * Check if user is within a geofence
 */
export async function isWithinGeofence(
    centerLat: number,
    centerLon: number,
    radiusMeters: number
): Promise<boolean> {
    try {
        const location = await getCurrentLocation();
        const distance = calculateDistance(
            location.coordinates.latitude,
            location.coordinates.longitude,
            centerLat,
            centerLon
        );
        
        return distance <= radiusMeters;
    } catch (error) {
        console.error('Geofence check error:', error);
        return false;
    }
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat: number, lon: number): string {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    
    return `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lon).toFixed(6)}° ${lonDir}`;
}

/**
 * Get Google Maps URL for coordinates
 */
export function getGoogleMapsUrl(lat: number, lon: number): string {
    return `https://www.google.com/maps?q=${lat},${lon}`;
}

/**
 * Request location permission
 */
export async function requestLocationPermission(): Promise<boolean> {
    try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        
        if (result.state === 'granted') {
            return true;
        }
        
        if (result.state === 'prompt') {
            // Try to get location to trigger permission prompt
            await getCurrentLocation();
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Permission request error:', error);
        return false;
    }
}

