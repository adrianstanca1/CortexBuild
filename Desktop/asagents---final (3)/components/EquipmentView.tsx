import React, { useState, useEffect, useCallback } from 'react';
import { User, Equipment, Project, EquipmentStatus, Permission } from '../types';
import { api } from '../services/apiService';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { EquipmentStatusBadge } from './ui/StatusBadge';
import { hasPermission } from '../services/auth';

interface EquipmentViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
}

export const EquipmentView: React.FC<EquipmentViewProps> = ({ user, addToast }) => {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [assigningEquipmentId, setAssigningEquipmentId] = useState<number | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');

    const canManage = hasPermission(user, Permission.MANAGE_EQUIPMENT);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (!user.companyId) return;
            const [equipData, projData] = await Promise.all([
                api.getEquipmentByCompany(user.companyId),
                api.getProjectsByCompany(user.companyId)
            ]);
            setEquipment(equipData);
            setProjects(projData);
        } catch (error) {
            addToast('Failed to load equipment data.', 'error');
        } finally {
            setLoading(false);
        }
    }, [user.companyId, addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAssign = async (equipmentId: number) => {
        if (!selectedProjectId) {
            addToast('Please select a project.', 'error');
            return;
        }
        try {
            await api.assignEquipmentToProject(equipmentId, parseInt(selectedProjectId), user.id);
            addToast('Equipment assigned successfully!', 'success');
            setAssigningEquipmentId(null);
            setSelectedProjectId('');
            fetchData();
        } catch (error) {
            addToast('Failed to assign equipment.', 'error');
        }
    };

    const handleUnassign = async (equipmentId: number) => {
        try {
            await api.unassignEquipmentFromProject(equipmentId, user.id);
            addToast('Equipment unassigned successfully!', 'success');
            fetchData();
        } catch (error) {
            addToast('Failed to unassign equipment.', 'error');
        }
    };
    
    const handleUpdateStatus = async (equipmentId: number, status: EquipmentStatus) => {
        try {
            await api.updateEquipmentStatus(equipmentId, status, user.id);
            addToast('Equipment status updated successfully!', 'success');
            fetchData();
        } catch (error) {
            addToast('Failed to update equipment status.', 'error');
        }
    };

    if (loading) {
        return <Card><p>Loading equipment...</p></Card>;
    }

    return (
        <Card>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Equipment Management</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Assigned Project</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Details</th>
                            {canManage && <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {equipment.map(item => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm"><EquipmentStatusBadge status={item.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {item.projectId ? projects.find(p => p.id === item.projectId)?.name : 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {item.status === EquipmentStatus.IN_USE && item.lastAssignedDate && (
                                        <span>Assigned on {new Date(item.lastAssignedDate).toLocaleDateString()}</span>
                                    )}
                                    {item.status === EquipmentStatus.MAINTENANCE && (
                                        <div>
                                            {item.maintenanceStartDate && <p>Since: {new Date(item.maintenanceStartDate).toLocaleDateString()}</p>}
                                            {item.estimatedAvailableDate && <p className="font-medium text-slate-600">Available: {new Date(item.estimatedAvailableDate).toLocaleDateString()}</p>}
                                        </div>
                                    )}
                                    {item.status === EquipmentStatus.AVAILABLE && '—'}
                                </td>
                                {canManage && <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {assigningEquipmentId === item.id ? (
                                        <div className="flex items-center justify-end gap-2">
                                            <select 
                                                value={selectedProjectId} 
                                                onChange={e => setSelectedProjectId(e.target.value)} 
                                                className="block w-full pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
                                                onClick={e => e.stopPropagation()}
                                            >
                                                <option value="" disabled>Select project...</option>
                                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                            <Button size="sm" variant="success" onClick={() => handleAssign(item.id)}>Save</Button>
                                            <Button size="sm" variant="ghost" onClick={() => setAssigningEquipmentId(null)}>Cancel</Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-end gap-2">
                                            {item.status === EquipmentStatus.AVAILABLE && (
                                                <>
                                                    <Button size="sm" variant="secondary" onClick={() => { setAssigningEquipmentId(item.id); setSelectedProjectId(''); }}>
                                                        Assign to Project
                                                    </Button>
                                                     <Button size="sm" variant="ghost" onClick={() => handleUpdateStatus(item.id, EquipmentStatus.MAINTENANCE)}>
                                                        Set Maintenance
                                                    </Button>
                                                </>
                                            )}
                                            {item.status === EquipmentStatus.IN_USE && item.projectId && (
                                                <>
                                                    <Button size="sm" variant="danger" onClick={() => handleUnassign(item.id)}>
                                                        Unassign
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => handleUpdateStatus(item.id, EquipmentStatus.MAINTENANCE)}>
                                                        Set Maintenance
                                                    </Button>
                                                </>
                                            )}
                                             {item.status === EquipmentStatus.MAINTENANCE && (
                                                <Button size="sm" variant="success" onClick={() => handleUpdateStatus(item.id, EquipmentStatus.AVAILABLE)}>
                                                    Set Available
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};
