/**
 * Habit Tracker App - Track daily habits
 */

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, TrendingUp, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { habitService } from '../../../lib/services/marketplaceAppsService';

interface Habit {
    id: string;
    name: string;
    icon: string;
    color: string;
    streak: number;
    completedToday: boolean;
}

interface HabitTrackerAppProps {
    isDarkMode?: boolean;
    currentUser?: any;
}

const HabitTrackerApp: React.FC<HabitTrackerAppProps> = ({ isDarkMode = true, currentUser }) => {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [newHabitName, setNewHabitName] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadHabits();
    }, [currentUser]);

    const loadHabits = async () => {
        if (!currentUser?.id) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await habitService.getAll(currentUser.id);
            const today = new Date().toISOString().split('T')[0];
            setHabits(data.map(h => ({
                id: h.id,
                name: h.name,
                icon: h.icon,
                color: h.color,
                streak: h.streak,
                completedToday: h.last_completed === today
            })));
        } catch (error) {
            console.error('Failed to load habits:', error);
            toast.error('Failed to load habits');
        } finally {
            setLoading(false);
        }
    };

    const habitIcons = ['💪', '📚', '🧘', '💧', '🏃', '🎯', '✍️', '🎨', '🎵', '🌱'];
    const habitColors = [
        'from-blue-600 to-cyan-600',
        'from-purple-600 to-pink-600',
        'from-green-600 to-emerald-600',
        'from-orange-600 to-red-600',
        'from-yellow-600 to-orange-600'
    ];

    const addHabit = async () => {
        if (!newHabitName.trim()) {
            toast.error('Please enter a habit name');
            return;
        }

        if (!currentUser?.id) {
            toast.error('Please log in to add habits');
            return;
        }

        try {
            setSaving(true);
            const icon = habitIcons[Math.floor(Math.random() * habitIcons.length)];
            const color = habitColors[Math.floor(Math.random() * habitColors.length)];
            const newHabit = await habitService.create(currentUser.id, newHabitName, icon, color);
            setHabits([...habits, {
                id: newHabit.id,
                name: newHabit.name,
                icon: newHabit.icon,
                color: newHabit.color,
                streak: newHabit.streak,
                completedToday: false
            }]);
            setNewHabitName('');
            toast.success('Habit added!');
        } catch (error) {
            console.error('Failed to add habit:', error);
            toast.error('Failed to add habit');
        } finally {
            setSaving(false);
        }
    };

    const toggleHabit = async (id: string) => {
        try {
            setSaving(true);
            await habitService.toggleCompletion(id);
            await loadHabits();
            toast.success('Habit updated!');
        } catch (error) {
            console.error('Failed to toggle habit:', error);
            toast.error('Failed to update habit');
        } finally {
            setSaving(false);
        }
    };

    const deleteHabit = async (id: string) => {
        try {
            setSaving(true);
            await habitService.delete(id);
            setHabits(habits.filter(h => h.id !== id));
            toast.success('Habit deleted!');
        } catch (error) {
            console.error('Failed to delete habit:', error);
            toast.error('Failed to delete habit');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className={`min-h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-8 flex items-center justify-center`}>
                <div className="text-center">
                    <Loader2 className={`h-12 w-12 animate-spin mx-auto mb-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Loading habits...
                    </p>
                </div>
            </div>
        );
    }

    const completedToday = habits.filter(h => h.completedToday).length;
    const totalHabits = habits.length;
    const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

    return (
        <div className={`min-h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-8`}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className={`text-4xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        🎯 Habit Tracker
                    </h1>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Build better habits, one day at a time
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
                        <div className="text-sm opacity-80 mb-2">Today's Progress</div>
                        <div className="text-4xl font-bold">{completionRate}%</div>
                        <div className="text-sm opacity-80 mt-2">{completedToday} of {totalHabits} completed</div>
                    </div>

                    <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
                        <div className="text-sm opacity-80 mb-2">Best Streak</div>
                        <div className="text-4xl font-bold">{Math.max(...habits.map(h => h.streak), 0)}</div>
                        <div className="text-sm opacity-80 mt-2">days in a row</div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
                        <div className="text-sm opacity-80 mb-2">Total Habits</div>
                        <div className="text-4xl font-bold">{totalHabits}</div>
                        <div className="text-sm opacity-80 mt-2">being tracked</div>
                    </div>
                </div>

                {/* Add Habit */}
                <div className={`p-6 rounded-2xl border mb-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newHabitName}
                            onChange={(e) => setNewHabitName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addHabit()}
                            placeholder="Add a new habit..."
                            className={`flex-1 px-4 py-3 rounded-xl border ${isDarkMode
                                ? 'bg-gray-700 text-white border-gray-600'
                                : 'bg-white text-gray-900 border-gray-300'
                                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        />
                        <button
                            type="button"
                            onClick={addHabit}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all"
                        >
                            <Plus className="h-5 w-5" />
                            Add
                        </button>
                    </div>
                </div>

                {/* Habits List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {habits.map(habit => (
                        <div
                            key={habit.id}
                            className={`p-6 rounded-2xl border transition-all ${habit.completedToday
                                ? `bg-gradient-to-br ${habit.color} text-white border-transparent`
                                : isDarkMode
                                    ? 'bg-gray-800 border-gray-700 hover:border-purple-500'
                                    : 'bg-white border-gray-200 hover:border-purple-500'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`text-4xl ${habit.completedToday ? '' : 'opacity-50'}`}>
                                        {habit.icon}
                                    </div>
                                    <div>
                                        <h3 className={`text-xl font-bold ${habit.completedToday ? 'text-white' : isDarkMode ? 'text-white' : 'text-gray-900'
                                            }`}>
                                            {habit.name}
                                        </h3>
                                        <div className={`flex items-center gap-2 mt-1 ${habit.completedToday ? 'text-white/80' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                            <TrendingUp className="h-4 w-4" />
                                            <span className="text-sm">{habit.streak} day streak</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => deleteHabit(habit.id)}
                                    className={`p-2 rounded-lg transition-colors ${habit.completedToday
                                        ? 'hover:bg-white/20 text-white/80'
                                        : isDarkMode
                                            ? 'hover:bg-red-500/20 text-red-400'
                                            : 'hover:bg-red-50 text-red-500'
                                        }`}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => toggleHabit(habit.id)}
                                className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${habit.completedToday
                                    ? 'bg-white/20 hover:bg-white/30 text-white'
                                    : `bg-gradient-to-r ${habit.color} hover:opacity-90 text-white`
                                    }`}
                            >
                                {habit.completedToday ? (
                                    <>
                                        <Check className="h-5 w-5" />
                                        Completed Today
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-5 w-5" />
                                        Mark as Done
                                    </>
                                )}
                            </button>

                            <div className={`mt-3 text-center text-sm ${habit.completedToday ? 'text-white/70' : isDarkMode ? 'text-gray-500' : 'text-gray-600'
                                }`}>
                                Completed {habit.totalCompleted} times
                            </div>
                        </div>
                    ))}
                </div>

                {habits.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🎯</div>
                        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            No habits yet. Add one above to get started!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HabitTrackerApp;

