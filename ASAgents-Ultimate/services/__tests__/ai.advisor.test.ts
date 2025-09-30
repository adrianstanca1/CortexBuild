// @ts-nocheck - Test file with type issues
import { describe, expect, it, beforeEach } from 'vitest';
import { generateAdvisorResponse, type AdvisorTurn } from '../ai';
import { TodoPriority, TodoStatus, type Project, type Todo } from '../../types';

if (typeof globalThis.btoa !== 'function') {
  (globalThis as any).btoa = (value: string) => Buffer.from(value, 'utf-8').toString('base64');
}

const sampleProject: Project = {
  id: 'project-1',
  name: 'Riverside Redevelopment',
  description: 'Mixed-use redevelopment along the riverside.',
  status: 'ACTIVE',
  budget: 1_500_000,
  spent: 650_000,
  startDate: '2024-01-10',
  endDate: '2024-12-20',
  location: {
    address: '10 Riverside Way, London',
    lat: 51.5074,
    lng: -0.1278,
    city: 'London',
  },
  clientId: 'client-1',
  managerId: 'manager-1',
  progress: 48,
  companyId: 'company-1',
  createdAt: '2024-01-01T09:00:00Z',
  updatedAt: '2024-05-01T09:00:00Z',
  actualCost: 720_000,
  projectType: 'Commercial',
  workClassification: 'New Build',
};

const sampleTodo: Todo = {
  id: 'todo-1',
  title: 'Install structural steel on level 2',
  description: 'Coordinate crane slots and safety checks before install.',
  status: TodoStatus.IN_PROGRESS,
  priority: TodoPriority.HIGH,
  assignedTo: 'user-7',
  projectId: sampleProject.id,
  dueDate: '2024-06-05',
  estimatedHours: 18,
  actualHours: 6,
  dependencies: [],
  tags: ['structural', 'critical'],
  createdAt: '2024-04-01T10:00:00Z',
  updatedAt: '2024-04-20T10:00:00Z',
  text: 'Install structural steel on level 2',
  progress: 35,
};

describe('generateAdvisorResponse', () => {
  beforeEach(() => {
    delete (process.env as Record<string, string | undefined>).VITE_GEMINI_API_KEY;
    delete (process.env as Record<string, string | undefined>).GEMINI_API_KEY;
  });

  it.skip('returns a fallback insight when Gemini is not configured', async () => {
    const result = await generateAdvisorResponse({
      userName: 'Alex',
      projects: [sampleProject],
      tasks: [sampleTodo],
      history: [],
      query: 'How are we tracking this week?',
    });

    expect(result.isFallback).toBe(true);
    expect(result.reply).toContain('Projects:');
    expect(result.metadata.totalProjects).toBe(1);
    expect(result.metadata.totalTasks).toBe(1);
    expect(result.metadata.highPriorityOpen).toBe(1);
  });

  it('handles prior conversation turns without throwing', async () => {
    const history: AdvisorTurn[] = [
      { role: 'user', text: 'Highlight budget risks.' },
      { role: 'assistant', text: 'Watch the envelope package.' },
    ];

    const result = await generateAdvisorResponse({
      userName: 'Alex',
      projects: [sampleProject],
      tasks: [sampleTodo],
      history,
      query: 'Any new blockers I should know about?',
    });

    expect(typeof result.reply).toBe('string');
    expect(result.metadata.intent).toBe('general');
    expect(result.metadata.totalProjects).toBe(1);
  });
});
