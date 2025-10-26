// components/screens/AdvancedAnalyticsScreen.tsx
import React, { useState } from 'react';
import { AdvancedAnalyticsDashboard } from '../analytics/AdvancedAnalyticsDashboard';

interface AdvancedAnalyticsScreenProps {
    currentUser: any;
    projectId?: string;
}

export const AdvancedAnalyticsScreen: React.FC<AdvancedAnalyticsScreenProps> = ({
    currentUser,
    projectId
}) => {
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

    const handleTimeRangeChange = (range: '7d' | '30d' | '90d' | '1y') => {
        setTimeRange(range);
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Analytics</h1>
                <p className="text-gray-600">Comprehensive insights and performance metrics for your projects</p>
            </div>

            <AdvancedAnalyticsDashboard
                projectId={projectId}
                timeRange={timeRange}
                onTimeRangeChange={handleTimeRangeChange}
                className="min-h-[800px]"
            />
        </div>
    );
};
