// components/screens/BulkOperationsScreen.tsx
import React, { useState } from 'react';
import { BulkOperations, BulkItem } from '../bulk/BulkOperations';

interface BulkOperationsScreenProps {
    currentUser: any;
}

export const BulkOperationsScreen: React.FC<BulkOperationsScreenProps> = ({ currentUser }) => {
    const [items, setItems] = useState<BulkItem[]>([
        {
            id: '1',
            type: 'project',
            title: 'Office Building Construction',
            status: 'active',
            priority: 'high',
            assignee: 'John Smith',
            created_at: '2024-01-15',
            updated_at: '2024-01-20'
        },
        {
            id: '2',
            type: 'task',
            title: 'Foundation Inspection',
            status: 'pending',
            priority: 'urgent',
            assignee: 'Sarah Johnson',
            created_at: '2024-01-18',
            updated_at: '2024-01-19'
        },
        {
            id: '3',
            type: 'project',
            title: 'Residential Complex',
            status: 'active',
            priority: 'medium',
            assignee: 'Mike Wilson',
            created_at: '2024-01-10',
            updated_at: '2024-01-18'
        },
        {
            id: '4',
            type: 'task',
            title: 'Safety Training',
            status: 'completed',
            priority: 'low',
            assignee: 'David Chen',
            created_at: '2024-01-05',
            updated_at: '2024-01-12'
        },
        {
            id: '5',
            type: 'project',
            title: 'Shopping Mall Renovation',
            status: 'on-hold',
            priority: 'high',
            assignee: 'Maria Garcia',
            created_at: '2024-01-08',
            updated_at: '2024-01-15'
        }
    ]);

    const handleItemsChange = (newItems: BulkItem[]) => {
        setItems(newItems);
    };

    const handleOperationComplete = (operation: string, affectedItems: number) => {
        console.log(`Operation "${operation}" completed on ${affectedItems} items`);
        // Show success message or notification
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Bulk Operations</h1>
                <p className="text-gray-600">Manage multiple projects and tasks efficiently with bulk operations</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <BulkOperations
                    items={items}
                    onItemsChange={handleItemsChange}
                    onOperationComplete={handleOperationComplete}
                />
            </div>
        </div>
    );
};
