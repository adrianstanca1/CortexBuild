import React, { useState, useEffect } from 'react';
import { MultiAIService } from './services/multiAi';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import './App.css';

// Initialize AI service with environment variables
const aiService = new MultiAIService({
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY,
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY,
  anthropicApiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  preferredProvider: 'claude',
  fallbackEnabled: true
});

// Mock user type
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<any>(null);

  useEffect(() => {
    // Check AI service status on mount
    setAiStatus(aiService.getStatus());
  }, []);

  const handleLogin = (email: string, password: string) => {
    setLoading(true);
    // Mock login - in real app this would call authentication service
    setTimeout(() => {
      setUser({
        id: '1',
        name: 'John Doe',
        email: email,
        role: 'PROJECT_MANAGER'
      });
      setLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} loading={loading} />;
  }

  return (
    <div className="app">
      <Dashboard 
        user={user} 
        onLogout={handleLogout}
        aiService={aiService}
        aiStatus={aiStatus}
      />
    </div>
  );
}

export default App;