import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

type Snapshot = {
  projects: { status: string; count: number; budget: number }[];
  rfis: { status: string; count: number }[];
};

export const DashboardPage: React.FC = () => {
  const { data } = useQuery({
    queryKey: ['dashboard.snapshot'],
    queryFn: async () => {
      const res = await apiClient.get('/insights/portfolio');
      return res.data.snapshot as Snapshot;
    }
  });

  const snapshotKey = useMemo(() => (data ? JSON.stringify(data) : null), [data]);

  const { data: budgetInsight } = useQuery({
    queryKey: ['copilot', 'budget', snapshotKey],
    enabled: Boolean(snapshotKey),
    staleTime: 60_000,
    queryFn: async () => {
      const res = await apiClient.post('/assistant/message', {
        message: 'Give a concise summary (max 2 sentences) of budget variance risk for executives.',
        context: { snapshot: data }
      });
      return res.data.response as string;
    }
  });

  const { data: rfiInsight } = useQuery({
    queryKey: ['copilot', 'rfis', snapshotKey],
    enabled: Boolean(snapshotKey),
    staleTime: 60_000,
    queryFn: async () => {
      const res = await apiClient.post('/assistant/message', {
        message: 'Summarize RFI risk and urgency for project leadership in <=2 sentences.',
        context: { snapshot: data }
      });
      return res.data.response as string;
    }
  });

  const totalBudget = data?.projects.reduce((sum, project) => sum + project.budget, 0) ?? 0;
  const openRFIs = data?.rfis.find((item) => item.status === 'open')?.count ?? 0;

  return (
    <div>
      <h1>Portfolio overview</h1>
      <div className="cards">
        <article>
          <h2>Managed budget</h2>
          <p>${totalBudget.toLocaleString()}</p>
        </article>
        <article>
          <h2>Active projects</h2>
          <p>{data?.projects.find((item) => item.status === 'active')?.count ?? 0}</p>
        </article>
        <article>
          <h2>Pipeline</h2>
          <p>{data?.projects.find((item) => item.status === 'planning')?.count ?? 0}</p>
        </article>
        <article>
          <h2>Open RFIs</h2>
          <p>{openRFIs}</p>
        </article>
      </div>
      <div className="insights-grid">
        <article>
          <h2>AI • Budget variance</h2>
          <p>{budgetInsight ?? 'Generating…'}</p>
        </article>
        <article>
          <h2>AI • RFI risk</h2>
          <p>{rfiInsight ?? 'Generating…'}</p>
        </article>
      </div>
    </div>
  );
};
