import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Expense, ExpenseCategory, Project, User } from '../../types';
import { api } from '../../services/mockApi';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

type ToastKind = 'success' | 'error';

interface ExpenseModalProps {
  expenseToEdit: Expense | null;
  onClose: () => void;
  onSuccess: () => void;
  user: User;
  projects: Project[];
  addToast: (message: string, type: ToastKind) => void;
}

const CUSTOM_CATEGORY_VALUE = '__custom__';

const STANDARD_EXPENSE_CATEGORIES = new Set<string>(Object.values(ExpenseCategory));

const getDefaultProjectId = (projects: Project[]): string => projects[0]?.id ?? '';

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  expenseToEdit,
  onClose,
  onSuccess,
  user,
  projects,
  addToast,
}) => {
  const [projectId, setProjectId] = useState<string>(() =>
    expenseToEdit?.projectId ?? getDefaultProjectId(projects),
  );
  const [amount, setAmount] = useState<number | ''>(expenseToEdit?.amount ?? '');
  const [description, setDescription] = useState<string>(expenseToEdit?.description ?? '');
  const [category, setCategory] = useState<string>(() => {
    if (!expenseToEdit) {
      return ExpenseCategory.MATERIALS;
    }
    return STANDARD_EXPENSE_CATEGORIES.has(expenseToEdit.category)
      ? (expenseToEdit.category as ExpenseCategory)
      : CUSTOM_CATEGORY_VALUE;
  });
  const [customCategory, setCustomCategory] = useState<string>(() => {
    if (!expenseToEdit) {
      return '';
    }
    return STANDARD_EXPENSE_CATEGORIES.has(expenseToEdit.category) ? '' : expenseToEdit.category;
  });
  const [isSaving, setIsSaving] = useState(false);

  const isEditMode = useMemo(() => Boolean(expenseToEdit), [expenseToEdit]);

  useEffect(() => {
    if (expenseToEdit) {
      setProjectId(expenseToEdit.projectId);
      setAmount(expenseToEdit.amount ?? '');
      setDescription(expenseToEdit.description ?? '');

      if (STANDARD_EXPENSE_CATEGORIES.has(expenseToEdit.category)) {
        setCategory(expenseToEdit.category as ExpenseCategory);
        setCustomCategory('');
      } else {
        setCategory(CUSTOM_CATEGORY_VALUE);
        setCustomCategory(expenseToEdit.category);
      }
      return;
    }

    // Reset to defaults when switching back to add mode
    setAmount('');
    setDescription('');
    setCategory(ExpenseCategory.MATERIALS);
    setCustomCategory('');

    setProjectId(currentProjectId => currentProjectId || getDefaultProjectId(projects));
  }, [expenseToEdit, projects]);

  useEffect(() => {
    if (!isEditMode && !projectId && projects.length > 0) {
      setProjectId(projects[0].id);
    }
  }, [isEditMode, projectId, projects]);

  const handleClose = useCallback(() => {
    if (isSaving) {
      return;
    }
    onClose();
  }, [isSaving, onClose]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedDescription = description.trim();
    const resolvedCategory = category === CUSTOM_CATEGORY_VALUE ? customCategory.trim() : category;
    const parsedAmount = typeof amount === 'number' ? amount : Number(amount);

    if (!projectId || !trimmedDescription || !resolvedCategory || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      addToast('Please fill all required fields.', 'error');
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        projectId,
        amount: parsedAmount,
        currency: expenseToEdit?.currency ?? 'GBP',
        description: trimmedDescription,
        category: resolvedCategory,
      };

      if (expenseToEdit) {
        await api.updateExpense(expenseToEdit.id, payload, user.id);
        addToast('Expense updated and resubmitted for approval.', 'success');
      } else {
        await api.submitExpense(payload, user.id);
        addToast('Expense submitted for approval.', 'success');
      }

      onSuccess();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save expense.';
      addToast(message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const categoryOptions = useMemo(() => Object.values(ExpenseCategory), []);

  const formatCategoryLabel = useCallback((value: string) => {
    return value
      .split('_')
      .map(part => (part ? `${part[0]}${part.slice(1).toLowerCase()}` : part))
      .join(' ');
  }, []);

  const resolvedCurrency = expenseToEdit?.currency ?? 'GBP';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={handleClose}>
      <Card className="w-full max-w-lg" onClick={event => event.stopPropagation()}>
        <h3 className="mb-4 text-lg font-bold">{isEditMode ? 'Edit' : 'Submit'} expense</h3>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium" htmlFor="expense-project">
              Project
            </label>
            <select
              id="expense-project"
              value={projectId}
              onChange={event => setProjectId(event.target.value)}
              className="mt-1 w-full rounded border bg-white p-2"
              required
              disabled={projects.length === 0}
            >
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor="expense-amount">
              Amount ({resolvedCurrency})
            </label>
            <input
              id="expense-amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={event => {
                const { value } = event.target;
                setAmount(value === '' ? '' : Number(value));
              }}
              className="mt-1 w-full rounded border p-2"
              placeholder="e.g. 150.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor="expense-description">
              Description
            </label>
            <textarea
              id="expense-description"
              value={description}
              onChange={event => setDescription(event.target.value)}
              rows={3}
              className="mt-1 w-full rounded border p-2"
              placeholder="e.g. Lunch with client, safety vests…"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor="expense-category">
              Category
            </label>
            <select
              id="expense-category"
              value={category}
              onChange={event => setCategory(event.target.value)}
              className="mt-1 w-full rounded border bg-white p-2"
              required
            >
              {categoryOptions.map(option => (
                <option key={option} value={option}>
                  {formatCategoryLabel(option)}
                </option>
              ))}
              <option value={CUSTOM_CATEGORY_VALUE}>Other (custom)…</option>
            </select>
          </div>

          {category === CUSTOM_CATEGORY_VALUE ? (
            <div>
              <label className="block text-sm font-medium" htmlFor="expense-custom-category">
                Custom category name
              </label>
              <input
                id="expense-custom-category"
                type="text"
                value={customCategory}
                onChange={event => setCustomCategory(event.target.value)}
                className="mt-1 w-full rounded border p-2"
                placeholder="e.g. Permits, Software"
                required
              />
            </div>
          ) : null}

          <div className="flex justify-end gap-2 border-t pt-3">
            <Button type="button" variant="secondary" onClick={handleClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving} disabled={projects.length === 0}>
              {isEditMode ? 'Save changes' : 'Submit'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ExpenseModal;
