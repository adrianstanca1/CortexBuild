/**
 * Chat Message Component
 * Displays individual chat messages with markdown support
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';

export interface ChatMessageProps {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: Date;
    isLoading?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
    role,
    content,
    timestamp,
    isLoading = false,
}) => {
    const isUser = role === 'user';
    const isAssistant = role === 'assistant';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`flex gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${isUser
                            ? 'bg-blue-600 text-white'
                            : 'bg-gradient-to-br from-purple-600 to-blue-600 text-white'
                        }`}
                >
                    {isUser ? '👤' : '🤖'}
                </div>

                {/* Message Content */}
                <div
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'
                        }`}
                >
                    <div
                        className={`rounded-2xl px-4 py-3 ${isUser
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                                <span className="text-sm text-gray-500">Gândesc...</span>
                            </div>
                        ) : (
                            <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : ''}`}>
                                <ReactMarkdown
                                    components={{
                                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                        ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                                        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                                        li: ({ children }) => <li className="mb-1">{children}</li>,
                                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                        code: ({ children }) => (
                                            <code className={`px-1 py-0.5 rounded text-xs ${isUser ? 'bg-blue-700' : 'bg-gray-200'
                                                }`}>
                                                {children}
                                            </code>
                                        ),
                                    }}
                                >
                                    {content}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>

                    {/* Timestamp */}
                    {timestamp && !isLoading && (
                        <span className="text-xs text-gray-500 mt-1 px-2">
                            {new Date(timestamp).toLocaleTimeString('ro-RO', {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * Tool Result Message Component
 * Displays results from tool executions
 */
export const ToolResultMessage: React.FC<{
    tool: string;
    success: boolean;
    message?: string;
    data?: any;
}> = ({ tool, success, message, data }) => {
    return (
        <div className="flex justify-center mb-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 max-w-[80%]">
                <div className="flex items-center gap-2 text-sm">
                    <span className={success ? 'text-green-600' : 'text-red-600'}>
                        {success ? '✅' : '❌'}
                    </span>
                    <span className="font-medium text-gray-700">
                        {tool.replace(/_/g, ' ')}
                    </span>
                    {message && (
                        <span className="text-gray-600">- {message}</span>
                    )}
                </div>
                {data && (
                    <div className="mt-2 text-xs text-gray-500">
                        <pre className="bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

