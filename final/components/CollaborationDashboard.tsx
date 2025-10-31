// 🏗️ Collaboration & Communication Dashboard
// Real-time chat, notifications, team messaging, and activity feeds

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Bell, 
  Users, 
  Phone, 
  Video, 
  Paperclip, 
  Smile, 
  Search, 
  Settings, 
  MoreVertical,
  Pin,
  Star,
  Archive,
  Trash2,
  Plus,
  Hash,
  AtSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Share2,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';

interface CollaborationDashboardProps {
  projectId: string;
  userId: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: Date;
  type: 'text' | 'file' | 'image' | 'system';
  attachments?: Attachment[];
  reactions?: Reaction[];
  threadId?: string;
  isEdited?: boolean;
  mentions?: string[];
}

interface Channel {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private' | 'direct';
  members: string[];
  isArchived: boolean;
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  createdAt: Date;
}

interface Notification {
  id: string;
  type: 'mention' | 'message' | 'task' | 'document' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
  relatedUser?: string;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
}

interface Reaction {
  emoji: string;
  users: string[];
  count: number;
}

interface ActivityItem {
  id: string;
  type: 'message' | 'document' | 'task' | 'meeting' | 'file';
  title: string;
  description: string;
  user: string;
  timestamp: Date;
  metadata?: any;
}

export const CollaborationDashboard: React.FC<CollaborationDashboardProps> = ({ 
  projectId, 
  userId 
}) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCollaborationData();
    // Simulate real-time updates
    const interval = setInterval(() => {
      simulateRealTimeUpdates();
    }, 5000);
    return () => clearInterval(interval);
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadCollaborationData = async () => {
    try {
      // Load mock data
      setChannels(getMockChannels());
      setNotifications(getMockNotifications());
      setActivities(getMockActivities());
      setOnlineUsers(['user-1', 'user-2', 'user-3']);
      
      // Select first channel by default
      const defaultChannel = getMockChannels()[0];
      setSelectedChannel(defaultChannel);
      setMessages(getMockMessages(defaultChannel.id));
    } catch (error) {
      console.error('Error loading collaboration data:', error);
    }
  };

  const simulateRealTimeUpdates = () => {
    // Simulate new messages, notifications, etc.
    const randomMessages = [
      "Great progress on the foundation work!",
      "Can someone review the latest drawings?",
      "Safety meeting at 2 PM today",
      "Material delivery scheduled for tomorrow",
      "Quality inspection passed ✅"
    ];
    
    if (Math.random() > 0.7 && selectedChannel) {
      const newMsg: Message = {
        id: `msg-${Date.now()}`,
        content: randomMessages[Math.floor(Math.random() * randomMessages.length)],
        senderId: 'user-' + Math.floor(Math.random() * 5),
        senderName: ['John Smith', 'Sarah Johnson', 'Mike Wilson', 'Lisa Chen', 'David Brown'][Math.floor(Math.random() * 5)],
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, newMsg]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChannel) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      content: newMessage,
      senderId: userId,
      senderName: 'You',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !selectedChannel) return;

    Array.from(files).forEach(file => {
      const message: Message = {
        id: `msg-${Date.now()}-${file.name}`,
        content: `Shared a file: ${file.name}`,
        senderId: userId,
        senderName: 'You',
        timestamp: new Date(),
        type: 'file',
        attachments: [{
          id: `att-${Date.now()}`,
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file)
        }]
      };
      setMessages(prev => [...prev, message]);
    });
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const getMockChannels = (): Channel[] => {
    return [
      {
        id: 'general',
        name: 'General',
        description: 'General project discussion',
        type: 'public',
        members: ['user-1', 'user-2', 'user-3', 'user-4'],
        isArchived: false,
        unreadCount: 3,
        isPinned: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'field-updates',
        name: 'Field Updates',
        description: 'Daily field reports and updates',
        type: 'public',
        members: ['user-1', 'user-2', 'user-5'],
        isArchived: false,
        unreadCount: 1,
        isPinned: false,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'safety',
        name: 'Safety',
        description: 'Safety discussions and alerts',
        type: 'public',
        members: ['user-1', 'user-3', 'user-4', 'user-5'],
        isArchived: false,
        unreadCount: 0,
        isPinned: true,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'management',
        name: 'Management',
        description: 'Project management team',
        type: 'private',
        members: ['user-1', 'user-2'],
        isArchived: false,
        unreadCount: 2,
        isPinned: false,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      }
    ];
  };

  const getMockMessages = (channelId: string): Message[] => {
    return [
      {
        id: 'msg-1',
        content: 'Good morning team! Ready for another productive day.',
        senderId: 'user-1',
        senderName: 'John Smith',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'text'
      },
      {
        id: 'msg-2',
        content: 'Foundation work is progressing well. Should be done by Friday.',
        senderId: 'user-2',
        senderName: 'Sarah Johnson',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        type: 'text'
      },
      {
        id: 'msg-3',
        content: 'Great to hear! Can you share some photos of the progress?',
        senderId: 'user-3',
        senderName: 'Mike Wilson',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        type: 'text'
      },
      {
        id: 'msg-4',
        content: 'Here are the latest photos from the site.',
        senderId: 'user-2',
        senderName: 'Sarah Johnson',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        type: 'image',
        attachments: [{
          id: 'att-1',
          name: 'foundation-progress.jpg',
          type: 'image/jpeg',
          size: 2048576,
          url: '/mock-images/foundation.jpg',
          thumbnailUrl: '/mock-images/foundation-thumb.jpg'
        }]
      }
    ];
  };

  const getMockNotifications = (): Notification[] => {
    return [
      {
        id: 'notif-1',
        type: 'mention',
        title: 'You were mentioned',
        message: 'John Smith mentioned you in #general',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        isRead: false,
        priority: 'medium',
        relatedUser: 'John Smith'
      },
      {
        id: 'notif-2',
        type: 'task',
        title: 'Task assigned',
        message: 'New task: Review electrical plans',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isRead: false,
        priority: 'high'
      },
      {
        id: 'notif-3',
        type: 'document',
        title: 'Document updated',
        message: 'Architectural drawings v2.1 uploaded',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        isRead: true,
        priority: 'low'
      }
    ];
  };

  const getMockActivities = (): ActivityItem[] => {
    return [
      {
        id: 'activity-1',
        type: 'document',
        title: 'Document uploaded',
        description: 'Sarah uploaded foundation drawings v2.1',
        user: 'Sarah Johnson',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      {
        id: 'activity-2',
        type: 'task',
        title: 'Task completed',
        description: 'Mike completed electrical rough-in inspection',
        user: 'Mike Wilson',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 'activity-3',
        type: 'meeting',
        title: 'Meeting scheduled',
        description: 'Weekly progress meeting scheduled for Friday 2 PM',
        user: 'John Smith',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
      }
    ];
  };

  const tabs = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'activity', label: 'Activity', icon: Clock },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'calls', label: 'Calls', icon: Phone }
  ];

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  return (
    <div className="bg-white rounded-lg shadow-lg h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Collaboration</h1>
            <p className="text-gray-600">Real-time communication and project updates</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-64"
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              {showNotifications && (
                <NotificationsPanel
                  notifications={notifications}
                  onMarkAsRead={markNotificationAsRead}
                  onClose={() => setShowNotifications(false)}
                />
              )}
            </div>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex h-[calc(100%-8rem)]">
        {activeTab === 'chat' && (
          <>
            {/* Channels Sidebar */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Channels</h3>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {channels.map((channel) => (
                  <ChannelItem
                    key={channel.id}
                    channel={channel}
                    isSelected={selectedChannel?.id === channel.id}
                    onClick={() => {
                      setSelectedChannel(channel);
                      setMessages(getMockMessages(channel.id));
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedChannel ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">#{selectedChannel.name}</h3>
                        <p className="text-sm text-gray-600">{selectedChannel.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-gray-100 rounded">
                          <Phone className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded">
                          <Video className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <MessageItem key={message.id} message={message} currentUserId={userId} />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        multiple
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder={`Message #${selectedChannel.name}`}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded">
                          <Smile className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Select a channel</h3>
                    <p className="text-gray-600">Choose a channel to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'activity' && (
          <div className="flex-1 p-6">
            <ActivityFeed activities={activities} />
          </div>
        )}

        {activeTab === 'team' && (
          <div className="flex-1 p-6">
            <TeamPanel onlineUsers={onlineUsers} />
          </div>
        )}

        {activeTab === 'calls' && (
          <div className="flex-1 p-6">
            <CallsPanel />
          </div>
        )}
      </div>
    </div>
  );
};

// Channel Item Component
const ChannelItem: React.FC<{
  channel: Channel;
  isSelected: boolean;
  onClick: () => void;
}> = ({ channel, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 hover:bg-gray-50 ${isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {channel.type === 'private' ? (
            <div className="w-2 h-2 bg-gray-400 rounded-full mr-2" />
          ) : (
            <Hash className="w-4 h-4 text-gray-400 mr-2" />
          )}
          <span className="font-medium text-gray-900">{channel.name}</span>
          {channel.isPinned && <Pin className="w-3 h-3 text-gray-400 ml-1" />}
        </div>
        {channel.unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[1.25rem] text-center">
            {channel.unreadCount}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 truncate mt-1">{channel.description}</p>
    </button>
  );
};

// Message Item Component
const MessageItem: React.FC<{
  message: Message;
  currentUserId: string;
}> = ({ message, currentUserId }) => {
  const isOwnMessage = message.senderId === currentUserId;

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        {!isOwnMessage && (
          <div className="flex items-center mb-1">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2">
              {message.senderName.charAt(0)}
            </div>
            <span className="text-sm font-medium text-gray-900">{message.senderName}</span>
            <span className="text-xs text-gray-500 ml-2">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
        <div className={`rounded-lg px-4 py-2 ${
          isOwnMessage 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          <p className="text-sm">{message.content}</p>
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center space-x-2 text-xs">
                  <Paperclip className="w-3 h-3" />
                  <span>{attachment.name}</span>
                  <span>({(attachment.size / 1024 / 1024).toFixed(1)} MB)</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {isOwnMessage && (
          <div className="text-xs text-gray-500 text-right mt-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
};

// Notifications Panel Component
const NotificationsPanel: React.FC<{
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClose: () => void;
}> = ({ notifications, onMarkAsRead, onClose }) => {
  return (
    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                !notification.isRead ? 'bg-blue-50' : ''
              }`}
              onClick={() => onMarkAsRead(notification.id)}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-1 rounded-full ${
                  notification.priority === 'high' ? 'bg-red-100' :
                  notification.priority === 'medium' ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>
                  {notification.type === 'mention' && <AtSign className="w-4 h-4 text-blue-600" />}
                  {notification.type === 'task' && <CheckCircle className="w-4 h-4 text-green-600" />}
                  {notification.type === 'document' && <FileText className="w-4 h-4 text-purple-600" />}
                  {notification.type === 'system' && <Info className="w-4 h-4 text-gray-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                  <p className="text-sm text-gray-600 truncate">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Activity Feed Component
const ActivityFeed: React.FC<{
  activities: ActivityItem[];
}> = ({ activities }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-lg">
              {activity.type === 'document' && <FileText className="w-4 h-4 text-blue-600" />}
              {activity.type === 'task' && <CheckCircle className="w-4 h-4 text-green-600" />}
              {activity.type === 'meeting' && <Calendar className="w-4 h-4 text-purple-600" />}
              {activity.type === 'message' && <MessageSquare className="w-4 h-4 text-orange-600" />}
              {activity.type === 'file' && <Paperclip className="w-4 h-4 text-gray-600" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
              <p className="text-sm text-gray-600">{activity.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                {activity.user} • {activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Team Panel Component
const TeamPanel: React.FC<{
  onlineUsers: string[];
}> = ({ onlineUsers }) => {
  const teamMembers = [
    { id: 'user-1', name: 'John Smith', role: 'Project Manager', avatar: 'JS', status: 'online' },
    { id: 'user-2', name: 'Sarah Johnson', role: 'Site Supervisor', avatar: 'SJ', status: 'online' },
    { id: 'user-3', name: 'Mike Wilson', role: 'Safety Officer', avatar: 'MW', status: 'away' },
    { id: 'user-4', name: 'Lisa Chen', role: 'Quality Inspector', avatar: 'LC', status: 'offline' },
    { id: 'user-5', name: 'David Brown', role: 'Foreman', avatar: 'DB', status: 'online' }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
      <div className="space-y-4">
        {teamMembers.map((member) => (
          <div key={member.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
            <div className="relative">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                {member.avatar}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                member.status === 'online' ? 'bg-green-500' :
                member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
              }`} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{member.name}</p>
              <p className="text-sm text-gray-600">{member.role}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-1 hover:bg-gray-100 rounded">
                <MessageSquare className="w-4 h-4" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded">
                <Phone className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Calls Panel Component
const CallsPanel: React.FC = () => {
  return (
    <div className="text-center py-12">
      <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Video Calls</h3>
      <p className="text-gray-600 mb-6">Start a video call with your team members</p>
      <div className="space-y-3">
        <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Video className="w-4 h-4 mr-2" />
          Start Video Call
        </button>
        <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Phone className="w-4 h-4 mr-2" />
          Start Audio Call
        </button>
      </div>
    </div>
  );
};

export default CollaborationDashboard;
