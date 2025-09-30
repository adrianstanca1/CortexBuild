import React, { useState, useEffect, useRef, useCallback } from 'react';
// FIX: Changed Todo to Task and imported correct enums
import { User, Project, Task as Todo, TodoPriority, TodoStatus } from '../../types';
import { api } from '../../services/mockApi';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Tag } from '../ui/Tag';
import {
  generateAdvisorResponse,
  type AdvisorPromptResult,
  type AdvisorTurn,
} from '../../services/ai';

interface AIAdvisorProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
  onBack: () => void;
}

type ChatMessage = {
  role: 'user' | 'assistant';
  text: string;
};

const mapToAdvisorTurns = (messages: ChatMessage[]): AdvisorTurn[] =>
  messages.map(message => ({ role: message.role, text: message.text }));

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ user, addToast, onBack }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const historyRef = useRef<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [advisorMode, setAdvisorMode] = useState<'live' | 'fallback' | null>(null);
  const advisorModeRef = useRef<'live' | 'fallback' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [lastModel, setLastModel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(() => {
    if (!chatContainerRef.current) {
      return;
    }
    chatContainerRef.current.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [history, isLoading]);

  const handleAdvisorResult = useCallback(
    (result: AdvisorPromptResult, options: { isInitial?: boolean } = {}) => {
      const mode: 'live' | 'fallback' = result.isFallback ? 'fallback' : 'live';
      setAdvisorMode(mode);
      setLastModel(result.model ?? null);

      if (mode === 'fallback') {
        setStatusMessage('Offline insight mode – configure a Gemini API key to enable live answers.');
        if (advisorModeRef.current !== 'fallback') {
          addToast('Gemini API key missing or unreachable. Showing offline summary instead.', 'error');
        }
      } else {
        const descriptor = result.model ? `Powered by ${result.model}.` : 'Connected to Gemini.';
        setStatusMessage(`${descriptor} Responses use live AI-generated insights.`);
        if (advisorModeRef.current !== 'live' && !options.isInitial) {
          addToast('Gemini connection restored.', 'success');
        }
      }

      advisorModeRef.current = mode;
    },
    [addToast],
  );

  const initialiseAdvisor = useCallback(
    async (signal: AbortSignal) => {
      setProjects([]);
      setTodos([]);
      setHistory([]);
      historyRef.current = [];
      setAdvisorMode(null);
      advisorModeRef.current = null;
      setStatusMessage(null);
      setLastModel(null);

      if (!user.companyId) {
        setError('You need an active company to use the AI advisor.');
        setIsBootstrapping(false);
        return;
      }

      setIsBootstrapping(true);
      setError(null);

      try {
        const projectData = await api.getProjectsByCompany(user.companyId, { signal });
        if (signal.aborted) {
          return;
        }

        const projectIds = projectData
          .map(project => project.id)
          .filter((id): id is string => Boolean(id));
        const todoData = projectIds.length
          ? await api.getTodosByProjectIds(projectIds, { signal })
          : [];

        if (signal.aborted) {
          return;
        }

        setProjects(projectData);
        setTodos(todoData);

        const intro = await generateAdvisorResponse({
          userName: user.firstName,
          projects: projectData,
          tasks: todoData,
          history: [],
          query: 'Introduce yourself as Ash and offer proactive help based on this portfolio snapshot.',
          intent: 'intro',
        });

        if (signal.aborted) {
          return;
        }

        if (intro.reply) {
          const initialHistory: ChatMessage[] = [{ role: 'assistant', text: intro.reply }];
          historyRef.current = initialHistory;
          setHistory(initialHistory);
        }

        handleAdvisorResult(intro, { isInitial: true });
      } catch (cause) {
        if (signal.aborted) {
          return;
        }
        if (cause instanceof DOMException && cause.name === 'AbortError') {
          return;
        }
        console.error('[AIAdvisor] Failed to initialise AI advisor', cause);
        setError('Unable to prepare the AI advisor. Please try again in a moment.');
      } finally {
        if (!signal.aborted) {
          setIsBootstrapping(false);
        }
      }
    },
    [user.companyId, user.firstName, handleAdvisorResult],
  );

  useEffect(() => {
    const controller = new AbortController();
    void initialiseAdvisor(controller.signal);
    return () => controller.abort();
  }, [initialiseAdvisor]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || isBootstrapping || Boolean(error)) {
      return;
    }

    const userMessage: ChatMessage = { role: 'user', text: trimmed };
    const nextHistory = [...historyRef.current, userMessage];

    setInput('');
    setHistory(nextHistory);
    historyRef.current = nextHistory;
    setIsLoading(true);

    try {
      const result = await generateAdvisorResponse({
        userName: user.firstName,
        projects,
        tasks: todos,
        history: mapToAdvisorTurns(nextHistory),
        query: trimmed,
      });

      const assistantMessage: ChatMessage = { role: 'assistant', text: result.reply };
      const finalHistory = [...nextHistory, assistantMessage];
      historyRef.current = finalHistory;
      setHistory(finalHistory);

      handleAdvisorResult(result);
    } catch (cause) {
      console.error('[AIAdvisor] Failed to generate advisor response', cause);
      addToast('Failed to get response from AI.', 'error');
      const fallbackHistory = [
        ...historyRef.current,
        { role: 'assistant', text: 'Sorry, I encountered an error. Please try again shortly.' },
      ];
      historyRef.current = fallbackHistory;
      setHistory(fallbackHistory);
    } finally {
      setIsLoading(false);
    }
  };

  const statusTag =
    advisorMode === 'live'
      ? {
        label: lastModel ? `Live • ${lastModel}` : 'Live • Gemini',
        color: 'green' as const,
      }
      : advisorMode === 'fallback'
        ? {
          label: 'Offline insights',
          color: 'yellow' as const,
        }
        : null;

  return (
    <Card className="flex h-[80vh] flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={onBack} className="mt-1">↩ Back</Button>
          <div>
            <h3 className="text-xl font-semibold text-foreground">AI Advisor</h3>
            <p className="text-sm text-muted-foreground">
              Ask Ash for portfolio, risk, and financial guidance powered by your live workspace data.
            </p>
          </div>
        </div>
        {statusTag ? (
          <Tag label={statusTag.label} color={statusTag.color} statusIndicator={statusTag.color} />
        ) : null}
      </div>

      {statusMessage ? (
        <p className="text-xs text-muted-foreground">{statusMessage}</p>
      ) : null}

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex-1 overflow-hidden">
        <div
          ref={chatContainerRef}
          className="h-full overflow-y-auto rounded-lg border border-border/60 bg-muted/30 p-4"
        >
          {isBootstrapping ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Preparing your workspace context…
            </div>
          ) : history.length ? (
            <div className="space-y-4">
              {history.map((message, index) => (
                <div
                  key={`${index}-${message.role}`}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                >
                  {message.role === 'assistant' ? (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold text-white">
                      A
                    </div>
                  ) : null}
                  <div
                    className={`max-w-lg rounded-lg px-4 py-2 text-sm shadow-sm ${message.role === 'assistant'
                      ? 'border border-border/50 bg-card text-foreground'
                      : 'bg-primary text-primary-foreground'
                      }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {isLoading ? (
                <div className="flex gap-3 text-sm text-muted-foreground">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold text-white">
                    A
                  </div>
                  <div className="rounded-lg border border-border/50 bg-card px-4 py-2">Thinking…</div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Ask about risks, cash flow, or scheduling to begin the conversation.
            </div>
          )}
        </div>
      </div>

      <div className="flex items-end gap-2">
        <input
          value={input}
          onChange={event => setInput(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              event.preventDefault();
              void handleSend();
            }
          }}
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Ask about project risk, schedule pressure, or financial outlook…"
          disabled={isLoading || isBootstrapping || Boolean(error)}
        />
        <Button
          type="button"
          onClick={handleSend}
          isLoading={isLoading}
          disabled={isLoading || isBootstrapping || Boolean(error)}
        >
          Send
        </Button>
      </div>
    </Card>
  );
};
