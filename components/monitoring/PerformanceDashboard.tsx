/**
 * Performance Dashboard
 * Task 3.2: Performance Monitoring
 * 
 * Real-time performance metrics dashboard
 */

import React, { useState } from 'react';
import { usePerformanceMetrics } from '../../src/hooks/usePerformanceMetrics';
import { Activity, Zap, Clock, Database, Wifi, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface PerformanceDashboardProps {
    isDarkMode?: boolean;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ isDarkMode = true }) => {
    const { metrics, webVitals, isLoading, refreshMetrics } = usePerformanceMetrics();
    const [activeTab, setActiveTab] = useState<'overview' | 'vitals' | 'performance' | 'session'>('overview');

    if (isLoading || !metrics || !webVitals) {
        return (
            <div className={`flex items-center justify-center h-64 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    const getRatingColor = (rating: string) => {
        switch (rating) {
            case 'good': return 'text-green-500';
            case 'needs-improvement': return 'text-yellow-500';
            case 'poor': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    const getRatingIcon = (rating: string) => {
        switch (rating) {
            case 'good': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'needs-improvement': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'poor': return <XCircle className="h-5 w-5 text-red-500" />;
            default: return null;
        }
    };

    const formatMetric = (value: number | null, unit: string = 'ms') => {
        if (value === null) return 'N/A';
        if (unit === 'score') return Math.round(value);
        if (unit === 'CLS') return value.toFixed(3);
        return `${Math.round(value)}${unit}`;
    };

    return (
        <div className={`p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Activity className="h-8 w-8 text-blue-500" />
                    <div>
                        <h1 className="text-2xl font-bold">Performance Dashboard</h1>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Real-time performance monitoring
                        </p>
                    </div>
                </div>
                <button
                    onClick={refreshMetrics}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    Refresh
                </button>
            </div>

            {/* Performance Score */}
            <div className={`mb-6 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Overall Performance Score</h2>
                        <div className="flex items-center gap-2">
                            {getRatingIcon(webVitals.rating)}
                            <span className={`text-sm font-medium ${getRatingColor(webVitals.rating)}`}>
                                {webVitals.rating.toUpperCase().replace('-', ' ')}
                            </span>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-5xl font-bold text-blue-500">
                            {webVitals.score}
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            out of 100
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-700">
                {['overview', 'vitals', 'performance', 'session'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === tab
                                ? 'border-b-2 border-blue-500 text-blue-500'
                                : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Web Vitals Summary */}
                    <MetricCard
                        title="LCP"
                        value={formatMetric(metrics.webVitals.LCP)}
                        rating={webVitals.LCP?.rating || 'poor'}
                        icon={<Zap />}
                        isDarkMode={isDarkMode}
                    />
                    <MetricCard
                        title="INP"
                        value={formatMetric(metrics.webVitals.INP)}
                        rating={webVitals.INP?.rating || 'poor'}
                        icon={<Clock />}
                        isDarkMode={isDarkMode}
                    />
                    <MetricCard
                        title="CLS"
                        value={formatMetric(metrics.webVitals.CLS, 'CLS')}
                        rating={webVitals.CLS?.rating || 'poor'}
                        icon={<Activity />}
                        isDarkMode={isDarkMode}
                    />
                    
                    {/* Performance Summary */}
                    <MetricCard
                        title="Avg Component Render"
                        value={formatMetric(metrics.performance.avgComponentRenderTime)}
                        rating={metrics.performance.avgComponentRenderTime < 16 ? 'good' : 'needs-improvement'}
                        icon={<Activity />}
                        isDarkMode={isDarkMode}
                    />
                    <MetricCard
                        title="Avg API Response"
                        value={formatMetric(metrics.performance.avgApiResponseTime)}
                        rating={metrics.performance.avgApiResponseTime < 1000 ? 'good' : 'needs-improvement'}
                        icon={<Database />}
                        isDarkMode={isDarkMode}
                    />
                    <MetricCard
                        title="Network Quality"
                        value={metrics.network?.effectiveType || 'Unknown'}
                        rating="good"
                        icon={<Wifi />}
                        isDarkMode={isDarkMode}
                    />
                </div>
            )}

            {/* Web Vitals Tab */}
            {activeTab === 'vitals' && (
                <div className="space-y-4">
                    <VitalRow title="LCP (Largest Contentful Paint)" value={metrics.webVitals.LCP} unit="ms" rating={webVitals.LCP?.rating} threshold="< 2.5s" isDarkMode={isDarkMode} />
                    <VitalRow title="INP (Interaction to Next Paint)" value={metrics.webVitals.INP} unit="ms" rating={webVitals.INP?.rating} threshold="< 200ms" isDarkMode={isDarkMode} />
                    <VitalRow title="CLS (Cumulative Layout Shift)" value={metrics.webVitals.CLS} unit="" rating={webVitals.CLS?.rating} threshold="< 0.1" isDarkMode={isDarkMode} />
                    <VitalRow title="FCP (First Contentful Paint)" value={metrics.webVitals.FCP} unit="ms" rating={webVitals.FCP?.rating} threshold="< 1.8s" isDarkMode={isDarkMode} />
                    <VitalRow title="TTFB (Time to First Byte)" value={metrics.webVitals.TTFB} unit="ms" rating={webVitals.TTFB?.rating} threshold="< 600ms" isDarkMode={isDarkMode} />
                    <VitalRow title="INP (Interaction to Next Paint)" value={metrics.webVitals.INP} unit="ms" rating={webVitals.INP?.rating} threshold="< 200ms" isDarkMode={isDarkMode} />
                </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatCard title="Long Tasks" value={metrics.performance.longTasksCount} isDarkMode={isDarkMode} />
                    <StatCard title="Layout Shifts" value={metrics.performance.layoutShiftsCount} isDarkMode={isDarkMode} />
                    <StatCard title="Slow Resources" value={metrics.performance.slowResourcesCount} isDarkMode={isDarkMode} />
                    <StatCard title="Avg Component Render" value={`${Math.round(metrics.performance.avgComponentRenderTime)}ms`} isDarkMode={isDarkMode} />
                    <StatCard title="Avg API Response" value={`${Math.round(metrics.performance.avgApiResponseTime)}ms`} isDarkMode={isDarkMode} />
                    {metrics.memory && (
                        <StatCard 
                            title="Memory Usage" 
                            value={`${Math.round(metrics.memory.usedJSHeapSize / 1024 / 1024)}MB`} 
                            isDarkMode={isDarkMode} 
                        />
                    )}
                </div>
            )}

            {/* Session Tab */}
            {activeTab === 'session' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatCard title="Session Duration" value={`${Math.round(metrics.session.duration / 1000)}s`} isDarkMode={isDarkMode} />
                    <StatCard title="Page Views" value={metrics.session.pageViews} isDarkMode={isDarkMode} />
                    <StatCard title="User Actions" value={metrics.session.actions} isDarkMode={isDarkMode} />
                    <StatCard title="Errors" value={metrics.session.errors} isDarkMode={isDarkMode} />
                    {metrics.network && (
                        <>
                            <StatCard title="Network Type" value={metrics.network.effectiveType} isDarkMode={isDarkMode} />
                            <StatCard title="Network Speed" value={`${metrics.network.downlink} Mbps`} isDarkMode={isDarkMode} />
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

// Metric Card Component
const MetricCard: React.FC<{
    title: string;
    value: string | number;
    rating: string;
    icon: React.ReactNode;
    isDarkMode: boolean;
}> = ({ title, value, rating, icon, isDarkMode }) => {
    const getRatingColor = (rating: string) => {
        switch (rating) {
            case 'good': return 'border-green-500';
            case 'needs-improvement': return 'border-yellow-500';
            case 'poor': return 'border-red-500';
            default: return 'border-gray-500';
        }
    };

    return (
        <div className={`p-4 rounded-lg border-l-4 ${getRatingColor(rating)} ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className="flex items-center gap-2 mb-2">
                <div className="text-blue-500">{icon}</div>
                <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{title}</h3>
            </div>
            <div className="text-2xl font-bold">{value}</div>
        </div>
    );
};

// Vital Row Component
const VitalRow: React.FC<{
    title: string;
    value: number | null;
    unit: string;
    rating?: string;
    threshold: string;
    isDarkMode: boolean;
}> = ({ title, value, unit, rating, threshold, isDarkMode }) => {
    const getRatingColor = (rating?: string) => {
        switch (rating) {
            case 'good': return 'text-green-500';
            case 'needs-improvement': return 'text-yellow-500';
            case 'poor': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-medium">{title}</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Target: {threshold}</p>
                </div>
                <div className="text-right">
                    <div className={`text-2xl font-bold ${getRatingColor(rating)}`}>
                        {value !== null ? (unit === '' ? value.toFixed(3) : `${Math.round(value)}${unit}`) : 'N/A'}
                    </div>
                    {rating && (
                        <div className={`text-sm ${getRatingColor(rating)}`}>
                            {rating.toUpperCase().replace('-', ' ')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard: React.FC<{
    title: string;
    value: string | number;
    isDarkMode: boolean;
}> = ({ title, value, isDarkMode }) => {
    return (
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <h3 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{title}</h3>
            <div className="text-2xl font-bold">{value}</div>
        </div>
    );
};

export default PerformanceDashboard;

