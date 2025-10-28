import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface AIAssistantProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'action';
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ user, addToast }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<'openai' | 'gemini'>('gemini');

  useEffect(() => {
    // Add welcome message
    setMessages([
      {
        id: '1',
        content: `Hello ${user.firstName}! I'm your AI assistant powered by ${activeProvider === 'openai' ? 'OpenAI' : 'Google Gemini'}. I can help you with:

• Project planning and management
• Task optimization and scheduling  
• Financial analysis and reporting
• Team coordination and communication
• Safety compliance and risk assessment
• Document generation and analysis

What would you like to work on today?`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      }
    ]);
  }, [user.firstName, activeProvider]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Simulate AI response - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(inputValue, activeProvider),
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, aiResponse]);
      addToast('AI response generated successfully!', 'success');
    } catch (error) {
      addToast('Failed to get AI response. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = (input: string, provider: 'openai' | 'gemini'): string => {
    // Mock AI responses based on input patterns
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('project') || lowerInput.includes('schedule')) {
      return `Based on your project query, I recommend:

1. **Timeline Optimization**: Review critical path dependencies
2. **Resource Allocation**: Check team availability for the next 2 weeks  
3. **Risk Assessment**: Identify potential delays and mitigation strategies

Would you like me to generate a detailed project timeline or resource allocation report?

*Powered by ${provider === 'openai' ? 'OpenAI GPT-4' : 'Google Gemini Pro'}*`;
    }
    
    if (lowerInput.includes('budget') || lowerInput.includes('cost') || lowerInput.includes('financial')) {
      return `Here's your financial analysis:

📊 **Current Status**:
• Total Project Budget: $2.4M
• Spent to Date: $1.8M (75%)
• Remaining: $600K
• Projected Completion: On budget ✅

💡 **Recommendations**:
- Consider bulk purchasing for remaining materials (5-8% savings)
- Review subcontractor rates for competitive pricing
- Implement cost tracking dashboard for real-time monitoring

*Analysis generated using ${provider === 'openai' ? 'OpenAI' : 'Gemini'} financial models*`;
    }
    
    if (lowerInput.includes('team') || lowerInput.includes('staff') || lowerInput.includes('worker')) {
      return `Team management insights:

👥 **Current Team Status**:
• Active Workers: 24
• Productivity Score: 87%
• Safety Incidents: 0 this month ✅
• Overtime Hours: 12% of total

📈 **Optimization Suggestions**:
1. Cross-train 3 workers in electrical work to reduce bottlenecks
2. Schedule team building session for Site B crew
3. Implement mobile check-in system for better attendance tracking

*Team analytics powered by ${provider === 'openai' ? 'OpenAI' : 'Gemini'} workforce intelligence*`;
    }
    
    return `I understand you're asking about: "${input}"

I'm here to help with construction management tasks! I can assist with:

🏗️ **Project Management**: Planning, scheduling, resource allocation
💰 **Financial Analysis**: Budget tracking, cost optimization, forecasting  
👥 **Team Coordination**: Workforce planning, productivity analysis
📊 **Reporting**: Generate custom reports and insights
🛡️ **Safety & Compliance**: Risk assessment, safety protocol recommendations

Could you provide more specific details about what you'd like help with?

*Powered by ${provider === 'openai' ? 'OpenAI GPT-4' : 'Google Gemini Pro'} - Switch providers anytime!*`;
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto">
      {/* Header */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">🤖 AI Assistant</h2>
            <p className="text-gray-600">Multi-AI powered construction management assistant</p>
          </div>
          
          {/* AI Provider Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">AI Provider:</span>
            <select
              value={activeProvider}
              onChange={(e) => setActiveProvider(e.target.value as 'openai' | 'gemini')}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI GPT-4</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Chat Messages */}
      <Card className="flex-1 flex flex-col p-4 mb-4">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-2 rounded-lg flex items-center space-x-2">
                <LoadingSpinner size="sm" />
                <span className="text-gray-600">AI is thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything about your construction projects..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            variant="primary"
          >
            Send
          </Button>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button
            onClick={() => setInputValue('Generate a project status report')}
            variant="ghost"
            size="sm"
            className="text-left"
          >
            📊 Status Report
          </Button>
          <Button
            onClick={() => setInputValue('Analyze current budget and costs')}
            variant="ghost"
            size="sm"
            className="text-left"
          >
            💰 Budget Analysis
          </Button>
          <Button
            onClick={() => setInputValue('Review team productivity and scheduling')}
            variant="ghost"
            size="sm"
            className="text-left"
          >
            👥 Team Review
          </Button>
          <Button
            onClick={() => setInputValue('Identify potential safety risks')}
            variant="ghost"
            size="sm"
            className="text-left"
          >
            🛡️ Safety Check
          </Button>
        </div>
      </Card>
    </div>
  );
};