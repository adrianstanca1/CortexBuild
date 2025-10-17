/**
 * Crew Time Tracker - Labor hours and attendance tracking
 */

import React, { useState } from 'react';
import { Clock, MapPin, Users, Calendar, Download, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface CrewTimeTrackerProps {
    isDarkMode?: boolean;
}

interface CrewMember {
    id: string;
    name: string;
    role: string;
    status: 'clocked-in' | 'clocked-out' | 'on-break';
    clockInTime?: Date;
    totalHours: number;
    overtimeHours: number;
}

interface TimeEntry {
    id: string;
    worker: string;
    date: Date;
    clockIn: Date;
    clockOut?: Date;
    breakTime: number;
    totalHours: number;
    location: string;
}

const CrewTimeTracker: React.FC<CrewTimeTrackerProps> = ({ isDarkMode = true }) => {
    const [crew, setCrew] = useState<CrewMember[]>([
        { id: '1', name: 'John Smith', role: 'Foreman', status: 'clocked-in', clockInTime: new Date(Date.now() - 4 * 60 * 60 * 1000), totalHours: 38.5, overtimeHours: 2.5 },
        { id: '2', name: 'Mike Johnson', role: 'Carpenter', status: 'clocked-in', clockInTime: new Date(Date.now() - 3.5 * 60 * 60 * 1000), totalHours: 40, overtimeHours: 0 },
        { id: '3', name: 'Sarah Williams', role: 'Electrician', status: 'on-break', totalHours: 35, overtimeHours: 0 },
        { id: '4', name: 'Tom Brown', role: 'Laborer', status: 'clocked-out', totalHours: 42, overtimeHours: 2 }
    ]);

    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);

    const clockIn = (member: CrewMember) => {
        setCrew(crew.map(m => m.id === member.id ? { ...m, status: 'clocked-in', clockInTime: new Date() } : m));
        toast.success(`${member.name} clocked in`);
    };

    const clockOut = (member: CrewMember) => {
        setCrew(crew.map(m => m.id === member.id ? { ...m, status: 'clocked-out', clockInTime: undefined } : m));
        toast.success(`${member.name} clocked out`);
    };

    const activeWorkers = crew.filter(m => m.status === 'clocked-in').length;
    const totalHoursToday = crew.reduce((sum, m) => sum + (m.clockInTime ? (Date.now() - m.clockInTime.getTime()) / (1000 * 60 * 60) : 0), 0);
    const totalOvertimeWeek = crew.reduce((sum, m) => sum + m.overtimeHours, 0);

    return (
        <div className={`min-h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-8`}>
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className={`text-4xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        👷 Crew Time Tracker
                    </h1>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Track labor hours and manage crew attendance
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
                        <Users className="h-8 w-8 mb-2" />
                        <div className="text-3xl font-bold">{activeWorkers}</div>
                        <div className="text-sm opacity-80">Active Workers</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
                        <Clock className="h-8 w-8 mb-2" />
                        <div className="text-3xl font-bold">{totalHoursToday.toFixed(1)}h</div>
                        <div className="text-sm opacity-80">Hours Today</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
                        <TrendingUp className="h-8 w-8 mb-2" />
                        <div className="text-3xl font-bold">{totalOvertimeWeek.toFixed(1)}h</div>
                        <div className="text-sm opacity-80">Overtime This Week</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-6 text-white">
                        <Calendar className="h-8 w-8 mb-2" />
                        <div className="text-3xl font-bold">{crew.length}</div>
                        <div className="text-sm opacity-80">Total Crew</div>
                    </div>
                </div>

                {/* Crew List */}
                <div className={`p-6 rounded-2xl border mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Crew Members
                        </h2>
                        <button
                            type="button"
                            onClick={() => toast.success('Exporting timesheet...')}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all"
                        >
                            <Download className="h-4 w-4" />
                            Export Timesheet
                        </button>
                    </div>

                    <div className="space-y-3">
                        {crew.map(member => {
                            const hoursWorked = member.clockInTime 
                                ? ((Date.now() - member.clockInTime.getTime()) / (1000 * 60 * 60)).toFixed(1)
                                : '0.0';

                            return (
                                <div
                                    key={member.id}
                                    className={`p-4 rounded-xl border ${
                                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                                                member.status === 'clocked-in' ? 'bg-green-500' :
                                                member.status === 'on-break' ? 'bg-yellow-500' :
                                                'bg-gray-500'
                                            }`}>
                                                {member.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {member.name}
                                                </h3>
                                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {member.role}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    Today
                                                </div>
                                                <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {hoursWorked}h
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    This Week
                                                </div>
                                                <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {member.totalHours}h
                                                </div>
                                            </div>

                                            {member.status === 'clocked-in' ? (
                                                <button
                                                    type="button"
                                                    onClick={() => clockOut(member)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-lg font-semibold transition-all"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                    Clock Out
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => clockIn(member)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-500 hover:bg-green-500/30 rounded-lg font-semibold transition-all"
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                    Clock In
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {member.clockInTime && (
                                        <div className={`mt-3 pt-3 border-t flex items-center gap-4 text-sm ${
                                            isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-200 text-gray-600'
                                        }`}>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                <span>Clocked in at {member.clockInTime.toLocaleTimeString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                <span>Site A - Building 3</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CrewTimeTracker;

