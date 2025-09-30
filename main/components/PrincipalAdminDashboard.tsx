
import React, { useState, useEffect, useCallback } from 'react';
import { User, Company, SystemHealth } from '../types';
import { api } from '../services/mockApi';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { InviteCompanyModal } from './InviteCompanyModal';

interface PrincipalAdminDashboardProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
}

const KpiCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <Card className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-slate-100 text-slate-600">
            {icon}
        </div>
        <div>
            <h3 className="font-semibold text-slate-600">{title}</h3>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
        </div>
    </Card>
);

const SystemHealthIndicator: React.FC<{ health: SystemHealth }> = ({ health }) => {
    const statusStyles = {
        OK: {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
            text: 'text-green-700',
            bg: 'bg-green-50',
        },
        DEGRADED: {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>,
            text: 'text-yellow-700',
            bg: 'bg-yellow-50',
        },
        DOWN: {
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>,
            text: 'text-red-700',
            bg: 'bg-red-50',
        }
    };
    const style = statusStyles[health.status];
    return (
        <div className={`p-4 rounded-lg flex items-center gap-4 ${style.bg}`}>
            {style.icon}
            <div>
                <p className={`font-semibold ${style.text}`}>System {health.status}</p>
                <p className={`text-sm ${style.text}`}>{health.message}</p>
            </div>
        </div>
    );
};

export const PrincipalAdminDashboard: React.FC<PrincipalAdminDashboardProps> = ({ user, addToast }) => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [systemHealth] = useState<SystemHealth>({ status: 'OK', message: 'All systems are operational.' });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [companiesData, allUsers] = await Promise.all([
                api.getCompanies(),
                api.getUsersByCompany() // Fetch all users in the system
            ]);
            
            const tenantCompanies = companiesData.filter(c => c.id !== 0);
            setCompanies(tenantCompanies);
            setTotalUsers(allUsers.filter(u => u.companyId !== 0).length);

        } catch (error) {
            addToast("Failed to load platform data.", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInvite = async (companyName: string, adminEmail: string) => {
        addToast(`Invitation sent to ${adminEmail} for ${companyName}.`, 'success');
        // In a real app, this would trigger a backend process. Here we can just refresh data.
        fetchData();
    };

    const totalStorage = companies.reduce((acc, c) => acc + c.storageUsageGB, 0);

    if (loading) {
        return <Card><p>Loading Platform Dashboard...</p></Card>;
    }

    return (
        <div className="space-y-6">
            {isInviteModalOpen && <InviteCompanyModal onClose={() => setIsInviteModalOpen(false)} onInvite={handleInvite} />}
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800">Platform Administration</h2>
                <Button onClick={() => setIsInviteModalOpen(true)}>Invite New Company</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title="Total Companies" value={companies.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>} />
                <KpiCard title="Total Users" value={totalUsers} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                <KpiCard title="Total Storage" value={`${totalStorage.toFixed(1)} GB`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>} />
                <Card><SystemHealthIndicator health={systemHealth} /></Card>
            </div>
            
            <Card>
                <h3 className="font-semibold text-lg mb-4">Tenant Companies</h3>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Company Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Plan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Storage</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {companies.map(company => (
                                <tr key={company.id}>
                                    <td className="px-6 py-4 font-medium">{company.name}</td>
                                    <td className="px-6 py-4">{company.status}</td>
                                    <td className="px-6 py-4">{company.subscriptionPlan}</td>
                                    <td className="px-6 py-4">{company.storageUsageGB.toFixed(1)} GB</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};