import React, { useState } from 'react';
import { User, Project, Todo, Document, SafetyIncident, Expense } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { api } from '../services/mockApi';
import { searchKnowledgeBase } from '../services/ai';

interface AISearchModalProps {
  user: User;
  currentProject: Project | null;
  onClose: () => void;
  addToast: (message: string, type: 'success' | 'error') => void;
}

export const AISearchModal: React.FC<AISearchModalProps> = ({ user, currentProject, onClose, addToast }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string | null>(null);
  const [resultMeta, setResultMeta] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      addToast('Please enter a search query.', 'error');
      return;
    }
    setIsLoading(true);
    setResults(null);
    setResultMeta(null);
    // Mock AI search
    try {
      let tasks: Todo[] = [];
      let documents: Document[] = [];
      let incidents: SafetyIncident[] = [];
      let expenses: Expense[] = [];
      let focusProject: Project | null | undefined = currentProject ?? null;

      if (user.companyId) {
        const [projects, incidentData, expenseData, documentData] = await Promise.all([
          currentProject ? Promise.resolve<Project[]>([]) : api.getProjectsByCompany(user.companyId),
          api.getSafetyIncidentsByCompany(user.companyId),
          api.getExpensesByCompany(user.companyId),
          currentProject ? api.getDocumentsByProject(currentProject.id) : api.getDocumentsByCompany(user.companyId),
        ]);


        incidents = incidentData;
        expenses = expenseData;
        documents = (documentData as Document[]).slice(0, 20);

        let projectIds: string[] = [];
        if (currentProject) {
          projectIds = [currentProject.id];
        } else {
          const topProjects = projects.slice(0, 5);
          projectIds = topProjects.map(p => p.id);
          if (!focusProject && topProjects.length === 1) {
            focusProject = topProjects[0];
          }
        }

        if (projectIds.length > 0) {
          tasks = await api.getTodosByProjectIds(projectIds);
        }
      }

      const aiResult = await searchKnowledgeBase({
        query,
        user,
        project: focusProject ?? currentProject ?? undefined,
        tasks,
        documents,
        incidents,
        expenses,
      });

      setResults(aiResult.text);
      if (aiResult.isFallback) {
        setResultMeta('Generated using offline knowledge search fallback.');
      } else if (aiResult.model) {
        setResultMeta(`Generated with ${aiResult.model}.`);
      } else {
        setResultMeta(null);
      }
    } catch (error) {
      console.error('AI search failed', error);
      addToast('AI search failed. Please try again later.', 'error');
      setResults('Unable to complete the AI search right now. Please try again later.');
      setResultMeta(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center pt-24" onClick={onClose}>
      <Card className="w-full max-w-2xl h-fit max-h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">AI Search</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="e.g., 'Find all safety reports for Downtown Tower' or 'Who knows about HVAC installation?'"
            className="w-full p-2 border rounded-md"
          />
          <Button onClick={handleSearch} isLoading={isLoading}>Search</Button>
        </div>
        <div className="mt-4 flex-grow overflow-y-auto">
          {isLoading && <p>Searching...</p>}
          {results && (
            <div className="p-4 bg-slate-50 rounded-md whitespace-pre-wrap font-mono text-sm">
              {results}
            </div>
          )}
          {resultMeta && (
            <p className="mt-2 text-xs text-muted-foreground">{resultMeta}</p>
          )}
        </div>
      </Card>
    </div>
  );
};
