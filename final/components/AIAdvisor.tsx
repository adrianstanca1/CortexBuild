// full contents of components/AIAdvisor.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
// FIX: Changed Todo to Task
import { User, Project, Task as Todo } from '../types';
import { api } from '../services/mockApi';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { GoogleGenAI, Chat } from "@google/genai";

interface AIAdvisorProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  onBack: () => void;
interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ user, addToast, onBack }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [todos, setTodos] = useState<Todo[]>([]);
    const [chat, setChat] = useState<Chat | null>(null);
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const initializeChat = useCallback(async () => {
        if (!user.companyId) return;
        try {
            const [projData, todoData] = await Promise.all([
                api.getProjectsByCompany(user.companyId),
                api.getTodosByProjectIds((await api.getProjectsByCompany(user.companyId)).map(p => p.id)),
            ]);
            setProjects(projData);
            setTodos(todoData);

            const projectContext = projData.map(p => `Project: ${p.name} (Status: ${p.status}, Budget: £${p.budget})`).join('\n');
            // FIX: Corrected property from .text to .title
            const taskContext = todoData.slice(0, 10).map(t => `Task: ${t.text || t.title} (Status: ${t.status}, Priority: ${t.priority})`).join('\n');

            const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
            const chatInstance = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: `You are an expert construction project management advisor. Your name is "Ash". You have the following context about the user's projects. Use it to answer their questions concisely and professionally. \nCONTEXT:\n${projectContext}\n${taskContext}`,
                },
            });
            setChat(chatInstance);
            
            const initialResponse = await chatInstance.sendMessage({ message: "Introduce yourself and ask what I need help with." });
            setHistory([{ role: 'model', text: initialResponse.text }]);
        } catch (error) {
            addToast("Failed to initialize AI Advisor.", "error");
        }
    }, [user.companyId, addToast]);

    useEffect(() => {
        initializeChat();
    }, [initializeChat]);

    useEffect(() => {
        chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
    }, [history]);

    const handleSend = async () => {
        if (!input.trim() || !chat) return;
        const text = input;
        setInput('');
        setHistory(prev => [...prev, { role: 'user', text }]);
        setIsLoading(true);

        try {
            const result = await chat.sendMessage({ message: text });
            setHistory(prev => [...prev, { role: 'model', text: result.text }]);
        } catch (error) {
            addToast("Failed to get response from AI.", "error");
            setHistory(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="flex flex-col h-[80vh]">
            <h3 className="text-xl font-semibold text-slate-700 mb-2">AI Advisor</h3>
            <div ref={chatContainerRef} className="flex-grow p-4 border rounded-lg bg-slate-50 overflow-y-auto space-y-4">
                {history.map((msg, index) => (
                    <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">A</div>}
                        <div className={`p-3 rounded-lg max-w-lg ${msg.role === 'model' ? 'bg-white' : 'bg-sky-600 text-white'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && <div className="flex justify-start"><div className="p-3 rounded-lg bg-white">Thinking...</div></div>}
            </div>
            <div className="mt-4 flex gap-2">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !isLoading && handleSend()}
                    className="flex-grow p-2 border rounded-md"
                    placeholder="Ask about risks, budget, or next steps..."
                    disabled={isLoading || !chat}
                />
                <Button onClick={handleSend} isLoading={isLoading} disabled={!chat}>Send</Button>
            </div>
        </Card>
    );
};