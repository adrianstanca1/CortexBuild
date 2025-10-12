import React from 'react';
// Fix: Corrected import paths to include file extensions.
import { ActivityEvent, Screen } from '../../types';
// Fix: Corrected import paths to include file extensions.
// Fix: Corrected the import path for the 'api' module.
import * as api from '../../api';
// Fix: Added ClipboardDocumentListIcon for 'log_submitted' and removed unused QuestionMarkCircleIcon.
import { CheckBadgeIcon, CameraIcon, ChatBubbleBottomCenterTextIcon, ClipboardDocumentListIcon } from '../Icons';

interface RecentActivityWidgetProps {
    activities: ActivityEvent[];
    onDeepLink: (projectId: string, screen: Screen, params: any) => void;
}

const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({ activities, onDeepLink }) => {
    const ICONS: Record<ActivityEvent['type'], React.FC<any>> = {
        comment: ChatBubbleBottomCenterTextIcon,
        photo: CameraIcon,
        status_change: CheckBadgeIcon,
        // Fix: Added 'log_submitted' to the ICONS record to match the ActivityEvent type.
        log_submitted: ClipboardDocumentListIcon,
    };
    
    const COLORS: Record<ActivityEvent['type'], string> = {
        comment: 'text-blue-600',
        photo: 'text-purple-600',
        status_change: 'text-green-600',
        // Fix: Added 'log_submitted' to the COLORS record to match the ActivityEvent type.
        log_submitted: 'text-gray-600',
    };

    const ICON_BG_COLORS: Record<ActivityEvent['type'], string> = {
        comment: 'bg-blue-100',
        photo: 'bg-purple-100',
        status_change: 'bg-green-100',
        // Fix: Added 'log_submitted' to the ICON_BG_COLORS record to match the ActivityEvent type.
        log_submitted: 'bg-gray-100',
    };


    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 h-full flex flex-col">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-gray-500" />
                Recent Project Activity
            </h2>
            {activities.length === 0 ? (
                <p className="text-gray-500 flex-grow flex items-center justify-center">No recent activity.</p>
            ) : (
                <ul className="space-y-2">
                    {activities.slice(0, 5).map(activity => {
                        const Icon = ICONS[activity.type];
                        return (
                            <li 
                                key={activity.id} 
                                onClick={() => onDeepLink(activity.projectId, activity.link.screen, activity.link.params)}
                                className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${ICON_BG_COLORS[activity.type]}`}>
                                    <Icon className={`w-6 h-6 ${COLORS[activity.type]}`} />
                                </div>
                                <div className="text-sm">
                                     <p className="text-gray-800">
                                        <span className="font-bold">{activity.author}</span> {activity.description}
                                     </p>
                                     <p className="text-xs text-gray-500 mt-0.5">
                                        in <span className="font-semibold">{activity.projectName}</span> &middot; {new Date(activity.timestamp).toLocaleDateString()}
                                     </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default RecentActivityWidget;