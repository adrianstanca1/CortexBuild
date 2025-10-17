// CortexBuild Real-Time Communication Service
import { User, Project, Task } from '../types';

export interface RealTimeEvent {
  id: string;
  type: string;
  channel: string;
  data: any;
  userId: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ChatMessage {
  id: string;
  channelId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  messageType: 'text' | 'image' | 'file' | 'system' | 'voice';
  timestamp: string;
  edited?: boolean;
  editedAt?: string;
  reactions: MessageReaction[];
  mentions: string[];
  attachments: MessageAttachment[];
  threadId?: string;
  replyToId?: string;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnail?: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private' | 'direct' | 'project' | 'team';
  projectId?: string;
  teamId?: string;
  members: ChannelMember[];
  createdBy: string;
  createdAt: string;
  lastActivity: string;
  messageCount: number;
  unreadCount: number;
  settings: ChannelSettings;
}

export interface ChannelMember {
  userId: string;
  userName: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  lastSeen: string;
  permissions: string[];
}

export interface ChannelSettings {
  notifications: boolean;
  mentions: boolean;
  fileSharing: boolean;
  voiceMessages: boolean;
  autoArchive: boolean;
  retentionDays: number;
}

export interface LiveCollaboration {
  id: string;
  type: 'document' | 'drawing' | 'schedule' | 'dashboard';
  resourceId: string;
  participants: CollaborationParticipant[];
  cursors: UserCursor[];
  selections: UserSelection[];
  changes: CollaborationChange[];
  startedAt: string;
  lastActivity: string;
}

export interface CollaborationParticipant {
  userId: string;
  userName: string;
  userAvatar?: string;
  color: string;
  joinedAt: string;
  isActive: boolean;
  permissions: string[];
}

export interface UserCursor {
  userId: string;
  x: number;
  y: number;
  timestamp: string;
}

export interface UserSelection {
  userId: string;
  elementId: string;
  startOffset: number;
  endOffset: number;
  timestamp: string;
}

export interface CollaborationChange {
  id: string;
  userId: string;
  type: 'insert' | 'delete' | 'update' | 'move';
  elementId: string;
  data: any;
  timestamp: string;
  applied: boolean;
}

export interface PresenceInfo {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: string;
  currentLocation?: {
    screen: string;
    projectId?: string;
    taskId?: string;
  };
  device: {
    type: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
  };
}

export interface LiveNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'update';
  title: string;
  message: string;
  data?: any;
  userId: string;
  timestamp: string;
  duration: number; // milliseconds
  actions?: NotificationAction[];
  persistent: boolean;
}

export interface NotificationAction {
  id: string;
  label: string;
  action: string;
  style: 'primary' | 'secondary' | 'danger';
}

class RealTimeService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private eventListeners: Map<string, Function[]> = new Map();
  private isConnected = false;
  private currentUser: User | null = null;

  // Mock data for demonstration
  private channels: ChatChannel[] = [];
  private messages: ChatMessage[] = [];
  private collaborations: LiveCollaboration[] = [];
  private presenceData: Map<string, PresenceInfo> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    const now = new Date();

    // Initialize mock channels
    this.channels = [
      {
        id: 'channel-general',
        name: 'General',
        description: 'General project discussions',
        type: 'public',
        members: [
          {
            userId: 'user-1',
            userName: 'John Manager',
            role: 'owner',
            joinedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            lastSeen: now.toISOString(),
            permissions: ['read', 'write', 'admin']
          },
          {
            userId: 'user-2',
            userName: 'Adrian ASC',
            role: 'member',
            joinedAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
            lastSeen: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
            permissions: ['read', 'write']
          }
        ],
        createdBy: 'user-1',
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastActivity: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
        messageCount: 45,
        unreadCount: 3,
        settings: {
          notifications: true,
          mentions: true,
          fileSharing: true,
          voiceMessages: true,
          autoArchive: false,
          retentionDays: 365
        }
      },
      {
        id: 'channel-project-1',
        name: 'Canary Wharf Tower',
        description: 'Project-specific discussions',
        type: 'project',
        projectId: 'project-1',
        members: [
          {
            userId: 'user-1',
            userName: 'John Manager',
            role: 'admin',
            joinedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            lastSeen: now.toISOString(),
            permissions: ['read', 'write', 'admin']
          },
          {
            userId: 'user-2',
            userName: 'Adrian ASC',
            role: 'member',
            joinedAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(),
            lastSeen: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
            permissions: ['read', 'write']
          }
        ],
        createdBy: 'user-1',
        createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        lastActivity: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
        messageCount: 128,
        unreadCount: 7,
        settings: {
          notifications: true,
          mentions: true,
          fileSharing: true,
          voiceMessages: true,
          autoArchive: false,
          retentionDays: 365
        }
      }
    ];

    // Initialize mock messages
    this.messages = [
      {
        id: 'msg-1',
        channelId: 'channel-project-1',
        userId: 'user-2',
        userName: 'Adrian ASC',
        message: 'Facade installation on floors 15-20 is progressing well. Should be completed by Friday.',
        messageType: 'text',
        timestamp: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
        reactions: [
          {
            emoji: '👍',
            userId: 'user-1',
            userName: 'John Manager',
            timestamp: new Date(now.getTime() - 8 * 60 * 1000).toISOString()
          }
        ],
        mentions: [],
        attachments: []
      },
      {
        id: 'msg-2',
        channelId: 'channel-project-1',
        userId: 'user-1',
        userName: 'John Manager',
        message: 'Great work! Please update the progress in the system when complete.',
        messageType: 'text',
        timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
        reactions: [],
        mentions: ['user-2'],
        attachments: []
      }
    ];

    // Initialize presence data
    this.presenceData.set('user-1', {
      userId: 'user-1',
      status: 'online',
      lastSeen: now.toISOString(),
      currentLocation: {
        screen: 'dashboard',
        projectId: 'project-1'
      },
      device: {
        type: 'desktop',
        browser: 'Chrome',
        os: 'macOS'
      }
    });

    this.presenceData.set('user-2', {
      userId: 'user-2',
      status: 'online',
      lastSeen: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
      currentLocation: {
        screen: 'tasks',
        projectId: 'project-1'
      },
      device: {
        type: 'mobile',
        browser: 'Safari',
        os: 'iOS'
      }
    });
  }

  // Connection Management
  async connect(user: User): Promise<boolean> {
    this.currentUser = user;
    
    try {
      // In a real implementation, this would connect to a WebSocket server
      // For now, we'll simulate the connection
      this.isConnected = true;
      this.startHeartbeat();
      this.updatePresence('online');
      
      this.emit('connected', { user });
      return true;
    } catch (error) {
      console.error('Failed to connect to real-time service:', error);
      return false;
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    this.isConnected = false;
    this.updatePresence('offline');
    this.emit('disconnected', {});
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        // Send heartbeat
        this.sendEvent('heartbeat', {
          userId: this.currentUser?.id,
          timestamp: new Date().toISOString()
        });
      }
    }, 30000); // 30 seconds
  }

  // Event Management
  on(eventType: string, callback: Function): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  off(eventType: string, callback: Function): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(eventType: string, data: any): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  private sendEvent(type: string, data: any): void {
    if (this.isConnected) {
      // In a real implementation, this would send via WebSocket
      console.log('Sending real-time event:', { type, data });
    }
  }

  // Chat Functions
  async getChannels(userId: string): Promise<ChatChannel[]> {
    return this.channels.filter(channel => 
      channel.members.some(member => member.userId === userId)
    );
  }

  async getMessages(channelId: string, limit: number = 50, before?: string): Promise<ChatMessage[]> {
    let messages = this.messages.filter(msg => msg.channelId === channelId);
    
    if (before) {
      messages = messages.filter(msg => new Date(msg.timestamp) < new Date(before));
    }
    
    return messages
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
      .reverse();
  }

  async sendMessage(channelId: string, message: string, messageType: 'text' | 'image' | 'file' = 'text'): Promise<ChatMessage> {
    if (!this.currentUser) throw new Error('User not authenticated');

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      channelId,
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      userAvatar: this.currentUser.avatar,
      message,
      messageType,
      timestamp: new Date().toISOString(),
      reactions: [],
      mentions: this.extractMentions(message),
      attachments: []
    };

    this.messages.push(newMessage);
    
    // Update channel activity
    const channel = this.channels.find(c => c.id === channelId);
    if (channel) {
      channel.lastActivity = newMessage.timestamp;
      channel.messageCount++;
    }

    // Emit real-time event
    this.emit('message', newMessage);
    this.sendEvent('message', newMessage);

    return newMessage;
  }

  async addReaction(messageId: string, emoji: string): Promise<void> {
    if (!this.currentUser) throw new Error('User not authenticated');

    const message = this.messages.find(msg => msg.id === messageId);
    if (!message) throw new Error('Message not found');

    // Remove existing reaction from this user for this emoji
    message.reactions = message.reactions.filter(
      reaction => !(reaction.userId === this.currentUser!.id && reaction.emoji === emoji)
    );

    // Add new reaction
    message.reactions.push({
      emoji,
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      timestamp: new Date().toISOString()
    });

    this.emit('reaction', { messageId, emoji, userId: this.currentUser.id });
    this.sendEvent('reaction', { messageId, emoji, userId: this.currentUser.id });
  }

  // Presence Management
  async updatePresence(status: 'online' | 'away' | 'busy' | 'offline', location?: any): Promise<void> {
    if (!this.currentUser) return;

    const presence: PresenceInfo = {
      userId: this.currentUser.id,
      status,
      lastSeen: new Date().toISOString(),
      currentLocation: location,
      device: {
        type: this.detectDeviceType(),
        browser: this.detectBrowser(),
        os: this.detectOS()
      }
    };

    this.presenceData.set(this.currentUser.id, presence);
    this.emit('presence', presence);
    this.sendEvent('presence', presence);
  }

  async getPresence(userId: string): Promise<PresenceInfo | null> {
    return this.presenceData.get(userId) || null;
  }

  async getAllPresence(): Promise<PresenceInfo[]> {
    return Array.from(this.presenceData.values());
  }

  // Live Collaboration
  async startCollaboration(type: string, resourceId: string): Promise<LiveCollaboration> {
    if (!this.currentUser) throw new Error('User not authenticated');

    const collaboration: LiveCollaboration = {
      id: `collab-${Date.now()}`,
      type: type as any,
      resourceId,
      participants: [
        {
          userId: this.currentUser.id,
          userName: this.currentUser.name,
          userAvatar: this.currentUser.avatar,
          color: this.generateUserColor(this.currentUser.id),
          joinedAt: new Date().toISOString(),
          isActive: true,
          permissions: ['read', 'write']
        }
      ],
      cursors: [],
      selections: [],
      changes: [],
      startedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    this.collaborations.push(collaboration);
    this.emit('collaboration_started', collaboration);
    this.sendEvent('collaboration_started', collaboration);

    return collaboration;
  }

  async joinCollaboration(collaborationId: string): Promise<boolean> {
    if (!this.currentUser) throw new Error('User not authenticated');

    const collaboration = this.collaborations.find(c => c.id === collaborationId);
    if (!collaboration) return false;

    // Check if user is already a participant
    const existingParticipant = collaboration.participants.find(p => p.userId === this.currentUser!.id);
    if (existingParticipant) {
      existingParticipant.isActive = true;
      return true;
    }

    // Add new participant
    collaboration.participants.push({
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      userAvatar: this.currentUser.avatar,
      color: this.generateUserColor(this.currentUser.id),
      joinedAt: new Date().toISOString(),
      isActive: true,
      permissions: ['read', 'write']
    });

    collaboration.lastActivity = new Date().toISOString();

    this.emit('collaboration_joined', { collaborationId, user: this.currentUser });
    this.sendEvent('collaboration_joined', { collaborationId, user: this.currentUser });

    return true;
  }

  // Live Notifications
  async sendLiveNotification(notification: Omit<LiveNotification, 'id' | 'timestamp'>): Promise<void> {
    const liveNotification: LiveNotification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    this.emit('live_notification', liveNotification);
    this.sendEvent('live_notification', liveNotification);
  }

  // Utility Methods
  private extractMentions(message: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(message)) !== null) {
      mentions.push(match[1]);
    }

    return mentions;
  }

  private generateUserColor(userId: string): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const index = userId.charCodeAt(0) % colors.length;
    return colors[index];
  }

  private detectDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    if (typeof window === 'undefined') return 'desktop';
    
    const userAgent = window.navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) return 'mobile';
    return 'desktop';
  }

  private detectBrowser(): string {
    if (typeof window === 'undefined') return 'Unknown';
    
    const userAgent = window.navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private detectOS(): string {
    if (typeof window === 'undefined') return 'Unknown';
    
    const userAgent = window.navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  // Connection Status
  isConnectedToRealTime(): boolean {
    return this.isConnected;
  }

  getConnectionStatus(): {
    connected: boolean;
    reconnectAttempts: number;
    lastHeartbeat?: string;
  } {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      lastHeartbeat: new Date().toISOString()
    };
  }
}

export const realTimeService = new RealTimeService();
export default realTimeService;
