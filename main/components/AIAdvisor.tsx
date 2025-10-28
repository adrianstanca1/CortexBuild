import React, { useState, useRef, useEffect } from 'react';
// FIX: Corrected import path to be relative.
import { User } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { GoogleGenAI, Chat } from '@google/genai';

interface AIAdvisorProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
}

interface Message {
    role: 'user' | 'model';
    text: string;
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ user, addToast }) => {
    const [query, setQuery] = useState('');
    const [history, setHistory] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const aiRef = useRef<GoogleGenAI | null>(null);

    useEffect(() => {
        try {
            if (!process.env.API_KEY) {
                addToast("AI Advisor API key not configured.", "error");
                return;
            }
            aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
            chatRef.current = aiRef.current.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: 'You are an expert advisor for the construction industry. Provide clear, concise, and actionable advice. Format your responses with markdown.',
                }
            });
        } catch(e) {
            console.error(e);
            addToast("Failed to initialize AI Advisor.", "error");
        }
    }, [addToast]);

    const handleAsk = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || !chatRef.current) return;
        
        const userMessage: Message = { role: 'user', text: query };
        setHistory(prev => [...prev, userMessage]);
        setQuery('');
        setIsLoading(true);

        try {
            const responseStream = await chatRef.current.sendMessageStream({ message: query });
            
            let modelResponse = '';
            setHistory(prev => [...prev, { role: 'model', text: '' }]);

            for await (const chunk of responseStream) {
                modelResponse += chunk.text;
                setHistory(prev => {
                    const newHistory = [...prev];
                    newHistory[newHistory.length - 1].text = modelResponse;
                    return newHistory;
                });
            }
        } catch (error) {
            console.error(error);
            addToast("The AI failed to respond. Please try again.", "error");
            setHistory(prev => prev.filter(msg => msg.text !== '')); // Remove empty model response on error
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="flex flex-col h-[80vh]">
            <h3 className="text-xl font-semibold mb-2 flex-shrink-0">AI Project Advisor</h3>
            <p className="text-sm text-slate-500 mb-4 flex-shrink-0">Ask questions about project management, safety, or best practices.</p>
            
            <div className="flex-grow overflow-y-auto space-y-4 pr-2 mb-4">
                {history.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-lg max-w-lg ${msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-slate-100'}`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleAsk} className="flex-shrink-0 flex gap-2 pt-4 border-t">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Ask a question..."
                    disabled={isLoading}
                />
                <Button type="submit" isLoading={isLoading} disabled={isLoading || !query.trim()}>
                    Ask
                </Button>
            </form>
        </Card>
    );
};
