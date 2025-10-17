/**
 * Patient Appointment Manager - Healthcare scheduling and patient management
 */

import React, { useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface PatientAppointmentManagerProps {
    isDarkMode?: boolean;
}

interface Appointment {
    id: string;
    patientName: string;
    patientPhone: string;
    patientEmail: string;
    doctorName: string;
    appointmentType: string;
    date: Date;
    time: string;
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
    notes: string;
}

const PatientAppointmentManager: React.FC<PatientAppointmentManagerProps> = ({ isDarkMode = true }) => {
    const [appointments, setAppointments] = useState<Appointment[]>([
        {
            id: '1',
            patientName: 'John Smith',
            patientPhone: '(555) 123-4567',
            patientEmail: 'john@email.com',
            doctorName: 'Dr. Sarah Johnson',
            appointmentType: 'General Checkup',
            date: new Date(),
            time: '10:00 AM',
            status: 'confirmed',
            notes: 'Annual physical examination'
        },
        {
            id: '2',
            patientName: 'Emily Davis',
            patientPhone: '(555) 987-6543',
            patientEmail: 'emily@email.com',
            doctorName: 'Dr. Michael Chen',
            appointmentType: 'Follow-up',
            date: new Date(),
            time: '2:00 PM',
            status: 'scheduled',
            notes: 'Post-surgery checkup'
        }
    ]);

    const appointmentTypes = ['General Checkup', 'Follow-up', 'Consultation', 'Emergency', 'Vaccination'];
    const doctors = ['Dr. Sarah Johnson', 'Dr. Michael Chen', 'Dr. Lisa Anderson', 'Dr. Robert Taylor'];

    const updateStatus = (id: string, status: Appointment['status']) => {
        setAppointments(appointments.map(apt => apt.id === id ? { ...apt, status } : apt));
        toast.success(`Appointment ${status}`);
    };

    const todayAppointments = appointments.filter(apt => 
        apt.date.toDateString() === new Date().toDateString()
    );

    const confirmedCount = appointments.filter(apt => apt.status === 'confirmed').length;
    const completedCount = appointments.filter(apt => apt.status === 'completed').length;

    return (
        <div className={`min-h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-8`}>
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className={`text-4xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        🏥 Patient Appointment Manager
                    </h1>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Schedule and manage patient appointments efficiently
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
                        <Calendar className="h-8 w-8 mb-2" />
                        <div className="text-3xl font-bold">{todayAppointments.length}</div>
                        <div className="text-sm opacity-80">Today's Appointments</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
                        <CheckCircle className="h-8 w-8 mb-2" />
                        <div className="text-3xl font-bold">{confirmedCount}</div>
                        <div className="text-sm opacity-80">Confirmed</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
                        <Clock className="h-8 w-8 mb-2" />
                        <div className="text-3xl font-bold">{completedCount}</div>
                        <div className="text-sm opacity-80">Completed</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-6 text-white">
                        <User className="h-8 w-8 mb-2" />
                        <div className="text-3xl font-bold">{appointments.length}</div>
                        <div className="text-sm opacity-80">Total Patients</div>
                    </div>
                </div>

                {/* Appointments List */}
                <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Today's Schedule
                        </h2>
                        <button
                            type="button"
                            onClick={() => toast.success('New appointment form opened')}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all"
                        >
                            <Plus className="h-4 w-4" />
                            New Appointment
                        </button>
                    </div>

                    <div className="space-y-4">
                        {appointments.map(appointment => (
                            <div
                                key={appointment.id}
                                className={`p-4 rounded-xl border ${
                                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                                }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {appointment.patientName}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                appointment.status === 'confirmed' ? 'bg-green-500/20 text-green-500' :
                                                appointment.status === 'completed' ? 'bg-blue-500/20 text-blue-500' :
                                                appointment.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                                                'bg-yellow-500/20 text-yellow-500'
                                            }`}>
                                                {appointment.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                            <div className="flex items-center gap-2">
                                                <User className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {appointment.doctorName}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {appointment.time}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {appointment.patientPhone}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {appointment.patientEmail}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            <strong>Type:</strong> {appointment.appointmentType}
                                        </div>
                                        {appointment.notes && (
                                            <div className={`mt-2 p-3 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-white'}`}>
                                                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                    {appointment.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {appointment.status === 'scheduled' && (
                                        <button
                                            type="button"
                                            onClick={() => updateStatus(appointment.id, 'confirmed')}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-500 hover:bg-green-500/30 rounded-lg font-semibold transition-all"
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                            Confirm
                                        </button>
                                    )}
                                    {appointment.status === 'confirmed' && (
                                        <button
                                            type="button"
                                            onClick={() => updateStatus(appointment.id, 'completed')}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 rounded-lg font-semibold transition-all"
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                            Complete
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => updateStatus(appointment.id, 'cancelled')}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-lg font-semibold transition-all"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientAppointmentManager;

