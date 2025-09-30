import React, { useState, useRef, useCallback, useEffect } from 'react';
import { aiSystem } from '../../services/ai/index';
import type { AIProvider } from '../../services/ai/index';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    provider?: AIProvider;
}

interface AIChatProps {
    onConversationChange?: (conversationId: string) => void;
    defaultProvider?: AIProvider;
    className?: string;
}

export const AIChat: React.FC<AIChatProps> = ({
    onConversationChange,
    defaultProvider = 'gemini',
    className = ''
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [selectedProvider, setSelectedProvider] = useState<AIProvider>(defaultProvider);
    const [isStreaming, setIsStreaming] = useState(false);
    const [currentStreamingMessage, setCurrentStreamingMessage] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Initialize conversation
    const initializeConversation = useCallback(() => {
        if (!conversationId) {
            const newConversationId = aiSystem.conversationManager.createConversation(
                'AI Chat Session',
                'general',
                'auto'
            );
            setConversationId(newConversationId);
            onConversationChange?.(newConversationId);
            return newConversationId;
        }
        return conversationId;
    }, [conversationId, onConversationChange]);

    // Send message handler
    const handleSendMessage = useCallback(async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setIsStreaming(true);
        setCurrentStreamingMessage('');

        try {
            const activeConversationId = initializeConversation();

            // Use streaming for better UX
            let fullResponse = '';
            const assistantMessageId = crypto.randomUUID();

            const response = await aiSystem.conversationManager.streamMessage(
                activeConversationId,
                userMessage.content,
                (chunk: string) => {
                    fullResponse += chunk;
                    setCurrentStreamingMessage(fullResponse);
                },
                undefined,
                selectedProvider
            );

            // Add final message to conversation
            const assistantMessage: Message = {
                id: assistantMessageId,
                role: 'assistant',
                content: response.content,
                timestamp: new Date(),
                provider: response.provider
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);

            // Add error message
            const errorMessage: Message = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: 'Sorry, I encountered an error processing your message. Please try again.',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            setIsStreaming(false);
            setCurrentStreamingMessage('');
            inputRef.current?.focus();
        }
    }, [input, isLoading, initializeConversation, selectedProvider]);

    // Handle keyboard shortcuts
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }, [handleSendMessage]);

    // Clear conversation
    const handleClearConversation = useCallback(() => {
        if (conversationId) {
            aiSystem.conversationManager.deleteConversation(conversationId);
            setConversationId(null);
            setMessages([]);
            onConversationChange?.('');
        }
    }, [conversationId, onConversationChange]);

    // Provider selection
    const availableProviders: { id: AIProvider; name: string; description: string }[] = [
        { id: 'gemini', name: 'Gemini', description: 'Google AI with multimodal support' },
        { id: 'openai', name: 'OpenAI', description: 'ChatGPT and GPT models' },
        { id: 'copilot', name: 'Copilot', description: 'GitHub Copilot for code' },
        { id: 'anthropic', name: 'Claude', description: 'Anthropic\'s Claude AI' }
    ];

    const formatTimestamp = (timestamp: Date) => {
        return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={`flex flex-col h-full bg-white dark:bg-gray-900 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        AI Assistant
                    </h2>
                </div>

                <div className="flex items-center space-x-2">
                    {/* Provider Selection */}
                    <select
                        value={selectedProvider}
                        onChange={(e) => setSelectedProvider(e.target.value as AIProvider)}
                        title="Select AI Provider"
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                        {availableProviders.map((provider) => (
                            <option key={provider.id} value={provider.id}>
                                {provider.name}
                            </option>
                        ))}
                    </select>

                    {/* Clear Button */}
                    <button
                        onClick={handleClearConversation}
                        className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        title="Clear conversation"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        <div className="text-4xl mb-4">🤖</div>
                        <h3 className="text-lg font-medium mb-2">Welcome to AI Assistant</h3>
                        <p>Ask me anything! I can help with coding, analysis, translation, and more.</p>
                        <div className="mt-4 text-sm">
                            <p>Current provider: <span className="font-medium">{availableProviders.find(p => p.id === selectedProvider)?.name}</span></p>
                        </div>
                    </div>
                )}

                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === 'user'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                                }`}
                        >
                            <div className="whitespace-pre-wrap break-words">
                                {message.content}
                            </div>
                            <div
                                className={`text-xs mt-1 flex items-center justify-between ${message.role === 'user'
                                        ? 'text-blue-100'
                                        : 'text-gray-500 dark:text-gray-400'
                                    }`}
                            >
                                <span>{formatTimestamp(message.timestamp)}</span>
                                {message.provider && (
                                    <span className="ml-2 capitalize">{message.provider}</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Streaming message */}
                {isStreaming && currentStreamingMessage && (
                    <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-lg px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
                            <div className="whitespace-pre-wrap break-words">
                                {currentStreamingMessage}
                                <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1" />
                            </div>
                            <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                                <span>{selectedProvider} is typing...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex space-x-2">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                        className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={input.split('\n').length > 3 ? 4 : Math.max(1, input.split('\n').length)}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!input.trim() || isLoading}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Status indicator */}
                {isLoading && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2" />
                        AI is processing your request...
                    </div>
                )}
            </div>
        </div>
    );
};