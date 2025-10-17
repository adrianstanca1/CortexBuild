/**
 * App Preview - Live preview and testing
 */

import React, { useState } from 'react';
import {
    Smartphone,
    Tablet,
    Monitor,
    RotateCw,
    Download,
    Share2,
    Play,
    Bug,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AppPreviewProps {
    isDarkMode?: boolean;
    appName: string;
    appIcon: string;
}

const AppPreview: React.FC<AppPreviewProps> = ({ isDarkMode = true, appName, appIcon }) => {
    const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
    const [isRunning, setIsRunning] = useState(false);
    const [testResults, setTestResults] = useState<any[]>([]);

    const runTests = () => {
        setIsRunning(true);
        toast.loading('Running tests...');

        setTimeout(() => {
            const results = [
                { name: 'Database Connection', status: 'passed', time: '120ms' },
                { name: 'UI Rendering', status: 'passed', time: '45ms' },
                { name: 'API Integration', status: 'passed', time: '230ms' },
                { name: 'Performance', status: 'passed', time: '15ms' },
                { name: 'Security Scan', status: 'passed', time: '180ms' }
            ];
            setTestResults(results);
            setIsRunning(false);
            toast.dismiss();
            toast.success('All tests passed!');
        }, 2000);
    };

    const getDeviceSize = () => {
        switch (deviceType) {
            case 'mobile':
                return orientation === 'portrait' ? 'w-80 h-[600px]' : 'w-[600px] h-80';
            case 'tablet':
                return orientation === 'portrait' ? 'w-96 h-[700px]' : 'w-[700px] h-96';
            case 'desktop':
                return 'w-full h-[600px]';
            default:
                return 'w-80 h-[600px]';
        }
    };

    return (
        <div className="h-full flex gap-6">
            {/* Preview Area */}
            <div className="flex-1 flex flex-col">
                {/* Toolbar */}
                <div className={`flex items-center justify-between p-4 rounded-2xl border mb-4 ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setDeviceType('mobile')}
                            className={`p-2 rounded-lg transition-all ${
                                deviceType === 'mobile'
                                    ? 'bg-purple-600 text-white'
                                    : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                        >
                            <Smartphone className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setDeviceType('tablet')}
                            className={`p-2 rounded-lg transition-all ${
                                deviceType === 'tablet'
                                    ? 'bg-purple-600 text-white'
                                    : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                        >
                            <Tablet className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setDeviceType('desktop')}
                            className={`p-2 rounded-lg transition-all ${
                                deviceType === 'desktop'
                                    ? 'bg-purple-600 text-white'
                                    : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                        >
                            <Monitor className="h-5 w-5" />
                        </button>

                        <div className="w-px h-6 bg-gray-700 mx-2"></div>

                        <button
                            type="button"
                            onClick={() => setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait')}
                            className={`p-2 rounded-lg ${
                                isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                        >
                            <RotateCw className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={runTests}
                            disabled={isRunning}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
                        >
                            <Play className="h-4 w-4" />
                            Run Tests
                        </button>
                    </div>
                </div>

                {/* Device Preview */}
                <div className={`flex-1 flex items-center justify-center p-6 rounded-2xl border ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                    <div className={`${getDeviceSize()} transition-all duration-300`}>
                        <div className={`h-full rounded-3xl border-8 ${
                            isDarkMode ? 'border-gray-900 bg-gray-900' : 'border-gray-800 bg-white'
                        } shadow-2xl overflow-hidden`}>
                            {/* Status Bar */}
                            <div className={`h-12 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} flex items-center justify-between px-6`}>
                                <span className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    9:41
                                </span>
                                <div className="flex items-center gap-1">
                                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                                </div>
                            </div>

                            {/* App Content */}
                            <div className={`flex-1 p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                                <div className="text-center mb-8">
                                    <div className="text-6xl mb-4">{appIcon}</div>
                                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {appName}
                                    </h2>
                                    <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Preview Mode
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Your app is running in preview mode. Test all features before publishing.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Test Results Panel */}
            <div className={`w-96 p-6 rounded-2xl border ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
                <div className="flex items-center gap-2 mb-6">
                    <Bug className={`h-6 w-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Test Results
                    </h3>
                </div>

                {testResults.length === 0 ? (
                    <div className="text-center py-12">
                        <Play className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Click "Run Tests" to start testing
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {testResults.map((result, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-xl border ${
                                    result.status === 'passed'
                                        ? isDarkMode ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'
                                        : isDarkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {result.status === 'passed' ? (
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5 text-red-500" />
                                        )}
                                        <span className={`font-semibold ${
                                            result.status === 'passed' ? 'text-green-500' : 'text-red-500'
                                        }`}>
                                            {result.name}
                                        </span>
                                    </div>
                                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {result.time}
                                    </span>
                                </div>
                            </div>
                        ))}

                        <div className={`mt-6 p-4 rounded-xl ${
                            isDarkMode ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-50 border border-green-200'
                        }`}>
                            <div className="flex items-center gap-2 text-green-500">
                                <CheckCircle className="h-5 w-5" />
                                <span className="font-semibold">All tests passed!</span>
                            </div>
                            <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Your app is ready to publish
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppPreview;

