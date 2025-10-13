'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface WebSocketContextType {
  socket: WebSocket | null;
  isConnected: boolean;
  sendMessage: (message: any) => void;
  subscribe: (event: string, callback: (data: any) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [subscribers] = useState<Map<string, Set<(data: any) => void>>>(new Map());

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:54112/ws');

    ws.onopen = () => {
      setIsConnected(true);
      setSocket(ws);
    };

    ws.onclose = () => {
      setIsConnected(false);
      setSocket(null);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const eventSubscribers = subscribers.get(message.type);
        if (eventSubscribers) {
          eventSubscribers.forEach(callback => callback(message.data));
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = (message: any) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
    }
  };

  const subscribe = (event: string, callback: (data: any) => void) => {
    if (!subscribers.has(event)) {
      subscribers.set(event, new Set());
    }
    subscribers.get(event)!.add(callback);

    return () => {
      const eventSubscribers = subscribers.get(event);
      if (eventSubscribers) {
        eventSubscribers.delete(callback);
        if (eventSubscribers.size === 0) {
          subscribers.delete(event);
        }
      }
    };
  };

  return (
    <WebSocketContext.Provider value={{
      socket,
      isConnected,
      sendMessage,
      subscribe,
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}