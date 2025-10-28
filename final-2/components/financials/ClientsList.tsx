import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { api } from '../../services/mockApi';
import type { Client, User } from '../../types';
import ClientModal from './ClientModal';

interface Props {
  user: User;
  addToast: (m: string, t: 'success' | 'error') => void;
}

export const ClientsList: React.FC<Props> = ({ user, addToast }) => {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [editing, setEditing] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    const controller = new AbortController();
    abortControllerRef.current?.abort();
    abortControllerRef.current = controller;
    setLoading(true);
    try {
      if (!user.companyId) return;
      const cli = await api.getClientsByCompany(user.companyId, { signal: controller.signal });
      if (controller.signal.aborted) return;
      setClients(cli);
    } catch {
      if (controller.signal.aborted) return;
      addToast('Failed to load clients', 'error');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [user.companyId, addToast]);

  useEffect(() => {
    fetchData();
    return () => abortControllerRef.current?.abort();
  }, [fetchData]);

  const openAdd = () => { setEditing(null); setIsModalOpen(true); };
  const openEdit = (c: Client) => { setEditing(c); setIsModalOpen(true); };

  return (
    <Card className="p-4">
      {isModalOpen && (
        <ClientModal
          clientToEdit={editing}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchData}
          user={user}
          addToast={addToast}
        />
      )}

      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Clients</h3>
        <Button type="button" onClick={openAdd}>Add Client</Button>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Phone</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(c => (
                <tr key={c.id} className="border-b">
                  <td className="py-2 pr-4">{c.name}</td>
                  <td className="py-2 pr-4">{(c as any).contactEmail || c.email || '—'}</td>
                  <td className="py-2 pr-4">{(c as any).contactPhone || c.phone || '—'}</td>
                  <td className="py-2 pr-0 text-right">
                    <Button type="button" variant="secondary" onClick={() => openEdit(c)}>Edit</Button>
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

export default ClientsList;

