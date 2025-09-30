import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { api } from '../../services/mockApi';
import { Invoice, User } from '../../types';
import { formatCurrency } from '../../utils/finance';

interface PaymentModalProps {
  invoice: Invoice;
  balance: number;
  onClose: () => void;
  onSuccess: () => void;
  user: User;
  addToast: (message: string, type: 'success' | 'error') => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ invoice, balance, onClose, onSuccess, user, addToast }) => {
  const [amount, setAmount] = useState<number | ''>(balance > 0 ? balance : '');
  const [method, setMethod] = useState<'CREDIT_CARD' | 'BANK_TRANSFER' | 'CASH'>('BANK_TRANSFER');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (!amount || amount <= 0) {
      addToast('Invalid amount', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await api.recordPaymentForInvoice(invoice.id, { amount: Number(amount), method }, user.id);
      addToast('Payment recorded.', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      addToast('Failed to record payment.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-md" onClick={event => event.stopPropagation()}>
        <h3 className="text-lg font-bold">Record Payment for {invoice.invoiceNumber}</h3>
        <p className="text-sm text-muted-foreground mb-4">Current balance: {formatCurrency(balance)}</p>
        <input
          type="number"
          value={amount}
          onChange={event => setAmount(event.target.value === '' ? '' : Number(event.target.value))}
          placeholder={`Enter amount (up to ${balance.toFixed(2)})`}
          className="w-full p-2 border rounded mt-4"
        />
        <select
          value={method}
          onChange={event => setMethod(event.target.value as 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CASH')}
          className="w-full p-2 border rounded mt-2 bg-white"
        >
          <option value="BANK_TRANSFER">Bank Transfer</option>
          <option value="CREDIT_CARD">Card</option>
          <option value="CASH">Cash</option>
        </select>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isSaving}>
            Record Payment
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PaymentModal;
