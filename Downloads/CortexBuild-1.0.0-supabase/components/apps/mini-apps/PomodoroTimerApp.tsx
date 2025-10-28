/**
 * Pomodoro Timer App - Productivity timer
 */

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';
import toast from 'react-hot-toast';

interface PomodoroTimerAppProps {
    isDarkMode?: boolean;
}

const PomodoroTimerApp: React.FC<PomodoroTimerAppProps> = ({ isDarkMode = true }) => {
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [completedPomodoros, setCompletedPomodoros] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isActive) {
            interval = setInterval(() => {
                if (seconds === 0) {
                    if (minutes === 0) {
                        // Timer completed
                        setIsActive(false);
                        if (!isBreak) {
                            setCompletedPomodoros(prev => prev + 1);
                            toast.success('Pomodoro completed! Time for a break!');
                            setIsBreak(true);
                            setMinutes(5);
                        } else {
                            toast.success('Break completed! Ready for another pomodoro?');
                            setIsBreak(false);
                            setMinutes(25);
                        }
                    } else {
                        setMinutes(minutes - 1);
                        setSeconds(59);
                    }
                } else {
                    setSeconds(seconds - 1);
                }
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, minutes, seconds, isBreak]);

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setMinutes(isBreak ? 5 : 25);
        setSeconds(0);
    };

    const progress = isBreak
        ? ((5 * 60 - (minutes * 60 + seconds)) / (5 * 60)) * 100
        : ((25 * 60 - (minutes * 60 + seconds)) / (25 * 60)) * 100;

    return (
        <div className={`min-h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-8 flex items-center justify-center`}>
            <div className="max-w-2xl w-full">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className={`text-4xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        ⏱️ Pomodoro Timer
                    </h1>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {isBreak ? 'Break Time' : 'Focus Time'}
                    </p>
                </div>

                {/* Timer Circle */}
                <div className="relative mb-12">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                        <circle
                            cx="100"
                            cy="100"
                            r="90"
                            stroke={isDarkMode ? '#374151' : '#E5E7EB'}
                            strokeWidth="8"
                            fill="none"
                        />
                        <circle
                            cx="100"
                            cy="100"
                            r="90"
                            stroke={isBreak ? '#10B981' : '#8B5CF6'}
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 90}`}
                            strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                            strokeLinecap="round"
                            className="transition-all duration-1000"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className={`text-7xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                            </div>
                            <div className={`text-lg mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {isBreak ? 'Take a break' : 'Stay focused'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4 mb-8">
                    <button
                        type="button"
                        onClick={toggleTimer}
                        className={`p-6 rounded-full ${
                            isBreak
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                        } text-white shadow-2xl transition-all transform hover:scale-110`}
                    >
                        {isActive ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                    </button>
                    <button
                        type="button"
                        onClick={resetTimer}
                        className={`p-6 rounded-full ${
                            isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'
                        } ${isDarkMode ? 'text-white' : 'text-gray-900'} shadow-xl transition-all transform hover:scale-110`}
                    >
                        <RotateCcw className="h-8 w-8" />
                    </button>
                </div>

                {/* Stats */}
                <div className={`p-6 rounded-2xl border ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                    <div className="grid grid-cols-2 gap-6 text-center">
                        <div>
                            <div className={`text-4xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                {completedPomodoros}
                            </div>
                            <div className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Completed Today
                            </div>
                        </div>
                        <div>
                            <div className={`text-4xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                                {completedPomodoros * 25}
                            </div>
                            <div className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Minutes Focused
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PomodoroTimerApp;

