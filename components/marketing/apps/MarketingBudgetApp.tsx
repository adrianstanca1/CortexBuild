import React from 'react';
import { DollarSign } from 'lucide-react';

const MarketingBudgetApp: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = false }) => {
    return (
        <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-emerald-50 to-emerald-100'}`}>
            <div className="flex items-center gap-3 mb-8">
                <div className="p-4 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl shadow-lg">
                    <DollarSign className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Marketing Budget</h1>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Track marketing spend</p>
                </div>
            </div>
            <div className={`p-8 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg text-center`}>
                <DollarSign className="w-16 h-16 mx-auto mb-4 text-emerald-600" />
                <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Marketing Budget</h2>
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Track marketing spend</p>
            </div>
        </div>
    );
};

export default MarketingBudgetApp;
