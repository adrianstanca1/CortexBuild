
import React, { useState } from 'react';
import { User, Project, Expense, ExpenseCategory } from '../types';
import { api } from '../services/mockApi';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface ExpenseModalProps {
    expenseToEdit: Expense | null;
    onClose: () => void;
    onSuccess: () => void;
    user: User;
    projects: Project[];
    addToast: (m: string, t: 'success' | 'error') => void;
}

const CUSTOM_CATEGORY_VALUE = '__custom__';

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ expenseToEdit, onClose, onSuccess, user, projects, addToast }) => {
    const isAddMode = !expenseToEdit;

    const getInitialCategoryState = () => {
        if (isAddMode) {
            return { category: ExpenseCategory.MATERIALS, customCategory: '' };
        }
        const isStandard = Object.values(ExpenseCategory).includes(expenseToEdit.category as ExpenseCategory);
        if (isStandard) {
            return { category: expenseToEdit.category, customCategory: '' };
        }
        return { category: CUSTOM_CATEGORY_VALUE, customCategory: expenseToEdit.category };
    };
    
    const initialState = getInitialCategoryState();

    const [projectId, setProjectId] = useState(expenseToEdit?.projectId.toString() || projects[0]?.id.toString() || '');
    const [amount, setAmount] = useState<number | ''>(expenseToEdit?.amount || '');
    const [description, setDescription] = useState(expenseToEdit?.description || '');
    const [category, setCategory] = useState(initialState.category);
    const [customCategory, setCustomCategory] = useState(initialState.customCategory);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const finalCategory = category === CUSTOM_CATEGORY_VALUE ? customCategory : category;

        if (!projectId || amount === '' || !description.trim() || !finalCategory.trim()) {
            addToast("Please fill all required fields.", "error");
            return;
        }

        setIsSaving(true);
        try {
            const expenseData = {
                projectId: projectId,
                amount: Number(amount),
                currency: 'GBP',
                description,
                category: finalCategory as ExpenseCategory,
            };

            if (expenseToEdit) {
                await api.updateExpense(expenseToEdit.id, expenseData, user.id);
                addToast("Expense updated and resubmitted for approval.", "success");
            } else {
                await api.submitExpense(expenseData, user.id);
                addToast("Expense submitted for approval.", "success");
            }
            onSuccess();
            onClose();
        } catch (err) {
            addToast(err instanceof Error ? err.message : "Failed to save expense.", "error");
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">{expenseToEdit ? 'Edit' : 'Submit'} Expense</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Project</label>
                        <select value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full p-2 border rounded bg-white" required>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Amount (£)</label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-2 border rounded" placeholder="e.g. 150.00" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-2 border rounded" placeholder="e.g. Lunch with client, safety vests..." required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Category</label>
                        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border rounded bg-white" required>
                            {Object.values(ExpenseCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            <option value={CUSTOM_CATEGORY_VALUE}>Other (Custom)...</option>
                        </select>
                    </div>
                    {category === CUSTOM_CATEGORY_VALUE && (
                        <div>
                             <label className="block text-sm font-medium">Custom Category Name</label>
                             <input type="text" value={customCategory} onChange={e => setCustomCategory(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. Permits, Software" required />
                        </div>
                    )}
                    <div className="flex justify-end gap-2 pt-2 border-t">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" isLoading={isSaving}>{expenseToEdit ? 'Save Changes' : 'Submit'}</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};
