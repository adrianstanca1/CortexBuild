// components/bulk/BulkOperations.tsx
import React, { useState } from 'react';
import {
    CheckSquare,
    Square,
    Trash2,
    Edit,
    Archive,
    Download,
    Upload,
    Copy,
    Move,
    Tag,
    User,
    Calendar,
    AlertTriangle
} from 'lucide-react';

export interface BulkItem {
    id: string;
    type: 'project' | 'task' | 'user' | 'document';
    title: string;
    status: string;
    priority: string;
    assignee?: string;
    created_at: string;
    updated_at: string;
}

export interface BulkOperation {
    id: string;
    name: string;
    icon: React.ReactNode;
    description: string;
    action: (items: BulkItem[]) => Promise<void>;
    requiresConfirmation?: boolean;
    confirmationMessage?: string;
}

interface BulkOperationsProps {
    items: BulkItem[];
    onItemsChange: (items: BulkItem[]) => void;
    onOperationComplete: (operation: string, affectedItems: number) => void;
    className?: string;
}

export const BulkOperations: React.FC<BulkOperationsProps> = ({
    items,
    onItemsChange,
    onOperationComplete,
    className = ""
}) => {
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [isProcessing, setIsProcessing] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState<{
        operation: BulkOperation;
        items: BulkItem[];
    } | null>(null);

    const allSelected = selectedItems.size === items.length && items.length > 0;
    const someSelected = selectedItems.size > 0 && selectedItems.size < items.length;

    const handleSelectAll = () => {
        if (allSelected) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(items.map(item => item.id)));
        }
    };

    const handleSelectItem = (itemId: string) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(itemId)) {
            newSelected.delete(itemId);
        } else {
            newSelected.add(itemId);
        }
        setSelectedItems(newSelected);
    };

    const getSelectedItems = (): BulkItem[] => {
        return items.filter(item => selectedItems.has(item.id));
    };

    const bulkOperations: BulkOperation[] = [
        {
            id: 'delete',
            name: 'Delete',
            icon: <Trash2 className="w-4 h-4" />,
            description: 'Permanently delete selected items',
            requiresConfirmation: true,
            confirmationMessage: 'Are you sure you want to permanently delete these items? This action cannot be undone.',
            action: async (items) => {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                const remainingItems = items.filter(item => !selectedItems.has(item.id));
                onItemsChange(remainingItems);
                setSelectedItems(new Set());
            }
        },
        {
            id: 'archive',
            name: 'Archive',
            icon: <Archive className="w-4 h-4" />,
            description: 'Archive selected items',
            action: async (items) => {
                await new Promise(resolve => setTimeout(resolve, 800));
                const updatedItems = items.map(item =>
                    selectedItems.has(item.id)
                        ? { ...item, status: 'archived', updated_at: new Date().toISOString() }
                        : item
                );
                onItemsChange(updatedItems);
                setSelectedItems(new Set());
            }
        },
        {
            id: 'change_status',
            name: 'Change Status',
            icon: <Edit className="w-4 h-4" />,
            description: 'Update status of selected items',
            action: async (items) => {
                // This would open a modal to select new status
                await new Promise(resolve => setTimeout(resolve, 600));
                const updatedItems = items.map(item =>
                    selectedItems.has(item.id)
                        ? { ...item, status: 'updated', updated_at: new Date().toISOString() }
                        : item
                );
                onItemsChange(updatedItems);
                setSelectedItems(new Set());
            }
        },
        {
            id: 'assign',
            name: 'Assign',
            icon: <User className="w-4 h-4" />,
            description: 'Assign selected items to a user',
            action: async (items) => {
                await new Promise(resolve => setTimeout(resolve, 700));
                const updatedItems = items.map(item =>
                    selectedItems.has(item.id)
                        ? { ...item, assignee: 'New Assignee', updated_at: new Date().toISOString() }
                        : item
                );
                onItemsChange(updatedItems);
                setSelectedItems(new Set());
            }
        },
        {
            id: 'add_tags',
            name: 'Add Tags',
            icon: <Tag className="w-4 h-4" />,
            description: 'Add tags to selected items',
            action: async (items) => {
                await new Promise(resolve => setTimeout(resolve, 500));
                // Tags would be added through a modal
                setSelectedItems(new Set());
            }
        },
        {
            id: 'duplicate',
            name: 'Duplicate',
            icon: <Copy className="w-4 h-4" />,
            description: 'Create copies of selected items',
            action: async (items) => {
                await new Promise(resolve => setTimeout(resolve, 1000));
                const duplicatedItems = items
                    .filter(item => selectedItems.has(item.id))
                    .map(item => ({
                        ...item,
                        id: `${item.id}-copy-${Date.now()}`,
                        title: `${item.title} (Copy)`,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }));
                onItemsChange([...items, ...duplicatedItems]);
                setSelectedItems(new Set());
            }
        },
        {
            id: 'export',
            name: 'Export',
            icon: <Download className="w-4 h-4" />,
            description: 'Export selected items to CSV/Excel',
            action: async (items) => {
                await new Promise(resolve => setTimeout(resolve, 800));
                // Export logic would be implemented here
                setSelectedItems(new Set());
            }
        },
        {
            id: 'move',
            name: 'Move',
            icon: <Move className="w-4 h-4" />,
            description: 'Move selected items to another project',
            action: async (items) => {
                await new Promise(resolve => setTimeout(resolve, 600));
                // Move logic would be implemented here
                setSelectedItems(new Set());
            }
        }
    ];

    const handleOperation = async (operation: BulkOperation) => {
        const selectedItemsList = getSelectedItems();

        if (operation.requiresConfirmation) {
            setShowConfirmDialog({ operation, items: selectedItemsList });
            return;
        }

        setIsProcessing(true);
        try {
            await operation.action(items);
            onOperationComplete(operation.name, selectedItemsList.length);
        } catch (error) {
            console.error(`Error performing ${operation.name}:`, error);
        } finally {
            setIsProcessing(false);
        }
    };

    const confirmOperation = async () => {
        if (!showConfirmDialog) return;

        setIsProcessing(true);
        try {
            await showConfirmDialog.operation.action(items);
            onOperationComplete(showConfirmDialog.operation.name, showConfirmDialog.items.length);
        } catch (error) {
            console.error(`Error performing ${showConfirmDialog.operation.name}:`, error);
        } finally {
            setIsProcessing(false);
            setShowConfirmDialog(null);
        }
    };

    const getItemIcon = (type: BulkItem['type']) => {
        switch (type) {
            case 'project': return '🏗️';
            case 'task': return '✅';
            case 'user': return '👤';
            case 'document': return '📄';
            default: return '📁';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-blue-600 bg-blue-50';
            case 'completed': return 'text-green-600 bg-green-50';
            case 'pending': return 'text-yellow-600 bg-yellow-50';
            case 'cancelled': return 'text-red-600 bg-red-50';
            case 'archived': return 'text-gray-600 bg-gray-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'text-red-600 bg-red-50';
            case 'high': return 'text-orange-600 bg-orange-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'low': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className={`bulk-operations ${className}`}>
            {/* Header with Selection Controls */}
            <div className="bg-white border-b border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleSelectAll}
                            className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
                        >
                            {allSelected ? (
                                <CheckSquare className="w-5 h-5 text-blue-600" />
                            ) : someSelected ? (
                                <div className="w-5 h-5 border-2 border-blue-600 bg-blue-100 rounded flex items-center justify-center">
                                    <div className="w-2 h-2 bg-blue-600 rounded"></div>
                                </div>
                            ) : (
                                <Square className="w-5 h-5 text-gray-400" />
                            )}
                            <span>
                                {allSelected ? 'Deselect All' : 'Select All'}
                                {selectedItems.size > 0 && ` (${selectedItems.size} selected)`}
                            </span>
                        </button>
                    </div>

                    {/* Bulk Operations */}
                    {selectedItems.size > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                                {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                            </span>
                            <div className="flex gap-1">
                                {bulkOperations.map(operation => (
                                    <button
                                        key={operation.id}
                                        onClick={() => handleOperation(operation)}
                                        disabled={isProcessing}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={operation.description}
                                    >
                                        {operation.icon}
                                        {operation.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Items List */}
            <div className="divide-y divide-gray-200">
                {items.map(item => (
                    <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                    >
                        <button
                            onClick={() => handleSelectItem(item.id)}
                            className="flex-shrink-0"
                        >
                            {selectedItems.has(item.id) ? (
                                <CheckSquare className="w-5 h-5 text-blue-600" />
                            ) : (
                                <Square className="w-5 h-5 text-gray-400" />
                            )}
                        </button>

                        <span className="text-lg flex-shrink-0">{getItemIcon(item.type)}</span>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                    {item.title}
                                </h4>
                                <div className="flex items-center gap-1">
                                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                                        {item.status}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(item.priority)}`}>
                                        {item.priority}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                {item.assignee && (
                                    <span className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        {item.assignee}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(item.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Confirm {showConfirmDialog.operation.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {showConfirmDialog.operation.confirmationMessage}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <p className="text-sm text-gray-700 mb-2">
                                    This will affect {showConfirmDialog.items.length} item{showConfirmDialog.items.length !== 1 ? 's' : ''}:
                                </p>
                                <div className="max-h-32 overflow-y-auto space-y-1">
                                    {showConfirmDialog.items.map(item => (
                                        <div key={item.id} className="text-sm text-gray-600 flex items-center gap-2">
                                            <span>{getItemIcon(item.type)}</span>
                                            <span className="truncate">{item.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowConfirmDialog(null)}
                                    disabled={isProcessing}
                                    className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmOperation}
                                    disabled={isProcessing}
                                    className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isProcessing && (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    )}
                                    {isProcessing ? 'Processing...' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
