import React, { useState } from 'react';
import { apiClient } from '../../lib/api';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export const CopilotPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! Ask about project health, budget risk, or RFIs.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const res = await apiClient.post('/assistant/message', { message: userMessage.content });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: error?.response?.data?.error ?? 'Copilot unavailable.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="copilot">
      <header>
        <h3>Copilot</h3>
        <p>AI assistant trained for construction ops</p>
      </header>
      <div className="copilot-log">
        {messages.map((message, idx) => (
          <div key={idx} className={`bubble bubble-${message.role}`}>
            <p>{message.content}</p>
          </div>
        ))}
      </div>
      <div className="copilot-input">
        <input
          placeholder="Ask about cash flow, RFIs, etc."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? 'Thinking…' : 'Send'}
        </button>
      </div>
    </div>
  );
};
