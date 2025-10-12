import React from 'react';
import { BarChart3, TrendingUp, DollarSign } from 'lucide-react';

const MarketingAnalyticsApp: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = false }) => {
    return (
        <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 to-blue-50'}`}>
            <div className="flex items-center gap-3 mb-8">
                <div className="p-4 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl shadow-lg">
                    <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Marketing Analytics</h1>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Track performance metrics</p>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <TrendingUp className="w-8 h-8 text-green-600 mb-3" />
                    <p className="text-sm text-gray-600">ROI</p>
                    <p className="text-3xl font-bold">245%</p>
                </div>
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <BarChart3 className="w-8 h-8 text-blue-600 mb-3" />
                    <p className="text-sm text-gray-600">Conversions</p>
                    <p className="text-3xl font-bold">1.2K</p>
                </div>
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <DollarSign className="w-8 h-8 text-emerald-600 mb-3" />
                    <p className="text-sm text-gray-600">Revenue</p>
                    <p className="text-3xl font-bold">$89K</p>
                </div>
            </div>
        </div>
    );
};

export default MarketingAnalyticsApp;
