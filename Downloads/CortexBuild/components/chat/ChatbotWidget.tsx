/**
 * Chatbot Widget Component
 * Global AI assistant present on all pages
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ToolResultMessage } from './ChatMessage';
import { v4 as uuidv4 } from 'uuid';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    toolResults?: any[];
}

export const ChatbotWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId] = useState(() => uuidv4());
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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
    }, []);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('constructai_token');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        };
    };

    const loadChatHistory = async () => {
        try {
            const response = await fetch(`/api/chat/message?sessionId=${sessionId}`, {
                headers: getAuthHeaders(),
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data.length > 0) {
                    setMessages(
                        data.data.map((msg: any) => ({
                            id: msg.id,
                            role: msg.role,
                            content: msg.content,
                            timestamp: new Date(msg.created_at),
                            toolResults: msg.metadata?.toolResults,
                        }))
                    );
                }
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }
    };

    const sendMessage = async () => {
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
            const response = await fetch('/api/chat/message', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    message: inputValue,
                    sessionId,
                    currentPage: window.location.pathname,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const data = await response.json();

            if (data.success) {
                const assistantMessage: Message = {
                    id: uuidv4(),
                    role: 'assistant',
                    content: data.data.message,
                    timestamp: new Date(),
                    toolResults: data.data.toolResults,
                };

                setMessages((prev) => [...prev, assistantMessage]);
            } else {
                throw new Error(data.error || 'Unknown error');
            }
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
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = async () => {
        if (confirm('Ești sigur că vrei să ștergi conversația?')) {
            try {
                await fetch(`/api/chat/message?sessionId=${sessionId}`, {
                    method: 'DELETE',
                });
                setMessages([]);
            } catch (error) {
                console.error('Failed to clear chat:', error);
            }
        }
    };

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
};

