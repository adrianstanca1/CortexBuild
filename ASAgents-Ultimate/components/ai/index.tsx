import React from 'react';
import { AIChat } from './AIChat';
import { AIFileUpload } from './AIFileUpload';
import { AIVoiceInput } from './AIVoiceInput';
import { AICodeAssistant } from './AICodeAssistant';
import type { ProcessedFile, AIProvider } from '../../services/ai/index';

// Export all AI components
export {
    AIChat,
    AIFileUpload,
    AIVoiceInput,
    AICodeAssistant
};

// Main AI Interface component that combines all capabilities
interface AIInterfaceProps {
    defaultView?: 'chat' | 'files' | 'voice' | 'code';
    defaultProvider?: AIProvider;
    onViewChange?: (view: string) => void;
    className?: string;
}

export const AIInterface: React.FC<AIInterfaceProps> = ({
    defaultView = 'chat',
    defaultProvider = 'gemini',
    onViewChange,
    className = ''
}) => {
    const [activeView, setActiveView] = React.useState(defaultView);
    const [conversationId, setConversationId] = React.useState<string>('');
    const [processedFiles, setProcessedFiles] = React.useState<ProcessedFile[]>([]);

    const handleViewChange = (view: string) => {
        setActiveView(view as typeof activeView);
        onViewChange?.(view);
    };

    const handleFilesProcessed = (files: ProcessedFile[]) => {
        setProcessedFiles(files);
        // Auto-switch to chat view with file context
        setActiveView('chat');
    };

    const handleVoiceTranscription = (transcript: string) => {
        // Auto-switch to chat view and send voice input
        setActiveView('chat');
        // Note: This would require extending AIChat to accept external input
    };

    const views = [
        { id: 'chat', name: 'Chat', icon: '💬', description: 'AI conversation' },
        { id: 'files', name: 'Files', icon: '📁', description: 'Multimodal analysis' },
        { id: 'voice', name: 'Voice', icon: '🎙️', description: 'Speech input' },
        { id: 'code', name: 'Code', icon: '👨‍💻', description: 'Code assistance' }
    ];

    return (
        <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex -mb-px">
                    {views.map((view) => (
                        <button
                            key={view.id}
                            onClick={() => handleViewChange(view.id)}
                            className={`group relative min-w-0 flex-1 overflow-hidden py-4 px-4 text-sm font-medium text-center hover:bg-gray-50 dark:hover:bg-gray-800 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${activeView === view.id
                                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                    : 'text-gray-500 dark:text-gray-400 border-b-2 border-transparent'
                                }`}
                        >
                            <div className="flex flex-col items-center space-y-1">
                                <span className="text-lg">{view.icon}</span>
                                <span>{view.name}</span>
                            </div>
                            {/* Active indicator */}
                            {activeView === view.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* View Content */}
            <div className="min-h-[500px]">
                {activeView === 'chat' && (
                    <AIChat
                        defaultProvider={defaultProvider}
                        onConversationChange={setConversationId}
                        className="h-[500px]"
                    />
                )}

                {activeView === 'files' && (
                    <div className="p-6">
                        <AIFileUpload
                            onFilesProcessed={handleFilesProcessed}
                            onAnalysisComplete={(analysis) => {
                                console.log('File analysis:', analysis);
                                // Could integrate this with chat
                            }}
                            maxFiles={10}
                        />

                        {processedFiles.length > 0 && (
                            <div className="mt-4 text-center">
                                <button
                                    onClick={() => handleViewChange('chat')}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500"
                                >
                                    Discuss Files in Chat ({processedFiles.length})
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeView === 'voice' && (
                    <div className="p-6">
                        <AIVoiceInput
                            onTranscriptionComplete={handleVoiceTranscription}
                            onError={(error) => console.error('Voice error:', error)}
                            language="en"
                        />
                    </div>
                )}

                {activeView === 'code' && (
                    <div className="p-6">
                        <AICodeAssistant
                            language="typescript"
                            filename="example.ts"
                            initialCode="// Start writing your code here...\n\n"
                        />
                    </div>
                )}
            </div>

            {/* Status Bar */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-4">
                        <span>AI Provider: {defaultProvider}</span>
                        {conversationId && <span>Session: Active</span>}
                        {processedFiles.length > 0 && (
                            <span>Files: {processedFiles.length} processed</span>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span>Ready</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Default export for easy importing
export default AIInterface;