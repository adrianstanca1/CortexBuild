import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import type { Project } from '@newera/types';

type ProjectForm = {
  name: string;
  code: string;
  budget: number;
};

async function fetchProjects() {
  const res = await apiClient.get('/projects');
  return res.data.projects as Project[];
}

export const ProjectsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['projects'], queryFn: fetchProjects });

  const { register, handleSubmit, reset } = useForm<ProjectForm>();

  const mutation = useMutation({
    mutationFn: (input: ProjectForm) => apiClient.post('/projects', { ...input, status: 'planning' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      reset();
    }
  });

  return (
    <div className="projects">
      <section>
        <h1>Projects</h1>
        {isLoading ? (
          <p>Loading…</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Status</th>
                <th>Budget</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((project) => (
                <tr key={project.id}>
                  <td>{project.name}</td>
                  <td>{project.code}</td>
                  <td>{project.status}</td>
                  <td>{project.budget.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <section>
        <h2>New project</h2>
        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="stack">
          <input placeholder="Project name" {...register('name', { required: true })} />
          <input placeholder="Job code" {...register('code', { required: true })} />
          <input placeholder="Budget" type="number" step="0.01" {...register('budget', { required: true, valueAsNumber: true })} />
          <button disabled={mutation.isPending}>{mutation.isPending ? 'Creating…' : 'Create project'}</button>
        </form>
      </section>
    </div>
  );
};
