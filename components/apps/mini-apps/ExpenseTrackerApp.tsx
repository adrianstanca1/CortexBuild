/**
 * Expense Tracker App - Track income and expenses
 */

import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { expenseService } from '../../../lib/services/marketplaceAppsService';

interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: Date;
}

interface ExpenseTrackerAppProps {
    isDarkMode?: boolean;
    currentUser?: any;
}

const ExpenseTrackerApp: React.FC<ExpenseTrackerAppProps> = ({ isDarkMode = true, currentUser }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [category, setCategory] = useState('');

    useEffect(() => {
        loadTransactions();
    }, [currentUser]);

    const loadTransactions = async () => {
        if (!currentUser?.id) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await expenseService.getAll(currentUser.id);
            setTransactions(data.map(t => ({
                id: t.id,
                description: t.description,
                amount: parseFloat(t.amount.toString()),
                type: t.type as 'income' | 'expense',
                category: t.category,
                date: new Date(t.date)
            })));
        } catch (error) {
            console.error('Failed to load transactions:', error);
            toast.error('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    const addTransaction = async () => {
        if (!description.trim() || !amount || !category.trim()) {
            toast.error('Please fill all fields');
            return;
        }

        if (!currentUser?.id) {
            toast.error('Please log in to add transactions');
            return;
        }

        try {
            setSaving(true);
            const newTransaction = await expenseService.create(
                currentUser.id,
                description,
                parseFloat(amount),
                type,
                category
            );

            setTransactions([{
                id: newTransaction.id,
                description: newTransaction.description,
                amount: parseFloat(newTransaction.amount.toString()),
                type: newTransaction.type as 'income' | 'expense',
                category: newTransaction.category,
                date: new Date(newTransaction.date)
            }, ...transactions]);

            setDescription('');
            setAmount('');
            setCategory('');
            toast.success(`${type === 'income' ? 'Income' : 'Expense'} added!`);
        } catch (error) {
            console.error('Failed to add transaction:', error);
            toast.error('Failed to add transaction');
        } finally {
            setSaving(false);
        }
    };

    const deleteTransaction = async (id: string) => {
        try {
            setSaving(true);
            await expenseService.delete(id);
            setTransactions(transactions.filter(t => t.id !== id));
            toast.success('Transaction deleted!');
        } catch (error) {
            console.error('Failed to delete transaction:', error);
            toast.error('Failed to delete transaction');
        } finally {
            setSaving(false);
        }
    };

    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    if (loading) {
        return (
            <div className={`min-h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-8 flex items-center justify-center`}>
                <div className="text-center">
                    <Loader2 className={`h-12 w-12 animate-spin mx-auto mb-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Loading transactions...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-8`}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className={`text-4xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        💰 Expense Tracker
                    </h1>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Track your income and expenses
                    </p>
                </div>

                {/* Balance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-5 w-5" />
                            <span className="text-sm opacity-80">Balance</span>
                        </div>
                        <div className="text-3xl font-bold">${balance.toFixed(2)}</div>
                    </div>

                    <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-5 w-5" />
                            <span className="text-sm opacity-80">Income</span>
                        </div>
                        <div className="text-3xl font-bold">${totalIncome.toFixed(2)}</div>
                    </div>

                    <div className="bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="h-5 w-5" />
                            <span className="text-sm opacity-80">Expenses</span>
                        </div>
                        <div className="text-3xl font-bold">${totalExpense.toFixed(2)}</div>
                    </div>
                </div>

                {/* Add Transaction Form */}
                <div className={`p-6 rounded-2xl border mb-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                    <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Add Transaction
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description"
                            className={`px-4 py-3 rounded-xl border ${isDarkMode
                                ? 'bg-gray-700 text-white border-gray-600'
                                : 'bg-white text-gray-900 border-gray-300'
                                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        />
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Amount"
                            className={`px-4 py-3 rounded-xl border ${isDarkMode
                                ? 'bg-gray-700 text-white border-gray-600'
                                : 'bg-white text-gray-900 border-gray-300'
                                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        />
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="Category"
                            className={`px-4 py-3 rounded-xl border ${isDarkMode
                                ? 'bg-gray-700 text-white border-gray-600'
                                : 'bg-white text-gray-900 border-gray-300'
                                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        />
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as 'income' | 'expense')}
                            className={`px-4 py-3 rounded-xl border ${isDarkMode
                                ? 'bg-gray-700 text-white border-gray-600'
                                : 'bg-white text-gray-900 border-gray-300'
                                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>
                    </div>
                    <button
                        type="button"
                        onClick={addTransaction}
                        disabled={saving}
                        className={`w-full px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${saving
                            ? 'bg-indigo-300 text-white cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                        }`}
                    >
                        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                        {saving ? 'Saving...' : 'Add Transaction'}
                    </button>
                </div>

                {/* Transactions List */}
                <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                    <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Recent Transactions
                    </h3>
                    <div className="space-y-3">
                        {transactions.map(transaction => (
                            <div
                                key={transaction.id}
                                className={`flex items-center justify-between p-4 rounded-xl border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${transaction.type === 'income'
                                        ? 'bg-green-500/20 text-green-500'
                                        : 'bg-red-500/20 text-red-500'
                                        }`}>
                                        {transaction.type === 'income' ? (
                                            <TrendingUp className="h-5 w-5" />
                                        ) : (
                                            <TrendingDown className="h-5 w-5" />
                                        )}
                                    </div>
                                    <div>
                                        <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {transaction.description}
                                        </div>
                                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {transaction.category}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className={`text-xl font-bold ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                                        }`}>
                                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => deleteTransaction(transaction.id)}
                                        className={`p-2 rounded-lg transition-colors ${isDarkMode
                                            ? 'hover:bg-red-500/20 text-red-400'
                                            : 'hover:bg-red-50 text-red-500'
                                            }`}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpenseTrackerApp;
