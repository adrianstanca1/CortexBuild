/**
 * Enhanced Team Collaboration - Buildr-Inspired Communication Hub
 * Real-time chat, video calls, file sharing, and team coordination
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    MessageSquare, Video, Phone, Users, Paperclip, Send, Smile,
    MoreHorizontal, Search, Filter, Bell, BellOff, Star, Pin,
    Archive, Trash2, Edit, Copy, Share2, Download, Eye, Lock,
    Unlock, UserPlus, UserMinus, Settings, Calendar, Clock,
    MapPin, Camera, FileText, Image, Mic, MicOff, PhoneOff,
    Volume2, VolumeX, Maximize, Minimize, RotateCcw, CheckCircle,
    AlertCircle, Info, Heart, ThumbsUp, ThumbsDown, Flag
} from 'lucide-react';
import { User } from '../../types';

interface EnhancedTeamCollaborationProps {
    currentUser: User;
    navigateTo: (screen: string, params?: any) => void;
    isDarkMode?: boolean;
}

interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    senderAvatar: string;
    content: string;
    timestamp: string;
    type: 'text' | 'image' | 'file' | 'system';
    attachments?: ChatAttachment[];
    reactions?: MessageReaction[];
    isEdited?: boolean;
    isPinned?: boolean;
    replyTo?: string;
}

interface ChatAttachment {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    thumbnail?: string;
}

interface MessageReaction {
    emoji: string;
    users: string[];
    count: number;
}

interface ChatChannel {
    id: string;
    name: string;
    type: 'project' | 'team' | 'general' | 'private';
    description: string;
    members: string[];
    unreadCount: number;
    lastMessage?: ChatMessage;
    isMuted: boolean;
    isPinned: boolean;
}

interface TeamMember {
    id: string;
    name: string;
    role: string;
    avatar: string;
    status: 'online' | 'offline' | 'busy' | 'away';
    lastSeen: string;
    currentProject?: string;
    isTyping?: boolean;
}

interface VideoCall {
    id: string;
    participants: string[];
    startTime: string;
    duration?: number;
    status: 'active' | 'ended' | 'scheduled';
    meetingLink: string;
}

const EnhancedTeamCollaboration: React.FC<EnhancedTeamCollaborationProps> = ({
    currentUser,
    navigateTo,
    isDarkMode = true
}) => {
    const [activeChannel, setActiveChannel] = useState<string>('general');
    const [activeView, setActiveView] = useState<'chat' | 'video' | 'team' | 'files'>('chat');
    const [messageInput, setMessageInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isVideoCallActive, setIsVideoCallActive] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Mock data - in real app, this would come from API
    const [channels] = useState<ChatChannel[]>([
        {
            id: 'general',
            name: 'General',
            type: 'general',
            description: 'General team discussions',
            members: ['1', '2', '3', '4'],
            unreadCount: 3,
            lastMessage: {
                id: '1',
                senderId: '2',
                senderName: 'Mike Chen',
                senderAvatar: '/avatars/mike.jpg',
                content: 'The foundation inspection is complete!',
                timestamp: '2 hours ago',
                type: 'text'
            },
            isMuted: false,
            isPinned: true
        },
        {
            id: 'project-downtown',
            name: 'Downtown Office Complex',
            type: 'project',
            description: 'Project-specific discussions',
            members: ['1', '2', '3'],
            unreadCount: 7,
            lastMessage: {
                id: '2',
                senderId: '1',
                senderName: 'Sarah Johnson',
                senderAvatar: '/avatars/sarah.jpg',
                content: 'Updated the project timeline',
                timestamp: '1 hour ago',
                type: 'text'
            },
            isMuted: false,
            isPinned: false
        },
        {
            id: 'safety-team',
            name: 'Safety Team',
            type: 'team',
            description: 'Safety protocols and updates',
            members: ['3', '4'],
            unreadCount: 0,
            lastMessage: {
                id: '3',
                senderId: '3',
                senderName: 'Emily Rodriguez',
                senderAvatar: '/avatars/emily.jpg',
                content: 'New safety guidelines posted',
                timestamp: '3 hours ago',
                type: 'text'
            },
            isMuted: true,
            isPinned: false
        }
    ]);

    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            senderId: '2',
            senderName: 'Mike Chen',
            senderAvatar: '/avatars/mike.jpg',
            content: 'Good morning team! Ready for today\'s site visit?',
            timestamp: '09:30 AM',
            type: 'text',
            reactions: [
                { emoji: '👍', users: ['1', '3'], count: 2 },
                { emoji: '🚀', users: ['4'], count: 1 }
            ]
        },
        {
            id: '2',
            senderId: '1',
            senderName: 'Sarah Johnson',
            senderAvatar: '/avatars/sarah.jpg',
            content: 'Absolutely! I\'ve reviewed the safety checklist. Everything looks good.',
            timestamp: '09:32 AM',
            type: 'text',
            replyTo: '1'
        },
        {
            id: '3',
            senderId: '3',
            senderName: 'Emily Rodriguez',
            senderAvatar: '/avatars/emily.jpg',
            content: 'I\'ve uploaded the latest safety inspection photos',
            timestamp: '09:35 AM',
            type: 'text',
            attachments: [
                {
                    id: '1',
                    name: 'safety-inspection-2024-03-15.pdf',
                    type: 'application/pdf',
                    size: 2048000,
                    url: '/files/safety-inspection-2024-03-15.pdf'
                }
            ]
        },
        {
            id: '4',
            senderId: '4',
            senderName: 'David Kim',
            senderAvatar: '/avatars/david.jpg',
            content: 'Great work Emily! The photos look clear and detailed.',
            timestamp: '09:38 AM',
            type: 'text',
            reactions: [
                { emoji: '❤️', users: ['3'], count: 1 }
            ]
        }
    ]);

    const [teamMembers] = useState<TeamMember[]>([
        {
            id: '1',
            name: 'Sarah Johnson',
            role: 'Project Manager',
            avatar: '/avatars/sarah.jpg',
            status: 'online',
            lastSeen: 'now',
            currentProject: 'Downtown Office Complex',
            isTyping: false
        },
        {
            id: '2',
            name: 'Mike Chen',
            role: 'Site Supervisor',
            avatar: '/avatars/mike.jpg',
            status: 'busy',
            lastSeen: '5 minutes ago',
            currentProject: 'Downtown Office Complex',
            isTyping: true
        },
        {
            id: '3',
            name: 'Emily Rodriguez',
            role: 'Safety Officer',
            avatar: '/avatars/emily.jpg',
            status: 'online',
            lastSeen: 'now',
            currentProject: 'Downtown Office Complex',
            isTyping: false
        },
        {
            id: '4',
            name: 'David Kim',
            role: 'Quality Inspector',
            avatar: '/avatars/david.jpg',
            status: 'away',
            lastSeen: '1 hour ago',
            currentProject: 'Residential Tower',
            isTyping: false
        }
    ]);

    const [videoCalls] = useState<VideoCall[]>([
        {
            id: '1',
            participants: ['1', '2', '3'],
            startTime: '2024-03-15T10:00:00Z',
            duration: 45,
            status: 'ended',
            meetingLink: 'https://meet.example.com/abc123'
        },
        {
            id: '2',
            participants: ['1', '2', '3', '4'],
            startTime: '2024-03-15T14:00:00Z',
            status: 'scheduled',
            meetingLink: 'https://meet.example.com/def456'
        }
    ]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const getStatusColor = (status: string) => {
        const colors = {
            online: 'bg-green-500',
            offline: 'bg-gray-500',
            busy: 'bg-red-500',
            away: 'bg-yellow-500'
        };
        return colors[status as keyof typeof colors] || 'bg-gray-500';
    };

    const getChannelIcon = (type: string) => {
        const icons = {
            general: MessageSquare,
            project: FolderKanban,
            team: Users,
            private: Lock
        };
        return icons[type as keyof typeof icons] || MessageSquare;
    };

    const handleSendMessage = () => {
        if (!messageInput.trim()) return;

        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderAvatar: currentUser.avatar || '/avatars/default.jpg',
            content: messageInput,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'text'
        };

        setMessages(prev => [...prev, newMessage]);
        setMessageInput('');
        setIsTyping(false);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            const attachment: ChatAttachment = {
                id: Date.now().toString(),
                name: file.name,
                type: file.type,
                size: file.size,
                url: URL.createObjectURL(file)
            };

            const newMessage: ChatMessage = {
                id: Date.now().toString(),
                senderId: currentUser.id,
                senderName: currentUser.name,
                senderAvatar: currentUser.avatar || '/avatars/default.jpg',
                content: `Shared ${file.name}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: 'file',
                attachments: [attachment]
            };

            setMessages(prev => [...prev, newMessage]);
        });
    };

    const handleReaction = (messageId: string, emoji: string) => {
        setMessages(prev => prev.map(msg => {
            if (msg.id === messageId) {
                const existingReaction = msg.reactions?.find(r => r.emoji === emoji);
                if (existingReaction) {
                    return {
                        ...msg,
                        reactions: msg.reactions?.map(r =>
                            r.emoji === emoji
                                ? { ...r, count: r.count + 1, users: [...r.users, currentUser.id] }
                                : r
                        )
                    };
                } else {
                    return {
                        ...msg,
                        reactions: [
                            ...(msg.reactions || []),
                            { emoji, users: [currentUser.id], count: 1 }
                        ]
                    };
                }
            }
            return msg;
        }));
    };

    const renderChannel = (channel: ChatChannel) => {
        const ChannelIcon = getChannelIcon(channel.type);

        return (
            <div
                key={channel.id}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${activeChannel === channel.id
                        ? isDarkMode ? 'bg-purple-600' : 'bg-purple-100'
                        : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                onClick={() => setActiveChannel(channel.id)}
            >
                <div className="relative">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <ChannelIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                    </div>
                    {channel.isPinned && (
                        <Pin className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                        <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {channel.name}
                        </p>
                        {channel.isMuted && (
                            <BellOff className="w-4 h-4 text-gray-400" />
                        )}
                    </div>
                    {channel.lastMessage && (
                        <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {channel.lastMessage.senderName}: {channel.lastMessage.content}
                        </p>
                    )}
                </div>
                {channel.unreadCount > 0 && (
                    <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {channel.unreadCount}
                    </div>
                )}
            </div>
        );
    };

    const renderMessage = (message: ChatMessage) => {
        const isOwnMessage = message.senderId === currentUser.id;
        const hasReactions = message.reactions && message.reactions.length > 0;

        return (
            <div
                key={message.id}
                className={`flex space-x-3 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''} mb-4`}
            >
                <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {message.senderName.split(' ').map(n => n[0]).join('')}
                    </div>
                </div>
                <div className={`flex-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                    <div className="flex items-center space-x-2 mb-1">
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {message.senderName}
                        </span>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {message.timestamp}
                        </span>
                        {message.isEdited && (
                            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                (edited)
                            </span>
                        )}
                        {message.isPinned && (
                            <Pin className="w-3 h-3 text-yellow-400" />
                        )}
                    </div>
                    <div
                        className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${isOwnMessage
                                ? isDarkMode ? 'bg-purple-600' : 'bg-purple-100'
                                : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                            }`}
                    >
                        <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {message.content}
                        </p>
                        {message.attachments && message.attachments.map(attachment => (
                            <div
                                key={attachment.id}
                                className="mt-2 p-2 bg-gray-600 rounded-lg"
                            >
                                <div className="flex items-center space-x-2">
                                    <FileText className="w-4 h-4 text-gray-300" />
                                    <span className="text-sm text-gray-300">{attachment.name}</span>
                                    <Download className="w-4 h-4 text-gray-300 cursor-pointer" />
                                </div>
                            </div>
                        ))}
                    </div>
                    {hasReactions && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {message.reactions?.map((reaction, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleReaction(message.id, reaction.emoji)}
                                    className="flex items-center space-x-1 px-2 py-1 bg-gray-600 rounded-full hover:bg-gray-500 transition-colors"
                                >
                                    <span>{reaction.emoji}</span>
                                    <span className="text-xs text-gray-300">{reaction.count}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderTeamMember = (member: TeamMember) => {
        return (
            <div
                key={member.id}
                className={`flex items-center space-x-3 p-3 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors cursor-pointer`}
            >
                <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${isDarkMode ? 'border-gray-800' : 'border-white'} ${getStatusColor(member.status)}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                            {member.name}
                        </p>
                        {member.isTyping && (
                            <span className="text-xs text-blue-400">typing...</span>
                        )}
                    </div>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                        {member.role}
                    </p>
                    {member.currentProject && (
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} truncate`}>
                            {member.currentProject}
                        </p>
                    )}
                </div>
                <div className="text-right">
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {member.lastSeen}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <MessageSquare className="w-8 h-8 text-white" />
                                <h1 className="text-3xl font-bold text-white">Team Collaboration</h1>
                            </div>
                            <p className="text-blue-100">Real-time communication and team coordination</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={() => setIsVideoCallActive(!isVideoCallActive)}
                                className={`p-2 rounded-lg transition-all backdrop-blur-sm ${isVideoCallActive
                                        ? 'bg-red-500 hover:bg-red-600'
                                        : 'bg-white/20 hover:bg-white/30'
                                    } text-white`}
                            >
                                {isVideoCallActive ? <PhoneOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigateTo('team-settings')}
                                className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all backdrop-blur-sm"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Navigation Tabs */}
                <div className="flex space-x-2 mb-8 p-1 bg-gray-800 rounded-xl">
                    {[
                        { id: 'chat', label: 'Chat', icon: MessageSquare },
                        { id: 'video', label: 'Video Calls', icon: Video },
                        { id: 'team', label: 'Team', icon: Users },
                        { id: 'files', label: 'Files', icon: FileText }
                    ].map((tab) => {
                        const TabIcon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveView(tab.id as any)}
                                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${activeView === tab.id
                                    ? 'bg-purple-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                    }`}
                            >
                                <TabIcon className="w-5 h-5" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Content based on active view */}
                {activeView === 'chat' && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Channels Sidebar */}
                        <div className="lg:col-span-1">
                            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Channels
                                    </h3>
                                    <button
                                        type="button"
                                        className="p-1 hover:bg-gray-700 rounded"
                                    >
                                        <Plus className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {channels.map(renderChannel)}
                                </div>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="lg:col-span-3">
                            <div className={`h-[600px] rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} flex flex-col`}>
                                {/* Chat Header */}
                                <div className="p-4 border-b border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {channels.find(c => c.id === activeChannel)?.name}
                                            </h3>
                                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {channels.find(c => c.id === activeChannel)?.description}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                type="button"
                                                className="p-2 hover:bg-gray-700 rounded"
                                            >
                                                <Search className="w-5 h-5 text-gray-400" />
                                            </button>
                                            <button
                                                type="button"
                                                className="p-2 hover:bg-gray-700 rounded"
                                            >
                                                <MoreHorizontal className="w-5 h-5 text-gray-400" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4">
                                    {messages.map(renderMessage)}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Input */}
                                <div className="p-4 border-t border-gray-700">
                                    <div className="flex items-center space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-2 hover:bg-gray-700 rounded"
                                        >
                                            <Paperclip className="w-5 h-5 text-gray-400" />
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            className="hidden"
                                            onChange={handleFileUpload}
                                        />
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                value={messageInput}
                                                onChange={(e) => {
                                                    setMessageInput(e.target.value);
                                                    setIsTyping(true);
                                                }}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleSendMessage();
                                                    }
                                                }}
                                                placeholder="Type a message..."
                                                className={`w-full px-4 py-2 rounded-full border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            className="p-2 hover:bg-gray-700 rounded"
                                        >
                                            <Smile className="w-5 h-5 text-gray-400" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSendMessage}
                                            className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full"
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeView === 'video' && (
                    <div className="space-y-6">
                        {/* Video Call Controls */}
                        {isVideoCallActive && (
                            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Active Video Call
                                    </h3>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsMuted(!isMuted)}
                                            className={`p-2 rounded-lg ${isMuted ? 'bg-red-500' : 'bg-gray-600'} text-white`}
                                        >
                                            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsVideoOn(!isVideoOn)}
                                            className={`p-2 rounded-lg ${isVideoOn ? 'bg-gray-600' : 'bg-red-500'} text-white`}
                                        >
                                            <Camera className="w-5 h-5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsVideoCallActive(false)}
                                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                                        >
                                            <PhoneOff className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {teamMembers.slice(0, 4).map(member => (
                                        <div
                                            key={member.id}
                                            className={`aspect-video rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}
                                        >
                                            <div className="text-center">
                                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold mx-auto mb-2">
                                                    {member.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {member.name}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Video Call History */}
                        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Recent Video Calls
                            </h3>
                            <div className="space-y-4">
                                {videoCalls.map(call => (
                                    <div
                                        key={call.id}
                                        className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-between`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-blue-500 rounded-lg">
                                                <Video className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    Team Meeting
                                                </p>
                                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {call.participants.length} participants
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {new Date(call.startTime).toLocaleDateString()}
                                            </p>
                                            {call.duration && (
                                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {call.duration} minutes
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeView === 'team' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Team Members
                            </h2>
                            <button
                                type="button"
                                onClick={() => navigateTo('add-team-member')}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                            >
                                <UserPlus className="w-5 h-5" />
                                <span>Add Member</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {teamMembers.map(renderTeamMember)}
                        </div>
                    </div>
                )}

                {activeView === 'files' && (
                    <div>
                        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Shared Files
                        </h2>
                        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                            <div className="text-center py-12">
                                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    No files shared yet
                                </h3>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                                    Start sharing files with your team by uploading them in chat
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setActiveView('chat')}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                                >
                                    Go to Chat
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EnhancedTeamCollaboration;
