

import React, { useState, useEffect, useCallback } from 'react';
// FIX: Corrected import paths to be relative.
import { User, Client } from '../types';
import { api } from '../services/mockApi';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface ClientsViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({ user, addToast }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (!user.companyId) return;
            const data = await api.getClientsByCompany(user.companyId);
            setClients(data);
        } catch (error) {
            addToast("Failed to load clients.", "error");
        } finally {
            setLoading(false);
        }
    }, [user.companyId, addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return <Card><p>Loading clients...</p></Card>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-slate-800">Clients</h2>
                <Button variant="primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Client
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map(client => (
                    <Card key={client.id} className="animate-card-enter">
                        <h3 className="text-xl font-semibold text-slate-800 truncate">{client.name}</h3>
                        <p className="text-sm text-slate-500 mb-4">Member since {new Date(client.createdAt).toLocaleDateString()}</p>
                        <div className="space-y-2 text-sm border-t pt-4">
                            <p className="flex items-center gap-2 text-slate-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                {client.contactEmail}
                            </p>
                            <p className="flex items-center gap-2 text-slate-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                {client.contactPhone}
                            </p>
                        </div>
                    </Card>
                ))}
            </div>
             {clients.length === 0 && (
                <Card className="text-center py-12">
                    <h3 className="text-lg font-medium">No clients found.</h3>
                    <p className="text-slate-500 mt-1">Get started by adding your first client.</p>
                </Card>
            )}
        </div>
    );
};