import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { api } from '../../services/mockApi';
import { Client, User } from '../../types';

interface ClientModalProps {
  clientToEdit?: Client | null;
  onClose: () => void;
  onSuccess: () => void;
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
}

const ClientModal: React.FC<ClientModalProps> = ({ clientToEdit, onClose, onSuccess, user, addToast }) => {
  const [name, setName] = useState(clientToEdit?.name || '');
  const [email, setEmail] = useState(clientToEdit?.contactEmail || '');
  const [phone, setPhone] = useState(clientToEdit?.contactPhone || '');
  const [address, setAddress] = useState(clientToEdit?.billingAddress || '');
  const [terms, setTerms] = useState(clientToEdit?.paymentTerms || 'Net 30');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const clientData = { name, contactEmail: email, contactPhone: phone, billingAddress: address, paymentTerms: terms };
      if (clientToEdit) {
        await api.updateClient(clientToEdit.id, clientData, user.id);
        addToast('Client updated.', 'success');
      } else {
        await api.createClient(clientData, user.id);
        addToast('Client added.', 'success');
      }
      onSuccess();
      onClose();
    } catch (error) {
      addToast('Failed to save client.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-lg" onClick={event => event.stopPropagation()}>
        <h3 className="text-lg font-bold mb-4">{clientToEdit ? 'Edit Client' : 'Add New Client'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={event => setName(event.target.value)}
            placeholder="Client Name"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="Contact Email"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="tel"
            value={phone}
            onChange={event => setPhone(event.target.value)}
            placeholder="Contact Phone"
            className="w-full p-2 border rounded"
            required
          />
          <textarea
            value={address}
            onChange={event => setAddress(event.target.value)}
            placeholder="Billing Address"
            className="w-full p-2 border rounded"
            rows={3}
            required
          />
          <input
            type="text"
            value={terms}
            onChange={event => setTerms(event.target.value)}
            placeholder="Payment Terms (e.g., Net 30)"
            className="w-full p-2 border rounded"
            required
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Save Client
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ClientModal;
