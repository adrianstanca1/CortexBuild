import React from 'react';
import { Search, TrendingUp, Target, BarChart3 } from 'lucide-react';

const SEOOptimizerApp: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = false }) => {
    return (
        <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-green-50 to-emerald-50'}`}>
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-4 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg">
                        <Search className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            SEO Optimizer
                        </h1>
                        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Optimize content for search engines
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <Target className="w-8 h-8 text-green-600 mb-3" />
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Keywords Tracked</p>
                    <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>89</p>
                </div>
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <TrendingUp className="w-8 h-8 text-blue-600 mb-3" />
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Position</p>
                    <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>#12</p>
                </div>
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <BarChart3 className="w-8 h-8 text-purple-600 mb-3" />
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Traffic Growth</p>
                    <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>+34%</p>
                </div>
            </div>
        </div>
    );
};

export default SEOOptimizerApp;
