import React from 'react';
// Fix: Added .ts extension to import
import { Screen, User } from '../../types';
// Fix: Added .tsx extension to import
import { 
    PlusIcon, DocumentPlusIcon, CheckBadgeIcon, CameraIcon, ClipboardDocumentListIcon, WandSparklesIcon, TicketIcon
} from '../Icons';

interface QuickActionsWidgetProps {
    onQuickAction: (action: Screen, projectId?: string) => void;
    onSuggestAction: () => void;
    isGlobal: boolean;
    currentUser: User;
}

const ActionButton: React.FC<{ label: string; icon: React.FC<any>; onClick: () => void; isFeatured?: boolean }> = ({ label, icon: Icon, onClick, isFeatured }) => {
    if (isFeatured) {
        return (
            <button onClick={onClick} className="flex flex-col items-center justify-center gap-2 p-4 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-transform hover:-translate-y-1 w-full text-center">
                <Icon className="w-8 h-8" />
                <span className="text-sm font-bold">{label}</span>
            </button>
        )
    }
    return (
        <button onClick={onClick} className="flex items-center justify-center gap-3 p-3 bg-white text-gray-700 rounded-lg shadow-md border border-gray-100 hover:bg-gray-50 hover:border-blue-300 transition-all w-full text-left">
            <Icon className="w-6 h-6 text-blue-600" />
            <span className="font-semibold text-sm">{label}</span>
        </button>
    );
};

const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({ onQuickAction, onSuggestAction, isGlobal, currentUser }) => {
    
    let actions = [
        { label: 'New Task', screen: 'new-task', icon: PlusIcon, roles: ['company_admin', 'supervisor', 'super_admin'] },
        { label: 'New RFI', screen: 'new-rfi', icon: DocumentPlusIcon, roles: ['company_admin', 'supervisor', 'super_admin'] },
        { label: 'New Punch Item', screen: 'new-punch-list-item', icon: CheckBadgeIcon, roles: ['company_admin', 'supervisor', 'super_admin'] },
        { label: 'Daily Log', screen: 'daily-log', icon: ClipboardDocumentListIcon, roles: ['company_admin', 'supervisor', 'operative', 'super_admin'] },
        { label: 'Daywork Sheet', screen: 'new-daywork-sheet', icon: TicketIcon, roles: ['company_admin', 'supervisor', 'super_admin'] },
        { label: 'Add Photo', screen: 'photos', icon: CameraIcon, roles: ['company_admin', 'supervisor', 'operative', 'super_admin'] },
    ];

    const userActions = actions.filter(action => action.roles.includes(currentUser.role));

    return (
        <div className="bg-slate-50 p-6 rounded-lg shadow-inner border">
             <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {userActions.map(action => (
                    <ActionButton 
                        key={action.screen}
                        label={action.label}
                        icon={action.icon}
                        onClick={() => onQuickAction(action.screen as Screen)}
                    />
                ))}
                { isGlobal &&
                    <ActionButton 
                        label="Suggest Action"
                        icon={WandSparklesIcon}
                        onClick={onSuggestAction}
                        isFeatured={true}
                    />
                }
             </div>
        </div>
    );
};

export default QuickActionsWidget;