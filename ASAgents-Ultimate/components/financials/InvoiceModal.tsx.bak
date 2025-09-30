import React, { useMemo, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { api } from '../../services/mockApi';
import { Client, Invoice, InvoiceLineItem, InvoiceStatus, Project, User } from '../../types';
import { formatCurrency } from '../../utils/finance';

interface InvoiceModalProps {
    invoiceToEdit?: Invoice | null;
    isReadOnly?: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user: User;
    clients: Client[];
    projects: Project[];
    addToast: (message: string, type: 'success' | 'error') => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({
    invoiceToEdit,
    isReadOnly = false,
    onClose,
    onSuccess,
    user,
    clients,
    projects,
    addToast,
}) => {
    const [clientId, setClientId] = useState<string>(invoiceToEdit?.clientId.toString() || '');
    const [projectId, setProjectId] = useState<string>(invoiceToEdit?.projectId.toString() || '');
    const [issuedAt, setIssuedAt] = useState(new Date(invoiceToEdit?.issuedAt || new Date()).toISOString().split('T')[0]);
    const [dueAt, setDueAt] = useState(
        new Date(invoiceToEdit?.dueAt || Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
    const [lineItems, setLineItems] = useState<Partial<InvoiceLineItem>[]>(
        invoiceToEdit?.lineItems || [{ id: `new-${Date.now()}`, description: '', quantity: 1, unitPrice: 0 }]
    );
    const [taxRate, setTaxRate] = useState<number | ''>(invoiceToEdit ? invoiceToEdit.taxRate * 100 : 20);
    const [retentionRate, setRetentionRate] = useState<number | ''>(invoiceToEdit ? invoiceToEdit.retentionRate * 100 : 5);
    const [notes, setNotes] = useState(invoiceToEdit?.notes || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleLineItemChange = (
        index: number,
        field: keyof Omit<InvoiceLineItem, 'id' | 'amount' | 'rate'>,
        value: string | number
    ) => {
        const newItems = [...lineItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setLineItems(newItems);
    };

    const addLineItem = () =>
        setLineItems([...lineItems, { id: `new-${Date.now()}`, description: '', quantity: 1, unitPrice: 0 }]);
    const removeLineItem = (index: number) => setLineItems(lineItems.filter((_, i) => i !== index));

    const { subtotal, taxAmount, retentionAmount, total } = useMemo(() => {
        const subtotalCalc = lineItems.reduce(
            (acc, item) => acc + Number(item.quantity) * Number(item.unitPrice),
            0
        );
        const taxAmountCalc = subtotalCalc * (Number(taxRate) / 100);
        const retentionAmountCalc = subtotalCalc * (Number(retentionRate) / 100);
        const totalCalc = subtotalCalc + taxAmountCalc - retentionAmountCalc;
        return { subtotal: subtotalCalc, taxAmount: taxAmountCalc, retentionAmount: retentionAmountCalc, total: totalCalc };
    }, [lineItems, taxRate, retentionRate]);

    const amountPaid = invoiceToEdit?.amountPaid || 0;
    const balance = total - amountPaid;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const finalLineItems = lineItems
                .filter(li => li.description && li.quantity! > 0 && li.unitPrice! > 0)
                .map(li => ({
                    id: li.id!.toString().startsWith('new-') ? String(Date.now() + Math.random()) : li.id!,
                    description: li.description!,
                    quantity: Number(li.quantity),
                    unitPrice: Number(li.unitPrice),
                    amount: Number(li.quantity) * Number(li.unitPrice),
                }));

            const invoiceData = {
                clientId: clientId,
                projectId: projectId,
                issuedAt: new Date(issuedAt).toISOString(),
                dueAt: new Date(dueAt).toISOString(),
                lineItems: finalLineItems,
                taxRate: Number(taxRate) / 100,
                retentionRate: Number(retentionRate) / 100,
                notes,
                subtotal,
                taxAmount,
                retentionAmount,
                total,
                amountPaid,
                balance,
                payments: invoiceToEdit?.payments || [],
                status: invoiceToEdit?.status || InvoiceStatus.DRAFT,
                invoiceNumber: invoiceToEdit?.invoiceNumber || `INV-${Math.floor(Math.random() * 9000) + 1000}`,
            };
            if (invoiceToEdit) {
                await api.updateInvoice(invoiceToEdit.id, invoiceData, user.id);
                addToast('Invoice updated.', 'success');
            } else {
                await api.createInvoice(invoiceData, user.id);
                addToast('Invoice created as draft.', 'success');
            }
            onSuccess();
            onClose();
        } catch (error) {
            addToast('Failed to save invoice.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">
                    {invoiceToEdit
                        ? `${isReadOnly ? 'View' : 'Edit'} Invoice ${invoiceToEdit.invoiceNumber}`
                        : 'Create Invoice'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2 flex-grow">
                    <div className="grid grid-cols-2 gap-4">
                        <select
                            value={clientId}
                            onChange={e => setClientId(e.target.value)}
                            className="w-full p-2 border rounded bg-white dark:bg-slate-800"
                            required
                            disabled={isReadOnly}
                        >
                            <option value="">Select Client</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>
                                    {client.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={projectId}
                            onChange={e => setProjectId(e.target.value)}
                            className="w-full p-2 border rounded bg-white dark:bg-slate-800"
                            required
                            disabled={isReadOnly}
                        >
                            <option value="">Select Project</option>
                            {projects.map(project => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                        <div>
                            <label className="text-xs">Issued Date</label>
                            <input
                                type="date"
                                value={issuedAt}
                                onChange={e => setIssuedAt(e.target.value)}
                                className="w-full p-2 border rounded"
                                disabled={isReadOnly}
                            />
                        </div>
                        <div>
                            <label className="text-xs">Due Date</label>
                            <input
                                type="date"
                                value={dueAt}
                                onChange={e => setDueAt(e.target.value)}
                                className="w-full p-2 border rounded"
                                disabled={isReadOnly}
                            />
                        </div>
                    </div>
                    <div className="border-t pt-2">
                        <h4 className="font-semibold">Line Items</h4>
                        <div className="grid grid-cols-[1fr,90px,130px,130px,40px] gap-2 items-center mt-1 text-xs text-muted-foreground">
                            <span>Description</span>
                            <span className="text-right">Quantity</span>
                            <span className="text-right">Unit Price</span>
                            <span className="text-right">Amount</span>
                        </div>
                        {lineItems.map((item, index) => (
                            <div
                                key={item.id}
                                className="grid grid-cols-[1fr,90px,130px,130px,40px] gap-2 items-center mt-2"
                            >
                                <input
                                    type="text"
                                    value={item.description}
                                    onChange={e => handleLineItemChange(index, 'description', e.target.value)}
                                    placeholder="Item or service description"
                                    className="p-1 border rounded"
                                    disabled={isReadOnly}
                                />
                                <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={e => handleLineItemChange(index, 'quantity', Number(e.target.value))}
                                    placeholder="1"
                                    className="p-1 border rounded text-right"
                                    disabled={isReadOnly}
                                />
                                <input
                                    type="number"
                                    value={item.unitPrice}
                                    onChange={e => handleLineItemChange(index, 'unitPrice', Number(e.target.value))}
                                    placeholder="0.00"
                                    className="p-1 border rounded text-right"
                                    disabled={isReadOnly}
                                />
                                <span className="p-1 text-right font-medium">
                                    {formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}
                                </span>
                                {!isReadOnly && (
                                    <Button type="button" variant="danger" size="sm" onClick={() => removeLineItem(index)}>
                                        &times;
                                    </Button>
                                )}
                            </div>
                        ))}
                        {!isReadOnly && (
                            <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={addLineItem}>
                                + Add Item
                            </Button>
                        )}
                    </div>
                    <div className="border-t pt-4 grid grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-semibold mb-2">Notes</h4>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Payment details, terms and conditions..."
                                rows={6}
                                className="p-2 border rounded w-full"
                                disabled={isReadOnly}
                            />
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold mb-2">Totals</h4>
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Subtotal:</span>
                                <span className="font-medium">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <label htmlFor="taxRate" className="text-sm">
                                    Tax (%):
                                </label>
                                <input
                                    id="taxRate"
                                    type="number"
                                    value={taxRate}
                                    onChange={e =>
                                        setTaxRate(e.target.value === '' ? '' : Number(e.target.value))
                                    }
                                    className="w-24 p-1 border rounded text-right"
                                    disabled={isReadOnly}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Tax Amount:</span>
                                <span>{formatCurrency(taxAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <label htmlFor="retentionRate" className="text-sm">
                                    Retention (%):
                                </label>
                                <input
                                    id="retentionRate"
                                    type="number"
                                    value={retentionRate}
                                    onChange={e =>
                                        setRetentionRate(e.target.value === '' ? '' : Number(e.target.value))
                                    }
                                    className="w-24 p-1 border rounded text-right"
                                    disabled={isReadOnly}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-red-600">Retention Held:</span>
                                <span className="text-red-600 font-medium">-{formatCurrency(retentionAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center font-bold text-lg pt-2 border-t">
                                <span>Total Due:</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                            {invoiceToEdit && (
                                <>
                                    <div className="flex justify-between items-center text-sm">
                                        <span>Amount Paid:</span>
                                        <span>-{formatCurrency(amountPaid)}</span>
                                    </div>
                                    <div className="flex justify-between items-center font-bold text-lg text-green-600">
                                        <span>Balance:</span>
                                        <span>{formatCurrency(balance)}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </form>
                <div className="flex justify-end gap-2 pt-4 border-t mt-4 flex-shrink-0">
                    <Button variant="secondary" onClick={onClose}>
                        {isReadOnly ? 'Close' : 'Cancel'}
                    </Button>
                    {!isReadOnly && (
                        <Button type="submit" isLoading={isSaving} onClick={handleSubmit}>
                            Save Invoice
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default InvoiceModal;
