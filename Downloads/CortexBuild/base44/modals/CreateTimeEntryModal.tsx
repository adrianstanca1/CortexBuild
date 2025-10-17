import React, { useState, useEffect } from 'react';

interface CreateTimeEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateTimeEntryModal: React.FC<CreateTimeEntryModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        project_id: '',
        date: new Date().toISOString().split('T')[0],
        hours: '',
        description: '',
        billable: true,
        hourly_rate: ''
    });
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchProjects();
        }
    }, [isOpen]);

    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/projects?limit=100');
            const data = await response.json();
            if (data.success) {
                setProjects(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch projects:', err);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const company_id = user?.company_id || 'company-1';
            const user_id = user?.id || 'user-1';

            const response = await fetch('/api/time-entries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    company_id,
                    user_id,
                    project_id: parseInt(formData.project_id),
                    hours: parseFloat(formData.hours),
                    hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null
                })
            });

            const data = await response.json();

            if (data.success) {
                onSuccess();
                onClose();
                setFormData({ project_id: '', date: new Date().toISOString().split('T')[0], hours: '', description: '', billable: true, hourly_rate: '' });
            } else {
                setError(data.error || 'Failed to create time entry');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create time entry');
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = formData.hours && formData.hourly_rate 
        ? (parseFloat(formData.hours) * parseFloat(formData.hourly_rate)).toFixed(2)
        : '0.00';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Log Time Entry</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project <span className="text-red-500">*</span></label>
                        <select required value={formData.project_id} onChange={(e) => setFormData({ ...formData, project_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            <option value="">Select project</option>
                            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                            <input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hours <span className="text-red-500">*</span></label>
                            <input type="number" required step="0.25" min="0.25" max="24" value={formData.hours} onChange={(e) => setFormData({ ...formData, hours: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="8.0" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                        <textarea required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="What did you work on?" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" checked={formData.billable} onChange={(e) => setFormData({ ...formData, billable: e.target.checked })} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                <span className="text-sm font-medium text-gray-700">Billable</span>
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                            <input type="number" step="0.01" min="0" value={formData.hourly_rate} onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="75.00" />
                        </div>
                    </div>

                    {formData.hours && formData.hourly_rate && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-blue-900">Total Amount:</span>
                                <span className="text-lg font-bold text-blue-900">${totalAmount}</span>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{loading ? 'Logging...' : 'Log Time'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

