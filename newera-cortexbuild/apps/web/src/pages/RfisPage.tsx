import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import type { Project, RFI } from '@newera/types';

type RfiForm = {
  projectId: string;
  subject: string;
  question: string;
  dueDate?: string;
};

async function fetchRFIs() {
  const res = await apiClient.get('/rfis');
  return res.data.rfis as RFI[];
}

async function fetchProjects() {
  const res = await apiClient.get('/projects');
  return res.data.projects as Project[];
}

export const RfisPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: rfis } = useQuery({ queryKey: ['rfis'], queryFn: fetchRFIs });
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: fetchProjects });

  const { register, handleSubmit, reset } = useForm<RfiForm>();

  const createMutation = useMutation({
    mutationFn: (input: RfiForm) => apiClient.post('/rfis', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfis'] });
      reset();
    }
  });

  const closeMutation = useMutation({
    mutationFn: (input: { id: string; response: string }) =>
      apiClient.put(`/rfis/${input.id}`, { response: input.response, status: 'closed' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfis'] });
    }
  });

  return (
    <div className="rfis">
      <section>
        <h1>RFIs</h1>
        <table>
          <thead>
            <tr>
              <th>RFI #</th>
              <th>Subject</th>
              <th>Project</th>
              <th>Status</th>
              <th>Due</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rfis?.map((rfi) => (
              <tr key={rfi.id}>
                <td>{rfi.number}</td>
                <td>{rfi.subject}</td>
                <td>{projects?.find((project) => project.id === rfi.projectId)?.name ?? '—'}</td>
                <td>
                  <span className={`badge badge-${rfi.status}`}>{rfi.status}</span>
                </td>
                <td>{rfi.dueDate ? new Date(rfi.dueDate).toLocaleDateString() : '—'}</td>
                <td>
                  {rfi.status !== 'closed' && (
                    <button
                      onClick={() => {
                        const response = window.prompt('Enter response');
                        if (response) {
                          closeMutation.mutate({ id: rfi.id, response });
                        }
                      }}
                    >
                      Close
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section>
        <h2>Submit RFI</h2>
        <form onSubmit={handleSubmit((values) => createMutation.mutate(values))} className="stack">
          <select {...register('projectId', { required: true })}>
            <option value="">Select project</option>
            {projects?.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <input placeholder="Subject" {...register('subject', { required: true })} />
          <textarea placeholder="Question" rows={4} {...register('question', { required: true })} />
          <label>
            Due date
            <input type="date" {...register('dueDate')} />
          </label>
          <button disabled={createMutation.isPending}>{createMutation.isPending ? 'Submitting…' : 'Submit RFI'}</button>
        </form>
      </section>
    </div>
  );
};
