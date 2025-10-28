
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { User, Conversation, ChatMessage } from '../types';
import { api } from '../services/mockApi';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';

interface ChatViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  initialRecipient: User | null;
}

export const ChatView: React.FC<ChatViewProps> = ({ user, addToast, initialRecipient }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
    const [companyUsers, setCompanyUsers] = useState<Map<number, User>>(new Map());
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const fetchData = useCallback(async (isInitial = false) => {
        if (isInitial) setLoading(true);
        try {
            if (!user.companyId) return;
            const [convos, usersList] = await Promise.all([
                api.getConversationsForUser(user.id),
                api.getUsersByCompany(user.companyId)
            ]);

            const userMap = new Map();
            usersList.forEach(u => userMap.set(u.id, u));
            setCompanyUsers(userMap);

            const sortedConvos = convos.sort((a, b) => 
                new Date(b.lastMessage?.timestamp || 0).getTime() - new Date(a.lastMessage?.timestamp || 0).getTime()
            );
            setConversations(sortedConvos);
            
            if(initialRecipient && isInitial) {
                const existingConvo = sortedConvos.find(c => c.participants.includes(initialRecipient.id));
                if (existingConvo) {
                    setActiveConversationId(existingConvo.id);
                } else {
                    // Create a placeholder conversation
                    const placeholderConvo: Conversation = { id: Date.now(), participants: [user.id, initialRecipient.id], messages: [], lastMessage: null };
                    setConversations(prev => [placeholderConvo, ...prev]);
                    setActiveConversationId(placeholderConvo.id);
                }
            } else if (!activeConversationId && sortedConvos.length > 0) {
                 setActiveConversationId(sortedConvos[0].id);
            }

        } catch (error) {
            addToast("Failed to load chat data.", "error");
        } finally {
            if (isInitial) setLoading(false);
        }
    }, [user, addToast, initialRecipient, activeConversationId]);

    useEffect(() => {
        fetchData(true);
        const intervalId = setInterval(() => fetchData(false), 5000); // Poll for new messages
        return () => clearInterval(intervalId);
    }, [fetchData]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (activeConversationId) {
                try {
                    const msgs = await api.getMessagesForConversation(activeConversationId, user.id);
                    setMessages(msgs);
                } catch (e) {
                    // Ignore error if it's a placeholder conversation
                    if (!String(activeConversationId).startsWith("temp_")) {
                         addToast("Failed to load messages.", "error");
                    }
                }
            } else {
                setMessages([]);
            }
        };
        fetchMessages();
    }, [activeConversationId, user.id, addToast]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation) return;

        setIsSending(true);
        try {
            const recipient = otherParticipant;
            if (!recipient) throw new Error("Recipient not found");
            
            const { message, conversation } = await api.sendMessage(user.id, recipient.id, newMessage);
            
            setMessages(prev => [...prev, message]);
            setNewMessage('');
            
            // Update conversation list
            setActiveConversationId(conversation.id);
            await fetchData();

        } catch (error) {
            addToast("Failed to send message.", "error");
        } finally {
            setIsSending(false);
        }
    };
    
    const activeConversation = conversations.find(c => c.id === activeConversationId);
    const otherParticipantId = activeConversation?.participants.find(pId => pId !== user.id);
    const otherParticipant = otherParticipantId ? companyUsers.get(otherParticipantId) : initialRecipient;

    if (loading) {
        return <Card>Loading chat...</Card>;
    }

    return (
        <Card className="h-full flex p-0">
            {/* Left Column: Conversations */}
            <div className="w-1/3 border-r h-full flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold">Messages</h2>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {conversations.map(convo => {
                        const otherPId = convo.participants.find(p => p !== user.id);
                        const otherP = otherPId ? companyUsers.get(otherPId) : null;
                        if (!otherP) return null; // Should not happen in real app
                        
                        const isUnread = convo.lastMessage && convo.lastMessage.senderId !== user.id && !convo.lastMessage.isRead;
                        
                        return (
                            <button
                                key={convo.id}
                                onClick={() => setActiveConversationId(convo.id)}
                                className={`w-full text-left p-4 flex items-center gap-3 border-l-4 transition-colors ${activeConversationId === convo.id ? 'bg-slate-100 border-green-500' : 'border-transparent hover:bg-slate-50'}`}
                            >
                                <Avatar name={otherP.name} className="w-12 h-12 text-lg" />
                                <div className="flex-grow overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <p className={`font-semibold truncate ${isUnread ? 'text-slate-900' : 'text-slate-700'}`}>{otherP.name}</p>
                                        {convo.lastMessage && <p className="text-xs text-slate-400 flex-shrink-0">{new Date(convo.lastMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>}
                                    </div>
                                    <p className={`text-sm truncate ${isUnread ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>{convo.lastMessage?.content || 'No messages yet'}</p>
                                </div>
                                {isUnread && <div className="w-2.5 h-2.5 bg-green-500 rounded-full flex-shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Right Column: Active Chat */}
            <div className="w-2/3 h-full flex flex-col">
                {otherParticipant ? (
                    <>
                        <div className="p-4 border-b flex items-center gap-3">
                            <Avatar name={otherParticipant.name} className="w-10 h-10" />
                            <div>
                                <h3 className="font-semibold">{otherParticipant.name}</h3>
                                <p className="text-xs text-slate-500">{otherParticipant.role}</p>
                            </div>
                        </div>
                        <div className="flex-grow p-4 overflow-y-auto bg-slate-50 space-y-4">
                             {messages.map(msg => (
                                <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === user.id ? 'justify-end' : ''}`}>
                                     {msg.senderId !== user.id && <Avatar name={otherParticipant.name} className="w-8 h-8 text-xs mb-1" />}
                                     <div className={`max-w-md p-3 rounded-2xl ${msg.senderId === user.id ? 'bg-slate-800 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none shadow-sm'}`}>
                                        <p>{msg.content}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
                             <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." className="w-full p-3 border rounded-full bg-slate-100 focus:ring-2 focus:ring-green-500 focus:outline-none" />
                             <Button type="submit" isLoading={isSending} size="lg" className="rounded-full">Send</Button>
                        </form>
                    </>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-slate-500">
                        <p>Select a conversation to start chatting.</p>
                    </div>
                )}
            </div>
        </Card>
    );
};
