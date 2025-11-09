import React from 'react';
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
    </div>
  );
};
