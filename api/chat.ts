// Chat API for CortexBuild
// Types are exported from mockApi.ts to avoid duplication
import type { ChatMessage, ChatSession } from './mockApi';

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

export const sendMessage = async (sessionId: string, message: string, userId: string): Promise<ChatMessage> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

  // Get or create session
  let session = chatSessions.get(sessionId);
  if (!session) {
    session = {
      id: sessionId,
      userId,
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

  return aiMessage;
};

export const getChatHistory = async (sessionId: string): Promise<ChatMessage[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const session = chatSessions.get(sessionId);
  return session ? session.messages : [];
};

export const createChatSession = async (userId: string): Promise<string> => {
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const session: ChatSession = {
    id: sessionId,
    userId,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  chatSessions.set(sessionId, session);
  return sessionId;
};

export const deleteChatSession = async (sessionId: string): Promise<boolean> => {
  return chatSessions.delete(sessionId);
};

export const getUserChatSessions = async (userId: string): Promise<ChatSession[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const userSessions: ChatSession[] = [];
  for (const session of chatSessions.values()) {
    if (session.userId === userId) {
      userSessions.push(session);
    }
  }
  
  return userSessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

// Generate AI response based on user input and conversation history
function generateAIResponse(userMessage: string, conversationHistory: ChatMessage[]): string {
  const lowerMessage = userMessage.toLowerCase();
  
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
  
  if (lowerMessage.includes('safety') || lowerMessage.includes('incident')) {
    return "Safety is our top priority. I've reviewed recent safety reports and found 2 minor incidents this month, both properly documented. All safety training is up to date for 94% of your team. Would you like me to schedule refresher training for the remaining team members?";
  }
  
  if (lowerMessage.includes('budget') || lowerMessage.includes('cost')) {
    return "Based on current spending patterns, you're 8% under budget across all active projects. Project Alpha has the highest cost efficiency at 92%, while Project Beta is at 85%. I recommend reviewing material costs for Project Beta to identify potential savings.";
  }
  
  if (lowerMessage.includes('schedule') || lowerMessage.includes('deadline')) {
    return "Looking at your current schedule, you have 5 tasks due this week and 12 due next week. The critical path shows potential delays in the electrical work phase. I recommend prioritizing the foundation inspection to avoid bottlenecks.";
  }
  
  if (lowerMessage.includes('weather')) {
    return "Tomorrow's forecast shows 70% chance of rain with winds up to 25 mph. I recommend rescheduling outdoor concrete work and focusing on interior tasks. The weather should clear up by Thursday for resumed outdoor activities.";
  }
  
  if (lowerMessage.includes('report') || lowerMessage.includes('analytics')) {
    return "I can generate several types of reports for you: Project Progress Summary, Team Performance Analytics, Budget Analysis, Safety Compliance Report, or Custom Dashboard. Which would be most helpful right now?";
  }
  
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
    return "I'm your AI construction assistant! I can help with: 📊 Project status updates, 📋 Task management, 👥 Team performance analysis, 💰 Budget tracking, 🛡️ Safety compliance, 📅 Schedule optimization, 🌤️ Weather-based recommendations, and 📈 Generate reports. What would you like to explore?";
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! I'm your AI construction management assistant. I'm here to help you manage projects, track progress, analyze performance, and optimize your construction operations. How can I assist you today?";
  }
  
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    return "You're welcome! I'm always here to help optimize your construction projects and support your team's success. Is there anything else you'd like to know or any other way I can assist you?";
  }
  
  // Check conversation context for follow-up responses
  const recentMessages = conversationHistory.slice(-4);
  const recentTopics = recentMessages.map(msg => msg.content.toLowerCase()).join(' ');
  
  if (recentTopics.includes('project') && !lowerMessage.includes('project')) {
    return "Continuing with your project discussion - would you like me to dive deeper into any specific aspect like timeline, resources, or deliverables?";
  }
  
  // Default responses with some variety
  const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
  return randomResponse;
}

// Export for API endpoint simulation
export const handleChatRequest = async (req: { sessionId: string; message?: string; userId: string }) => {
  const { sessionId, message, userId } = req;
  
  if (message) {
    // Send message and get response
    return await sendMessage(sessionId, message, userId);
  } else {
    // Get chat history
    return await getChatHistory(sessionId);
  }
};

export default {
  sendMessage,
  getChatHistory,
  createChatSession,
  deleteChatSession,
  getUserChatSessions,
  handleChatRequest
};
