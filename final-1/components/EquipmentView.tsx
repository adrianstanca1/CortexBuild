import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { User, Equipment, Project, Permission, EquipmentStatus, ResourceAssignment } from '../types';
import { api } from '../services/mockApi';
import { hasPermission } from '../services/auth';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { EquipmentStatusBadge } from './ui/StatusBadge';

interface EquipmentViewProps {
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
}

const EquipmentModal: React.FC<{
    equipmentToEdit: Equipment | null;
    projects: Project[];
    assignments: ResourceAssignment[];
    user: User;
    onClose: () => void;
    onSuccess: () => void;
    addToast: (m: string, t: 'success' | 'error') => void;
    currentAssignment?: ResourceAssignment;
}> = ({ equipmentToEdit, projects, assignments, user, onClose, onSuccess, addToast, currentAssignment }) => {
    const [name, setName] = useState('');
    // This state holds the *persistent* status ('Available' or 'Maintenance'), which is the value we want to save.
// FIX: Used EquipmentStatus enum for useState initial value.
    const [persistentStatus, setPersistentStatus] = useState<EquipmentStatus>(EquipmentStatus.AVAILABLE);
    const [isSaving, setIsSaving] = useState(false);
    const isCurrentlyInUse = !!currentAssignment;

    // This effect ensures the form is correctly populated or reset when the modal
    // is opened for a different item or for creating a new one.
    useEffect(() => {
        if (equipmentToEdit) {
            setName(equipmentToEdit.name);
            // The form should reflect the underlying, persistent status.
            // A derived 'In Use' status from the schedule should not be the editable value.
            // If the database has a stale 'In Use', we treat it as 'Available'.
// FIX: Used EquipmentStatus enum for comparison and value.
            const underlyingStatus = equipmentToEdit.status === EquipmentStatus.IN_USE ? EquipmentStatus.AVAILABLE : equipmentToEdit.status;
            setPersistentStatus(underlyingStatus);
        } else {
            // Reset for "Add Equipment" mode
            setName('');
// FIX: Used EquipmentStatus enum for state update.
            setPersistentStatus(EquipmentStatus.AVAILABLE);
        }
    }, [equipmentToEdit]);

    const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p.name])), [projects]);

    const assignmentHistory = useMemo(() => {
        if (!equipmentToEdit) return [];
        return assignments
            .filter(a => a.resourceType === 'equipment' && a.resourceId === equipmentToEdit.id)
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }, [assignments, equipmentToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (equipmentToEdit) {
                // When updating, we explicitly save the persistentStatus from the form,
                // ensuring the derived 'In Use' status is never written back.
                await api.updateEquipment(equipmentToEdit.id, {
                    name,
                    status: persistentStatus,
                }, user.id);
                addToast("Equipment updated successfully.", "success");
            } else {
                await api.createEquipment({ name, status: persistentStatus }, user.id);
                addToast("Equipment added successfully.", "success");
            }
            onSuccess();
            onClose();
        } catch(error) {
            addToast(error instanceof Error ? error.message : "Failed to save equipment.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="w-full max-w-xl" onClick={e => e.stopPropagation()}>
                <h3 className="font-bold text-lg mb-4">{equipmentToEdit ? 'Equipment Details' : 'Add Equipment'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Equipment Name" className="w-full p-2 border rounded" required />
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Status</label>
                        {isCurrentlyInUse && (
                            <div className="p-2 mt-1 bg-sky-50 dark:bg-sky-900/50 rounded-md text-sm text-sky-800 dark:text-sky-200">
                                This item is currently <span className="font-semibold">In Use</span> based on the schedule. You can set its underlying status below for when the assignment ends.
                            </div>
                        )}
                        <select value={persistentStatus} onChange={e => setPersistentStatus(e.target.value as EquipmentStatus)} className="w-full p-2 border bg-white rounded mt-2 dark:bg-slate-800 dark:border-slate-600" disabled={isSaving}>
                            <option value={EquipmentStatus.AVAILABLE}>Available</option>
                            <option value={EquipmentStatus.MAINTENANCE}>Maintenance</option>
                        </select>
                    </div>

                    {equipmentToEdit && (
                        <div className="pt-4 border-t dark:border-slate-700">
                            <h4 className="font-semibold text-base mb-2">Assignment History</h4>
                            {assignmentHistory.length > 0 ? (
                                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                                    {assignmentHistory.map(assignment => {
                                        const isCurrent = assignment.id === currentAssignment?.id;
                                        return (
                                            <div key={assignment.id} className={`p-2 rounded-md text-sm ${isCurrent ? 'bg-sky-100 dark:bg-sky-900/50 border border-sky-200 dark:border-sky-700' : 'bg-slate-50 dark:bg-slate-800'}`}>
                                                <div className="flex justify-between items-center">
                                                    <p className="font-medium">{projectMap.get(assignment.projectId) || 'Unknown Project'}</p>
                                                    {isCurrent && <span className="text-xs font-bold text-sky-600 dark:text-sky-300">ACTIVE</span>}
                                                </div>
                                                <p className="text-slate-500 dark:text-slate-400">
                                                    {new Date(assignment.startDate).toLocaleDateString()} - {new Date(assignment.endDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                 <p className="text-sm text-slate-500 p-2">No assignments found. Manage assignments in the Resource Scheduler.</p>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2 border-t dark:border-slate-700">
                        <Button type="button" variant="secondary" onClick={onClose}>Close</Button>
                        <Button type="submit" isLoading={isSaving}>{equipmentToEdit ? 'Save Changes' : 'Save'}</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};


export const EquipmentView: React.FC<EquipmentViewProps> = ({ user, addToast }) => {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [assignments, setAssignments] = useState<ResourceAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const canManage = hasPermission(user, Permission.MANAGE_EQUIPMENT);

    const fetchData = useCallback(async () => {
        const controller = new AbortController();
        abortControllerRef.current?.abort();
        abortControllerRef.current = controller;

        setLoading(true);
        try {
            if (!user.companyId) return;
            const [equipData, projData, assignData] = await Promise.all([
                api.getEquipmentByCompany(user.companyId, { signal: controller.signal }),
                api.getProjectsByCompany(user.companyId, { signal: controller.signal }),
                api.getResourceAssignments(user.companyId, { signal: controller.signal }),
            ]);
            if (controller.signal.aborted) return;
            setEquipment(equipData);
            if (controller.signal.aborted) return;
            setProjects(projData);
            if (controller.signal.aborted) return;
            setAssignments(assignData);
        } catch (error) {
            if (controller.signal.aborted) return;
            addToast("Failed to load equipment data.", "error");
        } finally {
            if (controller.signal.aborted) return;
            setLoading(false);
        }
    }, [user.companyId, addToast]);

    useEffect(() => {
        fetchData();
        return () => {
            abortControllerRef.current?.abort();
        };
    }, [fetchData]);
    
    const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p.name])), [projects]);

    const currentAssignments = useMemo(() => {
// FIX: Changed Map key from number to string to match resourceId type.
        const map = new Map<string, ResourceAssignment>();
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        assignments.forEach(a => {
            if (a.resourceType === 'equipment') {
                const startDate = new Date(a.startDate);
                const endDate = new Date(a.endDate);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(0, 0, 0, 0);
                if (startDate <= today && today <= endDate) {
                    map.set(a.resourceId, a);
                }
            }
        });
        return map;
    }, [assignments]);

    const getDerivedStatus = (item: Equipment): EquipmentStatus => {
        // If there's an active assignment for today, the status is always 'In Use'.
        if (currentAssignments.has(item.id)) {
// FIX: Used EquipmentStatus enum member.
            return EquipmentStatus.IN_USE;
        }
        // Otherwise, it's the status set in the database ('Available' or 'Maintenance').
        // We safeguard against a stale 'In Use' status in the DB.
// FIX: Used EquipmentStatus enum for comparison and value.
        return item.status === EquipmentStatus.IN_USE ? EquipmentStatus.AVAILABLE : item.status;
    };
    
    const openModal = (item: Equipment | null = null) => {
        setEditingEquipment(item);
        setIsModalOpen(true);
    };

    if (loading) return <Card><p>Loading equipment...</p></Card>;

    return (
        <div className="space-y-6">
            {isModalOpen && (
                <EquipmentModal
                    equipmentToEdit={editingEquipment}
                    projects={projects}
                    assignments={assignments}
                    user={user}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchData}
                    addToast={addToast}
                    currentAssignment={editingEquipment ? currentAssignments.get(editingEquipment.id) : undefined}
                />
            )}
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Equipment</h2>
                {canManage && <Button onClick={() => openModal()}>Add Equipment</Button>}
            </div>
            <Card>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Current Project</th>
                                {canManage && <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
                            {equipment.map(item => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 font-medium">{item.name}</td>
                                    <td className="px-6 py-4"><EquipmentStatusBadge status={getDerivedStatus(item)} /></td>
                                    <td className="px-6 py-4">
                                        {currentAssignments.has(item.id)
                                            ? projectMap.get(currentAssignments.get(item.id)!.projectId)
                                            : 'Unassigned'}
                                    </td>
                                    {canManage && (
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="sm" onClick={() => openModal(item)}>Details</Button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};