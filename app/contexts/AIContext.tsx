'use client';

import React, { createContext, useContext, useState } from 'react';

interface AIContextType {
  aiEnabled: boolean;
  chatHistory: any[];
  sendMessage: (message: string) => Promise<void>;
  clearHistory: () => void;
  isLoading: boolean;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [aiEnabled] = useState(true);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (message: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistory(prev => [...prev, { type: 'user', message }, { type: 'ai', message: data.response }]);
      }
    } catch (error) {
      console.error('AI chat failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setChatHistory([]);
  };

  return (
    <AIContext.Provider value={{
      aiEnabled,
      chatHistory,
      sendMessage,
      clearHistory,
      isLoading,
    }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}