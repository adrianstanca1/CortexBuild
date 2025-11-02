// Mock API for CortexBuild Development
// This provides working API responses without requiring a backend server

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  sessionId: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// Mock chat sessions storage
const chatSessions = new Map<string, ChatSession>();

// Mock chat responses
const mockResponses = [
  "I can help you with project management tasks. What would you like to know?",
  "Based on your current projects, I recommend focusing on the high-priority tasks first.",
  "I've analyzed your team's performance and found some optimization opportunities.",
  "Would you like me to create a task for that? I can assign it to the appropriate team member.",
  "The weather forecast shows rain tomorrow. Consider adjusting outdoor work schedules.",
  "Your project is 15% ahead of schedule. Great work!",
  "I notice some safety compliance items need attention. Shall I create reminders?",
  "Based on historical data, this type of task typically takes 3-4 hours to complete.",
  "I can help you generate a progress report for stakeholders.",
  "Your team's productivity has increased by 12% this month compared to last month."
];

// Generate AI response based on user input
function generateAIResponse(userMessage: string, conversationHistory: ChatMessage[]): string {
  const lowerMessage = userMessage.toLowerCase();
  const recentHistory = conversationHistory.slice(-3).map(message => message.content.toLowerCase());
  
  // Context-aware responses based on keywords
  if (lowerMessage.includes('project') && lowerMessage.includes('status')) {
    return "I can see you have 3 active projects. Project Alpha is 75% complete and on schedule, Project Beta is 60% complete but 2 days behind, and Project Gamma just started this week. Would you like detailed information about any specific project?";
  }
  
  if (lowerMessage.includes('task') && (lowerMessage.includes('create') || lowerMessage.includes('add'))) {
    return "I can help you create a new task. What's the task title, and which project should it be assigned to? I'll also need to know the priority level and estimated duration.";
  }
  
  if (lowerMessage.includes('team') && lowerMessage.includes('performance')) {
    return "Your team's performance metrics show: Average task completion time has improved by 18% this month. John is your top performer with 95% on-time completion. Sarah might need additional support as she's currently at 78% completion rate. Would you like me to suggest some optimization strategies?";
  }
  
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
    return "I'm your AI construction assistant! I can help with: 📊 Project status updates, 📋 Task management, 👥 Team performance analysis, 💰 Budget tracking, 🛡️ Safety compliance, 📅 Schedule optimization, 🌤️ Weather-based recommendations, and 📈 Generate reports. What would you like to explore?";
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! I'm your AI construction management assistant. I'm here to help you manage projects, track progress, analyze performance, and optimize your construction operations. How can I assist you today?";
  }
  
  // Default responses with some variety
  const historyOffset = recentHistory.length % mockResponses.length;
  const randomIndex = (Math.floor(Math.random() * mockResponses.length) + historyOffset) % mockResponses.length;
  const randomResponse = mockResponses[randomIndex];
  return randomResponse;
}

// Mock API functions
export const mockApi = {
  // Chat API
  async getChatMessages(sessionId: string): Promise<{ messages: ChatMessage[] }> {
    const session = chatSessions.get(sessionId);
    const messages = session ? session.messages : [];
    return { messages };
  },

  async sendChatMessage(sessionId: string, message: string): Promise<{ message: ChatMessage }> {
    // Get or create session
    let session = chatSessions.get(sessionId);
    if (!session) {
      session = {
        id: sessionId,
        userId: 'demo-user-123',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      chatSessions.set(sessionId, session);
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      content: message,
      role: 'user',
      timestamp: new Date().toISOString(),
      sessionId
    };
    session.messages.push(userMessage);

    // Generate AI response
    const responseContent = generateAIResponse(message, session.messages);
    const aiMessage: ChatMessage = {
      id: `msg-${Date.now()}-ai`,
      content: responseContent,
      role: 'assistant',
      timestamp: new Date().toISOString(),
      sessionId
    };
    session.messages.push(aiMessage);

    session.updatedAt = new Date().toISOString();

    return { message: aiMessage };
  },

  // Health check
  async getHealth(): Promise<{ status: string; timestamp: string; service: string }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'CortexBuild Mock API'
    };
  },

  // Platform admin
  async getPlatformAdmin(): Promise<{ message: string; timestamp: string; status: string }> {
    return {
      message: 'Platform Admin API is working (Mock)',
      timestamp: new Date().toISOString(),
      status: 'ok'
    };
  },

  // Auth endpoints
  async login(email: string, password: string): Promise<{ success: boolean; token: string; user: any }> {
    const passwordStrength = password.length >= 8 ? 'strong' : 'weak';
    console.info('Mock login attempt', { email, passwordStrength });

    return {
      success: true,
      token: 'demo-token-' + Date.now(),
      user: {
        id: 'demo-user-123',
        email: email,
        name: 'Demo User',
        role: 'admin'
      }
    };
  },

  async getCurrentUser(): Promise<{ success: boolean; user: any }> {
    return {
      success: true,
      user: {
        id: 'demo-user-123',
        email: 'demo@cortexbuild.com',
        name: 'Demo User',
        role: 'admin'
      }
    };
  }
};

// Export individual functions for compatibility
export const getChatMessages = mockApi.getChatMessages;
export const sendChatMessage = mockApi.sendChatMessage;
export const getHealth = mockApi.getHealth;
export const getPlatformAdmin = mockApi.getPlatformAdmin;
export const login = mockApi.login;
export const getCurrentUser = mockApi.getCurrentUser;

export default mockApi;
