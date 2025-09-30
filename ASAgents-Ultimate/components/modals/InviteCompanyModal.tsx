import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface InviteCompanyModalProps {
    onClose: () => void;
    onInvite: (companyName: string, adminEmail: string) => Promise<void>;
}

export const InviteCompanyModal: React.FC<InviteCompanyModalProps> = ({ onClose, onInvite }) => {
    const [companyName, setCompanyName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [status, setStatus] = useState<'form' | 'success'>('form');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsInviting(true);
        try {
            await onInvite(companyName, adminEmail);
            setStatus('success');
        } finally {
            setIsInviting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="w-full max-w-md" onClick={e => e.stopPropagation()}>
                {status === 'form' ? (
                    <>
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">Invite New Company</h2>
                        <p className="text-sm text-slate-500 mb-6">
                            This will start the provisioning process for a new tenant. An invitation will be sent to the administrator's email to set up their account.
                        </p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                <input
                                    type="text"
                                    id="company-name"
                                    value={companyName}
                                    onChange={e => setCompanyName(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 mb-1">Administrator Email</label>
                                <input
                                    type="email"
                                    id="admin-email"
                                    value={adminEmail}
                                    onChange={e => setAdminEmail(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                                <Button type="submit" isLoading={isInviting}>Send Invitation</Button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Invitation Sent!</h2>
                        <p className="text-slate-600">An email has been sent to <span className="font-semibold">{adminEmail}</span> to set up the account for <span className="font-semibold">{companyName}</span>.</p>
                        <Button onClick={onClose} className="mt-6">Done</Button>
                    </div>
                )}
            </Card>
        </div>
    );
};