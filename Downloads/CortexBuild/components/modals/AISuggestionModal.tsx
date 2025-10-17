import React, { useState } from 'react';
// Fix: Corrected import paths to include file extensions.
import { AISuggestion, NotificationLink, User } from '../../types';
import { XMarkIcon, WandSparklesIcon, ArrowPathIcon, HandThumbUpIcon, HandThumbDownIcon } from '../Icons';
import * as api from '../../api';

interface AISuggestionModalProps {
    isOpen: boolean;
    isLoading: boolean;
    suggestion: AISuggestion | null;
    onClose: () => void;
    onAction: (link: NotificationLink) => void;
    currentUser: User;
}

const AISuggestionModal: React.FC<AISuggestionModalProps> = ({ isOpen, isLoading, suggestion, onClose, onAction, currentUser }) => {
    const [feedbackStatus, setFeedbackStatus] = useState<'up' | 'down' | null>(null);

    if (!isOpen) return null;

    const handleActionClick = () => {
        if (suggestion) {
            onAction(suggestion.action.link);
        }
    };

    const handleFeedback = async (feedback: 'up' | 'down') => {
        if (feedbackStatus || !suggestion) return;
        setFeedbackStatus(feedback);
        await api.submitAIFeedback(suggestion, feedback, currentUser);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <WandSparklesIcon className="w-6 h-6 text-purple-600" />
                        <h2 className="text-xl font-bold text-gray-800">AI Suggested Action</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                        <XMarkIcon className="w-6 h-6 text-gray-600" />
                    </button>
                </header>
                
                <div className="p-6 min-h-[150px] flex items-center justify-center">
                    {isLoading && (
                        <div className="text-center text-gray-600">
                            <ArrowPathIcon className="w-8 h-8 animate-spin mx-auto mb-2" />
                            <p>Analyzing your workload...</p>
                        </div>
                    )}
                    {!isLoading && suggestion && (
                        <div className="text-center">
                            <h3 className="text-lg font-bold text-gray-900">{suggestion.title}</h3>
                            <p className="text-md text-gray-600 mt-2">{suggestion.reason}</p>
                        </div>
                    )}
                     {!isLoading && !suggestion && (
                        <div className="text-center text-gray-600">
                            <p>Could not generate a suggestion at this time.</p>
                        </div>
                    )}
                </div>

                <footer className="p-4 bg-gray-50 border-t flex justify-between items-center gap-3">
                    <div className="flex items-center gap-2">
                        {!feedbackStatus ? (
                             <>
                                <button
                                    onClick={() => handleFeedback('up')}
                                    disabled={isLoading || !suggestion}
                                    className="p-2 rounded-full text-gray-500 hover:bg-green-100 hover:text-green-600 disabled:opacity-50 disabled:hover:bg-transparent"
                                    title="Good suggestion"
                                >
                                    <HandThumbUpIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleFeedback('down')}
                                    disabled={isLoading || !suggestion}
                                    className="p-2 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 disabled:opacity-50 disabled:hover:bg-transparent"
                                    title="Bad suggestion"
                                >
                                    <HandThumbDownIcon className="w-5 h-5" />
                                </button>
                            </>
                        ) : (
                            <p className="text-sm text-green-700 font-semibold p-2">Thank you for your feedback!</p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded font-semibold">
                            Cancel
                        </button>
                        <button 
                            onClick={handleActionClick}
                            disabled={isLoading || !suggestion}
                            className="px-4 py-2 bg-blue-600 text-white rounded font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Loading...' : (suggestion?.action.label || 'Action')}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AISuggestionModal;