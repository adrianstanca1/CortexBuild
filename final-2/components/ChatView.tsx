// full contents of components/ChatView.tsx

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { User, Conversation, Message } from '../types';
import { api } from '../services/mockApi';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface ChatViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  initialRecipient?: User | null;
}

const NewChatModal: React.FC<{
    user: User;
    personnel: User[];
    conversations: Conversation[];
    onClose: () => void;
    onStartConversation: (recipient: User) => void;
}> = ({ user, personnel, conversations, onClose, onStartConversation }) => {
    const existingRecipientIds = new Set(
        conversations.flatMap(c => c.participantIds).filter(id => id !== user.id)
    );
    const availableUsers = personnel.filter(p => p.id !== user.id && !existingRecipientIds.has(p.id));

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="w-full max-w-md" onClick={e=>e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">Start a New Chat</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {availableUsers.length > 0 ? availableUsers.map(p => (
                        <button key={p.id} onClick={() => onStartConversation(p)} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100">
                            <Avatar name={`${p.firstName} ${p.lastName}`} imageUrl={p.avatar} className="w-10 h-10"/>
                            <div>{`${p.firstName} ${p.lastName}`}</div>
                        </button>
                    )) : <p className="text-slate-500 text-center py-4">No new people to message.</p>}
                </div>
            </Card>
        </div>
    );
export const ChatView: React.FC<ChatViewProps> = ({ user, addToast, initialRecipient }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [personnel, setPersonnel] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const userMap = useMemo(() => new Map(personnel.map(p => [p.id, p])), [personnel]);

    const activeConversation = useMemo(() => {
        return conversations.find(c => c.id === activeConversationId);
    }, [conversations, activeConversationId]);
    
    const fetchData = useCallback(async (isInitialLoad = false) => {
        const controller = new AbortController();
        abortControllerRef.current?.abort();
        abortControllerRef.current = controller;

        if(isInitialLoad) setLoading(true);
        try {
            if (!user.companyId) return;
            const [convoData, personnelData] = await Promise.all([
                api.getConversationsForUser(user.id, { signal: controller.signal }),
                api.getUsersByCompany(user.companyId, { signal: controller.signal })
            ]);
            if (controller.signal.aborted) return;
            setConversations(convoData);
            if (controller.signal.aborted) return;
            setPersonnel(personnelData);

            if (isInitialLoad) {
                if (controller.signal.aborted) return;
                if (initialRecipient) {
                    handleStartConversation(initialRecipient);
                } else if (convoData.length > 0) {
                    setActiveConversationId(convoData[0].id);
                }
            }
        } catch (error) {
            if (controller.signal.aborted) return;
            addToast("Failed to load chat data", "error");
        } finally {
            if(isInitialLoad && !controller.signal.aborted) setLoading(false);
        }
    }, [user, addToast, initialRecipient]);

    useEffect(() => {
        fetchData(true);
        return () => {
            abortControllerRef.current?.abort();
        };
    }, [fetchData]);

     useEffect(() => {
        if (!activeConversationId) return;

        const fetchMessages = async () => {
             try {
                const newMessages = await api.getMessagesForConversation(activeConversationId, user.id);
                setMessages(currentMessages => {
                    // This prevents replacing optimistically sent messages with server response if they are the same
                    const currentIds = new Set(currentMessages.map(m => m.id));
                    const incoming = newMessages.filter(m => !currentIds.has(m.id));
                    return [...currentMessages, ...incoming];
                });
            } catch (error) {
                // Not showing a toast here to avoid spamming on poll errors
                console.error("Failed to fetch messages", error);
            }
        };
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Poll for new messages
        return () => clearInterval(interval);
    }, [activeConversationId, user.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleStartConversation = (recipient: User) => {
        setIsModalOpen(false);
        const existingConvo = conversations.find(c => c.participantIds.includes(recipient.id));
        if (existingConvo) {
            setActiveConversationId(existingConvo.id);
        } else {
            const newConvo: Conversation = { id: `new-${recipient.id}`, participantIds: [user.id, recipient.id], lastMessage: null };
            setConversations(prev => [newConvo, ...prev]);
            setActiveConversationId(newConvo.id);
            setMessages([]);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !activeConversation) return;

        const otherParticipantId = activeConversation.participantIds.find(id => id !== user.id);
        if (!otherParticipantId) return;

        const tempId = `temp-${Date.now()}`;
        const optimisticMessage: Message = {
            id: tempId,
            conversationId: activeConversation.id,
            senderId: user.id,
            content: newMessage,
            timestamp: new Date(),
            isRead: true,
            isSending: true,
        };
        
        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage('');
        setIsSending(true);

        try {
            const { conversation: updatedConvo, message: sentMessage } = await api.sendMessage(user.id, otherParticipantId, optimisticMessage.content, activeConversation.id.startsWith('new-') ? undefined : activeConversation.id);
            setMessages(prev => prev.map(m => m.id === tempId ? sentMessage : m));
            setConversations(prev => prev.map(c => c.id === activeConversation.id ? updatedConvo : c.id === updatedConvo.id ? updatedConvo : c));
            if(activeConversation.id !== updatedConvo.id) setActiveConversationId(updatedConvo.id);
        } catch (error) {
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, isSending: false, error: 'Failed to send' } : m));
            addToast("Failed to send message.", "error");
        } finally {
            setIsSending(false);
        }
    };
    
    const getOtherParticipant = (convo: Conversation) => {
        const otherId = convo.participantIds.find(id => id !== user.id);
        return userMap.get(otherId || '');
    };

    return (
        <>
            {isModalOpen && <NewChatModal user={user} personnel={personnel} conversations={conversations} onClose={() => setIsModalOpen(false)} onStartConversation={handleStartConversation} />}
            <div className="flex h-[calc(100vh-8rem)] border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-700">
                <aside className="w-1/3 border-r dark:border-slate-700 flex flex-col">
                    <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                        <h2 className="font-semibold text-lg">Conversations</h2>
                        <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(true)}>New Chat</Button>
                    </div>
                    <div className="overflow-y-auto">
                        {conversations.map(convo => {
                            const otherUser = getOtherParticipant(convo);
                            if (!otherUser) return null;
                            const isUnread = convo.lastMessage && !convo.lastMessage.isRead && convo.lastMessage.senderId !== user.id;
                            return (
                                <button key={convo.id} onClick={() => setActiveConversationId(convo.id)} className={`w-full text-left p-4 flex gap-3 items-center relative ${activeConversationId === convo.id ? 'bg-sky-50 dark:bg-sky-900/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                    {isUnread && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-sky-500"></div>}
                                    <Avatar name={`${otherUser.firstName} ${otherUser.lastName}`} imageUrl={otherUser.avatar} className="w-10 h-10" />
                                    <div className="flex-grow overflow-hidden">
                                        <p className={`font-semibold ${isUnread ? 'text-slate-900 dark:text-slate-50' : ''}`}>{`${otherUser.firstName} ${otherUser.lastName}`}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{convo.lastMessage?.content}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </aside>
                <main className="w-2/3 flex flex-col">
                    {activeConversation ? (
                        <>
                            <div className="p-4 border-b dark:border-slate-700 flex items-center gap-3">
                                <Avatar name={`${getOtherParticipant(activeConversation)?.firstName} ${getOtherParticipant(activeConversation)?.lastName}` || ''} imageUrl={getOtherParticipant(activeConversation)?.avatar} className="w-8 h-8" />
                                <h3 className="font-semibold">{`${getOtherParticipant(activeConversation)?.firstName} ${getOtherParticipant(activeConversation)?.lastName}`}</h3>
                            </div>
                            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                                {messages.map(msg => (
                                    <div key={msg.id} className={`flex gap-3 ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                                        {msg.senderId !== user.id && <Avatar name={`${getOtherParticipant(activeConversation)?.firstName} ${getOtherParticipant(activeConversation)?.lastName}` || ''} imageUrl={getOtherParticipant(activeConversation)?.avatar} className="w-8 h-8 self-end"/>}
                                        <div className={`p-3 rounded-lg max-w-lg ${msg.senderId === user.id ? 'bg-sky-600 text-white' : 'bg-slate-100 dark:bg-slate-700'} ${msg.isSending ? 'opacity-70' : ''}`}>
                                            {msg.content}
                                            {msg.error && <span className="text-xs text-red-300 block mt-1">{msg.error}</span>}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="p-4 border-t dark:border-slate-700 flex gap-2">
                                <input
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                    className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-600"
                                    placeholder="Type a message..."
                                />
                                <Button onClick={handleSendMessage} isLoading={isSending}>Send</Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-grow flex items-center justify-center text-slate-500">
                            <p>Select a conversation or start a new one.</p>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
};