import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { api } from '../../services/mockApi';
import type { Expense, Project, User } from '../../types';
import { formatCurrency } from '../../utils/finance';
import { ExpenseModal } from '../ExpenseModal';

interface Props {
  user: User;
  addToast: (m: string, t: 'success' | 'error') => void;
}

export const ExpensesList: React.FC<Props> = ({ user, addToast }) => {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    const controller = new AbortController();
    abortControllerRef.current?.abort();
    abortControllerRef.current = controller;
    setLoading(true);
    try {
      if (!user.companyId) return;
      const [exp, proj] = await Promise.all([
        api.getExpensesByCompany(user.companyId, { signal: controller.signal }),
        api.getProjectsByCompany(user.companyId, { signal: controller.signal }),
      ]);
      if (controller.signal.aborted) return;
      setExpenses(exp);
      setProjects(proj);
    } catch {
      if (controller.signal.aborted) return;
      addToast('Failed to load expenses', 'error');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [user.companyId, addToast]);

  useEffect(() => {
    fetchData();
    return () => abortControllerRef.current?.abort();
  }, [fetchData]);

  const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p.name])), [projects]);

  const openAdd = () => { setEditing(null); setIsModalOpen(true); };
  const openEdit = (e: Expense) => { setEditing(e); setIsModalOpen(true); };

  return (
    <Card className="p-4">
      {isModalOpen && (
        <ExpenseModal
          expenseToEdit={editing}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchData}
          user={user}
          projects={projects}
          addToast={addToast}
        />
      )}

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Expenses</h3>
        <Button type="button" onClick={openAdd}>Add Expense</Button>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Project</th>
                <th className="py-2 pr-4">Description</th>
                <th className="py-2 pr-4 text-right">Amount</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(e => (
                <tr key={e.id} className="border-b">
                  <td className="py-2 pr-4">{new Date(e.date).toLocaleDateString()}</td>
                  <td className="py-2 pr-4">{projectMap.get(e.projectId) || '—'}</td>
                  <td className="py-2 pr-4">{e.description}</td>
                  <td className="py-2 pr-4 text-right">{formatCurrency(e.amount)}</td>
                  <td className="py-2 pr-4">{e.status}</td>
                  <td className="py-2 pr-0 text-right">
                    <Button type="button" variant="secondary" onClick={() => openEdit(e)}>Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default ExpensesList;

