// components/collaboration/CollaborationHub.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
    MessageCircle,
    Send,
    Paperclip,
    Smile,
    MoreVertical,
    Edit,
    Trash2,
    Reply,
    AtSign,
    Hash,
    Bell,
    BellOff,
    Users,
    Video,
    Phone,
    Share
} from 'lucide-react';

export interface Message {
    id: string;
    content: string;
    sender: {
        id: string;
        name: string;
        avatar?: string;
        role: string;
    };
    timestamp: string;
    type: 'text' | 'image' | 'file' | 'system';
    attachments?: {
        name: string;
        url: string;
        type: string;
        size: number;
    }[];
    replyTo?: {
        id: string;
        content: string;
        sender: string;
    };
    reactions?: {
        emoji: string;
        users: string[];
    }[];
    edited?: boolean;
    editedAt?: string;
}

export interface Comment {
    id: string;
    content: string;
    author: {
        id: string;
        name: string;
        avatar?: string;
    };
    timestamp: string;
    replies: Comment[];
    reactions?: {
        emoji: string;
        users: string[];
    }[];
}

export interface Channel {
    id: string;
    name: string;
    type: 'public' | 'private' | 'direct';
    description?: string;
    members: string[];
    unreadCount: number;
    lastMessage?: {
        content: string;
        timestamp: string;
        sender: string;
    };
}

interface CollaborationHubProps {
    projectId?: string;
    currentUser: {
        id: string;
        name: string;
        avatar?: string;
        role: string;
    };
    className?: string;
}

export const CollaborationHub: React.FC<CollaborationHubProps> = ({
    projectId,
    currentUser,
    className = ""
}) => {
    const [activeTab, setActiveTab] = useState<'chat' | 'comments'>('chat');
    const [selectedChannel, setSelectedChannel] = useState<string>('general');
    const [messages, setMessages] = useState<Message[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [newComment, setNewComment] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [editingMessage, setEditingMessage] = useState<string | null>(null);
    const [editingComment, setEditingComment] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageInputRef = useRef<HTMLTextAreaElement>(null);

    const channels: Channel[] = [
        {
            id: 'general',
            name: 'General',
            type: 'public',
            description: 'General project discussion',
            members: ['user1', 'user2', 'user3'],
            unreadCount: 2,
            lastMessage: {
                content: 'The foundation inspection is scheduled for tomorrow',
                timestamp: '2024-01-20T10:30:00Z',
                sender: 'John Smith'
            }
        },
        {
            id: 'updates',
            name: 'Updates',
            type: 'public',
            description: 'Project updates and announcements',
            members: ['user1', 'user2', 'user3'],
            unreadCount: 0,
            lastMessage: {
                content: 'Weekly progress report is ready',
                timestamp: '2024-01-19T15:45:00Z',
                sender: 'Sarah Johnson'
            }
        },
        {
            id: 'safety',
            name: 'Safety',
            type: 'public',
            description: 'Safety protocols and incidents',
            members: ['user1', 'user2', 'user3'],
            unreadCount: 1,
            lastMessage: {
                content: 'Remember to wear hard hats in zone A',
                timestamp: '2024-01-20T08:15:00Z',
                sender: 'Mike Wilson'
            }
        }
    ];

    const mockMessages: Message[] = [
        {
            id: '1',
            content: 'Good morning team! Ready for the foundation inspection today?',
            sender: {
                id: 'user1',
                name: 'John Smith',
                avatar: '/avatars/john.jpg',
                role: 'Project Manager'
            },
            timestamp: '2024-01-20T09:00:00Z',
            type: 'text',
            reactions: [
                { emoji: '👍', users: ['user2', 'user3'] },
                { emoji: '🚀', users: ['user1'] }
            ]
        },
        {
            id: '2',
            content: 'Yes, all equipment is ready. Weather looks good too!',
            sender: {
                id: 'user2',
                name: 'Sarah Johnson',
                avatar: '/avatars/sarah.jpg',
                role: 'Site Supervisor'
            },
            timestamp: '2024-01-20T09:05:00Z',
            type: 'text',
            replyTo: {
                id: '1',
                content: 'Good morning team! Ready for the foundation inspection today?',
                sender: 'John Smith'
            }
        },
        {
            id: '3',
            content: 'I\'ve uploaded the inspection checklist. Please review before we start.',
            sender: {
                id: 'user3',
                name: 'Mike Wilson',
                avatar: '/avatars/mike.jpg',
                role: 'Safety Officer'
            },
            timestamp: '2024-01-20T09:10:00Z',
            type: 'file',
            attachments: [
                {
                    name: 'inspection_checklist.pdf',
                    url: '/files/inspection_checklist.pdf',
                    type: 'application/pdf',
                    size: 245760
                }
            ]
        }
    ];

    const mockComments: Comment[] = [
        {
            id: '1',
            content: 'The foundation looks solid. No cracks or settling issues detected.',
            author: {
                id: 'user1',
                name: 'John Smith',
                avatar: '/avatars/john.jpg'
            },
            timestamp: '2024-01-20T10:30:00Z',
            replies: [
                {
                    id: '2',
                    content: 'Agreed. The concrete quality is excellent.',
                    author: {
                        id: 'user2',
                        name: 'Sarah Johnson',
                        avatar: '/avatars/sarah.jpg'
                    },
                    timestamp: '2024-01-20T10:35:00Z',
                    replies: []
                }
            ],
            reactions: [
                { emoji: '✅', users: ['user2', 'user3'] }
            ]
        },
        {
            id: '3',
            content: 'We should schedule the next inspection for next week.',
            author: {
                id: 'user3',
                name: 'Mike Wilson',
                avatar: '/avatars/mike.jpg'
            },
            timestamp: '2024-01-20T11:00:00Z',
            replies: [],
            reactions: [
                { emoji: '📅', users: ['user1'] }
            ]
        }
    ];

    useEffect(() => {
        setMessages(mockMessages);
        setComments(mockComments);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        const message: Message = {
            id: Date.now().toString(),
            content: newMessage,
            sender: currentUser,
            timestamp: new Date().toISOString(),
            type: 'text',
            replyTo: replyingTo ? {
                id: replyingTo.id,
                content: replyingTo.content,
                sender: replyingTo.sender.name
            } : undefined
        };

        setMessages(prev => [...prev, message]);
        setNewMessage('');
        setReplyingTo(null);
    };

    const handleSendComment = () => {
        if (!newComment.trim()) return;

        const comment: Comment = {
            id: Date.now().toString(),
            content: newComment,
            author: {
                id: currentUser.id,
                name: currentUser.name,
                avatar: currentUser.avatar
            },
            timestamp: new Date().toISOString(),
            replies: []
        };

        setComments(prev => [...prev, comment]);
        setNewComment('');
    };

    const handleEditMessage = (messageId: string, newContent: string) => {
        setMessages(prev => prev.map(msg =>
            msg.id === messageId
                ? { ...msg, content: newContent, edited: true, editedAt: new Date().toISOString() }
                : msg
        ));
        setEditingMessage(null);
    };

    const handleEditComment = (commentId: string, newContent: string) => {
        setComments(prev => prev.map(comment =>
            comment.id === commentId
                ? { ...comment, content: newContent }
                : comment
        ));
        setEditingComment(null);
    };

    const handleDeleteMessage = (messageId: string) => {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
    };

    const handleDeleteComment = (commentId: string) => {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
    };

    const handleReaction = (messageId: string, emoji: string) => {
        setMessages(prev => prev.map(msg => {
            if (msg.id === messageId) {
                const existingReaction = msg.reactions?.find(r => r.emoji === emoji);
                if (existingReaction) {
                    if (existingReaction.users.includes(currentUser.id)) {
                        // Remove reaction
                        return {
                            ...msg,
                            reactions: msg.reactions?.map(r =>
                                r.emoji === emoji
                                    ? { ...r, users: r.users.filter(id => id !== currentUser.id) }
                                    : r
                            ).filter(r => r.users.length > 0)
                        };
                    } else {
                        // Add user to reaction
                        return {
                            ...msg,
                            reactions: msg.reactions?.map(r =>
                                r.emoji === emoji
                                    ? { ...r, users: [...r.users, currentUser.id] }
                                    : r
                            )
                        };
                    }
                } else {
                    // Add new reaction
                    return {
                        ...msg,
                        reactions: [...(msg.reactions || []), { emoji, users: [currentUser.id] }]
                    };
                }
            }
            return msg;
        }));
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
        <div className={`collaboration-hub bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
            {/* Header */}
            <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <MessageCircle className="w-6 h-6 text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Collaboration Hub</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                            <Video className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                            <Phone className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100">
                            <Share className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mt-4">
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'chat'
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Chat
                    </button>
                    <button
                        onClick={() => setActiveTab('comments')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'comments'
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Comments
                    </button>
                </div>
            </div>

            <div className="flex h-96">
                {/* Channels Sidebar */}
                {activeTab === 'chat' && (
                    <div className="w-64 border-r border-gray-200 bg-gray-50">
                        <div className="p-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Channels</h3>
                            <div className="space-y-1">
                                {channels.map(channel => (
                                    <button
                                        key={channel.id}
                                        onClick={() => setSelectedChannel(channel.id)}
                                        className={`w-full text-left p-2 rounded-md transition-colors ${selectedChannel === channel.id
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Hash className="w-4 h-4" />
                                                <span className="text-sm font-medium">{channel.name}</span>
                                            </div>
                                            {channel.unreadCount > 0 && (
                                                <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                                    {channel.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        {channel.lastMessage && (
                                            <p className="text-xs text-gray-500 mt-1 truncate">
                                                {channel.lastMessage.sender}: {channel.lastMessage.content}
                                            </p>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {activeTab === 'chat' ? (
                        <>
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map(message => (
                                    <div key={message.id} className="flex gap-3">
                                        <div className="flex-shrink-0">
                                            {message.sender.avatar ? (
                                                <img
                                                    src={message.sender.avatar}
                                                    alt={message.sender.name}
                                                    className="w-8 h-8 rounded-full"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                                    {getInitials(message.sender.name)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {message.sender.name}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {message.sender.role}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {formatTime(message.timestamp)}
                                                </span>
                                                {message.edited && (
                                                    <span className="text-xs text-gray-400">(edited)</span>
                                                )}
                                            </div>

                                            {message.replyTo && (
                                                <div className="bg-gray-50 border-l-2 border-blue-200 pl-3 py-2 mb-2 rounded-r-md">
                                                    <p className="text-xs text-gray-600">
                                                        Replying to {message.replyTo.sender}
                                                    </p>
                                                    <p className="text-sm text-gray-700 truncate">
                                                        {message.replyTo.content}
                                                    </p>
                                                </div>
                                            )}

                                            {editingMessage === message.id ? (
                                                <div className="flex gap-2">
                                                    <textarea
                                                        defaultValue={message.content}
                                                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                e.preventDefault();
                                                                handleEditMessage(message.id, e.currentTarget.value);
                                                            }
                                                            if (e.key === 'Escape') {
                                                                setEditingMessage(null);
                                                            }
                                                        }}
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => setEditingMessage(null)}
                                                        className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="group">
                                                    <p className="text-sm text-gray-700 mb-2">{message.content}</p>

                                                    {message.attachments && (
                                                        <div className="space-y-2 mb-2">
                                                            {message.attachments.map((attachment, index) => (
                                                                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                                                                    <Paperclip className="w-4 h-4 text-gray-400" />
                                                                    <span className="text-sm text-gray-700">{attachment.name}</span>
                                                                    <span className="text-xs text-gray-500">
                                                                        ({(attachment.size / 1024).toFixed(1)} KB)
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Reactions */}
                                                    {message.reactions && message.reactions.length > 0 && (
                                                        <div className="flex gap-1 mb-2">
                                                            {message.reactions.map((reaction, index) => (
                                                                <button
                                                                    key={index}
                                                                    onClick={() => handleReaction(message.id, reaction.emoji)}
                                                                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${reaction.users.includes(currentUser.id)
                                                                            ? 'bg-blue-100 text-blue-700'
                                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                                        }`}
                                                                >
                                                                    <span>{reaction.emoji}</span>
                                                                    <span>{reaction.users.length}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Message Actions */}
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => setReplyingTo(message)}
                                                            className="text-xs text-gray-500 hover:text-gray-700"
                                                        >
                                                            Reply
                                                        </button>
                                                        {message.sender.id === currentUser.id && (
                                                            <>
                                                                <button
                                                                    onClick={() => setEditingMessage(message.id)}
                                                                    className="text-xs text-gray-500 hover:text-gray-700"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteMessage(message.id)}
                                                                    className="text-xs text-red-500 hover:text-red-700"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => handleReaction(message.id, '👍')}
                                                            className="text-xs text-gray-500 hover:text-gray-700"
                                                        >
                                                            React
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="border-t border-gray-200 p-4">
                                {replyingTo && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mb-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-blue-700">
                                                Replying to {replyingTo.sender.name}
                                            </p>
                                            <button
                                                onClick={() => setReplyingTo(null)}
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-blue-600 truncate">
                                            {replyingTo.content}
                                        </p>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <textarea
                                            ref={messageInputRef}
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                            placeholder="Type a message..."
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            rows={1}
                                        />
                                        <div className="absolute right-2 top-2 flex gap-1">
                                            <button className="p-1 text-gray-400 hover:text-gray-600">
                                                <Paperclip className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                                className="p-1 text-gray-400 hover:text-gray-600"
                                            >
                                                <Smile className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim()}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Comments */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {comments.map(comment => (
                                    <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                                        <div className="flex gap-3">
                                            <div className="flex-shrink-0">
                                                {comment.author.avatar ? (
                                                    <img
                                                        src={comment.author.avatar}
                                                        alt={comment.author.name}
                                                        className="w-8 h-8 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                                        {getInitials(comment.author.name)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {comment.author.name}
                                                    </span>
                                                    <span className="text-xs text-gray-400">
                                                        {formatTime(comment.timestamp)}
                                                    </span>
                                                </div>

                                                {editingComment === comment.id ? (
                                                    <div className="flex gap-2">
                                                        <textarea
                                                            defaultValue={comment.content}
                                                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                                    e.preventDefault();
                                                                    handleEditComment(comment.id, e.currentTarget.value);
                                                                }
                                                                if (e.key === 'Escape') {
                                                                    setEditingComment(null);
                                                                }
                                                            }}
                                                            autoFocus
                                                        />
                                                        <button
                                                            onClick={() => setEditingComment(null)}
                                                            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="group">
                                                        <p className="text-sm text-gray-700 mb-2">{comment.content}</p>

                                                        {/* Reactions */}
                                                        {comment.reactions && comment.reactions.length > 0 && (
                                                            <div className="flex gap-1 mb-2">
                                                                {comment.reactions.map((reaction, index) => (
                                                                    <button
                                                                        key={index}
                                                                        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                                                    >
                                                                        <span>{reaction.emoji}</span>
                                                                        <span>{reaction.users.length}</span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Comment Actions */}
                                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button className="text-xs text-gray-500 hover:text-gray-700">
                                                                Reply
                                                            </button>
                                                            {comment.author.id === currentUser.id && (
                                                                <>
                                                                    <button
                                                                        onClick={() => setEditingComment(comment.id)}
                                                                        className="text-xs text-gray-500 hover:text-gray-700"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteComment(comment.id)}
                                                                        className="text-xs text-red-500 hover:text-red-700"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </>
                                                            )}
                                                            <button className="text-xs text-gray-500 hover:text-gray-700">
                                                                React
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Replies */}
                                                {comment.replies.length > 0 && (
                                                    <div className="ml-4 mt-3 space-y-3">
                                                        {comment.replies.map(reply => (
                                                            <div key={reply.id} className="flex gap-3">
                                                                <div className="flex-shrink-0">
                                                                    {reply.author.avatar ? (
                                                                        <img
                                                                            src={reply.author.avatar}
                                                                            alt={reply.author.name}
                                                                            className="w-6 h-6 rounded-full"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                                                            {getInitials(reply.author.name)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-xs font-medium text-gray-900">
                                                                            {reply.author.name}
                                                                        </span>
                                                                        <span className="text-xs text-gray-400">
                                                                            {formatTime(reply.timestamp)}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-gray-700">{reply.content}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Comment Input */}
                            <div className="border-t border-gray-200 p-4">
                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Add a comment..."
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            rows={2}
                                        />
                                    </div>
                                    <button
                                        onClick={handleSendComment}
                                        disabled={!newComment.trim()}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
