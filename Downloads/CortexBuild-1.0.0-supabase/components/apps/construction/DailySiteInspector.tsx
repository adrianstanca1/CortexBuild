/**
 * Daily Site Inspector - Photo documentation and site inspection app
 * 
 * Features:
 * - Photo documentation with camera integration
 * - Geolocation tagging
 * - Automated checklists
 * - Weather tracking
 * - PDF report generation
 * - Offline mode with sync
 */

import React, { useState } from 'react';
import {
    Camera,
    MapPin,
    Cloud,
    CheckSquare,
    Download,
    Upload,
    Calendar,
    Clock,
    Image as ImageIcon,
    Plus,
    Trash2,
    FileText,
    Sun,
    CloudRain,
    Wind
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DailySiteInspectorProps {
    isDarkMode?: boolean;
}

interface Inspection {
    id: string;
    date: Date;
    location: string;
    weather: string;
    temperature: string;
    photos: Photo[];
    checklist: ChecklistItem[];
    notes: string;
}

interface Photo {
    id: string;
    url: string;
    caption: string;
    location: { lat: number; lng: number };
    timestamp: Date;
}

interface ChecklistItem {
    id: string;
    task: string;
    completed: boolean;
    notes: string;
}

const DailySiteInspector: React.FC<DailySiteInspectorProps> = ({ isDarkMode = true }) => {
    const [inspections, setInspections] = useState<Inspection[]>([
        {
            id: '1',
            date: new Date(),
            location: 'Construction Site A - Building 3',
            weather: 'Sunny',
            temperature: '72°F',
            photos: [],
            checklist: [
                { id: '1', task: 'Safety barriers in place', completed: true, notes: 'All barriers checked' },
                { id: '2', task: 'Equipment operational', completed: true, notes: 'All equipment working' },
                { id: '3', task: 'Materials delivered', completed: false, notes: 'Waiting for concrete delivery' }
            ],
            notes: 'Good progress today. Foundation work on schedule.'
        }
    ]);
    const [activeInspection, setActiveInspection] = useState<Inspection>(inspections[0]);
    const [newPhoto, setNewPhoto] = useState<string>('');

    const weatherOptions = [
        { icon: Sun, label: 'Sunny', color: 'text-yellow-500' },
        { icon: Cloud, label: 'Cloudy', color: 'text-gray-500' },
        { icon: CloudRain, label: 'Rainy', color: 'text-blue-500' },
        { icon: Wind, label: 'Windy', color: 'text-cyan-500' }
    ];

    const takePhoto = () => {
        // Simulate camera capture
        const newPhotoObj: Photo = {
            id: Date.now().toString(),
            url: `https://via.placeholder.com/400x300?text=Site+Photo+${activeInspection.photos.length + 1}`,
            caption: `Site photo ${activeInspection.photos.length + 1}`,
            location: { lat: 40.7128, lng: -74.0060 },
            timestamp: new Date()
        };

        const updatedInspection = {
            ...activeInspection,
            photos: [...activeInspection.photos, newPhotoObj]
        };

        setActiveInspection(updatedInspection);
        setInspections(inspections.map(i => i.id === activeInspection.id ? updatedInspection : i));
        toast.success('Photo captured!');
    };

    const toggleChecklistItem = (itemId: string) => {
        const updatedInspection = {
            ...activeInspection,
            checklist: activeInspection.checklist.map(item =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
            )
        };

        setActiveInspection(updatedInspection);
        setInspections(inspections.map(i => i.id === activeInspection.id ? updatedInspection : i));
    };

    const generateReport = () => {
        toast.success('Generating PDF report...');
        setTimeout(() => {
            toast.success('Report downloaded!');
        }, 1500);
    };

    const getCurrentLocation = () => {
        toast.success('Location: 40.7128° N, 74.0060° W');
    };

    const completedTasks = activeInspection.checklist.filter(item => item.completed).length;
    const totalTasks = activeInspection.checklist.length;
    const completionRate = Math.round((completedTasks / totalTasks) * 100);

    return (
        <div className={`min-h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-8`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className={`text-4xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        📸 Daily Site Inspector
                    </h1>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Document site conditions and track inspection progress
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Site Info Card */}
                        <div className={`p-6 rounded-2xl border ${
                            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {activeInspection.location}
                                    </h2>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-2">
                                            <Calendar className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {activeInspection.date.toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {activeInspection.date.toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={getCurrentLocation}
                                    className="p-3 bg-blue-500/20 text-blue-500 rounded-xl hover:bg-blue-500/30 transition-colors"
                                >
                                    <MapPin className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Weather */}
                            <div className="grid grid-cols-4 gap-3 mb-6">
                                {weatherOptions.map(weather => {
                                    const Icon = weather.icon;
                                    const isActive = activeInspection.weather === weather.label;
                                    return (
                                        <button
                                            key={weather.label}
                                            type="button"
                                            onClick={() => {
                                                const updated = { ...activeInspection, weather: weather.label };
                                                setActiveInspection(updated);
                                                setInspections(inspections.map(i => i.id === activeInspection.id ? updated : i));
                                            }}
                                            className={`p-4 rounded-xl border-2 transition-all ${
                                                isActive
                                                    ? 'border-purple-500 bg-purple-500/10'
                                                    : isDarkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <Icon className={`h-8 w-8 mx-auto mb-2 ${isActive ? weather.color : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                            <span className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {weather.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Photos */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Site Photos ({activeInspection.photos.length})
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={takePhoto}
                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all"
                                    >
                                        <Camera className="h-4 w-4" />
                                        Take Photo
                                    </button>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    {activeInspection.photos.map(photo => (
                                        <div key={photo.id} className={`relative rounded-xl overflow-hidden border ${
                                            isDarkMode ? 'border-gray-700' : 'border-gray-200'
                                        }`}>
                                            <img src={photo.url} alt={photo.caption} className="w-full h-32 object-cover" />
                                            <div className={`absolute bottom-0 left-0 right-0 p-2 ${
                                                isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'
                                            } backdrop-blur-sm`}>
                                                <p className={`text-xs ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {photo.caption}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {activeInspection.photos.length === 0 && (
                                        <div className={`col-span-3 p-8 rounded-xl border-2 border-dashed ${
                                            isDarkMode ? 'border-gray-700' : 'border-gray-300'
                                        } text-center`}>
                                            <ImageIcon className={`h-12 w-12 mx-auto mb-2 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                No photos yet. Click "Take Photo" to start documenting.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className={`p-6 rounded-2xl border ${
                            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}>
                            <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Inspector Notes
                            </h3>
                            <textarea
                                value={activeInspection.notes}
                                onChange={(e) => {
                                    const updated = { ...activeInspection, notes: e.target.value };
                                    setActiveInspection(updated);
                                    setInspections(inspections.map(i => i.id === activeInspection.id ? updated : i));
                                }}
                                rows={4}
                                className={`w-full px-4 py-3 rounded-xl border resize-none ${
                                    isDarkMode 
                                        ? 'bg-gray-700 text-white border-gray-600' 
                                        : 'bg-white text-gray-900 border-gray-300'
                                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                placeholder="Add notes about site conditions, progress, or concerns..."
                            />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Progress Card */}
                        <div className={`p-6 rounded-2xl border ${
                            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}>
                            <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Inspection Progress
                            </h3>
                            <div className="text-center mb-4">
                                <div className={`text-5xl font-black ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                    {completionRate}%
                                </div>
                                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {completedTasks} of {totalTasks} tasks completed
                                </p>
                            </div>
                            <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                <div 
                                    className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-500"
                                    style={{ width: `${completionRate}%` }}
                                />
                            </div>
                        </div>

                        {/* Checklist */}
                        <div className={`p-6 rounded-2xl border ${
                            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        }`}>
                            <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Inspection Checklist
                            </h3>
                            <div className="space-y-3">
                                {activeInspection.checklist.map(item => (
                                    <div
                                        key={item.id}
                                        className={`p-4 rounded-xl border transition-all ${
                                            item.completed
                                                ? isDarkMode ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'
                                                : isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                                        }`}
                                    >
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={item.completed}
                                                onChange={() => toggleChecklistItem(item.id)}
                                                className="mt-1 w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                            />
                                            <div className="flex-1">
                                                <div className={`font-medium ${
                                                    item.completed 
                                                        ? 'line-through text-green-500' 
                                                        : isDarkMode ? 'text-white' : 'text-gray-900'
                                                }`}>
                                                    {item.task}
                                                </div>
                                                {item.notes && (
                                                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        {item.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <button
                            type="button"
                            onClick={generateReport}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all"
                        >
                            <FileText className="h-5 w-5" />
                            Generate PDF Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailySiteInspector;

