// components/mobile/PhotoCapture.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
    Camera,
    Upload,
    X,
    Check,
    RotateCcw,
    Download,
    MapPin,
    Calendar,
    Tag,
    AlertCircle,
    Wifi,
    WifiOff
} from 'lucide-react';

interface PhotoCaptureProps {
    projectId?: string;
    taskId?: string;
    onPhotoCapture: (photo: CapturedPhoto) => void;
    onClose: () => void;
    className?: string;
}

interface CapturedPhoto {
    id: string;
    file: File;
    preview: string;
    metadata: {
        timestamp: string;
        location?: {
            latitude: number;
            longitude: number;
            address?: string;
        };
        projectId?: string;
        taskId?: string;
        tags: string[];
        notes: string;
    };
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({
    projectId,
    taskId,
    onPhotoCapture,
    onClose,
    className = ""
}) => {
    const [isCapturing, setIsCapturing] = useState(false);
    const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
    const [currentPhoto, setCurrentPhoto] = useState<CapturedPhoto | null>(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [location, setLocation] = useState<{ latitude: number; longitude: number; address?: string } | null>(null);
    const [notes, setNotes] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Get current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        address: 'Location detected' // In real app, reverse geocode this
                    });
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Use back camera on mobile
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });

            if (cameraRef.current) {
                cameraRef.current.srcObject = stream;
                setIsCapturing(true);
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Unable to access camera. Please check permissions.');
        }
    };

    const stopCamera = () => {
        if (cameraRef.current && cameraRef.current.srcObject) {
            const stream = cameraRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            cameraRef.current.srcObject = null;
        }
        setIsCapturing(false);
    };

    const capturePhoto = () => {
        if (cameraRef.current && canvasRef.current) {
            const video = cameraRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
                        const preview = URL.createObjectURL(blob);

                        const photo: CapturedPhoto = {
                            id: `photo-${Date.now()}`,
                            file,
                            preview,
                            metadata: {
                                timestamp: new Date().toISOString(),
                                location: location || undefined,
                                projectId,
                                taskId,
                                tags: [...tags],
                                notes
                            }
                        };

                        setCurrentPhoto(photo);
                        setCapturedPhotos(prev => [...prev, photo]);
                        stopCamera();
                    }
                }, 'image/jpeg', 0.9);
            }
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const preview = URL.createObjectURL(file);

            const photo: CapturedPhoto = {
                id: `photo-${Date.now()}`,
                file,
                preview,
                metadata: {
                    timestamp: new Date().toISOString(),
                    location: location || undefined,
                    projectId,
                    taskId,
                    tags: [...tags],
                    notes
                }
            };

            setCurrentPhoto(photo);
            setCapturedPhotos(prev => [...prev, photo]);
        }
    };

    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags(prev => [...prev, newTag.trim()]);
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(prev => prev.filter(tag => tag !== tagToRemove));
    };

    const savePhoto = () => {
        if (currentPhoto) {
            onPhotoCapture(currentPhoto);
            setCurrentPhoto(null);
            setNotes('');
            setTags([]);
        }
    };

    const retakePhoto = () => {
        setCurrentPhoto(null);
        setNotes('');
        setTags([]);
    };

    return (
        <div className={`photo-capture ${className}`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <Camera className="w-6 h-6 text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Photo Capture</h2>
                        <div className="flex items-center gap-1">
                            {isOnline ? (
                                <Wifi className="w-4 h-4 text-green-600" />
                            ) : (
                                <WifiOff className="w-4 h-4 text-red-600" />
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4">
                    {!currentPhoto ? (
                        <div className="space-y-4">
                            {/* Camera Controls */}
                            <div className="flex gap-4">
                                <button
                                    onClick={startCamera}
                                    disabled={isCapturing}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Camera className="w-5 h-5" />
                                    {isCapturing ? 'Capturing...' : 'Start Camera'}
                                </button>

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                >
                                    <Upload className="w-5 h-5" />
                                    Upload Photo
                                </button>
                            </div>

                            {/* Camera Preview */}
                            {isCapturing && (
                                <div className="relative">
                                    <video
                                        ref={cameraRef}
                                        autoPlay
                                        playsInline
                                        className="w-full h-64 bg-gray-900 rounded-lg object-cover"
                                    />
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
                                        <button
                                            onClick={capturePhoto}
                                            className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg"
                                        >
                                            <Camera className="w-8 h-8 text-gray-800" />
                                        </button>
                                        <button
                                            onClick={stopCamera}
                                            className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg"
                                        >
                                            <X className="w-6 h-6 text-white" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleFileUpload}
                                className="hidden"
                            />

                            {/* Location Info */}
                            {location && (
                                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <MapPin className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-green-800">
                                        Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                                    </span>
                                </div>
                            )}

                            {/* Offline Warning */}
                            {!isOnline && (
                                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                                    <span className="text-sm text-yellow-800">
                                        You're offline. Photos will be synced when connection is restored.
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Photo Preview */}
                            <div className="relative">
                                <img
                                    src={currentPhoto.preview}
                                    alt="Captured photo"
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <button
                                        onClick={retakePhoto}
                                        className="p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100"
                                    >
                                        <RotateCcw className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>

                            {/* Photo Metadata */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(currentPhoto.metadata.timestamp).toLocaleString()}</span>
                                </div>

                                {currentPhoto.metadata.location && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <MapPin className="w-4 h-4" />
                                        <span>
                                            {currentPhoto.metadata.location.latitude.toFixed(4)}, {currentPhoto.metadata.location.longitude.toFixed(4)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                        >
                                            {tag}
                                            <button
                                                onClick={() => removeTag(tag)}
                                                className="hover:text-blue-600"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        placeholder="Add tag..."
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                    />
                                    <button
                                        onClick={addTag}
                                        className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add notes about this photo..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={retakePhoto}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Retake
                                </button>
                                <button
                                    onClick={savePhoto}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    <Check className="w-4 h-4" />
                                    Save Photo
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Captured Photos List */}
                    {capturedPhotos.length > 0 && (
                        <div className="mt-6 border-t border-gray-200 pt-4">
                            <h3 className="text-sm font-medium text-gray-900 mb-3">
                                Captured Photos ({capturedPhotos.length})
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {capturedPhotos.map(photo => (
                                    <div key={photo.id} className="relative">
                                        <img
                                            src={photo.preview}
                                            alt="Captured photo"
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
                        </div>
                    )}
                </div>

                {/* Hidden canvas for photo capture */}
                <canvas ref={canvasRef} className="hidden" />
            </div>
        </div>
    );
};
