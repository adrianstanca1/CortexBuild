import React from 'react';
import { Calendar, FileText, CheckCircle } from 'lucide-react';

const ContentCalendarApp: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = false }) => {
    return (
        <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 to-red-50'}`}>
            <div className="flex items-center gap-3 mb-8">
                <div className="p-4 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl shadow-lg">
                    <Calendar className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Content Calendar</h1>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Plan and schedule content</p>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <FileText className="w-8 h-8 text-orange-600 mb-3" />
                    <p className="text-sm text-gray-600">Scheduled</p>
                    <p className="text-3xl font-bold">47</p>
                </div>
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <CheckCircle className="w-8 h-8 text-green-600 mb-3" />
                    <p className="text-sm text-gray-600">Published</p>
                    <p className="text-3xl font-bold">128</p>
                </div>
                <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <FileText className="w-8 h-8 text-gray-600 mb-3" />
                    <p className="text-sm text-gray-600">Drafts</p>
                    <p className="text-3xl font-bold">23</p>
                </div>
            </div>
        </div>
    );
};

export default ContentCalendarApp;
