import React, { useState, useEffect, useRef } from 'react';
import { Users, MessageCircle, Activity as ActivityIcon, Wifi, WifiOff, Circle } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
  currentPage?: string;
  lastActivity?: string;
}

interface Message {
  id: string;
  userId: number;
  userName: string;
  message: string;
  timestamp: Date;
  type: 'chat' | 'system' | 'activity';
}

interface CollaborationActivity {
  id: string;
  userId: number;
  userName: string;
  action: string;
  target: string;
  timestamp: Date;
}

export const RealtimeCollaboration: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activities, setActivities] = useState<CollaborationActivity[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'chat' | 'activity'>('users');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const connectWebSocket = () => {
    try {
      const token = localStorage.getItem('token');
      const ws = new WebSocket(`ws://localhost:3001/ws?token=${token}`);

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setIsConnected(false);
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setIsConnected(false);
    }
  };

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'users_update':
        setActiveUsers(data.users);
        break;
      case 'chat_message':
        setMessages(prev => [...prev, {
          id: data.id,
          userId: data.userId,
          userName: data.userName,
          message: data.message,
          timestamp: new Date(data.timestamp),
          type: 'chat'
        }]);
        break;
      case 'activity':
        setActivities(prev => [{
          id: data.id,
          userId: data.userId,
          userName: data.userName,
          action: data.action,
          target: data.target,
          timestamp: new Date(data.timestamp)
        }, ...prev].slice(0, 50));
        break;
      case 'user_joined':
        addSystemMessage(`${data.userName} joined`);
        break;
      case 'user_left':
        addSystemMessage(`${data.userName} left`);
        break;
    }
  };

  const addSystemMessage = (message: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      userId: 0,
      userName: 'System',
      message,
      timestamp: new Date(),
      type: 'system'
    }]);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: 'chat_message',
      message: newMessage
    }));

    setNewMessage('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Live Collaboration</h2>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-600 font-medium">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-600 font-medium">Disconnected</span>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'users'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Active Users ({activeUsers.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'chat'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Team Chat
          </div>
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'activity'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <ActivityIcon className="w-4 h-4" />
            Activity Feed
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="h-96">
        {activeTab === 'users' && (
          <div className="space-y-3 overflow-y-auto h-full">
            {activeUsers.map(user => (
              <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <Circle className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(user.status)} rounded-full border-2 border-white`} fill="currentColor" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.currentPage || 'Dashboard'}</div>
                </div>
                <div className="text-xs text-gray-400">
                  {user.lastActivity || 'Just now'}
                </div>
              </div>
            ))}
            {activeUsers.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                No active users at the moment
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {messages.map(msg => (
                <div key={msg.id} className={`${msg.type === 'system' ? 'text-center' : ''}`}>
                  {msg.type === 'system' ? (
                    <span className="text-xs text-gray-500 italic">{msg.message}</span>
                  ) : (
                    <div className="flex gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {msg.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="font-medium text-gray-800">{msg.userName}</span>
                          <span className="text-xs text-gray-400">
                            {msg.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-gray-700 mt-1">{msg.message}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!isConnected}
              />
              <button
                onClick={sendMessage}
                disabled={!isConnected || !newMessage.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-2 overflow-y-auto h-full">
            {activities.map(activity => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <ActivityIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-gray-800">
                    <span className="font-medium">{activity.userName}</span>
                    {' '}{activity.action}{' '}
                    <span className="font-medium">{activity.target}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {activity.timestamp.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                No recent activity
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

