/**
 * Chatbot Widget Component
 * Global AI assistant present on all pages
 *
 * OPTIMIZATIONS (Copilot + Augment):
 * - React.memo for performance
 * - useCallback for event handlers
 * - Memoized auth headers
 * - Optimized re-renders
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChatMessage, ToolResultMessage } from './ChatMessage';
import { v4 as uuidv4 } from 'uuid';
import { LightErrorBoundary } from '../../src/components/ErrorBoundaries';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    toolResults?: any[];
}

export const ChatbotWidget: React.FC = React.memo(() => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId] = useState(() => uuidv4());
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Check if user is authenticated (checked after hooks to avoid hook rules violation)
    const isAuthenticated = useMemo(() => !!localStorage.getItem('constructai_token'), []);

    // Memoize auth headers
    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('constructai_token');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        };
    }, []);

    // Memoize load chat history function
    const loadChatHistory = useCallback(async () => {
        try {
            const data = await mockApi.getChatMessages(sessionId);
            if (data.messages && data.messages.length > 0) {
                setMessages(
                    data.messages.map((msg: any) => ({
                        id: msg.id,
                        role: msg.role,
                        content: msg.content,
                        timestamp: new Date(msg.timestamp),
                        toolResults: msg.toolResults,
                    }))
                );
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }
    }, [sessionId, getAuthHeaders]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    // Load chat history on mount
    useEffect(() => {
        loadChatHistory();
    }, [loadChatHistory]);

    const sendMessage = useCallback(async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: uuidv4(),
            role: 'user',
            content: inputValue,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const data = await mockApi.sendChatMessage(sessionId, inputValue);

            const assistantMessage: Message = {
                id: data.message.id,
                role: 'assistant',
                content: data.message.content,
                timestamp: new Date(data.message.timestamp),
                toolResults: undefined,
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error: any) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                id: uuidv4(),
                role: 'assistant',
                content: `❌ Ne pare rău, a apărut o eroare: ${error.message}. Te rog încearcă din nou.`,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [inputValue, isLoading, getAuthHeaders, sessionId]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }, [sendMessage]);

    const clearChat = useCallback(async () => {
        if (confirm('Ești sigur că vrei să ștergi conversația?')) {
            try {
                // Clear local messages (mock API doesn't need server call)
                setMessages([]);
            } catch (error) {
                console.error('Failed to clear chat:', error);
            }
        }
    }, [sessionId]);

    // Don't render if user is not authenticated
    if (!isAuthenticated) {
        return null;
    }

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 group"
                    aria-label="Open AI Assistant"
                >
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                        🤖
                    </span>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                                🤖
                            </div>
                            <div>
                                <h3 className="font-semibold">ConstructAI Assistant</h3>
                                <p className="text-xs text-white/80">Asistentul tău AI personal</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={clearChat}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                title="Șterge conversația"
                            >
                                🗑️
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                title="Închide"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                                <div className="text-6xl mb-4">👋</div>
                                <h4 className="font-semibold text-gray-700 mb-2">
                                    Bine ai venit!
                                </h4>
                                <p className="text-sm">
                                    Sunt asistentul tău AI personal.
                                    <br />
                                    Cum te pot ajuta astăzi?
                                </p>
                                <div className="mt-4 text-xs text-gray-400">
                                    <p>Încearcă să întrebi:</p>
                                    <ul className="mt-2 space-y-1">
                                        <li>• "Câte proiecte active am?"</li>
                                        <li>• "Care e statusul financiar?"</li>
                                        <li>• "Creează un proiect nou"</li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <>
                                {messages.map((message) => (
                                    <React.Fragment key={message.id}>
                                        <ChatMessage
                                            role={message.role}
                                            content={message.content}
                                            timestamp={message.timestamp}
                                        />
                                        {message.toolResults?.map((result, idx) => (
                                            <ToolResultMessage
                                                key={`${message.id}-tool-${idx}`}
                                                {...result}
                                            />
                                        ))}
                                    </React.Fragment>
                                ))}
                                {isLoading && (
                                    <ChatMessage
                                        role="assistant"
                                        content=""
                                        isLoading={true}
                                    />
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Scrie un mesaj..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={sendMessage}
                                disabled={!inputValue.trim() || isLoading}
                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? '⏳' : '📤'}
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-center">
                            Powered by Google Gemini AI
                        </p>
                    </div>
                </div>
            )}
        </>
    );
});

// Display name for debugging
ChatbotWidget.displayName = 'ChatbotWidget';

// Wrap with LightErrorBoundary
const WrappedChatbotWidget: React.FC = () => {
    return (
        <LightErrorBoundary
            fallback={
                <div className="fixed bottom-6 right-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg max-w-sm">
                    <p className="text-red-800 dark:text-red-300 text-sm">
                        ⚠️ Chat temporarily unavailable. Please refresh the page.
                    </p>
                </div>
            }
        >
            <ChatbotWidget />
        </LightErrorBoundary>
    );
};

export default WrappedChatbotWidget;

