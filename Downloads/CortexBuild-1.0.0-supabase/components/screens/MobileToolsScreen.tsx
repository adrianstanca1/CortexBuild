// components/screens/MobileToolsScreen.tsx
import React, { useState } from 'react';
import { PhotoCapture } from '../mobile/PhotoCapture';
import {
    Camera,
    MapPin,
    Calendar,
    Wifi,
    WifiOff,
    Smartphone,
    Tablet,
    Monitor
} from 'lucide-react';

interface MobileToolsScreenProps {
    currentUser: any;
    projectId?: string;
}

export const MobileToolsScreen: React.FC<MobileToolsScreenProps> = ({
    currentUser,
    projectId
}) => {
    const [activeTool, setActiveTool] = useState<string | null>(null);
    const [capturedPhotos, setCapturedPhotos] = useState<any[]>([]);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    React.useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handlePhotoCapture = (photo: any) => {
        setCapturedPhotos(prev => [...prev, photo]);
        console.log('Photo captured:', photo);
    };

    const mobileTools = [
        {
            id: 'photo-capture',
            name: 'Photo Capture',
            description: 'Capture photos with GPS location and metadata',
            icon: Camera,
            color: 'bg-blue-50 text-blue-700 border-blue-200',
            features: ['GPS Location', 'Metadata Tags', 'Offline Storage', 'Auto Sync']
        },
        {
            id: 'location-tracking',
            name: 'Location Tracking',
            description: 'Track team locations and site visits',
            icon: MapPin,
            color: 'bg-green-50 text-green-700 border-green-200',
            features: ['Real-time Tracking', 'Site Visits', 'Geofencing', 'History Log']
        },
        {
            id: 'calendar-sync',
            name: 'Calendar Sync',
            description: 'Sync project deadlines with mobile calendar',
            icon: Calendar,
            color: 'bg-purple-50 text-purple-700 border-purple-200',
            features: ['Deadline Sync', 'Meeting Integration', 'Reminders', 'Team Scheduling']
        }
    ];

    const getDeviceType = () => {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    };

    const getDeviceIcon = () => {
        const deviceType = getDeviceType();
        switch (deviceType) {
            case 'mobile': return <Smartphone className="w-5 h-5" />;
            case 'tablet': return <Tablet className="w-5 h-5" />;
            default: return <Monitor className="w-5 h-5" />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mobile Tools</h1>
                        <p className="text-gray-600">Mobile-optimized tools for construction site management</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                            {getDeviceIcon()}
                            <span className="text-sm font-medium text-gray-700 capitalize">
                                {getDeviceType()} view
                            </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                            {isOnline ? (
                                <Wifi className="w-4 h-4 text-green-600" />
                            ) : (
                                <WifiOff className="w-4 h-4 text-red-600" />
                            )}
                            <span className="text-sm font-medium text-gray-700">
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {activeTool === 'photo-capture' ? (
                <PhotoCapture
                    projectId={projectId}
                    onPhotoCapture={handlePhotoCapture}
                    onClose={() => setActiveTool(null)}
                    className="mb-6"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {mobileTools.map(tool => {
                        const IconComponent = tool.icon;

                        return (
                            <div
                                key={tool.id}
                                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => setActiveTool(tool.id)}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`p-3 rounded-lg ${tool.color}`}>
                                        <IconComponent className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{tool.name}</h3>
                                        <p className="text-sm text-gray-600">{tool.description}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-900">Features</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {tool.features.map(feature => (
                                            <span key={feature} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                                        Open Tool
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Captured Photos Summary */}
            {capturedPhotos.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Recent Captures</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {capturedPhotos.slice(-8).map((photo, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={photo.preview}
                                    alt={`Captured photo ${index + 1}`}
                                    className="w-full h-24 object-cover rounded-lg"
                                />
                                <div className="absolute top-1 right-1">
                                    <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
                                        {photo.metadata.tags.length} tags
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 text-center">
                        <span className="text-sm text-blue-700">
                            {capturedPhotos.length} photos captured
                        </span>
                    </div>
                </div>
            )}

            {/* Mobile Optimization Tips */}
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-4">Mobile Optimization Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-medium text-yellow-900 mb-2">For Best Experience</h4>
                        <ul className="text-sm text-yellow-800 space-y-1">
                            <li>• Enable location services for GPS features</li>
                            <li>• Allow camera access for photo capture</li>
                            <li>• Use landscape mode for better viewing</li>
                            <li>• Keep app updated for latest features</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium text-yellow-900 mb-2">Offline Mode</h4>
                        <ul className="text-sm text-yellow-800 space-y-1">
                            <li>• Photos are stored locally when offline</li>
                            <li>• Data syncs automatically when online</li>
                            <li>• Core features work without internet</li>
                            <li>• Real-time features require connection</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
