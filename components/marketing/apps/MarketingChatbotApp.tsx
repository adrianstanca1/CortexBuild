import React from 'react';
import { MessageSquare } from 'lucide-react';

const MarketingChatbotApp: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = false }) => {
    return (
        <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-violet-50 to-violet-100'}`}>
            <div className="flex items-center gap-3 mb-8">
                <div className="p-4 bg-gradient-to-br from-violet-600 to-violet-700 rounded-xl shadow-lg">
                    <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Marketing Chatbot</h1>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>AI-powered conversations</p>
                </div>
            </div>
            <div className={`p-8 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg text-center`}>
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-violet-600" />
                <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Marketing Chatbot</h2>
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>AI-powered conversations</p>
            </div>
        </div>
    );
};

export default MarketingChatbotApp;
