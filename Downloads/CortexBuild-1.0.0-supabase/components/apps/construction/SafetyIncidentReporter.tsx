/**
 * Safety Incident Reporter - Quick incident logging and compliance tracking
 */

import React, { useState } from 'react';
import { AlertTriangle, Camera, MapPin, Clock, User, FileText, Send, TrendingDown, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

interface SafetyIncidentReporterProps {
    isDarkMode?: boolean;
}

interface Incident {
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    location: string;
    reporter: string;
    date: Date;
    photos: string[];
    status: 'reported' | 'investigating' | 'resolved';
}

const SafetyIncidentReporter: React.FC<SafetyIncidentReporterProps> = ({ isDarkMode = true }) => {
    const [incidents, setIncidents] = useState<Incident[]>([
        {
            id: '1',
            type: 'Near Miss',
            severity: 'medium',
            description: 'Worker almost struck by falling debris',
            location: 'Building 3, Floor 2',
            reporter: 'John Smith',
            date: new Date(),
            photos: [],
            status: 'investigating'
        }
    ]);

    const [newIncident, setNewIncident] = useState({
        type: '',
        severity: 'low' as 'low' | 'medium' | 'high' | 'critical',
        description: '',
        location: ''
    });

    const incidentTypes = ['Near Miss', 'Injury', 'Property Damage', 'Safety Violation', 'Equipment Failure'];
    const severityLevels = [
        { value: 'low', label: 'Low', color: 'from-green-600 to-emerald-600' },
        { value: 'medium', label: 'Medium', color: 'from-yellow-600 to-orange-600' },
        { value: 'high', label: 'High', color: 'from-orange-600 to-red-600' },
        { value: 'critical', label: 'Critical', color: 'from-red-600 to-pink-600' }
    ];

    const submitIncident = () => {
        if (!newIncident.type || !newIncident.description) {
            toast.error('Please fill all required fields');
            return;
        }

        const incident: Incident = {
            id: Date.now().toString(),
            ...newIncident,
            reporter: 'Current User',
            date: new Date(),
            photos: [],
            status: 'reported'
        };

        setIncidents([incident, ...incidents]);
        setNewIncident({ type: '', severity: 'low', description: '', location: '' });
        toast.success('Incident reported successfully!');
    };

    return (
        <div className={`min-h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-8`}>
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className={`text-4xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        ⚠️ Safety Incident Reporter
                    </h1>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Report and track safety incidents in real-time
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl p-6 text-white">
                        <AlertTriangle className="h-8 w-8 mb-2" />
                        <div className="text-3xl font-bold">{incidents.length}</div>
                        <div className="text-sm opacity-80">Total Incidents</div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-2xl p-6 text-white">
                        <Clock className="h-8 w-8 mb-2" />
                        <div className="text-3xl font-bold">{incidents.filter(i => i.status === 'investigating').length}</div>
                        <div className="text-sm opacity-80">Under Investigation</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
                        <Shield className="h-8 w-8 mb-2" />
                        <div className="text-3xl font-bold">{incidents.filter(i => i.status === 'resolved').length}</div>
                        <div className="text-sm opacity-80">Resolved</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
                        <TrendingDown className="h-8 w-8 mb-2" />
                        <div className="text-3xl font-bold">-15%</div>
                        <div className="text-sm opacity-80">vs Last Month</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Report Form */}
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Report New Incident
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Incident Type *
                                </label>
                                <select
                                    value={newIncident.type}
                                    onChange={(e) => setNewIncident({ ...newIncident, type: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-xl border ${
                                        isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-red-500`}
                                >
                                    <option value="">Select type...</option>
                                    {incidentTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Severity Level *
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {severityLevels.map(level => (
                                        <button
                                            key={level.value}
                                            type="button"
                                            onClick={() => setNewIncident({ ...newIncident, severity: level.value as any })}
                                            className={`p-3 rounded-xl border-2 transition-all ${
                                                newIncident.severity === level.value
                                                    ? `border-transparent bg-gradient-to-r ${level.color} text-white`
                                                    : isDarkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            {level.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Location
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newIncident.location}
                                        onChange={(e) => setNewIncident({ ...newIncident, location: e.target.value })}
                                        placeholder="Building, floor, area..."
                                        className={`flex-1 px-4 py-3 rounded-xl border ${
                                            isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                                        } focus:outline-none focus:ring-2 focus:ring-red-500`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toast.success('GPS location captured')}
                                        className="p-3 bg-blue-500/20 text-blue-500 rounded-xl hover:bg-blue-500/30"
                                    >
                                        <MapPin className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Description *
                                </label>
                                <textarea
                                    value={newIncident.description}
                                    onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                                    rows={4}
                                    placeholder="Describe what happened..."
                                    className={`w-full px-4 py-3 rounded-xl border resize-none ${
                                        isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                                    } focus:outline-none focus:ring-2 focus:ring-red-500`}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => toast.success('Photo captured')}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed transition-all ${
                                    isDarkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                <Camera className="h-5 w-5" />
                                <span>Add Photos/Videos</span>
                            </button>

                            <button
                                type="button"
                                onClick={submitIncident}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all"
                            >
                                <Send className="h-5 w-5" />
                                Submit Incident Report
                            </button>
                        </div>
                    </div>

                    {/* Recent Incidents */}
                    <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Recent Incidents
                        </h2>

                        <div className="space-y-4">
                            {incidents.map(incident => {
                                const severityColor = severityLevels.find(s => s.value === incident.severity)?.color || 'from-gray-600 to-gray-700';
                                return (
                                    <div
                                        key={incident.id}
                                        className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {incident.type}
                                                </h3>
                                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {incident.location}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${severityColor} text-white`}>
                                                {incident.severity.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            {incident.description}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs">
                                            <div className="flex items-center gap-1">
                                                <User className={`h-3 w-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{incident.reporter}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className={`h-3 w-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{incident.date.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SafetyIncidentReporter;

