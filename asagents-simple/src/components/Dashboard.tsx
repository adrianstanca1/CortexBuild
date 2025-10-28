import React, { useState } from 'react';
import { MultiAIService, AIResponse } from '../services/multiAi';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
  aiService: MultiAIService;
  aiStatus: any;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  onLogout, 
  aiService, 
  aiStatus 
}) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAiQuery = async () => {
    if (!aiPrompt.trim()) return;
    
    setAiLoading(true);
    try {
      const response = await aiService.generateText(
        aiPrompt,
        {
          systemPrompt: 'You are a helpful AI assistant for a construction management platform. Provide practical and actionable advice.',
          maxTokens: 500,
          temperature: 0.7
        }
      );
      setAiResponse(response);
    } catch (error) {
      console.error('AI query failed:', error);
      setAiResponse({
        content: `Error: ${error instanceof Error ? error.message : 'AI service unavailable'}`,
        provider: 'error' as any,
        model: 'error'
      });
    } finally {
      setAiLoading(false);
    }
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'projects', label: 'Projects', icon: '🏗️' },
    { id: 'tasks', label: 'Tasks', icon: '✅' },
    { id: 'safety', label: 'Safety', icon: '🦺' },
    { id: 'financials', label: 'Financials', icon: '💰' },
    { id: 'team', label: 'Team', icon: '👥' },
    { id: 'documents', label: 'Documents', icon: '📁' },
    { id: 'ai-assistant', label: 'AI Assistant', icon: '🤖' },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'ai-assistant':
        return (
          <div className="ai-demo">
            <h2 className="ai-demo-title">AI Assistant - Construction Management</h2>
            <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
              Ask questions about project management, safety protocols, cost estimation, or any construction-related topics.
            </p>
            
            <div className="ai-demo-form">
              <input
                type="text"
                className="ai-demo-input"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask me about construction management..."
                onKeyPress={(e) => e.key === 'Enter' && handleAiQuery()}
              />
              <button 
                className="btn-primary" 
                onClick={handleAiQuery}
                disabled={aiLoading || !aiPrompt.trim()}
                style={{ width: 'auto', minWidth: '120px' }}
              >
                {aiLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    <span style={{ marginLeft: '8px' }}>Thinking...</span>
                  </>
                ) : (
                  'Ask AI'
                )}
              </button>
            </div>

            {aiResponse && (
              <div className="ai-response">
                <div className="ai-response-meta">
                  <strong>Provider:</strong> {aiResponse.provider} | 
                  <strong> Model:</strong> {aiResponse.model}
                  {aiResponse.usage && (
                    <span> | <strong>Tokens:</strong> {aiResponse.usage.totalTokens}</span>
                  )}
                </div>
                <div className="ai-response-content">{aiResponse.content}</div>
              </div>
            )}
          </div>
        );
      
      case 'projects':
        return (
          <div className="ai-demo">
            <h2 className="ai-demo-title">Projects Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <h3>Riverside Apartments</h3>
                <p><strong>Status:</strong> In Progress</p>
                <p><strong>Budget:</strong> £2,500,000</p>
                <p><strong>Completion:</strong> 65%</p>
              </div>
              <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <h3>City Centre Office</h3>
                <p><strong>Status:</strong> Planning</p>
                <p><strong>Budget:</strong> £1,800,000</p>
                <p><strong>Completion:</strong> 15%</p>
              </div>
              <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <h3>Industrial Warehouse</h3>
                <p><strong>Status:</strong> Completed</p>
                <p><strong>Budget:</strong> £950,000</p>
                <p><strong>Completion:</strong> 100%</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <>
            <div className="ai-status">
              <h2 className="ai-status-title">AI Service Status</h2>
              <div className="ai-providers">
                <div className={`ai-provider ${aiStatus?.claude ? 'active' : 'inactive'}`}>
                  <div className="provider-name">Claude Sonnet 3.5</div>
                  <div className={`provider-status ${aiStatus?.claude ? 'status-active' : 'status-inactive'}`}>
                    {aiStatus?.claude ? 'Connected' : 'Not Available'}
                  </div>
                </div>
                <div className={`ai-provider ${aiStatus?.gemini ? 'active' : 'inactive'}`}>
                  <div className="provider-name">Google Gemini</div>
                  <div className={`provider-status ${aiStatus?.gemini ? 'status-active' : 'status-inactive'}`}>
                    {aiStatus?.gemini ? 'Connected' : 'Not Available'}
                  </div>
                </div>
                <div className={`ai-provider ${aiStatus?.openai ? 'active' : 'inactive'}`}>
                  <div className="provider-name">OpenAI GPT-4</div>
                  <div className={`provider-status ${aiStatus?.openai ? 'status-active' : 'status-inactive'}`}>
                    {aiStatus?.openai ? 'Connected' : 'Not Available'}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Primary Provider:</strong> {aiStatus?.preferredProvider || 'Claude'} | 
                <strong> Fallback Enabled:</strong> {aiStatus?.fallbackEnabled ? 'Yes' : 'No'}
              </div>
            </div>

            <div className="ai-demo">
              <h2 className="ai-demo-title">Quick AI Demo</h2>
              <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
                Try asking: "What are the key safety considerations for high-rise construction?"
              </p>
              
              <div className="ai-demo-form">
                <input
                  type="text"
                  className="ai-demo-input"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ask me anything about construction management..."
                  onKeyPress={(e) => e.key === 'Enter' && handleAiQuery()}
                />
                <button 
                  className="btn-primary" 
                  onClick={handleAiQuery}
                  disabled={aiLoading || !aiPrompt.trim()}
                  style={{ width: 'auto', minWidth: '120px' }}
                >
                  {aiLoading ? (
                    <>
                      <span className="loading-spinner"></span>
                      <span style={{ marginLeft: '8px' }}>Thinking...</span>
                    </>
                  ) : (
                    'Ask AI'
                  )}
                </button>
              </div>

              {aiResponse && (
                <div className="ai-response">
                  <div className="ai-response-meta">
                    <strong>Provider:</strong> {aiResponse.provider} | 
                    <strong> Model:</strong> {aiResponse.model}
                    {aiResponse.usage && (
                      <span> | <strong>Tokens:</strong> {aiResponse.usage.totalTokens}</span>
                    )}
                  </div>
                  <div className="ai-response-content">{aiResponse.content}</div>
                </div>
              )}
            </div>
          </>
        );
    }
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-title">ASAgents</div>
          <div className="sidebar-subtitle">Construction Management</div>
        </div>
        
        <nav>
          <ul className="sidebar-nav">
            {navigationItems.map((item) => (
              <li key={item.id} className="sidebar-nav-item">
                <a
                  href="#"
                  className={`sidebar-nav-link ${activeView === item.id ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveView(item.id);
                  }}
                >
                  <span style={{ marginRight: '8px' }}>{item.icon}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="main-content">
        <div className="header">
          <div className="welcome-text">
            Welcome back, {user.name}
          </div>
          <div className="user-info">
            <span>{user.email}</span>
            <button className="btn-secondary" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};